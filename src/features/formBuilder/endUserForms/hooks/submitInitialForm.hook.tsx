// src/features/forms/hooks/useSubmitInitialStage.ts

/**
 * =============================================================================
 * USE SUBMIT INITIAL STAGE HOOK
 * =============================================================================
 * 
 * Custom React hook for form submission with complete state management.
 * 
 * Features:
 * - Type-safe dispatch and selector hooks [web:36][web:39]
 * - Stable callback references with useCallback [web:31][web:34]
 * - Complete error, loading, and success state exposure
 * - Clean API for component integration
 * - Automatic state selection with memoization
 */

import { useCallback } from 'react';
import { useDispatch, useSelector, type TypedUseSelectorHook } from 'react-redux';
import type { AppDispatch, RootState } from '@/store';
import {
  submitInitialStage,
  submitLaterStage,
  resetFormsSubmission,
  clearError,
  resetStatus,
  selectSubmissionStatus,
  selectIsSubmitting,
  selectSubmissionError,
  selectLastSubmissionResponse,
  selectSubmissionSucceeded,
  selectSubmissionFailed,
  selectLastEntryId,
  selectLastPublicIdentifier,
  selectIsFormComplete,
} from '../store/submitInitialForm.slice';
import type {
  SubmitInitialStageRequest,
  SubmitInitialStageData,
  SubmitLaterStageRequest,
  SubmitLaterStageData,
  ApiError,
  RequestStatus,
} from '../types/submitInitialForm.types';

// =============================================================================
// TYPED REDUX HOOKS
// =============================================================================

/**
 * Typed version of useDispatch hook.
 * Use this throughout your app instead of plain useDispatch for type safety [web:36][web:39].
 * 
 * This ensures that dispatched actions are properly typed and thunks
 * return correctly typed promises.
 */
export const useAppDispatch: () => AppDispatch = useDispatch;

/**
 * Typed version of useSelector hook.
 * Use this throughout your app instead of plain useSelector for type safety [web:36][web:39].
 * 
 * This ensures that state selectors receive the correct RootState type
 * and return values are properly inferred.
 */
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

// =============================================================================
// HOOK RETURN TYPE
// =============================================================================

/**
 * Return type for the useSubmitInitialStage hook.
 * Provides a clean, documented interface for consuming components.
 */
export interface UseSubmitInitialStageReturn {
  /**
   * Submits the initial stage form with the provided data.
   * Returns a promise that resolves with submission data or rejects with ApiError.
   * 
   * @example
   * ```
   * const handleSubmit = async () => {
   *   try {
   *     const result = await submit({
   *       form_version_id: 23,
   *       stage_transition_id: 46,
   *       field_values: [...]
   *     });
   *     console.log('Entry ID:', result.entry_id);
   *   } catch (error) {
   *     // Error is already in the Redux state
   *     console.error('Submission failed');
   *   }
   * };
   * ```
   */
  submit: (payload: SubmitInitialStageRequest) => Promise<SubmitInitialStageData>;

  /**
   * Current status of the submission.
   * Values: 'idle' | 'loading' | 'succeeded' | 'failed'
   */
  status: RequestStatus;

  /**
   * Whether a submission is currently in progress.
   * Useful for disabling submit buttons and showing loading indicators.
   */
  isSubmitting: boolean;

  /**
   * Error object if submission failed, null otherwise.
   * Contains normalized ApiError with discriminated union type for error handling.
   */
  error: ApiError | null;

  /**
   * Data from the last successful submission, null if no successful submission yet.
   * Contains entry_id, public_identifier, completion status, etc.
   */
  data: SubmitInitialStageData | null;

  /**
   * Whether the last submission succeeded.
   * Useful for showing success messages or conditional rendering.
   */
  isSuccess: boolean;

  /**
   * Whether the last submission failed.
   * Useful for conditional error display.
   */
  isError: boolean;

