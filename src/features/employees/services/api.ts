/**
 * Employee Management API Service
 * 
 * This file provides a comprehensive API service layer for employee management
 * using Axios with proper error handling, authentication, logging, and retry logic.
 */

import axios, { AxiosError } from 'axios';
import type { AxiosInstance, AxiosResponse } from 'axios';
import { store } from '../../../store'; // Adjust path based on your store location
import { loadToken } from '../../auth/utils/tokenStorage';
import {
  isValidationError,
  isAuthError,
  API_ENDPOINTS,
} from '../types';
import type {
  CreateEmployeeRequest,
  UpdateEmployeeRequest,
  AttachSkillRequest,
  UpdateSkillRequest,
  CreateEmployeeResponse,
  UpdateEmployeeResponse,
  GetAllEmployeesResponse,
  GetEmployeeByIdResponse,
  GetEmployeesByStoreResponse,
  PaginationOptions,
  ApiErrorType,
  ValidationError,
  AuthError,
  NetworkError,
  ServerError,
  GenericError,
} from '../types';

// ============================================================================
// Configuration
// ============================================================================

/**
 * Base API configuration
 */
const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_EMPLOYEES_NOT_WORKING_API_BASE_URL,
  TIMEOUT: Number(import.meta.env.VITE_API_TIMEOUT), 
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000, // 1 second
} as const;

/**
 * HTTP status codes for reference
 */
const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
} as const;

// ============================================================================
// Type Definitions for API Responses
// ============================================================================

/**
 * Expected structure of API error response
 */
