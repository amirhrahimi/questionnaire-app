import axios from 'axios';
import Cookies from 'js-cookie';

// Create axios instance with base configuration
const api = axios.create({
    baseURL: '', // Same origin
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add request interceptor to include auth token
api.interceptors.request.use(
    (config) => {
        const token = Cookies.get('authToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
            console.log('API Request:', {
                url: config.url,
                method: config.method,
                hasToken: !!token,
                tokenLength: token.length,
                authHeader: config.headers.Authorization
            });
        } else {
            console.log('API Request without token:', {
                url: config.url,
                method: config.method,
                hasToken: false
            });
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Add response interceptor to handle auth errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        console.log('API Response Error:', {
            status: error.response?.status,
            statusText: error.response?.statusText,
            url: error.config?.url,
            method: error.config?.method,
            data: error.response?.data
        });

        if (error.response?.status === 401) {
            // Token expired or invalid, clear auth data
            console.log('401 Unauthorized - clearing auth data');
            Cookies.remove('authToken');
            Cookies.remove('authUser');
            window.location.reload();
        } else if (error.response?.status === 403) {
            console.log('403 Forbidden - insufficient permissions');
        }
        return Promise.reject(error);
    }
);

export default api;
