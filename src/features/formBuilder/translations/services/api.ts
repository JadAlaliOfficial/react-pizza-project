// translations.service.ts

/**
 * API service layer for translations feature.
 * Handles all HTTP requests to the translations endpoints with proper authentication,
 * error handling, and response validation.
 */

import axios, { type AxiosInstance, AxiosError } from 'axios';
import {
  type AvailableLanguagesResponse,
  type LocalizableDataResponse,
  type SaveTranslationsResponse,
  type SaveTranslationsPayload,
  type GetLocalizableDataParams,
  type Language,
  type LocalizableData,
  type ApiResponse,
  isSuccessResponse,
} from '../types';
import { store } from '@/store';
import { loadToken } from '../../../auth/utils/tokenStorage';

// ============================================================================
// Authentication Helper
// ============================================================================

/**
 * Get authentication token with fallback strategy.
 * First checks Redux state, then falls back to localStorage via loadToken.
 * @returns Bearer token or null if not available
 */
export const getAuthToken = (): string | null => {
  try {
    const state = store.getState();
    const reduxToken = state.auth?.token;
    
    if (reduxToken) {
      return reduxToken;
    }
    
    // Fallback to decrypt token from localStorage
    return loadToken();
  } catch (error) {
    console.error('[Translations Service] Error retrieving auth token:', error);
    return null;
  }
};

// ============================================================================
// Axios Instance Configuration
// ============================================================================

/**
 * Configured axios instance for translations API calls.
 * Base URL points to the translations endpoint group.
 * Automatically attaches authentication headers and handles common configurations.
 */
const translationsApiClient: AxiosInstance = axios.create({
  baseURL: 'http://dforms.pnepizza.com/api/translations',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  timeout: 30000, // 30 second timeout
});

/**
 * Request interceptor to attach bearer token to every request.
 * Logs request details for debugging.
 */
translationsApiClient.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    
    if (!token) {
      console.error('[Translations Service] No authentication token available');
      throw new Error('Authentication token is missing. Please log in again.');
    }
    
    // Attach bearer token
    config.headers.Authorization = `Bearer ${token}`;
    
    console.log(
      `[Translations Service] Request: ${config.method?.toUpperCase()} ${config.url}`,
      config.params || config.data || 'No payload'
    );
    
    return config;
  },
  (error) => {
    console.error('[Translations Service] Request interceptor error:', error);
    return Promise.reject(error);
  }
);

/**
 * Response interceptor to log responses and handle common errors.
 */
translationsApiClient.interceptors.response.use(
  (response) => {
    console.log(
      `[Translations Service] Response: ${response.config.method?.toUpperCase()} ${response.config.url}`,
      'Status:', response.status,
      'Data:', response.data
    );
    return response;
  },
  (error: AxiosError) => {
    console.error(
      `[Translations Service] Response error:`,
      error.response?.status,
      error.response?.data || error.message
    );
    return Promise.reject(error);
  }
);

// ============================================================================
// Error Handling Utilities
// ============================================================================

/**
 * Extracts a user-friendly error message from various error types.
 * @param error - The error object (Axios, API, or generic)
 * @returns User-friendly error message
 */
const extractErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<ApiResponse<unknown>>;
    
    // Check for API error message
    if (axiosError.response?.data?.message) {
      return axiosError.response.data.message;
    }
    
    if (axiosError.response?.data?.error) {
      return String(axiosError.response.data.error);
    }
    
    // Network or timeout errors
    if (axiosError.code === 'ECONNABORTED') {
      return 'Request timeout. Please check your connection and try again.';
    }
    
    if (axiosError.code === 'ERR_NETWORK') {
      return 'Network error. Please check your internet connection.';
    }
    
    if (axiosError.response?.status === 401) {
      return 'Unauthorized. Please log in again.';
    }
    
    if (axiosError.response?.status === 403) {
      return 'Access forbidden. You do not have permission to perform this action.';
    }
    
    if (axiosError.response?.status === 404) {
      return 'Resource not found.';
    }
    
    if (axiosError.response?.status === 500) {
      return 'Server error. Please try again later.';
    }
    
    return axiosError.message || 'An unexpected error occurred.';
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  return 'An unknown error occurred.';
};

/**
 * Creates a detailed error object with message and original error.
 * @param error - The caught error
 * @param context - Context about where the error occurred
 */
const createServiceError = (error: unknown, context: string) => {
  const message = extractErrorMessage(error);
  console.error(`[Translations Service] ${context}:`, message, error);
  
  return {
    message: `${context}: ${message}`,
    originalError: error,
  };
};

// ============================================================================
// API Service Functions
// ============================================================================

