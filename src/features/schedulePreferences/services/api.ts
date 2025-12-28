// src/features/schedulePreferences/services/api.ts

/**
 * Schedule Preference Service
 * 
 * Centralized service layer for all schedule preference API operations using Axios.
 * Provides type-safe HTTP methods with automatic authentication, error handling,
 * and response transformation.
 * 
 * Features:
 * - Automatic auth token attachment via interceptors
 * - Comprehensive error handling with logging
 * - Typed request/response interfaces
 * - Request/response interceptors for debugging
 * - Retry logic for failed requests
 * - Production-ready configuration
 * 
 * @fileoverview Service layer for schedule preferences API interactions
 * @author Generated for schedule preferences API integration
 * @version 1.0.0
 */

import axios, { 
  AxiosError,
  isAxiosError
} from 'axios';
import type { 
  AxiosInstance, 
  AxiosRequestConfig, 
  AxiosResponse, 
  InternalAxiosRequestConfig,
} from 'axios';
import { loadToken } from '../../auth/utils/tokenStorage';
import { store } from '../../../store'; // Adjust path as needed
import type {
  CreateSchedulePreferenceRequest,
  CreateSchedulePreferenceResponse,
  UpdateSchedulePreferenceRequest,
  UpdateSchedulePreferenceResponse,
  GetAllSchedulePreferencesResponse,
  GetSchedulePreferenceByIdResponse,
  ApiError
} from '../types';

// =============================================================================
// AXIOS MODULE DECLARATION MERGING FOR METADATA SUPPORT
// =============================================================================

declare module 'axios' {
  interface InternalAxiosRequestConfig {
    metadata?: {
      startTime?: number;
      retryAttempts?: number;
      retryDelay?: number;
      canRetry?: boolean;
      [key: string]: any;
    };
  }
}

// =============================================================================
// CONFIGURATION CONSTANTS
// =============================================================================

/**
 * Base configuration for the schedule preferences API
 */
const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_EMPLOYEMENT_INFO_NOT_WORKING_API_BASE_URL,
  ENDPOINTS: {
    SCHEDULE_PREFERENCES: '/schedule-preferences',
    SCHEDULE_PREFERENCE_BY_ID: (id: number) => `/schedule-preferences/${id}`
  },
  TIMEOUT: Number(import.meta.env.VITE_API_TIMEOUT), 
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000 // 1 second
} as const;

/**
 * HTTP status codes for better error handling
 */
const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500
} as const;

// =============================================================================
// TYPE DEFINITIONS FOR ERROR RESPONSES
// =============================================================================

/**
 * Expected structure of API error responses from backend
 * @interface ApiErrorResponse
 */
interface ApiErrorResponse {
  /** Error message from server */
  message?: string;
  /** Additional error details */
  details?: Record<string, any>;
  /** Validation errors for form fields */
  errors?: Record<string, string[]>;
  /** Error code */
  code?: string;
  /** Status text */
  status?: string;
}

/**
 * Type guard to check if error response has expected structure
 * @param data - Unknown data from error response
 * @returns {boolean} Whether data matches ApiErrorResponse structure
 */
const isApiErrorResponse = (data: unknown): data is ApiErrorResponse => {
  return (
    typeof data === 'object' &&
    data !== null &&
    (typeof (data as ApiErrorResponse).message === 'string' || 
     typeof (data as ApiErrorResponse).errors === 'object' ||
     typeof (data as ApiErrorResponse).details === 'object')
  );
};

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Helper function to get authentication token with fallback
 * Prioritizes Redux store token, falls back to localStorage
 * @returns {string | null} Authentication token or null if not available
 */
const getAuthToken = (): string | null => {
  try {
    // First, try to get token from Redux store
    const state = store.getState();
    const reduxToken = state.auth?.token;
    
    if (reduxToken) {
      console.debug('[SchedulePreferenceService] Token retrieved from Redux store');
      return reduxToken;
    }
    
    // Fallback to decrypt token from localStorage
    const localToken = loadToken();
    if (localToken) {
      console.debug('[SchedulePreferenceService] Token retrieved from localStorage');
      return localToken;
    }
    
    console.warn('[SchedulePreferenceService] No authentication token available');
    return null;
  } catch (error) {
    console.error('[SchedulePreferenceService] Error retrieving auth token:', error);
    return null;
  }
};

/**
 * Converts InternalAxiosRequestConfig to AxiosRequestConfig for retry requests
 * This is necessary because axios() method expects AxiosRequestConfig, not InternalAxiosRequestConfig
 * Note: We don't include metadata in the retry config since AxiosRequestConfig doesn't support it
 * @param {InternalAxiosRequestConfig} config - Internal config from error
 * @returns {AxiosRequestConfig} Config suitable for axios() method
 */
