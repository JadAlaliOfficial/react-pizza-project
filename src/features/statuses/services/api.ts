// src/features/statuses/services/api.ts

import axios, {  AxiosError } from 'axios';
import type { AxiosResponse } from 'axios';
import { store } from '../../../store'; // Adjust path based on your store location
import { loadToken } from '../../auth/utils/tokenStorage';
import {
  type StatusListResponse,
  type StatusResponse,
  type CreateStatusRequest,
  type UpdateStatusParams,
  type DeleteStatusParams,
  type StatusApiError,
   STATUS_OPERATION,
   HTTP_STATUS_CODE,
  type StatusOperation,
} from '../types';

/**
 * Base URL for status-related API endpoints
 * Can be moved to environment variables for different environments
 */
const API_BASE_URL = import.meta.env.VITE_STATUSES_NOT_WORKING_API_BASE_URL;

/**
 * Helper function to get authentication token with fallback
 * Uses Redux store first, then falls back to localStorage
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
 * Helper function to create standardized headers for API requests
 * Includes authentication token and required content types
 */
const createHeaders = (includeContentType: boolean = false) => {
  const token = getAuthToken();
  
  if (!token) {
    throw new Error('Authentication token not found. Please log in again.');
  }

  const headers: Record<string, string> = {
    'Accept': import.meta.env.VITE_API_ACCEPT,
    'Content-Type': import.meta.env.VITE_API_CONTENT_TYPE,
    'Authorization': `Bearer ${token}`,
  };

  if (includeContentType) {
    headers['Content-Type'] = import.meta.env.VITE_API_CONTENT_TYPE;
  }

  return headers;
};

/**
 * Helper function to create standardized API errors with consistent structure
 * Provides meaningful error messages and operation context for debugging
 */
const createApiError = (
  error: unknown,
  operation: StatusOperation,
  customMessage?: string
): StatusApiError => {
  const timestamp = new Date().toISOString();
  
  // Handle Axios errors with detailed information
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError;
    const status = axiosError.response?.status;
    const statusText = axiosError.response?.statusText;
    const responseData = axiosError.response?.data;
    
    // Create user-friendly error messages based on status codes
    let message = customMessage || 'An error occurred while processing your request';
    
    switch (status) {
      case HTTP_STATUS_CODE.UNAUTHORIZED:
        message = 'Authentication failed. Please log in again.';
        break;
      case HTTP_STATUS_CODE.FORBIDDEN:
        message = 'You do not have permission to perform this action.';
        break;
      case HTTP_STATUS_CODE.NOT_FOUND:
        message = 'The requested status was not found.';
        break;
      case HTTP_STATUS_CODE.UNPROCESSABLE_ENTITY:
        message = 'Invalid data provided. Please check your input and try again.';
        break;
      case HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR:
        message = 'Server error occurred. Please try again later.';
        break;
      default:
        message = customMessage || `Request failed with status ${status}: ${statusText}`;
    }

    // Log detailed error for debugging (only in development)
    if (process.env.NODE_ENV === 'development') {
      console.error(`API Error [${operation}]:`, {
        status,
        statusText,
        url: axiosError.config?.url,
        method: axiosError.config?.method?.toUpperCase(),
        responseData,
        message: axiosError.message
      });
    }

    return {
      message,
      status,
      operation,
      details: typeof responseData === 'string' ? responseData : JSON.stringify(responseData),
      timestamp
    };
  }

  // Handle non-Axios errors (network issues, etc.)
  const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
  
  console.error(`API Error [${operation}]:`, {
    error: errorMessage,
    operation,
    timestamp
  });

  return {
    message: customMessage || 'Network error occurred. Please check your connection.',
    operation,
    details: errorMessage,
    timestamp
  };
};

/**
 * API service class for status management
 * Provides all CRUD operations with consistent error handling and logging
 */
export class StatusApiService {
  
  /**
   * Fetches all statuses from the API
   * GET /api/statuses
   * 
   * @returns Promise<StatusListResponse> Array of all statuses
   * @throws StatusApiError on authentication or network failures
   */
  static async getAllStatuses(): Promise<StatusListResponse> {
    try {
      const headers = createHeaders();
      
      const response: AxiosResponse<StatusListResponse> = await axios.get(
        API_BASE_URL,
        { headers }
      );

      // Log successful operation in development
      if (process.env.NODE_ENV === 'development') {
        console.log(`✅ Successfully fetched ${response.data.length} statuses`);
      }

      return response.data;
    } catch (error) {
      const apiError = createApiError(
        error,
        STATUS_OPERATION.FETCH_ALL,
        'Failed to fetch statuses'
      );
      throw apiError;
    }
  }

