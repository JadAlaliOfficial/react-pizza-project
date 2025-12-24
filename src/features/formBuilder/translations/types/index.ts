// translations.types.ts

/**
 * Domain models and type definitions for the translations feature.
 * Follows the Laravel backend API schema and provides strong typing for all request/response payloads.
 * UPDATED: Now supports nested original/translated structure for stages, sections, transitions, and fields
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

// ---------- Stage Models ----------

/**
 * Original stage content
 */
export interface OriginalStageContent {
  name: string;
}

/**
 * Translated stage content
 */
export interface TranslatedStageContent {
  name: string;
}

/**
 * Represents a single stage with original and translated content
 */
export interface LocalizableStage {
  stage_id: number;
  original: OriginalStageContent;
  translated: TranslatedStageContent;
}

// ---------- Section Models ----------

/**
 * Original section content
 */
export interface OriginalSectionContent {
  name: string;
}

/**
 * Translated section content
 */
export interface TranslatedSectionContent {
  name: string;
}

/**
 * Represents a single section with original and translated content
 */
export interface LocalizableSection {
  section_id: number;
  stage_id: number;
  original: OriginalSectionContent;
  translated: TranslatedSectionContent;
}

// ---------- Transition Models ----------

/**
 * Original transition content
 */
export interface OriginalTransitionContent {
  label: string;
}

/**
 * Translated transition content
 */
export interface TranslatedTransitionContent {
  label: string;
}

/**
 * Represents a single transition with original and translated content
 */
export interface LocalizableTransition {
  stage_transition_id: number;
  original: OriginalTransitionContent;
  translated: TranslatedTransitionContent;
}

// ---------- Field Models ----------

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
  place_holder: string; // Note: API uses place_holder in translated
}

/**
 * Represents a single field with original and translated content
 */
export interface LocalizableField {
  field_id: number;
  original: OriginalFieldContent;
  translated: TranslatedFieldContent;
}

// ---------- Complete Localizable Data ----------

/**
 * Complete localizable data for a form version in a specific language
 */
export interface LocalizableData {
  form_version_id: number;
  language: Language;
  form_name: TranslatableFormName;
  stages: LocalizableStage[];
  sections: LocalizableSection[];
  transitions: LocalizableTransition[];
  fields: LocalizableField[];
}

// ============================================================================
// Translation Save Models
// ============================================================================

/**
 * Single stage translation to be saved
 */
export interface StageTranslation {
  stage_id: number;
  name: string;
}

/**
 * Single section translation to be saved
 */
export interface SectionTranslation {
  section_id: number;
  name: string;
}

/**
 * Single transition translation to be saved
 */
export interface TransitionTranslation {
  stage_transition_id: number;
  label: string;
}

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
  stage_translations: StageTranslation[];
  section_translations: SectionTranslation[];
  transition_translations: TransitionTranslation[];
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

// ============================================================================
// Utility Functions for Stages
// ============================================================================

/**
 * Get original stage name
 */
export function getOriginalStageName(stage: LocalizableStage): string {
  return stage.original.name;
}

/**
 * Get translated stage name
 */
export function getTranslatedStageName(stage: LocalizableStage): string {
  return stage.translated.name;
}

/**
 * Create a StageTranslation object from a LocalizableStage
 */
export function createStageTranslationFromLocalizable(
  stage: LocalizableStage
): StageTranslation {
  return {
    stage_id: stage.stage_id,
    name: stage.translated.name,
  };
}

// ============================================================================
// Utility Functions for Sections
// ============================================================================

/**
 * Get original section name
 */
export function getOriginalSectionName(section: LocalizableSection): string {
  return section.original.name;
}

/**
 * Get translated section name
 */
export function getTranslatedSectionName(section: LocalizableSection): string {
  return section.translated.name;
}

/**
 * Create a SectionTranslation object from a LocalizableSection
 */
export function createSectionTranslationFromLocalizable(
  section: LocalizableSection
): SectionTranslation {
  return {
    section_id: section.section_id,
    name: section.translated.name,
  };
}

// ============================================================================
// Utility Functions for Transitions
// ============================================================================

/**
 * Get original transition label
 */
