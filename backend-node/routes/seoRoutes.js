const express = require('express');
const Blog = require('../models/Blog');

const router = express.Router();

const PUBLIC_SITE_PATHS = [
  '/',
  '/about',
  '/blog',
  '/programs',
  '/mentorship',
  '/transparency',
  '/support',
  '/contact'
];

function getSiteBase(req) {
  return (process.env.FRONTEND_URL || `${req.protocol}://${req.get('host')}`).replace(/\/$/, '');
}

function escapeXml(value = '') {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

router.get('/robots.txt', (req, res) => {
  const siteBase = getSiteBase(req);
  const isProd = process.env.NODE_ENV === 'production';
  const robots = [
    'User-agent: *',
    ...(isProd ? ['Allow: /'] : ['Disallow: /']),
    'Disallow: /admin/',
    'Disallow: /api/',
    '',
    `Sitemap: ${siteBase}/sitemap.xml`
  ].join('\n');

  res.set('Content-Type', 'text/plain');
  res.set('Cache-Control', 'public, max-age=3600');
  return res.status(200).send(robots);
});

router.get('/sitemap.xml', async (req, res) => {
  try {
    const blogs = await Blog.find({ status: 'published' })
      .select('slug updatedAt createdAt')
      .sort({ updatedAt: -1 });

    const siteBase = getSiteBase(req);
    const nowIso = new Date().toISOString();

    const staticUrls = PUBLIC_SITE_PATHS.map((pathValue) => ({
      loc: `${siteBase}${pathValue === '/' ? '/' : pathValue}`,
      lastmod: nowIso,
      changefreq: pathValue === '/' ? 'weekly' : 'monthly',
      priority: pathValue === '/' ? '1.0' : (pathValue === '/blog' ? '0.9' : '0.7')
    }));

    const blogUrls = blogs.map((blog) => ({
      loc: `${siteBase}/blog/${blog.slug}`,
      lastmod: (blog.updatedAt || blog.createdAt || new Date()).toISOString(),
      changefreq: 'weekly',
      priority: '0.8'
    }));

    const allUrls = [...staticUrls, ...blogUrls];

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allUrls
  .map(
    (url) => `  <url>
    <loc>${escapeXml(url.loc)}</loc>
    ${url.lastmod ? `<lastmod>${escapeXml(url.lastmod)}</lastmod>` : ''}
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`
  )
  .join('\n')}
</urlset>`;

    res.set('Content-Type', 'application/xml');
    res.set('Cache-Control', 'public, max-age=1800');
    return res.status(200).send(xml);
  } catch (error) {
    console.error('Sitemap generation error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to generate sitemap'
    });
  }
});

module.exports = router;
