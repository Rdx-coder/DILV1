const crypto = require('crypto');

const CSRF_SECRET = process.env.CSRF_SECRET || process.env.JWT_SECRET || 'change-me-in-env';
const CSRF_TOKEN_TTL_MS = parseInt(process.env.CSRF_TOKEN_TTL_MS || String(2 * 60 * 60 * 1000), 10);

const encode = (value) => Buffer.from(value, 'utf8').toString('base64url');
const decode = (value) => Buffer.from(value, 'base64url').toString('utf8');

const sign = (payload) => crypto.createHmac('sha256', CSRF_SECRET).update(payload).digest('base64url');

const buildToken = () => {
  const payload = JSON.stringify({
    ts: Date.now(),
    nonce: crypto.randomBytes(16).toString('hex')
  });
  const encodedPayload = encode(payload);
  const signature = sign(encodedPayload);
  return `${encodedPayload}.${signature}`;
};

const verifyToken = (token) => {
  if (!token || typeof token !== 'string' || !token.includes('.')) {
    return false;
  }

  const [encodedPayload, signature] = token.split('.');
  if (!encodedPayload || !signature) {
    return false;
  }

  const expectedSignature = sign(encodedPayload);
  const signatureBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expectedSignature);
  if (signatureBuffer.length !== expectedBuffer.length) {
    return false;
  }

  const isValidSignature = crypto.timingSafeEqual(signatureBuffer, expectedBuffer);

  if (!isValidSignature) {
    return false;
  }

  let payload;
  try {
    payload = JSON.parse(decode(encodedPayload));
  } catch (_error) {
    return false;
  }

  const issuedAt = Number(payload.ts || 0);
  if (!issuedAt || Date.now() - issuedAt > CSRF_TOKEN_TTL_MS) {
    return false;
  }

  return true;
};

exports.issueCsrfToken = (_req, res) => {
  const token = buildToken();
  return res.status(200).json({
    success: true,
    csrfToken: token,
    expiresInMs: CSRF_TOKEN_TTL_MS
  });
};

exports.requireCsrf = (req, res, next) => {
  const method = String(req.method || 'GET').toUpperCase();
  if (['GET', 'HEAD', 'OPTIONS'].includes(method)) {
    return next();
  }

  const token = req.get('x-csrf-token');
  if (!verifyToken(token)) {
    return res.status(403).json({
      success: false,
      message: 'Invalid or missing CSRF token'
    });
  }

  return next();
};
