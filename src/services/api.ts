import axios from 'axios';
import { API_BASE_URL } from '@/config';

const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 60000,
    headers: {
        'Content-Type': 'application/json',
    },
});

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

// Response interceptor for logging and handling 401 errors
api.interceptors.response.use(
    (response) => {
        const method = response.config.method?.toUpperCase() || 'GET';
        const url = response.config.url;
        console.groupCollapsed(`🚀 API ${method}: ${url}`);
        console.log('Status:', response.status);
        console.log('Data:', response.data);
        console.groupEnd();
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
