// formVersion.service.ts

/**
 * Production-ready Axios service layer for Form Version API operations
 * Handles all HTTP communication with clean error normalization and logging
 */

import axios, { type AxiosInstance, AxiosError, type InternalAxiosRequestConfig } from 'axios';
import type {
  GetFormVersionResponse,
  UpdateFormVersionRequest,
  UpdateFormVersionResponse,
  PublishFormVersionResponse,
  ServiceError,
  GetFormVersionResult,
  UpdateFormVersionResult,
  PublishFormVersionResult,
} from '../types';
import type { ApiSuccessResponse, FormVersion } from '../types';
import { loadToken } from '../../../auth/utils/tokenStorage';
import { store } from '@/store';

// ============================================================================
// Token Management
// ============================================================================

/**
 * Helper function to get authentication token with fallback
 * Attempts to retrieve token from Redux store first, then falls back to localStorage
 * @returns {string | null} Authentication token or null if not found
 */
const getAuthToken = (): string | null => {
  try {
    const state = store.getState();
    const reduxToken = state.auth?.token;
    
    if (reduxToken) {
      console.debug('[FormVersionService] Token retrieved from Redux store');
      return reduxToken;
    }
    
    const storedToken = loadToken();
    if (storedToken) {
      console.debug('[FormVersionService] Token retrieved from localStorage');
    }
    
    return storedToken;
  } catch (error) {
    console.error('[FormVersionService] Error retrieving auth token:', error);
    return null;
  }
};

// ============================================================================
// Axios Instance Configuration
// ============================================================================

/**
 * Configured Axios instance for Form Version API calls
 * Base URL: http://dforms.pnepizza.com/api
 * Timeout: 30 seconds
 */
const apiClient: AxiosInstance = axios.create({
  baseURL: 'http://dforms.pnepizza.com/api',
  timeout: 30000, // 30 seconds
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

/**
 * Request interceptor to attach authentication token
 * Runs before every request to ensure bearer token is included
 */
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getAuthToken();
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.debug(`[FormVersionService] Request: ${config.method?.toUpperCase()} ${config.url}`);
    } else {
      console.warn('[FormVersionService] No authentication token available for request');
    }
    
    return config;
  },
  (error: AxiosError) => {
    console.error('[FormVersionService] Request interceptor error:', error.message);
    return Promise.reject(error);
  }
);

/**
 * Response interceptor for logging and debugging
 */
apiClient.interceptors.response.use(
  (response) => {
    console.debug(
      `[FormVersionService] Response: ${response.status} from ${response.config.url}`
    );
    return response;
  },
  (error: AxiosError) => {
    // Error handling is done in normalizeError, just pass through
    return Promise.reject(error);
  }
);

// ============================================================================
// Error Normalization
// ============================================================================

/**
 * Normalizes Axios errors into a consistent ServiceError structure
 * Handles network errors, HTTP errors, and unexpected errors
 * 
 * @param {unknown} error - Error object from Axios or other source
 * @param {string} operation - Name of the operation that failed (for logging)
 * @returns {ServiceError} Normalized error object
 */
const normalizeError = (error: unknown, operation: string): ServiceError => {
  console.error(`[FormVersionService] Error in ${operation}:`, error);

  // Handle Axios errors
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<{ message?: string; errors?: unknown }>;
    
    // Network or timeout error
    if (!axiosError.response) {
      return {
        message: axiosError.message || 'Network error occurred',
        statusCode: 0,
        details: {
          code: axiosError.code,
          operation,
        },
      };
    }

    // HTTP error with response
    const { status, data } = axiosError.response;
    
    return {
      message: data?.message || axiosError.message || `HTTP ${status} error`,
      statusCode: status,
      details: {
        errors: data?.errors,
        operation,
        url: axiosError.config?.url,
      },
    };
  }

  // Handle non-Axios errors
  if (error instanceof Error) {
    return {
      message: error.message,
      details: { operation },
    };
  }

  // Fallback for unknown error types
  return {
    message: 'An unknown error occurred',
    details: { error, operation },
  };
};

// ============================================================================
// Service Methods
// ============================================================================

/**
 * Retrieves a specific form version by ID
 * 
 * GET /api/form-versions/{id}
 * 
 * @param {number} id - Form version ID
 * @returns {Promise<GetFormVersionResult>} Complete form version with stages and transitions
 * @throws {ServiceError} Normalized error if request fails
 * 
 * @example
 * const formVersion = await getFormVersion(4);
 * console.log(formVersion.stages); // Array of stages
 */
