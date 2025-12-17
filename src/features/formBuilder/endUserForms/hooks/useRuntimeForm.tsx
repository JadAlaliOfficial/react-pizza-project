/**
 * ================================
 * USE RUNTIME FORM HOOK
 * ================================
 *
 * Main runtime form hook - the single source of truth for the entire form system.
 *
 * Key Responsibilities:
 * - Integrate with immutable hooks (useFormStructure, useSubmitInitialStage)
 * - Manage runtime form state (field values, touched, errors)
 * - Orchestrate visibility, validation, and transitions engines
 * - Provide unified API for UI components
 * - Handle form submission flow
 * - Apply hidden field policy during submission
 *
 * Architecture Decisions:
 * - UI components should ONLY use this hook (not individual engines)
 * - All business logic delegated to engines (visibility, validation, transitions)
 * - Field values stored by field_id for O(1) lookups
 * - Validation runs on blur by default, optionally on change
 * - Visibility recalculated on every field value change
 * - Immutable hooks are never modified, only consumed
 *
 * Data Flow:
 * 1. Fetch form structure via useFormStructure (immutable)
 * 2. Initialize field values from default_value
 * 3. User changes field → update value → recalculate visibility → validate
 * 4. User submits → validate all → resolve transitions → submit via useSubmitInitialStage
 */

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useFormStructure } from '@/features/formBuilder/endUserForms/hooks/formStructure.hook';
import { useSubmitInitialStage } from '@/features/formBuilder/endUserForms/hooks/submitInitialForm.hook';
import type { JsonValue } from '@/features/formBuilder/endUserForms/types/submitInitialForm.types';
import type {
  FormField,
  FormSection,
} from '@/features/formBuilder/endUserForms/types/formStructure.types';
import type {
  RuntimeFormState,
  RuntimeFieldValues,
  FormValidationState,
  FieldValidationResult,
  FormValidationResult,
  VisibilityMap,
  LanguageId,
  LanguageConfig,
  UseRuntimeFormReturn,
} from '../types/runtime.types';
// Import as regular imports (not type imports) for runtime values
import {
  LANGUAGE_MAP,
  ACTIVE_HIDDEN_FIELD_POLICY,
  HiddenFieldPolicy,
} from '../types/runtime.types';
import { buildVisibilityMap } from '../engine/visibility/visibilityEngine';
import { validateField as engineValidateField } from '../engine/validation/validationEngine';
import { resolveTransitions } from '../engine/transitions/transitionsEngine';

// ================================
// HOOK PARAMETERS
// ================================

export interface UseRuntimeFormParams {
  formVersionId: number;
  recordId?: number;
  languageId?: LanguageId;
}

// ================================
// INITIALIZATION HELPERS
// ================================

/**
 * Extract default value from field configuration
 */
const getFieldDefaultValue = (field: FormField): JsonValue => {
  if (field.current_value !== null && field.current_value !== undefined) {
    return field.current_value as JsonValue;
  }
  if (field.default_value !== null && field.default_value !== undefined) {
    return field.default_value as JsonValue;
  }

  // Type-specific defaults
  switch (field.field_type) {
    case 'checkbox':
    case 'toggle_switch':
      return false;
    case 'multi_select':
      return [];
    case 'number_input':
    case 'currency_input':
    case 'percentage_input':
      return 0;
    default:
      return '';
  }
};

/**
 * Initialize runtime field values from form structure
 */
const initializeFieldValues = (allFields: FormField[]): RuntimeFieldValues => {
  const fieldValues: RuntimeFieldValues = {};

  allFields.forEach((field) => {
    fieldValues[field.field_id] = {
      fieldId: field.field_id,
      value: getFieldDefaultValue(field),
      error: null,
      touched: false,
      isValid: true,
    };
  });

  return fieldValues;
};

/**
 * Extract all fields from form structure (flattened)
 */
const extractAllFields = (sections: FormSection[]): FormField[] => {
  const fields: FormField[] = [];

  sections.forEach((section) => {
    fields.push(...section.fields);
  });

  return fields;
};

// ================================
// MAIN HOOK
// ================================

