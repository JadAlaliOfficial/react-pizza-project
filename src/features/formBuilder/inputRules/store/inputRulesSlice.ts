// inputRules.slice.ts

import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import { type InputRule } from '../types';
import { fetchInputRules } from '../services/api';
import type { RootState } from '@/store'; // Adjust path as needed

/**
 * State interface for input rules
 */
interface InputRulesState {
  items: InputRule[];
  loading: boolean;
  error: string | null;
  lastFetchedAt: string | null;
}

/**
 * Initial state
 */
const initialState: InputRulesState = {
  items: [],
  loading: false,
  error: null,
  lastFetchedAt: null,
};

/**
 * Async thunk to fetch input rules from the API
 * 
 * Why createAsyncThunk:
 * - Automatically generates pending/fulfilled/rejected action types
 * - Handles async lifecycle and error states
 * - Integrates seamlessly with extraReducers
 */
export const fetchInputRulesThunk = createAsyncThunk<
  InputRule[], // Return type on success
  void, // Argument type (no args needed)
  { rejectValue: string } // Type for rejectWithValue
>(
  'inputRules/fetch',
  async (_, { rejectWithValue }) => {
    console.info('[InputRules Thunk] Initiating fetch...');

    try {
      const data = await fetchInputRules();
      console.info(`[InputRules Thunk] Successfully fetched ${data.length} rules`);
      return data;
    } catch (error) {
      // Extract meaningful error message
      let errorMessage = 'Failed to fetch input rules';

      if (error instanceof Error) {
        errorMessage = error.message;
      }

      console.error('[InputRules Thunk] Fetch failed:', errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);

/**
 * Input rules slice
 */
const inputRulesSlice = createSlice({
  name: 'inputRules',
  initialState,
  reducers: {
    /**
     * Clear error state
     * Useful for dismissing error messages in UI
     */
    clearError: (state) => {
      state.error = null;
    },

    /**
     * Reset entire state to initial values
     * Useful for cleanup on logout or route changes
     */
    resetInputRules: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      // Pending: Request initiated
      .addCase(fetchInputRulesThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
        console.info('[InputRules Slice] Fetch pending...');
      })
      
      // Fulfilled: Request successful
      .addCase(fetchInputRulesThunk.fulfilled, (state, action: PayloadAction<InputRule[]>) => {
        state.loading = false;
        state.items = action.payload;
        state.lastFetchedAt = new Date().toISOString();
        state.error = null;
        console.info('[InputRules Slice] Fetch fulfilled, state updated');
      })
      
      // Rejected: Request failed
      .addCase(fetchInputRulesThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? 'An unknown error occurred';
        console.error('[InputRules Slice] Fetch rejected:', state.error);
      });
  },
});

/**
 * Action creators
 */
export const { clearError, resetInputRules } = inputRulesSlice.actions;

/**
 * Selectors
 * 
 * Why selectors:
 * - Encapsulate state shape
 * - Reusable across components
 * - Can be memoized with reselect if needed later
 */
export const selectInputRules = (state: RootState) => state.inputRules.items;
export const selectInputRulesLoading = (state: RootState) => state.inputRules.loading;
export const selectInputRulesError = (state: RootState) => state.inputRules.error;
export const selectInputRulesLastFetchedAt = (state: RootState) => state.inputRules.lastFetchedAt;

/**
 * Selector to check if data has been fetched
 * Useful for preventing unnecessary refetches
 */
export const selectHasInputRules = (state: RootState) => state.inputRules.items.length > 0;

/**
 * Reducer export (default)
 */
export default inputRulesSlice.reducer;
