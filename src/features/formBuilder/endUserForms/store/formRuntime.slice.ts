import {
  createSlice,
  type PayloadAction,
  createSelector,
} from '@reduxjs/toolkit';
import { type RootState } from '@/store';
import { type RuntimeFieldValue } from '../types/runtime.types';
import { type JsonValue } from '../types/submitInitialForm.types';
import { type FormField } from '../types/formStructure.types';

/**
 * ================================
 * FORM RUNTIME SLICE
 * ================================
 * Centralized state management for all form component values.
 * Handles values, validation status, touched state, and metadata.
 */

// =============================================================================
// STATE INTERFACES
// =============================================================================

export interface FieldMetadata {
  isVisible: boolean;
  isDisabled: boolean;
  isReadOnly: boolean;
  [key: string]: any;
}

export interface RuntimeFieldState extends RuntimeFieldValue {
  metadata: FieldMetadata;
}

export interface FormRuntimeState {
  fields: Record<number, RuntimeFieldState>;
  globalStatus: {
    isValid: boolean;
    isValidating: boolean;
    isSubmitting: boolean;
    submitCount: number;
    submissionError: string | null;
  };
  // Store default values separately to allow reset
  defaultValues: Record<number, JsonValue>;
  languageId: number;
}

// =============================================================================
// INITIAL STATE
// =============================================================================

const initialState: FormRuntimeState = {
  fields: {},
  globalStatus: {
    isValid: true,
    isValidating: false,
    isSubmitting: false,
    submitCount: 0,
    submissionError: null,
  },
  defaultValues: {},
  languageId: 1,
};

// =============================================================================
// SLICE
// =============================================================================

const formRuntimeSlice = createSlice({
  name: 'formRuntime',
  initialState,
  reducers: {
    /**
     * Initialize the form with fields and default values
     */
    initForm: (
      state,
      action: PayloadAction<{
        fields: FormField[];
        defaultValues?: Record<string, JsonValue>;
        languageId?: number;
      }>,
    ) => {
      const { fields, defaultValues = {}, languageId = 1 } = action.payload;

      state.fields = {} as any;
      state.defaultValues = {} as any;
      state.languageId = languageId;

      const runtimeFields = state.fields as any;
      const runtimeDefaults = state.defaultValues as any;

      fields.forEach((field) => {
        const fieldId = field.field_id;
        const initialValue =
          defaultValues[fieldId.toString()] ?? field.default_value ?? null;

        // Store default value
        runtimeDefaults[fieldId] = initialValue;

        // Initialize field state
        runtimeFields[fieldId] = {
          fieldId,
          value: initialValue,
          error: null,
          touched: false,
          isValid: true,
          metadata: {
            isVisible: true,
            isDisabled: false,
            isReadOnly: false,
          },
        };
      });

      state.globalStatus = {
        ...initialState.globalStatus,
        isValid: true,
      };
    },

    /**
     * Update a single field's value
     */
    setFieldValue: (
      state,
      action: PayloadAction<{ fieldId: number; value: JsonValue }>,
    ) => {
      const { fieldId, value } = action.payload;
      if (state.fields[fieldId]) {
        (state.fields[fieldId] as any).value = value;
        // Reset error on change? Usually we validate on change or blur.
        // For now, let's keep the previous error until re-validated.
      }
    },

    /**
     * Update multiple fields at once
     */
    setFieldValues: (
      state,
      action: PayloadAction<Record<number, JsonValue>>,
    ) => {
      Object.entries(action.payload).forEach(([fieldId, value]) => {
        const id = Number(fieldId);
        if (state.fields[id]) {
          (state.fields[id] as any).value = value;
        }
      });
    },

    /**
     * Mark a field as touched
     */
    setFieldTouched: (
      state,
      action: PayloadAction<{ fieldId: number; touched: boolean }>,
    ) => {
      const { fieldId, touched } = action.payload;
      if (state.fields[fieldId]) {
        state.fields[fieldId].touched = touched;
      }
    },

    /**
     * Set validation error for a field
     */
    setFieldError: (
      state,
      action: PayloadAction<{ fieldId: number; error: string | null }>,
    ) => {
      const { fieldId, error } = action.payload;
      if (state.fields[fieldId]) {
        state.fields[fieldId].error = error;
        state.fields[fieldId].isValid = !error;
      }
    },

    /**
     * Set multiple validation errors
     */
    setFieldErrors: (
      state,
      action: PayloadAction<Record<number, string | null>>,
    ) => {
      Object.entries(action.payload).forEach(([fieldId, error]) => {
        const id = Number(fieldId);
        if (state.fields[id]) {
          state.fields[id].error = error;
          state.fields[id].isValid = !error;
        }
      });
    },

    /**
     * Update field metadata (visibility, disabled state, etc.)
     */
    setFieldMetadata: (
      state,
      action: PayloadAction<{
        fieldId: number;
        metadata: Partial<FieldMetadata>;
      }>,
    ) => {
      const { fieldId, metadata } = action.payload;
      if (state.fields[fieldId]) {
        state.fields[fieldId].metadata = {
          ...state.fields[fieldId].metadata,
          ...metadata,
        };
      }
    },

    /**
     * Reset a specific field to its default value
     */
    resetField: (state, action: PayloadAction<number>) => {
      const fieldId = action.payload;

      const fields = state.fields as any;
      const defaults = state.defaultValues as any;

      if (fields[fieldId]) {
        fields[fieldId].value = defaults[fieldId] ?? null;
        fields[fieldId].error = null;
        fields[fieldId].touched = false;
        fields[fieldId].isValid = true;
      }
    },

    resetForm: (state) => {
      const fields = state.fields as any;
      const defaults = state.defaultValues as any;

      Object.keys(fields).forEach((key) => {
        const fieldId = Number(key);
        fields[fieldId].value = defaults[fieldId] ?? null;
        fields[fieldId].error = null;
        fields[fieldId].touched = false;
        fields[fieldId].isValid = true;
      });

      state.globalStatus = { ...initialState.globalStatus };
    },

    /**
     * Start validation process (sets loading state)
     */
    startValidation: (state) => {
      state.globalStatus.isValidating = true;
    },

    /**
     * End validation process and update global validity
     */
    endValidation: (state, action: PayloadAction<{ isValid: boolean }>) => {
      state.globalStatus.isValidating = false;
      state.globalStatus.isValid = action.payload.isValid;
    },

    /**
     * Set submitting state
     */
    setSubmitting: (state, action: PayloadAction<boolean>) => {
      state.globalStatus.isSubmitting = action.payload;
      if (action.payload) {
        state.globalStatus.submitCount += 1;
      }
    },
  },
});

