// Base API URL configuration for local dev and shared LAN/cloud deployments.
// If VITE_API_URL is not set, the app will target the same host on port 5000
// so multiple devices on the same network can reach the same backend database.
export const API_BASE_URL = (() => {
  const configured = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
  if (configured) return configured;

  if (typeof window !== 'undefined') {
    return `${window.location.protocol}//${window.location.hostname}:5000`;
  }

  return 'http://localhost:5000';
})();

export const API_TOKEN_KEY = 'nandhi_app_api_token';

export const setApiToken = (token) => {
  sessionStorage.setItem(API_TOKEN_KEY, token);
};

export const clearApiToken = () => {
  sessionStorage.removeItem(API_TOKEN_KEY);
};

export const apiFetch = (url, options = {}) => {
  const headers = new Headers(options.headers || {});
  const token = sessionStorage.getItem(API_TOKEN_KEY);
  if (token) headers.set('Authorization', `Bearer ${token}`);

  return fetch(url, { ...options, headers }).then((response) => {
    if (response.status === 401) {
      clearApiToken();
      window.dispatchEvent(new CustomEvent('nandhi:unauthorized'));
    }
    return response;
  });
};
