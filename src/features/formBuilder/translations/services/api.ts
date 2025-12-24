// translations.service.ts

/**
 * API service layer for translations feature.
 * Handles all HTTP requests to the translations endpoints with proper authentication,
 * error handling, and response validation.
 * UPDATED: Now supports nested original/translated structure for stages, sections, transitions, and fields
 */

import axios, { type AxiosInstance, AxiosError } from 'axios';
import {
  type AvailableLanguagesResponse,
  type LocalizableDataResponse,
  type SaveTranslationsResponse,
  type SaveTranslationsPayload,
  type GetLocalizableDataParams,
  type Language,
  type LocalizableData,
  type ApiResponse,
  isSuccessResponse,
} from '../types';
import { store } from '@/store';
import { loadToken } from '../../../auth/utils/tokenStorage';

// ============================================================================
// Authentication Helper
// ============================================================================

/**
 * Get authentication token with fallback strategy.
 * First checks Redux state, then falls back to localStorage via loadToken.
 * @returns Bearer token or null if not available
 */
export const getAuthToken = (): string | null => {
  try {
    const state = store.getState();
    const reduxToken = state.auth?.token;

    if (reduxToken) {
      return reduxToken;
    }

    // Fallback to decrypt token from localStorage
    return loadToken();
  } catch (error) {
    console.error('[Translations Service] Error retrieving auth token:', error);
    return null;
  }
};

// ============================================================================
// Axios Instance Configuration
// ============================================================================

/**
 * Configured axios instance for translations API calls.
 * Base URL points to the translations endpoint group.
 * Automatically attaches authentication headers and handles common configurations.
 */
const translationsApiClient: AxiosInstance = axios.create({
  baseURL: 'http://dforms.pnepizza.com/api/translations',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  timeout: 30000, // 30 second timeout
});

/**
 * Request interceptor to attach bearer token to every request.
 * Logs request details for debugging.
 */
translationsApiClient.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (!token) {
      console.error('[Translations Service] No authentication token available');
      throw new Error('Authentication token is missing. Please log in again.');
    }

    // Attach bearer token
    config.headers.Authorization = `Bearer ${token}`;
    console.log(
      `[Translations Service] Request: ${config.method?.toUpperCase()} ${config.url}`,
      config.params || config.data || 'No payload'
    );
    return config;
  },
  (error) => {
    console.error('[Translations Service] Request interceptor error:', error);
    return Promise.reject(error);
  }
);

/**
 * Response interceptor to log responses and handle common errors.
 */
translationsApiClient.interceptors.response.use(
  (response) => {
    console.log(
      `[Translations Service] Response: ${response.config.method?.toUpperCase()} ${response.config.url}`,
      'Status:', response.status,
      'Data:', response.data
    );
    return response;
  },
  (error: AxiosError) => {
    console.error(
      `[Translations Service] Response error:`,
      error.response?.status,
      error.response?.data || error.message
    );
    return Promise.reject(error);
  }
);

// ============================================================================
// Error Handling Utilities
// ============================================================================

/**
 * Extracts a user-friendly error message from various error types.
 * @param error - The error object (Axios, API, or generic)
 * @returns User-friendly error message
 */
const extractErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<ApiResponse<unknown>>;

    // Check for API error message
    if (axiosError.response?.data?.message) {
      return axiosError.response.data.message;
    }

    if (axiosError.response?.data?.error) {
      return String(axiosError.response.data.error);
    }

    // Network or timeout errors
    if (axiosError.code === 'ECONNABORTED') {
      return 'Request timeout. Please check your connection and try again.';
    }

    if (axiosError.code === 'ERR_NETWORK') {
      return 'Network error. Please check your internet connection.';
    }

    if (axiosError.response?.status === 401) {
      return 'Unauthorized. Please log in again.';
    }

    if (axiosError.response?.status === 403) {
      return 'Access forbidden. You do not have permission to perform this action.';
    }

    if (axiosError.response?.status === 404) {
      return 'Resource not found.';
    }

    if (axiosError.response?.status === 500) {
      return 'Server error. Please try again later.';
    }

    return axiosError.message || 'An unexpected error occurred.';
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'An unknown error occurred.';
};

/**
 * Creates a detailed error object with message and original error.
 * @param error - The caught error
 * @param context - Context about where the error occurred
 */
const createServiceError = (error: unknown, context: string) => {
  const message = extractErrorMessage(error);
  console.error(`[Translations Service] ${context}:`, message, error);
  return {
    message: `${context}: ${message}`,
    originalError: error,
  };
};

// ============================================================================
// API Service Functions
// ============================================================================

/**
 * Fetch all available languages for translation (excluding default language).
 * 
 * Endpoint: GET /api/translations/available-languages
 * 
 * @throws Error if request fails or response is invalid
 * @returns Array of Language objects
 */
