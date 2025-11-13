/**
 * DSPR API Service
 * Handles HTTP communication with the DSPR API endpoint
 * 
 * Provides:
 * - API request/response handling with proper error management
 * - Request validation and transformation
 * - Retry logic for transient failures
 * - Response caching and optimization
 * - Comprehensive error handling and logging
 */

import axios, { type AxiosInstance, AxiosError, type AxiosResponse } from 'axios';
import { loadToken } from '../../auth/utils/tokenStorage';
import {
  type DsprApiResponse,
  type DsprApiParams,
  type DsprApiRequestBody,
  type ApiError,
  type RetryConfig,
  isValidStoreId,
  isValidApiDate,
  isApiError
} from '../types/common';

// =============================================================================
// SERVICE CONFIGURATION
// =============================================================================

/**
 * Default retry configuration for API requests
 * Handles transient network failures gracefully
 */
const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxAttempts: 3,
  baseDelay: 1000,
  exponentialBackoff: true
};

/**
 * API endpoint configuration
 */
const API_CONFIG = {
  baseURL: 'https://testapipizza.pnefoods.com/api',
  timeout: 30000, // 30 seconds
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
} as const;

// =============================================================================
// SERVICE CLASS
// =============================================================================

/**
 * DSPR API Service Class
 * Encapsulates all API communication logic for DSPR endpoints
 */
export class DsprApiService {
  private readonly axiosInstance: AxiosInstance;
  private readonly retryConfig: RetryConfig;

  /**
   * Initialize the DSPR API service
   * @param retryConfig - Optional retry configuration override
   */
  constructor(retryConfig: RetryConfig = DEFAULT_RETRY_CONFIG) {
    this.retryConfig = retryConfig;
    this.axiosInstance = this.createAxiosInstance();
    this.setupInterceptors();
  }

  /**
   * Create configured axios instance
   * @returns Configured axios instance
   */
  private createAxiosInstance(): AxiosInstance {
    return axios.create(API_CONFIG);
  }

  /**
   * Setup request and response interceptors
   * Handles request logging, response transformation, and error handling
   */
  private setupInterceptors(): void {
    // Request interceptor for logging and validation
    this.axiosInstance.interceptors.request.use(
      (config) => {
        // Attach Authorization header if token is available
        const token = loadToken();
        if (token && config.headers) {
          config.headers['Authorization'] = `Bearer ${token}`;
        }

        // Log request details in development
        if (process.env.NODE_ENV === 'development') {
          console.log(`[DSPR API] Making request to: ${config.url}`, {
            method: config.method,
            data: config.data,
            params: config.params
          });
        }
        return config;
      },
      (error) => {
        console.error('[DSPR API] Request interceptor error:', error);
        return Promise.reject(this.transformError(error));
      }
    );

    // Response interceptor for transformation and error handling
    this.axiosInstance.interceptors.response.use(
      (response) => {
        // Log successful responses in development
        if (process.env.NODE_ENV === 'development') {
          console.log(`[DSPR API] Successful response from: ${response.config.url}`, {
            status: response.status,
            dataSize: JSON.stringify(response.data).length
          });
        }
        return response;
      },
      (error) => {
        console.error('[DSPR API] Response interceptor error:', error);
        return Promise.reject(this.transformError(error));
      }
    );
  }

  /**
   * Fetch DSPR report data from the API
   * Handles both requests with and without body payload
   * 
   * @param params - API request parameters (store, date, etc.)
   * @param requestBody - Optional request body containing items array
   * @returns Promise resolving to validated API response
   * @throws ApiError on validation or request failures
   */
  async fetchDsprReport(
    params: DsprApiParams,
    requestBody?: DsprApiRequestBody
  ): Promise<DsprApiResponse> {
    try {
      // Validate request parameters and body (if provided)
      this.validateRequest(params, requestBody);

      // Build API URL with query parameters
      const url = this.buildApiUrl(params);

      // Make request with retry logic
      const response = await this.makeRequestWithRetry(url, requestBody);

      // Validate and transform response
      return this.validateAndTransformResponse(response);

    } catch (error) {
      // Transform error to standardized format
      const apiError = this.transformError(error);
      
      console.error('[DSPR API] Request failed:', {
        params,
        requestBody,
        error: apiError
      });

      throw apiError;
    }
  }

