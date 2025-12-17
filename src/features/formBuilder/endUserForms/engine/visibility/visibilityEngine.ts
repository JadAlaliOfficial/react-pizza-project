/**
 * ================================
 * VISIBILITY ENGINE
 * ================================
 * 
 * Centralized engine for evaluating visibility conditions across the form.
 * This engine determines whether fields, sections, and transitions should be
 * visible based on their visibility conditions and current field values.
 * 
 * Responsibilities:
 * - Evaluate simple visibility conditions (single field comparisons)
 * - Evaluate complex visibility conditions (AND/OR logic combinations)
 * - Build visibility maps for efficient lookups
 * - Handle edge cases (null conditions, missing fields, invalid values)
 * 
 * Architecture decisions:
 * - Pure functions with no side effects - all inputs explicit
 * - Stateless - does not maintain internal state
 * - Type-safe with exhaustive operator handling
 * - Centralized logic - UI components never evaluate visibility
 * - Null-safe with defensive programming
 * 
 * Visibility Policy:
 * - No condition (null) = always visible
 * - Invalid condition = visible (fail open for UX)
 * - Missing referenced field = condition fails (hidden)
 * - Comparison operators: equals, not_equals, greater_than, less_than, 
 *   greater_than_or_equal, less_than_or_equal, contains, not_contains,
 *   in, not_in, empty, not_empty
 */

import type {
  SimpleVisibilityCondition,
  ComplexVisibilityCondition,
  FieldVisibilityCondition,
  TransitionCondition,
} from '@/features/formBuilder/endUserForms/types/formStructure.types';

import type {
  RuntimeFieldValues,
  VisibilityResult,
  VisibilityMap,
} from '../../types/runtime.types';

import type { JsonValue } from '@/features/formBuilder/endUserForms/types/submitInitialForm.types';

// =============================================================================
// CONFIGURATION
// =============================================================================

/**
 * Enable detailed logging for visibility evaluations
 * Set to false in production to reduce console noise
 */
const ENABLE_LOGGING = process.env.NODE_ENV === 'development';

/**
 * Logger utility
 */
const log = {
  debug: (message: string, ...args: unknown[]) => {
    if (ENABLE_LOGGING) {
      console.debug(`[VisibilityEngine] ${message}`, ...args);
    }
  },
  warn: (message: string, ...args: unknown[]) => {
    if (ENABLE_LOGGING) {
      console.warn(`[VisibilityEngine] ${message}`, ...args);
    }
  },
};

// =============================================================================
// VALUE COMPARISON UTILITIES
// =============================================================================

/**
 * Normalize a value for comparison
 * Handles null, undefined, and type coercion
 */
function normalizeValue(value: JsonValue): string | number | boolean | null {
  if (value === null || value === undefined) {
    return null;
  }
  
  // Handle arrays - convert to string for comparison
  if (Array.isArray(value)) {
    return JSON.stringify(value);
  }
  
  // Handle objects - convert to string for comparison
  if (typeof value === 'object') {
    return JSON.stringify(value);
  }
  
  return value;
}

/**
 * Check if a value is considered "empty"
 * Empty = null, undefined, empty string, empty array, empty object
 */
function isEmpty(value: JsonValue): boolean {
  if (value === null || value === undefined) {
    return true;
  }
  
  if (typeof value === 'string') {
    return value.trim() === '';
  }
  
  if (Array.isArray(value)) {
    return value.length === 0;
  }
  
  if (typeof value === 'object') {
    return Object.keys(value).length === 0;
  }
  
  return false;
}

/**
 * Check if an array contains a value
 */
function arrayContains(arr: JsonValue, value: JsonValue): boolean {
  if (!Array.isArray(arr)) {
    return false;
  }
  
  const normalizedValue = normalizeValue(value);
  return arr.some(item => normalizeValue(item) === normalizedValue);
}

/**
 * Check if a string contains a substring (case-insensitive)
 */
function stringContains(haystack: JsonValue, needle: JsonValue): boolean {
  const haystackStr = String(haystack || '').toLowerCase();
  const needleStr = String(needle || '').toLowerCase();
  return haystackStr.includes(needleStr);
}

// =============================================================================
// OPERATOR EVALUATION
// =============================================================================

/**
 * Evaluate a single comparison operation
 * 
 * @param fieldValue - Current value of the field being checked
 * @param operator - Comparison operator (equals, greater_than, etc.)
 * @param conditionValue - Expected value from the condition
 * @returns true if condition passes, false otherwise
 */
