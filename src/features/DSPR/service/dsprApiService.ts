/**
 * ============================================================================
 * DSPR API SERVICE
 * ============================================================================
 * Domain: DSPR (Daily Sales Performance Report)
 * 
 * Responsibility:
 * - Provides an Axios-based HTTP client for the DSPR API
 * - Handles authentication via Bearer token injection
 * - Implements automatic retry logic with exponential backoff
 * - Transforms HTTP errors into structured ApiError objects
 * - Manages request/response interceptors for logging and validation
 * 
 * Key Features:
 * - Centralized API configuration (base URL, timeout)
 * - Request interceptor: attaches Authorization header using loadToken()
 * - Response interceptor: logs responses in dev and normalizes errors
 * - Retry mechanism: configurable attempts, delay, and backoff strategy
 * - No retries on 4xx errors (except 408 Request Timeout, 429 Too Many Requests)
 * - Automatic retry on 5xx errors and network failures
 * 
 * Usage:
 * ```
 * const service = DsprApiService.getInstance();
 * const response = await service.fetchDsprReport({ store: '03795-00001', date: '2025-11-16' });
 * ```
 */

import axios, { type AxiosInstance, AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { loadToken } from '../../auth/utils/tokenStorage';
import {
  type DsprApiRequest,
  type DsprApiResponse,
  type ApiError,
  type RetryConfig,
  isValidStoreId,
  isValidApiDate,
} from '@/features/DSPR/types/dspr.common';

// ============================================================================
// CONSTANTS
// ============================================================================

/**
 * Base URL for the DSPR API endpoints
 */
const BASE_URL = 'https://testapipizza.pnefoods.com/api';

/**
 * Default timeout for API requests (30 seconds)
 */
const DEFAULT_TIMEOUT = 30000;

/**
 * Default retry configuration
 */
const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxAttempts: 3,
  baseDelay: 500, // 500ms  
  maxDelay: 10000, // 10 seconds
  backoffMultiplier: 2, // Exponential backoff
};

/**
 * HTTP status codes that should NOT trigger a retry
 * (Client errors except Request Timeout and Too Many Requests)
 */
const NO_RETRY_STATUS_CODES = new Set([
  400, 401, 402, 403, 404, 405, 406, 407, 409, 410, 411, 412, 413, 414, 415,
  416, 417, 418, 421, 422, 423, 424, 425, 426, 428, 431, 451,
]);

/**
 * HTTP status codes that SHOULD trigger a retry
 * (Request Timeout, Too Many Requests, and all 5xx server errors)
 */
const RETRY_STATUS_CODES = new Set([408, 429, 500, 501, 502, 503, 504, 505, 506, 507, 508, 510, 511]);

// ============================================================================
// DSPR API SERVICE CLASS
// ============================================================================

/**
 * Singleton service class for interacting with the DSPR API
 * 
 * This service provides a fully configured Axios instance with:
 * - Automatic Bearer token injection
 * - Request/response logging
 * - Retry logic with exponential backoff
 * - Structured error handling
 */
export class DsprApiService {
  private static instance: DsprApiService;
  private axiosInstance: AxiosInstance;
  private retryConfig: RetryConfig;

  /**
   * Private constructor to enforce singleton pattern
   * @param retryConfig - Optional custom retry configuration
   */
  private constructor(retryConfig: RetryConfig = DEFAULT_RETRY_CONFIG) {
    this.retryConfig = retryConfig;
    this.axiosInstance = this.createAxiosInstance();
    this.setupInterceptors();
  }

  /**
   * Get the singleton instance of DsprApiService
   * @param retryConfig - Optional custom retry configuration (only used on first call)
   * @returns The singleton DsprApiService instance
   */
  public static getInstance(retryConfig?: RetryConfig): DsprApiService {
    if (!DsprApiService.instance) {
      DsprApiService.instance = new DsprApiService(retryConfig);
    }
    return DsprApiService.instance;
  }

  // --------------------------------------------------------------------------
  // AXIOS INSTANCE CREATION
  // --------------------------------------------------------------------------

