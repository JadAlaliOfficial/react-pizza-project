// src/features/serviceClients/services/api.ts

import axios, { AxiosError } from 'axios';
import type { AxiosInstance, AxiosResponse,  } from 'axios';
import { store } from '../../../store'; // Adjust path to your Redux store
import { loadToken } from '../../auth/utils/tokenStorage'; // Adjust path to your tokenStorage file
import type {
  GetServiceClientsResponse,
  CreateServiceClientResponse,
  RotateTokenResponse,
  ToggleStatusResponse,
  CreateServiceClientRequest,
  RotateTokenRequest,
  GetServiceClientsParams,
  ErrorResponse,
} from '../types';
import {
  API_ENDPOINTS,
  DEFAULT_PAGINATION,
} from '../types';

/**
 * Base URL for the API
 * This should be configured via environment variables in production
 */
const API_BASE_URL = import.meta.env.VITE_AUTH_API_BASE_URL;

/**
 * Helper function to get authentication token with fallback
 * Follows the pattern from your existing codebase
 */
const getAuthToken = (): string | null => {
  try {
    const state = store.getState();
    // Adjust this path to match your auth slice structure
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
 * Create Axios instance for service clients API
 */
const serviceClientApiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: Number(import.meta.env.VITE_API_TIMEOUT), 
  headers: {
    'Content-Type': import.meta.env.VITE_API_CONTENT_TYPE,
    'Accept': import.meta.env.VITE_API_ACCEPT,
  },
});

/**
 * Request interceptor to add auth token and handle common headers
 */
serviceClientApiClient.interceptors.request.use(
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
 * Response interceptor to handle common HTTP errors and token refresh
 */
serviceClientApiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // Log successful responses in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`✅ ${response.config.method?.toUpperCase()} ${response.config.url}:`, response.status);
    }
    return response;
  },
  (error: AxiosError) => {
    // Enhanced error logging
    if (process.env.NODE_ENV === 'development') {
      console.error(`❌ API Error:`, {
        url: error.config?.url,
        method: error.config?.method?.toUpperCase(),
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
      });
    }

    // Handle specific HTTP status codes
    if (error.response) {
      const { status, data } = error.response;
      
      switch (status) {
        case 401:
          // Unauthorized - token might be expired
          console.warn('Unauthorized request - token may be expired');
          // You might want to dispatch a logout action or redirect to login
          // Example: store.dispatch(logout());
          break;
          
        case 403:
          // Forbidden - insufficient permissions
          console.warn('Forbidden request - insufficient permissions');
          break;
          
        case 422:
          // Validation error - let the component handle this
          console.warn('Validation error:', data);
          break;
          
        case 500:
          // Server error
          console.error('Internal server error');
          break;
          
        default:
          console.error(`HTTP ${status} error:`, data);
      }
    } else if (error.request) {
      // Network error
      console.error('Network error - no response received:', error.request);
    } else {
      // Request configuration error
      console.error('Request configuration error:', error.message);
    }

    return Promise.reject(error);
  }
);

/**
 * Build query string from parameters object
 */
const buildQueryString = (params: Record<string, any>): string => {
  const queryParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      queryParams.append(key, String(value));
    }
  });
  
  return queryParams.toString();
};

/**
 * API Functions for Service Clients
 */

/**
 * Fetch all service clients with optional pagination and search
 * 
 * @param params - Query parameters for pagination and search
 * @returns Promise with paginated service clients data
 */
export const getServiceClients = async (
  params?: GetServiceClientsParams
): Promise<AxiosResponse<GetServiceClientsResponse>> => {
  try {
    // Set default parameters
    const queryParams = {
      per_page: params?.per_page || DEFAULT_PAGINATION.PER_PAGE,
      page: params?.page || DEFAULT_PAGINATION.PAGE,
      ...(params?.search && { search: params.search }),
    };

    const queryString = buildQueryString(queryParams);
    const url = `${API_ENDPOINTS.SERVICE_CLIENTS}${queryString ? `?${queryString}` : ''}`;

    console.log('🔍 Fetching service clients:', { url, params: queryParams });

    const response = await serviceClientApiClient.get<GetServiceClientsResponse>(url);
    
    return response;
  } catch (error) {
    console.error('Error fetching service clients:', error);
    throw error;
  }
};

/**
 * Create a new service client
 * 
 * @param clientData - Data for creating the service client
 * @returns Promise with created service client and token
 */
