/**
 * ================================
 * USE LATER STAGE RUNTIME HOOK
 * ================================
 *
 * Runtime hook for handling "Later Stages" of a form entry.
 * Similar to useRuntimeForm, but adapted for:
 * 1. Working with existing entry data (pre-filled)
 * 2. Submitting to the submitLaterStage endpoint
 * 3. Accepting structure as a prop instead of fetching it
 *
 * @see useRuntimeForm for core architecture details
 */

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useSubmitLaterStage } from '@/features/formBuilder/endUserForms/hooks/submitInitialForm.hook';
import type { JsonValue } from '@/features/formBuilder/endUserForms/types/submitInitialForm.types';
import type {
  FormField,
  FormSection,
  FormStructureData,
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
import {
  LANGUAGE_MAP,
} from '../types/runtime.types';
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

export interface UseLaterStageRuntimeParams {
  formStructure: FormStructureData; // Structure is passed in, not fetched
  entryPublicIdentifier: string;
  languageId?: LanguageId;
}

// ================================
// INITIALIZATION HELPERS
// ================================
/**
 * Extract default value from field configuration
 * Priority: current_value > default_value > type-specific default
 */
const getFieldDefaultValue = (field: FormField): JsonValue => {
  // 1) Priority: current_value first (This is critical for later stages!)
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
      if (raw === 1 || raw === '1') return true;
      if (raw === 0 || raw === '0') return false;
      return Boolean(raw);
    }

    case 'Multi_Select': {
      return Array.isArray(raw) ? raw : [];
    }

    case 'Address Input': {
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

  switch (type) {
    case 'Document Upload':
    case 'File Upload':
    case 'Image Upload':
    case 'Video Upload':
    case 'Password Input':
    case 'Signature Pad':
      return null;
  }

  switch (type) {
    case 'Multi_Select':
      return [];
    case 'Address Input':
      return { street: '', city: '', state: '', postal_code: '', country: '' };
    case 'Location Picker':
      return { lat: null, lng: null, address: '' };
  }

  switch (type) {
    case 'Checkbox':
    case 'Toggle Switch':
      return false;
  }

  switch (type) {
    case 'Currency Input':
      return null;
    case 'Number Input':
    case 'Percentage Input':
    case 'Slider':
    case 'Rating':
      return 0;
  }

  return '';
};

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

const extractAllFields = (sections: FormSection[]): FormField[] => {
  const fields: FormField[] = [];
  sections.forEach((section) => {
    fields.push(...section.fields);
  });
  return fields;
};

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

export const useLaterStageRuntime = ({
  formStructure,
  entryPublicIdentifier,
  languageId = 1,
}: UseLaterStageRuntimeParams): UseRuntimeFormReturn => {
  
  // Use the LATER stage submit hook
  const { submit: submitForm, isSubmitting } = useSubmitLaterStage();

  // ================================
  // RUNTIME STATE
  // ================================

  const [fieldValues, setFieldValues] = useState<RuntimeFieldValues>({});
  const [selectedTransitionId, setSelectedTransitionId] = useState<number | null>(null);

  const languageConfig: LanguageConfig = LANGUAGE_MAP[languageId];

  // ================================
  // DERIVED DATA
  // ================================

  const allFields = useMemo(() => {
    if (!formStructure?.stage?.sections) return [];
    return extractAllFields(formStructure.stage.sections);
  }, [formStructure]);

  const availableTransitions = useMemo(() => {
    return formStructure?.available_transitions || [];
  }, [formStructure]);

  const dependencyMap = useMemo(() => {
    return buildDependencyMap(allFields);
  }, [allFields]);

  // ================================
  // VISIBILITY ENGINE
  // ================================

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
  // VALIDATION STATE
  // ================================

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

  const getFieldValue = useCallback(
    (fieldId: number): JsonValue => {
      return fieldValues[fieldId]?.value ?? null;
    },
    [fieldValues],
  );

  const setFieldValue = useCallback(
    async (fieldId: number, value: JsonValue) => {
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
        return newState;
      });

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

  const setFieldTouched = useCallback(
    async (fieldId: number) => {
      setFieldValues((prev) => ({
        ...prev,
        [fieldId]: {
          ...prev[fieldId],
          touched: true,
        },
      }));

      const result = await validateField(fieldId);

      setFieldValues((prev) => ({
        ...prev,
        [fieldId]: {
          ...prev[fieldId],
          error: result.errors[0] || null,
          isValid: result.isValid,
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

  const applyHiddenFieldPolicy = useCallback(
    (values: RuntimeFieldValues): Record<number, JsonValue> => {
      const submissionValues: Record<number, JsonValue> = {};

      Object.entries(values).forEach(([fieldIdStr, fieldValue]) => {
        const fieldId = Number(fieldIdStr);
        const isVisible = visibilityMap.fields[fieldId] !== false;

        if (!isVisible) return;
        submissionValues[fieldId] = fieldValue.value;
      });

      return submissionValues;
    },
    [visibilityMap],
  );

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
      console.error('[useLaterStageRuntime] No transition selected for submission');
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
        public_identifier: entryPublicIdentifier, // Using public identifier for later stages
        stage_transition_id: transitionId,
        field_values: fieldValuesArray,
      });
      console.log('[useLaterStageRuntime] Form submitted successfully');
    } catch (error) {
      console.error('[useLaterStageRuntime] Form submission failed:', error);
    }
  }, [
    validateForm,
    selectedTransitionId,
    submitButtonState,
    fieldValues,
    applyHiddenFieldPolicy,
    submitForm,
    entryPublicIdentifier,
  ]);

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
    // Only initialize if we have fields and haven't initialized yet
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
