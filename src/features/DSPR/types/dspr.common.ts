/**
 * ============================================================================
 * DSPR COMMON TYPES
 * ============================================================================
 * Domain: DSPR (Daily Sales Performance Report) - Common/Shared Types
 * 
 * Responsibility:
 * - Defines core type primitives used across all DSPR domains
 * - Provides shared API request/response structures
 * - Exports common state management types (ApiState, ApiStatus, ApiError)
 * - Contains type guards and validation utilities for API parameters
 * - Defines retry configuration and filtering metadata
 * 
 * Related Files:
 * - Used by: service/dsprApiService.ts (API calls)
 * - Used by: All domain-specific type files (hourly, DSQR, daily, weekly)
 * - Used by: state/dsprApiSlice.ts (central Redux state)
 * 
 * Key Types:
 * - StoreId, ApiDate: Branded primitives for store and date parameters
 * - DsprApiRequest, DsprApiResponse: Request/response shapes for API calls
 * - FilteringValues: Metadata about the current report (date, store, week, etc.)
 * - ApiState<T>: Generic async state wrapper with status tracking
 * - ApiError: Structured error object for HTTP failures
 * - RetryConfig: Configuration for retry logic in API service
 */

// ============================================================================
// PRIMITIVE TYPES
// ============================================================================

/**
 * Store ID in the format "XXXXX-XXXXX"
 * Example: "03795-00001"
 */
export type StoreId = string;

/**
 * API date in ISO format "YYYY-MM-DD"
 * Example: "2025-11-16"
 */
export type ApiDate = string;

/**
 * ISO 8601 datetime string
 * Example: "2025-11-11T05:00:00.000000Z"
 */
export type ISODateTime = string;

/**
 * Week number (1-52)
 */
export type WeekNumber = number;

// ============================================================================
// API REQUEST & RESPONSE TYPES
// ============================================================================

/**
 * Parameters for the DSPR API request
 */
export interface DsprApiParams {
  /** Store ID in format "XXXXX-XXXXX" */
  store: StoreId;
  
  /** Date in format "YYYY-MM-DD" */
  date: ApiDate;
}

/**
 * Full DSPR API request structure
 * Includes path params (store, date) and optional body
 */
export interface DsprApiRequest extends DsprApiParams {
  /** Optional request body for POST payload */
  body?: Record<string, unknown>;
}

/**
 * Filtering/metadata values returned by the API
 * Provides context about the report scope and time period
 */
export interface FilteringValues {
  /** Report date (YYYY-MM-DD) */
  date: ApiDate;
  
  /** Store ID (XXXXX-XXXXX) */
  store: StoreId;
  
  /** Array of item codes included in the report */
  items: number[];
  
  /** Week number (1-52) */
  week: WeekNumber;
  
  /** Week start date (ISO format) */
  weekStartDate: ISODateTime;
  
  /** Week end date (ISO format) */
  weekEndDate: ISODateTime;
  
  /** Lookback period start date (ISO format) */
  lookBackStart: ISODateTime;
  
  /** Lookback period end date (ISO format) */
  lookBackEnd: ISODateTime;
  
  /** URL for deposit/delivery DSQR weekly data */
  depositDeliveryUrl: string;
}

/**
 * Reports container returned by the API
 * Contains daily, weekly, and historical DSPR data
 */
export interface Reports {
  /** Daily reports (hourly sales, DSQR, daily DSPR) */
  daily: DailyReports;
  
  /** Weekly aggregate reports (current week, previous week, daily breakdown) */
  weekly: WeeklyReports;
}

/**
 * Daily reports structure
 * Note: Actual data types imported from domain-specific type files
 */
export interface DailyReports {
  /** Hourly sales breakdown for the day */
  dailyHourlySales: unknown; // Will be typed as DailyHourlySales in dspr.hourlySales.ts
  
  /** Daily DSQR (Delivery Service Quality Rating) metrics */
  dailyDSQRData: unknown; // Will be typed as DailyDSQRData in dspr.dsqr.ts
  
  /** Daily DSPR (Daily Sales Performance Report) operational metrics */
  dailyDSPRData: unknown; // Will be typed as DailyDSPRData in dspr.daily.ts
}

/**
 * Weekly reports structure
 * Note: Actual data types imported from domain-specific type files
 */
export interface WeeklyReports {
  /** Current week aggregate DSPR metrics */
  DSPRData: unknown; // Will be typed as WeeklyDSPRData in dspr.weeklyCurrent.ts
  
  /** Previous week aggregate DSPR metrics */
  PrevWeekDSPRData: unknown; // Will be typed as PrevWeekDSPRData in dspr.weeklyPrev.ts
  
  /** Daily DSPR breakdown by date (with previous week comparison) */
  DailyDSPRByDate: unknown; // Will be typed as DailyDSPRByDate in dspr.dailyByDate.ts
}

/**
 * Complete DSPR API response structure
 * Top-level response from POST /api/dspr-report/{store}/{date}
 */
