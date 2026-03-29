export const getToken = () => {
  return localStorage.getItem('adminToken');
};

export const getAdminData = () => {
  const data = localStorage.getItem('adminData');
  return data ? JSON.parse(data) : null;
};

export const isAuthenticated = () => {
  return !!getToken();
};

export const logout = () => {
  localStorage.removeItem('adminToken');
  localStorage.removeItem('adminData');
};

export const getAuthHeaders = () => {
  const token = getToken();
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};