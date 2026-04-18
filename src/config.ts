const envApiBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim();

// In dev, use an empty base URL so requests go to localhost and hit the Vite proxy,
// which forwards them to Railway (avoids CORS). In production, use the env var or
// fall back to the Railway URL directly.
export const API_BASE_URL = (envApiBaseUrl && envApiBaseUrl.length > 0
    ? envApiBaseUrl
    : import.meta.env.DEV
        ? ""
        : "https://jobai-production-7672.up.railway.app"
).replace(/\/+$/, "");
