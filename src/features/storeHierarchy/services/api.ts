/**
 * @fileoverview Role Hierarchy API Service
 * Enterprise-grade API service layer with TypeScript generics, error handling,
 * and Redux/localStorage token management for role hierarchy operations.
 */

import axios, { AxiosError } from 'axios';
import type { AxiosInstance, AxiosResponse } from 'axios';
import { store } from '../../../store' ;
import { loadToken } from '../../auth/utils/tokenStorage';
import type {
  ApiResponse,
  ApiError,
  CreateHierarchyRequest,
  CreateHierarchyResponse,
  StoreHierarchiesResponse,
  HierarchyTreeResponse,
  RemoveHierarchyRequest,
  RoleTreeNode,
  RoleHierarchy,
} from '../types';

// ===== Configuration =====

/**
 * Base API configuration constants
 */
const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_AUTH_API_BASE_URL,
  TIMEOUT: Number(import.meta.env.VITE_API_TIMEOUT), // 15 seconds timeout for hierarchy operations
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // 1 second base delay
} as const;

// ===== Token Management =====

/**
 * Helper function to get authentication token from Redux store with localStorage fallback
 * @returns Authentication token or null if not available
 */
const getAuthToken = (): string | null => {
  try {
    // First try to get token from Redux store
    const state = store.getState();
    const reduxToken = state.auth?.token;
    
    if (reduxToken && typeof reduxToken === 'string') {
      return reduxToken;
    }

    // Fallback to decrypt token from localStorage
    return loadToken();
  } catch (error) {
    console.warn('Failed to retrieve auth token:', error);
    return null;
  }
};

// ===== Axios Instance Configuration =====

/**
 * Configured Axios instance for role hierarchy API calls
 */
const axiosInstance: AxiosInstance = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Accept': import.meta.env.VITE_API_ACCEPT,
    'Content-Type': import.meta.env.VITE_API_CONTENT_TYPE,
  },
});

/**
 * Request interceptor to add authentication token to every request
 */
axiosInstance.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Add request timestamp for debugging
    config.metadata = { startTime: Date.now() };
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Response interceptor for logging and error handling
 */
axiosInstance.interceptors.response.use(
  (response) => {
    // Log successful requests in development
    if (process.env.NODE_ENV === 'development' && response.config.metadata?.startTime) {
      const duration = Date.now() - response.config.metadata.startTime;
      console.log(`API Request completed in ${duration}ms:`, {
        url: response.config.url,
        method: response.config.method,
        status: response.status,
      });
    }
    
    return response;
  },
  (error) => {
    // Enhanced error logging
    if (process.env.NODE_ENV === 'development') {
      console.error('API Request failed:', {
        url: error.config?.url,
        method: error.config?.method,
        status: error.response?.status,
        message: error.message,
      });
    }
    
    return Promise.reject(error);
  }
);

// ===== Error Handling Utilities =====

/**
 * Transforms Axios errors into standardized ApiError format
 * @param error - The caught error from Axios request
 * @returns Standardized ApiError object
 */
const transformApiError = (error: unknown): ApiError => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<ApiResponse>;
    
    // Server responded with error status
    if (axiosError.response) {
      const { status, data } = axiosError.response;
      
      return {
        code: status,
        message: data?.message || getErrorMessageByStatus(status),
        details: data?.error?.details,
        validation_errors: data?.error?.validation_errors,
      };
    }
    
    // Request was made but no response received (network error)
    if (axiosError.request) {
      return {
        code: 'NETWORK_ERROR',
        message: 'Network error - please check your connection and try again',
        details: { originalError: axiosError.message },
      };
    }
    
    // Request setup error
    return {
      code: 'REQUEST_SETUP_ERROR',
      message: 'Request configuration error',
      details: { originalError: axiosError.message },
    };
  }
  
  // Unknown error type
  return {
    code: 'UNKNOWN_ERROR',
    message: error instanceof Error ? error.message : 'An unexpected error occurred',
    details: { originalError: String(error) },
  };
};

/**
 * Gets human-readable error message based on HTTP status code
 * @param status - HTTP status code
 * @returns User-friendly error message
 */
