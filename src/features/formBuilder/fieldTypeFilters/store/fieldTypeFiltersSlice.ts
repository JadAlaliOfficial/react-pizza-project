// src/features/fieldTypeFilters/store/fieldTypeFilters.slice.ts

import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '@/store'; // Adjust path to your store
import type { 
  FieldTypeFiltersState, 
  FieldTypeFiltersData,
  ApiError 
} from '../types';
import { fetchFieldTypeFilters } from '../services/api';

/**
 * Initial state for field type filters feature
 * Represents empty/idle state before any data is fetched
 */
const initialState: FieldTypeFiltersState = {
  items: [],
  loading: false,
  error: null,
  lastFetchedAt: null,
};

/**
 * Async thunk to fetch field type filters from the API
 * Handles the complete lifecycle: pending -> fulfilled/rejected
 * Logs each state transition for debugging and monitoring
 */
export const fetchFieldTypeFiltersThunk = createAsyncThunk<
  FieldTypeFiltersData, // Return type on success
  void, // Argument type (no arguments needed)
  { 
    rejectValue: string; // Type for rejected value
    state: RootState; // Access to root state for conditional logic
  }
>(
  'fieldTypeFilters/fetchFieldTypeFilters',
  async (_, { rejectWithValue }) => {
    try {
      console.info('[FieldTypeFilters Thunk] Starting fetch operation');
      
      const data = await fetchFieldTypeFilters();
      
      console.info(
        `[FieldTypeFilters Thunk] Fetch completed successfully`,
        { itemCount: data.length }
      );
      
      return data;
      
    } catch (error) {
      // Type guard to handle ApiError structure
      const apiError = error as ApiError;
      const errorMessage = apiError.message || 'Failed to fetch field type filters';
      
      console.error(
        '[FieldTypeFilters Thunk] Fetch operation failed',
        { 
          message: errorMessage,
          status: apiError.status,
          statusText: apiError.statusText 
        }
      );
      
      return rejectWithValue(errorMessage);
    }
  }
);

/**
 * Redux slice for field type filters
 * Manages state, reducers, and actions for the feature
 */
const fieldTypeFiltersSlice = createSlice({
  name: 'fieldTypeFilters',
  initialState,
  reducers: {
    /**
     * Manually reset error state
     * Useful for dismissing error messages in UI
     */
    resetError: (state) => {
      console.info('[FieldTypeFilters Slice] Error state reset');
      state.error = null;
    },
    
    /**
     * Clear all field type filters data and reset to initial state
     * Useful for logout or data invalidation scenarios
     */
    clearFieldTypeFilters: (state) => {
      console.info('[FieldTypeFilters Slice] Clearing all data');
      state.items = [];
      state.error = null;
      state.lastFetchedAt = null;
      // Keep loading state as-is to prevent UI flicker
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch field type filters - PENDING
      .addCase(fetchFieldTypeFiltersThunk.pending, (state) => {
        console.info('[FieldTypeFilters Slice] Fetch pending - setting loading state');
        state.loading = true;
        state.error = null; // Clear previous errors on new request
      })
      
      // Fetch field type filters - FULFILLED
      .addCase(
        fetchFieldTypeFiltersThunk.fulfilled,
        (state, action: PayloadAction<FieldTypeFiltersData>) => {
          console.info(
            '[FieldTypeFilters Slice] Fetch fulfilled',
            { itemCount: action.payload.length }
          );
          state.loading = false;
          state.items = action.payload;
          state.error = null;
          state.lastFetchedAt = new Date().toISOString();
        }
      )
      
      // Fetch field type filters - REJECTED
      .addCase(fetchFieldTypeFiltersThunk.rejected, (state, action) => {
        console.error(
          '[FieldTypeFilters Slice] Fetch rejected',
          { error: action.payload || action.error.message }
        );
        state.loading = false;
        state.error = action.payload || action.error.message || 'An unknown error occurred';
        // Preserve existing items on error to allow graceful degradation
      });
  },
});

// Export actions
export const { resetError, clearFieldTypeFilters } = fieldTypeFiltersSlice.actions;

// Export reducer as default
export default fieldTypeFiltersSlice.reducer;

/**
 * SELECTORS
 * Memoized selectors for accessing slice state
 * Co-located with slice for easier maintenance
 */

/**
 * Select all field type filters
 * @param {RootState} state - Root Redux state
 * @returns {FieldTypeFiltersData} Array of field type filters
 */
export const selectFieldTypeFilters = (state: RootState): FieldTypeFiltersData => 
  state.fieldTypeFilters.items;

/**
 * Select loading state
 * @param {RootState} state - Root Redux state
 * @returns {boolean} Whether filters are currently being fetched
 */
export const selectFieldTypeFiltersLoading = (state: RootState): boolean => 
  state.fieldTypeFilters.loading;

/**
 * Select error state
 * @param {RootState} state - Root Redux state
 * @returns {string | null} Current error message or null
 */
export const selectFieldTypeFiltersError = (state: RootState): string | null => 
  state.fieldTypeFilters.error;

/**
 * Select last fetched timestamp
 * Useful for implementing cache invalidation logic
 * @param {RootState} state - Root Redux state
 * @returns {string | null} ISO timestamp of last successful fetch
 */
export const selectFieldTypeFiltersLastFetchedAt = (state: RootState): string | null => 
  state.fieldTypeFilters.lastFetchedAt;

/**
 * Select whether data has been loaded at least once
 * Useful for determining if skeleton/empty states should show
 * @param {RootState} state - Root Redux state
 * @returns {boolean} True if data has been fetched successfully at least once
 */
export const selectFieldTypeFiltersHasData = (state: RootState): boolean => 
  state.fieldTypeFilters.items.length > 0;

/**
 * Select a specific field type filter by ID
 * @param {RootState} state - Root Redux state
 * @param {number} id - Field type filter ID to find
 * @returns {FieldTypeFilter | undefined} The matching filter or undefined
 */
export const selectFieldTypeFilterById = (state: RootState, id: number) =>
  state.fieldTypeFilters.items.find(filter => filter.id === id);

/**
 * Select filters by field type ID
 * Useful for finding all filters associated with a specific field type
 * @param {RootState} state - Root Redux state
 * @param {number} fieldTypeId - Field type ID to filter by
 * @returns {FieldTypeFiltersData} Array of matching filters
 */
export const selectFieldTypeFiltersByFieldTypeId = (state: RootState, fieldTypeId: number) =>
  state.fieldTypeFilters.items.filter(filter => filter.field_type_id === fieldTypeId);
