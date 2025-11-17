// types/pizza.types.ts

/**
 * Base interface for API responses with common fields
 * This ensures consistent error handling and response structure
 */
export interface BaseApiResponse {
  /** HTTP status code or custom status indicator */
  status?: number;
  /** Error message if the request failed */
  error?: string;
  /** Additional metadata about the response */
  metadata?: Record<string, unknown>;
}

/**
 * Loading states for async operations
 * Used across different slices for consistent state management
 */
export const LOADING_STATES = {
  IDLE: 'idle',
  PENDING: 'pending',
  FULFILLED: 'fulfilled',
  REJECTED: 'rejected',
} as const;

/**
 * Type representing the current loading state of async operations
 */
export type LoadingState = typeof LOADING_STATES[keyof typeof LOADING_STATES];

/**
 * Generic error class for API failures
 * Provides detailed error information for better debugging
 * Using a class instead of interface to work with verbatimModuleSyntax
 */
export class ApiError extends Error {
  /** HTTP status code */
  public status?: number;
  /** Error code for programmatic handling */
  public code?: string;
  /** Additional error details */
  public details?: Record<string, unknown>;
  /** Timestamp when the error occurred */
  public timestamp: string;

  constructor(
    message: string,
    status?: number,
    code?: string,
    details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
    this.timestamp = new Date().toISOString();

    // Ensure proper prototype chain for instanceof checks
    Object.setPrototypeOf(this, ApiError.prototype);
  }

  /**
   * Create an ApiError from an unknown error
   */
  static fromError(error: unknown, defaultMessage = 'An unknown error occurred'): ApiError {
    if (error instanceof ApiError) {
      return error;
    }

    if (error instanceof Error) {
      return new ApiError(error.message);
    }

    if (typeof error === 'string') {
      return new ApiError(error);
    }

    return new ApiError(defaultMessage);
  }

  /**
   * Convert to a plain object for serialization
   */
  toJSON() {
    return {
      name: this.name,
      message: this.message,
      status: this.status,
      code: this.code,
      details: this.details,
      timestamp: this.timestamp,
    };
  }
}

/**
 * Utility type for async thunk states
 * Provides consistent typing for Redux Toolkit async thunks
 */
export type AsyncThunkState<T> = {
  data: T | null;
  loading: LoadingState;
  error: ApiError | null;
};

/**
 * Type for store validation result
 * Used to validate store IDs before making API calls
 */
export interface StoreValidationResult {
  /** Whether the store ID is valid */
  isValid: boolean;
  /** Error message if invalid */
  error?: string;
  /** Normalized store ID */
  normalizedStoreId?: string;
}

/**
 * Type guard to check if an error is an ApiError
 * Helps with type narrowing in error handling
 */
export const isApiError = (error: unknown): error is ApiError => {
  return error instanceof ApiError;
};

/**
 * Helper function to check if a value is a valid loading state
 */
export const isValidLoadingState = (value: string): value is LoadingState => {
  return Object.values(LOADING_STATES).includes(value as LoadingState);
};
