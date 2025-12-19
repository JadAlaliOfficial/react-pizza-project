/**
 * ================================
 * RUNTIME FORM - TYPE DEFINITIONS
 * ================================
 *
 * This file defines all runtime-specific types for the dynamic form system.
 * These types complement the immutable API types and define the runtime state,
 * validation, visibility, and UI contracts.
 *
 * Responsibilities:
 * - Runtime form state (field values, errors, touched state)
 * - Language and RTL configuration types
 * - Visibility engine contracts
 * - Validation engine contracts
 * - Field registry contracts
 * - Transition resolution types
 *
 * Architecture decisions:
 * - Separates runtime concerns from API types (immutable files)
 * - Uses discriminated unions for type-safe engine results
 * - Maintains strict typing for all dynamic form behaviors
 * - Centralizes language/RTL configuration
 */

import type { JsonValue } from '@/features/formBuilder/endUserForms/types/submitInitialForm.types';
import type {
  FormField,
  FormSection,
  FieldVisibilityCondition,
  TransitionCondition,
} from '@/features/formBuilder/endUserForms/types/formStructure.types';

// =============================================================================
// LANGUAGE & RTL CONFIGURATION
// =============================================================================

/**
 * Supported language IDs matching the API contract
 * 1 = English, 2 = Arabic, 3 = Spanish
 */
export type LanguageId = 1 | 2 | 3;

/**
 * Text direction for UI rendering
 */
export type Direction = 'ltr' | 'rtl';

/**
 * Language configuration with display metadata
 */
export interface LanguageConfig {
  id: LanguageId;
  code: string;
  name: string;
  direction: Direction;
}

/**
 * Map of language ID to configuration
 */
export const LANGUAGE_MAP: Record<LanguageId, LanguageConfig> = {
  1: { id: 1, code: 'en', name: 'English', direction: 'ltr' },
  2: { id: 2, code: 'ar', name: 'العربية', direction: 'rtl' },
  3: { id: 3, code: 'es', name: 'Español', direction: 'ltr' },
};

// =============================================================================
// RUNTIME FORM STATE
// =============================================================================

/**
 * Runtime value for a single field
 * Tracks the current value, validation state, and user interaction
 */
export interface RuntimeFieldValue {
  fieldId: number;
  value: JsonValue;
  error: string | null;
  touched: boolean;
  isValid: boolean;
}

/**
 * Map of field ID to runtime field value
 * This is the single source of truth for all field values in the runtime form
 */
export type RuntimeFieldValues = Record<number, RuntimeFieldValue>;

/**
 * Overall form validation state
 */
export interface FormValidationState {
  isValid: boolean;
  isValidating: boolean;
  fieldErrors: Record<number, string>;
  globalErrors: string[];
}

/**
 * Runtime form state managed by the main runtime hook
 */
export interface RuntimeFormState {
  fieldValues: RuntimeFieldValues;
  validationState: FormValidationState;
  isSubmitting: boolean;
  selectedTransitionId: number | null;
  language: LanguageConfig;
}

// =============================================================================
// VISIBILITY ENGINE
// =============================================================================

/**
 * Result of visibility evaluation for a single entity (field, section, transition)
 */
export interface VisibilityResult {
  isVisible: boolean;
  reason?: string;
}

/**
 * Visibility evaluation context
 * Contains all data needed to evaluate visibility conditions
 */
export interface VisibilityContext {
  fieldValues: RuntimeFieldValues;
  condition: FieldVisibilityCondition | TransitionCondition | null;
}

/**
 * Visibility map for quick lookups
 */
export interface VisibilityMap {
  fields: Record<number, boolean>;
  sections: Record<number, boolean>;
  transitions: Record<number, boolean>;
}

// =============================================================================
// VALIDATION ENGINE
// =============================================================================

/**
 * Validation rule operator types
 * These match the API rule_name values
 */
export type ValidationOperator =
  | 'required'
  | 'minlength'
  | 'maxlength'
  | 'min'
  | 'max'
  | 'pattern'
  | 'email'
  | 'url'
  | 'numeric'
  | 'alpha'
  | 'alphanumeric'
  | 'same'
  | 'different'
  | 'in'
  | 'not_in'
  | 'date_before'
  | 'date_after'
  | 'file_maxsize'
  | 'file_minsize'
  | 'file_types'
  | 'image_dimensions';

/**
 * Validation error with field reference
 */
export interface ValidationError {
  fieldId: number;
  message: string;
  ruleName: string;
}

/**
 * Validation result for a single field
 */
export interface FieldValidationResult {
  fieldId: number;
  isValid: boolean;
  errors: string[];
}

/**
 * Validation result for entire form
 */
export interface FormValidationResult {
  isValid: boolean;
  fieldResults: Record<number, FieldValidationResult>;
  globalErrors: string[];
}

/**
 * Validation context for cross-field validation
 */
export interface ValidationContext {
  fieldValues: RuntimeFieldValues;
  allFields: FormField[];
  visibilityMap: VisibilityMap;
}

