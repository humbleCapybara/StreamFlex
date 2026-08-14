// API Base URL configuration
// For local development, it points to the local Express server.
// For production, it points to the deployed backend URL.

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