export interface DsprApiResponse {
  /** Filtering metadata and report context */
  FilteringValues: FilteringValues;
  
  /** All report data (daily, weekly, historical) */
  reports: Reports;
}

// ============================================================================
// ASYNC STATE MANAGEMENT TYPES
// ============================================================================

/**
 * API request status values
 * Represents the lifecycle state of an async operation
 */
export const ApiStatus = {
  /** Initial state, no request made yet */
  Idle: 'idle',
  
  /** Request in progress */
  Loading: 'loading',
  
  /** Request completed successfully */
  Succeeded: 'succeeded',
  
  /** Request failed with error */
  Failed: 'failed',
} as const;

/**
 * API request status type
 */
export type ApiStatus = (typeof ApiStatus)[keyof typeof ApiStatus];


/**
 * Structured API error object
 * Used for consistent error handling across all API calls
 */
export interface ApiError {
  /** HTTP status code (if available) */
  status?: number;
  
  /** Human-readable error message */
  message: string;
  
  /** Additional error details (stack trace, response body, etc.) */
  details?: string;
  
  /** Error code (HTTP error code, custom error code, etc.) */
  code?: string;
}

/**
 * Generic async state wrapper
 * Wraps any data type with loading state and error tracking
 * 
 * @template T - The type of data being managed
 */
export interface ApiState<T> {
  /** The actual data (null until first successful fetch) */
  data: T | null;
  
  /** Current request status */
  status: ApiStatus;
  
  /** Error object (if request failed) */
  error: ApiError | null;
  
  /** Timestamp of last successful fetch (ISO string) */
  lastFetched: string | null;
}

/**
 * Extended async state with caching support
 * Includes cache freshness indicators and TTL
 * 
 * @template T - The type of data being managed
 */
export interface ApiStateWithCache<T> extends ApiState<T> {
  /** Whether cached data is still fresh */
  isFresh: boolean;
  
  /** Timestamp when cached data expires (ISO string) */
  expiresAt: string | null;
}

// ============================================================================
// RETRY CONFIGURATION
// ============================================================================

/**
 * Retry configuration for API service
 * Defines retry behavior for failed requests
 */
export interface RetryConfig {
  /** Maximum number of retry attempts (including initial request) */
  maxAttempts: number;
  
  /** Base delay in milliseconds before first retry */
  baseDelay: number;
  
  /** Maximum delay in milliseconds (cap for exponential backoff) */
  maxDelay: number;
  
  /** Multiplier for exponential backoff (e.g., 2 for doubling) */
  backoffMultiplier: number;
}

// ============================================================================
// CACHE CONFIGURATION
// ============================================================================

/**
 * Cache configuration for API responses
 */
export interface CacheConfig {
  /** Time-to-live in milliseconds (default: 5 minutes) */
  ttl: number;
  
  /** Whether to allow stale data while revalidating */
  staleWhileRevalidate: boolean;
}

/**
 * Default cache configuration
 */
export const DEFAULT_CACHE_CONFIG: CacheConfig = {
  ttl: 5 * 60 * 1000, // 5 minutes
  staleWhileRevalidate: true,
};

// ============================================================================
// TYPE GUARDS
// ============================================================================

/**
 * Type guard: Checks if a string is a valid store ID
 * Format: "XXXXX-XXXXX" (5 digits, dash, 5 digits)
 * 
 * @param value - Value to check
 * @returns True if value is a valid store ID
 * 
 * @example
 * isValidStoreId("03795-00001") // true
 * isValidStoreId("12345-67890") // true
 * isValidStoreId("12345") // false
 */
export function isValidStoreId(value: unknown): value is StoreId {
  if (typeof value !== 'string') {
    return false;
  }
  
  const storeIdRegex = /^\d{5}-\d{5}$/;
  return storeIdRegex.test(value);
}

/**
 * Type guard: Checks if a string is a valid API date
 * Format: "YYYY-MM-DD"
 * 
 * @param value - Value to check
 * @returns True if value is a valid API date
 * 
 * @example
 * isValidApiDate("2025-11-16") // true
 * isValidApiDate("2025-1-16") // false (missing zero-padding)
 * isValidApiDate("11/16/2025") // false
 */
export function isValidApiDate(value: unknown): value is ApiDate {
  if (typeof value !== 'string') {
    return false;
  }
  
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(value)) {
    return false;
  }
  
  // Validate that it's a real date
  const date = new Date(value);
  return !isNaN(date.getTime()) && value === date.toISOString().split('T')[0];
}

/**
 * Type guard: Checks if a value is an ApiError
 * 
 * @param value - Value to check
 * @returns True if value is an ApiError object
 */
export function isApiError(value: unknown): value is ApiError {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  
  const error = value as ApiError;
  return typeof error.message === 'string';
}

/**
 * Type guard: Checks if a value is a valid week number (1-52)
 * 
 * @param value - Value to check
 * @returns True if value is a valid week number
 */
