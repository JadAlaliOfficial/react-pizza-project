/**
 * Position API Service
 *
 * This service provides all CRUD operations for the Position entity.
 * It handles HTTP requests using Axios with proper error handling,
 * logging, and TypeScript typing for production-ready applications.
 */

import axios, { AxiosError } from 'axios';
import type { AxiosResponse } from 'axios';
import { store } from '../../../store'; // Adjust path to your store
import { loadToken } from '../../auth/utils/tokenStorage';
import type {
  Position,
  CreatePositionDto,
  UpdatePositionDto,
  ApiError,
  PositionsQueryParams,
} from '../types';

/**
 * Base URLs for different environments
 * Note: The provided URLs seem inconsistent, using the local development URL for CRUD operations
 */
const API_BASE_URL = import.meta.env.VITE_EMPLOYEMENT_INFO_NOT_WORKING_API_BASE_URL;
const POSITIONS_ENDPOINT = '/positions';

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
    // Log successful responses in development
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
    // Log errors for debugging
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
 * @param error - Unknown error object (could be Axios error or generic error)
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
    };
  }

  // Handle generic Error instances
  if (error instanceof Error) {
    return {
      message: error.message,
      status: 500,
      code: 'NETWORK_ERROR',
    };
  }

  // Handle unknown error types
  return {
    message: 'An unexpected error occurred',
    status: 500,
    code: 'UNKNOWN_ERROR',
  };
};

/**
 * Builds query string from query parameters
 * @param params - Query parameters object
 * @returns URL search params string
 */
const buildQueryString = (params: PositionsQueryParams): string => {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.append(key, value.toString());
    }
  });

  return searchParams.toString();
};

/**
 * Position API Service Class
 * Contains all CRUD operations for Position management
 */
class PositionApiService {
  /**
   * Fetches all positions with optional query parameters
   * @param params - Optional query parameters for filtering and pagination
   * @returns Promise resolving to positions list response
   * @throws ApiError on request failure
   */
  async getAllPositions(
    params: PositionsQueryParams = {},
  ): Promise<Position[]> {
    try {
      console.log('📋 Fetching positions list with params:', params);

      // Note: The provided URL seems to be for users, but we'll use the positions endpoint
      // Adjusting to use positions endpoint instead of the provided users URL
      const queryString = buildQueryString(params);
      const url = `${POSITIONS_ENDPOINT}${queryString ? `?${queryString}` : ''}`;

      const response: AxiosResponse<Position[]> = await apiClient.get(url);

      console.log(`✅ Successfully fetched ${response.data.length} positions`);
      return response.data;
    } catch (error) {
      const apiError = handleApiError(error);
      console.error('❌ Failed to fetch positions:', apiError);
      throw apiError;
    }
  }

  /**
   * Fetches a single position by ID
   * @param id - Position ID
   * @returns Promise resolving to position data
   * @throws ApiError on request failure
   */
  async getPositionById(id: number): Promise<Position> {
    try {
      console.log(`📄 Fetching position with ID: ${id}`);

      const response: AxiosResponse<Position> = await apiClient.get(
        `${POSITIONS_ENDPOINT}/${id}`,
      );

      console.log(`✅ Successfully fetched position: ${response.data.name}`);
      return response.data;
    } catch (error) {
      const apiError = handleApiError(error);
      console.error(`❌ Failed to fetch position ${id}:`, apiError);
      throw apiError;
    }
  }

  /**
   * Creates a new position
   * @param positionData - Data for creating the position
   * @returns Promise resolving to created position
   * @throws ApiError on request failure or validation errors
   */
  async createPosition(positionData: CreatePositionDto): Promise<Position> {
    try {
      console.log('➕ Creating new position:', positionData);

      // Validate required fields before sending request
      if (!positionData.name?.trim()) {
        throw {
          message: 'Position name is required',
          status: 400,
          errors: { name: ['Position name is required'] },
          code: 'VALIDATION_ERROR',
        } as ApiError;
      }

      const response: AxiosResponse<Position> = await apiClient.post(
        POSITIONS_ENDPOINT,
        positionData,
      );

      console.log(
        `✅ Successfully created position: ${response.data.name} (ID: ${response.data.id})`,
      );
      return response.data;
    } catch (error) {
      const apiError = handleApiError(error);
      console.error('❌ Failed to create position:', apiError);
      throw apiError;
    }
  }

  /**
   * Updates an existing position
   * @param id - Position ID to update
   * @param positionData - Updated position data
   * @returns Promise resolving to updated position
   * @throws ApiError on request failure or validation errors
   */
  async updatePosition(
    id: number,
    positionData: UpdatePositionDto,
  ): Promise<Position> {
    try {
      console.log(`✏️ Updating position ${id}:`, positionData);

      // Validate required fields before sending request
      if (!positionData.name?.trim()) {
        throw {
          message: 'Position name is required',
          status: 400,
          errors: { name: ['Position name is required'] },
          code: 'VALIDATION_ERROR',
        } as ApiError;
      }

      const response: AxiosResponse<Position> = await apiClient.put(
        `${POSITIONS_ENDPOINT}/${id}`,
        positionData,
      );

      console.log(
        `✅ Successfully updated position: ${response.data.name} (ID: ${response.data.id})`,
      );
      return response.data;
    } catch (error) {
      const apiError = handleApiError(error);
      console.error(`❌ Failed to update position ${id}:`, apiError);
      throw apiError;
    }
  }

  /**
   * Deletes a position by ID
   * @param id - Position ID to delete
   * @returns Promise resolving to void on successful deletion
   * @throws ApiError on request failure
   */
  async deletePosition(id: number): Promise<void> {
    try {
      console.log(`🗑️ Deleting position with ID: ${id}`);

      // Note: The provided delete URL seems to be for users, using positions endpoint instead
      await apiClient.delete(`${POSITIONS_ENDPOINT}/${id}`);

      console.log(`✅ Successfully deleted position with ID: ${id}`);
    } catch (error) {
      const apiError = handleApiError(error);
      console.error(`❌ Failed to delete position ${id}:`, apiError);
      throw apiError;
    }
  }

  /**
   * Checks if a position slug is available (for validation)
   * @param slug - Slug to check
   * @param excludeId - Optional ID to exclude from uniqueness check (for updates)
   * @returns Promise resolving to boolean indicating availability
   */
  async isSlugAvailable(slug: string, excludeId?: number): Promise<boolean> {
    try {
      console.log(`🔍 Checking slug availability: ${slug}`);

      const params: PositionsQueryParams = { search: slug };
      const positions = await this.getAllPositions(params);

      // Check if any position has this slug (excluding the current one if updating)
      const conflictingPosition = positions.find(
        (position) => position.slug === slug && position.id !== excludeId,
      );

      const isAvailable = !conflictingPosition;
      console.log(
        `${isAvailable ? '✅' : '❌'} Slug "${slug}" is ${isAvailable ? 'available' : 'taken'}`,
      );

      return isAvailable;
    } catch (error) {
      console.error('❌ Error checking slug availability:', error);
      // In case of error, assume slug might be taken to be safe
      return false;
    }
  }
}

/**
 * Export singleton instance of the API service
 */
export const positionApiService = new PositionApiService();

/**
 * Export individual methods for named imports if preferred
 */
export const {
  getAllPositions,
  getPositionById,
  createPosition,
  updatePosition,
  deletePosition,
  isSlugAvailable,
} = positionApiService;

/**
 * Export the service class for dependency injection or testing
 */
export default PositionApiService;