// =============================================================================
// FIELD REGISTRY
// =============================================================================

/**
 * Props passed to every field component
 * Field components must not contain business logic - they only render and emit changes
 */
export interface RuntimeFieldProps {
  field: FormField;
  value: JsonValue;
  error: string | null;
  touched: boolean;
  disabled: boolean;
  onChange: (fieldId: number, value: JsonValue) => void;
  onBlur: (fieldId: number) => void;
  direction: Direction;
  languageId?: number;
}

/**
 * Field component type
 */
export type RuntimeFieldComponent = React.ComponentType<RuntimeFieldProps>;

/**
 * Field registry maps field_type_id to component
 * This enables dynamic field rendering based on API schema
 */
export type FieldRegistry = Record<number, RuntimeFieldComponent>;

// =============================================================================
// TRANSITION RESOLUTION
// =============================================================================

/**
 * Resolved transition with visibility applied
 */
export interface ResolvedTransition {
  transitionId: number;
  label: string;
  toStageId: number | null;
  toStageName: string | null;
  isComplete: boolean;
  isVisible: boolean;
  isDisabled: boolean;
}

/**
 * Submit button state derived from transitions
 */
export interface SubmitButtonState {
  availableTransitions: ResolvedTransition[];
  canSubmit: boolean;
  submitLabel: string;
  selectedTransitionId: number | null;
}

// =============================================================================
// POLICY CONFIGURATION
// =============================================================================

/**
 * Policy for handling hidden field values during submission
 *
 * PRESERVE: Keep hidden field values in submission (default)
 * - Hidden fields are included with their current values
 * - Use when hidden fields represent conditional data that should persist
 *
 * CLEAR: Remove hidden field values from submission
 * - Hidden fields are excluded from the submission payload
 * - Use when hidden fields represent truly optional conditional data
 *
 * DEFAULT: Reset hidden field values to their default_value
 * - Hidden fields are included but with their original default values
 * - Use when hidden fields should revert to initial state when not visible
 */
export const HiddenFieldPolicy = {
  PRESERVE: 'PRESERVE',
  CLEAR: 'CLEAR',
  DEFAULT: 'DEFAULT',
} as const;

export type HiddenFieldPolicy =
  (typeof HiddenFieldPolicy)[keyof typeof HiddenFieldPolicy];

/**
 * Active policy for the application
 * This constant defines the behavior - change it to switch policies globally
 */
export const ACTIVE_HIDDEN_FIELD_POLICY: HiddenFieldPolicy =
  HiddenFieldPolicy.PRESERVE;

// =============================================================================
// ENGINE CONFIGURATION
// =============================================================================

/**
 * Configuration for visibility engine
 */
export interface VisibilityEngineConfig {
  enableLogging: boolean;
}

/**
 * Configuration for validation engine
 */
export interface ValidationEngineConfig {
  validateOnChange: boolean;
  validateOnBlur: boolean;
  enableLogging: boolean;
}

/**
 * Global runtime form configuration
 */
export interface RuntimeFormConfig {
  visibilityEngine: VisibilityEngineConfig;
  validationEngine: ValidationEngineConfig;
  hiddenFieldPolicy: HiddenFieldPolicy;
}

// =============================================================================
// HOOK RETURN TYPES
// =============================================================================

/**
 * Return type for the main runtime form hook
 * This is the primary interface between the runtime engine and UI components
 */
export interface UseRuntimeFormReturn {
  // State
  formState: RuntimeFormState;
  visibilityMap: VisibilityMap;
  validationState: FormValidationState;

  // Field operations
  getFieldValue: (fieldId: number) => JsonValue;
  setFieldValue: (fieldId: number, value: JsonValue) => void;
  setFieldTouched: (fieldId: number) => void;
  getFieldError: (fieldId: number) => string | null;

  // Visibility queries
  isFieldVisible: (fieldId: number) => boolean;
  isSectionVisible: (sectionId: number) => boolean;
  isTransitionVisible: (transitionId: number) => boolean;

  // Validation
  validateField: (fieldId: number) => Promise<FieldValidationResult>;
  validateForm: () => Promise<FormValidationResult>;

  // Transitions
  submitButtonState: SubmitButtonState;
  selectTransition: (transitionId: number) => void;

  // Form submission
  handleSubmit: () => Promise<void>;

  // Form state
  isFormValid: boolean;
  isFormDirty: boolean;
  canSubmit: boolean;
  languageId: LanguageId;
}

// =============================================================================
// UTILITY TYPES
// =============================================================================

/**
 * Normalized section with runtime visibility applied
 */
export interface RuntimeSection {
  section: FormSection;
  isVisible: boolean;
  visibleFields: FormField[];
}

/**
 * Normalized stage with runtime visibility applied
 */
export interface RuntimeStage {
  sections: RuntimeSection[];
  visibleTransitions: ResolvedTransition[];
}