export function getOriginalTransitionLabel(transition: LocalizableTransition): string {
  return transition.original.label;
}

/**
 * Get translated transition label
 */
export function getTranslatedTransitionLabel(transition: LocalizableTransition): string {
  return transition.translated.label;
}

/**
 * Create a TransitionTranslation object from a LocalizableTransition
 */
export function createTransitionTranslationFromLocalizable(
  transition: LocalizableTransition
): TransitionTranslation {
  return {
    stage_transition_id: transition.stage_transition_id,
    label: transition.translated.label,
  };
}

// ============================================================================
// Utility Functions for Fields
// ============================================================================

/**
 * Get original field value
 */
export function getOriginalFieldValue(
  field: LocalizableField,
  property: 'label' | 'helper_text' | 'default_value'
): string | null {
  return field.original[property];
}

/**
 * Get original placeholder (handles naming difference)
 */
export function getOriginalPlaceholder(field: LocalizableField): string | null {
  return field.original.placeholder;
}

/**
 * Get translated field value
 */
export function getTranslatedFieldValue(
  field: LocalizableField,
  property: 'label' | 'helper_text' | 'default_value'
): string {
  return field.translated[property];
}

/**
 * Get translated placeholder
 */
export function getTranslatedPlaceholder(field: LocalizableField): string {
  return field.translated.place_holder;
}

/**
 * Create a FieldTranslation object from a LocalizableField
 */
export function createFieldTranslationFromLocalizable(
  field: LocalizableField
): FieldTranslation {
  return {
    field_id: field.field_id,
    label: field.translated.label,
    helper_text: field.translated.helper_text,
    default_value: field.translated.default_value,
    place_holder: field.translated.place_holder,
  };
}

// ============================================================================
// General Utility Functions
// ============================================================================

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

// ============================================================================
// Translation Progress and Stats
// ============================================================================

/**
 * Check if a stage has translation
 */
export function stageHasTranslation(stage: LocalizableStage): boolean {
  return hasTranslation(stage.translated.name) && stage.translated.name !== stage.original.name;
}

/**
 * Check if a section has translation
 */
export function sectionHasTranslation(section: LocalizableSection): boolean {
  return hasTranslation(section.translated.name) && section.translated.name !== section.original.name;
}

/**
 * Check if a transition has translation
 */
export function transitionHasTranslation(transition: LocalizableTransition): boolean {
  return hasTranslation(transition.translated.label) && transition.translated.label !== transition.original.label;
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
 * Calculate overall translation progress percentage
 */
export function calculateTranslationProgress(data: LocalizableData): number {
  const totalItems = 
    1 + // form_name
    data.stages.length +
    data.sections.length +
    data.transitions.length +
    data.fields.length;

  if (totalItems === 0) return 0;

  let translatedCount = 0;

  // Check form name
  if (hasTranslation(data.form_name.translated) && data.form_name.translated !== data.form_name.original) {
    translatedCount++;
  }

  // Check stages
  translatedCount += data.stages.filter(stageHasTranslation).length;

  // Check sections
  translatedCount += data.sections.filter(sectionHasTranslation).length;

  // Check transitions
  translatedCount += data.transitions.filter(transitionHasTranslation).length;

  // Check fields
  translatedCount += data.fields.filter(fieldHasTranslations).length;

  return Math.round((translatedCount / totalItems) * 100);
}

/**
 * Get count of translated items
 */
export function getTranslatedItemsCount(data: LocalizableData): number {
  let count = 0;

  if (hasTranslation(data.form_name.translated) && data.form_name.translated !== data.form_name.original) {
    count++;
  }

  count += data.stages.filter(stageHasTranslation).length;
  count += data.sections.filter(sectionHasTranslation).length;
  count += data.transitions.filter(transitionHasTranslation).length;
  count += data.fields.filter(fieldHasTranslations).length;

  return count;
}

/**
 * Get total count of translatable items
 */
export function getTotalTranslatableItemsCount(data: LocalizableData): number {
  return (
    1 + // form_name
    data.stages.length +
    data.sections.length +
    data.transitions.length +
    data.fields.length
  );
}
