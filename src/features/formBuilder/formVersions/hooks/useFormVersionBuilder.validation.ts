// src/features/formVersion/hooks/useFormVersionBuilder.validation.ts

/**
 * Validation management hook for Form Version Builder
 * Handles validation error state
 */

import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch } from '@/store';
import {
  setValidationErrors,
  clearValidationErrors,
  selectBuilderValidationErrors,
  selectHasValidationErrors,
} from '../store/formVersionBuilderSlice';

// ============================================================================
// Validation Hook
// ============================================================================

/**
 * Hook for validation state management
 * 
 * @returns Validation errors and helpers
 * 
 * @example
 * const { errors, hasErrors, setErrors, clearErrors } = useBuilderValidation();
 * 
 * if (!stageName) {
 *   setErrors({ stageName: 'Name is required' });
 * }
 */
export const useBuilderValidation = () => {
  const dispatch = useDispatch<AppDispatch>();
  const errors = useSelector(selectBuilderValidationErrors);
  const hasErrors = useSelector(selectHasValidationErrors);

  const setErrors = useCallback(
    (errors: Record<string, string>) => {
      dispatch(setValidationErrors(errors));
    },
    [dispatch]
  );

  const clearErrors = useCallback(() => {
    dispatch(clearValidationErrors());
  }, [dispatch]);

  return {
    errors,
    hasErrors,
    setErrors,
    clearErrors,
  };
};