  /**
   * Entry ID from the last successful submission.
   * Undefined if no successful submission yet.
   */
  entryId: number | undefined;

  /**
   * Public identifier (UUID) from the last successful submission.
   * Undefined if no successful submission yet.
   */
  publicIdentifier: string | undefined;

  /**
   * Whether the form workflow is complete after the last submission.
   * False if no submission yet or form has additional stages.
   */
  isFormComplete: boolean;

  /**
   * Resets the entire submission state back to initial values.
   * Use after successful submission when starting a new form.
   */
  reset: () => void;

  /**
   * Clears only the error state without affecting other properties.
   * Use when dismissing error messages.
   */
  dismissError: () => void;

  /**
   * Resets status to idle without clearing data or errors.
   * Use for resetting loading state while preserving results.
   */
  resetToIdle: () => void;
}

// =============================================================================
// MAIN HOOK
// =============================================================================

/**
 * Custom hook for submitting the initial stage of a form.
 * 
 * This hook provides a complete interface for form submission including:
 * - Typed submit function that returns a promise
 * - Loading, error, and success state tracking
 * - Submission result data access
 * - State management helpers (reset, dismissError, etc.)
 * 
 * All callbacks are wrapped in useCallback with proper dependencies for
 * stable references and optimal performance [web:31][web:34].
 * 
 * @returns Object with submit function, state, and utility functions
 * 
 * @example
 * ```
 * function MyFormComponent() {
 *   const {
 *     submit,
 *     isSubmitting,
 *     error,
 *     data,
 *     isSuccess,
 *     reset,
 *     dismissError
 *   } = useSubmitInitialStage();
 * 
 *   const handleSubmit = async (formData) => {
 *     try {
 *       const result = await submit(formData);
 *       toast.success(`Form submitted! Entry ID: ${result.entry_id}`);
 *     } catch (err) {
 *       // Error is already in state, component will re-render
 *     }
 *   };
 * 
 *   return (
 *     <form onSubmit={handleSubmit}>
 *       <Button disabled={isSubmitting}>
 *         {isSubmitting ? 'Submitting...' : 'Submit'}
 *       </Button>
 *       {error && <ErrorAlert error={error} onDismiss={dismissError} />}
 *       {isSuccess && <SuccessMessage data={data} />}
 *     </form>
 *   );
 * }
 * ```
 */
export const useSubmitInitialStage = (): UseSubmitInitialStageReturn => {
  const dispatch = useAppDispatch();

  // ---------------------------------------------------------------------------
  // State Selection
  // ---------------------------------------------------------------------------
  // Use individual selectors instead of selecting entire state for optimal
  // re-render performance. Redux will memoize these selectors.

  const status = useAppSelector(selectSubmissionStatus);
  const isSubmitting = useAppSelector(selectIsSubmitting);
  const error = useAppSelector(selectSubmissionError);
  const data = useAppSelector(selectLastSubmissionResponse);
  const isSuccess = useAppSelector(selectSubmissionSucceeded);
  const isError = useAppSelector(selectSubmissionFailed);
  const entryId = useAppSelector(selectLastEntryId);
  const publicIdentifier = useAppSelector(selectLastPublicIdentifier);
  const isFormComplete = useAppSelector(selectIsFormComplete);

  // ---------------------------------------------------------------------------
  // Memoized Callbacks
  // ---------------------------------------------------------------------------
  // All callbacks wrapped in useCallback for stable references [web:31][web:34].
  // This prevents unnecessary re-renders in child components and avoids
  // recreating functions on every render.

  /**
   * Submit function wrapped in useCallback with stable reference.
   * Only dispatch changes (which it never does), so empty dependency array.
   */
  const submit = useCallback(
    async (payload: SubmitInitialStageRequest): Promise<SubmitInitialStageData> => {
      // Dispatch the async thunk and unwrap the result
      // unwrap() throws on rejection, allowing try/catch in components
      const resultAction = await dispatch(submitInitialStage(payload));
      
      // Extract the payload from the fulfilled action
      // This will be the SubmitInitialStageData
      if (submitInitialStage.fulfilled.match(resultAction)) {
        return resultAction.payload;
      }
      
      // If rejected, throw the error for component-level error handling
      // The error is also stored in Redux state
      throw resultAction.payload || resultAction.error;
    },
    [dispatch] // dispatch is stable, so this callback never changes [web:31]
  );

  /**
   * Reset function wrapped in useCallback.
   * Resets entire submission state to initial values.
   */
  const reset = useCallback(() => {
    dispatch(resetFormsSubmission());
  }, [dispatch]);

  /**
   * Dismiss error function wrapped in useCallback.
   * Clears only the error state.
   */
  const dismissError = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  /**
   * Reset to idle function wrapped in useCallback.
   * Resets status without clearing data/error.
   */
  const resetToIdle = useCallback(() => {
    dispatch(resetStatus());
  }, [dispatch]);

  // ---------------------------------------------------------------------------
  // Return Hook Interface
  // ---------------------------------------------------------------------------

  return {
    // Functions
    submit,
    reset,
    dismissError,
    resetToIdle,

    // State
    status,
    isSubmitting,
    error,
    data,
    isSuccess,
    isError,
    entryId,
    publicIdentifier,
    isFormComplete,
  };
};

