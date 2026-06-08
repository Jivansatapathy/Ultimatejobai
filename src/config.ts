// In development the Vite proxy handles /api → backend, so baseURL can be empty.
// In production set VITE_API_BASE_URL to the deployed backend URL (e.g. Railway).
export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? '';
