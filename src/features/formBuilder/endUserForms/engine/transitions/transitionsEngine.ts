/**
 * ================================
 * TRANSITIONS ENGINE
 * ================================
 *
 * Responsible for resolving available form stage transitions.
 *
 * Key Responsibilities:
 * - Extract available transitions from form structure
 * - Evaluate transition visibility conditions
 * - Resolve which transitions are currently actionable
 * - Provide submit button metadata (label, disabled state)
 * - Handle transition-to-completion logic
 * - Determine default transition selection with clear priority rules
 *
 * Architecture Decisions:
 * - Uses visibilityEngine for condition evaluation
 * - Does NOT contain UI logic
 * - Returns transition metadata for UI consumption
 * - Integrates with form submission flow
 * - Pure functions with no side effects
 * - No debug logging (production-ready)
 *
 * Default Transition Selection:
 * Priority order (highest to lowest):
 * 1. Completion transitions (to_complete = true) - score: 100
 * 2. Forward progression (Next, Continue, Proceed, Submit) - score: 80
 * 3. Save/Draft actions - score: 60
 * 4. Backward navigation (Back, Previous, Return) - score: 50
 * 5. All others - score: 40
 *
 * Multiple Transitions Behavior:
 * - All visible transitions are available
 * - Primary transition is highest priority visible transition
 * - Submit button uses primary transition by default
 * - User can override by selecting a different transition
 */

import type { FormTransition } from '@/features/formBuilder/endUserForms/types/formStructure.types';
import type {
  ResolvedTransition,
  SubmitButtonState,
} from '@/features/formBuilder/endUserForms/types/runtime.types';
import { evaluateVisibilityCondition } from '../visibility/visibilityEngine';
import type { JsonValue } from '@/features/formBuilder/endUserForms/types/submitInitialForm.types';

// ================================
// TYPES
// ================================

/**
 * Result of transition resolution
 */
export interface TransitionsResolutionResult {
  availableTransitions: ResolvedTransition[];
  primaryTransition: ResolvedTransition | null;
  submitButtonState: SubmitButtonState;
  hasMultipleTransitions: boolean;
}

// ================================
// CORE TRANSITION EVALUATION
// ================================

/**
 * Evaluate if a transition condition is met
 * Uses the visibility engine since transition conditions use the same structure
 *
 * @param condition - Transition condition to evaluate
 * @param formValues - Current form field values
 * @returns True if condition is met (or no condition exists)
 */
const evaluateTransitionCondition = (
  condition: FormTransition['condition'],
  formValues: Record<number, JsonValue>
): boolean => {
  if (!condition || !condition.show_when) {
    return true;
  }

  const runtimeFieldValues: Record<number, { fieldId: number; value: JsonValue; error: string | null; touched: boolean; isValid: boolean }> = {};
  Object.entries(formValues).forEach(([fieldId, value]) => {
    runtimeFieldValues[Number(fieldId)] = {
      fieldId: Number(fieldId),
      value,
      error: null,
      touched: false,
      isValid: true,
    };
  });

  const visibilityResult = evaluateVisibilityCondition(
    { show_when: condition.show_when },
    runtimeFieldValues
  );

  return visibilityResult.isVisible;
};

/**
 * Calculate priority for transition sorting
 * Higher priority = shown first / used as primary
 *
 * Priority rules:
 * 1. Transitions to completion (submit/finish) = highest priority
 * 2. Named forward transitions (Next, Continue, etc.)
 * 3. Save/draft transitions
 * 4. Named backward transitions (Previous, Back, etc.)
 * 5. Others
 */
const calculateTransitionPriority = (transition: FormTransition): number => {
  if (transition.to_complete) {
    return 100;
  }

  const label = transition.label.toLowerCase();

  if (
    label.includes('next') ||
    label.includes('continue') ||
    label.includes('proceed') ||
    label.includes('submit')
  ) {
    return 80;
  }

  if (label.includes('save') || label.includes('draft')) {
    return 60;
  }

  if (
    label.includes('back') ||
    label.includes('previous') ||
    label.includes('return')
  ) {
    return 50;
  }

  return 40;
};

/**
 * Resolve a single transition with its current state
 *
 * @param transition - Raw transition from API
 * @param formValues - Current form field values
 * @param isFormValid - Whether form validation passes
 * @returns Resolved transition with computed state
 */
const resolveTransition = (
  transition: FormTransition,
  formValues: Record<number, JsonValue>,
  isFormValid: boolean
): ResolvedTransition => {
  const isVisible = evaluateTransitionCondition(transition.condition, formValues);

  const isDisabled = !isVisible || (transition.to_complete && !isFormValid);

  return {
    transitionId: transition.transition_id,
    label: transition.label,
    toStageId: transition.to_stage_id,
    toStageName: transition.to_stage_name,
    isComplete: transition.to_complete,
    isVisible,
    isDisabled,
  };
};

// ================================
// TRANSITION RESOLUTION
// ================================