export const fetchAvailableLanguages = async (): Promise<Language[]> => {
  try {
    console.log('[Translations Service] Fetching available languages...');

    const response = await translationsApiClient.get<AvailableLanguagesResponse>(
      '/available-languages'
    );

    // Validate response structure
    if (!response.data || !isSuccessResponse(response.data)) {
      throw new Error('Invalid response structure from available languages endpoint');
    }

    if (!Array.isArray(response.data.data)) {
      throw new Error('Expected data to be an array of languages');
    }

    console.log(
      `[Translations Service] Successfully fetched ${response.data.data.length} languages`
    );
    return response.data.data;
  } catch (error) {
    throw createServiceError(error, 'Failed to fetch available languages');
  }
};

/**
 * Fetch localizable data (form name + stages + sections + transitions + fields) 
 * for a specific form version and language.
 * 
 * Endpoint: GET /api/translations/localizable-data
 * 
 * The API returns data with nested original/translated structure:
 * - form_name: { original: string, translated: string }
 * - stages[]: { stage_id, original: {name}, translated: {name} }
 * - sections[]: { section_id, stage_id, original: {name}, translated: {name} }
 * - transitions[]: { stage_transition_id, original: {label}, translated: {label} }
 * - fields[]: { field_id, original: {...}, translated: {...} }
 * 
 * @param params - Form version ID and language ID
 * @throws Error if request fails or response is invalid
 * @returns LocalizableData object containing all translatable content
 */
export const fetchLocalizableData = async (
  params: GetLocalizableDataParams
): Promise<LocalizableData> => {
  try {
    console.log(
      `[Translations Service] Fetching localizable data for form_version_id=${params.form_version_id}, language_id=${params.language_id}...`
    );

    const response = await translationsApiClient.get<LocalizableDataResponse>(
      '/localizable-data',
      {
        params: {
          form_version_id: params.form_version_id,
          language_id: params.language_id,
        },
      }
    );

    // Validate response structure
    if (!response.data || !isSuccessResponse(response.data)) {
      throw new Error('Invalid response structure from localizable data endpoint');
    }

    if (!response.data.data || typeof response.data.data !== 'object') {
      throw new Error('Expected data to be a localizable data object');
    }

    const localizableData = response.data.data;

    // Validate critical fields for new structure
    if (
      !localizableData.form_version_id ||
      !localizableData.language ||
      !localizableData.form_name ||
      typeof localizableData.form_name !== 'object' ||
      !('original' in localizableData.form_name) ||
      !('translated' in localizableData.form_name)
    ) {
      throw new Error('Localizable data is missing required fields or has invalid structure');
    }

    // Validate arrays exist
    if (!Array.isArray(localizableData.stages)) {
      throw new Error('Expected stages to be an array');
    }

    if (!Array.isArray(localizableData.sections)) {
      throw new Error('Expected sections to be an array');
    }

    if (!Array.isArray(localizableData.transitions)) {
      throw new Error('Expected transitions to be an array');
    }

    if (!Array.isArray(localizableData.fields)) {
      throw new Error('Expected fields to be an array');
    }

    // Validate stage structure
    for (const stage of localizableData.stages) {
      if (
        !stage.stage_id ||
        !stage.original ||
        !stage.translated ||
        typeof stage.original !== 'object' ||
        typeof stage.translated !== 'object' ||
        !('name' in stage.original) ||
        !('name' in stage.translated)
      ) {
        throw new Error(
          `Invalid stage structure for stage_id ${stage.stage_id || 'unknown'}. Expected nested original/translated objects with name.`
        );
      }
    }

    // Validate section structure
    for (const section of localizableData.sections) {
      if (
        !section.section_id ||
        !section.stage_id ||
        !section.original ||
        !section.translated ||
        typeof section.original !== 'object' ||
        typeof section.translated !== 'object' ||
        !('name' in section.original) ||
        !('name' in section.translated)
      ) {
        throw new Error(
          `Invalid section structure for section_id ${section.section_id || 'unknown'}. Expected nested original/translated objects with name.`
        );
      }
    }

    // Validate transition structure
    for (const transition of localizableData.transitions) {
      if (
        !transition.stage_transition_id ||
        !transition.original ||
        !transition.translated ||
        typeof transition.original !== 'object' ||
        typeof transition.translated !== 'object' ||
        !('label' in transition.original) ||
        !('label' in transition.translated)
      ) {
        throw new Error(
          `Invalid transition structure for stage_transition_id ${transition.stage_transition_id || 'unknown'}. Expected nested original/translated objects with label.`
        );
      }
    }

    // Validate field structure
    for (const field of localizableData.fields) {
      if (
        !field.field_id ||
        !field.original ||
        !field.translated ||
        typeof field.original !== 'object' ||
        typeof field.translated !== 'object'
      ) {
        throw new Error(
          `Invalid field structure for field_id ${field.field_id || 'unknown'}. Expected nested original/translated objects.`
        );
      }
    }

    console.log(
      `[Translations Service] Successfully fetched localizable data:`,
      `${localizableData.stages.length} stages,`,
      `${localizableData.sections.length} sections,`,
      `${localizableData.transitions.length} transitions,`,
      `${localizableData.fields.length} fields`
    );
    console.log(
      `[Translations Service] Form name - Original: "${localizableData.form_name.original}", Translated: "${localizableData.form_name.translated}"`
    );

    return localizableData;
  } catch (error) {
    throw createServiceError(error, 'Failed to fetch localizable data');
  }
};

