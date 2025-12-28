/**
 * Store API Service
 * Handles all HTTP requests to the Store management endpoints
 * with authentication, error handling, and type safety.
 */

import axios, { AxiosError } from 'axios';
import type { AxiosInstance, AxiosResponse } from 'axios';
import { store } from '../../../store'; // Adjust path to your Redux store
import { loadToken } from '../../auth/utils/tokenStorage'; // Adjust path
import type{
  Store,
  StoreUser,
  StoreRole,
  GetStoresResponse,
  GetStoreResponse,
  CreateStoreResponse,
  UpdateStoreResponse,
  GetStoreUsersResponse,
  GetStoreRolesResponse,
  GetStoresParams,
  CreateStorePayload,
  UpdateStorePayload,
  ApiError,
  PaginatedStores,
} from '../types';
import {STORE_ENDPOINTS} from '../types';

// ============================================================================
// Configuration & Setup
// ============================================================================

/**
 * Base API client configuration
 */
const API_BASE_URL = import.meta.env.VITE_AUTH_API_BASE_URL;

/**
 * Create dedicated Axios instance for Store API calls
 */
const storeApiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: import.meta.env.VITE_API_TIMEOUT, // 10 seconds timeout
  headers: {
    'Accept': import.meta.env.VITE_API_ACCEPT,
    'Content-Type': import.meta.env.VITE_API_CONTENT_TYPE,
  },
});

// ============================================================================
// Authentication Helper
// ============================================================================

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

// ============================================================================
// Request/Response Interceptors
// ============================================================================

/**
 * Request interceptor to add auth token and handle common headers
 */
storeApiClient.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    
    if (token && config.headers) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    
    // Log request in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`);
    }
    
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

/**
 * Response interceptor for centralized error handling
 */
storeApiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // Log successful responses in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`✅ API Response: ${response.status} ${response.config.url}`);
    }
    return response;
  },
  (error: AxiosError) => {
    // Enhanced error logging
    if (process.env.NODE_ENV === 'development') {
      console.error(`❌ API Error: ${error.response?.status} ${error.config?.url}`, error.response?.data);
    }
    
    // Handle common HTTP errors
    if (error.response?.status === 401) {
      // Token expired or invalid - could dispatch logout action here
      console.warn('Authentication failed - token may be expired');
    }
    
    return Promise.reject(error);
  }
);

// ============================================================================
// Error Handling Utilities
// ============================================================================

/**
 * Transform Axios error into standardized ApiError
 */
const transformError = (error: unknown): ApiError => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<any>;
    
    return {
      message: axiosError.response?.data?.message || axiosError.message || 'An unexpected error occurred',
      status: axiosError.response?.status,
      errors: axiosError.response?.data?.errors || {},
    };
  }
  
  if (error instanceof Error) {
    return {
      message: error.message,
    };
  }
  
  return {
    message: 'An unknown error occurred',
  };
};

/**
 * Generic API call wrapper with error handling
 */
const apiCall = async <T>(
  operation: () => Promise<AxiosResponse<T>>,
  operationName: string
): Promise<T> => {
  try {
    const response = await operation();
    
    // Validate response structure
    if (!response.data) {
      throw new Error(`Invalid response structure from ${operationName}`);
    }
    
    return response.data;
  } catch (error) {
    const apiError = transformError(error);
    console.error(`${operationName} failed:`, apiError);
    throw apiError;
  }
};

// ============================================================================
// Store API Service Class
// ============================================================================

class StoreApiService {
  /**
   * Get all stores with optional pagination and search
   */
  async getStores(params: GetStoresParams = {}): Promise<PaginatedStores> {
    const { per_page = 5, page = 1, search = '', is_active } = params;
    
    const apiParams: any = {
      per_page,
      page,
      search,
    };
    
    if (is_active !== undefined) {
      apiParams.is_active = is_active;
    }
    
    const response = await apiCall(
      () => storeApiClient.get<GetStoresResponse>(STORE_ENDPOINTS.STORES, {
        params: apiParams,
      }),
      'getStores'
    );
    
    // Validate response structure
    if (!response.success || !response.data) {
      throw new Error('Invalid stores response format');
    }
    
    return {
      stores: response.data.data,
      pagination: {
        current_page: response.data.current_page,
        first_page_url: response.data.first_page_url,
        from: response.data.from,
        last_page: response.data.last_page,
        last_page_url: response.data.last_page_url,
        links: response.data.links,
        next_page_url: response.data.next_page_url,
        path: response.data.path,
        per_page: response.data.per_page,
        prev_page_url: response.data.prev_page_url,
        to: response.data.to,
        total: response.data.total,
      },
    };
  }
  
  /**
   * Get a single store by ID
   */
  async getStore(storeId: string): Promise<Store> {
    if (!storeId || storeId.trim() === '') {
      throw new Error('Store ID is required');
    }
    
    const response = await apiCall(
      () => storeApiClient.get<GetStoreResponse>(STORE_ENDPOINTS.STORE_DETAIL(storeId)),
      `getStore(${storeId})`
    );
    
    if (!response.success || !response.data?.store) {
      throw new Error('Invalid store response format');
    }
    
    return response.data.store;
  }
  
