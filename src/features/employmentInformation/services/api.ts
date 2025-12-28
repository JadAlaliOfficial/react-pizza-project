/**
 * @fileoverview Centralized Axios service for Employment Information CRUD operations
 * @description Handles all HTTP requests with proper typing, authentication, and error handling
 */

import axios, {  AxiosError } from 'axios';
import type  { AxiosInstance, AxiosResponse } from 'axios';
import { store } from '../../../store'; // Adjust path as needed
import { loadToken } from '../../auth/utils/tokenStorage';
import type {
  GetAllEmploymentInformationResponse,
  GetEmploymentInformationByIdResponse,
  CreateEmploymentInformationRequest,
  CreateEmploymentInformationResponse,
  UpdateEmploymentInformationRequest,
  UpdateEmploymentInformationResponse,
  ApiError,
} from '../types';

// ============================================================================
// Configuration Constants
// ============================================================================

/**
 * Base API configuration
 */
const API_CONFIG = {
  baseURL: import.meta.env.VITE_EMPLOYEMENT_INFO_NOT_WORKING_API_BASE_URL,
  timeout: Number(import.meta.env.VITE_API_TIMEOUT), 
  headers: {
    'Accept': import.meta.env.VITE_API_ACCEPT,
    'Content-Type': import.meta.env.VITE_API_CONTENT_TYPE,
  },
} as const;

/**
 * Employment Information API endpoints
 */
const ENDPOINTS = {
  EMPLOYMENT_INFO: '/employment-info',
  EMPLOYMENT_INFO_BY_ID: (id: number) => `/employment-info/${id}`,
} as const;

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Helper function to get authentication token with fallback
 * @returns Authentication token or null if not available
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
 * Creates formatted error response from Axios error
 * @param error - Axios error object
 * @returns Formatted API error
 */
const createApiError = (error: AxiosError): ApiError => {
  if (error.response?.data) {
    // Server responded with error status
    const serverError = error.response.data as any;
    return {
      message: serverError.message || 'An error occurred',
      code: error.response.status.toString(),
      errors: serverError.errors || undefined,
    };
  } else if (error.request) {
    // Request was made but no response received
    return {
      message: 'Network error - please check your connection',
      code: 'NETWORK_ERROR',
    };
  } else {
    // Something else happened
    return {
      message: error.message || 'An unexpected error occurred',
      code: 'UNKNOWN_ERROR',
    };
  }
};

/**
 * Logs API errors with context information
 * @param operation - The operation that failed
 * @param error - The error that occurred
 * @param additionalContext - Additional context for debugging
 */
const logApiError = (operation: string, error: ApiError, additionalContext?: any): void => {
  console.error(`[EmploymentInformationAPI] ${operation} failed:`, {
    error,
    context: additionalContext,
    timestamp: new Date().toISOString(),
  });
};

// ============================================================================
// Axios Instance Configuration
// ============================================================================

/**
 * Configured Axios instance for Employment Information API
 */
const apiClient: AxiosInstance = axios.create(API_CONFIG);

/**
 * Request interceptor to automatically add authentication headers
 */