  /**
   * Creates and configures the Axios instance
   * @returns Configured AxiosInstance
   */
  private createAxiosInstance(): AxiosInstance {
    return axios.create({
      baseURL: BASE_URL,
      timeout: DEFAULT_TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  // --------------------------------------------------------------------------
  // INTERCEPTOR SETUP
  // --------------------------------------------------------------------------

  /**
   * Sets up request and response interceptors for the Axios instance
   */
  private setupInterceptors(): void {
    this.setupRequestInterceptor();
    this.setupResponseInterceptor();
  }

  /**
   * Request interceptor for authentication and logging
   */
  private setupRequestInterceptor(): void {
    this.axiosInstance.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        // Attach Authorization header if token is available
        const token = loadToken();
        if (token && config.headers) {
          config.headers['Authorization'] = `Bearer ${token}`;
        }

        // Log request in development
        if (process.env.NODE_ENV === 'development') {
          console.log('[DSPR API Request]', {
            method: config.method?.toUpperCase(),
            url: config.url,
            params: config.params,
            data: config.data,
            hasToken: !!token,
          });
        }

        return config;
      },
      (error: AxiosError) => {
        console.error('[DSPR API Request Error]', error);
        return Promise.reject(this.transformError(error));
      }
    );
  }

  /**
   * Response interceptor for logging and error transformation
   */
  private setupResponseInterceptor(): void {
    this.axiosInstance.interceptors.response.use(
      (response) => {
        // Log successful response in development
        if (process.env.NODE_ENV === 'development') {
          console.log('[DSPR API Response]', {
            status: response.status,
            url: response.config.url,
            dataSize: JSON.stringify(response.data).length,
          });
        }
        return response;
      },
      (error: AxiosError) => {
        console.error('[DSPR API Response Error]', {
          status: error.response?.status,
          url: error.config?.url,
          message: error.message,
        });
        return Promise.reject(this.transformError(error));
      }
    );
  }

  // --------------------------------------------------------------------------
  // ERROR HANDLING
  // --------------------------------------------------------------------------

  /**
   * Transforms an Axios error into a structured ApiError
   * @param error - The Axios error to transform
   * @returns Structured ApiError object
   */
  private transformError(error: AxiosError): ApiError {
    if (error.response) {
      // Server responded with error status
      return {
        status: error.response.status,
        message: this.extractErrorMessage(error),
        details: error.response.data ? JSON.stringify(error.response.data) : undefined,
        code: error.code,
      };
    } else if (error.request) {
      // Request was made but no response received (network error)
      return {
        message: 'Network error: No response received from server',
        details: error.message,
        code: error.code || 'NETWORK_ERROR',
      };
    } else {
      // Error in request setup
      return {
        message: error.message || 'An unexpected error occurred',
        details: error.stack,
        code: error.code || 'REQUEST_SETUP_ERROR',
      };
    }
  }

  /**
   * Extracts a meaningful error message from an Axios error
   * @param error - The Axios error
   * @returns Human-readable error message
   */
  private extractErrorMessage(error: AxiosError): string {
    if (error.response?.data) {
      const data = error.response.data as any;
      return data.message || data.error || error.message;
    }
    return error.message || 'An unknown error occurred';
  }

  /**
   * Determines if an error should trigger a retry
   * @param error - The error to check
   * @param attemptNumber - Current attempt number
   * @returns True if the request should be retried
   */
  private shouldRetry(error: ApiError, attemptNumber: number): boolean {
    // Don't retry if max attempts reached
    if (attemptNumber >= this.retryConfig.maxAttempts) {
      return false;
    }

    // No status code means network error - should retry
    if (!error.status) {
      return true;
    }

    // Check if status code is in the retry list
    if (RETRY_STATUS_CODES.has(error.status)) {
      return true;
    }

    // Don't retry 4xx errors (except 408 and 429 which are in RETRY_STATUS_CODES)
    if (NO_RETRY_STATUS_CODES.has(error.status)) {
      return false;
    }

    // Default: retry on 5xx errors
    return error.status >= 500;
  }

  /**
   * Calculates the delay before the next retry attempt
   * Uses exponential backoff with optional jitter
   * @param attemptNumber - Current attempt number (0-indexed)
   * @returns Delay in milliseconds
   */
  private calculateRetryDelay(attemptNumber: number): number {
    const { baseDelay, maxDelay, backoffMultiplier } = this.retryConfig;
    
    // Exponential backoff: baseDelay * (backoffMultiplier ^ attemptNumber)
    const exponentialDelay = baseDelay * Math.pow(backoffMultiplier, attemptNumber);
    
    // Add jitter (random value between 0 and 100ms) to prevent thundering herd
    const jitter = Math.random() * 100;
    
    // Cap at maxDelay
    return Math.min(exponentialDelay + jitter, maxDelay);
  }

  /**
   * Waits for the specified delay
   * @param ms - Milliseconds to wait
   */
  private async delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // --------------------------------------------------------------------------
  // REQUEST VALIDATION
  // --------------------------------------------------------------------------

  /**
   * Validates the request parameters
   * @param request - The request to validate
   * @throws Error if validation fails
   */
  private validateRequest(request: DsprApiRequest): void {
    if (!isValidStoreId(request.store)) {
      throw new Error(
        `Invalid store ID format: "${request.store}". Expected format: "XXXXX-XXXXX" (e.g., "03795-00001")`
      );
    }

    if (!isValidApiDate(request.date)) {
      throw new Error(
        `Invalid date format: "${request.date}". Expected format: "YYYY-MM-DD" (e.g., "2025-11-16")`
      );
    }
  }

  // --------------------------------------------------------------------------
  // PUBLIC API METHODS
  // --------------------------------------------------------------------------

  /**
   * Fetches a DSPR report for the specified store and date
   * Automatically retries on failure according to retry configuration
   * 
   * @param request - The request parameters (store and date)
   * @returns Promise resolving to the DSPR API response
   * @throws ApiError if the request fails after all retry attempts
   * 
   * @example
   * ```
   * const service = DsprApiService.getInstance();
   * try {
   *   const response = await service.fetchDsprReport({
   *     store: '03795-00001',
   *     date: '2025-11-16'
   *   });
   *   console.log('Total Sales:', response.reports.daily.dailyDSPRData.Total_Sales);
   * } catch (error) {
   *   console.error('Failed to fetch DSPR report:', error);
   * }
   * ```
   */
  public async fetchDsprReport(request: DsprApiRequest): Promise<DsprApiResponse> {
    // Validate request parameters
    this.validateRequest(request);

    let lastError: ApiError | null = null;
    let attemptNumber = 0;

    while (attemptNumber < this.retryConfig.maxAttempts) {
      try {
        const url = `/dspr-report/${request.store}/${request.date}`;
        
        if (process.env.NODE_ENV === 'development' && attemptNumber > 0) {
          console.log(`[DSPR API Retry] Attempt ${attemptNumber + 1} of ${this.retryConfig.maxAttempts}`);
        }

        const response = await this.axiosInstance.post<DsprApiResponse>(url, request.body || {});
        
        // Success - return the data
        return response.data;
      } catch (error) {
        // Transform and store the error
        lastError = error as ApiError;

        // Check if we should retry
        if (this.shouldRetry(lastError, attemptNumber + 1)) {
          const delay = this.calculateRetryDelay(attemptNumber);
          
          if (process.env.NODE_ENV === 'development') {
            console.log(
              `[DSPR API Retry] Waiting ${delay}ms before retry ${attemptNumber + 2} (error: ${lastError.status || 'network'})`
            );
          }

          await this.delay(delay);
          attemptNumber++;
        } else {
          // No retry - throw the error
          throw lastError;
        }
      }
    }

    // All retries exhausted - throw the last error
    throw lastError || {
      message: 'Failed to fetch DSPR report after all retry attempts',
      code: 'MAX_RETRIES_EXCEEDED',
    };
  }

  /**
   * Convenience method: Fetches a DSPR report with separate store and date parameters
   * 
   * @param store - Store ID in format "XXXXX-XXXXX"
   * @param date - Date in format "YYYY-MM-DD"
   * @param body - Optional request body
   * @returns Promise resolving to the DSPR API response
   * 
   * @example
   * ```
   * const response = await service.fetchDsprReportSimple('03795-00001', '2025-11-16');
   * ```
   */
  public async fetchDsprReportSimple(
    store: string,
    date: string,
    body?: Record<string, unknown>
  ): Promise<DsprApiResponse> {
    return this.fetchDsprReport({ store, date, body });
  }

  // --------------------------------------------------------------------------
  // UTILITY METHODS
  // --------------------------------------------------------------------------

  /**
   * Updates the retry configuration
   * @param config - Partial retry configuration to update
   */
  public updateRetryConfig(config: Partial<RetryConfig>): void {
    this.retryConfig = { ...this.retryConfig, ...config };
  }

  /**
   * Gets the current retry configuration
   * @returns Current retry configuration
   */
  public getRetryConfig(): RetryConfig {
    return { ...this.retryConfig };
  }

  /**
   * Gets the underlying Axios instance (for advanced usage)
   * @returns The configured Axios instance
   */
  public getAxiosInstance(): AxiosInstance {
    return this.axiosInstance;
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

/**
 * Default export: Singleton instance of DsprApiService
 */
export default DsprApiService.getInstance();

/**
 * Named exports for flexibility
 */
export { BASE_URL, DEFAULT_TIMEOUT, DEFAULT_RETRY_CONFIG };
