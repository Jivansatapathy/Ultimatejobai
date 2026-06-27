import axios, { AxiosRequestConfig } from 'axios';
import { API_BASE_URL } from '@/config';

let _isRefreshing = false;
let _refreshQueue: Array<{ resolve: (token: string) => void; reject: (err: unknown) => void }> = [];

// Don't redirect to /auth from pages that have their own auth gate
function _redirectToAuth() {
  if (!window.location.pathname.startsWith('/superadmin')) {
    window.location.href = '/auth';
  }
}

function _drainQueue(err: unknown, token?: string) {
  _refreshQueue.forEach(p => (err ? p.reject(err) : p.resolve(token!)));
  _refreshQueue = [];
}

// ---------------------------------------------------------------------------
// In-memory GET cache — survives React route changes (component unmount/remount)
// ---------------------------------------------------------------------------
const _cache = new Map<string, { data: unknown; ts: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// Never cache these prefixes (real-time / user-action results)
const NO_CACHE_PREFIXES = [
  '/api/bot/',
  '/api/notifications/',
  '/api/auth/',
  '/api/token',
  '/api/linkedin/',
  '/ws/',
  '/api/search/senior/',
  '/api/search/senior/filters/',
  '/api/employer/chat/',
];

/** Synchronously check if a GET URL is already in cache (no fetch needed). */
export function hasCached(url: string, params?: object): boolean {
  const key = url + '|' + JSON.stringify(params || {});
  const hit = _cache.get(key);
  return !!(hit && Date.now() - hit.ts < CACHE_TTL);
}

/** Call after a mutation to invalidate stale GET caches. */
export function clearApiCache(urlSubstring?: string) {
  if (!urlSubstring) { _cache.clear(); return; }
  for (const key of _cache.keys()) {
    if (key.includes(urlSubstring)) _cache.delete(key);
  }
}

const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 60000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Wrap api.get to serve cached responses — avoids adapter compatibility issues
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const _originalGet = api.get.bind(api) as any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(api as any).get = async function (url: string, config?: any) {
  const excluded = NO_CACHE_PREFIXES.some((p) => url.includes(p));
  if (!excluded) {
    const key = url + '|' + JSON.stringify(config?.params || {});
    const hit = _cache.get(key);
    if (hit && Date.now() - hit.ts < CACHE_TTL) {
      return { data: hit.data, status: 200, statusText: 'OK (cached)', headers: {}, config: config || {}, request: {} };
    }
    const response = await _originalGet(url, config);
    _cache.set(key, { data: response.data, ts: Date.now() });
    return response;
  }
  return _originalGet(url, config);
};

// Request interceptor for rate limiting and JWT
const mutationAttempts: { [key: string]: number[] } = {};

api.interceptors.request.use(
    (config) => {
        // Simple client-side throttle for mutations (POST, PUT, DELETE)
        if (config.method && ['post', 'put', 'delete', 'patch'].includes(config.method.toLowerCase())) {
            const now = Date.now();
            const timeframe = 60 * 1000; // 1 minute
            const endpoint = config.url || 'default';

            if (!mutationAttempts[endpoint]) mutationAttempts[endpoint] = [];
            mutationAttempts[endpoint] = mutationAttempts[endpoint].filter(t => now - t < timeframe);

            if (mutationAttempts[endpoint].length >= 50) {
                return Promise.reject({
                    message: "Rate limit exceeded (client-side). Please wait a moment.",
                    isRateLimit: true
                });
            }
            mutationAttempts[endpoint].push(now);
        }

        const url = config.url || '';
        const isAuthEndpoint = url.includes('/api/auth/') || url.includes('/api/token/');
        if (!isAuthEndpoint) {
            const token = localStorage.getItem('access_token');
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Mutation → cache invalidation map
const INVALIDATIONS: Array<[RegExp, string[]]> = [
  [/\/api\/apply\//, ['apply/history', 'activity/']],
  [/\/api\/bot\/confirm/, ['apply/history', 'activity/', 'bot/history']],
  [/\/api\/career\/profile/, ['career/profile']],
  [/\/api\/settings/, ['career/profile', 'subscriptions']],
  [/\/api\/subscriptions/, ['subscriptions']],
];

// Response interceptor for logging, 401 handling, and cache invalidation
api.interceptors.response.use(
    (response) => {
        const method = response.config.method?.toUpperCase() || 'GET';
        const url = response.config.url || '';
        console.groupCollapsed(`🚀 API ${method}: ${url}`);
        console.log('Status:', response.status);
        console.log('Data:', response.data);
        console.groupEnd();

        // Auto-invalidate stale GET caches after successful mutations
        if (!['GET', 'HEAD', 'OPTIONS'].includes(method)) {
          for (const [pattern, keys] of INVALIDATIONS) {
            if (pattern.test(url)) {
              keys.forEach((k) => clearApiCache(k));
            }
          }
        }

        return response;
    },
    async (error) => {
        const method = error.config?.method?.toUpperCase() || 'UNKNOWN';
        const url = error.config?.url || 'unknown';
        console.group(`❌ API ERROR ${method}: ${url}`);
        console.error('Status:', error.response?.status);
        console.error('Message:', error.message);
        console.error('Response Data:', error.response?.data);
        console.groupEnd();

        if (error.response?.status === 401) {
            const url: string = error.config?.url || '';

            // Auth/token endpoints must bubble up so the calling code can handle them
            // — intercepting them here causes the sign-in loop.
            if (url.includes('/api/auth/') || url.includes('/api/token/')) {
                return Promise.reject(error);
            }

            const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

            // If already retried, give up
            if (originalRequest._retry) {
                localStorage.removeItem('access_token');
                localStorage.removeItem('refresh_token');
                _redirectToAuth();
                return Promise.reject(error);
            }

            originalRequest._retry = true;

            // Queue parallel requests while refresh is in flight
            if (_isRefreshing) {
                return new Promise<string>((resolve, reject) => {
                    _refreshQueue.push({ resolve, reject });
                }).then(token => {
                    originalRequest.headers = { ...originalRequest.headers, Authorization: `Bearer ${token}` };
                    return api(originalRequest);
                });
            }

            _isRefreshing = true;

            const refreshToken = localStorage.getItem('refresh_token');
            if (!refreshToken) {
                _isRefreshing = false;
                localStorage.removeItem('access_token');
                _redirectToAuth();
                return Promise.reject(error);
            }

            try {
                const { data } = await axios.post(`${API_BASE_URL}/api/token/refresh/`, { refresh: refreshToken });
                const newToken: string = data.access;
                localStorage.setItem('access_token', newToken);
                api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
                originalRequest.headers = { ...originalRequest.headers, Authorization: `Bearer ${newToken}` };
                _drainQueue(null, newToken);
                _isRefreshing = false;
                return api(originalRequest);
            } catch (refreshErr) {
                _drainQueue(refreshErr);
                _isRefreshing = false;
                localStorage.removeItem('access_token');
                localStorage.removeItem('refresh_token');
                _redirectToAuth();
                return Promise.reject(refreshErr);
            }
        }
        return Promise.reject(error);
    }
);

export default api;
