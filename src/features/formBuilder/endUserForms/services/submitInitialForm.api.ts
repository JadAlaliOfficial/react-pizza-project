// src/features/forms/formsService.ts

/**
 * =============================================================================
 * FORMS SERVICE - AXIOS CLIENT & API METHODS
 * =============================================================================
 * 
 * This service layer handles all HTTP communication with the forms API.
 * 
 * Key features:
 * - Dedicated Axios instance with baseURL from environment variables [web:17][web:20]
 * - Request interceptor for automatic token injection [web:11][web:18]
 * - Response interceptor for error normalization [web:16][web:19]
 * - Type-safe service methods with full TypeScript support
 * - Development logging that can be disabled in production
 * - Integration with existing Redux + localStorage token mechanism
 */

import axios, { type AxiosInstance, AxiosError, type InternalAxiosRequestConfig } from 'axios';
import {
  type SubmitInitialStageRequest,
  type SubmitInitialStageResponse,
  type SubmitInitialStageErrorResponse,
  type SubmitLaterStageRequest,
  type SubmitLaterStageResponse,
  type ApiError,
  isErrorResponse,
} from '../types/submitInitialForm.types';
import { loadToken } from '../../../auth/utils/tokenStorage';
import { store } from '@/store';

// =============================================================================
// CONFIGURATION
// =============================================================================

/**
 * Base URL for the forms API.
 * Configured via environment variable with fallback for development.
 * 
 * Environment variable: REACT_APP_API_BASE_URL or VITE_API_BASE_URL
 */
const API_BASE_URL =  'http://dforms.pnepizza.com';

/**
 * Request timeout in milliseconds.
 * Prevents hanging requests and provides better UX.
 */
const REQUEST_TIMEOUT = 30000; // 30 seconds

/**
 * Feature flag for development logging.
 * Set to false in production to avoid console noise.
 */
const ENABLE_LOGGING = process.env.NODE_ENV === 'development';

// =============================================================================
// AUTHENTICATION TOKEN HELPER
// =============================================================================

/**
 * Retrieves authentication token with Redux + localStorage fallback.
 * 
 * This helper follows a two-tier approach:
 * 1. First checks Redux store for in-memory token (fast, no decryption)
 * 2. Falls back to localStorage with decryption if Redux token unavailable
 * 
 * This ensures token availability even after page refresh when Redux
 * state is cleared but encrypted token persists in localStorage.
 * 
 * @returns Auth token string or null if unavailable
 */
const getAuthToken = (): string | null => {
  try {
    // Try to get token from Redux store first (in-memory, fast)
    const state = store.getState();
    const reduxToken = state.auth?.token;
    
    if (reduxToken) {
      return reduxToken;
    }
    
    // Fallback: decrypt token from localStorage
    return loadToken();
  } catch (error) {
    console.error('Error retrieving auth token:', error);
    return null;
  }
};

// =============================================================================
// LOGGING UTILITIES
// =============================================================================

/**
 * Lightweight logger that respects the ENABLE_LOGGING flag.
 * Disabled in production to avoid console pollution.
 */
const logger = {
  info: (message: string, ...args: unknown[]) => {
    if (ENABLE_LOGGING) {
      console.log(`[FormsService] ${message}`, ...args);
    }
  },
  error: (message: string, ...args: unknown[]) => {
    if (ENABLE_LOGGING) {
      console.error(`[FormsService] ${message}`, ...args);
    }
  },
  warn: (message: string, ...args: unknown[]) => {
    if (ENABLE_LOGGING) {
      console.warn(`[FormsService] ${message}`, ...args);
    }
  },
};

// =============================================================================
// ERROR NORMALIZATION
// =============================================================================

/**
 * Normalizes various error types into a consistent ApiError shape.
 * This enables uniform error handling across the application [web:16].
 * 
 * Handles:
 * - Network errors (no response received)
 * - HTTP errors with response (4xx, 5xx)
 * - Business logic errors (success: false in response)
 * - Axios timeout errors
 * - Unknown/unexpected errors
 * 
 * @param error - The error to normalize
 * @returns Normalized ApiError with discriminated type
 */
