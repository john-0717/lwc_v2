// src/services/apiService.js
import axios from 'axios';

// Create a base axios instance
const apiClient = axios.create({
  baseURL: 'http://localhost:4000', // Replace with your actual base URL
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Optional: Interceptors for request/response
apiClient.interceptors.request.use(
  (config) => {
    // Add auth token here if needed
    config.headers.Authorization = `${localStorage.getItem("token")}`;
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Global error handling
    console.error('API Error:', error);
    debugger
    if([401,403].includes(error.status)){
      localStorage.clear()
      // window.location.href = '/'
    }
    return Promise.reject(error);
  }
);

// API methods
const apiService = {
  get: async (url:any, params = {}) => {
    const response = await apiClient.get(url, { params });
    return response.data;
  },

  post: async (url:any, data = {}) => {
    const response = await apiClient.post(url, data);
    return response.data;
  },

  put: async (url:any, data = {}) => {
    const response = await apiClient.put(url, data);
    return response.data;
  },

  delete: async (url:any) => {
    const response = await apiClient.delete(url);
    return response.data;
  },
};

export default apiService;