function evaluateOperator(
  fieldValue: JsonValue,
  operator: string,
  conditionValue: string | number | null
): boolean {
  const normalizedFieldValue = normalizeValue(fieldValue);
  const normalizedConditionValue = normalizeValue(conditionValue);
  
  switch (operator.toLowerCase()) {
    case 'equals':
    case '==':
    case '===':
      return normalizedFieldValue === normalizedConditionValue;
    
    case 'not_equals':
    case '!=':
    case '!==':
      return normalizedFieldValue !== normalizedConditionValue;
    
    case 'greater_than':
    case '>':
      if (typeof normalizedFieldValue === 'number' && typeof normalizedConditionValue === 'number') {
        return normalizedFieldValue > normalizedConditionValue;
      }
      return false;
    
    case 'greater_than_or_equal':
    case '>=':
      if (typeof normalizedFieldValue === 'number' && typeof normalizedConditionValue === 'number') {
        return normalizedFieldValue >= normalizedConditionValue;
      }
      return false;
    
    case 'less_than':
    case '<':
      if (typeof normalizedFieldValue === 'number' && typeof normalizedConditionValue === 'number') {
        return normalizedFieldValue < normalizedConditionValue;
      }
      return false;
    
    case 'less_than_or_equal':
    case '<=':
      if (typeof normalizedFieldValue === 'number' && typeof normalizedConditionValue === 'number') {
        return normalizedFieldValue <= normalizedConditionValue;
      }
      return false;
    
    case 'contains':
      if (Array.isArray(fieldValue)) {
        return arrayContains(fieldValue, conditionValue);
      }
      return stringContains(fieldValue, conditionValue);
    
    case 'not_contains':
      if (Array.isArray(fieldValue)) {
        return !arrayContains(fieldValue, conditionValue);
      }
      return !stringContains(fieldValue, conditionValue);
    
    case 'in':
      // Check if fieldValue is in the conditionValue array
      if (Array.isArray(conditionValue)) {
        return arrayContains(conditionValue, fieldValue);
      }
      return false;
    
    case 'not_in':
      if (Array.isArray(conditionValue)) {
        return !arrayContains(conditionValue, fieldValue);
      }
      return true;
    
    case 'empty':
      return isEmpty(fieldValue);
    
    case 'not_empty':
      return !isEmpty(fieldValue);
    
    default:
      log.warn(`Unknown operator: ${operator}, defaulting to false`);
      return false;
  }
}

// =============================================================================
// CONDITION EVALUATION
// =============================================================================

/**
 * Evaluate a simple visibility condition (single field check)
 * 
 * @param condition - Simple condition with field_id, operator, and value
 * @param fieldValues - Current runtime field values
 * @returns true if condition passes (should be visible)
 */
function evaluateSimpleCondition(
  condition: SimpleVisibilityCondition,
  fieldValues: RuntimeFieldValues
): boolean {
  const { field_id, operator, value: conditionValue } = condition;
  
  // Check if the referenced field exists
  const fieldValue = fieldValues[field_id];
  if (!fieldValue) {
    log.debug(`Field ${field_id} not found, condition fails`);
    return false;
  }
  
  // Evaluate the operator
  const result = evaluateOperator(fieldValue.value, operator, conditionValue);
  
  log.debug(
    `Simple condition: field ${field_id} ${operator} ${conditionValue} = ${result}`,
    { fieldValue: fieldValue.value }
  );
  
  return result;
}

/**
 * Evaluate a complex visibility condition (AND/OR logic)
 * 
 * @param condition - Complex condition with logic and array of conditions
 * @param fieldValues - Current runtime field values
 * @returns true if condition passes (should be visible)
 */
function evaluateComplexCondition(
  condition: ComplexVisibilityCondition,
  fieldValues: RuntimeFieldValues
): boolean {
  const { logic, conditions } = condition;
  
  if (!conditions || conditions.length === 0) {
    log.warn('Complex condition has no sub-conditions, defaulting to visible');
    return true;
  }
  
  const results = conditions.map(subCondition =>
    evaluateSimpleCondition(subCondition, fieldValues)
  );
  
  let finalResult: boolean;
  
  if (logic === 'and') {
    // All conditions must pass
    finalResult = results.every(r => r === true);
  } else if (logic === 'or') {
    // At least one condition must pass
    finalResult = results.some(r => r === true);
  } else {
    log.warn(`Unknown logic operator: ${logic}, defaulting to AND`);
    finalResult = results.every(r => r === true);
  }
  
  log.debug(
    `Complex condition (${logic.toUpperCase()}): ${results.length} conditions = ${finalResult}`,
    { results }
  );
  
  return finalResult;
}