export function normalizeError(error: unknown): ApiError {
  // Handle Axios errors with response
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<SubmitInitialStageErrorResponse>;

    // Network errors (no response received - connection failed, timeout, etc.)
    if (!axiosError.response) {
      if (axiosError.code === 'ECONNABORTED') {
        logger.error('Request timeout:', axiosError.message);
        return {
          type: 'network',
          message: 'Request timed out. Please check your connection and try again.',
          originalError: axiosError,
        };
      }

      logger.error('Network error:', axiosError.message);
      return {
        type: 'network',
        message: axiosError.message || 'Network error. Please check your internet connection.',
        originalError: axiosError,
      };
    }

    const { status, data } = axiosError.response;

    // Authentication errors (401, 403)
    if (status === 401 || status === 403) {
      logger.error('Authentication error:', status, data);
      return {
        type: 'authentication',
        message: data?.message || 'Authentication failed. Please log in again.',
        statusCode: status,
      };
    }

    // Validation errors (400, 422)
    if (status === 400 || status === 422) {
      logger.error('Validation error:', status, data);
      return {
        type: 'validation',
        message: data?.message || 'Validation failed. Please check your input.',
        statusCode: status,
        errors: data?.errors,
      };
    }

    // Server errors (500+)
    if (status >= 500) {
      logger.error('Server error:', status, data);
      return {
        type: 'server',
        message: data?.message || 'Server error. Please try again later.',
        statusCode: status,
      };
    }

    // Other HTTP errors
    logger.error('HTTP error:', status, data);
    return {
      type: 'server',
      message: data?.message || `Request failed with status ${status}`,
      statusCode: status,
    };
  }

  // Handle generic Error objects
  if (error instanceof Error) {
    logger.error('Unexpected error:', error.message);
    return {
      type: 'unknown',
      message: error.message || 'An unexpected error occurred.',
      originalError: error,
    };
  }

  // Handle completely unknown errors
  logger.error('Unknown error type:', error);
  return {
    type: 'unknown',
    message: 'An unexpected error occurred.',
    originalError: error,
  };
}

// =============================================================================
// AXIOS INSTANCE CONFIGURATION
// =============================================================================

/**
 * Creates and configures a dedicated Axios instance for the forms API.
 * This instance is separate from other API clients to maintain clean boundaries.
 * 
 * Configuration:
 * - baseURL from environment variable [web:17][web:20]
 * - 30-second timeout
 * - JSON content type by default
 * - Request interceptor for auth token injection [web:11][web:18]
 * - Response interceptor for error normalization [web:16]
 */
const createFormsApiClient = (): AxiosInstance => {
  const instance = axios.create({
    baseURL: API_BASE_URL,
    timeout: REQUEST_TIMEOUT,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
  });

  // ---------------------------------------------------------------------------
  // REQUEST INTERCEPTOR - Attach authentication token
  // ---------------------------------------------------------------------------
  instance.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      logger.info('Outgoing request:', config.method?.toUpperCase(), config.url);

      // Retrieve auth token from Redux or localStorage with fallback mechanism
      const token = getAuthToken();

      if (!token) {
        logger.warn('No auth token found - request may fail');
        // Don't throw here - let the API return 401 and handle it in error interceptor
      } else {
        // Inject Bearer token into Authorization header
        config.headers.Authorization = `Bearer ${token}`;
        logger.info('Auth token attached to request');
      }

      return config;
    },
    (error: AxiosError) => {
      logger.error('Request interceptor error:', error);
      return Promise.reject(error);
    }
  );

  // ---------------------------------------------------------------------------
  // RESPONSE INTERCEPTOR - Normalize errors and handle business logic errors
  // ---------------------------------------------------------------------------
  instance.interceptors.response.use(
    (response) => {
      logger.info('Response received:', response.status, response.config.url);

      // Check if API returned success: false despite HTTP 200
      // This is a business logic error that should be treated as failure
      const data = response.data as SubmitInitialStageResponse | SubmitInitialStageErrorResponse;

      if (isErrorResponse(data)) {
        logger.error('Business logic error (success: false):', data);
        
        // Create a business error and reject the promise
        const businessError: ApiError = {
          type: 'business',
          message: data.message || 'Operation failed',
          error_code: data.error_code,
          errors: data.errors,
        };

        return Promise.reject(businessError);
      }

      return response;
    },
    (error: AxiosError) => {
      // Log the error for debugging
      if (error.response) {
        logger.error(
          'Response error:',
          error.response.status,
          error.response.config?.url,
          error.response.data
        );
      } else {
        logger.error('Request failed:', error.message);
      }

      // Normalize the error into our ApiError shape
      const normalizedError = normalizeError(error);
      
      // Reject with normalized error for consistent handling in Redux
      return Promise.reject(normalizedError);
    }
  );

  return instance;
};

