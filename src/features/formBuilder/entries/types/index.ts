/**
 * /src/features/entries/types.ts
 * 
 * Type definitions for the Entries feature.
 * Strongly typed interfaces for API requests, responses, and nested entities.
 */

// ============================================================================
// API Response Types
// ============================================================================

/**
 * Pagination metadata returned by the API
 */
export interface Pagination {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

/**
 * Field type filter definition
 * Describes available filtering methods for a specific field type
 */
export interface FieldTypeFilter {
  id: number;
  field_type_id: number;
  filter_method_description: string;
  created_at: string;
  updated_at: string;
}

/**
 * Field type definition
 * Categorizes fields (e.g., Text Input, Email, Checkbox)
 */
export interface FieldType {
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
  field_type_filters: FieldTypeFilter[];
}

/**
 * Field definition within a form section
 * Contains field metadata, validation rules, and display properties
 */
export interface Field {
  id: number;
  section_id: number;
  field_type_id: number;
  label: string;
  placeholder: string | null;
  helper_text: string | null;
  default_value: string | null;
  visibility_condition: string | null;
  created_at: string;
  updated_at: string;
  field_type: FieldType;
}

/**
 * Entry value - a single field response within an entry
 */
export interface EntryValue {
  id: number;
  entry_id: number;
  field_id: number;
  value: string;
  created_at: string;
  updated_at: string;
  field: Field;
}

/**
 * User who created the entry
 */
export interface Creator {
  id: number;
  name: string;
  email: string;
  created_at: string;
  updated_at: string;
  default_language_id: number;
}

/**
 * Current stage of the entry in the form workflow
 */
export interface Stage {
  id: number;
  form_version_id: number;
  name: string;
  is_initial: boolean;
  visibility_condition: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Entry - a complete form submission
 */
export interface Entry {
  id: number;
  form_version_id: number;
  current_stage_id: number;
  public_identifier: string;
  is_complete: boolean;
  is_considered: boolean;
  created_by_user_id: number;
  created_at: string;
  updated_at: string;
  current_stage: Stage;
  creator: Creator;
  values: EntryValue[];
}

/**
 * Successful API response for list entries
 */
export interface ListEntriesResponse {
  success: boolean;
  data: Entry[];
  pagination: Pagination;
}

// ============================================================================
// Request Types
// ============================================================================

/**
 * Field filter structure for dynamic filtering
 * Supports multiple keys per field (e.g., value, type, operator)
 * 
 * Example:
 * {
 *   1454: { value: "charlie", type: "contains" },
 *   1455: { value: "miller" }
 * }
 * 
 * Will be serialized to query params as:
 * field_filters[1454][value]=charlie&field_filters[1454][type]=contains&field_filters[1455][value]=miller
 */
export type FieldFilters = Record<number, Record<string, string | number | boolean>>;

/**
 * Query parameters for listing entries
 * Supports pagination, date filtering, and dynamic field filters
 */
export interface EntriesListQuery {
  // Required parameters
  page: number;
  per_page: number;
  form_version_id: number;

  // Optional date filters
  date_from?: string; // Format: YYYY-MM-DD
  date_to?: string; // Format: YYYY-MM-DD
  date_type?: string; // e.g., "submission", "updated"

  // Optional boolean filter
  is_considered?: boolean;

  // Dynamic field filters
  // Key is field_id, value is an object with filter criteria
  field_filters?: FieldFilters;
}

// ============================================================================
// Error Types
// ============================================================================

/**
 * Normalized error structure for consistent error handling
 * Used throughout the application for API and network errors
 */
export interface NormalizedError {
  message: string;
  statusCode?: number;
  details?: unknown;
  isNetworkError?: boolean;
}

/**
 * Specific error for missing authentication token
 */
export class AuthTokenError extends Error {
  constructor(message = 'Authentication token is missing or invalid') {
    super(message);
    this.name = 'AuthTokenError';
  }
}

// ============================================================================
// Redux State Types
// ============================================================================

/**
 * Loading states for async operations
 */
export type LoadingStatus = 'idle' | 'loading' | 'succeeded' | 'failed';

/**
 * Entries slice state structure
 */
export interface EntriesState {
  data: Entry[];
  pagination: Pagination | null;
  status: LoadingStatus;
  error: NormalizedError | null;
  lastQuery: EntriesListQuery | null; // Enables refetch functionality
}
