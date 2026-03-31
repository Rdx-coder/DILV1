export const logClientError = async ({
  message,
  stack,
  source = 'frontend',
  path = window.location.pathname,
  userAgent = navigator.userAgent
} = {}) => {
  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
  if (!BACKEND_URL) return;

  const payload = {
    message: String(message || 'Unknown client error'),
    stack: String(stack || ''),
    source,
    path,
    userAgent,
    reportedAt: new Date().toISOString()
  };

  try {
    if (navigator.sendBeacon) {
      const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' });
      navigator.sendBeacon(`${BACKEND_URL}/api/client-errors`, blob);
      return;
    }

    await fetch(`${BACKEND_URL}/api/client-errors`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload),
      keepalive: true
    });
  } catch (_error) {
    // Intentionally swallow logging failures.
  }
};
