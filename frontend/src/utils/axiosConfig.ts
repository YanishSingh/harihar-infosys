// src/utils/axiosConfig.ts
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
  withCredentials: true,                // send cookies if your backend uses them
});

api.interceptors.response.use(
  res => res.data,                      // unwrap data
  err => Promise.reject(err.response?.data || err)
);

export default api;
