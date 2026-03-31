const https = require('https');
const SeoPingLog = require('../models/SeoPingLog');

const DEFAULT_MAX_RETRIES = Math.min(Math.max(parseInt(process.env.SEO_PING_MAX_RETRIES || '4', 10), 1), 10);
const DEFAULT_RETRY_BASE_MS = Math.max(parseInt(process.env.SEO_PING_RETRY_BASE_MS || String(5 * 60 * 1000), 10), 60 * 1000);

let retryWorkerRunning = false;

function pingUrl(targetUrl) {
  return new Promise((resolve) => {
    const req = https.get(targetUrl, (res) => {
      const chunks = [];
      res.on('data', (chunk) => chunks.push(chunk));
      res.on('end', () => {
        resolve({
          url: targetUrl,
          statusCode: res.statusCode,
          ok: res.statusCode >= 200 && res.statusCode < 300,
          body: Buffer.concat(chunks).toString('utf8').slice(0, 400)
        });
      });
    });

    req.on('error', (error) => {
      resolve({
        url: targetUrl,
        ok: false,
        statusCode: 0,
        error: error.message
      });
    });

    req.setTimeout(12000, () => {
      req.destroy(new Error('Request timeout'));
    });
  });
}

function buildSitemapTargets(sitemapUrl) {
  // Legacy sitemap ping endpoints are deprecated by major engines.
  // Keep this behind an opt-in flag for compatibility experiments only.
  if (process.env.SEO_ENABLE_LEGACY_PING !== 'true') {
    return [];
  }

  return [`https://www.bing.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`];
}

function getNextRetryAt(attemptNumber) {
  const delay = Math.min(DEFAULT_RETRY_BASE_MS * Math.pow(2, Math.max(0, attemptNumber - 1)), 2 * 60 * 60 * 1000);
  return new Date(Date.now() + delay);
}

function getLastErrorFromResults(results) {
  const failed = (results || []).filter((item) => !item.ok);
  if (!failed.length) return '';
  return failed
    .map((item) => `${item.url}: ${item.error || `HTTP ${item.statusCode || 0}`}`)
    .join(' | ')
    .slice(0, 600);
}

async function pingSitemapUrl(sitemapUrl) {
  const targets = buildSitemapTargets(sitemapUrl);

  if (!targets.length) {
    return {
      results: [],
      successCount: 0,
      totalTargets: 0,
      fullySuccessful: true
    };
  }

  const results = await Promise.all(targets.map((target) => pingUrl(target)));
  const successCount = results.filter((item) => item.ok).length;
  return {
    results,
    successCount,
    totalTargets: targets.length,
    fullySuccessful: successCount === targets.length
  };
}

async function pingSitemapByBaseUrl(frontendBase, options = {}) {
  const normalizedBase = String(frontendBase || '').replace(/\/$/, '');
  const sitemapUrl = `${normalizedBase}/sitemap.xml`;
  const attemptNumber = Math.max(parseInt(options.attemptCount || '1', 10), 1);
  const maxRetries = Math.min(Math.max(parseInt(options.maxRetries || String(DEFAULT_MAX_RETRIES), 10), 1), 10);
  const { results, successCount, totalTargets, fullySuccessful } = await pingSitemapUrl(sitemapUrl);
  const shouldQueueRetry = !fullySuccessful && attemptNumber < maxRetries;
  const retryStatus = fullySuccessful ? 'completed' : (shouldQueueRetry ? 'queued' : 'exhausted');

  try {
    await SeoPingLog.create({
      sitemapUrl,
      triggerType: options.triggerType || 'manual',
      reason: options.reason || '',
      success: successCount > 0,
      successCount,
      totalTargets,
      results,
      retryStatus,
      attemptCount: attemptNumber,
      maxRetries,
      nextRetryAt: shouldQueueRetry ? getNextRetryAt(attemptNumber) : null,
      lastError: getLastErrorFromResults(results),
      attemptHistory: [
        {
          attemptNumber,
          at: new Date(),
          successCount,
          retryStatus,
          results: results.map((item) => ({
            url: item.url,
            statusCode: item.statusCode,
            ok: item.ok,
            error: item.error || ''
          }))
        }
      ]
    });
  } catch (error) {
    console.error('SEO ping log save error:', error);
  }

  return {
    sitemapUrl,
    results,
    success: fullySuccessful || successCount > 0,
    successCount,
    totalTargets
  };
}

exports.pingSitemapByBaseUrl = pingSitemapByBaseUrl;

