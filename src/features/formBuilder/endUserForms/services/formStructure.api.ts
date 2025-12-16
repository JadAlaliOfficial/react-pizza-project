/**
 * ================================
 * FORMS MODULE - Service Layer (Axios)
 * ================================
 * Handles all HTTP requests to the Forms API endpoints.
 * - Uses Axios instance with Bearer token authentication
 * - Provides strongly typed methods for all operations
 * - Includes error normalization helper
 * - Includes logging
 * - Return strictly typed responses
 * - Supports AbortSignal for request cancellation
 */

import axios, { type AxiosInstance, AxiosError } from 'axios';
import { store } from '@/store'; // Adjust path to your Redux store
import { loadToken } from '../../../auth/utils/tokenStorage'; // Adjust path
import type {
  FormStructureResponse,
  ApiError,
} from '../types/formStructure.types';

/**
 * Base URL for the Forms API
 */
const BASE_URL = 'http://dforms.pnepizza.com/api';

/**
 * Retrieve authentication token from Redux state or token storage.
 * Falls back to stored token if Redux state doesn't have it.
 * @returns Bearer token string or null if unavailable
 */
const getAuthToken = (): string | null => {
  try {
    const state = store.getState();
    const reduxToken = state.auth?.token;
    if (reduxToken) {
      console.debug('[FormsStructureService] Using token from Redux state');
      return reduxToken;
    }
    console.debug('[FormsStructureService] Token not in Redux, loading from storage');
    return loadToken();
  } catch (error) {
    console.error('[FormsStructureService] Error retrieving auth token:', error);
    return null;
  }
};

/**
 * Create and configure Axios instance with interceptors for auth and logging.
 */
const createAxiosInstance = (): AxiosInstance => {
  const instance = axios.create({
    baseURL: BASE_URL,
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
  });

  // Request interceptor: attach Bearer token to all requests
  instance.interceptors.request.use(
    (config) => {
      const token = getAuthToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        console.debug(`[FormsStructureService] Request: ${config.method?.toUpperCase()} ${config.url}`);
      } else {
        console.warn('[FormsStructureService] No auth token available for request');
      }
      return config;
    },
    (error) => {
      console.error('[FormsStructureService] Request interceptor error:', error);
      return Promise.reject(error);
    }
  );

  // Response interceptor: log responses and errors
  instance.interceptors.response.use(
    (response) => {
      console.debug(
        `[FormsStructureService] Response: ${response.config.method?.toUpperCase()} ${response.config.url} - Status: ${response.status}`
      );
      return response;
    },
    (error) => {
      if (error?.code === 'ERR_CANCELED' || error?.name === 'CanceledError' || error?.name === 'AbortError') {
        console.debug('[FormsStructureService] Response cancelled');
        return Promise.reject(error);
      }
      console.error('[FormsStructureService] Response error:', error);
      return Promise.reject(error);
    }
  );

  return instance;
};

/**
 * Shared Axios instance for all Forms service methods
 */
const axiosInstance = createAxiosInstance();

/**
 * Normalize Axios errors into a consistent ApiError shape.
 * Extracts user-friendly messages for UI consumption.
 * @param error - The error object from Axios
 * @returns Normalized ApiError object
 */
export const normalizeError = (error: unknown): ApiError => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<{ message?: string; error?: string; success?: boolean }>;
    
    // Extract message from response body or use default
    const message =
      axiosError.response?.data?.message ||
      axiosError.response?.data?.error ||
      axiosError.message ||
      'An unexpected error occurred';

    console.error('[FormsStructureService] Normalized error:', {
      status: axiosError.response?.status,
      message,
      url: axiosError.config?.url,
    });

    return {
      status: axiosError.response?.status || 500,
      message,
      data: axiosError.response?.data,
    };
  }

  // Handle non-Axios errors
  if (error instanceof Error) {
    console.error('[FormsStructureService] Non-Axios error:', error.message);
    return {
      status: 500,
      message: error.message,
      data: error,
    };
  }

  // Fallback for unknown error types
  console.error('[FormsStructureService] Unknown error type:', error);
  return {
    status: 500,
    message: 'An unknown error occurred',
    data: error,
  };
};

/**
 * FormsService: All API methods for Forms module
 */
export class FormsService {
  /**
   * GET FORM STRUCTURE
   * Fetches the complete form structure including stages, sections, fields, and rules.
   * @param formVersionId - The form version ID to fetch
   * @param languageId - The language ID for the form content
   * @param signal - Optional AbortSignal for request cancellation
   * @returns Promise resolving to form structure data
   * @throws {ApiError} When API returns an error or success is false
   */
  static async getFormStructure(
    formVersionId: number,
    languageId: number,
    signal?: AbortSignal
  ): Promise<FormStructureResponse['data']> {
    try {
      // Validate required parameters
      if (!formVersionId || formVersionId <= 0) {
        throw new Error('Invalid form_version_id: must be a positive number');
      }

      if (!languageId || languageId <= 0) {
        throw new Error('Invalid language_id: must be a positive number');
      }

      console.debug('[FormsService.getFormStructure] Fetching form structure:', {
        formVersionId,
        languageId,
      });

      // Make the API request
      const response = await axiosInstance.get<FormStructureResponse>(
        '/enduser/forms/structure',
        {
          params: {
            form_version_id: formVersionId,
            language_id: languageId,
          },
          signal,
        }
      );

      // Check if API returned success=false (business logic error)
      if (!response.data.success) {
        console.error('[FormsService.getFormStructure] API returned success=false:', response.data);
        throw {
          status: response.status,
          message: 'API returned unsuccessful response',
          data: response.data,
        } as ApiError;
      }

      console.debug('[FormsService.getFormStructure] Success:', response.data);
      return response.data.data;
    } catch (error: any) {
      // Handle abort/cancellation
      if (error.name === 'AbortError' || error.name === 'CanceledError') {
        console.debug('[FormsService.getFormStructure] Request was cancelled');
        throw error;
      }

      console.error('[FormsService.getFormStructure] Error:', error);
      throw normalizeError(error);
    }
  }

  /**
   * Additional form service methods can be added here
   * Examples:
   * - submitFormData()
   * - saveFormDraft()
   * - getFormSubmissions()
   * - transitionFormStage()
   */
}

/**
 * Export the service class as default for easy importing
 */
export default FormsService;