export const useRuntimeForm = ({
  formVersionId,
  recordId,
  languageId = 1,
}: UseRuntimeFormParams): UseRuntimeFormReturn => {
  // ================================
  // IMMUTABLE HOOKS (DO NOT MODIFY)
  // ================================

  const { data: formStructure } = useFormStructure({
    formVersionId,
    languageId,
  });

  const { submit: submitForm, isSubmitting } = useSubmitInitialStage();

  // ================================
  // RUNTIME STATE
  // ================================

  const [fieldValues, setFieldValues] = useState<RuntimeFieldValues>({});
  const [validationState, setValidationState] = useState<FormValidationState>({
    isValid: true,
    isValidating: false,
    fieldErrors: {},
    globalErrors: [],
  });
  const [selectedTransitionId, setSelectedTransitionId] = useState<
    number | null
  >(null);

  // Language configuration
  const languageConfig: LanguageConfig = LANGUAGE_MAP[languageId];

  // ================================
  // DERIVED DATA
  // ================================

  // Extract all fields (flattened from sections)
  const allFields = useMemo(() => {
    if (!formStructure?.stage?.sections) return [];
    return extractAllFields(formStructure.stage.sections);
  }, [formStructure]);

  // Extract all transitions
  const availableTransitions = useMemo(() => {
    return formStructure?.available_transitions || [];
  }, [formStructure]);

  // ================================
  // VISIBILITY ENGINE
  // ================================

  const visibilityMap: VisibilityMap = useMemo(() => {
    if (!formStructure?.stage) {
      return { fields: {}, sections: {}, transitions: {} };
    }

    // Build visibility map using the engine
    return buildVisibilityMap(
      allFields,
      formStructure.stage.sections,
      availableTransitions,
      fieldValues,
    );
  }, [formStructure, fieldValues, availableTransitions, allFields]);

  // ================================
  // VALIDATION ENGINE
  // ================================

  /**
   * Validate a single field
   */
  const validateField = useCallback(
    async (fieldId: number): Promise<FieldValidationResult> => {
      const field = allFields.find((f) => f.field_id === fieldId);
      if (!field) {
        return {
          fieldId,
          isValid: false,
          errors: ['Field not found'],
        };
      }

      const fieldValue = fieldValues[fieldId];
      if (!fieldValue) {
        return {
          fieldId,
          isValid: false,
          errors: ['Field value not initialized'],
        };
      }

      // Use validation engine
      const result = engineValidateField(field, fieldValue.value);

      return {
        fieldId,
        isValid: result.valid,
        errors: result.error ? [result.error] : [],
      };
    },
    [allFields, fieldValues],
  );

  /**
   * Validate entire form
   */
  const validateForm = useCallback(async (): Promise<FormValidationResult> => {
    const fieldResults: Record<number, FieldValidationResult> = {};
    let isValid = true;

    // Only validate visible fields
    const visibleFields = allFields.filter(
      (field) => visibilityMap.fields[field.field_id] !== false,
    );

    for (const field of visibleFields) {
      const result = await validateField(field.field_id);
      fieldResults[field.field_id] = result;

      if (!result.isValid) {
        isValid = false;
      }
    }

    return {
      isValid,
      fieldResults,
      globalErrors: [],
    };
  }, [allFields, visibilityMap, validateField]);

  // ================================
  // TRANSITIONS ENGINE
  // ================================

  const submitButtonState = useMemo(() => {
    const valueMap: Record<number, any> = {};
    Object.entries(fieldValues).forEach(([fieldId, fieldValue]) => {
      valueMap[Number(fieldId)] = fieldValue.value;
    });

    const result = resolveTransitions(
      availableTransitions,
      valueMap,
      validationState.isValid,
    );

    return result.submitButtonState;
  }, [availableTransitions, fieldValues, validationState.isValid]);

  // ================================
  // FIELD OPERATIONS
  // ================================

  const getFieldValue = useCallback(
    (fieldId: number): JsonValue => {
      return fieldValues[fieldId]?.value ?? null;
    },
    [fieldValues],
  );

  const setFieldValue = useCallback((fieldId: number, value: JsonValue) => {
    setFieldValues((prev) => ({
      ...prev,
      [fieldId]: {
        ...prev[fieldId],
        fieldId,
        value,
        isValid: true, // Reset validation on change
      },
    }));

    // Validate on change if configured
    // For now, we'll validate on blur only
  }, []);

  const setFieldTouched = useCallback(
    async (fieldId: number) => {
      setFieldValues((prev) => ({
        ...prev,
        [fieldId]: {
          ...prev[fieldId],
          touched: true,
        },
      }));

      // Validate on blur
      const result = await validateField(fieldId);

      setFieldValues((prev) => ({
        ...prev,
        [fieldId]: {
          ...prev[fieldId],
          error: result.errors[0] || null,
          isValid: result.isValid,
        },
      }));

      // Update validation state
      setValidationState((prev) => ({
        ...prev,
        fieldErrors: {
          ...prev.fieldErrors,
          [fieldId]: result.errors[0] || '',
        },
      }));
    },
    [validateField],
  );

  const getFieldError = useCallback(
    (fieldId: number): string | null => {
      return fieldValues[fieldId]?.error ?? null;
    },
    [fieldValues],
  );

  // ================================
  // VISIBILITY QUERIES
  // ================================

  const isFieldVisible = useCallback(
    (fieldId: number): boolean => {
      return visibilityMap.fields[fieldId] !== false;
    },
    [visibilityMap],
  );

  const isSectionVisible = useCallback(
    (sectionId: number): boolean => {
      return visibilityMap.sections[sectionId] !== false;
    },
    [visibilityMap],
  );

  const isTransitionVisible = useCallback(
    (transitionId: number): boolean => {
      return visibilityMap.transitions[transitionId] !== false;
    },
    [visibilityMap],
  );

  // ================================
  // FORM SUBMISSION
  // ================================

  /**
   * Apply hidden field policy to form values before submission
   */
  const applyHiddenFieldPolicy = useCallback(
    (values: RuntimeFieldValues): Record<number, JsonValue> => {
      const submissionValues: Record<number, JsonValue> = {};

      Object.entries(values).forEach(([fieldIdStr, fieldValue]) => {
        const fieldId = Number(fieldIdStr);
        const isVisible = visibilityMap.fields[fieldId] !== false;

        if (isVisible) {
          // Always include visible fields
          submissionValues[fieldId] = fieldValue.value;
        } else {
          // Apply policy for hidden fields
          switch (ACTIVE_HIDDEN_FIELD_POLICY) {
            case HiddenFieldPolicy.PRESERVE:
              // Include hidden field with current value
              submissionValues[fieldId] = fieldValue.value;
              break;

            case HiddenFieldPolicy.CLEAR:
              // Exclude hidden field from submission
              break;

            case HiddenFieldPolicy.DEFAULT:
              // Include hidden field with default value
              const field = allFields.find((f) => f.field_id === fieldId);
              if (field) {
                submissionValues[fieldId] = getFieldDefaultValue(field);
              }
              break;
          }
        }
      });

      return submissionValues;
    },
    [visibilityMap, allFields],
  );

  const handleSubmit = useCallback(async () => {
    // Validate entire form first
    setValidationState((prev) => ({ ...prev, isValidating: true }));

    const validationResult = await validateForm();

    setValidationState({
      isValid: validationResult.isValid,
      isValidating: false,
      fieldErrors: Object.entries(validationResult.fieldResults).reduce(
        (acc, [fieldId, result]) => {
          acc[Number(fieldId)] = result.errors[0] || '';
          return acc;
        },
        {} as Record<number, string>,
      ),
      globalErrors: validationResult.globalErrors,
    });

    // Mark all fields as touched to show errors
    setFieldValues((prev) => {
      const updated = { ...prev };
      Object.keys(updated).forEach((fieldId) => {
        updated[Number(fieldId)].touched = true;
      });
      return updated;
    });

    if (!validationResult.isValid) {
      console.warn('[useRuntimeForm] Form validation failed');
      return;
    }

    // Get transition to execute
    const transitionId =
      selectedTransitionId || submitButtonState.selectedTransitionId;
    if (!transitionId) {
      console.error('[useRuntimeForm] No transition selected for submission');
      return;
    }

    // Apply hidden field policy
    const submissionValues = applyHiddenFieldPolicy(fieldValues);

    // Convert to API format: array of field_values
    const fieldValuesArray = Object.entries(submissionValues).map(
      ([fieldId, value]) => ({
        field_id: Number(fieldId),
        value,
      }),
    );

    // Submit via immutable hook
    try {
      await submitForm({
        form_version_id: formVersionId,
        stage_transition_id: transitionId,
        field_values: fieldValuesArray,
      });

      console.log('[useRuntimeForm] Form submitted successfully');
    } catch (error) {
      console.error('[useRuntimeForm] Form submission failed:', error);

      setValidationState((prev) => ({
        ...prev,
        globalErrors: ['Submission failed. Please try again.'],
      }));
    }
  }, [
    validateForm,
    selectedTransitionId,
    submitButtonState,
    fieldValues,
    applyHiddenFieldPolicy,
    submitForm,
    formVersionId,
    recordId,
  ]);

  // ================================
  // FORM STATE QUERIES
  // ================================

  const isFormValid = useMemo(() => {
    return validationState.isValid;
  }, [validationState]);

  const isFormDirty = useMemo(() => {
    return Object.values(fieldValues).some((field) => field.touched);
  }, [fieldValues]);

  const canSubmit = useMemo(() => {
    return submitButtonState.canSubmit && !isSubmitting;
  }, [submitButtonState, isSubmitting]);

  // ================================
  // INITIALIZATION
  // ================================

  useEffect(() => {
    if (allFields.length > 0 && Object.keys(fieldValues).length === 0) {
      const initialized = initializeFieldValues(allFields);
      setFieldValues(initialized);
    }
  }, [allFields, fieldValues]);

  // ================================
  // RETURN HOOK INTERFACE
  // ================================

  const formState: RuntimeFormState = {
    fieldValues,
    validationState,
    isSubmitting,
    selectedTransitionId,
    language: languageConfig,
  };

  return {
    // State
    formState,
    visibilityMap,
    validationState,

    // Field operations
    getFieldValue,
    setFieldValue,
    setFieldTouched,
    getFieldError,

    // Visibility queries
    isFieldVisible,
    isSectionVisible,
    isTransitionVisible,

    // Validation
    validateField,
    validateForm,

    // Transitions
    submitButtonState,
    selectTransition: setSelectedTransitionId,

    // Form submission
    handleSubmit,

    // Form state
    isFormValid,
    isFormDirty,
    canSubmit,
  };
};
