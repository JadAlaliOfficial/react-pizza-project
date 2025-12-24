/**
 * ================================
 * USE RUNTIME FORM HOOK
 * ================================
 *
 * Main runtime form hook - the single source of truth for the entire form system.
 *
 * Key Responsibilities:
 * - Integrate with immutable hooks (useFormStructure, useSubmitInitialStage)
 * - Manage runtime form state (field values, errors - SINGLE SOURCE)
 * - Orchestrate visibility, validation, and transitions engines
 * - Provide unified API for UI components
 * - Handle form submission flow with hidden field policy
 *
 * Architecture Decisions:
 * - UI components ONLY use this hook (not individual engines)
 * - All business logic delegated to engines (visibility, validation, transitions)
 * - Errors stored ONLY in RuntimeFieldValues (single source of truth)
 * - Field values stored by field_id for O(1) lookups
 * - Validation runs on blur by default
 * - Visibility recalculated on every field value change
 * - Cross-field validation triggers revalidation of dependent fields
 * - Immutable hooks are never modified, only consumed
 *
 * Data Flow:
 * 1. Fetch form structure via useFormStructure (immutable)
 * 2. Initialize field values from default_value or current_value
 * 3. User changes field → update value → recalculate visibility → validate
 * 4. Cross-field changes → revalidate dependent fields
 * 5. User submits → validate all → resolve transitions → submit via useSubmitInitialStage
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
import { LANGUAGE_MAP } from '../types/runtime.types';
import { buildVisibilityMap } from '../engine/visibility/visibilityEngine';
import {
  validateField as engineValidateField,
  hasCrossFieldRules,
  getCrossFieldDependencies,
} from '../engine/validation/validationEngine';
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
 * Priority: current_value > default_value > type-specific default
 *
 * Normalizes API shapes to runtime shapes:
 * - Checkbox/Toggle Switch: 0/1 -> boolean
 * - Multi_Select: array (default [])
 * - Address Input / Location Picker: object (default empty object shape)
 * - Upload/Signature/Password: always null
 */
const getFieldDefaultValue = (field: FormField): JsonValue => {
  // 1) Priority: current_value first
  if (field.current_value !== null && field.current_value !== undefined) {
    return normalizeByType(field, field.current_value as JsonValue);
  }

  // 2) Then default_value (if present)
  if (field.default_value !== null && field.default_value !== undefined) {
    return normalizeByType(field, field.default_value as JsonValue);
  }

  // 3) Finally type-specific fallback
  return fallbackByType(field);
};

const normalizeByType = (field: FormField, raw: JsonValue): JsonValue => {
  const type = String(field.field_type || '').trim();

  switch (type) {
    case 'Checkbox':
    case 'Toggle Switch': {
      // API uses 0/1 sometimes; also tolerate true/false
      if (raw === 1 || raw === '1') return true;
      if (raw === 0 || raw === '0') return false;
      return Boolean(raw);
    }

    case 'Multi_Select': {
      // Ensure array
      return Array.isArray(raw) ? raw : [];
    }

    case 'Address Input': {
      // Ensure object with expected keys (best-effort)
      const obj =
        raw && typeof raw === 'object' && !Array.isArray(raw)
          ? (raw as any)
          : {};
      return {
        street: obj.street ?? '',
        city: obj.city ?? '',
        state: obj.state ?? '',
        postal_code: obj.postal_code ?? '',
        country: obj.country ?? '',
      };
    }

    case 'Location Picker': {
      const obj =
        raw && typeof raw === 'object' && !Array.isArray(raw)
          ? (raw as any)
          : {};
      return {
        lat: typeof obj.lat === 'number' ? obj.lat : null,
        lng: typeof obj.lng === 'number' ? obj.lng : null,
        address: typeof obj.address === 'string' ? obj.address : '',
      };
    }

    default:
      return raw;
  }
};

