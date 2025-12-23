// src/features/forms/types.ts

/**
 * =============================================================================
 * FORMS SUBMISSION - TYPE DEFINITIONS
 * =============================================================================
 * 
 * This file contains all TypeScript types for the forms submission feature.
 * 
 * Key design decisions:
 * - JsonValue: Runtime-safe union type for field_values.value supporting
 *   all possible shapes (primitives, objects, arrays, nested structures)
 * - Discriminated union for ApiError to enable exhaustive type narrowing [web:6][web:9]
 * - Strict typing for API request/response shapes matching backend contract
 * - Normalized error types for consistent error handling across the app
 */

// =============================================================================
// UTILITY TYPES - JSON-safe value types
// =============================================================================

/**
 * Represents any valid JSON-serializable primitive value.
 * Used as building block for complex field values.
 */
export type JsonPrimitive = string | number | boolean | null;

/**
 * Represents any valid JSON-serializable value, including nested structures.
 * This recursive type safely models the field_values.value property which can be:
 * - Primitives: string, number, boolean
 * - Objects: { street: string, city: string, ... }
 * - Arrays: ["Option A", "Option B"]
 * - Nested combinations of above
 * 
 * Avoids `any` while remaining flexible for dynamic form field types.
 */
export type JsonValue =
  | JsonPrimitive
  | { [key: string]: JsonValue }
  | JsonValue[];

// =============================================================================
// API REQUEST TYPES
// =============================================================================

/**
 * Represents a single field value in the form submission.
 * The value can be any JSON-serializable structure depending on field type:
 * - Text fields: string
 * - Number fields: number
 * - Dropdown: string
 * - Multi-select: string[]
 * - Address: { street, city, state, postal_code, country }
 * - Geolocation: { latitude, longitude }
 * - Base64 signature: string (data:image/png;base64,...)
 * - File reference: string (filename)
 * - Date: string (ISO 8601 format)
 * - DateTime: string (ISO 8601 format)
 * - Time: string (HH:MM format)
 */
export interface FieldValue {
  field_id: number;
  value: JsonValue;
}

/**
 * Request payload for submitting the initial stage of a form.
 * This is sent to POST /api/enduser/forms/submit-initial
 */
export interface SubmitInitialStageRequest {
  /** ID of the form version being submitted */
  form_version_id: number;
  
  /** ID of the stage transition (workflow step) */
  stage_transition_id: number;
  
  /** Array of field values - can contain any number of fields with diverse value types */
  field_values: FieldValue[];
}

/**
 * Request payload for submitting a later stage of a form.
 * This is sent to POST /api/enduser/entries/submit-later-stage
 */
export interface SubmitLaterStageRequest {
  /** Public identifier UUID of the entry */
  public_identifier: string;
  
  /** ID of the stage transition (workflow step) */
  stage_transition_id: number;
  
  /** Array of field values */
  field_values: FieldValue[];
}

// =============================================================================
// API RESPONSE TYPES
// =============================================================================

/**
 * Nested data object returned on successful form submission.
 * Contains form entry details and completion status.
 */
export interface SubmitInitialStageData {
  /** Indicates if the submission was processed successfully */
  success: boolean;
  
  /** Database ID of the created form entry */
  entry_id: number;
  
  /** Public UUID for accessing/referencing this entry externally */
  public_identifier: string;
  
  /** Whether the form workflow is complete after this submission */
  is_complete: boolean;
  
  /** ID of the current stage after submission (for multi-stage forms) */
  current_stage_id: number;
  
  /** Human-readable success message */
  message: string;
}

/**
 * Success response envelope from the submit-initial endpoint.
 * HTTP 200 with success: true indicates successful processing.
 */
export interface SubmitInitialStageResponse {
  /** Top-level success flag */
  success: true;
  
  /** Human-readable message */
  message: string;
  
  /** Typed submission result data */
  data: SubmitInitialStageData;
}

