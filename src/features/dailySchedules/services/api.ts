// src/features/dailySchedules/services/api.ts

import axios, { AxiosError } from 'axios';
import type  {  AxiosInstance, AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { type ApiError, createApiError } from '../types';

// TODO: fix import path for store
import { store } from '../../../store';
import { loadToken } from '../../auth/utils/tokenStorage';

/**
 * Get authentication token from Redux store with localStorage fallback
 * Uses the exact token logic as specified - no alternatives allowed
 */
const getAuthToken = (): string | null => {
  try {
    // TODO: fix import path for store
    const state = store.getState();
    const reduxToken = state.auth?.token;
    if (reduxToken) return reduxToken;
    
    // For now, fallback directly to localStorage until store path is fixed
    return loadToken(); // fallback to decrypted token from localStorage
  } catch (error) {
    console.error('Error retrieving auth token:', error);
    return null;
  }
};

/**
 * Create Axios instance with base configuration
 */
const createApiInstance = (): AxiosInstance => {
  const instance = axios.create({
    // TODO: Replace with actual API base URL
    baseURL: import.meta.env.VITE_DAILY_SCHEDULES_NOT_WORKING_API_BASE_URL,
    timeout: Number(import.meta.env.VITE_API_TIMEOUT),
    headers: {
      'Accept': import.meta.env.VITE_API_ACCEPT,
      'Content-Type': import.meta.env.VITE_API_CONTENT_TYPE,
    },
  });

  // Request interceptor for authentication and logging
  instance.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      // Add authentication token if available
      const token = getAuthToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      // Log request in development
      if (process.env.NODE_ENV === 'development') {
        console.log('API Request:', {
          method: config.method?.toUpperCase(),
          url: config.url,
          data: config.data,
          params: config.params,
        });
      }

      return config;
    },
    (error) => {
      console.error('Request interceptor error:', error);
      return Promise.reject(error);
    }
  );

  // Response interceptor for error handling and logging
  instance.interceptors.response.use(
    (response: AxiosResponse) => {
      // Log response in development
      if (process.env.NODE_ENV === 'development') {
        console.log('API Response:', {
          status: response.status,
          url: response.config.url,
          data: response.data,
        });
      }

      return response;
    },
    (error: AxiosError) => {
      return Promise.reject(normalizeError(error));
    }
  );

  return instance;
};

/**
 * Normalize Axios errors into consistent ApiError format
 * Handles Laravel 422 validation errors and other HTTP errors
 */
const normalizeError = (error: unknown): ApiError => {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status || 0;
    let message = error.message;
    let fieldErrors: Record<string, string[]> | undefined;

    if (error.response?.data) {
      const responseData = error.response.data as any;

      // Handle Laravel 422 validation errors
      if (status === 422 && responseData.errors) {
        message = responseData.message || 'Validation failed';
        fieldErrors = responseData.errors;
      }
      // Handle other structured error responses
      else if (responseData.message) {
        message = responseData.message;
      }
      // Handle string error responses
      else if (typeof responseData === 'string') {
        message = responseData;
      }
    }

    // Provide user-friendly messages for common HTTP errors
    if (status === 401) {
      message = 'Authentication required. Please log in again.';
    } else if (status === 403) {
      message = 'You do not have permission to perform this action.';
    } else if (status === 404) {
      message = 'The requested resource was not found.';
    } else if (status === 429) {
      message = 'Too many requests. Please try again later.';
    } else if (status >= 500) {
      message = 'A server error occurred. Please try again later.';
    } else if (status === 0) {
      message = 'Network error. Please check your connection.';
    }

    return createApiError(status, message, fieldErrors, error.response?.data);
  }

  // Handle non-Axios errors - properly handle unknown type
  if (error instanceof Error) {
    return createApiError(0, error.message, undefined, error);
  }

  // Handle completely unknown errors
  return createApiError(0, 'An unexpected error occurred', undefined, error);
};

/**
 * Request configuration with optional cancellation support
 */
export interface ApiRequestOptions {
  signal?: AbortSignal;
}

/**
 * Extended Axios request config that includes our RequestOptions
 */
export interface ExtendedAxiosRequestConfig extends AxiosRequestConfig {
  signal?: AbortSignal;
}

/**
 * Main API instance with interceptors configured
 */
export const api = createApiInstance();

/**
 * Helper function to create cancellable requests
 * @param options Request options including abort signal
 * @returns Axios config with abort signal attached
 */
export const createRequestConfig = (options?: ApiRequestOptions): ExtendedAxiosRequestConfig => ({
  signal: options?.signal,
});

/**
 * Helper function to check if an error is a cancellation
 * @param error The error to check
 * @returns True if the error is due to request cancellation
 */
export const isRequestCancelled = (error: unknown): boolean => {
  if (axios.isCancel(error)) {
    return true;
  }
  
  if (error instanceof Error && error.name === 'AbortError') {
    return true;
  }
  
  return false;
};

/**
 * Type guard to check if an error is an ApiError
 * @param error The error to check
 * @returns True if the error is an ApiError
 */
export const isApiError = (error: unknown): error is ApiError => {
  return (
    typeof error === 'object' &&
    error !== null &&
    'status' in error &&
    'message' in error &&
    typeof (error as any).status === 'number' &&
    typeof (error as any).message === 'string'
  );
};

/**
 * Helper to get field-specific error messages from an ApiError
 * @param error The ApiError instance
 * @param fieldName The field to get errors for
 * @returns Array of error messages for the field, or empty array
 */
export const getFieldErrors = (error: ApiError, fieldName: string): string[] => {
  return error.fieldErrors?.[fieldName] || [];
};

/**
 * Helper to check if an ApiError has field validation errors
 * @param error The ApiError instance
 * @returns True if the error has field validation errors
 */
export const hasFieldErrors = (error: ApiError): boolean => {
  return Boolean(error.fieldErrors && Object.keys(error.fieldErrors).length > 0);
};

/**
 * Create an AbortController for request cancellation
 * @returns AbortController instance
 */
export const createAbortController = (): AbortController => {
  return new AbortController();
};

/**
 * Combine multiple AbortSignals into one
 * @param signals Array of AbortSignals to combine
 * @returns Combined AbortSignal that triggers when any input signal triggers
 */
export const combineAbortSignals = (signals: (AbortSignal | undefined)[]): AbortSignal => {
  const controller = new AbortController();
  
  const validSignals = signals.filter((signal): signal is AbortSignal => Boolean(signal));
  
  if (validSignals.length === 0) {
    return controller.signal;
  }

  const abortHandler = () => {
    controller.abort();
  };

  // Add listeners to all valid signals
  validSignals.forEach(signal => {
    if (signal.aborted) {
      controller.abort();
      return;
    }
    signal.addEventListener('abort', abortHandler, { once: true });
  });

  // Cleanup function to remove listeners
  const cleanup = () => {
    validSignals.forEach(signal => {
      signal.removeEventListener('abort', abortHandler);
    });
  };

  // Add cleanup to the combined signal
  controller.signal.addEventListener('abort', cleanup, { once: true });

  return controller.signal;
};

/**
 * Default export for convenience
 */
export default api;

// Export specific types to avoid conflicts
export type { ApiError } from '../types';
export { createApiError };
