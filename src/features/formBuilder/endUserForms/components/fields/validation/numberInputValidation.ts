/**
 * ================================
 * NUMBER INPUT FIELD VALIDATION
 * ================================
 * Zod schema generation for Number Input fields based on field rules
 * Handles: required, numeric, integer, min, max, between
 * Note: same/different validation handled at form level via superRefine
 * Conflict resolution: numeric takes priority over integer
 */

import { z } from 'zod';
import type {
  FormField,
  FieldRule,
} from '@/features/formBuilder/endUserForms/types/formStructure.types';

/**
 * Extract validation bounds from rules with conflict resolution
 * Priority: individual min/max rules override between rule
 *
 * @param rules - Field validation rules
 * @returns Object with min and max bounds
 */
const extractValidationBounds = (
  rules: FieldRule[],
): { min: number | null; max: number | null } => {
  let min: number | null = null;
  let max: number | null = null;

  // First, check for between rule
  const betweenRule = rules.find((rule) => rule.rule_name === 'between');
  if (betweenRule?.rule_props) {
    const props = betweenRule.rule_props as { min?: number; max?: number };
    if (typeof props.min === 'number') min = props.min;
    if (typeof props.max === 'number') max = props.max;
  }

  // Then, override with individual min rule (takes priority)
  const minRule = rules.find((rule) => rule.rule_name === 'min');
  if (minRule?.rule_props) {
    const props = minRule.rule_props as { value?: number };
    if (typeof props.value === 'number') min = props.value;
  }

  // Finally, override with individual max rule (takes priority)
  const maxRule = rules.find((rule) => rule.rule_name === 'max');
  if (maxRule?.rule_props) {
    const props = maxRule.rule_props as { value?: number };
    if (typeof props.value === 'number') max = props.value;
  }

  return { min, max };
};

/**
 * Check if field has numeric or integer rules
 * Numeric takes priority over integer when both present
 *
 * @param rules - Field validation rules
 * @returns Object indicating which rule applies
 */
const getNumberTypeRules = (
  rules: FieldRule[],
): { isNumeric: boolean; isInteger: boolean; allowDecimals: boolean } => {
  const hasNumeric = rules.some((rule) => rule.rule_name === 'numeric');
  const hasInteger = rules.some((rule) => rule.rule_name === 'integer');

  // If both numeric and integer exist, numeric takes priority (allows decimals)
  if (hasNumeric && hasInteger) {
    return { isNumeric: true, isInteger: false, allowDecimals: true };
  }

  // If only integer, don't allow decimals
  if (hasInteger) {
    return { isNumeric: false, isInteger: true, allowDecimals: false };
  }

  // If only numeric or neither, allow decimals
  return { isNumeric: hasNumeric, isInteger: false, allowDecimals: true };
};

/**
 * Get comparison field IDs for same/different rules
 *
 * @param rules - Field validation rules
 * @returns Object with comparison field IDs
 */
export const getCrossFieldRules = (
  rules: FieldRule[],
): { sameAs: number | null; differentFrom: number | null } => {
  let sameAs: number | null = null;
  let differentFrom: number | null = null;

  rules.forEach((rule) => {
    if (rule.rule_name === 'same' && rule.rule_props) {
      const props = rule.rule_props as { comparevalue?: number | string };
      if (props.comparevalue) {
        sameAs =
          typeof props.comparevalue === 'number'
            ? props.comparevalue
            : parseInt(props.comparevalue);
      }
    }
    if (rule.rule_name === 'different' && rule.rule_props) {
      const props = rule.rule_props as { comparevalue?: number | string };
      if (props.comparevalue) {
        differentFrom =
          typeof props.comparevalue === 'number'
            ? props.comparevalue
            : parseInt(props.comparevalue);
      }
    }
  });

  return { sameAs, differentFrom };
};

/**
 * Generate Zod schema for Number Input field based on field rules
 *
 * @param field - Field configuration from API
 * @returns Zod schema for number validation
 */
export const generateNumberInputSchema = (
  field: FormField,
): z.ZodType<number> => {
  // Check if field is required
  const isRequired =
    field.rules?.some((rule) => rule.rule_name === 'required') ?? false;

  // Extract min/max bounds with conflict resolution
  const { min, max } = extractValidationBounds(field.rules || []);

  // Check number type rules (integer vs numeric)
  const { allowDecimals } = getNumberTypeRules(field.rules || []);

  console.debug('[numberInputValidation] Generating schema for field:', {
    fieldId: field.field_id,
    isRequired,
    min,
    max,
    allowDecimals,
  });

  // Base schema for number with coercion
  let schema = z.coerce.number({
    message: `${field.label} must be a number`,
  });

  // Apply integer validation if decimals not allowed
  if (!allowDecimals) {
    schema = schema.int(`${field.label} must be an integer (no decimals)`);
  }

  // Apply min validation
  if (min !== null) {
    schema = schema.min(min, `${field.label} must be at least ${min}`);
  }

  // Apply max validation
  if (max !== null) {
    schema = schema.max(max, `${field.label} must be at most ${max}`);
  }

  // Note: same/different validation handled at form level with superRefine

  // If not required, allow undefined
  if (!isRequired) {
    return schema.optional() as z.ZodType<number>;
  }

  // If required, add custom message
  return schema.refine(
    (val) => val !== undefined && val !== null && !isNaN(val),
    {
      message: `${field.label} is required`,
    },
  );
};

/**
 * Validate number value against field rules
 *
 * @param field - Field configuration
 * @param value - Number value to validate
 * @returns Validation result with error message if invalid
 */
export const validateNumberInput = (
  field: FormField,
  value: number | null | undefined,
): { valid: boolean; error?: string } => {
  const schema = generateNumberInputSchema(field);

  try {
    schema.parse(value);
    return { valid: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstError = error.issues[0];
      return {
        valid: false,
        error: firstError?.message || 'Invalid number',
      };
    }
    return { valid: false, error: 'Invalid number' };
  }
};

/**
 * Get default number value from field configuration
 *
 * @param field - Field configuration
 * @returns Default number value
 */
export const getDefaultNumberInputValue = (field: FormField): number | null => {
  const defaultValue = field.default_value;

  if (typeof defaultValue === 'number' && !isNaN(defaultValue))
    return defaultValue;

  if (typeof defaultValue === 'string') {
    const parsed = parseFloat(defaultValue);
    if (!isNaN(parsed)) return parsed;
  }

  return null; // ✅ instead of 0
};

/**
 * Check if field allows decimal values
 *
 * @param field - Field configuration
 * @returns True if decimals are allowed
 */
export const allowsDecimals = (field: FormField): boolean => {
  const { allowDecimals } = getNumberTypeRules(field.rules || []);
  return allowDecimals;
};

/**
 * Get step value for input
 *
 * @param field - Field configuration
 * @returns Step value ('any' for decimals, '1' for integers)
 */
export const getStepValue = (field: FormField): string => {
  return allowsDecimals(field) ? 'any' : '1';
};
