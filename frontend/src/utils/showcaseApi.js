const getBackendUrl = () => (process.env.REACT_APP_BACKEND_URL || '').replace(/\/$/, '');

const parseJsonResponse = async (response) => {
  const payload = await response.json().catch(() => ({}));

  if (!response.ok || payload.success === false) {
    throw new Error(payload.message || 'Request failed');
  }

  return payload;
};

export const showcaseApi = {
  getBackendUrl,
  async getProducts(params = {}) {
    const query = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        query.set(key, value);
      }
    });

    const response = await fetch(`${getBackendUrl()}/api/products${query.toString() ? `?${query.toString()}` : ''}`);
    return parseJsonResponse(response);
  },
  async getProductBySlug(slug) {
    const response = await fetch(`${getBackendUrl()}/api/products/${encodeURIComponent(slug)}`);
    return parseJsonResponse(response);
  },
  async getSponsors(params = {}) {
    const query = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        query.set(key, value);
      }
    });

    const response = await fetch(`${getBackendUrl()}/api/sponsors${query.toString() ? `?${query.toString()}` : ''}`);
    return parseJsonResponse(response);
  }
};
