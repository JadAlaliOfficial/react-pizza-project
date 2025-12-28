/**
 * API Service Layer for Authorization Rules Management
 *
 * This service handles all HTTP communication with the auth rules API:
 * - Axios instance with request/response interceptors
 * - Token management with Redux fallback to localStorage
 * - Comprehensive error handling and transformation
 * - Type-safe API methods for all 5 endpoints
 *
 * Design decisions:
 * - Uses dedicated axios instance for auth rules API
 * - Centralizes error handling and transforms API errors to standardized format
 * - Implements token injection via interceptors
 * - Provides clean async/await interface for components
 */

import axios, { AxiosError } from 'axios';
import type { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { store } from '@/store'; // Adjust path to your store
import { loadToken } from '@/features/auth/utils/tokenStorage'; // Adjust path as needed
import type {
  FetchAuthRulesParams,
  FetchAuthRulesResponse,
  CreateAuthRuleRequest,
  CreateAuthRuleResponse,
  TestAuthRuleRequest,
  TestAuthRuleResponse,
  ToggleAuthRuleStatusResponse,
  ApiResponse,
  StandardizedError,
  ApiErrorType,
  ValidationError,
} from '../types';
import { isApiErrorResponse } from '../types';

// ============================================================================
// CONFIGURATION & SETUP
// ============================================================================

/**
 * Base URL for auth rules API
 * In production, this should come from environment variables
 */
const API_BASE_URL = import.meta.env.VITE_AUTH_API_BASE_URL;

/**
 * Helper function to get authentication token with fallback
 * First tries Redux store, then falls back to localStorage decryption
 */
const getAuthToken = (): string | null => {
  try {
    const state = store.getState();
    const reduxToken = state.auth?.token;
    if (reduxToken) {
      return reduxToken;
    }
    // Fallback to decrypt token from localStorage
    return loadToken();
  } catch (error) {
    console.error('Error retrieving auth token:', error);
    return null;
  }
};

/**
 * Create dedicated axios instance for auth rules API
 */
const authRulesApiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: Number(import.meta.env.VITE_API_TIMEOUT),
  headers: {
    'Accept': import.meta.env.VITE_API_ACCEPT,
    'Content-Type': import.meta.env.VITE_API_CONTENT_TYPE,
  },
});

// ============================================================================
// AXIOS INTERCEPTORS
// ============================================================================

/**
 * Request interceptor to add auth token and handle common headers
 */
authRulesApiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getAuthToken();
    if (token && config.headers) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }

    // Log request for debugging (remove in production)
    console.log(
      `🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`,
      {
        headers: config.headers,
        data: config.data,
      },
    );

    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  },
);

/**
 * Response interceptor to handle common error scenarios and transform errors
 */
authRulesApiClient.interceptors.response.use(
  (response) => {
    // Log successful responses for debugging (remove in production)
    console.log(
      `✅ API Response: ${response.config.method?.toUpperCase()} ${response.config.url}`,
      response.data,
    );
    return response;
  },
  (error: AxiosError) => {
    console.error('API Error:', error);

    // Transform axios error to standardized error format
    const standardizedError = transformApiError(error);

    // Reject with standardized error instead of axios error
    return Promise.reject(standardizedError);
  },
);

// ============================================================================
// ERROR HANDLING UTILITIES
// ============================================================================

/**
 * Transform axios error to standardized error format
 * Handles different error scenarios and provides consistent error structure
 */
const transformApiError = (error: AxiosError): StandardizedError => {
  // Network errors (no response received)
  if (!error.response) {
    return {
      type: 'network_error',
      message: 'Network error - please check your connection',
      details: error.message,
    };
  }

  const { status, data } = error.response;
  const responseData = data as ApiResponse;

  // Handle different HTTP status codes
  switch (status) {
    case 400:
      // Invalid DSL or other bad request errors
      return {
        type: 'invalid_dsl',
        message: isApiErrorResponse(responseData)
          ? responseData.message
          : 'Invalid request',
        details: isApiErrorResponse(responseData)
          ? responseData.error
          : undefined,
        statusCode: status,
      };

    case 401:
      return {
        type: 'unauthorized',
        message: 'Authentication required - please login again',
        statusCode: status,
      };

    case 403:
      return {
        type: 'forbidden',
        message: 'Insufficient permissions to perform this action',
        statusCode: status,
      };

    case 404:
      return {
        type: 'not_found',
        message: 'The requested resource was not found',
        statusCode: status,
      };

    case 422:
      // Laravel validation errors
      const validationErrors: ValidationError[] = [];
      if (isApiErrorResponse(responseData) && responseData.errors) {
        Object.entries(responseData.errors).forEach(([field, messages]) => {
          validationErrors.push({ field, messages });
        });
      }

      return {
        type: 'validation',
        message: 'Please fix the validation errors and try again',
        validationErrors,
        statusCode: status,
      };

    case 500:
    case 502:
    case 503:
    case 504:
      return {
        type: 'server_error',
        message: 'Server error - please try again later',
        details: isApiErrorResponse(responseData)
          ? responseData.message
          : undefined,
        statusCode: status,
      };

    default:
      return {
        type: 'unknown',
        message: 'An unexpected error occurred',
        details: isApiErrorResponse(responseData)
          ? responseData.message
          : undefined,
        statusCode: status,
      };
  }
};

