/**
 * /src/features/entries/entriesService.ts
 * 
 * API service layer for entries endpoints.
 * Handles HTTP communication, token injection, error normalization, and query param serialization.
 */

import axios, { type AxiosInstance, AxiosError, type InternalAxiosRequestConfig } from 'axios';
import {
  type EntriesListQuery,
  type ListEntriesResponse,
  type NormalizedError,
  AuthTokenError,
  type FieldFilters,
} from '../types';
import { loadToken } from '../../../auth/utils/tokenStorage';
import { store } from '@/store'; // Adjust path to your Redux store

// ============================================================================
// Configuration
// ============================================================================

const API_BASE_URL = import.meta.env.VITE_DYNAMIC_FORMS_BASE_URL;
const API_TIMEOUT = Number(import.meta.env.VITE_API_TIMEOUT);

// Simple logger that respects environment
const logger = {
  info: (message: string, ...args: unknown[]) => {
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[EntriesService] ${message}`, ...args);
    }
  },
  error: (message: string, ...args: unknown[]) => {
    if (process.env.NODE_ENV !== 'production') {
      console.error(`[EntriesService ERROR] ${message}`, ...args);
    }
  },
  warn: (message: string, ...args: unknown[]) => {
    if (process.env.NODE_ENV !== 'production') {
      console.warn(`[EntriesService WARN] ${message}`, ...args);
    }
  },
};

// ============================================================================
// Token Retrieval
// ============================================================================

/**
 * Retrieves authentication token from Redux store or fallback storage.
 * Prioritizes Redux state, falls back to tokenStorage utility.
 * 
 * @returns Auth token or null if unavailable
 */
const getAuthToken = (): string | null => {
  try {
    // First attempt: Redux store
    const state = store.getState();
    const reduxToken = state.auth?.token;
    
    if (reduxToken) {
      logger.info('Token retrieved from Redux store');
      return reduxToken;
    }

    // Fallback: Token storage utility
    logger.warn('Redux token unavailable, falling back to tokenStorage');
    const storageToken = loadToken();
    
    if (storageToken) {
      logger.info('Token retrieved from storage');
      return storageToken;
    }

    logger.error('No authentication token available');
    return null;
  } catch (error) {
    logger.error('Error retrieving auth token:', error);
    return null;
  }
};

// ============================================================================
// Error Normalization
// ============================================================================

/**
 * Normalizes Axios errors into a consistent, predictable shape.
 * Handles network errors, HTTP errors, and unexpected exceptions.
 * 
 * @param error - The error to normalize
 * @returns Normalized error object
 */
export const normalizeError = (error: unknown): NormalizedError => {
  // Handle Axios-specific errors
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<{ message?: string; error?: string }>;

    // Network error (no response received)
    if (!axiosError.response) {
      logger.error('Network error occurred', {
        message: axiosError.message,
        code: axiosError.code,
      });

      return {
        message: 'Network error: Unable to reach the server. Please check your connection.',
        isNetworkError: true,
        details: {
          code: axiosError.code,
          originalMessage: axiosError.message,
        },
      };
    }

    // HTTP error (response received with error status)
    const { status, data } = axiosError.response;
    const errorMessage = data?.message || data?.error || axiosError.message || 'An error occurred';

    // Handle authentication errors explicitly
    if (status === 401) {
      logger.error('Authentication failed (401)');
      return {
        message: 'Authentication failed. Please log in again.',
        statusCode: 401,
        details: data,
      };
    }

    if (status === 403) {
      logger.error('Access forbidden (403)');
      return {
        message: 'Access denied. You do not have permission to perform this action.',
        statusCode: 403,
        details: data,
      };
    }

    logger.error(`HTTP error ${status}:`, errorMessage);
    return {
      message: errorMessage,
      statusCode: status,
      details: data,
    };
  }

  // Handle custom AuthTokenError
  if (error instanceof AuthTokenError) {
    logger.error('Auth token error:', error.message);
    return {
      message: error.message,
      statusCode: 401,
    };
  }

  // Handle generic errors
  if (error instanceof Error) {
    logger.error('Unexpected error:', error.message);
    return {
      message: error.message,
      details: error,
    };
  }

  // Fallback for unknown error types
  logger.error('Unknown error type:', error);
  return {
    message: 'An unexpected error occurred',
    details: error,
  };
};

// ============================================================================
// Query Parameter Serialization
// ============================================================================

/**
 * Serializes field filters into the required query param format.
 * 
 * Converts:
 * { 1454: { value: "charlie", type: "contains" } }
 * 
 * Into:
 * field_filters[1454][value]=charlie&field_filters[1454][type]=contains
 * 
 * @param fieldFilters - The field filters object
 * @param params - URLSearchParams instance to append to
 */
const serializeFieldFilters = (
  fieldFilters: FieldFilters,
  params: URLSearchParams
): void => {
  Object.entries(fieldFilters).forEach(([fieldId, filters]) => {
    Object.entries(filters).forEach(([key, value]) => {
      // Convert boolean to string for API compatibility
      const stringValue = typeof value === 'boolean' ? (value ? '1' : '0') : String(value);
      params.append(`field_filters[${fieldId}][${key}]`, stringValue);
    });
  });
};

/**
 * Builds query parameters for the list entries endpoint.
 * Handles nested field_filters and proper boolean serialization.
 * 
 * @param query - The query object
 * @returns URLSearchParams ready for the request
 */
const buildQueryParams = (query: EntriesListQuery): URLSearchParams => {
  const params = new URLSearchParams();

  // Required params
  params.append('page', String(query.page));
  params.append('per_page', String(query.per_page));
  params.append('form_version_id', String(query.form_version_id));

  // Optional date filters
  if (query.date_from) {
    params.append('date_from', query.date_from);
  }
  if (query.date_to) {
    params.append('date_to', query.date_to);
  }
  if (query.date_type) {
    params.append('date_type', query.date_type);
  }

  // Optional boolean filter (API expects "1" or "0")
  if (query.is_considered !== undefined) {
    params.append('is_considered', query.is_considered ? '1' : '0');
  }

  // Field filters (nested structure)
  if (query.field_filters && Object.keys(query.field_filters).length > 0) {
    serializeFieldFilters(query.field_filters, params);
  }

  logger.info('Built query params:', params.toString());
  return params;
};

// ============================================================================
// Axios Instance Configuration
// ============================================================================

/**
 * Creates and configures the Axios instance for entries API calls.
 * Includes base URL, timeout, and default headers.
 */
const createAxiosInstance = (): AxiosInstance => {
  const instance = axios.create({
    baseURL: API_BASE_URL,
    timeout: API_TIMEOUT,
    headers: {
      'Content-Type': import.meta.env.VITE_API_CONTENT_TYPE,
      'Accept': import.meta.env.VITE_API_ACCEPT,
    },
  });

  // Request interceptor: Inject authentication token
  instance.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      const token = getAuthToken();

      if (!token) {
        logger.error('Request blocked: No authentication token available');
        // Reject the request if no token is available
        return Promise.reject(new AuthTokenError());
      }

      // Inject Bearer token (do NOT log the actual token value)
      config.headers.Authorization = `Bearer ${token}`;
      
      logger.info(`Request: ${config.method?.toUpperCase()} ${config.url}`);
      
      return config;
    },
    (error) => {
      logger.error('Request interceptor error:', error);
      return Promise.reject(error);
    }
  );

  // Response interceptor: Log successful responses
  instance.interceptors.response.use(
    (response) => {
      logger.info(`Response: ${response.status} ${response.config.url}`);
      return response;
    },
    (error) => {
      // Normalize and log errors (will be handled by caller)
      logger.error('Response error intercepted');
      return Promise.reject(error);
    }
  );

  return instance;
};

// Create singleton instance
const apiClient = createAxiosInstance();

// ============================================================================
// API Methods
// ============================================================================

/**
 * Fetches a paginated list of entries with optional filters.
 * 
 * @param query - Query parameters including pagination, filters, and form_version_id
 * @returns Promise resolving to the list of entries with pagination metadata
 * @throws {AuthTokenError} When authentication token is missing
 * @throws {NormalizedError} For network or HTTP errors
 * 
 * @example
 * const response = await listEntries({
 *   page: 1,
 *   per_page: 10,
 *   form_version_id: 77,
 *   date_from: '2025-01-01',
 *   is_considered: false,
 *   field_filters: {
 *     1454: { value: 'charlie' }
 *   }
 * });
 */
export const listEntries = async (
  query: EntriesListQuery
): Promise<ListEntriesResponse> => {
  try {
    logger.info('Fetching entries list', { query });

    // Build query parameters
    const params = buildQueryParams(query);
    console.log('params', params.toString());

    // Make GET request (NO request body for GET)
    const response = await apiClient.get<ListEntriesResponse>('/entries', {
      params,
      // Use custom serializer to preserve our URLSearchParams formatting
      paramsSerializer: () => params.toString(),
    });

    logger.info(`Successfully fetched ${response.data.data.length} entries`);
    
    return response.data;
  } catch (error) {
    // Normalize error and re-throw for handling by Redux thunk
    const normalizedError = normalizeError(error);
    logger.error('Failed to fetch entries:', normalizedError);
    throw normalizedError;
  }
};

// ============================================================================
// Exports
// ============================================================================

export default {
  listEntries,
};