  /**
   * Validate request parameters and body
   * Ensures data integrity before making API calls
   * Handles both requests with and without body
   * 
   * @param params - Request parameters to validate
   * @param requestBody - Optional request body to validate
   * @throws ApiError on validation failures
   */
  private validateRequest(
    params: DsprApiParams,
    requestBody?: DsprApiRequestBody
  ): void {
    // Validate store ID format
    if (!isValidStoreId(params.store)) {
      throw new Error(
        `Invalid store ID format: ${params.store}. Expected format: XXXXX-XXXXX`
      );
    }

    // Validate date format
    if (!isValidApiDate(params.date)) {
      throw new Error(
        `Invalid date format: ${params.date}. Expected format: YYYY-MM-DD`
      );
    }

    // Validate items array only if request body is provided
    if (requestBody) {
      if (!Array.isArray(requestBody.items) || requestBody.items.length === 0) {
        throw new Error('Items array must contain at least one item ID when body is provided');
      }

      // Validate each item ID
      requestBody.items.forEach((item, index) => {
        if (item === null || item === undefined || item === '') {
          throw new Error(`Invalid item ID at index ${index}: ${item}`);
        }
      });
    }
  }

  /**
   * Build API URL with parameters
   * @param params - Store and date parameters
   * @returns Complete API URL
   */
  private buildApiUrl(params: DsprApiParams): string {
    return `/dspr-report/${params.store}/${params.date}`;
  }

