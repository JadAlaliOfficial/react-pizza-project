// translations.slice.ts

/**
 * Redux Toolkit slice for translations feature.
 * Manages state for available languages, localizable data, and translation save operations.
 * 
 * State structure is designed to be scalable with caching for localizable data
 * and granular loading/error states for each operation.
 * 
 * UPDATED: Compatible with nested original/translated structure from API
 */

import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '@/store';
import {
  type TranslationsState,
  type Language,
  type LocalizableData,
  type SaveTranslationsPayload,
  type GetLocalizableDataParams,
  type TranslationError,
  createCacheKey,
  type LocalizableDataCacheKey,
} from '../types';
import {
  fetchAvailableLanguages as fetchLanguagesService,
  fetchLocalizableData as fetchLocalizableDataService,
  saveTranslations as saveTranslationsService,
} from '../services/api';

// ============================================================================
// Initial State
// ============================================================================

const initialState: TranslationsState = {
  // Languages data
  languages: [],
  languagesLoaded: false,

  // Localizable data cache
  localizableDataCache: {},

  // Save operation status
  lastSaveSuccess: null,
  lastSaveTimestamp: null,

  // Loading flags
  loading: {
    languages: false,
    localizableData: false,
    saving: false,
  },

  // Error states
  errors: {
    languages: null,
    localizableData: null,
    save: null,
  },
};

// ============================================================================
// Async Thunks
// ============================================================================

/**
 * Fetch available languages for translation (excluding default language).
 * 
 * This thunk calls the translations service to retrieve all languages
 * that can be used for creating translations.
 */
export const fetchAvailableLanguages = createAsyncThunk<
  Language[], // Return type
  void, // Argument type
  { rejectValue: string } // ThunkAPI config
>(
  'translations/fetchAvailableLanguages',
  async (_, { rejectWithValue }) => {
    try {
      console.log('[Translations Slice] Thunk: Fetching available languages...');
      const languages = await fetchLanguagesService();
      console.log(`[Translations Slice] Thunk: Successfully fetched ${languages.length} languages`);
      return languages;
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to fetch available languages';
      console.error('[Translations Slice] Thunk: Error fetching languages:', errorMessage, error);
      return rejectWithValue(errorMessage);
    }
  }
);

/**
 * Fetch localizable data for a specific form version and language.
 * 
 * Retrieves the form name and all field data that can be translated.
 * Results are cached in state using a composite key (formVersionId_languageId).
 * 
 * The data now includes nested original/translated structure:
 * - form_name: { original: string, translated: string }
 * - fields[]: { field_id, original: {...}, translated: {...} }
 * 
 * @param params - Form version ID and language ID
 */
export const fetchLocalizableData = createAsyncThunk<
  { data: LocalizableData; cacheKey: LocalizableDataCacheKey }, // Return type
  GetLocalizableDataParams, // Argument type
  { rejectValue: string } // ThunkAPI config
>(
  'translations/fetchLocalizableData',
  async (params, { rejectWithValue }) => {
    try {
      console.log(
        `[Translations Slice] Thunk: Fetching localizable data for form_version_id=${params.form_version_id}, language_id=${params.language_id}...`
      );

      const data = await fetchLocalizableDataService(params);
      const cacheKey = createCacheKey(params.form_version_id, params.language_id);

      console.log(
        `[Translations Slice] Thunk: Successfully fetched localizable data with ${data.fields.length} fields`
      );
      console.log(
        `[Translations Slice] Thunk: Form name - Original: "${data.form_name.original}", Translated: "${data.form_name.translated}"`
      );

      return { data, cacheKey };
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to fetch localizable data';
      console.error(
        '[Translations Slice] Thunk: Error fetching localizable data:',
        errorMessage,
        error
      );
      return rejectWithValue(errorMessage);
    }
  }
);

/**
 * Save translations for a form version in a specific language.
 * 
 * Submits translated form name and field translations to the API.
 * On success, invalidates the cache for the corresponding localizable data
 * so it will be refetched with updated translations on next access.
 * 
 * Note: The save payload uses flat structure for field_translations,
 * while the fetched data has nested original/translated structure.
 * 
 * @param payload - Translation data including form_version_id, language_id, form_name, and field_translations
 */
export const saveTranslations = createAsyncThunk<
  { message: string; cacheKey: LocalizableDataCacheKey }, // Return type
  SaveTranslationsPayload, // Argument type
  { rejectValue: string } // ThunkAPI config
