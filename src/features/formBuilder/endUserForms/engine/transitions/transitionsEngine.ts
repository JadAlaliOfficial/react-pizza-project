/**
 * ================================
 * TRANSITIONS ENGINE
 * ================================
 * Responsible for resolving available form stage transitions
 *
 * Key Responsibilities:
 * - Extract available transitions from form structure
 * - Evaluate transition visibility conditions
 * - Resolve which transitions are currently actionable
 * - Provide submit button metadata (label, disabled state)
 * - Handle transition-to-completion logic
 *
 * Architecture Notes:
 * - Uses visibilityEngine for condition evaluation
 * - Does NOT contain UI logic
 * - Returns transition metadata for UI consumption
 * - Integrates with form submission flow
 */

import type { FormTransition } from '@/features/formBuilder/endUserForms/types/formStructure.types';
import type {
  ResolvedTransition,
  SubmitButtonState,
} from '@/features/formBuilder/endUserForms/types/runtime.types';
import { evaluateVisibilityCondition } from '../visibility/visibilityEngine';

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
  formValues: Record<number, any>,
): boolean => {
  // No condition = always visible
  if (!condition || !condition.show_when) {
    return true;
  }

  // Delegate to visibility engine (conditions use same structure)
  // Wrap in the expected structure
  const visibilityResult = evaluateVisibilityCondition(
    { show_when: condition.show_when },
    formValues,
  );

  // Extract boolean from VisibilityResult
  return visibilityResult.isVisible;
};

/**
 * Calculate priority for transition sorting
 * Higher priority = shown first / used as primary
 *
 * Priority rules:
 * 1. Transitions to completion (submit/finish) = highest
 * 2. Named forward transitions (Next, Continue, etc.)
 * 3. Named backward transitions (Previous, Back, etc.)
 * 4. Others
 */
const calculateTransitionPriority = (transition: FormTransition): number => {
  // Completion transitions are highest priority
  if (transition.to_complete) {
    return 100;
  }

  // Check label keywords for priority hints
  const label = transition.label.toLowerCase();

  // Forward progression keywords
  if (
    label.includes('next') ||
    label.includes('continue') ||
    label.includes('proceed') ||
    label.includes('submit')
  ) {
    return 80;
  }

  // Backward navigation keywords
  if (
    label.includes('back') ||
    label.includes('previous') ||
    label.includes('return')
  ) {
    return 50;
  }

  // Save/draft keywords
  if (label.includes('save') || label.includes('draft')) {
    return 60;
  }

  // Default priority
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
  formValues: Record<number, any>,
  isFormValid: boolean,
): ResolvedTransition => {
  // Evaluate visibility condition
  const isVisible = evaluateTransitionCondition(
    transition.condition,
    formValues,
  );

  // Determine if disabled
  // Transition is disabled if:
  // 1. It's not visible (shouldn't happen in UI, but defensive)
  // 2. Form validation fails for completion transitions
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
 * @param availableTransitions - Transitions from API response
 * @param formValues - Current form field values (keyed by field_id)
 * @param isFormValid - Whether form passes validation
 * @returns Resolved transitions with metadata
 */
export const resolveTransitions = (
  availableTransitions: FormTransition[],
  formValues: Record<number, any>,
  isFormValid: boolean,
): TransitionsResolutionResult => {
  // Resolve each transition
  const resolvedTransitions = availableTransitions.map((transition) =>
    resolveTransition(transition, formValues, isFormValid),
  );

  // Filter to only visible transitions
  const visibleTransitions = resolvedTransitions.filter((t) => t.isVisible);

  // Sort by priority (highest first)
  // Note: We temporarily add priority for sorting, but it's not in the ResolvedTransition type
  const sortedTransitions = [...visibleTransitions].sort((a, b) => {
    const aPriority = calculateTransitionPriority(
      availableTransitions.find((t) => t.transition_id === a.transitionId)!,
    );
    const bPriority = calculateTransitionPriority(
      availableTransitions.find((t) => t.transition_id === b.transitionId)!,
    );
    return bPriority - aPriority;
  });

  // Primary transition is the highest priority visible transition
  const primaryTransition = sortedTransitions[0] || null;

  // Generate submit button state
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
  formValues: Record<number, any>,
  isFormValid: boolean,
  isSubmitting: boolean = false,
): SubmitButtonState => {
  const result = resolveTransitions(
    availableTransitions,
    formValues,
    isFormValid,
  );

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
  formValues: Record<number, any>,
  isFormValid: boolean,
): ResolvedTransition | null => {
  const result = resolveTransitions(
    availableTransitions,
    formValues,
    isFormValid,
  );
  return result.primaryTransition;
};

/**
 * Check if form has completion transition available
 * Useful for determining if this is the final stage
 *
 * @param availableTransitions - Transitions from API
 * @returns True if any visible transition leads to completion
 */
export const hasCompletionTransition = (
  availableTransitions: FormTransition[],
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
  formValues: Record<number, any>,
  isFormValid: boolean,
): string[] => {
  const result = resolveTransitions(
    availableTransitions,
    formValues,
    isFormValid,
  );
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
  transitionId: number,
): FormTransition | null => {
  return (
    availableTransitions.find((t) => t.transition_id === transitionId) || null
  );
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
  formValues: Record<number, any>,
  isFormValid: boolean,
): { valid: boolean; reason?: string } => {
  // Check visibility condition
  const isVisible = evaluateTransitionCondition(
    transition.condition,
    formValues,
  );
  if (!isVisible) {
    return {
      valid: false,
      reason: 'Transition conditions not met',
    };
  }

  // Check validation for completion transitions
  if (transition.to_complete && !isFormValid) {
    return {
      valid: false,
      reason: 'Please fix form errors before submitting',
    };
  }

  return { valid: true };
};

// ================================
// DEBUG UTILITIES
// ================================

/**
 * Log transition resolution for debugging
 * Only logs in development mode
 *
 * @param result - Transition resolution result
 */
export const debugTransitions = (result: TransitionsResolutionResult): void => {
  if (process.env.NODE_ENV !== 'development') {
    return;
  }

  console.group('[TransitionsEngine] Resolution Result');
  console.log('Available Transitions:', result.availableTransitions.length);
  console.log('Primary Transition:', result.primaryTransition?.label || 'None');
  console.log('Submit Button:', result.submitButtonState);
  console.log('Has Multiple:', result.hasMultipleTransitions);

  result.availableTransitions.forEach((t, index) => {
    console.log(`  ${index + 1}. [${t.transitionId}] ${t.label}`, {
      disabled: t.isDisabled,
      toComplete: t.isComplete,
    });
  });

  console.groupEnd();
};
