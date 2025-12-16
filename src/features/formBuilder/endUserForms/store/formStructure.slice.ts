/**
 * ================================
 * FORM STRUCTURE MODULE - Redux Slice (RTK)
 * ================================
 * Redux Toolkit slice for managing form structure state.
 * - Uses createAsyncThunk for async operations
 * - Provides strongly typed state and actions
 * - Includes selectors for easy state access
 * - Handles loading, success, and error states
 * - Includes lastFetchedAt for cache management
 */

import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '@/store'; // Adjust path to your store
import FormsService from '../services/formStructure.api';
import type { FormStructureData, ApiError } from '../types/formStructure.types';

/**
 * State shape for the form structure slice
 */
export interface FormStructureState {
  data: FormStructureData | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: ApiError | null;
  lastFetchedAt: number | null;
}

/**
 * Initial state
 */
const initialState: FormStructureState = {
  data: null,
  status: 'idle',
  error: null,
  lastFetchedAt: null,
};

/**
 * Async thunk parameters
 */
export interface FetchFormStructureParams {
  formVersionId: number;
  languageId: number;
  signal?: AbortSignal;
}

/**
 * FETCH FORM STRUCTURE
 * Async thunk to fetch form structure from the API.
 * - Accepts formVersionId, languageId, and optional AbortSignal
 * - Returns typed FormStructureData on success
 * - Uses rejectWithValue for typed error handling
 */
export const fetchFormStructure = createAsyncThunk<
  FormStructureData,
  FetchFormStructureParams,
  { rejectValue: ApiError }
>(
  'formStructure/fetchFormStructure',
  async ({ formVersionId, languageId, signal }, { rejectWithValue }) => {
    try {
      console.debug('[formStructureSlice] Fetching form structure:', { formVersionId, languageId });

      const data = await FormsService.getFormStructure(formVersionId, languageId, signal);

      console.debug('[formStructureSlice] Form structure fetched successfully');
      return data;
    } catch (error: any) {
      // Handle abort/cancellation - don't treat as error
      if (error.name === 'AbortError' || error.name === 'CanceledError') {
        console.debug('[formStructureSlice] Request was cancelled');
        return rejectWithValue({
          status: 0,
          message: 'Request was cancelled',
          data: null,
        });
      }

      console.error('[formStructureSlice] Error fetching form structure:', error);

      // Normalize error into ApiError shape
      const apiError: ApiError = {
        status: error.status || 500,
        message: error.message || 'Failed to fetch form structure',
        data: error.data || null,
      };

      return rejectWithValue(apiError);
    }
  }
);

/**
 * Form Structure slice
 */
const formStructureSlice = createSlice({
  name: 'formStructure',
  initialState,
  reducers: {
    /**
     * Reset the form structure state to initial values
     */
    resetFormStructure: (state) => {
      console.debug('[formStructureSlice] Resetting form structure state');
      state.data = null;
      state.status = 'idle';
      state.error = null;
      state.lastFetchedAt = null;
    },

    /**
     * Clear error state
     */
    clearFormStructureError: (state) => {
      console.debug('[formStructureSlice] Clearing error state');
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // PENDING: Request started
      .addCase(fetchFormStructure.pending, (state) => {
        console.debug('[formStructureSlice] fetchFormStructure pending');
        state.status = 'loading';
        state.error = null;
      })

      // FULFILLED: Request succeeded
      .addCase(fetchFormStructure.fulfilled, (state, action: PayloadAction<FormStructureData>) => {
        console.debug('[formStructureSlice] fetchFormStructure fulfilled');
        state.status = 'succeeded';
        state.data = action.payload;
        state.error = null;
        state.lastFetchedAt = Date.now();
      })

      // REJECTED: Request failed
      .addCase(fetchFormStructure.rejected, (state, action) => {
        const isCancelled = Boolean(action.payload && (action.payload as ApiError).status === 0);
        if (isCancelled) {
          console.debug('[formStructureSlice] fetchFormStructure cancelled');
          state.status = state.data ? 'succeeded' : 'idle';
          state.error = null;
        } else {
          console.error('[formStructureSlice] fetchFormStructure rejected:', action.payload);
          state.status = 'failed';
          state.error = action.payload || {
            status: 500,
            message: 'An unknown error occurred',
            data: null,
          };
        }
      });
  },
});

/**
 * Export actions
 */
export const { resetFormStructure, clearFormStructureError } = formStructureSlice.actions;

/**
 * SELECTORS
 * Strongly typed selectors for accessing form structure state
 */

/**
 * Select the entire form structure state
 */
export const selectFormStructureState = (state: RootState): FormStructureState => 
  state.formStructure;

/**
 * Select form structure data
 */
export const selectFormStructure = (state: RootState): FormStructureData | null =>
  state.formStructure.data;

/**
 * Select loading status
 */
export const selectFormStructureStatus = (state: RootState): FormStructureState['status'] =>
  state.formStructure.status;

/**
 * Select if data is currently loading
 */
export const selectIsFormStructureLoading = (state: RootState): boolean =>
  state.formStructure.status === 'loading';

/**
 * Select if request failed
 */
export const selectIsFormStructureError = (state: RootState): boolean =>
  state.formStructure.status === 'failed';

/**
 * Select error state
 */
export const selectFormStructureError = (state: RootState): ApiError | null =>
  state.formStructure.error;

/**
 * Select last fetched timestamp
 */
export const selectFormStructureLastFetchedAt = (state: RootState): number | null =>
  state.formStructure.lastFetchedAt;

/**
 * Select if form has been loaded successfully
 */
export const selectHasFormStructureData = (state: RootState): boolean =>
  state.formStructure.data !== null && state.formStructure.status === 'succeeded';

/**
 * Export reducer as default (named formStructureReducer when imported)
 */
export default formStructureSlice.reducer;
