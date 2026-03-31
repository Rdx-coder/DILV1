let cachedToken = '';
let tokenFetchedAt = 0;

const TOKEN_REFRESH_WINDOW_MS = 90 * 60 * 1000; // refresh before backend token expiry

export const getCsrfToken = async (backendUrl = process.env.REACT_APP_BACKEND_URL) => {
  const now = Date.now();
  if (cachedToken && now - tokenFetchedAt < TOKEN_REFRESH_WINDOW_MS) {
    return cachedToken;
  }

  try {
    const response = await fetch(`${backendUrl}/api/csrf-token`, {
      method: 'GET',
      credentials: 'include'
    });

    if (!response.ok) {
      throw new Error(`CSRF fetch failed with status ${response.status}`);
    }

    const data = await response.json();

    if (!data?.success || !data?.csrfToken) {
      console.error('Invalid CSRF response:', data);
      throw new Error('Invalid CSRF token response from server');
    }

    cachedToken = data.csrfToken;
    tokenFetchedAt = now;
    return cachedToken;
  } catch (error) {
    console.error('[CSRF] Token fetch error:', error.message);
    throw error;
  }
};

export const withCsrfHeaders = async (headers = {}, backendUrl = process.env.REACT_APP_BACKEND_URL) => {
  try {
    const csrfToken = await getCsrfToken(backendUrl);
    return {
      ...headers,
      'x-csrf-token': csrfToken
    };
  } catch (error) {
    console.error('[CSRF] Header creation failed:', error.message);
    throw error;
  }
};
