// src/features/fieldTypeFilters/types/fieldTypeFilters.types.ts

/**
 * Generic API response wrapper for all API endpoints
 * @template T - The type of data contained in the response
 */
export interface ApiResponse<T> {
  readonly success: boolean;
  readonly data: T;
  readonly message?: string;
}

/**
 * Represents a field type entity
 * Defines the structure and metadata of a form field type
 */
export interface FieldType {
  readonly id: number;
  readonly name: string;
  readonly created_at: string;
  readonly updated_at: string;
}

/**
 * Represents a field type filter configuration
 * Defines how a specific field type can be filtered/searched
 * Each filter is associated with a field type and describes available filter methods
 */
export interface FieldTypeFilter {
  readonly id: number;
  readonly field_type_id: number;
  readonly filter_method_description: string;
  readonly created_at: string;
  readonly updated_at: string;
  readonly field_type: FieldType;
}

/**
 * Array of field type filters returned from the API
 */
export type FieldTypeFiltersData = FieldTypeFilter[];

/**
 * Complete API response shape for field type filters endpoint
 */
export type FieldTypeFiltersResponse = ApiResponse<FieldTypeFiltersData>;

/**
 * Redux state shape for field type filters feature
 */
export interface FieldTypeFiltersState {
  items: FieldTypeFilter[];
  loading: boolean;
  error: string | null;
  lastFetchedAt: string | null;
}

/**
 * Error response structure from API
 * Used for normalized error handling across the application
 */
export interface ApiError {
  readonly message: string;
  readonly status?: number;
  readonly statusText?: string;
}

/**
 * Options for the useFieldTypeFilters hook
 */
export interface UseFieldTypeFiltersOptions {
  /** Skip automatic fetching on mount */
  skip?: boolean;
  /** Force refetch even if data exists */
  forceRefetch?: boolean;
}
