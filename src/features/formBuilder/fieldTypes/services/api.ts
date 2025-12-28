/**
 * Service layer for Field Types API
 * 
 * This module handles all HTTP communication with the field types endpoint.
 * It manages authentication, request/response transformation, and error handling.
 * 
 * Architecture:
 * - Uses a dedicated Axios instance with baseURL configuration
 * - Implements request interceptor for automatic token injection
 * - Provides detailed error parsing for network, server, and unexpected errors
 * - Returns only typed data (no UI logic)
 */

import axios, { type AxiosInstance, AxiosError, type InternalAxiosRequestConfig } from 'axios';
import type {
  FieldType,
  FieldTypesApiResponse,
  FieldTypesApiError,
} from '../types';

// Import the existing auth token helper (assumed to exist in your project)
import { loadToken } from '../../../auth/utils/tokenStorage';
// Import store to access Redux state (assumed to exist in your project)
import { store } from '@/store';

/**
 * Retrieves authentication token from Redux store or localStorage
 * 
 * Priority:
 * 1. Redux store (state.auth.token)
 * 2. LocalStorage via loadToken()
 * 
 * @returns The auth token string or null if not found
 */
const getAuthToken = (): string | null => {
  try {
    const state = store.getState();
    const reduxToken = state.auth?.token;
    if (reduxToken) {
      console.info('[FieldTypes Service] Token retrieved from Redux store');
      return reduxToken;
    }
    
    const storageToken = loadToken();
    if (storageToken) {
      console.info('[FieldTypes Service] Token retrieved from localStorage');
    }
    return storageToken;
  } catch (error) {
    console.error('[FieldTypes Service] Error retrieving auth token:', error);
    return null;
  }
};

/**
 * Create a dedicated Axios instance for field types API
 * 
 * Benefits of a dedicated instance:
 * - Scoped configuration (baseURL, timeout, headers)
 * - Isolated interceptors that don't affect other API calls
 * - Easy to test and maintain
 */
const createFieldTypesApiClient = (): AxiosInstance => {
  const instance = axios.create({
    baseURL: import.meta.env.VITE_DYNAMIC_FORMS_BASE_URL,
    timeout: Number(import.meta.env.VITE_API_TIMEOUT), // 15 second timeout
    headers: {
      'Content-Type': import.meta.env.VITE_API_CONTENT_TYPE,
      'Accept': import.meta.env.VITE_API_ACCEPT,
    },
  });

  /**
   * Request Interceptor
   * 
   * Automatically injects the Authorization header before each request.
   * If no token is found, the request proceeds without auth (will likely fail at API level).
   */
  instance.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      const token = getAuthToken();
      
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        console.info('[FieldTypes Service] Authorization header added to request');
      } else {
        console.warn('[FieldTypes Service] No auth token found - request may fail');
      }
      
      return config;
    },
    (error) => {
      console.error('[FieldTypes Service] Request interceptor error:', error);
      return Promise.reject(error);
    }
  );

  /**
   * Response Interceptor
   * 
   * Logs successful responses and passes them through unchanged.
   * Error handling is done in the service method for better context.
   */
  instance.interceptors.response.use(
    (response) => {
      console.info('[FieldTypes Service] Response received:', {
        status: response.status,
        url: response.config.url,
      });
      return response;
    },
    (error) => {
      // Pass error through - will be handled by parseApiError
      return Promise.reject(error);
    }
  );

  return instance;
};

// Create singleton instance
const apiClient = createFieldTypesApiClient();

/**
 * Parses Axios errors into user-friendly messages
 * 
 * Handles three error categories:
 * 1. Server responded with error (status >= 400)
 * 2. Network error (no response received)
 * 3. Unexpected error (request setup failed)
 * 
 * @param error - The caught error from Axios
 * @returns User-safe error message
 */
const parseApiError = (error: unknown): string => {
  // Type guard for AxiosError
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<FieldTypesApiError>;

    // Case 1: Server responded with an error status
    if (axiosError.response) {
      const { status, data } = axiosError.response;
      
      console.error('[FieldTypes Service] Server error:', {
        status,
        data,
        url: axiosError.config?.url,
      });

      // Check if response has our expected error format
      if (data && typeof data === 'object' && 'message' in data && data.message) {
        return data.message as string;
      }

      // Fallback status-based messages
      if (status === 401 || status === 403) {
        return 'Authentication failed. Please log in again.';
      }
      if (status === 404) {
        return 'Field types endpoint not found.';
      }
      if (status >= 500) {
        return 'Server error. Please try again later.';
      }

      return `Request failed with status ${status}.`;
    }

    // Case 2: Request was made but no response received (network error)
    if (axiosError.request) {
      console.error('[FieldTypes Service] Network error - no response:', {
        message: axiosError.message,
        code: axiosError.code,
      });
      return 'Network error. Please check your connection and try again.';
    }

    // Case 3: Error setting up the request
    console.error('[FieldTypes Service] Request setup error:', axiosError.message);
    return 'Failed to send request. Please try again.';
  }

  // Non-Axios error (unexpected)
  console.error('[FieldTypes Service] Unexpected error:', error);
  return 'An unexpected error occurred. Please try again.';
};

/**
 * Fetches the list of field types from the API
 * 
 * Endpoint: GET /field-types
 * Authentication: Required (Bearer token)
 * 
 * @returns Promise resolving to array of FieldType objects
 * @throws Error with user-friendly message if request fails
 */
export const fetchFieldTypes = async (): Promise<FieldType[]> => {
  try {
    // Validate token before making request
    const token = getAuthToken();
    if (!token) {
      console.error('[FieldTypes Service] Cannot fetch - authentication token not found');
      throw new Error('Authentication token not found. Please log in.');
    }

    console.info('[FieldTypes Service] Fetching field types...');

    const response = await apiClient.get<FieldTypesApiResponse>('/field-types');

    // Validate response structure
    if (!response.data || typeof response.data !== 'object') {
      console.error('[FieldTypes Service] Invalid response structure:', response.data);
      throw new Error('Invalid response format from server.');
    }

    const { success, data } = response.data;

    // Check API-level success flag
    if (!success) {
      console.warn('[FieldTypes Service] API returned success=false:', response.data);
      throw new Error('Failed to fetch field types.');
    }

    // Validate data array
    if (!Array.isArray(data)) {
      console.error('[FieldTypes Service] Expected array but got:', typeof data);
      throw new Error('Invalid data format from server.');
    }

    console.info(`[FieldTypes Service] Successfully fetched ${data.length} field types`);
    
    return data;
  } catch (error) {
    // Parse and re-throw with user-friendly message
    const errorMessage = parseApiError(error);
    console.error('[FieldTypes Service] Fetch failed:', errorMessage);
    throw new Error(errorMessage);
  }
};

/**
 * Export additional utilities for testing or advanced usage
 */
export const fieldTypesServiceUtils = {
  getAuthToken,
  parseApiError,
};
