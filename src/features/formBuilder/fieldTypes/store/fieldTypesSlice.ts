/**
 * Redux Toolkit slice for Field Types
 * 
 * This module manages the global state for field types including:
 * - Fetching field types from the API
 * - Tracking loading states (idle, pending, succeeded, failed)
 * - Error handling with user-friendly messages
 * - Cache management with timestamp tracking
 * 
 * Architecture:
 * - Uses createAsyncThunk for async operations
 * - Follows Redux Toolkit's extraReducers pattern
 * - Maintains serializable state (no functions, promises, or symbols)
 * - Provides selectors for easy state access
 */

import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '@/store';
import type { FieldType, FieldTypesState } from '../types';
import { fetchFieldTypes as fetchFieldTypesService } from '../services/api';

/**
 * Initial state for the field types slice
 * 
 * - items: Empty array, populated after successful fetch
 * - loading: 'idle' means no operation has started yet
 * - error: null means no error
 * - lastFetched: null means data has never been fetched
 */
const initialState: FieldTypesState = {
  items: [],
  loading: 'idle',
  error: null,
  lastFetched: null,
};

/**
 * Async thunk to fetch field types from the API
 * 
 * Action types generated:
 * - fieldTypes/fetch/pending
 * - fieldTypes/fetch/fulfilled
 * - fieldTypes/fetch/rejected
 * 
 * Usage in components:
 * ```
 * dispatch(fetchFieldTypesThunk())
 * ```
 * 
 * The thunk automatically:
 * - Dispatches pending action before API call
 * - Dispatches fulfilled action with data on success
 * - Dispatches rejected action with error message on failure
 */
export const fetchFieldTypesThunk = createAsyncThunk<
  FieldType[], // Return type (fulfilled payload)
  void, // Argument type (we don't need parameters)
  { rejectValue: string } // ThunkAPI config for typed error
>(
  'fieldTypes/fetch',
  async (_, { rejectWithValue }) => {
    try {
      console.info('[FieldTypes Slice] Initiating fetch operation...');
      const data = await fetchFieldTypesService();
      console.info(`[FieldTypes Slice] Fetch succeeded with ${data.length} items`);
      return data;
    } catch (error) {
      // Extract error message (service already provides user-friendly messages)
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch field types';
      console.error('[FieldTypes Slice] Fetch failed:', errorMessage);
      
      // Return typed error using rejectWithValue
      return rejectWithValue(errorMessage);
    }
  }
);

/**
 * Field types slice
 * 
 * Manages state updates for all field type operations.
 * Uses extraReducers to handle async thunk actions.
 */
const fieldTypesSlice = createSlice({
  name: 'fieldTypes',
  initialState,
  reducers: {
    /**
     * Manually reset the field types state
     * 
     * Use case: User logs out or switches context
     */
    resetFieldTypes: (state) => {
      console.info('[FieldTypes Slice] Resetting state to initial values');
      state.items = [];
      state.loading = 'idle';
      state.error = null;
      state.lastFetched = null;
    },

    /**
     * Clear error state
     * 
     * Use case: User dismisses error notification and wants to retry
     */
    clearError: (state) => {
      console.info('[FieldTypes Slice] Clearing error state');
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Handle pending state - fetch operation started
      .addCase(fetchFieldTypesThunk.pending, (state) => {
        console.info('[FieldTypes Slice] Fetch pending - updating state');
        state.loading = 'pending';
        state.error = null; // Clear any previous errors
      })
      
      // Handle fulfilled state - fetch operation succeeded
      .addCase(fetchFieldTypesThunk.fulfilled, (state, action: PayloadAction<FieldType[]>) => {
        console.info('[FieldTypes Slice] Fetch fulfilled - updating state with data');
        state.loading = 'succeeded';
        state.items = action.payload;
        state.error = null;
        state.lastFetched = Date.now(); // Cache timestamp for staleness checks
      })
      
      // Handle rejected state - fetch operation failed
      .addCase(fetchFieldTypesThunk.rejected, (state, action) => {
        console.error('[FieldTypes Slice] Fetch rejected - updating state with error');
        state.loading = 'failed';
        state.error = action.payload ?? 'An unknown error occurred';
        // Note: We do NOT clear items on error - keep showing stale data if available
        // This provides better UX (user can still see old data while retry is attempted)
      });
  },
});

/**
 * Selectors
 * 
 * These provide optimized access to slice state.
 * Use these in components instead of manually accessing state.fieldTypes
 */

/**
 * Select all field types
 */
export const selectFieldTypes = (state: RootState): FieldType[] => 
  state.fieldTypes.items;

/**
 * Select loading state
 */
export const selectFieldTypesLoading = (state: RootState): FieldTypesState['loading'] => 
  state.fieldTypes.loading;

/**
 * Select error message
 */
export const selectFieldTypesError = (state: RootState): string | null => 
  state.fieldTypes.error;

/**
 * Select whether data is currently loading
 */
export const selectIsFieldTypesLoading = (state: RootState): boolean => 
  state.fieldTypes.loading === 'pending';

/**
 * Select whether data has been loaded successfully at least once
 */
export const selectHasFieldTypesLoaded = (state: RootState): boolean => 
  state.fieldTypes.loading === 'succeeded' && state.fieldTypes.items.length > 0;

/**
 * Select when data was last fetched (for cache staleness checks)
 */
export const selectFieldTypesLastFetched = (state: RootState): number | null => 
  state.fieldTypes.lastFetched;

/**
 * Select whether cache is stale based on provided max age
 * 
 * @param maxAge - Maximum cache age in milliseconds (default: 5 minutes)
 * @returns Selector function that checks if cache is stale
 */
export const selectIsFieldTypesCacheStale = (maxAge: number = 300000) => (state: RootState): boolean => {
  const { lastFetched } = state.fieldTypes;
  
  // If never fetched, cache is stale
  if (lastFetched === null) {
    return true;
  }
  
  // Check if elapsed time exceeds maxAge
  const elapsed = Date.now() - lastFetched;
  return elapsed > maxAge;
};

/**
 * Select field type by ID
 * 
 * Useful for looking up a specific field type in the list
 */
export const selectFieldTypeById = (id: number) => (state: RootState): FieldType | undefined => 
  state.fieldTypes.items.find(item => item.id === id);

/**
 * Select count of field types
 */
export const selectFieldTypesCount = (state: RootState): number => 
  state.fieldTypes.items.length;

// Export actions
export const { resetFieldTypes, clearError } = fieldTypesSlice.actions;

// Export reducer
export default fieldTypesSlice.reducer;

/**
 * Type exports for components
 * 
 * These allow components to properly type their props and state
 */
export type { FieldTypesState };
