import axios from 'axios';
import type { AxiosInstance, AxiosResponse } from 'axios';
import { store } from '../../../store'; // Adjust import path as needed
import { loadToken } from '../utils/tokenStorage';
import type {
  LoginRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  ApiResponse,
  LoginResponse,
  RefreshTokenResponse,
  UserProfileResponse,
} from '../types';

// Base API configuration
const API_BASE_URL = 'https://auth.pnepizza.com/api/v1';

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  },
});

// Helper function to get token from Redux store or localStorage fallback
const getAuthToken = (): string | null => {
  const state = store.getState();
  const reduxToken = state.auth?.token;
  
  if (reduxToken) {
    return reduxToken;
  }
  
  // Fallback to decrypt token from localStorage
  return loadToken();
};

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (token && config.headers) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Auth service functions - pure API calls without Redux logic
export const authService = {
  

  // Login user
  login: async (
    data: LoginRequest
  ): Promise<AxiosResponse<ApiResponse<LoginResponse>>> => {
    return await apiClient.post('/auth/login', data);
  },

  // Forgot password
  forgotPassword: async (
    data: ForgotPasswordRequest
  ): Promise<AxiosResponse<ApiResponse>> => {
    return await apiClient.post('/auth/forgot-password', data);
  },

  // Reset password
  resetPassword: async (
    data: ResetPasswordRequest
  ): Promise<AxiosResponse<ApiResponse>> => {
    return await apiClient.post('/auth/reset-password', data);
  },

  // Get user profile
  getUserProfile: async (): Promise<AxiosResponse<ApiResponse<UserProfileResponse>>> => {
    return await apiClient.get('/auth/me');
  },

  // Refresh token
  refreshToken: async (): Promise<AxiosResponse<ApiResponse<RefreshTokenResponse>>> => {
    return await apiClient.post('/auth/refresh-token');
  },

  // Logout user
  logout: async (): Promise<AxiosResponse<ApiResponse>> => {
    return await apiClient.post('/auth/logout');
  },
};

// Export the configured axios instance for use in other parts of the app if needed
export { apiClient };

// Helper function to check if error is unauthorized
export const isUnauthorizedError = (error: any): boolean => {
  return error?.response?.status === 401;
};

// Helper function to check if error is validation error
export const isValidationError = (error: any): boolean => {
  return error?.response?.status === 422;
};

// Helper function to check if error is bad request
export const isBadRequestError = (error: any): boolean => {
  return error?.response?.status === 400;
};
