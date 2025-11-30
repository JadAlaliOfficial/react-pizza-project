/**
 * Language Slice
 * 
 * Redux Toolkit slice for managing user language preferences.
 * Handles fetching all languages, fetching user default language, and updating default language.
 */

import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '@/store'; // Adjust path to your store
import {
  getAllLanguages,
  getDefaultLanguage,
  setDefaultLanguage,
} from '../services/api';
import type {
  Language,
  LanguageNormalized,
  LanguageState,
  GetAllLanguagesResponse,
  GetDefaultLanguageResponse,
  SetDefaultLanguageResponse,
} from '../types';

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Convert snake_case Language to camelCase LanguageNormalized
 */
const normalizeLanguage = (language: Language): LanguageNormalized => ({
  id: language.id,
  code: language.code,
  name: language.name,
  isDefault: language.is_default,
  createdAt: language.created_at,
  updatedAt: language.updated_at,
});

/**
 * Extract readable error message from rejected action
 */
const extractErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return 'An unexpected error occurred.';
};

// ============================================================================
// Initial State
// ============================================================================

const initialState: LanguageState = {
  languages: [],
  defaultLanguage: null,
  loading: false,
  error: null,
  lastFetched: null,
};

// ============================================================================
// Async Thunks
// ============================================================================

/**
 * Fetch all available languages
 * 
 * @returns Normalized list of all languages
 */
export const fetchAllLanguages = createAsyncThunk<
  LanguageNormalized[],
  void,
  { rejectValue: string }
