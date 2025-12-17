// translations.types.ts

/**
 * Domain models and type definitions for the translations feature.
 * Follows the Laravel backend API schema and provides strong typing for all request/response payloads.
 * UPDATED: Now supports nested original/translated structure from API
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
  created_at?: string;
  updated_at?: string;
}

// ============================================================================
// Localizable Data Models - NEW STRUCTURE
// ============================================================================

/**
 * Form name with original and translated values
 */
export interface TranslatableFormName {
  original: string;
  translated: string;
}

/**
 * Original field content (English or default language)
 */
export interface OriginalFieldContent {
  label: string;
  helper_text: string | null;
  default_value: string | null;
  placeholder: string | null;
}

/**
 * Translated field content for target language
 */
export interface TranslatedFieldContent {
  label: string;
  helper_text: string;
  default_value: string;
  place_holder: string | null;  // Note: API uses place_holder in translated
}

/**
 * Represents a single field with original and translated content
 */
export interface LocalizableField {
  field_id: number;
  original: OriginalFieldContent;
  translated: TranslatedFieldContent;
}

/**
 * Complete localizable data for a form version in a specific language
 */
export interface LocalizableData {
  form_version_id: number;
  language: Language;
  form_name: TranslatableFormName;
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
  place_holder: string;
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

// ============================================================================
// Helper Types for UI Components
// ============================================================================

/**
 * Helper to extract field value safely
 */
export type FieldValue = string | null | undefined;

/**
 * Helper type for field property keys in original content
 */
export type OriginalFieldPropertyKey = keyof OriginalFieldContent;

/**
 * Helper type for field property keys in translated content
 */
export type TranslatedFieldPropertyKey = keyof TranslatedFieldContent;

/**
 * Utility function to get original field value
 */
export function getOriginalFieldValue(
  field: LocalizableField,
  property: 'label' | 'helper_text' | 'default_value'
): string | null {
  return field.original[property];
}

/**
 * Utility function to get original placeholder (handles naming difference)
 */
export function getOriginalPlaceholder(field: LocalizableField): string | null {
  return field.original.placeholder;
}

/**
 * Utility function to get translated field value
 */
export function getTranslatedFieldValue(
  field: LocalizableField,
  property: 'label' | 'helper_text' | 'default_value'
): string {
  return field.translated[property];
}

/**
 * Utility function to get translated placeholder
 */
export function getTranslatedPlaceholder(field: LocalizableField): string | null {
  return field.translated.place_holder;
}

/**
 * Check if a translated value exists and is not empty
 */
export function hasTranslation(value: string | null | undefined): boolean {
  return value !== null && value !== undefined && value.trim() !== '';
}

/**
 * Get display value (translated if available, otherwise original)
 */
export function getDisplayValue(
  original: string | null,
  translated: string | null | undefined
): string {
  if (hasTranslation(translated)) {
    return translated as string;
  }
  return original || '';
}

/**
 * Get original form name from TranslatableFormName
 */
export function getOriginalFormName(formName: TranslatableFormName): string {
  return formName.original;
}

/**
 * Get translated form name from TranslatableFormName
 */
export function getTranslatedFormName(formName: TranslatableFormName): string {
  return formName.translated;
}

/**
 * Create a FieldTranslation object from a LocalizableField
 * This is useful when preparing data to save
 */
export function createFieldTranslationFromLocalizable(
  field: LocalizableField
): FieldTranslation {
  return {
    field_id: field.field_id,
    label: field.translated.label,
    helper_text: field.translated.helper_text,
    default_value: field.translated.default_value,
    place_holder: field.translated.place_holder || '',
  };
}

/**
 * Calculate translation progress percentage
 */
export function calculateTranslationProgress(fields: LocalizableField[]): number {
  if (fields.length === 0) return 0;

  const translatedCount = fields.filter(field => {
    const hasLabelTranslation = hasTranslation(field.translated.label) && 
                                 field.translated.label !== field.original.label;
    return hasLabelTranslation;
  }).length;

  return Math.round((translatedCount / fields.length) * 100);
}

/**
 * Check if a field has any translations that differ from original
 */
export function fieldHasTranslations(field: LocalizableField): boolean {
  return (
    (hasTranslation(field.translated.label) && field.translated.label !== field.original.label) ||
    (hasTranslation(field.translated.helper_text) && field.translated.helper_text !== field.original.helper_text) ||
    (hasTranslation(field.translated.default_value) && field.translated.default_value !== field.original.default_value) ||
    (hasTranslation(field.translated.place_holder) && field.translated.place_holder !== field.original.placeholder)
  );
}

/**
 * Get count of translated fields
 */
export function getTranslatedFieldsCount(fields: LocalizableField[]): number {
  return fields.filter(fieldHasTranslations).length;
}

/**
 * Get count of untranslated fields
 */
export function getUntranslatedFieldsCount(fields: LocalizableField[]): number {
  return fields.length - getTranslatedFieldsCount(fields);
}
