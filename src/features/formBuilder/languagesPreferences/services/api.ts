/**
 * Language Service
 * 
 * Handles all API calls for language preferences.
 * Uses getAuthToken() helper to attach authentication tokens.
 * Throws normalized errors for Redux to handle.
 */

import axios, { AxiosError, type AxiosInstance } from 'axios';
import { store } from '@/store'; // Adjust path to your Redux store
import { loadToken } from '../../../auth/utils/tokenStorage'; // Adjust path as needed
import type {
  GetAllLanguagesResponse,
  GetDefaultLanguageResponse,
  SetDefaultLanguageResponse,
  SetDefaultLanguageRequest,
  ApiErrorResponse,
} from '../types';

// ============================================================================
// Constants
// ============================================================================

const BASE_URL = import.meta.env.VITE_DYNAMIC_FORMS_BASE_URL;

// API Endpoints
const ENDPOINTS = {
  GET_ALL_LANGUAGES: '/user/language/all',
  GET_DEFAULT_LANGUAGE: '/user/language/default',
  SET_DEFAULT_LANGUAGE: '/translations/save',
} as const;

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get authentication token with fallback
 * First tries Redux store, then falls back to localStorage
 */
const getAuthToken = (): string | null => {
  try {
    const state = store.getState();
    const reduxToken = state.auth?.token;
    
    if (reduxToken) {
      console.debug('[Language Service] Token retrieved from Redux store');
      return reduxToken;
    }
    
    // Fallback to decrypt token from localStorage
    console.debug('[Language Service] Falling back to localStorage token');
    return loadToken();
  } catch (error) {
    console.error('[Language Service] Error retrieving auth token:', error);
    return null;
  }
};

/**
 * Create axios instance with default configuration
 */
const createAxiosInstance = (): AxiosInstance => {
  return axios.create({
    baseURL: BASE_URL,
    timeout: Number(import.meta.env.VITE_API_TIMEOUT), // 15 seconds
    headers: {
      'Content-Type': import.meta.env.VITE_API_CONTENT_TYPE,
      'Accept': import.meta.env.VITE_API_ACCEPT,
    },
  });
};

/**
 * Attach authorization headers to request
 */
const getAuthHeaders = (): Record<string, string> => {
  const token = getAuthToken();
  
  if (!token) {
    throw new Error('Authentication token not found. Please log in again.');
  }
  
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };
};

/**
 * Normalize error messages from various sources
 */
const normalizeError = (error: unknown): string => {
  // Axios error with response
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<ApiErrorResponse>;
    
    // Server returned error response
    if (axiosError.response?.data) {
      const errorData = axiosError.response.data;
      
      // API error message
      if (errorData.message) {
        console.error('[Language Service] API Error:', errorData.message);
        return errorData.message;
      }
      
      // Laravel validation errors
      if (errorData.errors) {
        const validationMessages = Object.values(errorData.errors)
          .flat()
          .join(', ');
        console.error('[Language Service] Validation Error:', validationMessages);
        return validationMessages;
      }
      
      // Generic error field
      if (errorData.error) {
        console.error('[Language Service] Error:', errorData.error);
        return errorData.error;
      }
    }
    
    // Network or timeout error
    if (axiosError.code === 'ECONNABORTED') {
      console.error('[Language Service] Request timeout');
      return 'Request timeout. Please check your connection and try again.';
    }
    
    if (axiosError.code === 'ERR_NETWORK') {
      console.error('[Language Service] Network error');
      return 'Network error. Please check your internet connection.';
    }
    
    // HTTP status errors
    if (axiosError.response?.status === 401) {
      console.error('[Language Service] Unauthorized');
      return 'Session expired. Please log in again.';
    }
    
    if (axiosError.response?.status === 403) {
      console.error('[Language Service] Forbidden');
      return 'You do not have permission to perform this action.';
    }
    
    if (axiosError.response?.status === 404) {
      console.error('[Language Service] Not found');
      return 'Resource not found.';
    }
    
    if (axiosError.response?.status === 500) {
      console.error('[Language Service] Server error');
      return 'Server error. Please try again later.';
    }
    
    // Generic axios error
    console.error('[Language Service] Axios error:', axiosError.message);
    return axiosError.message || 'An unexpected error occurred.';
  }
  
  // Standard Error object
  if (error instanceof Error) {
    console.error('[Language Service] Error:', error.message);
    return error.message;
  }
  
  // Unknown error type
  console.error('[Language Service] Unknown error:', error);
  return 'An unexpected error occurred. Please try again.';
};

