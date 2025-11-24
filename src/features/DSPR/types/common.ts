/**
 * Common types for DSPR API
 * Base interfaces and shared types used across the application
 * 
 * API Endpoint: POST https://testapipizza.pnefoods.com/api/dspr-report/{store}/{date}
 * Response structure contains filtering values and three report domains:
 * - Daily Hourly Sales
 * - DSQR Data (ratings, reviews, performance metrics)
 * - DSPR Data (labor, waste, sales metrics - both daily and weekly)
 */
import type { DailyDSPRData, WeeklyDSPRData, DailyDSPRByDate } from './DSPRDailyWeekly';

// =============================================================================
// REQUEST TYPES
// =============================================================================

/**
 * Store identifier format validation
 * Format: "XXXXX-XXXXX" (e.g., "03795-00002")
 */
export type StoreId = string;

/**
 * Date format for API requests
 * Format: "YYYY-MM-DD" (e.g., "2025-09-02")
 */
export type ApiDate = string;


/**
 * Request parameters for the DSPR API endpoint
 * Used in URL path parameters
 */
export interface DsprApiParams {
  /** Store identifier in format "XXXXX-XXXXX" */
  store: StoreId;
  /** Date in format "YYYY-MM-DD" */
  date: ApiDate;
}

/**
 * Complete request structure combining path params
 */
export interface DsprApiRequest {
  params: DsprApiParams;
}

// =============================================================================
// RESPONSE WRAPPER TYPES
// =============================================================================

/**
 * Filtering values returned by the API
 * Shows what filters were applied to generate the report
 */
export interface FilteringValues {
  /** Date that was requested */
  date: ApiDate;
  /** Store that was requested */
  store: StoreId;
  /** Items that were included in the report */
  items: number[];
  /** Week number of the year */
  week: number;
  /** Start date of the week period (ISO string) */
  weekStartDate: string;
  /** End date of the week period (ISO string) */
  weekEndDate: string;
  /** Start date for historical lookback period (ISO string) */
  "look back start": string;
  /** End date for historical lookback period (ISO string) */
  "look back end": string;
  /** URL for deposit delivery data webhook */
  depositDeliveryUrl: string;
}

/**
 * Main reports container
 * Contains the three primary data domains
 */
export interface Reports {
  /** Daily report data including hourly sales, DSQR, and DSPR metrics */
  daily: DailyReports;
  /** Weekly aggregated data (currently only DSPR metrics) */
  weekly: WeeklyReports;
}

/**
 * Daily reports structure
 * Contains all daily-level data across three domains
 */
export interface DailyReports {
  /** Hourly breakdown of sales data */
  dailyHourlySales: any; // Will be defined in hourlySales.types.ts
  /** DSQR performance metrics and ratings */
  dailyDSQRData: any;    // Will be defined in dsqr.types.ts
  /** DSPR operational metrics */
  dailyDSPRData: DailyDSPRData | DailyDSPRByDate;
}

/**
 * Weekly reports structure
 * Contains aggregated weekly data
 */
export interface WeeklyReports {
  /** Weekly DSPR aggregated metrics */
  DSPRData: WeeklyDSPRData;
  /** Map of daily DSPR entries keyed by business date */
  DailyDSPRByDate?: DailyDSPRByDate;
}

/**
 * Complete API response structure
 * Top-level response containing filtering info and all report data
 */
export interface DsprApiResponse {
  /** Information about applied filters and time ranges */
  "Filtering Values": FilteringValues;
  /** All report data organized by time period */
  reports: Reports;
}

// =============================================================================
// UTILITY TYPES
// =============================================================================

/**
 * Generic API state for async operations
 * Used across all domain slices for consistent state management
 */
export interface ApiState<T> {
  /** The data payload */
  data: T | null;
  /** Loading state indicator */
  loading: boolean;
  /** Error message if operation failed */
  error: string | null;
  /** Timestamp of last successful fetch */
  lastFetched: number | null;
}

/**
 * Status constants for tracking API call states
 * Provides more granular control than simple boolean loading
 * Uses const assertion to create a union type without runtime enum overhead
 */
export const ApiStatus = {
  IDLE: 'idle',
  LOADING: 'loading',
  SUCCEEDED: 'succeeded',
  FAILED: 'failed'
} as const;

/**
 * Union type derived from ApiStatus values
 * Provides type safety while avoiding enum compilation
 */
export type ApiStatus = typeof ApiStatus[keyof typeof ApiStatus];

/**
 * Enhanced API state with status union type
 * Alternative to ApiState for more detailed status tracking
 */
export interface ApiStateWithStatus<T> {
  data: T | null;
  status: ApiStatus;
  error: string | null;
  lastFetched: number | null;
}

/**
 * Error response structure for API failures
 * Standardized error format across the application
 */
export interface ApiError {
  /** HTTP status code */
  status?: number;
  /** Error message */
  message: string;
  /** Additional error details */
  details?: string;
  /** Error code for categorization */
  code?: string;
}

/**
 * Configuration for retry logic
 * Used in service layer for handling transient failures
 */
export interface RetryConfig {
  /** Maximum number of retry attempts */
  maxAttempts: number;
  /** Base delay in milliseconds */
  baseDelay: number;
  /** Whether to use exponential backoff */
  exponentialBackoff: boolean;
}

// =============================================================================
// TYPE GUARDS
// =============================================================================

/**
 * Type guard to check if a value is a valid store ID format
 * @param value - Value to check
 * @returns True if value matches store ID pattern
 */
export const isValidStoreId = (value: string): value is StoreId => {
  return /^\d{5}-\d{5}$/.test(value);
};

/**
 * Type guard to check if a value is a valid API date format
 * @param value - Value to check
 * @returns True if value matches YYYY-MM-DD pattern
 */
export const isValidApiDate = (value: string): value is ApiDate => {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && !isNaN(Date.parse(value));
};

/**
 * Type guard to check if an error is an API error
 * @param error - Error to check
 * @returns True if error matches ApiError structure
 */
export const isApiError = (error: unknown): error is ApiError => {
  return (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof (error as any).message === 'string'
  );
};

/**
 * Type guard to check if a status is a valid ApiStatus
 * @param status - Status to check
 * @returns True if status is a valid ApiStatus value
 */
export const isValidApiStatus = (status: string): status is ApiStatus => {
  return Object.values(ApiStatus).includes(status as ApiStatus);
};
