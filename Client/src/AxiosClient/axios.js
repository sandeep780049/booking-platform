import axios from 'axios';
import { setLanguageHeaders, getCurrentLanguage } from '../Api/language.api.js';

export const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_SERVER_URL || 'http://localhost:8080/',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Request interceptor to add language header and authorization token
axiosClient.interceptors.request.use(
  (config) => {
    // Add the current language to request headers
    const configWithLang = setLanguageHeaders(config);

    // Add authorization token if available
    const token = localStorage.getItem('accessToken');
    // Only add token if it exists and is not 'null' or 'undefined' string
    if (
      token &&
      token !== 'null' &&
      token !== 'undefined' &&
      token.trim() !== ''
    ) {
      configWithLang.headers.Authorization = `Bearer ${token}`;
    }

    return configWithLang;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const errorMessage = error.response?.data?.message?.toLowerCase() || '';
      if (
        errorMessage.includes('token') ||
        errorMessage.includes('unauthorized')
      ) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');

        const publicRoutes = [
          '/',
          '/login',
          '/login-options',
          '/terms',
          '/privacy',
          '/faq',
          '/mission',
          '/browse',
          '/event',
          '/auth',
          '/reset',
        ];
        const currentPath = window.location.pathname;
        const isPublicRoute = publicRoutes.some(
          (route) =>
            currentPath === route || currentPath.startsWith(route + '/')
        );

        if (!isPublicRoute && !currentPath.includes('/login')) {
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);