>(
  'translations/saveTranslations',
  async (payload, { rejectWithValue }) => {
    try {
      console.log(
        `[Translations Slice] Thunk: Saving translations for form_version_id=${payload.form_version_id}, language_id=${payload.language_id}...`
      );
      console.log(
        `[Translations Slice] Thunk: Form name: "${payload.form_name}", ${payload.field_translations.length} field translations`
      );

      const result = await saveTranslationsService(payload);
      const cacheKey = createCacheKey(payload.form_version_id, payload.language_id);

      console.log('[Translations Slice] Thunk: Successfully saved translations:', result.message);

      return { message: result.message, cacheKey };
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to save translations';
      console.error('[Translations Slice] Thunk: Error saving translations:', errorMessage, error);
      return rejectWithValue(errorMessage);
    }
  }
);

// ============================================================================
// Slice Definition
// ============================================================================

const translationsSlice = createSlice({
  name: 'translations',
  initialState,
  reducers: {
    /**
     * Clear all error states.
     * Useful for dismissing error messages in the UI.
     */
    clearAllErrors: (state) => {
      console.log('[Translations Slice] Reducer: Clearing all errors');
      state.errors.languages = null;
      state.errors.localizableData = null;
      state.errors.save = null;
    },

    /**
     * Clear languages error only.
     */
    clearLanguagesError: (state) => {
      console.log('[Translations Slice] Reducer: Clearing languages error');
      state.errors.languages = null;
    },

    /**
     * Clear localizable data error only.
     */
    clearLocalizableDataError: (state) => {
      console.log('[Translations Slice] Reducer: Clearing localizable data error');
      state.errors.localizableData = null;
    },

    /**
     * Clear save error only.
     */
    clearSaveError: (state) => {
      console.log('[Translations Slice] Reducer: Clearing save error');
      state.errors.save = null;
    },

    /**
     * Reset save status.
     * Clears the lastSaveSuccess flag and timestamp.
     */
    resetSaveStatus: (state) => {
      console.log('[Translations Slice] Reducer: Resetting save status');
      state.lastSaveSuccess = null;
      state.lastSaveTimestamp = null;
      state.errors.save = null;
    },

    /**
     * Clear a specific localizable data from cache.
     * Useful when you know data is stale and want to force a refetch.
     * 
     * @param action - Cache key to remove
     */
    clearLocalizableDataCache: (state, action: PayloadAction<LocalizableDataCacheKey>) => {
      const cacheKey = action.payload;
      console.log(`[Translations Slice] Reducer: Clearing cache for key: ${cacheKey}`);
      delete state.localizableDataCache[cacheKey];
    },

    /**
     * Clear entire localizable data cache.
     * Useful for logout or when switching contexts.
     */
    clearEntireCache: (state) => {
      console.log('[Translations Slice] Reducer: Clearing entire localizable data cache');
      state.localizableDataCache = {};
    },
  },

  extraReducers: (builder) => {
    // ========================================================================
    // Fetch Available Languages
    // ========================================================================
    builder
      .addCase(fetchAvailableLanguages.pending, (state) => {
        console.log('[Translations Slice] Reducer: fetchAvailableLanguages pending');
        state.loading.languages = true;
        state.errors.languages = null;
      })
      .addCase(fetchAvailableLanguages.fulfilled, (state, action) => {
        console.log(
          `[Translations Slice] Reducer: fetchAvailableLanguages fulfilled with ${action.payload.length} languages`
        );
        state.loading.languages = false;
        state.languages = action.payload;
        state.languagesLoaded = true;
        state.errors.languages = null;
      })
      .addCase(fetchAvailableLanguages.rejected, (state, action) => {
        console.error(
          '[Translations Slice] Reducer: fetchAvailableLanguages rejected:',
          action.payload
        );
        state.loading.languages = false;
        state.errors.languages = {
          message: action.payload || 'Failed to fetch available languages',
          details: action.error,
          timestamp: Date.now(),
        };
      });

    // ========================================================================
    // Fetch Localizable Data
    // ========================================================================
    builder
      .addCase(fetchLocalizableData.pending, (state) => {
        console.log('[Translations Slice] Reducer: fetchLocalizableData pending');
        state.loading.localizableData = true;
        state.errors.localizableData = null;
      })
      .addCase(fetchLocalizableData.fulfilled, (state, action) => {
        const { data, cacheKey } = action.payload;
        console.log(
          `[Translations Slice] Reducer: fetchLocalizableData fulfilled for cache key: ${cacheKey}`
        );
        console.log(
          `[Translations Slice] Reducer: Caching data with ${data.fields.length} fields, form_name: "${data.form_name.translated}"`
        );
        state.loading.localizableData = false;
        state.localizableDataCache[cacheKey] = data;
        state.errors.localizableData = null;
      })
      .addCase(fetchLocalizableData.rejected, (state, action) => {
        console.error(
          '[Translations Slice] Reducer: fetchLocalizableData rejected:',
          action.payload
        );
        state.loading.localizableData = false;
        state.errors.localizableData = {
          message: action.payload || 'Failed to fetch localizable data',
          details: action.error,
          timestamp: Date.now(),
        };
      });

    // ========================================================================
    // Save Translations
    // ========================================================================
    builder
      .addCase(saveTranslations.pending, (state) => {
        console.log('[Translations Slice] Reducer: saveTranslations pending');
        state.loading.saving = true;
        state.errors.save = null;
        state.lastSaveSuccess = null;
      })
      .addCase(saveTranslations.fulfilled, (state, action) => {
        const { message, cacheKey } = action.payload;
        console.log(
          `[Translations Slice] Reducer: saveTranslations fulfilled: ${message}`
        );
        state.loading.saving = false;
        state.lastSaveSuccess = true;
        state.lastSaveTimestamp = Date.now();
        state.errors.save = null;

        // Invalidate cache for this form version + language combination
        // so next fetch will get updated data
        console.log(
          `[Translations Slice] Reducer: Invalidating cache for key: ${cacheKey} after save`
        );
        delete state.localizableDataCache[cacheKey];
      })
      .addCase(saveTranslations.rejected, (state, action) => {
        console.error('[Translations Slice] Reducer: saveTranslations rejected:', action.payload);
        state.loading.saving = false;
        state.lastSaveSuccess = false;
        state.lastSaveTimestamp = Date.now();
        state.errors.save = {
          message: action.payload || 'Failed to save translations',
          details: action.error,
          timestamp: Date.now(),
        };
      });
  },
});

