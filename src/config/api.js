// Base API URL configuration for local dev and cloud deployments (e.g. Netlify/Render/Railway)
export const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/$/, '');