  /**
   * Fetches a single status by ID
   * GET /api/statuses/{id}
   * 
   * @param id - The ID of the status to retrieve
   * @returns Promise<StatusResponse> Single status object
   * @throws StatusApiError on authentication, not found, or network failures
   */
  static async getStatusById(id: number): Promise<StatusResponse> {
    try {
      const headers = createHeaders();
      
      const response: AxiosResponse<StatusResponse> = await axios.get(
        `${API_BASE_URL}/${id}`,
        { headers }
      );

      if (process.env.NODE_ENV === 'development') {
        console.log(`✅ Successfully fetched status with ID: ${id}`);
      }

      return response.data;
    } catch (error) {
      const apiError = createApiError(
        error,
        STATUS_OPERATION.FETCH_BY_ID,
        `Failed to fetch status with ID: ${id}`
      );
      throw apiError;
    }
  }

  /**
   * Creates a new status
   * POST /api/statuses
   * 
   * @param statusData - Data for creating the new status
   * @returns Promise<StatusResponse> Created status object with generated ID
   * @throws StatusApiError on validation, authentication, or network failures
   */
  static async createStatus(statusData: CreateStatusRequest): Promise<StatusResponse> {
    try {
      // Validate required fields before making API call
      if (!statusData.description || statusData.description.trim() === '') {
        throw new Error('Description is required');
      }

      const headers = createHeaders(true); // Include Content-Type for POST
      
      const response: AxiosResponse<StatusResponse> = await axios.post(
        API_BASE_URL,
        statusData,
        { headers }
      );

      if (process.env.NODE_ENV === 'development') {
        console.log(`✅ Successfully created status with ID: ${response.data.id}`);
      }

      return response.data;
    } catch (error) {
      const apiError = createApiError(
        error,
        STATUS_OPERATION.CREATE,
        'Failed to create status'
      );
      throw apiError;
    }
  }

  /**
   * Updates an existing status
   * PUT /api/statuses/{id}
   * 
   * @param params - Object containing ID and update data
   * @returns Promise<StatusResponse> Updated status object
   * @throws StatusApiError on validation, authentication, not found, or network failures
   */
  static async updateStatus(params: UpdateStatusParams): Promise<StatusResponse> {
    try {
      const { id, data } = params;

      // Validate required fields before making API call
      if (!data.description || data.description.trim() === '') {
        throw new Error('Description is required');
      }

      const headers = createHeaders(true); // Include Content-Type for PUT
      
      const response: AxiosResponse<StatusResponse> = await axios.put(
        `${API_BASE_URL}/${id}`,
        data,
        { headers }
      );

      if (process.env.NODE_ENV === 'development') {
        console.log(`✅ Successfully updated status with ID: ${id}`);
      }

      return response.data;
    } catch (error) {
      const apiError = createApiError(
        error,
        STATUS_OPERATION.UPDATE,
        `Failed to update status with ID: ${params.id}`
      );
      throw apiError;
    }
  }

  /**
   * Deletes a status by ID
   * DELETE /api/statuses/{id}
   * 
   * @param params - Object containing the ID of the status to delete
   * @returns Promise<void> No content returned on successful deletion (204)
   * @throws StatusApiError on authentication, not found, or network failures
   */
  static async deleteStatus(params: DeleteStatusParams): Promise<void> {
    try {
      const { id } = params;
      const headers = createHeaders();
      
      const response: AxiosResponse<void> = await axios.delete(
        `${API_BASE_URL}/${id}`,
        { headers }
      );

      // Verify we received the expected 204 No Content response
      if (response.status !== HTTP_STATUS_CODE.NO_CONTENT) {
        console.warn(`Unexpected status code for delete operation: ${response.status}`);
      }

      if (process.env.NODE_ENV === 'development') {
        console.log(`✅ Successfully deleted status with ID: ${id}`);
      }

      // No return value for successful deletion
    } catch (error) {
      const apiError = createApiError(
        error,
        STATUS_OPERATION.DELETE,
        `Failed to delete status with ID: ${params.id}`
      );
      throw apiError;
    }
  }
}

/**
 * Export individual methods for easier testing and alternative usage patterns
 * Maintains backward compatibility and provides flexible import options
 */
export const statusApi = {
  getAllStatuses: StatusApiService.getAllStatuses,
  getStatusById: StatusApiService.getStatusById,
  createStatus: StatusApiService.createStatus,
  updateStatus: StatusApiService.updateStatus,
  deleteStatus: StatusApiService.deleteStatus,
};

/**
 * Default export for the complete service class
 */
export default StatusApiService;
