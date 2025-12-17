// src/features/forms/formsSubmissionSlice.ts

/**
 * =============================================================================
 * FORMS SUBMISSION SLICE - REDUX TOOLKIT
 * =============================================================================
 * 
 * Redux slice for managing form submission state using Redux Toolkit.
 * 
 * Key features:
 * - createAsyncThunk for async form submission with full TypeScript support [web:21][web:22]
 * - Normalized error handling using rejectWithValue [web:25][web:26]
 * - Comprehensive state tracking (status, error, data, timestamps)
 * - Edge case handling: missing token, business logic errors, network failures
 * - Clean reducers for state reset and error clearing
 * - Request deduplication via requestId tracking
 */

import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '@/store';
import type {
  SubmitInitialStageRequest,
  SubmitInitialStageData,
  ApiError,
  FormsSubmissionState,
  RequestStatus,
} from '../types/submitInitialForm.types';
import { formsService } from '../services/submitInitialForm.api';

// =============================================================================
// INITIAL STATE
// =============================================================================

/**
 * Initial state for the forms submission slice.
 * Starts with idle status and no data/errors.
 */
const initialState: FormsSubmissionState = {
  status: 'idle',
  error: null,
  lastResponse: null,
  requestId: undefined,
  lastRequestTimestamp: undefined,
  lastResponseTimestamp: undefined,
};

// =============================================================================
// ASYNC THUNK
// =============================================================================

/**
 * Async thunk for submitting the initial stage of a form.
 * 
 * This thunk:
 * - Calls the formsService.submitInitialStage API method
 * - Handles all error cases and normalizes them with rejectWithValue [web:25]
 * - Returns typed submission data on success
 * - Tracks request metadata (requestId, timestamps)
 * 
 * Error handling:
 * - Missing auth token -> authentication error
 * - Network failure -> network error
 * - API returns success: false -> business error
 * - HTTP 4xx/5xx -> validation/server error
 * 
 * TypeScript typing: [web:1][web:22][web:26]
 * - First generic: Return type (SubmitInitialStageData)
 * - Second generic: Argument type (SubmitInitialStageRequest)
 * - Third generic: ThunkAPI config with rejectValue type
 * 
 * @example
 * ```
 * dispatch(submitInitialStage({
 *   form_version_id: 23,
 *   stage_transition_id: 46,
 *   field_values: [...]
 * }));
 * ```
 */
export const submitInitialStage = createAsyncThunk<
  SubmitInitialStageData, // Return type on success (fulfilled)
  SubmitInitialStageRequest, // Argument type
  {
    state: RootState; // Type of getState()
    rejectValue: ApiError; // Type of rejectWithValue() payload [web:25]
  }
>(
  'formsSubmission/submitInitialStage',
  async (payload: SubmitInitialStageRequest, { rejectWithValue }) => {
    try {
      // Call the service method which handles token injection and error normalization
      const response = await formsService.submitInitialStage(payload);
      
      // Return the nested data object (not the full response envelope)
      // This becomes action.payload in the fulfilled case
      return response.data;
    } catch (error) {
      // Error is already normalized by formsService (ApiError type)
      // Use rejectWithValue to pass it to the rejected reducer [web:25][web:26]
      const apiError = error as ApiError;
      
      // rejectWithValue ensures the error appears in action.payload (not action.error)
      // This gives us full control over the error shape in reducers
      return rejectWithValue(apiError);
    }
  }
);

// =============================================================================
// SLICE DEFINITION
// =============================================================================

/**
 * Forms submission slice with reducers and extra reducers for async thunk.
 * Named export for the reducer: submitInitialFormReducer
 */
