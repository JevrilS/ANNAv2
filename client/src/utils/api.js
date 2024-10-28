import axios from 'axios';

const baseURL = `https://django-backend-604521917673.asia-northeast1.run.app`;

const api = axios.create({
    baseURL: baseURL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor to automatically refresh the token if it expires
api.interceptors.response.use(
    response => response,
    async error => {
        const originalRequest = error.config;

        if (error.response.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                // Get refresh token from localStorage
                const refreshToken = localStorage.getItem('refreshToken');

                if (refreshToken) {
                    const refreshResponse = await api.post('/api/token/refresh/', { refresh: refreshToken });
                    
                    if (refreshResponse.status === 200) {
                        const newAccessToken = refreshResponse.data.access;
                        localStorage.setItem('token', newAccessToken);  // Store the new access token

                        // Update the authorization header with the new token
                        api.defaults.headers['Authorization'] = `Bearer ${newAccessToken}`;
                        originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
                        
                        // Retry the original request with the new token
                        return api(originalRequest);
                    }
                }
            } catch (error) {
                console.error('Token refresh failed:', error);
                return Promise.reject(error);
            }
        }

        return Promise.reject(error);
    }
);

export default api;