export const getFormVersion = async (id: number): Promise<GetFormVersionResult> => {
  try {
    console.info(`[FormVersionService] Fetching form version with ID: ${id}`);

    const response = await apiClient.get<GetFormVersionResponse>(
      `/form-versions/${id}`
    );

    console.info(
      `[FormVersionService] Successfully fetched form version ${id} ` +
      `(status: ${response.data.data.status}, version: ${response.data.data.version_number})`
    );

    return response.data.data;
  } catch (error) {
    const normalizedError = normalizeError(error, 'getFormVersion');
    console.error(
      `[FormVersionService] Failed to fetch form version ${id}:`,
      normalizedError.message
    );
    throw normalizedError;
  }
};

/**
 * Updates a form version with new configuration
 * 
 * PUT /api/form-versions/{id}
 * 
 * Note: This endpoint returns the request body structure directly without a success wrapper
 * 
 * @param {number} id - Form version ID
 * @param {UpdateFormVersionRequest} data - Updated stages and transitions
 * @returns {Promise<UpdateFormVersionResult>} Updated form version data
 * @throws {ServiceError} Normalized error if request fails
 * 
 * @example
 * const result = await updateFormVersion(4, {
 *   stages: [...],
 *   stage_transitions: [...]
 * });
 */
export const updateFormVersion = async (
  id: number,
  data: UpdateFormVersionRequest
): Promise<UpdateFormVersionResult> => {
  try {
    console.info(
      `[FormVersionService] Updating form version ${id} with ` +
      `${data.stages.length} stages and ${data.stage_transitions.length} transitions`
    );

    const response = await apiClient.put<UpdateFormVersionResponse>(
      `/form-versions/${id}`,
      data
    );

    console.info(
      `[FormVersionService] Successfully updated form version ${id}`
    );

    return response.data;
  } catch (error) {
    const normalizedError = normalizeError(error, 'updateFormVersion');
    console.error(
      `[FormVersionService] Failed to update form version ${id}:`,
      normalizedError.message
    );
    throw normalizedError;
  }
};

/**
 * Publishes a draft form version, making it live and available for submissions
 * 
 * POST /api/form-versions/{id}/publish
 * 
 * @param {number} id - Form version ID
 * @returns {Promise<PublishFormVersionResult>} Published form version metadata
 * @throws {ServiceError} Normalized error if request fails
 * 
 * @example
 * const published = await publishFormVersion(4);
 * console.log(published.status); // 'published'
 * console.log(published.published_at); // '2025-12-02T17:06:51.000000Z'
 */
export const publishFormVersion = async (
  id: number
): Promise<PublishFormVersionResult> => {
  try {
    console.info(`[FormVersionService] Publishing form version ${id}`);

    const response = await apiClient.post<PublishFormVersionResponse>(
      `/form-versions/${id}/publish`
    );

    console.info(
      `[FormVersionService] Successfully published form version ${id} ` +
      `at ${response.data.data.published_at}`
    );

    return response.data.data;
  } catch (error) {
    const normalizedError = normalizeError(error, 'publishFormVersion');
    console.error(
      `[FormVersionService] Failed to publish form version ${id}:`,
      normalizedError.message
    );
    throw normalizedError;
  }
};

/**
 * Creates a new form version for a given form
 * 
 * POST /api/forms/{formId}/versions
 * 
 * @param formId - Parent form ID
 * @returns Newly created form version metadata
 */
export const createFormVersion = async (
  formId: number
): Promise<FormVersion> => {
  try {
    console.info(`[FormVersionService] Creating new form version for form ${formId}`);

    const response = await apiClient.post<ApiSuccessResponse<FormVersion>>(
      `/forms/${formId}/versions`
    );

    console.info(
      `[FormVersionService] Created form version ${response.data.data.id} ` +
      `(#${response.data.data.version_number}) for form ${formId}`
    );

    return response.data.data;
  } catch (error) {
    const normalizedError = normalizeError(error, 'createFormVersion');
    console.error(
      `[FormVersionService] Failed to create form version for form ${formId}:`,
      normalizedError.message
    );
    throw normalizedError;
  }
};

// ============================================================================
// Export Service Object (Alternative API)
// ============================================================================

/**
 * Service object for alternative import style
 * Use either named exports or this default export
 * 
 * @example
 * import formVersionService from './formVersion.service';
 * const version = await formVersionService.getFormVersion(4);
 */
export const formVersionService = {
  getFormVersion,
  updateFormVersion,
  publishFormVersion,
  createFormVersion,
};

export default formVersionService;
