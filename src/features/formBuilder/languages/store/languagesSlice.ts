// src/features/languages/store/languagesSlice.ts
// Assumptions:
// - Redux Toolkit is configured with store at src/store/index.ts or src/store.ts
// - This slice manages language state with proper typing and async thunk handling
// - Intended to be imported into the root reducer

import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import type { Language, LanguagesState, ApiError } from '../types';
import { fetchAllLanguages } from '../services/api';

/**
 * Initial state for languages slice.
 */
const initialState: LanguagesState = {
  status: 'idle',
  data: null,
  error: null,
};

/**
 * Async thunk to fetch all languages from the API.
 * Handles loading states and errors automatically via Redux Toolkit.
 */
export const fetchLanguages = createAsyncThunk<
  Language[], // Return type on success
  void, // Argument type (none needed)
  { rejectValue: ApiError } // ThunkAPI config with typed rejection
>(
  'languages/fetchLanguages',
  async (_, { rejectWithValue }) => {
    try {
      console.log('[LanguagesSlice] Dispatching fetchLanguages thunk...');
      const languages = await fetchAllLanguages();
      console.log(`[LanguagesSlice] Successfully loaded ${languages.length} languages into state`);
      return languages;
    } catch (error) {
      // Error is already normalized by service layer
      const apiError = error as ApiError;
      console.error('[LanguagesSlice] fetchLanguages thunk rejected:', apiError);
      return rejectWithValue(apiError);
    }
  }
);

/**
 * Languages slice with reducers and extra reducers for async thunk.
 */
const languagesSlice = createSlice({
  name: 'languages',
  initialState,
  reducers: {
    /**
     * Reset languages state to initial values.
     * Useful for logout or clearing data.
     */
    resetLanguages: (state) => {
      console.log('[LanguagesSlice] Resetting languages state');
      state.status = 'idle';
      state.data = null;
      state.error = null;
    },

    /**
     * Clear error without affecting data or status.
     * Useful for dismissing error messages in UI.
     */
    clearError: (state) => {
      state.error = null;
    },

    /**
     * Manually set languages data (for caching or optimistic updates).
     */
    setLanguages: (state, action: PayloadAction<Language[]>) => {
      state.data = action.payload;
      state.status = 'succeeded';
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Handle pending state
      .addCase(fetchLanguages.pending, (state) => {
        console.log('[LanguagesSlice] fetchLanguages pending...');
        state.status = 'loading';
        state.error = null; // Clear previous errors on new request
      })
      
      // Handle success state
      .addCase(fetchLanguages.fulfilled, (state, action: PayloadAction<Language[]>) => {
        console.log('[LanguagesSlice] fetchLanguages fulfilled');
        state.status = 'succeeded';
        state.data = action.payload;
        state.error = null;
      })
      
      // Handle error state
      .addCase(fetchLanguages.rejected, (state, action) => {
        console.error('[LanguagesSlice] fetchLanguages rejected:', action.payload);
        state.status = 'failed';
        state.error = action.payload || {
          status: -1,
          message: 'An unknown error occurred',
        };
      });
  },
});

// Export actions
export const { resetLanguages, clearError, setLanguages } = languagesSlice.actions;

// Export reducer
export default languagesSlice.reducer;

/**
 * Selectors for accessing languages state.
 * Use these in components or hooks for type-safe access.
 */
export const selectLanguagesState = (state: { languages: LanguagesState }) => state.languages;
export const selectLanguages = (state: { languages: LanguagesState }) => state.languages.data;
export const selectLanguagesStatus = (state: { languages: LanguagesState }) => state.languages.status;
export const selectLanguagesError = (state: { languages: LanguagesState }) => state.languages.error;

/**
 * Derived selector: Get the default language from the list.
 */
export const selectDefaultLanguage = (state: { languages: LanguagesState }): Language | null => {
  const languages = state.languages.data;
  if (!languages || languages.length === 0) return null;
  return languages.find((lang) => lang.is_default) || null;
};

/**
 * Derived selector: Check if languages are loaded.
 */
export const selectLanguagesLoaded = (state: { languages: LanguagesState }): boolean => {
  return state.languages.status === 'succeeded' && state.languages.data !== null;
};
