/**
 * API Service Layer for User Roles Store Assignment feature
 * 
 * This file contains all API calls using Axios with proper typing,
 * token management, error handling, and reusable utilities.
 * 
 * @author Your Team
 * @version 1.0.0
 */

import axios, { AxiosError } from 'axios';
import type{ AxiosInstance, AxiosResponse  } from 'axios';
import { store } from '../../../store'; // Adjust path to your store
import { loadToken } from '../../auth/utils/tokenStorage'; // Adjust path as needed
import type {
  // Request types
  AssignUserRoleRequest,
  RemoveToggleUserRoleRequest,
  BulkAssignUserRolesRequest,
  GetStoreAssignmentsParams,
  GetUserAssignmentsParams,
  
  // Response types
  AssignUserRoleResponse,
  RemoveToggleUserRoleResponse,
  BulkAssignUserRolesResponse,
  GetAssignmentsResponse,
  OperationResult,
  
  // Utility types
  ErrorState,
  
} from '../types';
import { API_ENDPOINTS, HTTP_METHODS } from '../types';

// ==================== Configuration ====================

/**
 * Base URL for the authentication API
 */
const BASE_URL = import.meta.env.VITE_AUTH_API_BASE_URL;

/**
 * Default timeout for API requests (in milliseconds)
 */
const DEFAULT_TIMEOUT = import.meta.env.VITE_API_TIMEOUT; // 5 seconds

/**
 * Maximum number of retry attempts for failed requests
 */
const MAX_RETRY_ATTEMPTS = 3;

// ==================== Token Management ====================

/**
 * Helper function to get authentication token from Redux store or localStorage fallback
 * @returns {string | null} The authentication token or null if not found
 */
const getAuthToken = (): string | null => {
  try {
    // First, try to get token from Redux store
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



// ==================== Axios Instance Configuration ====================

/**
 * Create and configure the main Axios instance for API calls
 */
const apiClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: DEFAULT_TIMEOUT,
  headers: {
    'Accept': import.meta.env.VITE_API_ACCEPT,
    'Content-Type': import.meta.env.VITE_API_CONTENT_TYPE
  }
});

/**
 * Request interceptor to add authentication headers
 */
apiClient.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (token && config.headers) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

/**
 * Response interceptor for consistent error handling
 */
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // Log successful response in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`API Response: ${response.status}`, response.data);
    }
    
    return response;
  },
  (error: AxiosError) => {
    // Handle different types of errors
    const errorResponse = handleApiError(error);
    
    // Log error in development
    if (process.env.NODE_ENV === 'development') {
      console.error('API Error:', errorResponse);
    }
    
    return Promise.reject(errorResponse);
  }
);

// ==================== Error Handling ====================

/**
 * Type for API error data structure
 */
interface ApiErrorData {
  message?: string;
  errors?: Record<string, string[]>;
  [key: string]: any;
}

/**
 * Standardized error handling for API responses
 * @param {AxiosError} error - The Axios error object
 * @returns {ErrorState} Formatted error state
 */
const handleApiError = (error: AxiosError): ErrorState => {
  const timestamp = new Date().toISOString();
  
  // Network error (no response received)
  if (!error.response) {
    return {
      message: error.message || 'Network error occurred',
      code: 'NETWORK_ERROR',
      details: {
        originalError: error.message,
        stack: error.stack
      },
      timestamp
    };
  }
  
  // HTTP error with response
  const { status, data } = error.response;
  const errorData = data as ApiErrorData;
  
  // Handle specific HTTP status codes
  switch (status) {
    case 401:
      return {
        message: 'Authentication required. Please log in again.',
        code: 'UNAUTHORIZED',
        details: errorData,
        timestamp
      };
      
    case 403:
      return {
        message: 'Access forbidden. You do not have permission to perform this action.',
        code: 'FORBIDDEN',
        details: errorData,
        timestamp
      };
      
    case 404:
      return {
        message: 'Resource not found.',
        code: 'NOT_FOUND',
        details: errorData,
        timestamp
      };
      
    case 422:
      return {
        message: errorData?.message || 'Validation error occurred.',
        code: 'VALIDATION_ERROR',
        details: errorData?.errors || errorData,
        timestamp
      };
      
    case 429:
      return {
        message: 'Too many requests. Please try again later.',
        code: 'RATE_LIMITED',
        details: errorData,
        timestamp
      };
      
    case 500:
      return {
        message: 'Internal server error. Please try again later.',
        code: 'INTERNAL_SERVER_ERROR',
        details: errorData,
        timestamp
      };
      
    default:
      return {
        message: errorData?.message || error.message || 'An unexpected error occurred',
        code: status.toString(),
        details: errorData,
        timestamp
      };
  }
};