const fallbackByType = (field: FormField): JsonValue => {
  const type = String(field.field_type || '').trim();

  // Always no defaults (as you said)
  switch (type) {
    case 'Document Upload':
    case 'File Upload':
    case 'Image Upload':
    case 'Video Upload':
    case 'Password Input':
    case 'Signature Pad':
      return null;
  }

  // Special structured types
  switch (type) {
    case 'Multi_Select':
      return [];
    case 'Address Input':
      return { street: '', city: '', state: '', postal_code: '', country: '' };
    case 'Location Picker':
      return { lat: null, lng: null, address: '' };
  }

  // Boolean types (API is 0/1, runtime wants boolean)
  switch (type) {
    case 'Checkbox':
    case 'Toggle Switch':
      return false;
  }

  // Numeric types
  switch (type) {
    case 'Currency Input':
      return null;
    case 'Number Input':
    case 'Percentage Input':
    case 'Slider':
    case 'Rating':
      return 0;
  }

  // Everything else is string-ish by default
  return '';
};

/**
 * Initialize runtime field values from form structure
 * Sets up initial state with default values and empty errors
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

/**
 * Build a map of field dependencies for cross-field validation
 * Key: field_id that others depend on
 * Value: array of field_ids that need revalidation when key field changes
 */
const buildDependencyMap = (
  allFields: FormField[],
): Record<number, number[]> => {
  const dependencyMap: Record<number, number[]> = {};

  allFields.forEach((field) => {
    if (hasCrossFieldRules(field)) {
      const dependencies = getCrossFieldDependencies(field);
      dependencies.forEach((dependsOnFieldId) => {
        if (!dependencyMap[dependsOnFieldId]) {
          dependencyMap[dependsOnFieldId] = [];
        }
        dependencyMap[dependsOnFieldId].push(field.field_id);
      });
    }
  });

  return dependencyMap;
};

// ================================
// MAIN HOOK
// ================================

