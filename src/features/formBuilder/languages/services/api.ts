// src/features/languages/services/languagesService.ts
// Assumptions:
// - tokenStorage is located at src/features/auth/utils/tokenStorage.ts
// - store is at src/store/index.ts or src/store.ts
// - Axios is installed and configured
// - This service handles all language-related API calls

import axios, { AxiosError, type AxiosInstance } from 'axios';
import { loadToken } from '../../../auth/utils/tokenStorage';
import { store } from '@/store';
import { type LanguagesResponse, type ApiError } from '../types';

// Base API configuration
const API_BASE_URL = 'http://dforms.pnepizza.com/api';

/**
 * Helper function to get authentication token with fallback.
 * Tries Redux state first, then falls back to localStorage.
 */
const getAuthToken = (): string | null => {
  try {
    const state = store.getState();
    const reduxToken = state.auth?.token;
    if (reduxToken) {
      return reduxToken;
    }
    return loadToken();
  } catch (error) {
    console.error('Error retrieving auth token:', error);
    return null;
  }
};

/**
 * Create configured Axios instance for languages API.
 */
const createLanguagesApiClient = (): AxiosInstance => {
  const instance = axios.create({
    baseURL: API_BASE_URL,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    timeout: 10000, // 10 second timeout
  });

  // Intercept requests to inject bearer token
  instance.interceptors.request.use(
    (config) => {
      const token = getAuthToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      } else {
        console.warn('[LanguagesService] No auth token available for request');
      }
      return config;
    },
    (error) => {
      console.error('[LanguagesService] Request interceptor error:', error);
      return Promise.reject(error);
    }
  );

  return instance;
};

// Singleton instance
const apiClient = createLanguagesApiClient();

/**
 * Normalize Axios errors into predictable ApiError shape.
 */
const normalizeError = (error: unknown): ApiError => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<{ message?: string; error?: string }>;
    
    // Handle network errors
    if (!axiosError.response) {
      console.error('[LanguagesService] Network error or timeout:', axiosError.message);
      return {
        status: 0,
        message: 'Network error. Please check your connection.',
        details: axiosError.message,
      };
    }

    const { status, data } = axiosError.response;
    
    // Handle authentication/authorization errors
    if (status === 401) {
      console.error('[LanguagesService] 401 Unauthorized - Token may be expired or invalid');
      return {
        status: 401,
        message: 'Authentication required. Please log in again.',
        details: data?.message || data?.error,
      };
    }

    if (status === 403) {
      console.error('[LanguagesService] 403 Forbidden - Insufficient permissions');
      return {
        status: 403,
        message: 'Access denied. You do not have permission to access this resource.',
        details: data?.message || data?.error,
      };
    }

    // Handle other HTTP errors
    console.error(`[LanguagesService] HTTP ${status} error:`, data);
    return {
      status,
      message: data?.message || data?.error || `Request failed with status ${status}`,
      details: JSON.stringify(data),
    };
  }

  // Handle non-Axios errors
  console.error('[LanguagesService] Unexpected error:', error);
  return {
    status: -1,
    message: error instanceof Error ? error.message : 'An unexpected error occurred',
    details: String(error),
  };
};

/**
 * Fetch all languages from the API.
 * @returns Promise<Language[]> - Array of language objects
 * @throws ApiError - Normalized error object
 */
export const fetchAllLanguages = async (): Promise<LanguagesResponse['data']> => {
  try {
    console.log('[LanguagesService] Fetching all languages...');
    
    const response = await apiClient.get<LanguagesResponse>('/languages');
    
    // Validate response structure
    if (!response.data || typeof response.data.success !== 'boolean') {
      console.error('[LanguagesService] Invalid response structure:', response.data);
      throw new Error('Invalid API response structure');
    }

    if (!response.data.success) {
      console.warn('[LanguagesService] API returned success: false');
      throw new Error('API request was not successful');
    }

    console.log(`[LanguagesService] Successfully fetched ${response.data.data.length} languages`);
    return response.data.data;
    
  } catch (error) {
    const normalizedError = normalizeError(error);
    console.error('[LanguagesService] fetchAllLanguages failed:', normalizedError);
    throw normalizedError;
  }
};

/**
 * Service object exposing all language-related API methods.
 */
export const languagesService = {
  fetchAllLanguages,
};

export default languagesService;
