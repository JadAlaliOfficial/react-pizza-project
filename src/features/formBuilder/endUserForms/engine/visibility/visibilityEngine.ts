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
// VALUE COMPARISON UTILITIES
// =============================================================================

function normalizeValue(value: JsonValue): string | number | boolean | null {
  if (value === null || value === undefined) return null;

  if (Array.isArray(value)) return JSON.stringify(value);
  if (typeof value === 'object') return JSON.stringify(value);

  return value;
}

function isEmpty(value: JsonValue): boolean {
  if (value === null || value === undefined) return true;

  if (typeof value === 'string') return value.trim() === '';
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'object') return Object.keys(value).length === 0;

  return false;
}

function arrayContains(arr: JsonValue, value: JsonValue): boolean {
  if (!Array.isArray(arr)) return false;

  const normalizedValue = normalizeValue(value);
  return arr.some((item) => normalizeValue(item) === normalizedValue);
}

function stringContains(haystack: JsonValue, needle: JsonValue): boolean {
  const haystackStr = String(haystack ?? '').toLowerCase();
  const needleStr = String(needle ?? '').toLowerCase();
  return haystackStr.includes(needleStr);
}

function stringStartsWith(haystack: JsonValue, needle: JsonValue): boolean {
  const haystackStr = String(haystack ?? '').toLowerCase();
  const needleStr = String(needle ?? '').toLowerCase();
  return haystackStr.startsWith(needleStr);
}

function stringEndsWith(haystack: JsonValue, needle: JsonValue): boolean {
  const haystackStr = String(haystack ?? '').toLowerCase();
  const needleStr = String(needle ?? '').toLowerCase();
  return haystackStr.endsWith(needleStr);
}

// =============================================================================
// OPERATOR EVALUATION
// =============================================================================

function evaluateOperator(
  fieldValue: JsonValue,
  operator: string,
  conditionValue: JsonValue,
): boolean {
  const op = operator.toLowerCase();

  const normalizedFieldValue = normalizeValue(fieldValue);
  const normalizedConditionValue = normalizeValue(conditionValue);

  switch (op) {
    // Equality
    case 'equals':
    case '==':
    case '===':
      return normalizedFieldValue === normalizedConditionValue;

    case 'not_equals':
    case '!=':
    case '!==':
      return normalizedFieldValue !== normalizedConditionValue;

    // Numeric comparisons
    case 'greater_than':
    case '>': {
      if (
        typeof normalizedFieldValue === 'number' &&
        typeof normalizedConditionValue === 'number'
      ) {
        return normalizedFieldValue > normalizedConditionValue;
      }
      return false;
    }

    // Backend: greater_or_equal | Legacy: greater_than_or_equal
    case 'greater_or_equal':
    case 'greater_than_or_equal':
    case '>=': {
      if (
        typeof normalizedFieldValue === 'number' &&
        typeof normalizedConditionValue === 'number'
      ) {
        return normalizedFieldValue >= normalizedConditionValue;
      }
      return false;
    }

    case 'less_than':
    case '<': {
      if (
        typeof normalizedFieldValue === 'number' &&
        typeof normalizedConditionValue === 'number'
      ) {
        return normalizedFieldValue < normalizedConditionValue;
      }
      return false;
    }

    // Backend: less_or_equal | Legacy: less_than_or_equal
    case 'less_or_equal':
    case 'less_than_or_equal':
    case '<=': {
      if (
        typeof normalizedFieldValue === 'number' &&
        typeof normalizedConditionValue === 'number'
      ) {
        return normalizedFieldValue <= normalizedConditionValue;
      }
      return false;
    }

    // Contains
    case 'contains':
      if (Array.isArray(fieldValue))
        return arrayContains(fieldValue, conditionValue);
      return stringContains(fieldValue, conditionValue);

    case 'not_contains':
      if (Array.isArray(fieldValue))
        return !arrayContains(fieldValue, conditionValue);
      return !stringContains(fieldValue, conditionValue);

    // Starts/Ends
    case 'starts_with':
      return stringStartsWith(fieldValue, conditionValue);

    case 'ends_with':
      return stringEndsWith(fieldValue, conditionValue);

    // Membership
    case 'in': {
      // fieldValue IN conditionValue[]
      if (Array.isArray(conditionValue))
        return arrayContains(conditionValue, fieldValue);
      return false;
    }

    case 'not_in': {
      if (Array.isArray(conditionValue))
        return !arrayContains(conditionValue, fieldValue);
      return false;
    }

    // Empty / Filled
    case 'empty':
      return isEmpty(fieldValue);

    case 'filled':
    case 'not_empty': // legacy alias
      return !isEmpty(fieldValue);

    default:
      // IMPORTANT: invalid operator should fail open per your policy.
      // Throw so evaluateVisibilityCondition catches and returns visible.
      throw new Error(`Unknown visibility operator: ${operator}`);
  }
}

