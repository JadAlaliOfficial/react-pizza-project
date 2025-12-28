/**
 * Roles API Service
 * 
 * This service layer handles all HTTP requests related to roles management.
 * It provides a clean abstraction over the REST API endpoints with proper error handling,
 * token management, and response transformation. All methods are strongly typed and
 * include comprehensive error handling for production use.
 */

import axios, {  AxiosError } from 'axios';
import type {AxiosResponse} from 'axios';
import type { 
  Role, 
  GetRolesResponse, 
  CreateRoleResponse,
  AssignPermissionsToRoleResponse,
  CreateRoleRequest, 
  AssignPermissionsRequest,
  GetRolesParams,
  ApiErrorResponse,
  RoleErrorDetails,
} from '../types';
import {ROLES_API_ENDPOINTS} from '../types';
import { store } from '../../../store';
import { loadToken } from '../../auth/utils/tokenStorage';

// Base API configuration
const API_BASE_URL = import.meta.env.VITE_AUTH_API_BASE_URL;

// Create axios instance for roles API
const rolesApiClient = axios.create({
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
rolesApiClient.interceptors.request.use(
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
rolesApiClient.interceptors.response.use(
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
const transformApiError = (error: AxiosError<ApiErrorResponse>): RoleErrorDetails => {
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
    
    case 404:
      return {
        type: 'ROLE_NOT_FOUND',
        message: 'The requested role was not found.',
        statusCode: 404,
      };
    
    case 422:
      const validationErrors = data?.errors;
      if (validationErrors?.name?.includes('The name has already been taken.')) {
        return {
          type: 'ROLE_EXISTS',
          message: 'A role with this name already exists.',
          statusCode: 422,
        };
      }
      if (validationErrors?.permissions) {
        return {
          type: 'PERMISSION_NOT_FOUND',
          message: 'One or more selected permissions are invalid.',
          statusCode: 422,
        };
      }
      
      const firstError = validationErrors ? Object.values(validationErrors)[0]?.[0] : null;
      return {
        type: 'VALIDATION_ERROR',
        message: firstError || data?.message || 'Validation failed',
        statusCode: 422,
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
const buildQueryString = (params: GetRolesParams): string => {
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
 * Roles API Service Class
 * Provides methods for all role-related API operations
 */
class RolesApiService {
  
  /**
   * Fetch all roles with optional pagination and search
   * @param params - Query parameters for filtering and pagination
   * @returns Promise resolving to roles response
   */
  async getRoles(params: GetRolesParams = {}): Promise<GetRolesResponse> {
    try {
      const queryString = buildQueryString(params);
      const response = await rolesApiClient.get<GetRolesResponse>(
        `${ROLES_API_ENDPOINTS.GET_ALL}${queryString}`
      );
      
      if (!response.data.success) {
        throw new Error('API returned success: false');
      }
      
      return response.data;
    } catch (error) {
      console.error('Failed to fetch roles:', error);
      throw error;
    }
  }

  /**
   * Create a new role with permissions
   * @param roleData - Data for the new role including permissions
   * @returns Promise resolving to the created role
   */
  async createRole(roleData: CreateRoleRequest): Promise<Role> {
    try {
      // Validate required fields
      if (!roleData.name?.trim()) {
        throw {
          type: 'VALIDATION_ERROR',
          message: 'Role name is required',
          field: 'name',
        } as RoleErrorDetails;
      }

      if (!roleData.guard_name?.trim()) {
        throw {
          type: 'VALIDATION_ERROR',
          message: 'Guard name is required',
          field: 'guard_name',
        } as RoleErrorDetails;
      }

      // Validate permissions array
      if (!Array.isArray(roleData.permissions)) {
        throw {
          type: 'VALIDATION_ERROR',
          message: 'Permissions must be an array',
          field: 'permissions',
        } as RoleErrorDetails;
      }

      const response = await rolesApiClient.post<CreateRoleResponse>(
        ROLES_API_ENDPOINTS.CREATE,
        {
          name: roleData.name.trim(),
          guard_name: roleData.guard_name.trim(),
          permissions: roleData.permissions,
        }
      );
      
      if (!response.data.success) {
        throw new Error('API returned success: false');
      }
      
      return response.data.data.role;
    } catch (error) {
      console.error('Failed to create role:', error);
      throw error;
    }
  }

  /**
   * Assign permissions to an existing role
   * @param roleId - ID of the role to assign permissions to
   * @param permissions - Array of permission names to assign
   * @returns Promise resolving to the updated role
   */
  async assignPermissionsToRole(roleId: number, permissions: string[]): Promise<Role> {
    try {
      // Validate role ID
      if (!roleId || roleId <= 0) {
        throw {
          type: 'VALIDATION_ERROR',
          message: 'Valid role ID is required',
          field: 'roleId',
        } as RoleErrorDetails;
      }

      // Validate permissions array
      if (!Array.isArray(permissions)) {
        throw {
          type: 'VALIDATION_ERROR',
          message: 'Permissions must be an array',
          field: 'permissions',
        } as RoleErrorDetails;
      }

      if (permissions.length === 0) {
        throw {
          type: 'VALIDATION_ERROR',
          message: 'At least one permission must be provided',
          field: 'permissions',
        } as RoleErrorDetails;
      }

      const requestData: AssignPermissionsRequest = {
        permissions: permissions.filter(p => p.trim()),
      };

      const response = await rolesApiClient.post<AssignPermissionsToRoleResponse>(
        ROLES_API_ENDPOINTS.ASSIGN_PERMISSIONS(roleId),
        requestData
      );
      
      if (!response.data.success) {
        throw new Error('API returned success: false');
      }
      
      return response.data.data.role;
    } catch (error) {
      console.error('Failed to assign permissions to role:', error);
      throw error;
    }
  }

  /**
   * Get a specific role by ID
   * @param roleId - ID of the role to retrieve
   * @returns Promise resolving to the role data
   */
  async getRoleById(roleId: number): Promise<Role> {
    try {
      if (!roleId || roleId <= 0) {
        throw {
          type: 'VALIDATION_ERROR',
          message: 'Valid role ID is required',
          field: 'roleId',
        } as RoleErrorDetails;
      }

      const response = await rolesApiClient.get<{ success: boolean; data: { role: Role } }>(
        ROLES_API_ENDPOINTS.GET_BY_ID(roleId)
      );
      
      if (!response.data.success) {
        throw new Error('API returned success: false');
      }
      
      return response.data.data.role;
    } catch (error) {
      console.error('Failed to fetch role by ID:', error);
      throw error;
    }
  }

  /**
   * Search roles by name
   * @param searchTerm - Term to search for in role names
   * @returns Promise resolving to filtered roles
   */
  async searchRoles(searchTerm: string): Promise<Role[]> {
    try {
      if (!searchTerm.trim()) {
        const response = await this.getRoles();
        return response.data.data;
      }
      
      const response = await this.getRoles({ 
        search: searchTerm.trim(),
        per_page: 50 // Get more results for search
      });
      
      return response.data.data;
    } catch (error) {
      console.error('Failed to search roles:', error);
      throw error;
    }
  }

  /**
   * Get roles formatted for select dropdown components
   * @returns Promise resolving to array of role options
   */
  async getRolesForSelect(): Promise<Array<{ value: number; label: string; role: Role }>> {
    try {
      const response = await this.getRoles();
      return response.data.data.map(role => ({
        value: role.id,
        label: role.name,
        role,
      }));
    } catch (error) {
      console.error('Failed to fetch roles for select:', error);
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
      
      // Try to fetch roles with minimal parameters to check connectivity
      await this.getRoles({ per_page: 1 });
      return true;
    } catch (error) {
      console.error('Health check failed:', error);
      return false;
    }
  }

  /**
   * Get roles with permission counts for analytics
   * @returns Promise resolving to roles with computed permission counts
   */
  async getRolesWithPermissionCounts(): Promise<Array<Role & { permission_count: number }>> {
    try {
      const response = await this.getRoles();
      return response.data.data.map(role => ({
        ...role,
        permission_count: role.permissions?.length || 0,
      }));
    } catch (error) {
      console.error('Failed to fetch roles with permission counts:', error);
      throw error;
    }
  }

  /**
   * Bulk assign the same permissions to multiple roles
   * @param roleIds - Array of role IDs
   * @param permissions - Array of permission names to assign
   * @returns Promise resolving to array of updated roles
   */
  async bulkAssignPermissions(roleIds: number[], permissions: string[]): Promise<Role[]> {
    try {
      if (!Array.isArray(roleIds) || roleIds.length === 0) {
        throw {
          type: 'VALIDATION_ERROR',
          message: 'At least one role ID must be provided',
          field: 'roleIds',
        } as RoleErrorDetails;
      }

      const results = await Promise.allSettled(
        roleIds.map(roleId => this.assignPermissionsToRole(roleId, permissions))
      );

      const updatedRoles: Role[] = [];
      const errors: Array<{ roleId: number; error: any }> = [];

      results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          updatedRoles.push(result.value);
        } else {
          errors.push({ roleId: roleIds[index], error: result.reason });
        }
      });

      if (errors.length > 0) {
        console.warn('Some bulk assignments failed:', errors);
      }

      return updatedRoles;
    } catch (error) {
      console.error('Failed to bulk assign permissions:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const rolesApi = new RolesApiService();

// Export individual methods for tree-shaking
export const {
  getRoles,
  createRole,
  assignPermissionsToRole,
  getRoleById,
  searchRoles,
  getRolesForSelect,
  checkHealth,
  getRolesWithPermissionCounts,
  bulkAssignPermissions,
} = rolesApi;

// Export error transformer for use in other services
export { transformApiError };

// Export the service class for testing
export { RolesApiService };
