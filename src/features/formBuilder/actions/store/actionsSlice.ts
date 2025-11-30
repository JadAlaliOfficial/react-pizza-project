// features/actions/actions.slice.ts

import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '@/store'; // Adjust import path to your store
import { type Action } from '../types';
import { fetchActions } from '../services/api';

/**
 * State shape for the actions slice.
 */
export interface ActionsState {
  items: Action[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  lastFetched: number | null; // Timestamp for caching/staleness checks
}

/**
 * Initial state.
 */
const initialState: ActionsState = {
  items: [],
  status: 'idle',
  error: null,
  lastFetched: null,
};

/**
 * Async thunk to fetch actions from the API.
 * Calls the service layer and returns typed Action[].
 */
export const fetchActionsThunk = createAsyncThunk<
  Action[], // Return type (fulfilled payload)
  void, // Argument type (none needed here)
  { state: RootState; rejectValue: string } // ThunkAPI config
>(
  'actions/fetchActions',
  async (_, { rejectWithValue }) => {
    try {
      const actions = await fetchActions();
      return actions;
    } catch (error: unknown) {
      // Pass user-friendly error message to rejected state
      const message = error instanceof Error ? error.message : 'Failed to fetch actions.';
      return rejectWithValue(message);
    }
  }
);

/**
 * Actions slice with reducers and extra reducers for thunk lifecycle.
 */
const actionsSlice = createSlice({
  name: 'actions',
  initialState,
  reducers: {
    /**
     * Reset the entire state to initial values.
     */
    resetActions: () => initialState,

    /**
     * Clear error without affecting other state.
     */
    clearError: (state) => {
      state.error = null;
    },

    /**
     * Manually set actions (for testing, SSR hydration, etc.).
     */
    setActions: (state, action: PayloadAction<Action[]>) => {
      state.items = action.payload;
      state.status = 'succeeded';
      state.error = null;
      state.lastFetched = Date.now();
    },
  },
  extraReducers: (builder) => {
    builder
      // Pending: start loading
      .addCase(fetchActionsThunk.pending, (state) => {
        state.status = 'loading';
        state.error = null; // Clear previous errors
      })
      // Fulfilled: store data and timestamp
      .addCase(fetchActionsThunk.fulfilled, (state, action: PayloadAction<Action[]>) => {
        state.status = 'succeeded';
        state.items = action.payload;
        state.error = null;
        state.lastFetched = Date.now(); // Cache timestamp
      })
      // Rejected: store error message
      .addCase(fetchActionsThunk.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload ?? 'An unknown error occurred.';
        // Do not clear items; allow UI to show stale data + error if desired
      });
  },
});

/**
 * Export actions (reducers).
 */
export const { resetActions, clearError, setActions } = actionsSlice.actions;

/**
 * Selectors for consuming components/hooks.
 */
export const selectActionsState = (state: RootState) => state.actions;
export const selectActions = (state: RootState) => state.actions.items;
export const selectActionsStatus = (state: RootState) => state.actions.status;
export const selectActionsError = (state: RootState) => state.actions.error;
export const selectActionsLastFetched = (state: RootState) => state.actions.lastFetched;

/**
 * Export reducer as default for store configuration.
 */
export default actionsSlice.reducer;

/**
 * Notes for scalability:
 * - Add more thunks here for POST/PUT/DELETE operations.
 * - Use `lastFetched` in hooks/components to decide if refetch is needed.
 * - Selectors can be memoized with `createSelector` (reselect) if needed.
 * - State is fully typed; no `any` used.
 */
