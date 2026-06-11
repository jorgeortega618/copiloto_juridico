import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api',
  withCredentials: true,  // Mantiene compatibilidad con cookies
});

// Request Interceptor: Auto-login para el MVP
api.interceptors.request.use(async (config) => {
  if (typeof window !== 'undefined') {
    let token = localStorage.getItem('accessToken');
    
    // Si no hay token y no es la ruta de login, autologin silencioso
    if (!token && !config.url?.includes('/auth/login')) {
      try {
        const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
        const { data } = await axios.post(`${baseURL}/auth/login`, {
          email: 'demo@abogados.com',
          password: '123456'
        });
        token = data.accessToken;
        localStorage.setItem('accessToken', token);
      } catch (err) {
        console.error('Auto-login failed', err);
      }
    }

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
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
