// src/features/preferences/services/api.ts

/**
 * Preference API Service
 *
 * This service provides all CRUD operations for the Preference entity.
 * It handles HTTP requests using Axios with proper error handling,
 * logging, and TypeScript typing for production-ready applications.
 */

import axios, { AxiosError } from 'axios';
import type { AxiosResponse } from 'axios';
import { store } from '../../../store'; // Adjust path to your store
import { loadToken } from '../../auth/utils/tokenStorage';
import type {
  Preference,
  CreatePreferenceDto,
  UpdatePreferenceDto,
  ApiError,
} from '../types';

/**
 * Base URL and endpoints
 */
const API_BASE_URL = import.meta.env.VITE_EMPLOYEMENT_INFO_NOT_WORKING_API_BASE_URL;
const PREFERENCES_ENDPOINT = '/preferences';

/**
 * Helper function to get authentication token with fallback
 * Prioritizes Redux store token, falls back to localStorage
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
 * Creates Axios instance with default configuration
 */
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: Number(import.meta.env.VITE_API_TIMEOUT), 
  headers: {
    'Accept': import.meta.env.VITE_API_ACCEPT,
    'Content-Type': import.meta.env.VITE_API_CONTENT_TYPE,
  },
});

/**
 * Request interceptor to add authentication token to all requests
 */
apiClient.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  },
);

/**
 * Response interceptor for global error handling and logging
 */
apiClient.interceptors.response.use(
  (response) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(
        `✅ API Success: ${response.config.method?.toUpperCase()} ${response.config.url}`,
        {
          status: response.status,
          data: response.data,
        },
      );
    }
    return response;
  },
  (error: AxiosError) => {
    console.error('❌ API Error:', {
      method: error.config?.method?.toUpperCase(),
      url: error.config?.url,
      status: error.response?.status,
      message: error.message,
      data: error.response?.data,
    });
    return Promise.reject(error);
  },
);

/**
 * Transforms Axios error to standardized ApiError format
 * @param error - Unknown error object (Axios error or generic error)
 * @returns Standardized error object
 */
const handleApiError = (error: unknown): ApiError => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError;
    const responseData = axiosError.response?.data as any;

    return {
      message:
        responseData?.message ||
        axiosError.message ||
        'An unexpected error occurred',
      status: axiosError.response?.status || 500,
      errors: responseData?.errors || undefined,
      code: responseData?.code || 'UNKNOWN_ERROR',
      details: responseData || undefined,
    };
  }

  if (error instanceof Error) {
    return {
      message: error.message,
      status: 500,
      code: 'NETWORK_ERROR',
    };
  }

  return {
    message: 'An unexpected error occurred',
    status: 500,
    code: 'UNKNOWN_ERROR',
  };
};

/**
 * Preference API Service Class
 * Contains all CRUD operations for Preferences management
 */
class PreferenceApiService {
  /**
   * Fetches all preferences
   * @returns Promise resolving to an array of preferences
   * @throws ApiError on request failure
   */
  async getAllPreferences(): Promise<Preference[]> {
    try {
      console.log('📋 Fetching all preferences');

      const response: AxiosResponse<Preference[]> = await apiClient.get(PREFERENCES_ENDPOINT);

      console.log(`✅ Successfully fetched ${response.data.length} preferences`);
      return response.data;
    } catch (error) {
      const apiError = handleApiError(error);
      console.error('❌ Failed to fetch preferences:', apiError);
      throw apiError;
    }
  }

  /**
   * Fetches a single preference by ID, including related schedule preferences
   * @param id - Preference ID
   * @returns Promise resolving to Preference with schedule preferences
   * @throws ApiError on request failure
   */
  async getPreferenceById(id: number): Promise<Preference> {
    try {
      console.log(`📄 Fetching preference with ID: ${id}`);

      const response: AxiosResponse<Preference> = await apiClient.get(`${PREFERENCES_ENDPOINT}/${id}`);

      console.log(`✅ Successfully fetched preference: ${response.data.name}`);
      return response.data;
    } catch (error) {
      const apiError = handleApiError(error);
      console.error(`❌ Failed to fetch preference ${id}:`, apiError);
      throw apiError;
    }
  }

  /**
   * Creates a new preference
   * @param preferenceData - Data for creating the preference
   * @returns Promise resolving to created preference
   * @throws ApiError on request failure or validation errors
   */
  async createPreference(preferenceData: CreatePreferenceDto): Promise<Preference> {
    try {
      console.log('➕ Creating new preference:', preferenceData);

      if (!preferenceData.name?.trim()) {
        throw {
          message: 'Preference name is required',
          status: 400,
          errors: { name: ['Preference name is required'] },
          code: 'VALIDATION_ERROR',
        } as ApiError;
      }

      const response: AxiosResponse<Preference> = await apiClient.post(
        PREFERENCES_ENDPOINT,
        preferenceData,
        {
          headers: { 'Content-Type': 'application/json' },
        },
      );

      console.log(`✅ Successfully created preference: ${response.data.name} (ID: ${response.data.id})`);
      return response.data;
    } catch (error) {
      const apiError = handleApiError(error);
      console.error('❌ Failed to create preference:', apiError);
      throw apiError;
    }
  }

  /**
   * Updates an existing preference
   * @param id - Preference ID to update
   * @param preferenceData - Updated preference data
   * @returns Promise resolving to updated preference
   * @throws ApiError on request failure or validation errors
   */
  async updatePreference(id: number, preferenceData: UpdatePreferenceDto): Promise<Preference> {
    try {
      console.log(`✏️ Updating preference ${id}:`, preferenceData);

      if (!preferenceData.name?.trim()) {
        throw {
          message: 'Preference name is required',
          status: 400,
          errors: { name: ['Preference name is required'] },
          code: 'VALIDATION_ERROR',
        } as ApiError;
      }

      const response: AxiosResponse<Preference> = await apiClient.put(
        `${PREFERENCES_ENDPOINT}/${id}`,
        preferenceData,
        {
          headers: { 'Content-Type': 'application/json' },
        },
      );

      console.log(`✅ Successfully updated preference: ${response.data.name} (ID: ${response.data.id})`);
      return response.data;
    } catch (error) {
      const apiError = handleApiError(error);
      console.error(`❌ Failed to update preference ${id}:`, apiError);
      throw apiError;
    }
  }

  /**
   * Deletes a preference by ID
   * @param id - Preference ID to delete
   * @returns Promise resolving to void on successful deletion
   * @throws ApiError on request failure
   */
  async deletePreference(id: number): Promise<void> {
    try {
      console.log(`🗑️ Deleting preference with ID: ${id}`);

      await apiClient.delete(`${PREFERENCES_ENDPOINT}/${id}`);

      console.log(`✅ Successfully deleted preference with ID: ${id}`);
    } catch (error) {
      const apiError = handleApiError(error);
      console.error(`❌ Failed to delete preference ${id}:`, apiError);
      throw apiError;
    }
  }
}

/**
 * Export singleton instance of the API service
 */
export const preferenceApiService = new PreferenceApiService();

/**
 * Export individual methods for named imports if preferred
 */
export const {
  getAllPreferences,
  getPreferenceById,
  createPreference,
  updatePreference,
  deletePreference,
} = preferenceApiService;

export default PreferenceApiService;
