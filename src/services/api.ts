import axios from 'axios';
import { API_BASE_URL } from '@/config';

// ---------------------------------------------------------------------------
// In-memory GET cache — survives React route changes (component unmount/remount)
// ---------------------------------------------------------------------------
const _cache = new Map<string, { data: unknown; headers: unknown; ts: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// Never cache these prefixes (real-time / user-action results)
const NO_CACHE_PREFIXES = [
  '/api/bot/',
  '/api/notifications/',
  '/api/auth/',
  '/api/token',
  '/ws/',
];

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

// Patch the adapter so GET responses are served from cache on re-navigation
const _httpAdapter = axios.defaults.adapter as (config: unknown) => Promise<unknown>;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(api.defaults as any).adapter = async (config: any) => {
  const url: string = config.url || '';
  const isGet = (config.method || 'get').toLowerCase() === 'get';
  const excluded = NO_CACHE_PREFIXES.some((p) => url.includes(p));

  if (isGet && !excluded) {
    const key = url + '|' + JSON.stringify(config.params || {});
    const hit = _cache.get(key);
    if (hit && Date.now() - hit.ts < CACHE_TTL) {
      // Return a synthetic axios response — interceptors still run normally
      return { data: hit.data, status: 200, statusText: 'OK (cached)', headers: hit.headers, config, request: {} };
    }
    const response = await _httpAdapter(config) as any;
    _cache.set(key, { data: response.data, headers: response.headers, ts: Date.now() });
    return response;
  }

  return _httpAdapter(config);
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

        const token = localStorage.getItem('access_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Mutation → cache invalidation map: when a URL matching the pattern succeeds,
// clear GET caches whose keys include any of the listed substrings.
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
    (error) => {
        const method = error.config?.method?.toUpperCase() || 'UNKNOWN';
        const url = error.config?.url || 'unknown';
        console.group(`❌ API ERROR ${method}: ${url}`);
        console.error('Status:', error.response?.status);
        console.error('Message:', error.message);
        console.error('Response Data:', error.response?.data);
        console.groupEnd();

        if (error.response?.status === 401) {
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            window.location.href = '/auth';
        }
        return Promise.reject(error);
    }
);

export default api;