/**
 * Nested data object returned on successful later stage submission.
 */
export interface SubmitLaterStageData {
  success: boolean;
  entry_id: number;
  public_identifier: string;
  is_complete: boolean;
  current_stage_id: number;
  message: string;
}

/**
 * Success response envelope from the submit-later-stage endpoint.
 */
export interface SubmitLaterStageResponse {
  success: true;
  message: string;
  data: SubmitLaterStageData;
}

/**
 * Error response envelope when the API returns an error.
 * Can occur with HTTP 200 but success: false, or with 4xx/5xx status codes.
 */
export interface SubmitInitialStageErrorResponse {
  /** Top-level success flag - false for errors */
  success: false;
  
  /** Error message describing what went wrong */
  message: string;
  
  /** Optional: Validation errors or additional error details */
  errors?: Record<string, string[]> | string[];
  
  /** Optional: Error code for programmatic handling */
  error_code?: string;
}

// =============================================================================
// NORMALIZED ERROR TYPES
// =============================================================================

/**
 * Discriminated union for API errors using 'type' as the discriminant.
 * This enables exhaustive type narrowing in error handlers [web:6].
 * 
 * Error types:
 * - network: Connection failures, timeouts, no internet
 * - authentication: Missing/invalid/expired token
 * - validation: Invalid request data (400, 422)
 * - server: Backend errors (500, 503, etc.)
 * - business: API returned success:false (business logic error)
 * - unknown: Unexpected errors that don't fit other categories
 */
export type ApiError =
  | {
      type: 'network';
      message: string;
      originalError?: Error;
    }
  | {
      type: 'authentication';
      message: string;
      statusCode: 401 | 403;
    }
  | {
      type: 'validation';
      message: string;
      statusCode: 400 | 422;
      errors?: Record<string, string[]> | string[];
    }
  | {
      type: 'server';
      message: string;
      statusCode: number;
    }
  | {
      type: 'business';
      message: string;
      error_code?: string;
      errors?: Record<string, string[]> | string[];
    }
  | {
      type: 'unknown';
      message: string;
      originalError?: unknown;
    };

// =============================================================================
// REDUX STATE TYPES
// =============================================================================

/**
 * Status enum for async operations.
 * Follows Redux Toolkit conventions for tracking request lifecycle.
 */
export type RequestStatus = 'idle' | 'loading' | 'succeeded' | 'failed';

/**
 * State shape for the forms submission slice.
 * Tracks the status, data, and errors for form submissions.
 */
export interface FormsSubmissionState {
  /** Current status of the submission request */
  status: RequestStatus;
  
  /** Normalized error object if request failed */
  error: ApiError | null;
  
  /** Last successful response data */
  lastResponse: SubmitInitialStageData | SubmitLaterStageData | null;
  
  /** Request ID for tracking/deduplication (optional) */
  requestId?: string;
  
  /** Timestamp when request started (for timeout tracking, analytics) */
  lastRequestTimestamp?: number;
  
  /** Timestamp when request completed (success or failure) */
  lastResponseTimestamp?: number;
}

// =============================================================================
// TYPE GUARDS
// =============================================================================

/**
 * Type guard to check if a response is an error response.
 * Useful for runtime type narrowing when handling API responses.
 */
export function isErrorResponse(
  response: SubmitInitialStageResponse | SubmitInitialStageErrorResponse
): response is SubmitInitialStageErrorResponse {
  return response.success === false;
}

/**
 * Type guard to check if a value is a valid JsonValue.
 * Useful for runtime validation of field values before submission.
 */
export function isJsonValue(value: unknown): value is JsonValue {
  if (value === null) return true;
  
  const type = typeof value;
  if (type === 'string' || type === 'number' || type === 'boolean') {
    return true;
  }
  
  if (Array.isArray(value)) {
    return value.every(isJsonValue);
  }
  
  if (type === 'object') {
    return Object.values(value as object).every(isJsonValue);
  }
  
  return false;
}