// =============================================================================
// SUBMIT LATER STAGE HOOK
// =============================================================================

/**
 * Return type for the useSubmitLaterStage hook.
 */
export interface UseSubmitLaterStageReturn {
  /**
   * Submits the later stage form with the provided data.
   * Returns a promise that resolves with submission data or rejects with ApiError.
   */
  submit: (payload: SubmitLaterStageRequest) => Promise<SubmitLaterStageData>;

  /** Current status of the submission. */
  status: RequestStatus;

  /** Whether a submission is currently in progress. */
  isSubmitting: boolean;

  /** Error object if submission failed, null otherwise. */
  error: ApiError | null;

  /** Data from the last successful submission. */
  data: SubmitLaterStageData | null;

  /** Whether the last submission succeeded. */
  isSuccess: boolean;

  /** Whether the last submission failed. */
  isError: boolean;

  /** Entry ID from the last successful submission. */
  entryId: number | undefined;

  /** Public identifier (UUID) from the last successful submission. */
  publicIdentifier: string | undefined;

  /** Whether the form workflow is complete after the last submission. */
  isFormComplete: boolean;

  /** Resets the entire submission state back to initial values. */
  reset: () => void;

  /** Clears only the error state. */
  dismissError: () => void;

  /** Resets status to idle without clearing data or errors. */
  resetToIdle: () => void;
}

/**
 * Custom hook for submitting a later stage of a form.
 * 
 * This hook provides a complete interface for form submission including:
 * - Typed submit function that returns a promise
 * - Loading, error, and success state tracking
 * - Submission result data access
 * - State management helpers
 * 
 * @returns Object with submit function, state, and utility functions
 */
