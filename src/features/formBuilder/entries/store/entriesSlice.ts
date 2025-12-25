/**
 * /src/features/entries/entriesSlice.ts
 * 
 * Redux Toolkit slice for entries state management.
 * Handles async operations, loading states, errors, and query persistence for refetch capability.
 */

import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '@/store'; // Adjust path to your store
import type {
  EntriesState,
  EntriesListQuery,
  ListEntriesResponse,
  NormalizedError,
  Entry,
  Pagination,
} from '../types';
import { listEntries as listEntriesService } from '../services/api';

// ============================================================================
// Initial State
// ============================================================================

const initialState: EntriesState = {
  data: [],
  pagination: null,
  status: 'idle',
  error: null,
  lastQuery: null,
};

// ============================================================================
// Async Thunks
// ============================================================================

/**
 * Async thunk for fetching entries list.
 * Calls the API service and handles success/error states.
 * Uses rejectWithValue to pass normalized errors to the rejected case.
 * 
 * @param query - Query parameters for filtering and pagination
 * @returns Promise with API response or rejected with normalized error
 */
export const fetchEntriesList = createAsyncThunk<
  ListEntriesResponse, // Success return type
  EntriesListQuery, // Argument type
  { rejectValue: NormalizedError } // ThunkAPI config for typed rejectWithValue
>(
  'entries/fetchList',
  async (query: EntriesListQuery, { rejectWithValue }) => {
    try {
      const response = await listEntriesService(query);
      return response;
    } catch (error) {
      // Error is already normalized by the service layer
      // Cast to NormalizedError for type safety
      const normalizedError = error as NormalizedError;
      
      // Use rejectWithValue to pass the error as action.payload in rejected case
      return rejectWithValue(normalizedError);
    }
  }
);

// ============================================================================
// Slice Definition
// ============================================================================

const entriesSlice = createSlice({
  name: 'entries',
  initialState,
  reducers: {
    /**
     * Sets a new query and replaces the current lastQuery.
     * Used when completely changing filters/pagination.
     */
    setQuery: (state, action: PayloadAction<EntriesListQuery>) => {
      state.lastQuery = action.payload;
    },

    /**
     * Updates the existing query with partial changes.
     * Useful for changing individual filters without resetting others.
     */
    updateQuery: (state, action: PayloadAction<Partial<EntriesListQuery>>) => {
      if (state.lastQuery) {
        state.lastQuery = {
          ...state.lastQuery,
          ...action.payload,
        };
      } else {
        // If no lastQuery exists, this becomes the base query
        // Note: This requires at least page, per_page, and form_version_id
        state.lastQuery = action.payload as EntriesListQuery;
      }
    },

    /**
     * Clears the current error state.
     * Useful for dismissing error messages in the UI.
     */
    clearError: (state) => {
      state.error = null;
    },

    /**
     * Resets the entire entries state to initial values.
     * Useful when navigating away or clearing form context.
     */
    resetEntriesState: () => initialState,

    /**
     * Manually sets entries data.
     * Useful for optimistic updates or cache manipulation.
     */
    setEntriesData: (state, action: PayloadAction<Entry[]>) => {
      state.data = action.payload;
    },

    /**
     * Updates a single entry in the data array.
     * Useful for reflecting changes after edit operations.
     */
    updateEntry: (state, action: PayloadAction<Entry>) => {
      const index = state.data.findIndex((entry) => entry.id === action.payload.id);
      if (index !== -1) {
        state.data[index] = action.payload;
      }
    },
  },

  // ============================================================================
  // Extra Reducers - Handle Async Thunk States
  // ============================================================================
  extraReducers: (builder) => {
    builder
      // ========== Fetch Entries List ==========
      
      // Pending: Request is in flight
      .addCase(fetchEntriesList.pending, (state, action) => {
        state.status = 'loading';
        state.error = null;
        // Store the query being executed for refetch capability
        state.lastQuery = action.meta.arg;
      })

      // Fulfilled: Request succeeded
      .addCase(fetchEntriesList.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.data = action.payload.data;
        state.pagination = action.payload.pagination;
        state.error = null;
      })

      // Rejected: Request failed
      .addCase(fetchEntriesList.rejected, (state, action) => {
        state.status = 'failed';
        
        // action.payload contains the NormalizedError from rejectWithValue
        if (action.payload) {
          state.error = action.payload;
        } else {
          // Fallback for unexpected rejection without payload
          state.error = {
            message: action.error.message || 'An unexpected error occurred',
          };
        }

        // Clear data on error (or keep stale data - design choice)
        // Uncomment next line if you prefer to clear data on errors:
        // state.data = [];
        // state.pagination = null;
      });
  },
});

// ============================================================================
// Selectors
// ============================================================================

/**
 * Selects the entire entries state slice
 */
export const selectEntriesState = (state: RootState): EntriesState => state.entries;

/**
 * Selects the entries data array
 */
export const selectEntriesData = (state: RootState): Entry[] => state.entries.data;

/**
 * Selects pagination metadata
 */
export const selectEntriesPagination = (state: RootState): Pagination | null => 
  state.entries.pagination;

/**
 * Selects the loading status
 */
export const selectEntriesStatus = (state: RootState) => state.entries.status;

/**
 * Selects the error state
 */
export const selectEntriesError = (state: RootState): NormalizedError | null => 
  state.entries.error;

/**
 * Selects the last executed query (enables refetch)
 */
export const selectLastQuery = (state: RootState): EntriesListQuery | null => 
  state.entries.lastQuery;

/**
 * Derived selector: Is data currently loading?
 */
export const selectIsLoading = (state: RootState): boolean => 
  state.entries.status === 'loading';

/**
 * Derived selector: Has an error occurred?
 */
export const selectHasError = (state: RootState): boolean => 
  state.entries.status === 'failed' && state.entries.error !== null;

/**
 * Derived selector: Is data available and ready to display?
 */
export const selectHasData = (state: RootState): boolean => 
  state.entries.data.length > 0;

/**
 * Derived selector: Total number of entries across all pages
 */
export const selectTotalEntries = (state: RootState): number => 
  state.entries.pagination?.total ?? 0;

/**
 * Derived selector: Current page number
 */
export const selectCurrentPage = (state: RootState): number => 
  state.entries.pagination?.current_page ?? 1;

/**
 * Derived selector: Total number of pages
 */
export const selectTotalPages = (state: RootState): number => 
  state.entries.pagination?.last_page ?? 1;

/**
 * Derived selector: Check if there's a next page
 */
export const selectHasNextPage = (state: RootState): boolean => {
  const pagination = state.entries.pagination;
  if (!pagination) return false;
  return pagination.current_page < pagination.last_page;
};

/**
 * Derived selector: Check if there's a previous page
 */
export const selectHasPreviousPage = (state: RootState): boolean => {
  const pagination = state.entries.pagination;
  if (!pagination) return false;
  return pagination.current_page > 1;
};

// ============================================================================
// Exports
// ============================================================================

export const {
  setQuery,
  updateQuery,
  clearError,
  resetEntriesState,
  setEntriesData,
  updateEntry,
} = entriesSlice.actions;

export default entriesSlice.reducer;