const formsSubmissionSlice = createSlice({
  name: 'formsSubmission',
  initialState,
  reducers: {
    /**
     * Resets the entire slice state back to initial values.
     * Useful after successful submission when navigating away or starting a new form.
     */
    resetFormsSubmission: () => initialState,

    /**
     * Clears only the error state without affecting other state properties.
     * Useful when dismissing error messages or retrying after fixing issues.
     */
    clearError: (state) => {
      state.error = null;
    },

    /**
     * Resets status back to idle without clearing data/error.
     * Useful for resetting loading state without losing submission results.
     */
    resetStatus: (state) => {
      state.status = 'idle';
    },
  },
  extraReducers: (builder) => {
    // -------------------------------------------------------------------------
    // PENDING - Request started
    // -------------------------------------------------------------------------
    builder.addCase(submitInitialStage.pending, (state, action) => {
      state.status = 'loading';
      state.error = null; // Clear previous errors
      state.requestId = action.meta.requestId; // Track request for deduplication
      state.lastRequestTimestamp = Date.now();
      
      // Note: We don't clear lastResponse here to allow displaying previous
      // submission data while a new request is in progress
    });

    // -------------------------------------------------------------------------
    // FULFILLED - Request succeeded
    // -------------------------------------------------------------------------
    builder.addCase(
      submitInitialStage.fulfilled,
      (state, action: PayloadAction<SubmitInitialStageData>) => {
        state.status = 'succeeded';
        state.error = null;
        state.lastResponse = action.payload; // Store submission result
        state.lastResponseTimestamp = Date.now();
        
        // Optional: Clear requestId after completion
        state.requestId = undefined;
      }
    );

    // -------------------------------------------------------------------------
    // REJECTED - Request failed
    // -------------------------------------------------------------------------
    builder.addCase(submitInitialStage.rejected, (state, action) => {
      state.status = 'failed';
      state.lastResponseTimestamp = Date.now();
      
      // Error comes from rejectWithValue, so it's in action.payload (typed as ApiError)
      // If rejectWithValue wasn't used, error would be in action.error [web:25]
      if (action.payload) {
        // Custom error from rejectWithValue - use our normalized ApiError
        state.error = action.payload;
      } else {
        // Fallback for unexpected errors that bypassed rejectWithValue
        // This shouldn't happen with our current implementation, but provides safety
        state.error = {
          type: 'unknown',
          message: action.error.message || 'An unexpected error occurred',
          originalError: action.error,
        };
      }
      
      // Optional: Clear requestId after completion
      state.requestId = undefined;
    });
  },
});

// =============================================================================
// EXPORTS
// =============================================================================

/**
 * Action creators for synchronous reducers.
 * These can be dispatched directly without async logic.
 */
export const { resetFormsSubmission, clearError, resetStatus } = formsSubmissionSlice.actions;

/**
 * Main reducer for the forms submission slice.
 * Named export as requested: submitInitialFormReducer
 * 
 * This should be added to your root reducer:
 * ```
 * import { submitInitialFormReducer } from './features/forms/formsSubmissionSlice';
 * 
 * export const store = configureStore({
 *   reducer: {
 *     formsSubmission: submitInitialFormReducer,
 *     // ... other reducers
 *   },
 * });
 * ```
 */
export const submitInitialFormReducer = formsSubmissionSlice.reducer;

// Default export (alternate import style)
export default submitInitialFormReducer;

// =============================================================================
// SELECTORS
// =============================================================================

/**
 * Selector for the entire forms submission state.
 */
export const selectFormsSubmissionState = (state: RootState): FormsSubmissionState =>
  state.submitInitialForm;

/**
 * Selector for submission status.
 * Returns: 'idle' | 'loading' | 'succeeded' | 'failed'
 */
export const selectSubmissionStatus = (state: RootState): RequestStatus =>
  state.submitInitialForm.status;

/**
 * Selector for loading state.
 * Returns true when a submission is in progress.
 */
export const selectIsSubmitting = (state: RootState): boolean =>
  state.submitInitialForm.status === 'loading';

/**
 * Selector for submission error.
 * Returns null if no error, otherwise the normalized ApiError object.
 */
export const selectSubmissionError = (state: RootState): ApiError | null =>
  state.submitInitialForm.error;

/**
 * Selector for last successful response.
 * Returns null if no successful submission yet.
 */
export const selectLastSubmissionResponse = (state: RootState): SubmitInitialStageData | null =>
  state.submitInitialForm.lastResponse;

/**
 * Selector for checking if submission succeeded.
 * Useful for showing success messages or redirecting after submission.
 */
export const selectSubmissionSucceeded = (state: RootState): boolean =>
  state.submitInitialForm.status === 'succeeded';

/**
 * Selector for checking if submission failed.
 * Useful for conditional error display.
 */
export const selectSubmissionFailed = (state: RootState): boolean =>
  state.submitInitialForm.status === 'failed';

/**
 * Selector for entry ID from last successful submission.
 * Returns undefined if no successful submission yet.
 */
export const selectLastEntryId = (state: RootState): number | undefined =>
  state.submitInitialForm.lastResponse?.entry_id;

/**
 * Selector for public identifier from last successful submission.
 * Returns undefined if no successful submission yet.
 */
export const selectLastPublicIdentifier = (state: RootState): string | undefined =>
  state.submitInitialForm.lastResponse?.public_identifier;

/**
 * Selector for form completion status.
 * Returns true if the last submission completed the form workflow.
 */
export const selectIsFormComplete = (state: RootState): boolean =>
  state.submitInitialForm.lastResponse?.is_complete ?? false;