const getErrorMessageByStatus = (status: number): string => {
  const statusMessages: Record<number, string> = {
    400: 'Invalid request data - please check your input',
    401: 'Authentication required - please log in again',
    403: 'You do not have permission to perform this action',
    404: 'The requested resource was not found',
    409: 'Conflict - this operation cannot be completed',
    422: 'Validation failed - please check your input data',
    429: 'Too many requests - please try again later',
    500: 'Server error - please try again later',
    502: 'Service temporarily unavailable',
    503: 'Service maintenance in progress',
  };
  
  return statusMessages[status] || `Request failed with status ${status}`;
};

/**
 * Retry mechanism with exponential backoff for failed requests
 * @param fn - Function to retry
 * @param retries - Number of retry attempts remaining
 * @param delay - Current delay between retries in milliseconds
 * @returns Promise resolving to function result
 */
const withRetry = async <T>(
  fn: () => Promise<T>,
  retries: number = API_CONFIG.RETRY_ATTEMPTS,
  delay: number = API_CONFIG.RETRY_DELAY
): Promise<T> => {
  try {
    return await fn();
  } catch (error) {
    if (retries > 0 && shouldRetry(error)) {
      await new Promise(resolve => setTimeout(resolve, delay));
      return withRetry(fn, retries - 1, delay * 2); // Exponential backoff
    }
    throw error;
  }
};

/**
 * Determines if an error is retryable
 * @param error - The error to check
 * @returns True if the error should trigger a retry
 */
const shouldRetry = (error: unknown): boolean => {
  if (axios.isAxiosError(error)) {
    // Retry on network errors or 5xx server errors
    return !error.response || (error.response.status >= 500);
  }
  return false;
};

// ===== API Service Functions =====

/**
 * Creates a new role hierarchy relationship
 * @param payload - Hierarchy creation data
 * @returns Promise resolving to created hierarchy data
 * @throws ApiError if creation fails
 */
export const createRoleHierarchy = async (
  payload: CreateHierarchyRequest
): Promise<CreateHierarchyResponse> => {
  try {
    const response = await withRetry(async () => {
      const result: AxiosResponse<ApiResponse<CreateHierarchyResponse>> = 
        await axiosInstance.post('/role-hierarchy', payload);
      return result;
    });

    if (response.data.success && response.data.data) {
      return response.data.data;
    }

    throw new Error(response.data.message || 'Failed to create role hierarchy');
  } catch (error) {
    const apiError = transformApiError(error);
    throw apiError;
  }
};

/**
 * Retrieves all role hierarchies for a specific store
 * @param storeId - The store identifier
 * @returns Promise resolving to store hierarchies data
 * @throws ApiError if fetch fails
 */
export const getStoreHierarchy = async (
  storeId: string
): Promise<StoreHierarchiesResponse> => {
  if (!storeId || typeof storeId !== 'string') {
    throw {
      code: 'INVALID_STORE_ID',
      message: 'Store ID is required and must be a valid string',
    } as ApiError;
  }

  try {
    const response = await withRetry(async () => {
      const result: AxiosResponse<ApiResponse<StoreHierarchiesResponse>> = 
        await axiosInstance.get(`/role-hierarchy/store?store_id=${encodeURIComponent(storeId)}`);
      return result;
    });

    if (response.data.success && response.data.data) {
      return response.data.data;
    }

    throw new Error(response.data.message || 'Failed to fetch store hierarchies');
  } catch (error) {
    const apiError = transformApiError(error);
    throw apiError;
  }
};

/**
 * Retrieves hierarchical tree structure for a specific store
 * @param storeId - The store identifier
 * @returns Promise resolving to hierarchy tree data
 * @throws ApiError if fetch fails
 */
export const getStoreHierarchyTree = async (
  storeId: string
): Promise<HierarchyTreeResponse> => {
  if (!storeId || typeof storeId !== 'string') {
    throw {
      code: 'INVALID_STORE_ID',
      message: 'Store ID is required and must be a valid string',
    } as ApiError;
  }

  try {
    const response = await withRetry(async () => {
      const result: AxiosResponse<ApiResponse<HierarchyTreeResponse>> = 
        await axiosInstance.get(`/role-hierarchy/tree?store_id=${encodeURIComponent(storeId)}`);
      return result;
    });

    if (response.data.success && response.data.data) {
      return response.data.data;
    }

    throw new Error(response.data.message || 'Failed to fetch hierarchy tree');
  } catch (error) {
    const apiError = transformApiError(error);
    throw apiError;
  }
};

