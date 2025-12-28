/**
 * Users API Service
 * 
 * This service layer handles all HTTP requests related to users management.
 * It provides a clean abstraction over the REST API endpoints with proper error handling,
 * token management, and response transformation. All methods are strongly typed and
 * include comprehensive error handling for production use.
 */

import axios, {  AxiosError } from 'axios';
import type {AxiosResponse} from 'axios';
import type { 
  User, 
  GetUsersResponse, 
  CreateUserResponse,
  GetUserByIdResponse,
  UpdateUserResponse,
  DeleteUserResponse,
  AssignRolesToUserResponse,
  GivePermissionsToUserResponse,
  CreateUserRequest,
  UpdateUserRequest,
  AssignRolesRequest,
  GivePermissionsRequest,
  GetUsersParams,
  ApiErrorResponse,
  UserErrorDetails,
} from '../types';
import {USERS_API_ENDPOINTS} from '../types'
import { store } from '../../../store';
import { loadToken } from '../../auth/utils/tokenStorage';

// Base API configuration
const API_BASE_URL = import.meta.env.VITE_AUTH_API_BASE_URL;

// Create axios instance for users API
const usersApiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Accept': import.meta.env.VITE_API_ACCEPT,
    'Content-Type': import.meta.env.VITE_API_CONTENT_TYPE,
  },
  timeout: import.meta.env.VITE_API_TIMEOUT, // 5 second timeout
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
usersApiClient.interceptors.request.use(
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
usersApiClient.interceptors.response.use(
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
const transformApiError = (error: AxiosError<ApiErrorResponse>): UserErrorDetails => {
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
        type: 'USER_NOT_FOUND',
        message: 'The requested user was not found.',
        statusCode: 404,
      };
    
    case 422:
      const validationErrors = data?.errors;
      
      // Handle specific validation errors
      if (validationErrors?.email?.includes('The email has already been taken.')) {
        return {
          type: 'EMAIL_TAKEN',
          message: 'This email address is already registered.',
          statusCode: 422,
        };
      }
      
      if (validationErrors?.password?.some(err => 
        err.toLowerCase().includes('at least 8 characters'))) {
        return {
          type: 'WEAK_PASSWORD',
          message: 'Password must be at least 8 characters long.',
          statusCode: 422,
        };
      }
      
      if (validationErrors?.password_confirmation) {
        return {
          type: 'PASSWORD_MISMATCH',
          message: 'Password confirmation does not match.',
          statusCode: 422,
        };
      }
      
      if (validationErrors?.roles?.some(err => 
        err.includes('invalid'))) {
        return {
          type: 'ROLE_NOT_FOUND',
          message: 'One or more selected roles are invalid.',
          statusCode: 422,
        };
      }
      
      if (validationErrors?.permissions?.some(err => 
        err.includes('invalid'))) {
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
    
    case 400:
      if (data?.message && data.message.toLowerCase().includes('cannot delete user')) {
        return {
          type: 'CANNOT_DELETE_USER',
          message: data.message,
          statusCode: 400,
        };
      }
      return {
        type: 'VALIDATION_ERROR',
        message: data?.message || 'Bad request',
        statusCode: 400,
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
const buildQueryString = (params: GetUsersParams): string => {
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
  
  if (params.role && params.role.trim()) {
    searchParams.append('role', params.role.trim());
  }
  
  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : '';
};

/**
 * Users API Service Class
 * Provides methods for all user-related API operations
 */
class UsersApiService {
  
  /**
   * Fetch all users with optional pagination, search, and role filtering
   * @param params - Query parameters for filtering and pagination
   * @returns Promise resolving to users response
   */
  async getUsers(params: GetUsersParams = {}): Promise<GetUsersResponse> {
    try {
      const queryString = buildQueryString(params);
      const response = await usersApiClient.get<GetUsersResponse>(
        `${USERS_API_ENDPOINTS.GET_ALL}${queryString}`
      );
      
      if (!response.data.success) {
        throw new Error('API returned success: false');
      }
      
      return response.data;
    } catch (error) {
      console.error('Failed to fetch users:', error);
      throw error;
    }
  }

  /**
   * Create a new user with roles and permissions
   * @param userData - Data for the new user
   * @returns Promise resolving to the created user
   */
  async createUser(userData: CreateUserRequest): Promise<User> {
    try {
      // Validate required fields
      if (!userData.name?.trim()) {
        throw {
          type: 'VALIDATION_ERROR',
          message: 'User name is required',
          field: 'name',
        } as UserErrorDetails;
      }

      if (!userData.email?.trim()) {
        throw {
          type: 'VALIDATION_ERROR',
          message: 'Email is required',
          field: 'email',
        } as UserErrorDetails;
      }

      if (!userData.password || userData.password.length < 8) {
        throw {
          type: 'WEAK_PASSWORD',
          message: 'Password must be at least 8 characters long',
          field: 'password',
        } as UserErrorDetails;
      }

      if (userData.password !== userData.password_confirmation) {
        throw {
          type: 'PASSWORD_MISMATCH',
          message: 'Password confirmation does not match',
          field: 'password_confirmation',
        } as UserErrorDetails;
      }

      // Validate arrays
      if (!Array.isArray(userData.roles)) {
        throw {
          type: 'VALIDATION_ERROR',
          message: 'Roles must be an array',
          field: 'roles',
        } as UserErrorDetails;
      }

      if (!Array.isArray(userData.permissions)) {
        throw {
          type: 'VALIDATION_ERROR',
          message: 'Permissions must be an array',
          field: 'permissions',
        } as UserErrorDetails;
      }

      const response = await usersApiClient.post<CreateUserResponse>(
        USERS_API_ENDPOINTS.CREATE,
        {
          name: userData.name.trim(),
          email: userData.email.trim(),
          password: userData.password,
          password_confirmation: userData.password_confirmation,
          roles: userData.roles,
          permissions: userData.permissions,
        }
      );
      
      if (!response.data.success) {
        throw new Error('API returned success: false');
      }
      
      return response.data.data.user;
    } catch (error) {
      console.error('Failed to create user:', error);
      throw error;
    }
  }

  /**
   * Get a specific user by ID
   * @param userId - ID of the user to retrieve
   * @returns Promise resolving to the user data
   */
  async getUserById(userId: number): Promise<User> {
    try {
      if (!userId || userId <= 0) {
        throw {
          type: 'VALIDATION_ERROR',
          message: 'Valid user ID is required',
          field: 'userId',
        } as UserErrorDetails;
      }

      const response = await usersApiClient.get<GetUserByIdResponse>(
        USERS_API_ENDPOINTS.GET_BY_ID(userId)
      );
      
      if (!response.data.success) {
        throw new Error('API returned success: false');
      }
      
      return response.data.data.user;
    } catch (error) {
      console.error('Failed to fetch user by ID:', error);
      throw error;
    }
  }

  /**
   * Update an existing user
   * @param userId - ID of the user to update
   * @param userData - Updated user data
   * @returns Promise resolving to the updated user
   */
  async updateUser(userId: number, userData: UpdateUserRequest): Promise<User> {
    try {
      if (!userId || userId <= 0) {
        throw {
          type: 'VALIDATION_ERROR',
          message: 'Valid user ID is required',
          field: 'userId',
        } as UserErrorDetails;
      }

      // Validate password if provided
      if (userData.password && userData.password.length < 8) {
        throw {
          type: 'WEAK_PASSWORD',
          message: 'Password must be at least 8 characters long',
          field: 'password',
        } as UserErrorDetails;
      }

      if (userData.password && userData.password !== userData.password_confirmation) {
        throw {
          type: 'PASSWORD_MISMATCH',
          message: 'Password confirmation does not match',
          field: 'password_confirmation',
        } as UserErrorDetails;
      }

      const response = await usersApiClient.put<UpdateUserResponse>(
        USERS_API_ENDPOINTS.UPDATE(userId),
        userData
      );
      
      if (!response.data.success) {
        throw new Error('API returned success: false');
      }
      
      return response.data.data.user;
    } catch (error) {
      console.error('Failed to update user:', error);
      throw error;
    }
  }

  /**
   * Delete a user
   * @param userId - ID of the user to delete
   * @returns Promise resolving when user is deleted
   */
  async deleteUser(userId: number): Promise<void> {
    try {
      if (!userId || userId <= 0) {
        throw {
          type: 'VALIDATION_ERROR',
          message: 'Valid user ID is required',
          field: 'userId',
        } as UserErrorDetails;
      }

      const response = await usersApiClient.delete<DeleteUserResponse>(
        USERS_API_ENDPOINTS.DELETE(userId)
      );
      
      if (!response.data.success) {
        throw new Error('API returned success: false');
      }
    } catch (error) {
      console.error('Failed to delete user:', error);
      throw error;
    }
  }

  /**
   * Assign roles to a user
   * @param userId - ID of the user
   * @param roles - Array of role names to assign
   * @returns Promise resolving to the updated user
   */
  async assignRolesToUser(userId: number, roles: string[]): Promise<User> {
    try {
      if (!userId || userId <= 0) {
        throw {
          type: 'VALIDATION_ERROR',
          message: 'Valid user ID is required',
          field: 'userId',
        } as UserErrorDetails;
      }

      if (!Array.isArray(roles)) {
        throw {
          type: 'VALIDATION_ERROR',
          message: 'Roles must be an array',
          field: 'roles',
        } as UserErrorDetails;
      }

      const requestData: AssignRolesRequest = {
        roles: roles.filter(r => r.trim()),
      };

      const response = await usersApiClient.post<AssignRolesToUserResponse>(
        USERS_API_ENDPOINTS.ASSIGN_ROLES(userId),
        requestData
      );
      
      if (!response.data.success) {
        throw new Error('API returned success: false');
      }
      
      return response.data.data.user;
    } catch (error) {
      console.error('Failed to assign roles to user:', error);
      throw error;
    }
  }

  /**
   * Give permissions directly to a user
   * @param userId - ID of the user
   * @param permissions - Array of permission names to give
   * @returns Promise resolving to the updated user
   */
  async givePermissionsToUser(userId: number, permissions: string[]): Promise<User> {
    try {
      if (!userId || userId <= 0) {
        throw {
          type: 'VALIDATION_ERROR',
          message: 'Valid user ID is required',
          field: 'userId',
        } as UserErrorDetails;
      }

      if (!Array.isArray(permissions)) {
        throw {
          type: 'VALIDATION_ERROR',
          message: 'Permissions must be an array',
          field: 'permissions',
        } as UserErrorDetails;
      }

      const requestData: GivePermissionsRequest = {
        permissions: permissions.filter(p => p.trim()),
      };

      const response = await usersApiClient.post<GivePermissionsToUserResponse>(
        USERS_API_ENDPOINTS.GIVE_PERMISSIONS(userId),
        requestData
      );
      
      if (!response.data.success) {
        throw new Error('API returned success: false');
      }
      
      return response.data.data.user;
    } catch (error) {
      console.error('Failed to give permissions to user:', error);
      throw error;
    }
  }

  /**
   * Search users by name or email
   * @param searchTerm - Term to search for in user names or emails
   * @returns Promise resolving to filtered users
   */
  async searchUsers(searchTerm: string): Promise<User[]> {
    try {
      if (!searchTerm.trim()) {
        const response = await this.getUsers();
        return response.data.data;
      }
      
      const response = await this.getUsers({ 
        search: searchTerm.trim(),
        per_page: 50 // Get more results for search
      });
      
      return response.data.data;
    } catch (error) {
      console.error('Failed to search users:', error);
      throw error;
    }
  }

  /**
   * Get users formatted for select dropdown components
   * @returns Promise resolving to array of user options
   */
  async getUsersForSelect(): Promise<Array<{ value: number; label: string; user: User }>> {
    try {
      const response = await this.getUsers();
      return response.data.data.map(user => ({
        value: user.id,
        label: `${user.name} (${user.email})`,
        user,
      }));
    } catch (error) {
      console.error('Failed to fetch users for select:', error);
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
      
      // Try to fetch users with minimal parameters to check connectivity
      await this.getUsers({ per_page: 1 });
      return true;
    } catch (error) {
      console.error('Health check failed:', error);
      return false;
    }
  }

  /**
   * Get users with computed counts for analytics
   * @returns Promise resolving to users with computed metadata
   */
  async getUsersWithCounts(): Promise<Array<User & { 
    role_count: number; 
    permission_count: number; 
    store_count: number 
  }>> {
    try {
      const response = await this.getUsers();
      return response.data.data.map(user => ({
        ...user,
        role_count: user.roles?.length || 0,
        permission_count: user.permissions?.length || 0,
        store_count: user.stores?.length || 0,
      }));
    } catch (error) {
      console.error('Failed to fetch users with counts:', error);
      throw error;
    }
  }

  /**
   * Bulk assign roles to multiple users
   * @param userIds - Array of user IDs
   * @param roles - Array of role names to assign
   * @returns Promise resolving to array of updated users
   */
  async bulkAssignRoles(userIds: number[], roles: string[]): Promise<User[]> {
    try {
      if (!Array.isArray(userIds) || userIds.length === 0) {
        throw {
          type: 'VALIDATION_ERROR',
          message: 'At least one user ID must be provided',
          field: 'userIds',
        } as UserErrorDetails;
      }

      const results = await Promise.allSettled(
        userIds.map(userId => this.assignRolesToUser(userId, roles))
      );

      const updatedUsers: User[] = [];
      const errors: Array<{ userId: number; error: any }> = [];

      results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          updatedUsers.push(result.value);
        } else {
          errors.push({ userId: userIds[index], error: result.reason });
        }
      });

      if (errors.length > 0) {
        console.warn('Some bulk assignments failed:', errors);
      }

      return updatedUsers;
    } catch (error) {
      console.error('Failed to bulk assign roles:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const usersApi = new UsersApiService();

// Export individual methods for tree-shaking
export const {
  getUsers,
  createUser,
  getUserById,
  updateUser,
  deleteUser,
  assignRolesToUser,
  givePermissionsToUser,
  searchUsers,
  getUsersForSelect,
  checkHealth,
  getUsersWithCounts,
  bulkAssignRoles,
} = usersApi;

// Export error transformer for use in other services
export { transformApiError };

// Export the service class for testing
export { UsersApiService };