/**
 * Fetch all available languages for translation (excluding default language).
 * 
 * Endpoint: GET /api/translations/available-languages
 * 
 * @throws Error if request fails or response is invalid
 * @returns Array of Language objects
 */
export const fetchAvailableLanguages = async (): Promise<Language[]> => {
  try {
    console.log('[Translations Service] Fetching available languages...');
    
    const response = await translationsApiClient.get<AvailableLanguagesResponse>(
      '/available-languages'
    );
    
    // Validate response structure
    if (!response.data || !isSuccessResponse(response.data)) {
      throw new Error('Invalid response structure from available languages endpoint');
    }
    
    if (!Array.isArray(response.data.data)) {
      throw new Error('Expected data to be an array of languages');
    }
    
    console.log(
      `[Translations Service] Successfully fetched ${response.data.data.length} languages`
    );
    
    return response.data.data;
  } catch (error) {
    throw createServiceError(error, 'Failed to fetch available languages');
  }
};

/**
 * Fetch localizable data (form name + fields) for a specific form version and language.
 * 
 * Endpoint: GET /api/translations/localizable-data
 * 
 * @param params - Form version ID and language ID
 * @throws Error if request fails or response is invalid
 * @returns LocalizableData object containing form and field information
 */
export const fetchLocalizableData = async (
  params: GetLocalizableDataParams
): Promise<LocalizableData> => {
  try {
    console.log(
      `[Translations Service] Fetching localizable data for form_version_id=${params.form_version_id}, language_id=${params.language_id}...`
    );
    
    const response = await translationsApiClient.get<LocalizableDataResponse>(
      '/localizable-data',
      {
        params: {
          form_version_id: params.form_version_id,
          language_id: params.language_id,
        },
      }
    );
    
    // Validate response structure
    if (!response.data || !isSuccessResponse(response.data)) {
      throw new Error('Invalid response structure from localizable data endpoint');
    }
    
    if (!response.data.data || typeof response.data.data !== 'object') {
      throw new Error('Expected data to be a localizable data object');
    }
    
    const localizableData = response.data.data;
    
    // Validate critical fields
    if (
      !localizableData.form_version_id ||
      !localizableData.form_name ||
      !localizableData.language ||
      !Array.isArray(localizableData.fields)
    ) {
      throw new Error('Localizable data is missing required fields');
    }
    
    console.log(
      `[Translations Service] Successfully fetched localizable data: ${localizableData.fields.length} fields`
    );
    
    return localizableData;
  } catch (error) {
    throw createServiceError(error, 'Failed to fetch localizable data');
  }
};

// translations.service.ts

// ... (keep all previous code until saveTranslations function)

/**
 * Save translations for a form version in a specific language.
 * 
 * Endpoint: POST /api/translations/save
 * 
 * @param payload - Translation data including form name and field translations
 * @throws Error if request fails or response is invalid
 * @returns Success message from the API
 */
export const saveTranslations = async (
  payload: SaveTranslationsPayload
): Promise<{ success: true; message: string }> => {
  try {
    console.log(
      `[Translations Service] Saving translations for form_version_id=${payload.form_version_id}, language_id=${payload.language_id}...`,
      `Payload contains ${payload.field_translations.length} field translations`
    );
    
    // Validate payload before sending
    if (!payload.form_version_id || !payload.language_id) {
      throw new Error('form_version_id and language_id are required');
    }
    
    if (!payload.form_name || typeof payload.form_name !== 'string') {
      throw new Error('form_name is required and must be a string');
    }
    
    if (!Array.isArray(payload.field_translations)) {
      throw new Error('field_translations must be an array');
    }
    
    const response = await translationsApiClient.post<SaveTranslationsResponse>(
      '/save',
      payload
    );
    
    // Validate response structure - API returns success and message at root level
    if (!response.data || response.data.success !== true) {
      throw new Error('Invalid response structure from save translations endpoint');
    }
    
    if (!response.data.message) {
      throw new Error('Response missing success message');
    }
    
    console.log(
      `[Translations Service] Successfully saved translations: ${response.data.message}`
    );
    
    return {
      success: true,
      message: response.data.message,
    };
  } catch (error) {
    throw createServiceError(error, 'Failed to save translations');
  }
};


// ============================================================================
// Export Service Object (optional alternative API)
// ============================================================================

/**
 * Translations service object with all API methods.
 * Can be imported as a namespace for cleaner imports.
 */
export const TranslationsService = {
  fetchAvailableLanguages,
  fetchLocalizableData,
  saveTranslations,
  getAuthToken,
};

export default TranslationsService;