/**
 * Save translations for a form version in a specific language.
 * 
 * Endpoint: POST /api/translations/save
 * 
 * The save payload uses the flat structure for translations:
 * - form_name: string
 * - stage_translations: [{ stage_id, name }]
 * - section_translations: [{ section_id, name }]
 * - transition_translations: [{ stage_transition_id, label }]
 * - field_translations: [{ field_id, label, helper_text, default_value, place_holder }]
 * 
 * @param payload - Translation data including form name and all translation arrays
 * @throws Error if request fails or response is invalid
 * @returns Success message from the API
 */
export const saveTranslations = async (
  payload: SaveTranslationsPayload
): Promise<{ success: true; message: string }> => {
  try {
    console.log(
      `[Translations Service] Saving translations for form_version_id=${payload.form_version_id}, language_id=${payload.language_id}...`,
      `Payload contains:`,
      `${payload.stage_translations.length} stage translations,`,
      `${payload.section_translations.length} section translations,`,
      `${payload.transition_translations.length} transition translations,`,
      `${payload.field_translations.length} field translations`
    );

    // Validate payload before sending
    if (!payload.form_version_id || !payload.language_id) {
      throw new Error('form_version_id and language_id are required');
    }

    if (!payload.form_name || typeof payload.form_name !== 'string') {
      throw new Error('form_name is required and must be a string');
    }

    if (!Array.isArray(payload.stage_translations)) {
      throw new Error('stage_translations must be an array');
    }

    if (!Array.isArray(payload.section_translations)) {
      throw new Error('section_translations must be an array');
    }

    if (!Array.isArray(payload.transition_translations)) {
      throw new Error('transition_translations must be an array');
    }

    if (!Array.isArray(payload.field_translations)) {
      throw new Error('field_translations must be an array');
    }

    // Validate each stage translation
    for (const stageTranslation of payload.stage_translations) {
      if (
        !stageTranslation.stage_id ||
        typeof stageTranslation.name !== 'string'
      ) {
        throw new Error(
          `Invalid stage translation structure for stage_id ${stageTranslation.stage_id || 'unknown'}`
        );
      }
    }

    // Validate each section translation
    for (const sectionTranslation of payload.section_translations) {
      if (
        !sectionTranslation.section_id ||
        typeof sectionTranslation.name !== 'string'
      ) {
        throw new Error(
          `Invalid section translation structure for section_id ${sectionTranslation.section_id || 'unknown'}`
        );
      }
    }

    // Validate each transition translation
    for (const transitionTranslation of payload.transition_translations) {
      if (
        !transitionTranslation.stage_transition_id ||
        typeof transitionTranslation.label !== 'string'
      ) {
        throw new Error(
          `Invalid transition translation structure for stage_transition_id ${transitionTranslation.stage_transition_id || 'unknown'}`
        );
      }
    }

    // Validate each field translation
    for (const fieldTranslation of payload.field_translations) {
      if (
        !fieldTranslation.field_id ||
        typeof fieldTranslation.label !== 'string' ||
        typeof fieldTranslation.helper_text !== 'string' ||
        typeof fieldTranslation.default_value !== 'string' ||
        typeof fieldTranslation.place_holder !== 'string'
      ) {
        throw new Error(
          `Invalid field translation structure for field_id ${fieldTranslation.field_id || 'unknown'}`
        );
      }
    }

    const response = await translationsApiClient.post<SaveTranslationsResponse>(
      '/save',
      payload
    );

    // Validate response structure
    if (!response.data || response.data.success !== true) {
      throw new Error('Invalid response structure from save translations endpoint');
    }

    if (!response.data.message) {
      throw new Error('Response missing success message');
    }

    console.log(
      `[Translations Service] Successfully saved translations: ${response.data.message}`
    );

    return {
      success: true,
      message: response.data.message,
    };
  } catch (error) {
    throw createServiceError(error, 'Failed to save translations');
  }
};

// ============================================================================
// Export Service Object (optional alternative API)
// ============================================================================

/**
 * Translations service object with all API methods.
 * Can be imported as a namespace for cleaner imports.
 */
export const TranslationsService = {
  fetchAvailableLanguages,
  fetchLocalizableData,
  saveTranslations,
  getAuthToken,
};

export default TranslationsService;