export function isValidWeekNumber(value: unknown): value is WeekNumber {
  return typeof value === 'number' && value >= 1 && value <= 52 && Number.isInteger(value);
}

/**
 * Type guard: Checks if a value is a valid ISO datetime string
 * 
 * @param value - Value to check
 * @returns True if value is a valid ISO datetime
 */
export function isValidISODateTime(value: unknown): value is ISODateTime {
  if (typeof value !== 'string') {
    return false;
  }
  
  const date = new Date(value);
  return !isNaN(date.getTime());
}

// ============================================================================
// VALIDATION HELPERS
// ============================================================================

/**
 * Validates DSPR API request parameters
 * Throws descriptive errors if validation fails
 * 
 * @param params - Request parameters to validate
 * @throws Error if validation fails
 * 
 * @example
 * validateDsprApiParams({ store: "03795-00001", date: "2025-11-16" }); // OK
 * validateDsprApiParams({ store: "invalid", date: "2025-11-16" }); // Throws
 */
export function validateDsprApiParams(params: DsprApiParams): void {
  if (!isValidStoreId(params.store)) {
    throw new Error(
      `Invalid store ID: "${params.store}". Expected format: "XXXXX-XXXXX" (e.g., "03795-00001")`
    );
  }
  
  if (!isValidApiDate(params.date)) {
    throw new Error(
      `Invalid date: "${params.date}". Expected format: "YYYY-MM-DD" (e.g., "2025-11-16")`
    );
  }
}

/**
 * Validates filtering values from API response
 * Throws descriptive errors if critical fields are missing or invalid
 * 
 * @param filteringValues - Filtering values to validate
 * @throws Error if validation fails
 */
export function validateFilteringValues(filteringValues: Partial<FilteringValues>): void {
  if (!filteringValues.date || !isValidApiDate(filteringValues.date)) {
    throw new Error(`Invalid or missing date in FilteringValues: ${filteringValues.date}`);
  }
  
  if (!filteringValues.store || !isValidStoreId(filteringValues.store)) {
    throw new Error(`Invalid or missing store in FilteringValues: ${filteringValues.store}`);
  }
  
  if (!filteringValues.week || !isValidWeekNumber(filteringValues.week)) {
    throw new Error(`Invalid or missing week number in FilteringValues: ${filteringValues.week}`);
  }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Creates an empty ApiState with idle status
 * 
 * @template T - The type of data being managed
 * @returns Empty ApiState in idle state
 */
export function createEmptyApiState<T>(): ApiState<T> {
  return {
    data: null,
    status: ApiStatus.Idle,
    error: null,
    lastFetched: null,
  };
}

/**
 * Creates an empty ApiStateWithCache with idle status
 * 
 * @template T - The type of data being managed
 * @returns Empty ApiStateWithCache in idle state
 */
export function createEmptyApiStateWithCache<T>(): ApiStateWithCache<T> {
  return {
    data: null,
    status: ApiStatus.Idle,
    error: null,
    lastFetched: null,
    isFresh: false,
    expiresAt: null,
  };
}

/**
 * Checks if cached data is still fresh based on TTL
 * 
 * @param expiresAt - Expiration timestamp (ISO string)
 * @returns True if data is still fresh
 */
export function isCacheFresh(expiresAt: string | null): boolean {
  if (!expiresAt) {
    return false;
  }
  
  return new Date(expiresAt).getTime() > Date.now();
}

/**
 * Calculates cache expiration timestamp
 * 
 * @param ttl - Time-to-live in milliseconds
 * @returns ISO timestamp string for expiration
 */
export function calculateCacheExpiration(ttl: number): string {
  return new Date(Date.now() + ttl).toISOString();
}

/**
 * Formats an API error for display
 * 
 * @param error - API error object
 * @returns Formatted error message string
 */
export function formatApiError(error: ApiError): string {
  const statusText = error.status ? `[${error.status}] ` : '';
  const codeText = error.code ? `(${error.code}) ` : '';
  return `${statusText}${codeText}${error.message}`;
}

/**
 * Checks if an API state is currently loading
 * 
 * @param state - API state to check
 * @returns True if status is Loading
 */
export function isLoading<T>(state: ApiState<T>): boolean {
  return state.status === ApiStatus.Loading;
}

/**
 * Checks if an API state has succeeded
 * 
 * @param state - API state to check
 * @returns True if status is Succeeded
 */
export function isSucceeded<T>(state: ApiState<T>): boolean {
  return state.status === ApiStatus.Succeeded;
}

/**
 * Checks if an API state has failed
 * 
 * @param state - API state to check
 * @returns True if status is Failed
 */
export function isFailed<T>(state: ApiState<T>): boolean {
  return state.status === ApiStatus.Failed;
}

/**
 * Checks if an API state is idle (no request made yet)
 * 
 * @param state - API state to check
 * @returns True if status is Idle
 */
export function isIdle<T>(state: ApiState<T>): boolean {
  return state.status === ApiStatus.Idle;
}