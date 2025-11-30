/**
 * Type definitions for Field Types feature
 * 
 * This module defines the core data structures for field types used throughout
 * the application. All types are designed to match the API response structure
 * and support Redux Toolkit's serialization requirements.
 */

/**
 * Represents a single field type entity from the API
 * 
 * @property id - Unique identifier for the field type
 * @property name - Human-readable name of the field type (e.g., "Text Input", "Email Input")
 * @property created_at - ISO 8601 timestamp of when the field type was created
 * @property updated_at - ISO 8601 timestamp of when the field type was last updated
 */
export interface FieldType {
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
}

/**
 * API response structure for the List Field Types endpoint
 * 
 * @property success - Indicates whether the API call was successful
 * @property data - Array of field type objects returned by the API
 */
export interface FieldTypesApiResponse {
  success: boolean;
  data: FieldType[];
}

/**
 * API error response structure
 * 
 * Used when the server returns an error with { success: false }
 * 
 * @property success - Always false for error responses
 * @property message - Human-readable error message from the server
 */
export interface FieldTypesApiError {
  success: false;
  message: string;
}

/**
 * Loading state enum for Redux slice
 * 
 * Tracks the current status of async operations following Redux Toolkit conventions
 */
export type LoadingState = 'idle' | 'pending' | 'succeeded' | 'failed';

/**
 * Redux slice state shape for field types
 * 
 * @property items - Array of all fetched field types
 * @property loading - Current async operation status
 * @property error - User-safe error message (null if no error)
 * @property lastFetched - Timestamp of last successful fetch (for cache management)
 */
export interface FieldTypesState {
  items: FieldType[];
  loading: LoadingState;
  error: string | null;
  lastFetched: number | null; // Unix timestamp in milliseconds
}

/**
 * Options for cache management in custom hook
 * 
 * @property maxAge - Maximum age in milliseconds before cache is considered stale
 */
export interface FieldTypesCacheOptions {
  maxAge?: number; // Default: 5 minutes (300000ms)
}