interface ApiErrorResponse {
  message?: string;
  errors?: Record<string, string[]>;
  [key: string]: any;
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Helper function to get authentication token with fallback
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
 * Logger utility for API operations
 */
const logger = {
  info: (message: string, data?: any) => {
    console.log(`[API] ${message}`, data || '');
  },
  
  error: (message: string, error?: any) => {
    console.error(`[API ERROR] ${message}`, error || '');
  },
  
  warn: (message: string, data?: any) => {
    console.warn(`[API WARNING] ${message}`, data || '');
  },
  
  debug: (message: string, data?: any) => {
    if (process.env.NODE_ENV === 'development') {
      console.debug(`[API DEBUG] ${message}`, data || '');
    }
  },
};

/**
 * Sleep utility for retry delays
 */
const sleep = (ms: number): Promise<void> => 
  new Promise(resolve => setTimeout(resolve, ms));

/**
 * Type guard to check if data is an API error response
 */
const isApiErrorResponse = (data: any): data is ApiErrorResponse => {
  return data && typeof data === 'object';
};

/**
 * Build pagination query parameters
 */
const buildPaginationParams = (options: PaginationOptions = {}): Record<string, any> => {
  const { page = 1, per_page } = options;
  
  const params: Record<string, any> = { page };
  
  // Only add per_page if explicitly provided
  if (per_page && per_page > 0) {
    params.per_page = per_page;
  }
  
  return params;
};

/**
 * Parse error response to create proper error objects
 */
const parseApiError = (error: AxiosError): ApiErrorType => {
  const { response, request, message } = error;
  
  // Network or connection error
  if (!response) {
    const networkError: NetworkError = {
      message: request ? 'Network error - no response received' : 'Network error - request failed',
      type: request ? 'NETWORK_ERROR' : 'CONNECTION_FAILED',
      status: 0,
      details: { originalMessage: message },
    };
    return networkError;
  }

  const { status } = response;
  const data = isApiErrorResponse(response.data) ? response.data : {};
  
  // Authentication errors
  if (status === HTTP_STATUS.UNAUTHORIZED) {
    const authError: AuthError = {
      message: data.message || 'Authentication required',
      type: 'UNAUTHORIZED',
      status,
      details: data as Record<string, any>,
    };
    return authError;
  }
  
  if (status === HTTP_STATUS.FORBIDDEN) {
    const authError: AuthError = {
      message: data.message || 'Access forbidden',
      type: 'FORBIDDEN',
      status,
      details: data as Record<string, any>,
    };
    return authError;
  }

  // Validation errors
  if (status === HTTP_STATUS.UNPROCESSABLE_ENTITY && data.errors) {
    const validationError: ValidationError = {
      message: data.message || 'Validation failed',
      status,
      errors: data.errors,
      details: data as Record<string, any>,
    };
    return validationError;
  }

  // Server errors
  if (status >= 500) {
    const serverError: ServerError = {
      message: data.message || 'Internal server error',
      type: status === HTTP_STATUS.SERVICE_UNAVAILABLE ? 'SERVICE_UNAVAILABLE' : 'INTERNAL_SERVER_ERROR',
      status,
      details: data as Record<string, any>,
    };
    return serverError;
  }

  // Generic API error - now properly typed
  const genericError: GenericError = {
    message: data.message || `HTTP ${status} error`,
    status,
    details: data as Record<string, any>,
  };
  
  return genericError;
};

// ============================================================================
// Axios Instance Configuration
// ============================================================================

/**
 * Create configured axios instance
 */
const createApiClient = (): AxiosInstance => {
  const client = axios.create({
    baseURL: API_CONFIG.BASE_URL,
    timeout: API_CONFIG.TIMEOUT,
    headers: {
      'Accept': import.meta.env.VITE_API_ACCEPT,
      'Content-Type': import.meta.env.VITE_API_CONTENT_TYPE,
    },
  });

  // Request interceptor for authentication and logging
  client.interceptors.request.use(
    (config) => {
      const token = getAuthToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      logger.debug(`${config.method?.toUpperCase()} ${config.url}`, {
        headers: config.headers,
        data: config.data,
        params: config.params,
      });

      return config;
    },
    (error) => {
      logger.error('Request interceptor error', error);
      return Promise.reject(error);
    }
  );

  // Response interceptor for error handling and logging
  client.interceptors.response.use(
    (response) => {
      logger.debug(`Response ${response.status} from ${response.config.url}`, {
        data: response.data,
        headers: response.headers,
      });
      return response;
    },
    (error: AxiosError) => {
      const apiError = parseApiError(error);
      logger.error(`API Error: ${apiError.message}`, apiError);
      return Promise.reject(apiError);
    }
  );

  return client;
};

/**
 * Global API client instance
 */
const apiClient = createApiClient();

// ============================================================================
// Retry Logic
// ============================================================================

/**
 * Generic retry wrapper for API calls
 */
const withRetry = async <T>(
  operation: () => Promise<T>,
  operationName: string,
  maxRetries: number = API_CONFIG.MAX_RETRIES
): Promise<T> => {
  let lastError: ApiErrorType | null = null;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      logger.debug(`${operationName} - Attempt ${attempt}/${maxRetries}`);
      return await operation();
    } catch (error) {
      lastError = error as ApiErrorType;
      
      // Don't retry authentication errors or validation errors
      if (isAuthError(lastError) || isValidationError(lastError)) {
        logger.warn(`${operationName} - Not retrying due to auth/validation error`);
        break;
      }
      
      // Don't retry if this is the last attempt
      if (attempt === maxRetries) {
        logger.error(`${operationName} - All retry attempts failed`);
        break;
      }
      
      // Calculate delay with exponential backoff
      const delay = API_CONFIG.RETRY_DELAY * Math.pow(2, attempt - 1);
      logger.info(`${operationName} - Retrying in ${delay}ms (attempt ${attempt + 1}/${maxRetries})`);
      await sleep(delay);
    }
  }
  
  throw lastError;
};

// ============================================================================
// API Service Functions
// ============================================================================

/**
 * Employee API Service Class
 */
export class EmployeeApiService {
  /**
   * Get all employees
   * GET /api/employees
   */
  static async getAllEmployees(): Promise<GetAllEmployeesResponse> {
    return withRetry(async () => {
      logger.info('Fetching all employees');
      
      const response: AxiosResponse<GetAllEmployeesResponse> = await apiClient.get(
        API_ENDPOINTS.EMPLOYEES
      );
      
      logger.info(`Successfully fetched ${response.data.length} employees`);
      return response.data;
    }, 'getAllEmployees');
  }

  /**
   * Get employee by ID
   * GET /api/employees/{id}
   */
  static async getEmployeeById(id: number): Promise<GetEmployeeByIdResponse> {
    return withRetry(async () => {
      logger.info(`Fetching employee with ID: ${id}`);
      
      const response: AxiosResponse<GetEmployeeByIdResponse> = await apiClient.get(
        API_ENDPOINTS.EMPLOYEE_BY_ID(id)
      );
      
      logger.info(`Successfully fetched employee: ${response.data.full_name}`);
      return response.data;
    }, `getEmployeeById(${id})`);
  }