// =============================================================================
// CONDITION EVALUATION
// =============================================================================

function evaluateSimpleCondition(
  condition: SimpleVisibilityCondition,
  fieldValues: RuntimeFieldValues,
): boolean {
  const { field_id, operator, value: conditionValue } = condition;

  const runtimeField = fieldValues[field_id];
  if (runtimeField === undefined) {
    // Missing referenced field = condition fails (hidden)
    return false;
  }

  return evaluateOperator(runtimeField.value, operator, conditionValue);
}

function evaluateComplexCondition(
  condition: ComplexVisibilityCondition,
  fieldValues: RuntimeFieldValues,
): boolean {
  const { logic, conditions } = condition;

  if (!conditions || conditions.length === 0) return true;

  const results = conditions.map((sub) =>
    evaluateSimpleCondition(sub, fieldValues),
  );

  if (logic === 'and') return results.every(Boolean);
  if (logic === 'or') return results.some(Boolean);

  // Defensive fallback
  return results.every(Boolean);
}

export function evaluateVisibilityCondition(
  condition: FieldVisibilityCondition | TransitionCondition | null,
  fieldValues: RuntimeFieldValues,
): VisibilityResult {
  if (!condition) return { isVisible: true, reason: 'No condition' };

  const showWhen = condition.show_when;
  if (!showWhen) return { isVisible: true, reason: 'No show_when clause' };

  try {
    if ('logic' in showWhen && 'conditions' in showWhen) {
      const isVisible = evaluateComplexCondition(
        showWhen as ComplexVisibilityCondition,
        fieldValues,
      );
      return {
        isVisible,
        reason: isVisible
          ? 'Complex condition passed'
          : 'Complex condition failed',
      };
    }

    if ('field_id' in showWhen && 'operator' in showWhen) {
      const isVisible = evaluateSimpleCondition(
        showWhen as SimpleVisibilityCondition,
        fieldValues,
      );
      return {
        isVisible,
        reason: isVisible
          ? 'Simple condition passed'
          : 'Simple condition failed',
      };
    }

    // Invalid structure => visible (fail open)
    return { isVisible: true, reason: 'Invalid condition structure' };
  } catch {
    // Error during evaluation => visible (fail open)
    return { isVisible: true, reason: 'Error during evaluation' };
  }
}

// =============================================================================
// VISIBILITY MAP BUILDER
// =============================================================================

export function buildVisibilityMap(
  fields: Array<{
    field_id: number;
    visibility_condition: FieldVisibilityCondition;
  }>,
  sections: Array<{
    section_id: number;
    visibility_condition: FieldVisibilityCondition;
  }>,
  transitions: Array<{
    transition_id: number;
    condition: TransitionCondition | null;
  }>,
  fieldValues: RuntimeFieldValues,
): VisibilityMap {
  const map: VisibilityMap = { fields: {}, sections: {}, transitions: {} };

  for (const field of fields) {
    map.fields[field.field_id] = evaluateVisibilityCondition(
      field.visibility_condition,
      fieldValues,
    ).isVisible;
  }

  for (const section of sections) {
    map.sections[section.section_id] = evaluateVisibilityCondition(
      section.visibility_condition,
      fieldValues,
    ).isVisible;
  }

  for (const transition of transitions) {
    map.transitions[transition.transition_id] = evaluateVisibilityCondition(
      transition.condition,
      fieldValues,
    ).isVisible;
  }

  return map;
}

export const visibilityEngine = {
  evaluate: evaluateVisibilityCondition,
  buildMap: buildVisibilityMap,
  isEmpty,
};
