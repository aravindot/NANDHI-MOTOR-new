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