const convertToRetryConfig = (config: InternalAxiosRequestConfig): AxiosRequestConfig => {
  // Extract only the properties that exist in AxiosRequestConfig
  const retryConfig: AxiosRequestConfig = {
    url: config.url,
    method: config.method,
    baseURL: config.baseURL,
    headers: config.headers,
    data: config.data,
    params: config.params,
    timeout: config.timeout,
    withCredentials: config.withCredentials,
    responseType: config.responseType,
    responseEncoding: config.responseEncoding,
    maxRedirects: config.maxRedirects,
    maxContentLength: config.maxContentLength,
    maxBodyLength: config.maxBodyLength,
    validateStatus: config.validateStatus,
    auth: config.auth,
    proxy: config.proxy,
    signal: config.signal,
    transformRequest: config.transformRequest,
    transformResponse: config.transformResponse
    // Note: We intentionally don't include metadata as AxiosRequestConfig doesn't support it
  };

  return retryConfig;
};

/**
 * Transforms Axios error into standardized ApiError with proper type safety
 * @param {unknown} error - Error object (typed as unknown for safety)
 * @returns {ApiError} Standardized error object
 */
const transformAxiosError = (error: unknown): ApiError => {
  const apiError: ApiError = {
    message: 'An unexpected error occurred',
    status: 500
  };

  // Check if error is an Axios error using type guard
  if (isAxiosError<ApiErrorResponse>(error)) {
    if (error.response) {
      // Server responded with error status
      apiError.status = error.response.status;
      
      // Safely access response data with type checking
      const responseData = error.response.data;
      if (isApiErrorResponse(responseData)) {
        apiError.message = responseData.message || error.message || 'Server error';
        apiError.details = responseData.details as Record<string, any>;
        
        // Handle validation errors (422 Unprocessable Entity)
        if (error.response.status === HTTP_STATUS.UNPROCESSABLE_ENTITY && responseData.errors) {
          apiError.errors = responseData.errors;
        }
      } else {
        // Fallback if response data doesn't match expected structure
        apiError.message = error.message || 'Server error';
        apiError.details = responseData as Record<string, any>;
      }
    } else if (error.request) {
      // Network error
      apiError.message = 'Network error - please check your connection';
      apiError.status = 0;
    } else {
      // Request setup error
      apiError.message = error.message || 'Request configuration error';
    }
  } else if (error instanceof Error) {
    // Generic JavaScript error
    apiError.message = error.message || 'Unknown error occurred';
  } else if (typeof error === 'string') {
    // String error
    apiError.message = error;
  } else {
    // Unknown error type
    apiError.message = 'An unexpected error occurred';
    apiError.details = { originalError: error };
  }

  return apiError;
};

/**
 * Logs API request details for debugging
 * @param {InternalAxiosRequestConfig} config - Request configuration
 */
const logRequest = (config: InternalAxiosRequestConfig): void => {
  if (process.env.NODE_ENV === 'development') {
    console.group(`[API Request] ${config.method?.toUpperCase()} ${config.url}`);
    console.log('Headers:', config.headers);
    if (config.data) {
      console.log('Data:', config.data);
    }
    console.groupEnd();
  }
};

/**
 * Logs API response details for debugging
 * @param {AxiosResponse} response - Response object
 */
const logResponse = (response: AxiosResponse): void => {
  if (process.env.NODE_ENV === 'development') {
    console.group(`[API Response] ${response.status} ${response.config.url}`);
    console.log('Data:', response.data);
    console.log('Headers:', response.headers);
    console.groupEnd();
  }
};

/**
 * Logs API error details for debugging and monitoring
 * @param {unknown} error - Error object
 */
const logError = (error: unknown): void => {
  if (isAxiosError(error)) {
    const errorInfo = {
      message: error.message,
      status: error.response?.status,
      url: error.config?.url,
      method: error.config?.method,
      data: error.response?.data
    };

    console.group(`[API Error] ${error.config?.method?.toUpperCase()} ${error.config?.url}`);
    console.error('Error details:', errorInfo);
    console.groupEnd();

    // In production, you might want to send this to a logging service
    if (process.env.NODE_ENV === 'production') {
      // Example: Send to logging service
      // loggingService.logError(errorInfo);
    }
  } else {
    console.error('[API Error] Non-Axios error:', error);
  }
};

// =============================================================================
// SCHEDULE PREFERENCE SERVICE CLASS
// =============================================================================