/**
 * Evaluate a visibility condition (simple or complex)
 * This is the main entry point for visibility evaluation
 * 
 * @param condition - Field or transition visibility condition
 * @param fieldValues - Current runtime field values
 * @returns VisibilityResult with isVisible flag and optional reason
 */
export function evaluateVisibilityCondition(
  condition: FieldVisibilityCondition | TransitionCondition | null,
  fieldValues: RuntimeFieldValues
): VisibilityResult {
  // No condition = always visible
  if (!condition) {
    return { isVisible: true, reason: 'No condition' };
  }
  
  // Extract show_when from wrapper
  const showWhen = condition.show_when;
  
  // Null show_when = always visible
  if (!showWhen) {
    return { isVisible: true, reason: 'No show_when clause' };
  }
  
  try {
    // Type guard: Check if complex condition
    if ('logic' in showWhen && 'conditions' in showWhen) {
      const isVisible = evaluateComplexCondition(
        showWhen as ComplexVisibilityCondition,
        fieldValues
      );
      return {
        isVisible,
        reason: isVisible ? 'Complex condition passed' : 'Complex condition failed',
      };
    }
    
    // Type guard: Check if simple condition
    if ('field_id' in showWhen && 'operator' in showWhen) {
      const isVisible = evaluateSimpleCondition(
        showWhen as SimpleVisibilityCondition,
        fieldValues
      );
      return {
        isVisible,
        reason: isVisible ? 'Simple condition passed' : 'Simple condition failed',
      };
    }
    
    // Invalid condition structure
    log.warn('Invalid condition structure, defaulting to visible', showWhen);
    return { isVisible: true, reason: 'Invalid condition structure' };
  } catch (error) {
    log.warn('Error evaluating condition, defaulting to visible', error);
    return { isVisible: true, reason: 'Error during evaluation' };
  }
}

// =============================================================================
// VISIBILITY MAP BUILDER
// =============================================================================

/**
 * Build a complete visibility map for all entities in the form
 * This provides O(1) lookup for visibility checks in UI components
 * 
 * @param fields - Array of all form fields
 * @param sections - Array of all form sections
 * @param transitions - Array of all form transitions
 * @param fieldValues - Current runtime field values
 * @returns VisibilityMap with visibility state for all entities
 */
export function buildVisibilityMap(
  fields: Array<{ field_id: number; visibility_condition: FieldVisibilityCondition }>,
  sections: Array<{ section_id: number; visibility_condition: FieldVisibilityCondition }>,
  transitions: Array<{ transition_id: number; condition: TransitionCondition | null }>,
  fieldValues: RuntimeFieldValues
): VisibilityMap {
  log.debug('Building visibility map', {
    fieldCount: fields.length,
    sectionCount: sections.length,
    transitionCount: transitions.length,
  });
  
  const map: VisibilityMap = {
    fields: {},
    sections: {},
    transitions: {},
  };
  
  // Evaluate field visibility
  for (const field of fields) {
    const result = evaluateVisibilityCondition(field.visibility_condition, fieldValues);
    map.fields[field.field_id] = result.isVisible;
  }
  
  // Evaluate section visibility
  for (const section of sections) {
    const result = evaluateVisibilityCondition(section.visibility_condition, fieldValues);
    map.sections[section.section_id] = result.isVisible;
  }
  
  // Evaluate transition visibility
  for (const transition of transitions) {
    const result = evaluateVisibilityCondition(transition.condition, fieldValues);
    map.transitions[transition.transition_id] = result.isVisible;
  }
  
  log.debug('Visibility map built', {
    visibleFields: Object.values(map.fields).filter(Boolean).length,
    visibleSections: Object.values(map.sections).filter(Boolean).length,
    visibleTransitions: Object.values(map.transitions).filter(Boolean).length,
  });
  
  return map;
}

// =============================================================================
// EXPORTED API
// =============================================================================

/**
 * Visibility engine public API
 */
export const visibilityEngine = {
  /**
   * Evaluate a single visibility condition
   */
  evaluate: evaluateVisibilityCondition,
  
  /**
   * Build a complete visibility map for the form
   */
  buildMap: buildVisibilityMap,
  
  /**
   * Utility: Check if a value is empty
   */
  isEmpty,
};
