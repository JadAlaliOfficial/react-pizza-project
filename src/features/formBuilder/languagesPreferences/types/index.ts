/**
 * Language Types
 * 
 * TypeScript types and interfaces for the language preference system.
 * These types match the API structure from the backend endpoints.
 */

// ============================================================================
// Core Entity Types
// ============================================================================

/**
 * Language entity from the database
 * Represents a language that can be used in the system
 */
export interface Language {
  id: number;
  code: string; // Language code (e.g., 'en', 'ar', 'es')
  name: string; // Human-readable name (e.g., 'English', 'Arabic')
  is_default: boolean; // Whether this is the system default language
  created_at: string; // ISO 8601 timestamp
  updated_at: string; // ISO 8601 timestamp
}

/**
 * Normalized Language entity for frontend use (camelCase)
 * Used in Redux state and components
 */
export interface LanguageNormalized {
  id: number;
  code: string;
  name: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// API Response Types
// ============================================================================

/**
 * Standard success response wrapper
 * Used for all successful API responses
 */
export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
}

/**
 * Response with optional message
 * Used when API returns both message and data
 */
export interface ApiSuccessResponseWithMessage<T> {
  success: true;
  message: string;
  data: T;
}

/**
 * Standard error response wrapper
 * Used for all failed API responses
 */
export interface ApiErrorResponse {
  success: false;
  message: string;
  error?: string;
  errors?: Record<string, string[]>; // Laravel validation errors
}

/**
 * Response type for GET /api/user/language/all
 * Returns list of all available languages
 */
export interface GetAllLanguagesResponse extends ApiSuccessResponse<Language[]> {}

/**
 * Response type for GET /api/user/language/default
 * Returns the user's default language
 */
export interface GetDefaultLanguageResponse extends ApiSuccessResponse<Language> {}

/**
 * User data returned after setting default language
 */
export interface UserWithLanguage {
  id: number;
  name: string;
  email: string;
  created_at: string;
  updated_at: string;
  default_language_id: number;
}

/**
 * Response type for PUT /api/translations/save
 * Returns updated user with new default language
 */
export interface SetDefaultLanguageResponse extends ApiSuccessResponseWithMessage<UserWithLanguage> {}

// ============================================================================
// API Request Types
// ============================================================================

/**
 * Request body for PUT /api/translations/save
 * Sets the user's default language
 */
export interface SetDefaultLanguageRequest {
  language_id: number;
}

// ============================================================================
// Redux State Types
// ============================================================================

/**
 * Language slice state shape
 */
export interface LanguageState {
  languages: LanguageNormalized[]; // All available languages
  defaultLanguage: LanguageNormalized | null; // User's default language
  loading: boolean; // Global loading state for language operations
  error: string | null; // Error message if any operation fails
  lastFetched: number | null; // Timestamp of last successful fetch (for caching)
}

/**
 * Loading states for specific operations
 * Can be used for more granular loading indicators
 */
export interface LanguageLoadingStates {
  fetchingAll: boolean;
  fetchingDefault: boolean;
  updating: boolean;
}

// ============================================================================
// Error Types
// ============================================================================

/**
 * Normalized error type for Redux
 * Extracted from various API error formats
 */
export interface LanguageError {
  message: string;
  code?: string | number;
  details?: unknown;
}

// ============================================================================
// Utility Types
// ============================================================================

/**
 * Language option for dropdown/select components
 */
export interface LanguageOption {
  value: number; // Language ID
  label: string; // Display name
  code: string; // Language code
  isDefault?: boolean;
}

/**
 * Type guard to check if a response is an error
 */
export type ApiResponse<T> = ApiSuccessResponse<T> | ApiSuccessResponseWithMessage<T> | ApiErrorResponse;

// ============================================================================
// Helper Type Guards
// ============================================================================

/**
 * Type guard to check if response is successful
 */
export function isSuccessResponse<T>(
  response: ApiResponse<T>
): response is ApiSuccessResponse<T> | ApiSuccessResponseWithMessage<T> {
  return response.success === true;
}

/**
 * Type guard to check if response is an error
 */
export function isErrorResponse<T>(response: ApiResponse<T>): response is ApiErrorResponse {
  return response.success === false;
}

/**
 * Type guard to check if a language is the default
 */
export function isDefaultLanguage(language: Language | LanguageNormalized): boolean {
  return 'is_default' in language ? language.is_default : language.isDefault;
}