/**
 * Removes an existing role hierarchy relationship
 * @param payload - Hierarchy removal data
 * @returns Promise resolving when removal is complete
 * @throws ApiError if removal fails
 */
export const removeRoleHierarchy = async (
  payload: RemoveHierarchyRequest
): Promise<void> => {
  try {
    const response = await withRetry(async () => {
      const result: AxiosResponse<ApiResponse<null>> = 
        await axiosInstance.post('/role-hierarchy/remove', payload);
      return result;
    });

    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to remove role hierarchy');
    }

    // Successful removal returns void
    return;
  } catch (error) {
    const apiError = transformApiError(error);
    throw apiError;
  }
};

// ===== Tree Data Transformation Utilities =====

/**
 * Transforms API tree response into normalized tree structure
 * @param apiTree - Raw tree data from API
 * @returns Normalized tree nodes with metadata
 */
export const transformApiTreeToNormalized = (
  apiTree: RoleTreeNode[]
): RoleTreeNode[] => {
  const transformNode = (node: RoleTreeNode, depth: number = 0, path: number[] = []): RoleTreeNode => {
    const currentPath = [...path, node.role.id];
    
    return {
      ...node,
      children: node.children.map((child) => 
        transformNode(child, depth + 1, currentPath)
      ),
      treeMetadata: {
        depth,
        path: currentPath,
        isExpanded: depth < 2, // Auto-expand first 2 levels
        isSelected: false,
        isLoading: false,
        hasError: false,
      },
    };
  };

  return apiTree.map(rootNode => transformNode(rootNode));
};

/**
 * Flattens tree structure for efficient searching and processing
 * @param tree - Tree structure to flatten
 * @returns Flattened array of tree nodes with path information
 */
export const flattenTree = (tree: RoleTreeNode[]): Array<RoleTreeNode & { flatPath: string }> => {
  const flattened: Array<RoleTreeNode & { flatPath: string }> = [];
  
  const traverse = (nodes: RoleTreeNode[], parentPath: string = '') => {
    nodes.forEach((node) => {
      const currentPath = parentPath ? `${parentPath} > ${node.role.name}` : node.role.name;
      
      flattened.push({
        ...node,
        flatPath: currentPath,
      });
      
      if (node.children.length > 0) {
        traverse(node.children, currentPath);
      }
    });
  };
  
  traverse(tree);
  return flattened;
};

/**
 * Validates hierarchy data integrity
 * @param hierarchies - Array of role hierarchies to validate
 * @returns Validation result with any issues found
 */
export const validateHierarchyData = (hierarchies: RoleHierarchy[]) => {
  const issues: string[] = [];
  const roleIds = new Set<number>();
  
  hierarchies.forEach((hierarchy, index) => {
    // Check for duplicate role relationships
    if (roleIds.has(hierarchy.higher_role_id) && roleIds.has(hierarchy.lower_role_id)) {
      issues.push(`Potential circular reference detected in hierarchy ${index + 1}`);
    }
    
    roleIds.add(hierarchy.higher_role_id);
    roleIds.add(hierarchy.lower_role_id);
    
    // Check for self-referencing hierarchies
    if (hierarchy.higher_role_id === hierarchy.lower_role_id) {
      issues.push(`Self-referencing hierarchy detected in hierarchy ${index + 1}`);
    }
    
    // Validate required fields
    if (!hierarchy.store_id) {
      issues.push(`Missing store_id in hierarchy ${index + 1}`);
    }
  });
  
  return {
    isValid: issues.length === 0,
    issues,
  };
};

// ===== Default Export =====

/**
 * Default export containing all API functions for role hierarchy management
 */
const roleHierarchyApi = {
  createRoleHierarchy,
  getStoreHierarchy,
  getStoreHierarchyTree,
  removeRoleHierarchy,
  transformApiTreeToNormalized,
  flattenTree,
  validateHierarchyData,
} as const;

export default roleHierarchyApi;

// ===== Type Augmentation for Axios =====

declare module 'axios' {
  interface AxiosRequestConfig {
    metadata?: {
      startTime: number;
    };
  }
}