export const createServiceClient = async (
  clientData: CreateServiceClientRequest
): Promise<AxiosResponse<CreateServiceClientResponse>> => {
  try {
    console.log('🆕 Creating service client:', clientData);

    // Validate required fields
    if (!clientData.name || !clientData.name.trim()) {
      throw new Error('Service client name is required');
    }

    const response = await serviceClientApiClient.post<CreateServiceClientResponse>(
      API_ENDPOINTS.SERVICE_CLIENTS,
      clientData
    );

    console.log('✅ Service client created successfully');
    return response;
  } catch (error) {
    console.error('Error creating service client:', error);
    throw error;
  }
};

/**
 * Rotate service client token
 * 
 * @param clientId - ID of the service client
 * @param data - Optional expiration date for the new token
 * @returns Promise with updated service client and new token
 */
export const rotateServiceToken = async (
  clientId: number,
  data?: RotateTokenRequest
): Promise<AxiosResponse<RotateTokenResponse>> => {
  try {
    console.log('🔄 Rotating token for client:', { clientId, data });

    // Validate client ID
    if (!clientId || clientId <= 0) {
      throw new Error('Valid client ID is required');
    }

    const url = API_ENDPOINTS.ROTATE_TOKEN(clientId);
    const requestBody = data || {};

    const response = await serviceClientApiClient.post<RotateTokenResponse>(
      url,
      requestBody
    );

    console.log('✅ Token rotated successfully');
    return response;
  } catch (error) {
    console.error('Error rotating service token:', error);
    throw error;
  }
};

/**
 * Toggle service client active status
 * 
 * @param clientId - ID of the service client to toggle
 * @returns Promise with updated service client
 */
export const toggleServiceStatus = async (
  clientId: number
): Promise<AxiosResponse<ToggleStatusResponse>> => {
  try {
    console.log('🔄 Toggling status for client:', clientId);

    // Validate client ID
    if (!clientId || clientId <= 0) {
      throw new Error('Valid client ID is required');
    }

    const url = API_ENDPOINTS.TOGGLE_STATUS(clientId);

    const response = await serviceClientApiClient.post<ToggleStatusResponse>(url);

    console.log('✅ Status toggled successfully');
    return response;
  } catch (error) {
    console.error('Error toggling service status:', error);
    throw error;
  }
};

/**
 * Utility function to check if an error is a validation error (422)
 */
export const isValidationError = (error: any): boolean => {
  return error?.response?.status === 422;
};

/**
 * Utility function to check if an error is an authentication error (401)
 */
export const isAuthenticationError = (error: any): boolean => {
  return error?.response?.status === 401;
};

/**
 * Utility function to check if an error is a forbidden error (403)
 */
export const isForbiddenError = (error: any): boolean => {
  return error?.response?.status === 403;
};

/**
 * Utility function to check if an error is a network error
 */
export const isNetworkError = (error: any): boolean => {
  return error?.request && !error?.response;
};

/**
 * Extract error message from API response with fallback
 */
export const extractErrorMessage = (error: any): string => {
  if (error?.response?.data) {
    const errorData = error.response.data as ErrorResponse;
    
    // Handle validation errors (422)
    if ('errors' in errorData && errorData.errors) {
      const firstErrorField = Object.keys(errorData.errors)[0];
      const firstErrorMessage = errorData.errors[firstErrorField]?.[0];
      return firstErrorMessage || errorData.message || 'Validation error occurred';
    }
    
    // Handle general API errors
    if ('message' in errorData) {
      return errorData.message;
    }
  }
  
  // Handle network errors
  if (isNetworkError(error)) {
    return 'Network error - please check your connection';
  }
  
  // Handle authentication errors
  if (isAuthenticationError(error)) {
    return 'Authentication failed - please log in again';
  }
  
  // Handle forbidden errors
  if (isForbiddenError(error)) {
    return 'Access forbidden - insufficient permissions';
  }
  
  // Fallback error messages
  if (error?.message) {
    return error.message;
  }
  
  return 'An unexpected error occurred';
};

/**
 * Export the configured Axios instance for direct use if needed
 */
export { serviceClientApiClient };

/**
 * Export API client configuration for testing or debugging
 */
export const getApiConfig = () => ({
  baseURL: API_BASE_URL,
  timeout: serviceClientApiClient.defaults.timeout,
  headers: serviceClientApiClient.defaults.headers,
});
