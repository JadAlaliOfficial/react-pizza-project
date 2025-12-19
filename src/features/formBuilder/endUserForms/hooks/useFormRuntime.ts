
import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '@/store';
import {
  initForm,
  setFieldValue,
  setFieldTouched,
  setFieldError,
  setFieldErrors,
  resetForm,
  startValidation,
  endValidation,
  setSubmitting,
  selectAllFields,
  selectFieldById,
  selectFormStatus,
  selectFormValues,
  selectIsFormDirty,
  selectValidFieldsCount,
  selectLanguageId,
} from '../store/formRuntime.slice';
import type { FormField } from '../types/formStructure.types';
import type { JsonValue } from '../types/submitInitialForm.types';
import { getFieldDefaultValue } from '../utils/formDefaults';

/**
 * Hook to interact with the Form Runtime Redux slice.
 * Provides methods to read state and dispatch actions.
 */
export const useFormRuntime = () => {
  const dispatch = useDispatch<AppDispatch>();

  // Selectors
  const fields = useSelector(selectAllFields);
  const formStatus = useSelector(selectFormStatus);
  const values = useSelector(selectFormValues);
  const isDirty = useSelector(selectIsFormDirty);
  const validFieldsCount = useSelector(selectValidFieldsCount);
  const languageId = useSelector(selectLanguageId);

  // Actions
  
  /**
   * Initialize the form with the given fields.
   * Calculates default values automatically.
   */
  const initializeForm = useCallback((formFields: FormField[]) => {
    const defaultValues: Record<string, JsonValue> = {};
    formFields.forEach(field => {
      defaultValues[field.field_id] = getFieldDefaultValue(field);
    });
    
    dispatch(initForm({ fields: formFields, defaultValues }));
  }, [dispatch]);

  const updateFieldValue = useCallback((fieldId: number, value: JsonValue) => {
    dispatch(setFieldValue({ fieldId, value }));
    // Mark as touched on change if needed, or let the UI handle onBlur
    // dispatch(setFieldTouched({ fieldId, touched: true })); 
  }, [dispatch]);

  const updateFieldTouched = useCallback((fieldId: number, touched: boolean) => {
    dispatch(setFieldTouched({ fieldId, touched }));
  }, [dispatch]);

  const updateFieldError = useCallback((fieldId: number, error: string | null) => {
    dispatch(setFieldError({ fieldId, error }));
  }, [dispatch]);

  const reset = useCallback(() => {
    dispatch(resetForm());
  }, [dispatch]);

  const setSubmittingState = useCallback((isSubmitting: boolean) => {
    dispatch(setSubmitting(isSubmitting));
  }, [dispatch]);

  // Helper to get a single field's state (useful for individual field components if they connect directly)
  const useField = (fieldId: number) => {
    return useSelector((state: RootState) => selectFieldById(fieldId)(state));
  };

  return {
    // State
    fields,
    formStatus,
    values,
    isDirty,
    validFieldsCount,
    languageId,

    // Actions
    initializeForm,
    setFieldValue: updateFieldValue,
    setFieldTouched: updateFieldTouched,
    setFieldError: updateFieldError,
    setFieldErrors: (errors: Record<number, string | null>) => dispatch(setFieldErrors(errors)),
    resetForm: reset,
    startValidation: () => dispatch(startValidation()),
    endValidation: (isValid: boolean) => dispatch(endValidation({ isValid })),
    setSubmitting: setSubmittingState,
    
    // Sub-hooks
    useField,
  };
};
