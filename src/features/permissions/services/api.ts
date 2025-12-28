/**
 * Permissions API Service
 * 
 * This service layer handles all HTTP requests related to permissions management.
 * It provides a clean abstraction over the REST API endpoints with proper error handling,
 * token management, and response transformation. All methods are strongly typed and
 * include comprehensive error handling for production use.
 */

import axios, {  AxiosError } from 'axios';
import type { AxiosResponse } from 'axios';
import type { 
  Permission, 
  GetPermissionsResponse, 
  CreatePermissionResponse, 
  CreatePermissionRequest, 
  GetPermissionsParams,
  ApiErrorResponse,
  PermissionErrorDetails 
} from '../types';
import { store } from '../../../store';
import { loadToken } from '../../auth/utils/tokenStorage';

// Base API configuration
const API_BASE_URL = import.meta.env.VITE_AUTH_API_BASE_URL;

// Create axios instance for permissions API
const permissionsApiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Accept': import.meta.env.VITE_API_ACCEPT,
    'Content-Type': import.meta.env.VITE_API_CONTENT_TYPE,
  },
  timeout: Number(import.meta.env.VITE_API_TIMEOUT), 
});

// Helper function to get authentication token with fallback
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

// Request interceptor to add auth token and handle common headers
permissionsApiClient.interceptors.request.use(
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

// Response interceptor for consistent error handling
permissionsApiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError<ApiErrorResponse>) => {
    // Log error for debugging in development
    if (process.env.NODE_ENV === 'development') {
      console.error('API Error:', error.response?.data || error.message);
    }
    
    // Transform axios error to our custom error format
    const transformedError = transformApiError(error);
    return Promise.reject(transformedError);
  }
);

// Transform API errors into user-friendly error objects
const transformApiError = (error: AxiosError<ApiErrorResponse>): PermissionErrorDetails => {
  const status = error.response?.status;
  const data = error.response?.data;
  
  // Handle different error types based on status code
  switch (status) {
    case 401:
      return {
        type: 'UNAUTHORIZED',
        message: 'Authentication failed. Please log in again.',
        statusCode: 401,
      };
    
    case 403:
      return {
        type: 'UNAUTHORIZED',
        message: 'You do not have permission to perform this action.',
        statusCode: 403,
      };
    
    case 422:
      const validationErrors = data?.errors;
      const firstError = validationErrors ? Object.values(validationErrors)[0]?.[0] : null;
      return {
        type: 'VALIDATION_ERROR',
        message: firstError || data?.message || 'Validation failed',
        statusCode: 422,
      };
    
    case 409:
      return {
        type: 'PERMISSION_EXISTS',
        message: 'A permission with this name already exists.',
        statusCode: 409,
      };
    
    case 500:
    case 502:
    case 503:
      return {
        type: 'NETWORK_ERROR',
        message: 'Server error. Please try again later.',
        statusCode: status,
      };
    
    default:
      return {
        type: 'UNKNOWN_ERROR',
        message: data?.message || error.message || 'An unexpected error occurred',
        statusCode: status,
      };
  }
};

// Build query string from parameters
const buildQueryString = (params: GetPermissionsParams): string => {
  const searchParams = new URLSearchParams();
  
  if (params.page !== undefined) {
    searchParams.append('page', params.page.toString());
  }
  
  if (params.per_page !== undefined) {
    searchParams.append('per_page', params.per_page.toString());
  }
  
  if (params.search && params.search.trim()) {
    searchParams.append('search', params.search.trim());
  }
  
  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : '';
};

/**
 * Permissions API Service Class
 * Provides methods for all permission-related API operations
 */
class PermissionsApiService {
  
  /**
   * Fetch all permissions with optional pagination and search
   * @param params - Query parameters for filtering and pagination
   * @returns Promise resolving to permissions response
   */
  async getPermissions(params: GetPermissionsParams = {}): Promise<GetPermissionsResponse> {
    try {
      const queryString = buildQueryString(params);
      const response = await permissionsApiClient.get<GetPermissionsResponse>(
        `/permissions${queryString}`
      );
      
      if (!response.data.success) {
        throw new Error('API returned success: false');
      }
      
      return response.data;
    } catch (error) {
      console.error('Failed to fetch permissions:', error);
      throw error;
    }
  }

  /**
   * Create a new permission
   * @param permissionData - Data for the new permission
   * @returns Promise resolving to the created permission
   */
  async createPermission(permissionData: CreatePermissionRequest): Promise<Permission> {
    try {
      // Validate required fields
      if (!permissionData.name?.trim()) {
        throw {
          type: 'VALIDATION_ERROR',
          message: 'Permission name is required',
          field: 'name',
        } as PermissionErrorDetails;
      }

      if (!permissionData.guard_name?.trim()) {
        throw {
          type: 'VALIDATION_ERROR',
          message: 'Guard name is required',
          field: 'guard_name',
        } as PermissionErrorDetails;
      }

      const response = await permissionsApiClient.post<CreatePermissionResponse>(
        '/permissions',
        {
          name: permissionData.name.trim(),
          guard_name: permissionData.guard_name.trim(),
        }
      );
      
      if (!response.data.success) {
        throw new Error('API returned success: false');
      }
      
      return response.data.data.permission;
    } catch (error) {
      console.error('Failed to create permission:', error);
      throw error;
    }
  }

  /**
   * Check if the API service is properly configured and authenticated
   * @returns Promise resolving to boolean indicating service health
   */
  async checkHealth(): Promise<boolean> {
    try {
      const token = getAuthToken();
      if (!token) {
        return false;
      }
      
      // Try to fetch permissions with minimal parameters to check connectivity
      await this.getPermissions({ per_page: 1 });
      return true;
    } catch (error) {
      console.error('Health check failed:', error);
      return false;
    }
  }

  /**
   * Get permissions formatted for select dropdown components
   * @returns Promise resolving to array of permission options
   */
  async getPermissionsForSelect(): Promise<Array<{ value: number; label: string; permission: Permission }>> {
    try {
      const response = await this.getPermissions();
      return response.data.data.map(permission => ({
        value: permission.id,
        label: permission.name,
        permission,
      }));
    } catch (error) {
      console.error('Failed to fetch permissions for select:', error);
      throw error;
    }
  }

  /**
   * Search permissions by name
   * @param searchTerm - Term to search for in permission names
   * @returns Promise resolving to filtered permissions
   */
  async searchPermissions(searchTerm: string): Promise<Permission[]> {
    try {
      if (!searchTerm.trim()) {
        const response = await this.getPermissions();
        return response.data.data;
      }
      
      const response = await this.getPermissions({ 
        search: searchTerm.trim(),
        per_page: 50 // Get more results for search
      });
      
      return response.data.data;
    } catch (error) {
      console.error('Failed to search permissions:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const permissionsApi = new PermissionsApiService();

// Export individual methods for tree-shaking
export const {
  getPermissions,
  createPermission,
  checkHealth,
  getPermissionsForSelect,
  searchPermissions,
} = permissionsApi;

// Export error transformer for use in other services
export { transformApiError };

// Export the service class for testing
export { PermissionsApiService };