// ============================================================================
// Service Functions
// ============================================================================

/**
 * Get all available languages
 * 
 * @returns Promise with list of all languages
 * @throws Normalized error string
 */
export const getAllLanguages = async (): Promise<GetAllLanguagesResponse> => {
  console.info('[Language Service] Fetching all languages');
  
  try {
    const headers = getAuthHeaders();
    const axiosInstance = createAxiosInstance();
    
    const response = await axiosInstance.get<GetAllLanguagesResponse>(
      ENDPOINTS.GET_ALL_LANGUAGES,
      { headers }
    );
    
    console.info('[Language Service] Successfully fetched languages:', response.data.data.length);
    console.debug('[Language Service] Languages:', response.data.data);
    
    return response.data;
  } catch (error) {
    const errorMessage = normalizeError(error);
    console.error('[Language Service] Failed to fetch all languages');
    throw new Error(errorMessage);
  }
};

/**
 * Get user's default language
 * 
 * @returns Promise with user's default language
 * @throws Normalized error string
 */
export const getDefaultLanguage = async (): Promise<GetDefaultLanguageResponse> => {
  console.info('[Language Service] Fetching user default language');
  
  try {
    const headers = getAuthHeaders();
    const axiosInstance = createAxiosInstance();
    
    const response = await axiosInstance.get<GetDefaultLanguageResponse>(
      ENDPOINTS.GET_DEFAULT_LANGUAGE,
      { headers }
    );
    
    console.info('[Language Service] Successfully fetched default language:', response.data.data.name);
    console.debug('[Language Service] Default language:', response.data.data);
    
    return response.data;
  } catch (error) {
    const errorMessage = normalizeError(error);
    console.error('[Language Service] Failed to fetch default language');
    throw new Error(errorMessage);
  }
};

/**
 * Set user's default language
 * 
 * @param languageId - ID of the language to set as default
 * @returns Promise with updated user data
 * @throws Normalized error string
 */
export const setDefaultLanguage = async (
  languageId: number
): Promise<SetDefaultLanguageResponse> => {
  console.info('[Language Service] Setting default language to ID:', languageId);
  
  try {
    const headers = getAuthHeaders();
    const axiosInstance = createAxiosInstance();
    
    const requestBody: SetDefaultLanguageRequest = {
      language_id: languageId,
    };
    
    console.debug('[Language Service] Request body:', requestBody);
    
    const response = await axiosInstance.put<SetDefaultLanguageResponse>(
      ENDPOINTS.SET_DEFAULT_LANGUAGE,
      requestBody,
      { headers }
    );
    
    console.info('[Language Service] Successfully set default language');
    console.debug('[Language Service] Updated user:', response.data.data);
    
    return response.data;
  } catch (error) {
    const errorMessage = normalizeError(error);
    console.error('[Language Service] Failed to set default language');
    throw new Error(errorMessage);
  }
};

// ============================================================================
// Utility Exports
// ============================================================================

/**
 * Check if token exists (useful for conditional logic)
 */
export const hasAuthToken = (): boolean => {
  const token = getAuthToken();
  return token !== null && token.length > 0;
};

/**
 * Language service object (alternative API)
 */
export const languageService = {
  getAllLanguages,
  getDefaultLanguage,
  setDefaultLanguage,
  hasAuthToken,
};

// Default export
export default languageService;
