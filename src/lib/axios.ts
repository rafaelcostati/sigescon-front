import axios from 'axios';
import { env } from "@/env";  

export const api = axios.create({
  baseURL: env.VITE_API_URL,
});


api.interceptors.request.use(
  config => {
    
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  response => {
    
    return response;
  },
  error => {
    
    return Promise.reject(error);
  }
);