  /**
   * Create new employee
   * POST /api/employees
   */
  static async createEmployee(data: CreateEmployeeRequest): Promise<CreateEmployeeResponse> {
    return withRetry(async () => {
      logger.info('Creating new employee', { name: data.full_name, store: data.store_id });
      
      const response: AxiosResponse<CreateEmployeeResponse> = await apiClient.post(
        API_ENDPOINTS.EMPLOYEES,
        data
      );
      
      logger.info(`Successfully created employee: ${response.data.full_name} (ID: ${response.data.id})`);
      return response.data;
    }, 'createEmployee', 1); // No retry for create operations
  }

  /**
   * Update existing employee
   * PUT /api/employees/{id}
   */
  static async updateEmployee(id: number, data: UpdateEmployeeRequest): Promise<UpdateEmployeeResponse> {
    return withRetry(async () => {
      logger.info(`Updating employee ID: ${id}`, { name: data.full_name });
      
      const response: AxiosResponse<UpdateEmployeeResponse> = await apiClient.put(
        API_ENDPOINTS.EMPLOYEE_BY_ID(id),
        data
      );
      
      logger.info(`Successfully updated employee: ${response.data.full_name} (ID: ${id})`);
      return response.data;
    }, `updateEmployee(${id})`, 1); // No retry for update operations
  }

  /**
   * Delete employee
   * DELETE /api/employees/{id}
   */
  static async deleteEmployee(id: number): Promise<void> {
    return withRetry(async () => {
      logger.info(`Deleting employee ID: ${id}`);
      
      await apiClient.delete(API_ENDPOINTS.EMPLOYEE_BY_ID(id));
      
      logger.info(`Successfully deleted employee ID: ${id}`);
    }, `deleteEmployee(${id})`, 1); // No retry for delete operations
  }

  /**
   * Get employees by store ID with full pagination support
   * GET /api/stores/{storeId}/employees
   * Supports both 'page' and 'per_page' parameters
   */
  static async getEmployeesByStore(
    storeId: string, 
    options: PaginationOptions = {}
  ): Promise<GetEmployeesByStoreResponse> {
    return withRetry(async () => {
      const { page = 1, per_page } = options;
      
      logger.info(`Fetching employees for store: ${storeId}`, { 
        page, 
        per_page: per_page || 'default (server)' 
      });
      
      // Build query parameters with pagination support
      const params = buildPaginationParams(options);
      
      const response: AxiosResponse<GetEmployeesByStoreResponse> = await apiClient.get(
        API_ENDPOINTS.EMPLOYEES_BY_STORE(storeId),
        { params }
      );
      
      logger.info(`Successfully fetched employees for store ${storeId}`, {
        returned: response.data.data.length,
        page: response.data.current_page,
        per_page: response.data.per_page,
        total: response.data.total,
        total_pages: response.data.last_page
      });
      
      return response.data;
    }, `getEmployeesByStore(${storeId}, page:${options.page || 1}, per_page:${options.per_page || 'default'})`);
  }

  /**
   * Get all employees with pagination support
   * GET /api/employees
   * This method assumes your backend supports pagination on the main employees endpoint
   */
  static async getAllEmployeesPaginated(
    options: PaginationOptions = {}
  ): Promise<GetEmployeesByStoreResponse> {
    return withRetry(async () => {
      const { page = 1, per_page } = options;
      
      logger.info(`Fetching all employees with pagination`, { 
        page, 
        per_page: per_page || 'default (server)' 
      });
      
      // Build query parameters with pagination support
      const params = buildPaginationParams(options);
      
      const response: AxiosResponse<GetEmployeesByStoreResponse> = await apiClient.get(
        API_ENDPOINTS.EMPLOYEES,
        { params }
      );
      
      logger.info(`Successfully fetched employees with pagination`, {
        returned: response.data.data.length,
        page: response.data.current_page,
        per_page: response.data.per_page,
        total: response.data.total,
        total_pages: response.data.last_page
      });
      
      return response.data;
    }, `getAllEmployeesPaginated(page:${options.page || 1}, per_page:${options.per_page || 'default'})`);
  }