  /**
   * Create a new store
   */
  async createStore(payload: CreateStorePayload): Promise<Store> {
    // Validate required fields
    if (!payload.id || !payload.name) {
      throw new Error('Store ID and name are required');
    }
    
    // Validate metadata exists but phone and address are now optional
    if (!payload.metadata) {
      throw new Error('Store metadata is required');
    }
    
    const response = await apiCall(
      () => storeApiClient.post<CreateStoreResponse>(STORE_ENDPOINTS.STORES, payload),
      'createStore'
    );
    
    if (!response.success || !response.data?.store) {
      throw new Error('Invalid create store response format');
    }
    
    return response.data.store;
  }
  
  /**
   * Update an existing store
   */
  async updateStore(storeId: string, payload: UpdateStorePayload): Promise<Store> {
    if (!storeId || storeId.trim() === '') {
      throw new Error('Store ID is required');
    }
    
    if (!payload.name) {
      throw new Error('Store name is required');
    }
    
    if (!payload.metadata) {
      throw new Error('Store metadata is required');
    }
    
    const response = await apiCall(
      () => storeApiClient.put<UpdateStoreResponse>(STORE_ENDPOINTS.STORE_DETAIL(storeId), payload),
      `updateStore(${storeId})`
    );
    
    if (!response.success || !response.data?.store) {
      throw new Error('Invalid update store response format');
    }
    
    return response.data.store;
  }
  
  /**
   * Get users associated with a store
   */
  async getStoreUsers(storeId: string): Promise<StoreUser[]> {
    if (!storeId || storeId.trim() === '') {
      throw new Error('Store ID is required');
    }
    
    const response = await apiCall(
      () => storeApiClient.get<GetStoreUsersResponse>(STORE_ENDPOINTS.STORE_USERS(storeId)),
      `getStoreUsers(${storeId})`
    );
    
    if (!response.success || !response.data?.users) {
      throw new Error('Invalid store users response format');
    }
    
    return response.data.users;
  }
  
  /**
   * Get roles associated with a store
   */
  async getStoreRoles(storeId: string): Promise<StoreRole[]> {
    if (!storeId || storeId.trim() === '') {
      throw new Error('Store ID is required');
    }
    
    const response = await apiCall(
      () => storeApiClient.get<GetStoreRolesResponse>(STORE_ENDPOINTS.STORE_ROLES(storeId)),
      `getStoreRoles(${storeId})`
    );
    
    if (!response.success || !response.data?.roles) {
      throw new Error('Invalid store roles response format');
    }
    
    return response.data.roles;
  }
  
  /**
   * Check if a store exists by ID
   */
  async storeExists(storeId: string): Promise<boolean> {
    try {
      await this.getStore(storeId);
      return true;
    } catch (error) {
      const apiError = error as ApiError;
      if (apiError.status === 404) {
        return false;
      }
      // Re-throw other errors
      throw error;
    }
  }
  
  /**
   * Batch operation to get multiple stores by IDs
   */
  async getStoresBatch(storeIds: string[]): Promise<Store[]> {
    if (!storeIds.length) {
      return [];
    }
    
    const promises = storeIds.map(id => this.getStore(id));
    
    try {
      return await Promise.all(promises);
    } catch (error) {
      console.error('Batch store fetch failed:', error);
      throw new Error('Failed to fetch one or more stores');
    }
  }
  
  /**
   * Search stores with debounced implementation helper
   */
  async searchStores(query: string, params: Omit<GetStoresParams, 'search'> = {}): Promise<PaginatedStores> {
    return this.getStores({
      ...params,
      search: query.trim(),
    });
  }
}

// ============================================================================
// Export Service Instance
// ============================================================================

/**
 * Singleton instance of the Store API service
 */
export const storeApiService = new StoreApiService();

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Helper to validate store ID format
 */
export const isValidStoreId = (storeId: string): boolean => {
  return /^STORE_\d{3}$/.test(storeId);
};

/**
 * Helper to generate next store ID (for UI purposes)
 * Note: This should ideally come from the backend
 */
export const generateStoreId = (existingStores: Store[]): string => {
  const numbers = existingStores
    .map(store => {
      const match = store.id.match(/^STORE_(\d{3})$/);
      return match ? parseInt(match[1], 10) : 0;
    })
    .filter(num => num > 0);
  
  const nextNumber = numbers.length > 0 ? Math.max(...numbers) + 1 : 1;
  return `STORE_${nextNumber.toString().padStart(3, '0')}`;
};

/**
 * Helper to format store metadata for display
 */
export const formatStoreMetadata = (metadata: any): string => {
  try {
    if (typeof metadata === 'string') {
      const parsed = JSON.parse(metadata);
      return Object.entries(parsed)
        .map(([key, value]) => `${key}: ${value}`)
        .join(', ');
    }
    
    if (typeof metadata === 'object' && metadata !== null) {
      return Object.entries(metadata)
        .map(([key, value]) => `${key}: ${value}`)
        .join(', ');
    }
    
    return String(metadata);
  } catch {
    return String(metadata);
  }
};

/**
 * Export the API client for advanced use cases
 */
export { storeApiClient };

/**
 * Export error transformation utility
 */
export { transformError };

// ============================================================================
// Type Exports
// ============================================================================

export type { ApiError };
