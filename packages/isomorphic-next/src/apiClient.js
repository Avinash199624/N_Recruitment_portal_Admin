import axios from 'axios';
import { notification } from 'antd';

const baseURL = process.env.NEXT_PUBLIC_BASE_API_URL;

const apiClient = () => {
  const instance = axios.create({
    baseURL,
  });

  // Obtain the fresh token each time the function is called
  function getAccessToken() {
    return localStorage.getItem('token');
  }

  // Use interceptor to inject the token to requests
  instance.interceptors.request.use((request) => {
    request.headers['Content-Type'] = 'application/json';
    if (getAccessToken()) {
      request.headers.Authorization = `Token ${getAccessToken()}`;
    }
    return request;
  });

  instance.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response.data?.message) {
        notification['error']({
          description: error.response.data.message,
        });
      } else {
        notification['error']({
          description: 'Something is wrong. Try again.',
        });
      }
    }
  );

  return instance;
};

export default apiClient;