// ============================================================================
// Selectors
// ============================================================================

/**
 * Select all available languages.
 */
export const selectLanguages = (state: RootState): Language[] =>
  state.translations.languages;

/**
 * Check if languages have been loaded at least once.
 */
export const selectLanguagesLoaded = (state: RootState): boolean =>
  state.translations.languagesLoaded;

/**
 * Select localizable data from cache by cache key.
 * Returns undefined if not in cache.
 */
export const selectLocalizableDataByKey = (
  state: RootState,
  cacheKey: LocalizableDataCacheKey
): LocalizableData | undefined => state.translations.localizableDataCache[cacheKey];

/**
 * Select all loading states.
 */
export const selectLoadingStates = (state: RootState) => state.translations.loading;

/**
 * Check if languages are currently loading.
 */
export const selectIsLoadingLanguages = (state: RootState): boolean =>
  state.translations.loading.languages;

/**
 * Check if localizable data is currently loading.
 */
export const selectIsLoadingLocalizableData = (state: RootState): boolean =>
  state.translations.loading.localizableData;

/**
 * Check if save operation is in progress.
 */
export const selectIsSaving = (state: RootState): boolean =>
  state.translations.loading.saving;

/**
 * Select all error states.
 */
export const selectErrors = (state: RootState) => state.translations.errors;

/**
 * Select languages error.
 */
export const selectLanguagesError = (state: RootState): TranslationError | null =>
  state.translations.errors.languages;

/**
 * Select localizable data error.
 */
export const selectLocalizableDataError = (state: RootState): TranslationError | null =>
  state.translations.errors.localizableData;

/**
 * Select save error.
 */
export const selectSaveError = (state: RootState): TranslationError | null =>
  state.translations.errors.save;

/**
 * Select last save status (true = success, false = failure, null = no save yet).
 */
export const selectLastSaveSuccess = (state: RootState): boolean | null =>
  state.translations.lastSaveSuccess;

/**
 * Select timestamp of last save attempt.
 */
export const selectLastSaveTimestamp = (state: RootState): number | null =>
  state.translations.lastSaveTimestamp;

/**
 * Select entire localizable data cache.
 */
export const selectLocalizableDataCache = (state: RootState) =>
  state.translations.localizableDataCache;

// ============================================================================
// Exports
// ============================================================================

export const {
  clearAllErrors,
  clearLanguagesError,
  clearLocalizableDataError,
  clearSaveError,
  resetSaveStatus,
  clearLocalizableDataCache,
  clearEntireCache,
} = translationsSlice.actions;

export default translationsSlice.reducer;