export const useSubmitLaterStage = (): UseSubmitLaterStageReturn => {
  const dispatch = useAppDispatch();

  // ---------------------------------------------------------------------------
  // State Selection
  // ---------------------------------------------------------------------------

  const status = useAppSelector(selectSubmissionStatus);
  const isSubmitting = useAppSelector(selectIsSubmitting);
  const error = useAppSelector(selectSubmissionError);
  
  // Cast data to SubmitLaterStageData | null since they share the same shape
  const data = useAppSelector(selectLastSubmissionResponse) as SubmitLaterStageData | null;
  
  const isSuccess = useAppSelector(selectSubmissionSucceeded);
  const isError = useAppSelector(selectSubmissionFailed);
  const entryId = useAppSelector(selectLastEntryId);
  const publicIdentifier = useAppSelector(selectLastPublicIdentifier);
  const isFormComplete = useAppSelector(selectIsFormComplete);

  // ---------------------------------------------------------------------------
  // Memoized Callbacks
  // ---------------------------------------------------------------------------

  /**
   * Submit function wrapped in useCallback.
   */
  const submit = useCallback(
    async (payload: SubmitLaterStageRequest): Promise<SubmitLaterStageData> => {
      const resultAction = await dispatch(submitLaterStage(payload));
      
      if (submitLaterStage.fulfilled.match(resultAction)) {
        return resultAction.payload;
      }
      
      throw resultAction.payload || resultAction.error;
    },
    [dispatch]
  );

  /**
   * Reset function wrapped in useCallback.
   */
  const reset = useCallback(() => {
    dispatch(resetFormsSubmission());
  }, [dispatch]);

  /**
   * Dismiss error function wrapped in useCallback.
   */
  const dismissError = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  /**
   * Reset to idle function wrapped in useCallback.
   */
  const resetToIdle = useCallback(() => {
    dispatch(resetStatus());
  }, [dispatch]);

  return {
    submit,
    status,
    isSubmitting,
    error,
    data,
    isSuccess,
    isError,
    entryId,
    publicIdentifier,
    isFormComplete,
    reset,
    dismissError,
    resetToIdle,
  };
};

// =============================================================================
// EXAMPLE COMPONENT USAGE
// =============================================================================

/**
 * Example component demonstrating hook integration with shadcn/ui Button.
 * This is a minimal example showing the basic usage pattern.
 * 
 * @example
 * ```
 * import { Button } from '@/components/ui/button';
 * import { Alert, AlertDescription } from '@/components/ui/alert';
 * import { useSubmitInitialStage } from '@/features/forms/hooks/useSubmitInitialStage';
 * 
 * export function FormSubmitExample() {
 *   const {
 *     submit,
 *     isSubmitting,
 *     error,
 *     isSuccess,
 *     data,
 *     dismissError,
 *     reset
 *   } = useSubmitInitialStage();
 * 
 *   const handleSubmit = async (e: React.FormEvent) => {
 *     e.preventDefault();
 * 
 *     const payload = {
 *       form_version_id: 23,
 *       stage_transition_id: 46,
 *       field_values: [
 *         { field_id: 381, value: { street: '123 Main St', city: 'NYC' } },
 *         { field_id: 382, value: 'John Doe' }
 *       ]
 *     };
 * 
 *     try {
 *       const result = await submit(payload);
 *       console.log('Form submitted successfully:', result.entry_id);
 *       // Optionally redirect or show success UI
 *     } catch (err) {
 *       // Error is already in Redux state and will trigger re-render
 *       console.error('Submission failed');
 *     }
 *   };
 * 
 *   return (
 *     <div className="space-y-4">
 *       <form onSubmit={handleSubmit}>
 *         {/* Your form fields here *\/}
 * 
 *         <Button type="submit" disabled={isSubmitting}>
 *           {isSubmitting ? 'Submitting...' : 'Submit Form'}
 *         </Button>
 *       </form>
 * 
 *       {error && (
 *         <Alert variant="destructive">
 *           <AlertDescription>
 *             {error.message}
 *             <Button
 *               variant="ghost"
 *               size="sm"
 *               onClick={dismissError}
 *               className="ml-2"
 *             >
 *               Dismiss
 *             </Button>
 *           </AlertDescription>
 *         </Alert>
 *       )}
 * 
 *       {isSuccess && data && (
 *         <Alert>
 *           <AlertDescription>
 *             Form submitted successfully! Entry ID: {data.entry_id}
 *             {data.is_complete && ' (Form workflow complete)'}
 *             <Button
 *               variant="ghost"
 *               size="sm"
 *               onClick={reset}
 *               className="ml-2"
 *             >
 *               Submit Another
 *             </Button>
 *           </AlertDescription>
 *         </Alert>
 *       )}
 *     </div>
 *   );
 * }
 * ```
 */
