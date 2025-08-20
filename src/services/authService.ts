import axios from 'axios';
import { tokenStorage } from '../utils/tokenStorage';
import type {
  RegisterRequest,
  RegisterResponse,
  VerifyEmailOtpRequest,
  ResendVerificationOtpRequest,
  LoginRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  AuthResponse,
  User,
} from '../types/authTypes';

// Base API URL
const API_BASE_URL = 'https://auth.pnepizza.com/api/v1/auth';

// Track if we're currently refreshing to prevent multiple refresh attempts
let isRefreshing = false;
let refreshAttempts = 0;
const MAX_REFRESH_ATTEMPTS = 3;

let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token!);
    }
  });
  
  failedQueue = [];
};

// Function to get token from Redux store first, then localStorage
const getTokenFromStore = (): string | null => {
  // Try to get token from Redux store first (if available)
  if (typeof window !== 'undefined' && (window as any).__REDUX_STORE__) {
    const reduxState = (window as any).__REDUX_STORE__.getState();
    if (reduxState.auth?.token) {
      return reduxState.auth.token;
    }
  }
  
  // Fallback to localStorage
  return tokenStorage.getToken();
};

// Create axios instance with default config
const authApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// Add token to requests if available
authApi.interceptors.request.use((config) => {
  const token = getTokenFromStore();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token refresh on 401 responses
authApi.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Don't try to refresh token for login, register, or other auth endpoints
    const authEndpoints = ['/login', '/register', '/forgot-password', '/reset-password', '/verify-email'];
    const isAuthEndpoint = authEndpoints.some(endpoint => 
      originalRequest.url?.includes(endpoint)
    );

    // Also don't refresh if this is already a refresh token request
    const isRefreshTokenRequest = originalRequest.url?.includes('/refresh-token');

    if (error.response?.status === 401 && !originalRequest._retry && !isAuthEndpoint && !isRefreshTokenRequest) {
      // Check if we've exceeded max refresh attempts
      if (refreshAttempts >= MAX_REFRESH_ATTEMPTS) {
        console.error('Max refresh attempts exceeded');
        tokenStorage.removeToken();
        delete authApi.defaults.headers.Authorization;
        refreshAttempts = 0;
        isRefreshing = false;
        
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }

      if (isRefreshing) {
        // If we're already refreshing, queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return authApi(originalRequest);
        }).catch((err) => {
          return Promise.reject(err);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;
      refreshAttempts++;

      try {
        const refreshResponse = await authApi.post('/refresh-token');
        
        if (refreshResponse.data.success && refreshResponse.data.data?.token) {
          const newToken = refreshResponse.data.data.token;
          tokenStorage.setToken(newToken);
          authApi.defaults.headers.Authorization = `Bearer ${newToken}`;
          processQueue(null, newToken);
          
          // Reset refresh attempts on successful refresh
          refreshAttempts = 0;
          
          // Retry the original request with new token
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return authApi(originalRequest);
        } else {
          throw new Error('Invalid refresh response');
        }
      } catch (refreshError: any) {
        console.error('Token refresh failed:', refreshError);
        
        // Check if the refresh token is also invalid (Unauthenticated)
        if (refreshError.response?.data?.message === 'Unauthenticated.') {
          console.log('Refresh token is invalid, clearing auth state');
        }
        
        // Refresh failed, clear everything and redirect
        processQueue(refreshError, null);
        tokenStorage.removeToken();
        delete authApi.defaults.headers.Authorization;
        
        // Reset refresh attempts
        refreshAttempts = 0;
        
        // Only redirect if we're not already on login page
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

export const authService = {
  // Register new user with enhanced error handling
  register: async (data: RegisterRequest): Promise<RegisterResponse> => {
    try {
      const response = await authApi.post('/register', data);
      
      // Success response
      return {
        success: true,
        message: response.data.message || 'User registered successfully',
        data: response.data.data,
      };
    } catch (error: any) {
      console.error('Registration API error:', error.response?.data || error.message);
      
      // Handle different types of errors
      if (error.response?.data) {
        const errorData = error.response.data;
        
        // Handle validation errors (422)
        if (error.response.status === 422) {
          return {
            success: false,
            message: errorData.message || 'The given data was invalid.',
            errors: errorData.errors || {},
          };
        }
        
        // Handle email already exists error (400)
        if (error.response.status === 400) {
          return {
            success: false,
            message: errorData.message || 'Registration failed',
            error: errorData.error || errorData.message || 'Registration failed',
          };
        }
        
        // Handle other server errors
        return {
          success: false,
          message: errorData.message || 'Registration failed',
          error: errorData.error || errorData.message || 'Registration failed',
        };
      }
      
      // Handle network/connection errors
      if (!error.response) {
        return {
          success: false,
          message: 'Network error occurred',
          error: 'Unable to connect to the server. Please check your internet connection.',
        };
      }
      
      // Fallback error
      return {
        success: false,
        message: 'Registration failed. Please try again.',
        error: error.message || 'An unexpected error occurred',
      };
    }
  },

  // Verify email with OTP
  verifyEmailOtp: async (
    data: VerifyEmailOtpRequest,
  ): Promise<AuthResponse> => {
    try {
      const response = await authApi.post('/verify-email', data);
      return response.data;
    } catch (error: any) {
      if (error.response?.data) {
        return error.response.data;
      }
      return {
        success: false,
        message: 'Email verification failed. Please try again.',
      };
    }
  },

  // Resend verification OTP
  resendVerificationOtp: async (
    data: ResendVerificationOtpRequest,
  ): Promise<AuthResponse> => {
    try {
      const response = await authApi.post('/resend-verification-otp', data);
      return response.data;
    } catch (error: any) {
      if (error.response?.data) {
        return error.response.data;
      }
      return {
        success: false,
        message: 'Failed to resend verification code. Please try again.',
      };
    }
  },

  // Login user
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    try {
      const response = await authApi.post('/login', data);

      // Save token using encrypted storage
      if (
        response.data.success &&
        response.data.data &&
        response.data.data.token
      ) {
        const token = response.data.data.token;
        tokenStorage.setToken(token);
        authApi.defaults.headers.Authorization = `Bearer ${token}`;
        // Reset refresh attempts on successful login
        refreshAttempts = 0;
      }

      return response.data;
    } catch (error: any) {
      console.error('Login API error:', error.response?.data);
      // Return the server error response for invalid credentials
      if (error.response?.data) {
        return error.response.data;
      }
      // Return a generic error structure if no response
      return {
        success: false,
        message: 'Login failed. Please try again.',
      };
    }
  },

  // Forgot password
  forgotPassword: async (
    data: ForgotPasswordRequest,
  ): Promise<AuthResponse> => {
    try {
      const response = await authApi.post('/forgot-password', data);
      return response.data;
    } catch (error: any) {
      if (error.response?.data) {
        return error.response.data;
      }
      return {
        success: false,
        message: 'Failed to send password reset email. Please try again.',
      };
    }
  },

  // Reset password
  resetPassword: async (data: ResetPasswordRequest): Promise<AuthResponse> => {
    try {
      const response = await authApi.post('/reset-password', data);
      return response.data;
    } catch (error: any) {
      if (error.response?.data) {
        return error.response.data;
      }
      return {
        success: false,
        message: 'Password reset failed. Please try again.',
      };
    }
  },

  // Get user profile - updated to match new API response structure
  getUserProfile: async (): Promise<User> => {
    const response = await authApi.get('/me');
    // Extract user from the new API response structure
    return response.data.data.user;
  },

  // Logout user
  logout: async (): Promise<AuthResponse> => {
    try {
      const response = await authApi.post('/logout');
      tokenStorage.removeToken();
      delete authApi.defaults.headers.Authorization;
      // Reset refresh attempts on logout
      refreshAttempts = 0;
      return response.data;
    } catch (error) {
      // Even if logout fails on server, clear local storage
      tokenStorage.removeToken();
      delete authApi.defaults.headers.Authorization;
      refreshAttempts = 0;
      throw error;
    }
  },

  // Refresh token
  refreshToken: async (): Promise<AuthResponse> => {
    const response = await authApi.post('/refresh-token');

    // Save new token using encrypted storage
    if (
      response.data.success &&
      response.data.data &&
      response.data.data.token
    ) {
      const token = response.data.data.token;
      tokenStorage.setToken(token);
      authApi.defaults.headers.Authorization = `Bearer ${token}`;
    }

    return response.data;
  },

  // Get current token from storage (checks Redux store first, then localStorage)
  getCurrentToken: (): string | null => {
    return getTokenFromStore();
  },

  // Check if valid token exists
  hasValidToken: (): boolean => {
    const token = getTokenFromStore();
    return !!token && tokenStorage.hasValidToken();
  },
};

// Export the refresh function for use in interceptor
export const refreshToken = authService.refreshToken;
