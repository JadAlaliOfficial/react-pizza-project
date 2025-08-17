import axios from 'axios';
import type {
  RegisterRequest,
  VerifyEmailOtpRequest,
  ResendVerificationOtpRequest,
  LoginRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  AuthResponse,
  User,
} from '../types/authTypes.ts';

const API_BASE_URL = 'https://auth.pnepizza.com/api/v1/auth';

let isRefreshing = false;
let refreshAttempts = 0;
const MAX_REFRESH_ATTEMPTS = 3;

const authApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// Simple token interceptor
authApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Simplified response interceptor - only handle token refresh for protected routes
authApi.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Only try refresh for /me endpoint and other protected routes
    const protectedEndpoints = ['/me', '/logout'];
    const isProtectedEndpoint = protectedEndpoints.some(endpoint => 
      originalRequest.url?.includes(endpoint)
    );

    if (error.response?.status === 401 && isProtectedEndpoint && !originalRequest._retry) {
      if (refreshAttempts >= MAX_REFRESH_ATTEMPTS || isRefreshing) {
        localStorage.removeItem('auth_token');
        refreshAttempts = 0;
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }

      originalRequest._retry = true;
      isRefreshing = true;
      refreshAttempts++;

      try {
        const response = await axios.post(`${API_BASE_URL}/refresh-token`, {}, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
          },
        });

        if (response.data.success && response.data.data?.token) {
          const newToken = response.data.data.token;
          localStorage.setItem('auth_token', newToken);
          refreshAttempts = 0;
          return authApi(originalRequest);
        }
      } catch (refreshError) {
        localStorage.removeItem('auth_token');
        refreshAttempts = 0;
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export const authService = {
  login: async (data: LoginRequest) => {
    const response = await authApi.post('/login', data);
    
    if (response.data.success && response.data.data?.token) {
      localStorage.setItem('auth_token', response.data.data.token);
      refreshAttempts = 0;
    }
    
    return response.data;
  },

  register: async (data: RegisterRequest) => {
    const response = await authApi.post('/register', data);
    return response.data;
  },

  getUserProfile: async (): Promise<User> => {
    const response = await authApi.get('/me');
    return response.data.data.user;
  },

  logout: async () => {
    try {
      await authApi.post('/logout');
    } finally {
      localStorage.removeItem('auth_token');
      refreshAttempts = 0;
    }
  },

  forgotPassword: async (data: ForgotPasswordRequest) => {
    const response = await authApi.post('/forgot-password', data);
    return response.data;
  },

  resetPassword: async (data: ResetPasswordRequest) => {
    const response = await authApi.post('/reset-password', data);
    return response.data;
  },

  verifyEmailOtp: async (data: VerifyEmailOtpRequest) => {
    const response = await authApi.post('/verify-email', data);
    return response.data;
  },

  resendVerificationOtp: async (data: ResendVerificationOtpRequest) => {
    const response = await authApi.post('/resend-verification-otp', data);
    return response.data;
  },
};