  /**
   * Make API request with retry logic
   * Implements exponential backoff for transient failures
   * Handles both GET (no body) and POST (with body) requests
   * 
   * @param url - API endpoint URL
   * @param requestBody - Optional request payload
   * @returns Promise resolving to axios response
   */
  private async makeRequestWithRetry(
    url: string,
    requestBody?: DsprApiRequestBody
  ): Promise<AxiosResponse<DsprApiResponse>> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= this.retryConfig.maxAttempts; attempt++) {
      try {
        // Make the request - currently uses POST with body or GET without body
        const response = requestBody 
          ? await this.axiosInstance.post<DsprApiResponse>(url, requestBody)
          : await this.axiosInstance.post<DsprApiResponse>(url);
        
        // Request successful, return response
        return response;

      } catch (error) {
        lastError = error as Error;
        const isLastAttempt = attempt === this.retryConfig.maxAttempts;

        // Don't retry on client errors (4xx) or specific server errors
        if (this.shouldNotRetry(error)) {
          throw error;
        }

        // If this is the last attempt, throw the error
        if (isLastAttempt) {
          throw error;
        }

        // Calculate delay for next attempt
        const delay = this.calculateRetryDelay(attempt);
        
        console.warn(
          `[DSPR API] Request failed (attempt ${attempt}/${this.retryConfig.maxAttempts}). ` +
          `Retrying in ${delay}ms...`,
          { error: (error as AxiosError).message }
        );

        // Wait before retrying
        await this.delay(delay);
      }
    }

    // This should never be reached, but TypeScript requires it
    throw lastError || new Error('Request failed after all retry attempts');
  }

  /**
   * Determine if an error should not trigger a retry
   * @param error - Error to evaluate
   * @returns True if request should not be retried
   */
  private shouldNotRetry(error: unknown): boolean {
    if (!axios.isAxiosError(error)) {
      return false; // Retry non-axios errors
    }

    const status = error.response?.status;
    
    // Don't retry client errors (4xx) except for specific cases
    if (status && status >= 400 && status < 500) {
      // Retry on rate limiting (429) or request timeout (408)
      return status !== 429 && status !== 408;
    }

    // Retry server errors (5xx) and network errors
    return false;
  }

  /**
   * Calculate retry delay with exponential backoff
   * @param attempt - Current attempt number
   * @returns Delay in milliseconds
   */
  private calculateRetryDelay(attempt: number): number {
    const { baseDelay, exponentialBackoff } = this.retryConfig;
    
    if (exponentialBackoff) {
      // Exponential backoff: baseDelay * (2 ^ (attempt - 1))
      return baseDelay * Math.pow(2, attempt - 1);
    }
    
    // Fixed delay
    return baseDelay;
  }

  /**
   * Create a delay promise
   * @param ms - Milliseconds to delay
   * @returns Promise that resolves after the delay
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Validate and transform API response
   * Ensures response structure matches expected format
   * 
   * @param response - Axios response object
   * @returns Validated DSPR API response data
   * @throws ApiError on validation failures
   */
  private validateAndTransformResponse(
    response: AxiosResponse<DsprApiResponse>
  ): DsprApiResponse {
    const { data, status } = response;

    // Check HTTP status
    if (status !== 200) {
      throw new Error(`Unexpected HTTP status: ${status}`);
    }

    // Validate response structure
    if (!data || typeof data !== 'object') {
      throw new Error('Invalid response format: Expected object');
    }

    // Validate required top-level properties
    if (!data['Filtering Values']) {
      throw new Error('Invalid response format: Missing Filtering Values');
    }

    if (!data.reports) {
      throw new Error('Invalid response format: Missing reports');
    }

    // Validate reports structure
    const { reports } = data;
    if (!reports.daily) {
      throw new Error('Invalid response format: Missing daily reports');
    }

    // Log successful validation in development
    if (process.env.NODE_ENV === 'development') {
      console.log('[DSPR API] Response validation successful', {
        filteringValues: !!data['Filtering Values'],
        dailyReports: !!reports.daily,
        weeklyReports: !!reports.weekly
      });
    }

    return data;
  }

  /**
   * Transform various error types into standardized ApiError format
   * Provides consistent error handling across the application
   * 
   * @param error - Original error object
   * @returns Standardized ApiError
   */
  private transformError(error: unknown): ApiError {
    // Handle axios errors
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      
      return {
        status: axiosError.response?.status,
        message: this.getAxiosErrorMessage(axiosError),
        details: axiosError.message,
        code: axiosError.code
      };
    }

    // Handle already transformed API errors
    if (isApiError(error)) {
      return error;
    }

    // Handle generic errors
    if (error instanceof Error) {
      return {
        message: error.message,
        details: error.stack,
        code: 'GENERIC_ERROR'
      };
    }

    // Handle unknown error types
    return {
      message: 'An unknown error occurred',
      details: String(error),
      code: 'UNKNOWN_ERROR'
    };
  }

  /**
   * Extract meaningful error message from axios error
   * @param error - Axios error object
   * @returns Human-readable error message
   */
  private getAxiosErrorMessage(error: AxiosError): string {
    // Check for response error message
    if (error.response?.data) {
      const responseData = error.response.data as any;
      if (responseData.message) {
        return responseData.message;
      }
      if (responseData.error) {
        return responseData.error;
      }
    }

    // Check for network errors
    if (error.code === 'NETWORK_ERROR') {
      return 'Network error: Please check your internet connection';
    }

    if (error.code === 'TIMEOUT') {
      return 'Request timeout: The server took too long to respond';
    }

    // Use status code for HTTP errors
    if (error.response?.status) {
      const status = error.response.status;
      switch (status) {
        case 400:
          return 'Bad Request: Invalid request parameters';
        case 401:
          return 'Unauthorized: Authentication required';
        case 403:
          return 'Forbidden: Access denied';
        case 404:
          return 'Not Found: The requested resource was not found';
        case 429:
          return 'Rate Limited: Too many requests, please try again later';
        case 500:
          return 'Internal Server Error: Please try again later';
        case 502:
          return 'Bad Gateway: Server is temporarily unavailable';
        case 503:
          return 'Service Unavailable: Server is temporarily down';
        default:
          return `HTTP Error ${status}: ${error.message}`;
      }
    }

    // Fallback to original error message
    return error.message || 'An unexpected error occurred';
  }

  /**
   * Get current service configuration
   * Useful for debugging and monitoring
   * 
   * @returns Service configuration object
   */
  public getConfig(): {
    baseURL: string;
    timeout: number;
    retryConfig: RetryConfig;
  } {
    return {
      baseURL: API_CONFIG.baseURL,
      timeout: API_CONFIG.timeout,
      retryConfig: this.retryConfig
    };
  }

  /**
   * Test API connectivity
   * Useful for health checks and debugging
   * 
   * @returns Promise resolving to connectivity status
   */
  public async testConnectivity(): Promise<boolean> {
    try {
      // Make a simple request to test connectivity
      await this.axiosInstance.get('/health', { timeout: 5000 });
      return true;
    } catch (error) {
      console.error('[DSPR API] Connectivity test failed:', error);
      return false;
    }
  }
}