/**
 * Schedule Preference Service Class
 * 
 * Centralized service for all schedule preference API operations.
 * Implements the singleton pattern to ensure consistent configuration.
 * 
 * @class SchedulePreferenceService
 */
class SchedulePreferenceService {
  private readonly axiosInstance: AxiosInstance;
  private static instance: SchedulePreferenceService;
  private retryCountMap = new Map<string, number>(); // Track retry attempts per request

  /**
   * Private constructor to implement singleton pattern
   * @private
   */
  private constructor() {
    // Create Axios instance with base configuration
    this.axiosInstance = axios.create({
      baseURL: API_CONFIG.BASE_URL,
      timeout: API_CONFIG.TIMEOUT,
      headers: {
        'Content-Type': import.meta.env.VITE_API_CONTENT_TYPE,
        'Accept': import.meta.env.VITE_API_ACCEPT
      }
    });

    this.setupInterceptors();
  }

  /**
   * Get singleton instance of SchedulePreferenceService
   * @returns {SchedulePreferenceService} Service instance
   */
  public static getInstance(): SchedulePreferenceService {
    if (!SchedulePreferenceService.instance) {
      SchedulePreferenceService.instance = new SchedulePreferenceService();
    }
    return SchedulePreferenceService.instance;
  }

  /**
   * Generates a unique key for tracking retry attempts
   * @private
   * @param {string} method - HTTP method
   * @param {string} url - Request URL
   * @returns {string} Unique key for the request
   */
  private generateRetryKey(method: string = 'GET', url: string = ''): string {
    return `${method.toUpperCase()}_${url}_${Date.now()}`;
  }

  /**
   * Setup request and response interceptors
   * @private
   */
  private setupInterceptors(): void {
    // Request interceptor - Add auth token and logging
    this.axiosInstance.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        // Add authentication token to headers
        const token = getAuthToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }

        // Add request timestamp for debugging
        config.metadata = {
          ...config.metadata,
          startTime: Date.now(),
          retryKey: this.generateRetryKey(config.method, config.url)
        };

