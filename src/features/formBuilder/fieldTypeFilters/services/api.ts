// src/features/fieldTypeFilters/services/fieldTypeFilters.service.ts

import axios, { AxiosError, type AxiosInstance } from 'axios';
import type { FieldTypeFiltersResponse, FieldTypeFiltersData, ApiError } from '../types';
import { loadToken } from '../../../auth/utils/tokenStorage';
import { store } from '@/store'; // Adjust path to your store

/**
 * Base API URL for the application
 * Extracted to constant for easy configuration
 */
const API_BASE_URL = import.meta.env.VITE_DYNAMIC_FORMS_BASE_URL;

/**
 * Axios instance configured for field type filters API calls
 * Centralizes configuration for timeouts and base URL
 */
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: Number(import.meta.env.VITE_API_TIMEOUT), // 10 second timeout for production reliability
  headers: {
    'Content-Type': import.meta.env.VITE_API_CONTENT_TYPE,
    'Accept': import.meta.env.VITE_API_ACCEPT,
  },
});

/**
 * Retrieves authentication token from Redux store or localStorage
 * Falls back to localStorage if Redux state is unavailable
 * @returns {string | null} The auth token or null if not found
 */
const getAuthToken = (): string | null => {
  try {
    const state = store.getState();
    const reduxToken = state.auth?.token;
    if (reduxToken) return reduxToken;
    return loadToken();
  } catch (error) {
    console.error('Error retrieving auth token:', error);
    return null;
  }
};

/**
 * Normalizes Axios errors into a consistent ApiError structure
 * Extracts meaningful error information for UI display and logging
 * @param {unknown} error - The error object from axios or other source
 * @returns {ApiError} Normalized error object
 */
const normalizeAxiosError = (error: unknown): ApiError => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<{ message?: string }>;
    
    // Handle response errors (4xx, 5xx)
    if (axiosError.response) {
      return {
        message: axiosError.response.data?.message || axiosError.message || 'An error occurred',
        status: axiosError.response.status,
        statusText: axiosError.response.statusText,
      };
    }
    
    // Handle request errors (network issues, timeout)
    if (axiosError.request) {
      return {
        message: 'Network error: Unable to reach the server',
        status: 0,
        statusText: 'Network Error',
      };
    }
    
    // Handle configuration errors
    return {
      message: axiosError.message || 'Request configuration error',
      status: 0,
      statusText: 'Configuration Error',
    };
  }
  
  // Handle non-axios errors
  if (error instanceof Error) {
    return {
      message: error.message,
      status: 0,
      statusText: 'Unknown Error',
    };
  }
  
  // Fallback for unknown error types
  return {
    message: 'An unexpected error occurred',
    status: 0,
    statusText: 'Unknown Error',
  };
};

/**
 * Fetches field type filters from the API
 * Requires valid authentication token
 * @returns {Promise<FieldTypeFiltersData>} Array of field type filters
 * @throws {ApiError} Normalized error if request fails or token is missing
 */
export const fetchFieldTypeFilters = async (): Promise<FieldTypeFiltersData> => {
  const endpoint = '/field-type-filters';
  
  console.info(`[FieldTypeFilters Service] Initiating request to ${endpoint}`);
  
  // Validate token presence before making request
  const token = getAuthToken();
  if (!token) {
    const authError: ApiError = {
      message: 'Authentication token not found. Please log in again.',
      status: 401,
      statusText: 'Unauthorized',
    };
    console.error('[FieldTypeFilters Service] Authentication token missing');
    throw authError;
  }
  
  try {
    const response = await apiClient.get<FieldTypeFiltersResponse>(endpoint, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    console.info(
      `[FieldTypeFilters Service] Successfully fetched ${response.data.data.length} field type filters`,
      { status: response.status, success: response.data.success }
    );
    
    // Return only the data array, not the wrapper
    return response.data.data;
    
  } catch (error) {
    const normalizedError = normalizeAxiosError(error);
    
    console.error(
      `[FieldTypeFilters Service] Failed to fetch field type filters`,
      {
        message: normalizedError.message,
        status: normalizedError.status,
        statusText: normalizedError.statusText,
      }
    );
    
    throw normalizedError;
  }
};

/**
 * Service object exposing all field type filters API methods
 * Allows for easy mocking in tests and future expansion
 */
export const fieldTypeFiltersService = {
  fetchFieldTypeFilters,
};