export const useRuntimeForm = ({
  formVersionId,
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

  /**
   * Single source of truth for field values and errors
   * Each field contains: value, error, touched, isValid
   */
  const [fieldValues, setFieldValues] = useState<RuntimeFieldValues>({});

  /**
   * Selected transition ID (user can override default)
   */
  const [selectedTransitionId, setSelectedTransitionId] = useState<
    number | null
  >(null);

  /**
   * Language configuration
   */
  const languageConfig: LanguageConfig = LANGUAGE_MAP[languageId];

  // ================================
  // DERIVED DATA
  // ================================

  /**
   * Extract all fields (flattened from sections)
   */
  const allFields = useMemo(() => {
    if (!formStructure?.stage?.sections) return [];
    return extractAllFields(formStructure.stage.sections);
  }, [formStructure]);

  /**
   * Extract all transitions
   */
  const availableTransitions = useMemo(() => {
    return formStructure?.available_transitions || [];
  }, [formStructure]);

  /**
   * Build cross-field dependency map
   * Maps field_id → fields that depend on it
   */
  const dependencyMap = useMemo(() => {
    return buildDependencyMap(allFields);
  }, [allFields]);

  // ================================
  // VISIBILITY ENGINE
  // ================================

  /**
   * Build visibility map for all entities (fields, sections, transitions)
   * Recalculated whenever field values change
   */
  const visibilityMap: VisibilityMap = useMemo(() => {
    if (!formStructure?.stage) {
      return { fields: {}, sections: {}, transitions: {} };
    }

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
   * Validate a single field using the validation engine
   * Passes all field values for cross-field validation support
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

      const result = engineValidateField(field, fieldValue.value, fieldValues);

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
   * Only validates visible fields
   */
  const validateForm = useCallback(async (): Promise<FormValidationResult> => {
    const fieldResults: Record<number, FieldValidationResult> = {};
    let isValid = true;

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

  /**
   * Resolve submit button state from transitions engine
   * Recalculated when field values or form validity changes
   */
  const submitButtonState = useMemo(() => {
    const valueMap: Record<number, JsonValue> = {};
    Object.entries(fieldValues).forEach(([fieldId, fieldValue]) => {
      valueMap[Number(fieldId)] = fieldValue.value;
    });

    const isFormValid = Object.values(fieldValues).every((fv) => fv.isValid);

    const result = resolveTransitions(
      availableTransitions,
      valueMap,
      isFormValid,
    );

    return result.submitButtonState;
  }, [availableTransitions, fieldValues]);

  // ================================
  // VALIDATION STATE (DERIVED)
  // ================================

  /**
   * Compute validation state from field values (single source of truth)
   * This is derived state, not stored separately
   */
  const validationState: FormValidationState = useMemo(() => {
    const fieldErrors: Record<number, string> = {};
    let isValid = true;

    Object.entries(fieldValues).forEach(([fieldId, fieldValue]) => {
      if (fieldValue.error) {
        fieldErrors[Number(fieldId)] = fieldValue.error;
        isValid = false;
      }
    });

    return {
      isValid,
      isValidating: false,
      fieldErrors,
      globalErrors: [],
    };
  }, [fieldValues]);

  // ================================
  // FIELD OPERATIONS
  // ================================

  /**
   * Get field value by ID
   */
  const getFieldValue = useCallback(
    (fieldId: number): JsonValue => {
      return fieldValues[fieldId]?.value ?? null;
    },
    [fieldValues],
  );

  /**
   * Set field value and trigger cross-field revalidation if needed
   */
  const setFieldValue = useCallback(
    async (fieldId: number, value: JsonValue) => {
      console.log(
        `[useRuntimeForm] setFieldValue called for field ${fieldId}:`,
        value,
      );
      setFieldValues((prev) => {
        const newState = {
          ...prev,
          [fieldId]: {
            ...prev[fieldId],
            fieldId,
            value,
            error: null,
            isValid: true,
          },
        };
        console.log(
          `[useRuntimeForm] New fieldValues state for field ${fieldId}:`,
          newState[fieldId],
        );
        return newState;
      });

      // Revalidate dependent fields (cross-field validation)
      const dependentFieldIds = dependencyMap[fieldId] || [];
      if (dependentFieldIds.length > 0) {
        setTimeout(async () => {
          for (const dependentFieldId of dependentFieldIds) {
            const dependentField = allFields.find(
              (f) => f.field_id === dependentFieldId,
            );
            if (dependentField && fieldValues[dependentFieldId]?.touched) {
              const result = await validateField(dependentFieldId);
              setFieldValues((prev) => ({
                ...prev,
                [dependentFieldId]: {
                  ...prev[dependentFieldId],
                  error: result.errors[0] || null,
                  isValid: result.isValid,
                },
              }));
            }
          }
        }, 0);
      }
    },
    [dependencyMap, allFields, fieldValues, validateField],
  );

  /**
   * Mark field as touched and validate it
   * Called on blur
   */
  const setFieldTouched = useCallback(
    async (fieldId: number, latestValue?: JsonValue) => {
      // Mark as touched first
      setFieldValues((prev) => ({
        ...prev,
        [fieldId]: {
          ...prev[fieldId],
          fieldId,
          touched: true,
          ...(latestValue !== undefined ? { value: latestValue } : {}),
        },
      }));

      const field = allFields.find((f) => f.field_id === fieldId);
      if (!field) {
        setFieldValues((prev) => ({
          ...prev,
          [fieldId]: {
            ...prev[fieldId],
            error: 'Field not found',
            isValid: false,
          },
        }));
        return;
      }

      // Validate deterministically:
      // - valueToValidate: use latestValue if provided
      // - contextValues: patch snapshot fieldValues with latestValue for cross-field rules
      const currentRuntimeValue = fieldValues[fieldId];
      const valueToValidate: JsonValue =
        latestValue !== undefined
          ? latestValue
          : (currentRuntimeValue?.value ?? null);

      const contextValues =
        latestValue !== undefined
          ? {
              ...fieldValues,
              [fieldId]: {
                ...(currentRuntimeValue ?? {
                  fieldId,
                  value: valueToValidate,
                  error: null,
                  touched: true,
                  isValid: true,
                }),
                value: valueToValidate,
              },
            }
          : fieldValues;

      const engineResult = engineValidateField(
        field,
        valueToValidate,
        contextValues,
      );

      setFieldValues((prev) => ({
        ...prev,
        [fieldId]: {
          ...prev[fieldId],
          error: engineResult.error || null,
          isValid: engineResult.valid,
        },
      }));
    },
    [allFields, fieldValues],
  );

  /**
   * Get field error (single source of truth)
   */
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
   * Build the payload to submit to the backend.
   *
   * Behavior:
   * - Visible fields: INCLUDED with their current values
   * - Hidden fields: ALWAYS IGNORED (not submitted), even if they currently have values
   *
   * Rationale:
   * - Prevents stale/previous values from hidden fields from being sent unintentionally
   * - Keeps submission strictly aligned with what the user can currently see/edit
   */
  const applyHiddenFieldPolicy = useCallback(
    (values: RuntimeFieldValues): Record<number, JsonValue> => {
      const submissionValues: Record<number, JsonValue> = {};

      Object.entries(values).forEach(([fieldIdStr, fieldValue]) => {
        const fieldId = Number(fieldIdStr);
        const isVisible = visibilityMap.fields[fieldId] !== false;

        // Hidden fields are always ignored (never submitted)
        if (!isVisible) return;

        // Visible fields are submitted with their current runtime value
        submissionValues[fieldId] = fieldValue.value;
      });

      return submissionValues;
    },
    [visibilityMap],
  );

  /**
   * Handle form submission
   *
   * Flow:
   * 1. Validate all visible fields
   * 2. Mark all fields as touched to show errors
   * 3. Stop if validation fails
   * 4. Resolve transition to execute (selected or default)
   * 5. Apply hidden field policy
   * 6. Submit via immutable hook
   */
  const handleSubmit = useCallback(async () => {
    const validationResult = await validateForm();

    setFieldValues((prev) => {
      const updated = { ...prev };
      Object.entries(validationResult.fieldResults).forEach(
        ([fieldId, result]) => {
          const id = Number(fieldId);
          updated[id] = {
            ...updated[id],
            touched: true,
            error: result.errors[0] || null,
            isValid: result.isValid,
          };
        },
      );
      return updated;
    });

    if (!validationResult.isValid) {
      return;
    }

    const transitionId =
      selectedTransitionId || submitButtonState.selectedTransitionId;
    if (!transitionId) {
      console.error('[useRuntimeForm] No transition selected for submission');
      return;
    }

    const submissionValues = applyHiddenFieldPolicy(fieldValues);

    const fieldValuesArray = Object.entries(submissionValues).map(
      ([fieldId, value]) => ({
        field_id: Number(fieldId),
        value,
      }),
    );

    try {
      await submitForm({
        form_version_id: formVersionId,
        stage_transition_id: transitionId,
        field_values: fieldValuesArray,
      });
      console.log('[useRuntimeForm] Form submitted successfully:', {
        formVersionId,
        transitionId,
        fieldValuesArray,
      });
    } catch (error) {
      console.error('[useRuntimeForm] Form submission failed:', error);
    }
  }, [
    validateForm,
    selectedTransitionId,
    submitButtonState,
    fieldValues,
    applyHiddenFieldPolicy,
    submitForm,
    formVersionId,
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

  /**
   * Initialize field values when form structure loads
   */
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
    formState,
    visibilityMap,
    validationState,
    getFieldValue,
    setFieldValue,
    setFieldTouched,
    getFieldError,
    isFieldVisible,
    isSectionVisible,
    isTransitionVisible,
    validateField,
    validateForm,
    submitButtonState,
    selectTransition: setSelectedTransitionId,
    handleSubmit,
    isFormValid,
    isFormDirty,
    canSubmit,
    languageId,
  };
};