// =============================================================================
// ACTIONS
// =============================================================================

export const {
  initForm,
  setFieldValue,
  setFieldValues,
  setFieldTouched,
  setFieldError,
  setFieldErrors,
  setFieldMetadata,
  resetField,
  resetForm,
  startValidation,
  endValidation,
  setSubmitting,
} = formRuntimeSlice.actions;

// =============================================================================
// SELECTORS
// =============================================================================

const selectRuntimeState = (state: RootState) => state.formRuntime;

/**
 * Select all fields state
 */
export const selectAllFields = createSelector(
  selectRuntimeState,
  (state) => state.fields,
);

export const selectIsSubmitting = (state: RootState) =>
  state.formRuntime.globalStatus.isSubmitting;
export const selectSubmissionError = (state: RootState) =>
  state.formRuntime.globalStatus.submissionError;
export const selectLanguageId = (state: RootState) =>
  state.formRuntime.languageId;

/**
 * Select a specific field by ID
 */
export const selectFieldById = (fieldId: number) =>
  createSelector([selectAllFields], (fields) => fields[fieldId]);

/**
 * Select a specific field's value
 */
export const selectFieldValue = (fieldId: number) =>
  createSelector(selectFieldById(fieldId), (field) => field?.value);

/**
 * Select a specific field's error
 */
export const selectFieldError = (fieldId: number) =>
  createSelector(selectFieldById(fieldId), (field) => field?.error);

/**
 * Select field metadata
 */
export const selectFieldMetadata = (fieldId: number) =>
  createSelector(selectFieldById(fieldId), (field) => field?.metadata);

/**
 * Select global form status
 */
export const selectFormStatus = createSelector(
  selectRuntimeState,
  (state) => state.globalStatus,
);

/**
 * Select all field values as a simple object (useful for submission)
 */
export const selectFormValues = createSelector(selectAllFields, (fields) => {
  const values: Record<number, JsonValue> = {};
  Object.values(fields).forEach((field) => {
    values[field.fieldId] = field.value;
  });
  return values;
});

/**
 * Check if the form is dirty (values different from defaults)
 */
export const selectIsFormDirty = createSelector(
  [
    selectAllFields,
    (state: RootState) => selectRuntimeState(state).defaultValues,
  ],
  (fields, defaultValues) => {
    return Object.values(fields).some(
      (field) => field.value !== (defaultValues[field.fieldId] ?? null),
    );
  },
);

/**
 * Select valid fields count
 */
export const selectValidFieldsCount = createSelector(
  selectAllFields,
  (fields) => Object.values(fields).filter((f) => f.isValid).length,
);

export default formRuntimeSlice.reducer;