// ============================================================================
// API SERVICE METHODS
// ============================================================================

/**
 * Auth Rules API Service
 * Provides typed methods for all auth rules operations
 */
export const authRulesService = {
  /**
   * Fetch all authorization rules with optional filtering and pagination
   * GET /api/v1/auth-rules
   */
  async fetchAuthRules(
    params: FetchAuthRulesParams = {},
  ): Promise<FetchAuthRulesResponse> {
    try {
      const response = await authRulesApiClient.get<FetchAuthRulesResponse>(
        '/auth-rules',
        {
          params: {
            service: params.service || '',
            search: params.search || '',
            page: params.page || 1,
            per_page: params.per_page || 15,
          },
        },
      );

      return response.data;
    } catch (error) {
      console.error('Failed to fetch auth rules:', error);
      throw error; // Re-throw standardized error from interceptor
    }
  },

  /**
   * Create a new authorization rule
   * POST /api/v1/auth-rules
   *
   * @param ruleData - Rule data with either path_dsl or route_name
   */
  async createAuthRule(
    ruleData: CreateAuthRuleRequest,
  ): Promise<CreateAuthRuleResponse> {
    try {
      // Validate that at least one authorization method is provided
      const hasRoles = ruleData.roles_any?.length && ruleData.roles_any.length > 0;
      const hasPermissionsAny = ruleData.permissions_any?.length && ruleData.permissions_any.length > 0;
      const hasPermissionsAll = ruleData.permissions_all?.length && ruleData.permissions_all.length > 0;

      if (!hasRoles && !hasPermissionsAny && !hasPermissionsAll) {
        throw new Error(
          'At least one authorization requirement must be specified (roles_any, permissions_any, or permissions_all)',
        );
      }

      const response = await authRulesApiClient.post<CreateAuthRuleResponse>(
        '/auth-rules',
        ruleData,
      );
      return response.data;
    } catch (error) {
      console.error('Failed to create auth rule:', error);
      throw error;
    }
  },

  /**
   * Test if a path matches a path DSL pattern
   * POST /api/v1/auth-rules/test
   *
   * @param testData - Path DSL and test path to validate
   */
  async testAuthRule(
    testData: TestAuthRuleRequest,
  ): Promise<TestAuthRuleResponse> {
    try {
      const response = await authRulesApiClient.post<TestAuthRuleResponse>(
        '/auth-rules/test',
        testData,
      );
      return response.data;
    } catch (error) {
      console.error('Failed to test auth rule:', error);
      throw error;
    }
  },

  /**
   * Toggle the active status of an authorization rule
   * POST /api/v1/auth-rules/{id}/toggle-status
   *
   * @param ruleId - ID of the rule to toggle
   */
  async toggleAuthRuleStatus(
    ruleId: number,
  ): Promise<ToggleAuthRuleStatusResponse> {
    try {
      if (!ruleId || ruleId <= 0) {
        throw new Error('Valid rule ID is required');
      }

      const response =
        await authRulesApiClient.post<ToggleAuthRuleStatusResponse>(
          `/auth-rules/${ruleId}/toggle-status`,
        );
      return response.data;
    } catch (error) {
      console.error(
        `Failed to toggle auth rule status for ID ${ruleId}:`,
        error,
      );
      throw error;
    }
  },

  /**
   * Delete an authorization rule
   * DELETE /api/v1/auth-rules/{id}
   *
   * Note: This endpoint wasn't mentioned in requirements but commonly needed
   * Remove if not supported by your API
   */
  async deleteAuthRule(
    ruleId: number,
  ): Promise<{ success: boolean; message: string }> {
    try {
      if (!ruleId || ruleId <= 0) {
        throw new Error('Valid rule ID is required');
      }

      const response = await authRulesApiClient.delete(`/auth-rules/${ruleId}`);
      return response.data;
    } catch (error) {
      console.error(`Failed to delete auth rule with ID ${ruleId}:`, error);
      throw error;
    }
  },
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Helper function to check if an error is a specific type
 * Useful for conditional error handling in components
 */
export const isErrorType = (error: unknown, type: ApiErrorType): boolean => {
  return (error as StandardizedError)?.type === type;
};

/**
 * Extract validation errors for a specific field
 * Useful for displaying field-specific errors in forms
 */
export const getValidationErrorsForField = (
  error: StandardizedError | null,
  fieldName: string,
): string[] => {
  if (!error || error.type !== 'validation' || !error.validationErrors) {
    return [];
  }

  const fieldError = error.validationErrors.find(
    (ve) => ve.field === fieldName,
  );
  return fieldError ? fieldError.messages : [];
};

/**
 * Get a user-friendly error message for display
 * Provides fallback messages for different error types
 */
export const getDisplayErrorMessage = (
  error: StandardizedError | null,
): string => {
  if (!error) return '';

  switch (error.type) {
    case 'validation':
      return 'Please fix the highlighted errors and try again.';
    case 'unauthorized':
      return 'Your session has expired. Please login again.';
    case 'forbidden':
      return "You don't have permission to perform this action.";
    case 'network_error':
      return 'Connection failed. Please check your internet connection.';
    case 'server_error':
      return 'Server error. Please try again in a moment.';
    case 'invalid_dsl':
      return error.details || 'Invalid path pattern syntax.';
    default:
      return error.message || 'An unexpected error occurred.';
  }
};

// Export the configured axios instance for
