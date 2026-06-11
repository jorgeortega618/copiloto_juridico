import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api',
  withCredentials: true,  // Mantiene compatibilidad con cookies
});

// Request Interceptor: Auto-login para el MVP
api.interceptors.request.use(async (config) => {
  if (typeof window !== 'undefined') {
    let token = localStorage.getItem('accessToken');
    let orgId = localStorage.getItem('orgId');
    
    // Si no hay token o no hay orgId, autologin silencioso
    if ((!token || !orgId) && !config.url?.includes('/auth/login')) {
      try {
        const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
        const { data } = await axios.post(`${baseURL}/auth/login`, {
          email: 'demo@abogados.com',
          password: '123456'
        });
        token = data.accessToken;
        orgId = data.orgId;
        if (token) {
          localStorage.setItem('accessToken', token);
        }
        if (orgId) {
          localStorage.setItem('orgId', orgId);
        }
      } catch (err) {
        console.error('Auto-login failed', err);
      }
    }

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    if (orgId) {
      config.headers.set('X-Organization-Id', orgId);
    }
  }
  return config;
});

// Response Interceptor: Remove 401 redirect to avoid loops
api.interceptors.response.use(
  (response) => response,
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
