import { useState, useCallback } from 'react';
import axios from 'axios';
import config from '../config.jsx';

// Создаем экземпляр axios с базовой конфигурацией
const apiClient = axios.create({
  baseURL: config.baseUrl,
  timeout: config.api.timeout,
  withCredentials: true,
});

// Интерцептор для обработки ошибок
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

export const useApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const request = useCallback(async (method, url, data = null, options = {}) => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiClient.request({
        method,
        url,
        data,
        ...options,
      });
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'Произошла ошибка';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const get = useCallback((url, options = {}) => request('GET', url, null, options), [request]);
  const post = useCallback((url, data, options = {}) => request('POST', url, data, options), [request]);
  const put = useCallback((url, data, options = {}) => request('PUT', url, data, options), [request]);
  const del = useCallback((url, options = {}) => request('DELETE', url, null, options), [request]);

  return {
    loading,
    error,
    request,
    get,
    post,
    put,
    delete: del,
  };
};