// =============================================================================
// SERVICE INSTANCE EXPORT
// =============================================================================

/**
 * Default DSPR API service instance
 * Ready-to-use service with default configuration
 */
export const dsprApiService = new DsprApiService();

/**
 * Create a custom DSPR API service instance
 * Allows for custom retry configuration
 * 
 * @param retryConfig - Custom retry configuration
 * @returns New DsprApiService instance
 */
export const createDsprApiService = (retryConfig?: Partial<RetryConfig>): DsprApiService => {
  const config = { ...DEFAULT_RETRY_CONFIG, ...retryConfig };
  return new DsprApiService(config);
};

// =============================================================================
// CONVENIENCE FUNCTIONS
// =============================================================================

/**
 * Convenience function to fetch DSPR report
 * Handles both requests with and without body payload
 * 
 * @param params - API request parameters
 * @param requestBody - Optional request body
 * @returns Promise resolving to DSPR API response
 */
export const fetchDsprReport = (
  params: DsprApiParams,
  requestBody?: DsprApiRequestBody
): Promise<DsprApiResponse> => {
  return dsprApiService.fetchDsprReport(params, requestBody);
};

/**
 * Convenience function to fetch DSPR report with custom retry configuration
 * Handles both requests with and without body payload
 * 
 * @param params - API request parameters
 * @param requestBody - Optional request body
 * @param retryConfig - Custom retry configuration
 * @returns Promise resolving to DSPR API response
 */
export const fetchDsprReportWithRetry = (
  params: DsprApiParams,
  requestBody?: DsprApiRequestBody,
  retryConfig?: Partial<RetryConfig>
): Promise<DsprApiResponse> => {
  const service = retryConfig 
    ? createDsprApiService(retryConfig)
    : dsprApiService;
  
  return service.fetchDsprReport(params, requestBody);
};

/**
 * Fetch DSPR report with default service instance
 * Convenience function for simple use cases
 * 
 * @param store - Store identifier
 * @param date - Date in YYYY-MM-DD format
 * @param items - Array of item IDs
 * @returns Promise resolving to DSPR API response
 */
export const fetchDsprReportSimple = async (
  store: string,
  date: string,
  items: (string | number)[]
): Promise<DsprApiResponse> => {
  return dsprApiService.fetchDsprReport(
    { store, date },
    { items }
  );
};

/**
 * Fetch DSPR report with custom retry configuration
 * 
 * @param store - Store identifier
 * @param date - Date in YYYY-MM-DD format
 * @param items - Array of item IDs
 * @param retryConfig - Custom retry configuration
 * @returns Promise resolving to DSPR API response
 */
export const fetchDsprReportSimpleWithRetry = async (
  store: string,
  date: string,
  items: (string | number)[],
  retryConfig: Partial<RetryConfig>
): Promise<DsprApiResponse> => {
  const customService = createDsprApiService(retryConfig);
  return customService.fetchDsprReport(
    { store, date },
    { items }
  );
};