/**
 * Resolve all available transitions for current form state
 *
 * This is the core function that determines:
 * - Which transitions are visible
 * - Which transitions are disabled
 * - Which transition is the primary/default
 * - Submit button state and label
 *
 * @param availableTransitions - Transitions from API response
 * @param formValues - Current form field values (keyed by field_id)
 * @param isFormValid - Whether form passes validation
 * @returns Resolved transitions with metadata
 */
export const resolveTransitions = (
  availableTransitions: FormTransition[],
  formValues: Record<number, JsonValue>,
  isFormValid: boolean
): TransitionsResolutionResult => {
  const resolvedTransitions = availableTransitions.map((transition) =>
    resolveTransition(transition, formValues, isFormValid)
  );

  const visibleTransitions = resolvedTransitions.filter((t) => t.isVisible);

  const sortedTransitions = [...visibleTransitions].sort((a, b) => {
    const aPriority = calculateTransitionPriority(
      availableTransitions.find((t) => t.transition_id === a.transitionId)!
    );
    const bPriority = calculateTransitionPriority(
      availableTransitions.find((t) => t.transition_id === b.transitionId)!
    );
    return bPriority - aPriority;
  });

  const primaryTransition = sortedTransitions[0] || null;

  const submitButtonState: SubmitButtonState = {
    availableTransitions: sortedTransitions,
    canSubmit: primaryTransition ? !primaryTransition.isDisabled : false,
    submitLabel: primaryTransition?.label || 'Submit',
    selectedTransitionId: primaryTransition?.transitionId || null,
  };

  return {
    availableTransitions: sortedTransitions,
    primaryTransition,
    submitButtonState,
    hasMultipleTransitions: visibleTransitions.length > 1,
  };
};

// ================================
// SUBMIT BUTTON UTILITIES
// ================================

/**
 * Get submit button state for UI rendering
 * Convenience function for components that only need button state
 *
 * @param availableTransitions - Transitions from API
 * @param formValues - Current form values
 * @param isFormValid - Form validation state
 * @param isSubmitting - Whether submission is in progress
 * @returns Submit button state
 */
export const getSubmitButtonState = (
  availableTransitions: FormTransition[],
  formValues: Record<number, JsonValue>,
  isFormValid: boolean,
  isSubmitting: boolean = false
): SubmitButtonState => {
  const result = resolveTransitions(availableTransitions, formValues, isFormValid);

  return {
    ...result.submitButtonState,
    canSubmit: result.submitButtonState.canSubmit && !isSubmitting,
  };
};

/**
 * Get primary transition for submission
 * Used by form submission handler to determine which transition to execute
 *
 * @param availableTransitions - Transitions from API
 * @param formValues - Current form values
 * @param isFormValid - Form validation state
 * @returns Primary transition or null if none available
 */
export const getPrimaryTransition = (
  availableTransitions: FormTransition[],
  formValues: Record<number, JsonValue>,
  isFormValid: boolean
): ResolvedTransition | null => {
  const result = resolveTransitions(availableTransitions, formValues, isFormValid);
  return result.primaryTransition;
};

/**
 * Check if form has completion transition available
 * Useful for determining if this is the final stage
 *
 * @param availableTransitions - Transitions from API
 * @returns True if any transition leads to completion
 */
export const hasCompletionTransition = (
  availableTransitions: FormTransition[]
): boolean => {
  return availableTransitions.some((t) => t.to_complete);
};

/**
 * Get all visible transition labels for UI display
 * Useful for showing multiple action buttons
 *
 * @param availableTransitions - Transitions from API
 * @param formValues - Current form values
 * @param isFormValid - Form validation state
 * @returns Array of transition labels
 */
export const getVisibleTransitionLabels = (
  availableTransitions: FormTransition[],
  formValues: Record<number, JsonValue>,
  isFormValid: boolean
): string[] => {
  const result = resolveTransitions(availableTransitions, formValues, isFormValid);
  return result.availableTransitions.map((t) => t.label);
};

// ================================
// TRANSITION ACTIONS
// ================================

/**
 * Find transition by ID
 * Used when user clicks a specific transition button
 *
 * @param availableTransitions - Transitions from API
 * @param transitionId - ID of transition to find
 * @returns Transition or null if not found
 */
export const findTransitionById = (
  availableTransitions: FormTransition[],
  transitionId: number
): FormTransition | null => {
  return availableTransitions.find((t) => t.transition_id === transitionId) || null;
};

/**
 * Validate if transition can be executed
 * Checks both visibility and validation requirements
 *
 * @param transition - Transition to validate
 * @param formValues - Current form values
 * @param isFormValid - Form validation state
 * @returns Validation result with reason if invalid
 */
export const validateTransitionExecution = (
  transition: FormTransition,
  formValues: Record<number, JsonValue>,
  isFormValid: boolean
): { valid: boolean; reason?: string } => {
  const isVisible = evaluateTransitionCondition(transition.condition, formValues);

  if (!isVisible) {
    return {
      valid: false,
      reason: 'Transition conditions not met',
    };
  }

  if (transition.to_complete && !isFormValid) {
    return {
      valid: false,
      reason: 'Please fix form errors before submitting',
    };
  }

  return { valid: true };
};
