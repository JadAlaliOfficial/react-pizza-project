// translations.types.ts

/**
 * Domain models and type definitions for the translations feature.
 * Follows the Laravel backend API schema and provides strong typing for all request/response payloads.
 */

// ============================================================================
// Language Models
// ============================================================================

/**
 * Language entity as returned by the API
 */
export interface Language {
  id: number;
  code: string;
  name: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// Localizable Data Models
// ============================================================================

/**
 * Represents a single field with translatable content
 */
export interface LocalizableField {
  field_id: number;
  label: string;
  helper_text: string | null;
  default_value: string | null;
}

/**
 * Complete localizable data for a form version in a specific language
 */
export interface LocalizableData {
  form_version_id: number;
  form_name: string;
  language: Language;
  fields: LocalizableField[];
}

// ============================================================================
// Translation Save Models
// ============================================================================

/**
 * Single field translation to be saved
 */
export interface FieldTranslation {
  field_id: number;
  label: string;
  helper_text: string;
  default_value: string;
}

/**
 * Payload for saving translations
 */
export interface SaveTranslationsPayload {
  form_version_id: number;
  language_id: number;
  form_name: string;
  field_translations: FieldTranslation[];
}

// ============================================================================
// API Response Wrappers
// ============================================================================

/**
 * Standard API success response wrapper
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

/**
 * Response for GET /api/translations/available-languages
 */
export interface AvailableLanguagesResponse {
  success: true;
  data: Language[];
}

/**
 * Response for GET /api/translations/localizable-data
 */
export interface LocalizableDataResponse {
  success: true;
  data: LocalizableData;
}

/**
 * Response for POST /api/translations/save
 */
export interface SaveTranslationsResponse {
  success: true;
  message: string;
}

// ============================================================================
// Redux State Models
// ============================================================================

/**
 * Error state with user-friendly message and raw error details
 */
export interface TranslationError {
  message: string;
  details?: unknown;
  timestamp: number;
}

/**
 * Loading states for async operations
 */
export interface TranslationLoadingState {
  languages: boolean;
  localizableData: boolean;
  saving: boolean;
}

/**
 * Cache key for localizable data (form + language combination)
 */
export type LocalizableDataCacheKey = `${number}_${number}`; // formVersionId_languageId

/**
 * Cached localizable data indexed by cache key
 */
export interface LocalizableDataCache {
  [key: LocalizableDataCacheKey]: LocalizableData;
}

/**
 * Root translation state
 */
export interface TranslationsState {
  // Languages data
  languages: Language[];
  languagesLoaded: boolean;

  // Localizable data cache (keyed by formVersionId_languageId)
  localizableDataCache: LocalizableDataCache;

  // Save operation status
  lastSaveSuccess: boolean | null;
  lastSaveTimestamp: number | null;

  // Loading flags
  loading: TranslationLoadingState;

  // Error states
  errors: {
    languages: TranslationError | null;
    localizableData: TranslationError | null;
    save: TranslationError | null;
  };
}

// ============================================================================
// Query Parameters
// ============================================================================

/**
 * Query parameters for fetching localizable data
 */
export interface GetLocalizableDataParams {
  form_version_id: number;
  language_id: number;
}

// ============================================================================
// Thunk Return Types
// ============================================================================

/**
 * Return type for fetchAvailableLanguages thunk
 */
export type FetchLanguagesResult = Language[];

/**
 * Return type for fetchLocalizableData thunk
 */
export type FetchLocalizableDataResult = LocalizableData;

/**
 * Return type for saveTranslations thunk
 */
export type SaveTranslationsResult = {
  success: true;
  message: string;
};

// ============================================================================
// Utility Types
// ============================================================================

/**
 * Extract the data property type from ApiResponse
 */
export type ExtractData<T> = T extends ApiResponse<infer U> ? U : never;

/**
 * Type guard to check if response is successful
 */
export function isSuccessResponse<T>(
  response: ApiResponse<T>
): response is ApiResponse<T> & { success: true; data: T } {
  return response.success === true && response.data !== undefined;
}

/**
 * Helper to create cache key for localizable data
 */
export function createCacheKey(
  formVersionId: number,
  languageId: number
): LocalizableDataCacheKey {
  return `${formVersionId}_${languageId}`;
}
