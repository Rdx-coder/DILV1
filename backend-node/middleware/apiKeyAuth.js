module.exports = function requireIntegrationApiKey(req, res, next) {
  const configuredKey = process.env.INTEGRATION_API_KEY;

  if (!configuredKey) {
    return res.status(503).json({
      success: false,
      message: 'Integration API key is not configured on server'
    });
  }

  const providedKey = req.get('x-api-key') || req.query.apiKey || '';
  if (!providedKey || providedKey !== configuredKey) {
    return res.status(401).json({
      success: false,
      message: 'Invalid integration API key'
    });
  }

  return next();
};