>(
  'language/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      console.info('[Language Slice] Fetching all languages');
      
      const response: GetAllLanguagesResponse = await getAllLanguages();
      
      // Normalize snake_case to camelCase
      const normalized = response.data.map(normalizeLanguage);
      
      console.info('[Language Slice] Successfully fetched languages:', normalized.length);
      return normalized;
    } catch (error) {
      const errorMessage = extractErrorMessage(error);
      console.error('[Language Slice] Failed to fetch all languages:', errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);

/**
 * Fetch user's default language
 * 
 * @returns User's default language (normalized)
 */
export const fetchDefaultLanguage = createAsyncThunk<
  LanguageNormalized,
  void,
  { rejectValue: string }
>(
  'language/fetchDefault',
  async (_, { rejectWithValue }) => {
    try {
      console.info('[Language Slice] Fetching user default language');
      
      const response: GetDefaultLanguageResponse = await getDefaultLanguage();
      
      // Normalize snake_case to camelCase
      const normalized = normalizeLanguage(response.data);
      
      console.info('[Language Slice] Successfully fetched default language:', normalized.name);
      return normalized;
    } catch (error) {
      const errorMessage = extractErrorMessage(error);
      console.error('[Language Slice] Failed to fetch default language:', errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);

/**
 * Update user's default language
 * 
 * @param languageId - ID of language to set as default
 * @returns Updated default language (normalized)
 */
export const updateDefaultLanguage = createAsyncThunk<
  LanguageNormalized,
  number,
  { rejectValue: string; state: RootState }
>(
  'language/updateDefault',
  async (languageId, { getState, rejectWithValue }) => {
    try {
      console.info('[Language Slice] Updating default language to ID:', languageId);
      
      // Find the target language in current state for immediate UI update
      const { languages } = getState().languagesPreferences;
      const targetLanguage = languages.find(lang => lang.id === languageId);
      
      if (!targetLanguage) {
        console.warn('[Language Slice] Target language not found in state');
      }
      
      // Call API to update backend
      const response: SetDefaultLanguageResponse = await setDefaultLanguage(languageId);
      
      console.info('[Language Slice] Successfully updated default language');
      console.debug('[Language Slice] Updated user:', response.data);
      
      // Return the target language or fetch it from state
      if (targetLanguage) {
        return targetLanguage;
      }
      
      // If not in state, fetch default language again
      console.warn('[Language Slice] Language not in state, fetching default');
      const defaultResponse = await getDefaultLanguage();
      return normalizeLanguage(defaultResponse.data);
    } catch (error) {
      const errorMessage = extractErrorMessage(error);
      console.error('[Language Slice] Failed to update default language:', errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);

// ============================================================================
// Slice Definition
// ============================================================================

const languageSlice = createSlice({
  name: 'language',
  initialState,
  reducers: {
    /**
     * Clear error state
     */
    clearError: (state) => {
      state.error = null;
    },
    
    /**
     * Reset language state to initial values
     */
    resetLanguageState: () => initialState,
  },
  extraReducers: (builder) => {
    // ========================================================================
    // Fetch All Languages
    // ========================================================================
    builder
      .addCase(fetchAllLanguages.pending, (state) => {
        console.debug('[Language Slice] fetchAllLanguages: pending');
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchAllLanguages.fulfilled,
        (state, action: PayloadAction<LanguageNormalized[]>) => {
          console.debug('[Language Slice] fetchAllLanguages: fulfilled');
          state.loading = false;
          state.languages = action.payload;
          state.lastFetched = Date.now();
          state.error = null;
        }
      )
      .addCase(fetchAllLanguages.rejected, (state, action) => {
        console.debug('[Language Slice] fetchAllLanguages: rejected');
        state.loading = false;
        state.error = action.payload || 'Failed to fetch languages';
      });

    // ========================================================================
    // Fetch Default Language
    // ========================================================================
    builder
      .addCase(fetchDefaultLanguage.pending, (state) => {
        console.debug('[Language Slice] fetchDefaultLanguage: pending');
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchDefaultLanguage.fulfilled,
        (state, action: PayloadAction<LanguageNormalized>) => {
          console.debug('[Language Slice] fetchDefaultLanguage: fulfilled');
          state.loading = false;
          state.defaultLanguage = action.payload;
          state.error = null;
        }
      )
      .addCase(fetchDefaultLanguage.rejected, (state, action) => {
        console.debug('[Language Slice] fetchDefaultLanguage: rejected');
        state.loading = false;
        state.error = action.payload || 'Failed to fetch default language';
      });

    // ========================================================================
    // Update Default Language
    // ========================================================================
    builder
      .addCase(updateDefaultLanguage.pending, (state) => {
        console.debug('[Language Slice] updateDefaultLanguage: pending');
        state.loading = true;
        state.error = null;
      })
      .addCase(
        updateDefaultLanguage.fulfilled,
        (state, action: PayloadAction<LanguageNormalized>) => {
          console.debug('[Language Slice] updateDefaultLanguage: fulfilled');
          state.loading = false;
          state.defaultLanguage = action.payload;
          state.error = null;
          
          // Update isDefault flag in languages array
          state.languages = state.languages.map(lang => ({
            ...lang,
            isDefault: lang.id === action.payload.id,
          }));
        }
      )
      .addCase(updateDefaultLanguage.rejected, (state, action) => {
        console.debug('[Language Slice] updateDefaultLanguage: rejected');
        state.loading = false;
        state.error = action.payload || 'Failed to update default language';
      });
  },
});

// ============================================================================
// Actions Export
// ============================================================================

export const { clearError, resetLanguageState } = languageSlice.actions;

// ============================================================================
// Selectors
// ============================================================================

/**
 * Select all languages
 */
export const selectLanguages = (state: RootState): LanguageNormalized[] =>
  state.languagesPreferences.languages;

/**
 * Select user's default language
 */
export const selectDefaultLanguage = (state: RootState): LanguageNormalized | null =>
  state.languagesPreferences.defaultLanguage;

/**
 * Select loading state
 */
export const selectLanguageLoading = (state: RootState): boolean =>
  state.languagesPreferences.loading;

/**
 * Select error state
 */
export const selectLanguageError = (state: RootState): string | null =>
  state.languagesPreferences.error;

/**
 * Select last fetched timestamp
 */
export const selectLastFetched = (state: RootState): number | null =>
  state.languagesPreferences.lastFetched;

/**
 * Select if languages data is stale (older than 5 minutes)
 */
export const selectIsLanguagesStale = (state: RootState): boolean => {
  const { lastFetched } = state.languagesPreferences;
  if (!lastFetched) return true;
  
  const FIVE_MINUTES = 5 * 60 * 1000;
  return Date.now() - lastFetched > FIVE_MINUTES;
};

/**
 * Select system default language (the one marked as default in system)
 */
export const selectSystemDefaultLanguage = (state: RootState): LanguageNormalized | null =>
  state.languagesPreferences.languages.find(lang => lang.isDefault) || null;

/**
 * Select language by ID
 */
export const selectLanguageById = (state: RootState, languageId: number): LanguageNormalized | undefined =>
  state.languagesPreferences.languages.find(lang => lang.id === languageId);

/**
 * Select language by code
 */
export const selectLanguageByCode = (state: RootState, code: string): LanguageNormalized | undefined =>
  state.languagesPreferences.languages.find(lang => lang.code === code);

/**
 * Check if languages are loaded
 */
export const selectHasLanguages = (state: RootState): boolean =>
  state.languagesPreferences.languages.length > 0;

// ============================================================================
// Reducer Export
// ============================================================================

export default languageSlice.reducer;
