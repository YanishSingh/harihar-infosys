import axios from 'axios';

// Axios instance for API calls using Vite proxy (recommended for dev)
const api = axios.create({
  baseURL: '/api', // Always use /api so Vite proxies to your backend
  // withCredentials is not needed unless using cookies for auth
});

// Attach Bearer token from localStorage to all requests
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers = config.headers || {};
      config.headers['Authorization'] = `Bearer ${token}`;
      // Optional: Uncomment for debugging
      // console.log("Added Authorization header:", config.headers['Authorization']);
    }
    return config;
  },
  error => Promise.reject(error)
);

// Pass response through directly (you may want to unwrap .data elsewhere)
api.interceptors.response.use(
  response => response,
  error => Promise.reject(error)
);

export default api;