apiClient.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Log request details in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`, {
        headers: config.headers,
        data: config.data,
      });
    }
    
    return config;
  },
  (error) => {
    console.error('[API Request Interceptor] Request setup failed:', error);
    return Promise.reject(error);
  }
);

/**
 * Response interceptor for global error handling and logging
 */
apiClient.interceptors.response.use(
  (response) => {
    // Log successful responses in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`[API Response] ${response.config.method?.toUpperCase()} ${response.config.url}`, {
        status: response.status,
        data: response.data,
      });
    }
    return response;
  },
  (error: AxiosError) => {
    const apiError = createApiError(error);
    
    // Handle specific HTTP status codes
    switch (error.response?.status) {
      case 401:
        console.warn('[API] Unauthorized access - token may be expired');
        // Could dispatch logout action here if needed
        break;
      case 403:
        console.warn('[API] Forbidden access - insufficient permissions');
        break;
      case 404:
        console.warn('[API] Resource not found');
        break;
      case 422:
        console.warn('[API] Validation error:', apiError.errors);
        break;
      case 500:
        console.error('[API] Internal server error');
        break;
      default:
        console.error('[API] Unexpected error:', apiError);
    }
    
    return Promise.reject(apiError);
  }
);

// ============================================================================
// API Service Class
// ============================================================================

/**
 * Employment Information API service class
 * @description Centralized service for all employment information CRUD operations
 */
export class EmploymentInformationApiService {
  /**
   * Fetches all employment information records
   * @returns Promise resolving to array of employment information
   * @throws {ApiError} When the request fails
   */
  static async getAll(): Promise<GetAllEmploymentInformationResponse> {
    try {
      const response: AxiosResponse<GetAllEmploymentInformationResponse> = await apiClient.get(
        ENDPOINTS.EMPLOYMENT_INFO
      );
      
      console.log(`[EmploymentInformationAPI] Successfully fetched ${response.data.length} records`);
      return response.data;
    } catch (error) {
      const apiError = error as ApiError;
      logApiError('getAll', apiError);
      throw apiError;
    }
  }

  /**
   * Fetches a single employment information record by ID
   * @param id - The employment information ID
   * @returns Promise resolving to employment information record
   * @throws {ApiError} When the request fails
   */
  static async getById(id: number): Promise<GetEmploymentInformationByIdResponse> {
    try {
      if (!id || id <= 0) {
        throw new Error('Invalid employment information ID provided');
      }

      const response: AxiosResponse<GetEmploymentInformationByIdResponse> = await apiClient.get(
        ENDPOINTS.EMPLOYMENT_INFO_BY_ID(id)
      );
      
      console.log(`[EmploymentInformationAPI] Successfully fetched record with ID: ${id}`);
      return response.data;
    } catch (error) {
      const apiError = error instanceof Error ? 
        { message: error.message, code: 'VALIDATION_ERROR' } as ApiError : 
        error as ApiError;
      logApiError('getById', apiError, { id });
      throw apiError;
    }
  }

  /**
   * Creates a new employment information record
   * @param data - The employment information data to create
   * @returns Promise resolving to created employment information
   * @throws {ApiError} When the request fails
   */
  static async create(data: CreateEmploymentInformationRequest): Promise<CreateEmploymentInformationResponse> {
    try {
      // Validate required fields
      if (!data.emp_info_id) {
        throw new Error('Employee info ID is required');
      }
      if (!data.paychex_ids || data.paychex_ids.length === 0) {
        throw new Error('At least one Paychex ID is required');
      }
      if (!data.employment_type) {
        throw new Error('Employment type is required');
      }

      const response: AxiosResponse<CreateEmploymentInformationResponse> = await apiClient.post(
        ENDPOINTS.EMPLOYMENT_INFO,
        data
      );
      
      console.log(`[EmploymentInformationAPI] Successfully created record with ID: ${response.data.id}`);
      return response.data;
    } catch (error) {
      const apiError = error instanceof Error ? 
        { message: error.message, code: 'VALIDATION_ERROR' } as ApiError : 
        error as ApiError;
      logApiError('create', apiError, { data });
      throw apiError;
    }
  }

  /**
   * Updates an existing employment information record
   * @param id - The employment information ID to update
   * @param data - The updated employment information data
   * @returns Promise resolving to updated employment information
   * @throws {ApiError} When the request fails
   */
  static async update(
    id: number, 
    data: UpdateEmploymentInformationRequest
  ): Promise<UpdateEmploymentInformationResponse> {
    try {
      if (!id || id <= 0) {
        throw new Error('Invalid employment information ID provided');
      }

      // Validate required fields
      if (!data.emp_info_id) {
        throw new Error('Employee info ID is required');
      }
      if (!data.paychex_ids || data.paychex_ids.length === 0) {
        throw new Error('At least one Paychex ID is required');
      }
      if (!data.employment_type) {
        throw new Error('Employment type is required');
      }

      const response: AxiosResponse<UpdateEmploymentInformationResponse> = await apiClient.put(
        ENDPOINTS.EMPLOYMENT_INFO_BY_ID(id),
        data
      );
      
      console.log(`[EmploymentInformationAPI] Successfully updated record with ID: ${id}`);
      return response.data;
    } catch (error) {
      const apiError = error instanceof Error ? 
        { message: error.message, code: 'VALIDATION_ERROR' } as ApiError : 
        error as ApiError;
      logApiError('update', apiError, { id, data });
      throw apiError;
    }
  }

  /**
   * Deletes an employment information record by ID
   * @param id - The employment information ID to delete
   * @returns Promise resolving to success boolean
   * @throws {ApiError} When the request fails
   */
  static async delete(id: number): Promise<boolean> {
    try {
      if (!id || id <= 0) {
        throw new Error('Invalid employment information ID provided');
      }

      await apiClient.delete(ENDPOINTS.EMPLOYMENT_INFO_BY_ID(id));
      
      console.log(`[EmploymentInformationAPI] Successfully deleted record with ID: ${id}`);
      return true;
    } catch (error) {
      const apiError = error instanceof Error ? 
        { message: error.message, code: 'VALIDATION_ERROR' } as ApiError : 
        error as ApiError;
      logApiError('delete', apiError, { id });
      throw apiError;
    }
  }

  /**
   * Validates employment information data before sending to API
   * @param data - The data to validate
   * @returns Array of validation errors (empty if valid)
   */
  static validateEmploymentData(
    data: CreateEmploymentInformationRequest | UpdateEmploymentInformationRequest
  ): string[] {
    const errors: string[] = [];

    if (!data.emp_info_id) {
      errors.push('Employee info ID is required');
    }

    if (!data.paychex_ids || !Array.isArray(data.paychex_ids) || data.paychex_ids.length === 0) {
      errors.push('At least one Paychex ID is required');
    }

    if (!data.employment_type || !['1099', 'W2'].includes(data.employment_type)) {
      errors.push('Employment type must be either "1099" or "W2"');
    }

    if (!data.hired_date) {
      errors.push('Hired date is required');
    }

    if (!data.base_pay || parseFloat(data.base_pay) < 0) {
      errors.push('Base pay must be a positive number');
    }

    if (!data.performance_pay || parseFloat(data.performance_pay) < 0) {
      errors.push('Performance pay must be a positive number');
    }

    if (typeof data.has_uniform !== 'boolean') {
      errors.push('Has uniform must be a boolean value');
    }

    return errors;
  }

  /**
   * Checks if the API service is properly configured
   * @returns Boolean indicating if service is ready
   */
  static isConfigured(): boolean {
    const token = getAuthToken();
    if (!token) {
      console.warn('[EmploymentInformationAPI] No authentication token available');
      return false;
    }
    return true;
  }

  /**
   * Gets current API configuration for debugging
   * @returns Current API configuration
   */
  static getConfig() {
    return {
      baseURL: API_CONFIG.baseURL,
      timeout: API_CONFIG.timeout,
      hasToken: !!getAuthToken(),
      endpoints: ENDPOINTS,
    };
  }
}

// ============================================================================
// Convenience Export
// ============================================================================

/**
 * Default export of the API service for easier importing
 */
export default EmploymentInformationApiService;

/**
 * Named exports for individual methods (alternative usage pattern)
 */
export const {
  getAll: getAllEmploymentInformation,
  getById: getEmploymentInformationById,
  create: createEmploymentInformation,
  update: updateEmploymentInformation,
  delete: deleteEmploymentInformation,
  validateEmploymentData,
  isConfigured: isApiConfigured,
  getConfig: getApiConfig,
} = EmploymentInformationApiService;