/**
 * Singleton Axios instance for forms API.
 * Created once and reused across all service methods.
 */
const formsApiClient = createFormsApiClient();

// =============================================================================
// API SERVICE METHODS
// =============================================================================

/**
 * Forms API service object.
 * Contains all typed methods for interacting with the forms backend.
 */
export const formsService = {
  /**
   * Submits the initial stage of a form.
   * 
   * This method calls POST /api/enduser/forms/submit-initial with the provided
   * form data. It automatically attaches the auth token via request interceptor.
   * 
   * @param payload - The form submission data
   * @returns Promise resolving to the submission response data
   * @throws {ApiError} Normalized error if request fails
   * 
   * @example
   * ```
   * try {
   *   const result = await formsService.submitInitialStage({
   *     form_version_id: 23,
   *     stage_transition_id: 46,
   *     field_values: [
   *       { field_id: 381, value: { street: "123 Main St", city: "NYC" } },
   *       { field_id: 382, value: "John Doe" }
   *     ]
   *   });
   *   console.log('Entry ID:', result.entry_id);
   * } catch (error) {
   *   const apiError = error as ApiError;
   *   if (apiError.type === 'authentication') {
   *     // Handle auth error
   *   }
   * }
   * ```
   */
  submitInitialStage: async (
    payload: SubmitInitialStageRequest
  ): Promise<SubmitInitialStageResponse> => {
    logger.info('Submitting initial stage:', {
      form_version_id: payload.form_version_id,
      stage_transition_id: payload.stage_transition_id,
      field_count: payload.field_values.length,
    });
    console.log('Payload:', payload);

    // Check for auth token before making request
    const token = getAuthToken();
    if (!token) {
      logger.error('Cannot submit form - no auth token available');
      
      // Throw normalized authentication error
      const authError: ApiError = {
        type: 'authentication',
        message: 'Authentication required. Please log in to submit the form.',
        statusCode: 401,
      };
      
      throw authError;
    }

    try {
      const response = await formsApiClient.post<SubmitInitialStageResponse>(
        '/api/enduser/forms/submit-initial',
        payload
      );

      logger.info('Form submitted successfully:', response.data.data.entry_id);
      
      return response.data;
    } catch (error) {
      // Error is already normalized by response interceptor
      // Just re-throw it for Redux thunk to handle
      logger.error('Submit initial stage failed:', error);
      throw error;
    }
  },

  /**
   * Submits a later stage of a form.
   * 
   * This method calls POST /api/enduser/entries/submit-later-stage with the provided
   * data. It automatically attaches the auth token via request interceptor.
   * 
   * @param payload - The form submission data including public identifier
   * @returns Promise resolving to the submission response data
   * @throws {ApiError} Normalized error if request fails
   */
  submitLaterStage: async (
    payload: SubmitLaterStageRequest
  ): Promise<SubmitLaterStageResponse> => {
    logger.info('Submitting later stage:', {
      public_identifier: payload.public_identifier,
      stage_transition_id: payload.stage_transition_id,
      field_count: payload.field_values.length,
    });
    console.log('Payload:', payload);

    // Check for auth token before making request
    const token = getAuthToken();
    if (!token) {
      logger.error('Cannot submit form - no auth token available');
      
      // Throw normalized authentication error
      const authError: ApiError = {
        type: 'authentication',
        message: 'Authentication required. Please log in to submit the form.',
        statusCode: 401,
      };
      
      throw authError;
    }

    try {
      const response = await formsApiClient.post<SubmitLaterStageResponse>(
        '/api/enduser/entries/submit-later-stage',
        payload
      );

      logger.info('Later stage submitted successfully:', response.data.data.entry_id);
      
      return response.data;
    } catch (error) {
      // Error is already normalized by response interceptor
      // Just re-throw it for Redux thunk to handle
      logger.error('Submit later stage failed:', error);
      throw error;
    }
  },

  // ---------------------------------------------------------------------------
  // FUTURE: Add more form-related API methods here
  // ---------------------------------------------------------------------------
  // Example structure for scalability:
  // 
  // getFormById: async (formId: number) => { ... },
  // updateFormStage: async (entryId: number, payload: UpdateStageRequest) => { ... },
  // getFormEntries: async (filters?: FormFilters) => { ... },
};

/**
 * Export the configured Axios instance for advanced use cases.
 * Use with caution - prefer using formsService methods for consistency.
 */
export { formsApiClient };