/**
 * Retry mechanism for failed requests
 * @param {Function} apiCall - The API call function to retry
 * @param {number} attempts - Number of retry attempts remaining
 * @returns {Promise} The API call result
 */
const retryApiCall = async <T>(
  apiCall: () => Promise<T>,
  attempts: number = MAX_RETRY_ATTEMPTS
): Promise<T> => {
  try {
    return await apiCall();
  } catch (error) {
    if (attempts > 0) {
      // Wait before retrying (exponential backoff)
      const delay = (MAX_RETRY_ATTEMPTS - attempts + 1) * 1000;
      await new Promise(resolve => setTimeout(resolve, delay));
      
      return retryApiCall(apiCall, attempts - 1);
    }
    
    throw error;
  }
};

// ==================== API Service Functions ====================

/**
 * Generic API call wrapper with consistent error handling and typing
 * @param {string} endpoint - API endpoint
 * @param {string} method - HTTP method
 * @param {any} data - Request payload (optional)
 * @param {Record<string, any>} params - Query parameters (optional)
 * @returns {Promise<OperationResult<T>>} Typed operation result
 */
const makeApiCall = async <T>(
  endpoint: string,
  method: string,
  data?: any,
  params?: Record<string, any>
): Promise<OperationResult<T>> => {
  try {
    const response: AxiosResponse<T> = await apiClient({
      url: endpoint,
      method: method as any,
      data,
      params
    });
    
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    return {
      success: false,
      error: error as ErrorState
    };
  }
};

/**
 * Assign a user role to a store
 * @param {AssignUserRoleRequest} payload - Assignment request payload
 * @returns {Promise<OperationResult<AssignUserRoleResponse>>} Assignment result
 */
export const assignUserRoleToStore = async (
  payload: AssignUserRoleRequest
): Promise<OperationResult<AssignUserRoleResponse>> => {
  return retryApiCall(() =>
    makeApiCall<AssignUserRoleResponse>(
      API_ENDPOINTS.ASSIGN,
      HTTP_METHODS.POST,
      payload
    )
  );
};

/**
 * Remove a user role from a store
 * @param {RemoveToggleUserRoleRequest} payload - Remove request payload
 * @returns {Promise<OperationResult<RemoveToggleUserRoleResponse>>} Remove result
 */
export const removeUserRoleFromStore = async (
  payload: RemoveToggleUserRoleRequest
): Promise<OperationResult<RemoveToggleUserRoleResponse>> => {
  return retryApiCall(() =>
    makeApiCall<RemoveToggleUserRoleResponse>(
      API_ENDPOINTS.REMOVE,
      HTTP_METHODS.POST,
      payload
    )
  );
};

/**
 * Toggle user role status in a store
 * @param {RemoveToggleUserRoleRequest} payload - Toggle request payload
 * @returns {Promise<OperationResult<RemoveToggleUserRoleResponse>>} Toggle result
 */
export const toggleUserRoleStoreStatus = async (
  payload: RemoveToggleUserRoleRequest
): Promise<OperationResult<RemoveToggleUserRoleResponse>> => {
  return retryApiCall(() =>
    makeApiCall<RemoveToggleUserRoleResponse>(
      API_ENDPOINTS.TOGGLE,
      HTTP_METHODS.POST,
      payload
    )
  );
};