exports.getSitemapPingHistory = async (req, res) => {
  try {
    const limit = Math.min(Math.max(parseInt(req.query.limit || '20', 10), 1), 100);
    const [logs, queuedCount, exhaustedCount] = await Promise.all([
      SeoPingLog.find({})
        .sort({ createdAt: -1 })
        .limit(limit)
        .lean(),
      SeoPingLog.countDocuments({ retryStatus: 'queued' }),
      SeoPingLog.countDocuments({ retryStatus: 'exhausted' })
    ]);

    const normalizedLogs = logs.map((log) => {
      const computedTargets = typeof log.totalTargets === 'number'
        ? log.totalTargets
        : (Array.isArray(log.results) ? log.results.length : 0);

      const totalTargets = Math.max(0, computedTargets);
      return {
        ...log,
        totalTargets,
        modernMode: totalTargets === 0
      };
    });

    return res.status(200).json({
      success: true,
      count: normalizedLogs.length,
      queuedCount,
      exhaustedCount,
      logs: normalizedLogs
    });
  } catch (error) {
    console.error('Get sitemap ping history error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch sitemap ping history'
    });
  }
};

async function processQueuedSeoPings(limit = 5) {
  if (retryWorkerRunning) {
    return { processed: 0, message: 'Retry worker already running' };
  }

  retryWorkerRunning = true;
  try {
    const now = new Date();
    const logs = await SeoPingLog.find({
      retryStatus: 'queued',
      nextRetryAt: { $lte: now }
    })
      .sort({ nextRetryAt: 1 })
      .limit(Math.max(1, limit));

    let processed = 0;
    for (const log of logs) {
      const { results, successCount, totalTargets, fullySuccessful } = await pingSitemapUrl(log.sitemapUrl);
      const nextAttempt = (log.attemptCount || 1) + 1;
      const canRetryAgain = !fullySuccessful && nextAttempt <= (log.maxRetries || DEFAULT_MAX_RETRIES);
      const retryStatus = fullySuccessful ? 'completed' : (canRetryAgain ? 'queued' : 'exhausted');

      log.results = results;
      log.successCount = successCount;
      log.totalTargets = totalTargets;
      log.success = successCount > 0;
      log.attemptCount = nextAttempt;
      log.retryStatus = retryStatus;
      log.nextRetryAt = canRetryAgain ? getNextRetryAt(nextAttempt) : null;
      log.lastError = getLastErrorFromResults(results);
      log.attemptHistory.push({
        attemptNumber: nextAttempt,
        at: new Date(),
        successCount,
        retryStatus,
        results: results.map((item) => ({
          url: item.url,
          statusCode: item.statusCode,
          ok: item.ok,
          error: item.error || ''
        }))
      });

      await log.save();
      processed += 1;
    }

    return { processed, message: 'Queued SEO pings processed' };
  } catch (error) {
    console.error('SEO retry queue processing error:', error);
    return { processed: 0, message: 'Retry processing failed', error: error.message };
  } finally {
    retryWorkerRunning = false;
  }
}

exports.processQueuedSeoPings = processQueuedSeoPings;

exports.retryFailedSitemapPings = async (req, res) => {
  try {
    const limit = Math.min(Math.max(parseInt(req.body?.limit || req.query?.limit || '10', 10), 1), 50);
    const result = await processQueuedSeoPings(limit);

    return res.status(200).json({
      success: true,
      ...result
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to run retry queue',
      error: error.message
    });
  }
};

exports.pingSitemap = async (req, res) => {
  try {
    const frontendBase = (process.env.FRONTEND_URL || `${req.protocol}://${req.get('host')}`).replace(/\/$/, '');
    const { sitemapUrl, results, successCount, totalTargets } = await pingSitemapByBaseUrl(frontendBase, {
      triggerType: 'manual',
      reason: 'admin_manual_trigger'
    });

    const noExternalTargets = totalTargets === 0;

    return res.status(200).json({
      success: noExternalTargets ? true : successCount > 0,
      sitemapUrl,
      message: noExternalTargets
        ? 'No external sitemap ping targets configured (modern SEO mode).'
        : (successCount > 0
          ? 'Sitemap pinged successfully for one or more supported search engines'
          : 'Sitemap ping failed for all targets'),
      totalTargets,
      results,
      note: noExternalTargets
        ? 'Google and Bing legacy sitemap ping endpoints are deprecated/unstable. Submit sitemap in Google Search Console and Bing Webmaster Tools. You can enable legacy ping with SEO_ENABLE_LEGACY_PING=true.'
        : 'Legacy ping mode enabled. Prefer Search Console and Bing Webmaster submissions for reliable indexing.'
    });
  } catch (error) {
    console.error('Sitemap ping error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to ping sitemap',
      error: error.message
    });
  }
};
