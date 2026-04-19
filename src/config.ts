// Always use relative URLs — dev uses the Vite proxy, prod uses the Vercel proxy.
// Both forward /api/* server-side to Railway, so the browser never hits Railway directly
// and CORS is never an issue.
export const API_BASE_URL = "";