        logRequest(config);
        return config;
      },
      (error: unknown) => {
        console.error('[SchedulePreferenceService] Request interceptor error:', error);
        return Promise.reject(transformAxiosError(error));
      }
    );

    // Response interceptor - Handle responses and errors
    this.axiosInstance.interceptors.response.use(
      (response: AxiosResponse) => {
        // Calculate request duration for monitoring
        const duration = Date.now() - (response.config.metadata?.startTime || 0);
        console.debug(`[SchedulePreferenceService] Request completed in ${duration}ms`);

        // Clean up retry tracking for successful requests
        if (response.config.metadata?.retryKey) {
          this.retryCountMap.delete(response.config.metadata.retryKey);
        }

        logResponse(response);
        return response;
      },
      async (error: unknown) => {
        logError(error);

        // Handle retry logic for Axios errors
        if (isAxiosError(error) && this.shouldRetryRequest(error)) {
          return this.retryRequest(error);
        }

        // Clean up retry tracking for failed requests
        if (isAxiosError(error) && error.config?.metadata?.retryKey) {
          this.retryCountMap.delete(error.config.metadata.retryKey);
        }

        // Handle specific HTTP status codes for Axios errors
        if (isAxiosError(error) && error.response?.status === HTTP_STATUS.UNAUTHORIZED) {
          console.warn('[SchedulePreferenceService] Unauthorized access - token may be expired');
          // You might want to dispatch a logout action here
          // store.dispatch(authActions.logout());
        }

        return Promise.reject(transformAxiosError(error));
      }
    );
  }

  /**
   * Determines if a request should be retried based on error type
   * @private
   * @param {AxiosError} error - The error that occurred
   * @returns {boolean} Whether the request should be retried
   */
  private shouldRetryRequest(error: AxiosError): boolean {
    const config = error.config;
    const retryKey = config?.metadata?.retryKey;
    
    if (!retryKey) {
      return false;
    }

    const currentRetryCount = this.retryCountMap.get(retryKey) || 0;
    
    // Don't retry if retries are exhausted
    if (currentRetryCount >= API_CONFIG.RETRY_ATTEMPTS) {
      return false;
    }

    // Retry on network errors or specific server errors
    if (!error.response) {
      return true; // Network error
    }

    const status = error.response.status;
    return status >= 500 || status === HTTP_STATUS.BAD_REQUEST; // Server errors or rate limiting
  }

  /**
   * Retries a failed request with exponential backoff
   * @private
   * @param {AxiosError} error - The error that occurred
   * @returns {Promise<AxiosResponse>} Retry attempt promise
   */
  private async retryRequest(error: AxiosError): Promise<AxiosResponse> {
    const config = error.config;
    
    if (!config || !config.metadata?.retryKey) {
      throw transformAxiosError(error);
    }

    const retryKey = config.metadata.retryKey;
    const currentRetryCount = this.retryCountMap.get(retryKey) || 0;
    const retryAttempt = currentRetryCount + 1;
    const delay = API_CONFIG.RETRY_DELAY * Math.pow(2, retryAttempt - 1); // Exponential backoff

    console.warn(`[SchedulePreferenceService] Retrying request (attempt ${retryAttempt}/${API_CONFIG.RETRY_ATTEMPTS}) in ${delay}ms`);

    // Update retry count
    this.retryCountMap.set(retryKey, retryAttempt);

    // Wait for delay before retrying
    await new Promise(resolve => setTimeout(resolve, delay));

    // Convert to AxiosRequestConfig for retry (without metadata)
    const retryConfig = convertToRetryConfig(config);
    
    // Use the axios instance with the converted config
    return this.axiosInstance.request(retryConfig);
  }

  // ==========================================================================
  // PUBLIC API METHODS
  // ==========================================================================

  /**
   * Fetch all schedule preferences
   * 
   * @async
   * @returns {Promise<GetAllSchedulePreferencesResponse>} Array of schedule preferences
   * @throws {ApiError} When the request fails
   * 
   * @example
   * ```
   * const schedulePreferences = await service.getAllSchedulePreferences();
   * console.log('Found', schedulePreferences.length, 'schedule preferences');
   * ```
   */
  public async getAllSchedulePreferences(): Promise<GetAllSchedulePreferencesResponse> {
    try {
      console.info('[SchedulePreferenceService] Fetching all schedule preferences');
      
      const response = await this.axiosInstance.get<GetAllSchedulePreferencesResponse>(
        API_CONFIG.ENDPOINTS.SCHEDULE_PREFERENCES
      );

      console.info(`[SchedulePreferenceService] Successfully fetched ${response.data.length} schedule preferences`);
      return response.data;
    } catch (error) {
      console.error('[SchedulePreferenceService] Failed to fetch schedule preferences:', error);
      throw transformAxiosError(error);
    }
  }

  /**
   * Fetch schedule preference by ID
   * 
   * @async
   * @param {number} id - Schedule preference ID
   * @returns {Promise<GetSchedulePreferenceByIdResponse>} Schedule preference object
   * @throws {ApiError} When the request fails
   * 
   * @example
   * ```
   * const preference = await service.getSchedulePreferenceById(1);
   * console.log('Employee:', preference.emp_info.full_name);
   * ```
   */
  public async getSchedulePreferenceById(id: number): Promise<GetSchedulePreferenceByIdResponse> {
    try {
      console.info(`[SchedulePreferenceService] Fetching schedule preference with ID: ${id}`);
      
      const response = await this.axiosInstance.get<GetSchedulePreferenceByIdResponse>(
        API_CONFIG.ENDPOINTS.SCHEDULE_PREFERENCE_BY_ID(id)
      );

      console.info(`[SchedulePreferenceService] Successfully fetched schedule preference ${id}`);
      return response.data;
    } catch (error) {
      console.error(`[SchedulePreferenceService] Failed to fetch schedule preference ${id}:`, error);
      throw transformAxiosError(error);
    }
  }

  /**
   * Create a new schedule preference
   * 
   * @async
   * @param {CreateSchedulePreferenceRequest} data - Schedule preference data
   * @returns {Promise<CreateSchedulePreferenceResponse>} Created schedule preference
   * @throws {ApiError} When the request fails or validation errors occur
   * 
   * @example
   * ```
   * const newPreference = await service.createSchedulePreference({
   *   emp_info_id: 5,
   *   preference_id: 2,
   *   maximum_hours: 8,
   *   employment_type: 'FT'
   * });
   * console.log('Created preference with ID:', newPreference.id);
   * ```
   */
  public async createSchedulePreference(
    data: CreateSchedulePreferenceRequest
  ): Promise<CreateSchedulePreferenceResponse> {
    try {
      console.info('[SchedulePreferenceService] Creating new schedule preference');
      console.debug('[SchedulePreferenceService] Create data:', data);
      
      const response = await this.axiosInstance.post<CreateSchedulePreferenceResponse>(
        API_CONFIG.ENDPOINTS.SCHEDULE_PREFERENCES,
        data
      );

      console.info(`[SchedulePreferenceService] Successfully created schedule preference with ID: ${response.data.id}`);
      return response.data;
    } catch (error) {
      console.error('[SchedulePreferenceService] Failed to create schedule preference:', error);
      throw transformAxiosError(error);
    }
  }

  /**
   * Update an existing schedule preference
   * 
   * @async
   * @param {number} id - Schedule preference ID
   * @param {UpdateSchedulePreferenceRequest} data - Updated schedule preference data
   * @returns {Promise<UpdateSchedulePreferenceResponse>} Updated schedule preference
   * @throws {ApiError} When the request fails or validation errors occur
   * 
   * @example
   * ```
   * const updatedPreference = await service.updateSchedulePreference(1, {
   *   emp_info_id: 5,
   *   preference_id: 3,
   *   maximum_hours: 6,
   *   employment_type: 'PT'
   * });
   * console.log('Updated preference:', updatedPreference.id);
   * ```
   */
  public async updateSchedulePreference(
    id: number,
    data: UpdateSchedulePreferenceRequest
  ): Promise<UpdateSchedulePreferenceResponse> {
    try {
      console.info(`[SchedulePreferenceService] Updating schedule preference ${id}`);
      console.debug('[SchedulePreferenceService] Update data:', data);
      
      const response = await this.axiosInstance.put<UpdateSchedulePreferenceResponse>(
        API_CONFIG.ENDPOINTS.SCHEDULE_PREFERENCE_BY_ID(id),
        data
      );

      console.info(`[SchedulePreferenceService] Successfully updated schedule preference ${id}`);
      return response.data;
    } catch (error) {
      console.error(`[SchedulePreferenceService] Failed to update schedule preference ${id}:`, error);
      throw transformAxiosError(error);
    }
  }

  /**
   * Delete a schedule preference
   * 
   * @async
   * @param {number} id - Schedule preference ID
   * @returns {Promise<void>} Resolves when deletion is successful
   * @throws {ApiError} When the request fails
   * 
   * @example
   * ```
   * await service.deleteSchedulePreference(1);
   * console.log('Schedule preference deleted successfully');
   * ```
   */
  public async deleteSchedulePreference(id: number): Promise<void> {
    try {
      console.info(`[SchedulePreferenceService] Deleting schedule preference ${id}`);
      
      await this.axiosInstance.delete(API_CONFIG.ENDPOINTS.SCHEDULE_PREFERENCE_BY_ID(id));

      console.info(`[SchedulePreferenceService] Successfully deleted schedule preference ${id}`);
    } catch (error) {
      console.error(`[SchedulePreferenceService] Failed to delete schedule preference ${id}:`, error);
      throw transformAxiosError(error);
    }
  }

  // ==========================================================================
  // UTILITY METHODS
  // ==========================================================================

  /**
   * Check if the service is properly authenticated
   * @returns {boolean} Whether authentication token is available
   */
  public isAuthenticated(): boolean {
    return getAuthToken() !== null;
  }

  /**
   * Get current request timeout configuration
   * @returns {number} Timeout in milliseconds
   */
  public getTimeout(): number {
    return API_CONFIG.TIMEOUT;
  }

  /**
   * Update request timeout (useful for long-running operations)
   * @param {number} timeout - New timeout in milliseconds
   */
  public setTimeout(timeout: number): void {
    this.axiosInstance.defaults.timeout = timeout;
    console.info(`[SchedulePreferenceService] Request timeout updated to ${timeout}ms`);
  }

  /**
   * Get base URL for the service
   * @returns {string} Base API URL
   */
  public getBaseUrl(): string {
    return API_CONFIG.BASE_URL;
  }

  /**
   * Clear all retry tracking data (useful for cleanup)
   */
  public clearRetryTracking(): void {
    this.retryCountMap.clear();
    console.debug('[SchedulePreferenceService] Retry tracking data cleared');
  }
}

// =============================================================================
// SINGLETON INSTANCE EXPORT
// =============================================================================

/**
 * Singleton instance of SchedulePreferenceService
 * Use this instance throughout your application for consistency
 * 
 * @example
 * ```
 * import { schedulePreferenceService } from './services/schedulePreferenceService';
 * 
 * // In your component or thunk
 * const preferences = await schedulePreferenceService.getAllSchedulePreferences();
 * ```
 */
export const schedulePreferenceService = SchedulePreferenceService.getInstance();

/**
 * Export the service class for testing purposes
 * @internal
 */
export { SchedulePreferenceService };

/**
 * Export configuration for testing and debugging
 * @internal
 */
export { API_CONFIG, HTTP_STATUS };