/**
 * Bulk assign user roles to multiple stores
 * @param {BulkAssignUserRolesRequest} payload - Bulk assignment request payload
 * @returns {Promise<OperationResult<BulkAssignUserRolesResponse>>} Bulk assignment result
 */
export const bulkAssignUserRoles = async (
  payload: BulkAssignUserRolesRequest
): Promise<OperationResult<BulkAssignUserRolesResponse>> => {
  return retryApiCall(() =>
    makeApiCall<BulkAssignUserRolesResponse>(
      API_ENDPOINTS.BULK_ASSIGN,
      HTTP_METHODS.POST,
      payload
    )
  );
};

/**
 * Get all assignments for a specific store
 * @param {GetStoreAssignmentsParams} params - Store query parameters
 * @returns {Promise<OperationResult<GetAssignmentsResponse>>} Store assignments result
 */
export const getStoreAssignments = async (
  params: GetStoreAssignmentsParams
): Promise<OperationResult<GetAssignmentsResponse>> => {
  return retryApiCall(() =>
    makeApiCall<GetAssignmentsResponse>(
      API_ENDPOINTS.STORE_ASSIGNMENTS,
      HTTP_METHODS.GET,
      undefined,
      params
    )
  );
};

/**
 * Get all assignments for a specific user
 * @param {GetUserAssignmentsParams} params - User query parameters
 * @returns {Promise<OperationResult<GetAssignmentsResponse>>} User assignments result
 */
export const getUserAssignments = async (
  params: GetUserAssignmentsParams
): Promise<OperationResult<GetAssignmentsResponse>> => {
  return retryApiCall(() =>
    makeApiCall<GetAssignmentsResponse>(
      API_ENDPOINTS.USER_ASSIGNMENTS,
      HTTP_METHODS.GET,
      undefined,
      params
    )
  );
};

// ==================== Utility Functions ====================

/**
 * Check if the current user is authenticated
 * @returns {boolean} Authentication status
 */
export const isAuthenticated = (): boolean => {
  const token = getAuthToken();
  return token !== null && token.length > 0;
};

/**
 * Clear authentication and force re-login
 * This can be called when encountering 401 errors
 */
export const clearAuthenticationAndRedirect = (): void => {
  try {
    // Clear token from Redux store
    store.dispatch({ type: 'auth/logout' }); // Adjust based on your auth slice
    
    // Clear localStorage
    localStorage.removeItem('auth_token');
    
    // Redirect to login page
    window.location.href = '/login';
  } catch (error) {
    console.error('Error during authentication cleanup:', error);
  }
};

/**
 * Health check for API connectivity
 * @returns {Promise<boolean>} API health status
 */
export const checkApiHealth = async (): Promise<boolean> => {
  try {
    const response = await axios.get(`${BASE_URL}/health`, {
      timeout: 5000
    });
    return response.status === 200;
  } catch (error) {
    console.error('API health check failed:', error);
    return false;
  }
};

/**
 * Get API base URL (useful for development/staging environments)
 * @returns {string} Current API base URL
 */
export const getApiBaseUrl = (): string => {
  return BASE_URL;
};

// ==================== Export API Client for Advanced Usage ====================

/**
 * Export the configured Axios instance for advanced usage
 * Use this when you need direct access to the HTTP client
 */
export { apiClient };

/**
 * Default export object with all API functions
 */
const userRoleStoreAssignmentApi = {
  assignUserRoleToStore,
  removeUserRoleFromStore,
  toggleUserRoleStoreStatus,
  bulkAssignUserRoles,
  getStoreAssignments,
  getUserAssignments,
  isAuthenticated,
  clearAuthenticationAndRedirect,
  checkApiHealth,
  getApiBaseUrl
};

export default userRoleStoreAssignmentApi;