  /**
   * Attach skill to employee
   * POST /api/employees/{employeeId}/skills/{skillId}
   */
  static async attachSkill(
    employeeId: number, 
    skillId: number, 
    data: AttachSkillRequest
  ): Promise<void> {
    return withRetry(async () => {
      logger.info(`Attaching skill ${skillId} to employee ${employeeId}`, { rating: data.rating });
      
      await apiClient.post(
        API_ENDPOINTS.EMPLOYEE_SKILL(employeeId, skillId),
        data
      );
      
      logger.info(`Successfully attached skill ${skillId} to employee ${employeeId} with rating ${data.rating}`);
    }, `attachSkill(${employeeId}, ${skillId})`, 1); // No retry for attach operations
  }

  /**
   * Update employee skill rating
   * PUT /api/employees/{employeeId}/skills/{skillId}
   */
  static async updateSkill(
    employeeId: number, 
    skillId: number, 
    data: UpdateSkillRequest
  ): Promise<void> {
    return withRetry(async () => {
      logger.info(`Updating skill ${skillId} for employee ${employeeId}`, { rating: data.rating });
      
      await apiClient.put(
        API_ENDPOINTS.EMPLOYEE_SKILL(employeeId, skillId),
        data
      );
      
      logger.info(`Successfully updated skill ${skillId} for employee ${employeeId} to rating ${data.rating}`);
    }, `updateSkill(${employeeId}, ${skillId})`, 1); // No retry for update operations
  }

  /**
   * Detach skill from employee
   * DELETE /api/employees/{employeeId}/skills/{skillId}
   */
  static async detachSkill(employeeId: number, skillId: number): Promise<void> {
    return withRetry(async () => {
      logger.info(`Detaching skill ${skillId} from employee ${employeeId}`);
      
      await apiClient.delete(API_ENDPOINTS.EMPLOYEE_SKILL(employeeId, skillId));
      
      logger.info(`Successfully detached skill ${skillId} from employee ${employeeId}`);
    }, `detachSkill(${employeeId}, ${skillId})`, 1); // No retry for detach operations
  }
}

// ============================================================================
// Convenience Functions
// ============================================================================

/**
 * Check if API is accessible
 */
export const checkApiHealth = async (): Promise<boolean> => {
  try {
    await apiClient.get('/api/health', { timeout: 5000 });
    logger.info('API health check passed');
    return true;
  } catch (error) {
    logger.warn('API health check failed', error);
    return false;
  }
};

/**
 * Refresh authentication token
 */
export const refreshAuthToken = async (): Promise<void> => {
  try {
    // This would typically call your auth refresh endpoint
    // Implementation depends on your auth system
    logger.info('Auth token refresh requested');
  } catch (error) {
    logger.error('Failed to refresh auth token', error);
    throw error;
  }
};

// ============================================================================
// Export Default Instance
// ============================================================================

/**
 * Default export for backward compatibility and convenience
 */
const employeeApi = {
  // Core CRUD operations
  getAllEmployees: EmployeeApiService.getAllEmployees,
  getEmployeeById: EmployeeApiService.getEmployeeById,
  createEmployee: EmployeeApiService.createEmployee,
  updateEmployee: EmployeeApiService.updateEmployee,
  deleteEmployee: EmployeeApiService.deleteEmployee,
  
  // Store-specific operations with pagination
  getEmployeesByStore: EmployeeApiService.getEmployeesByStore,
  
  // Paginated employees operations
  getAllEmployeesPaginated: EmployeeApiService.getAllEmployeesPaginated,
  
  // Skill management operations
  attachSkill: EmployeeApiService.attachSkill,
  updateSkill: EmployeeApiService.updateSkill,
  detachSkill: EmployeeApiService.detachSkill,
  
  // Utility functions
  checkHealth: checkApiHealth,
  refreshToken: refreshAuthToken,
};

export default employeeApi;

// Named exports for individual functions
export const {
  getAllEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  getEmployeesByStore,
  getAllEmployeesPaginated,
  attachSkill,
  updateSkill,
  detachSkill,
} = employeeApi;
