/**
 * ================================
 * PERCENTAGE INPUT FIELD VALIDATION
 * ================================
 * Zod schema generation for Percentage Input fields based on field rules
 * Handles conflicting rules: min, max, between, numeric, required
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
/**
 * Extract validation bounds from rules.
 * Priority: between rule is preferred; standalone min/max are only used if the between bound is missing.
 */
const extractValidationBounds = (
  rules: FieldRule[],
): { min: number | null; max: number | null } => {
  let min: number | null = null;
  let max: number | null = null;

  const betweenRule = rules.find((rule) => rule.rule_name === 'between');
  const betweenProps =
    (betweenRule?.rule_props as {
      min?: number | string;
      max?: number | string;
    }) || {};

  if (
    betweenProps.min !== undefined &&
    betweenProps.min !== null &&
    !Number.isNaN(Number(betweenProps.min))
  ) {
    min = Number(betweenProps.min);
  }

  if (
    betweenProps.max !== undefined &&
    betweenProps.max !== null &&
    !Number.isNaN(Number(betweenProps.max))
  ) {
    max = Number(betweenProps.max);
  }

  if (min === null) {
    const minRule = rules.find((rule) => rule.rule_name === 'min');
    const raw = (minRule?.rule_props as { value?: number | string })?.value;
    if (raw !== undefined && raw !== null && !Number.isNaN(Number(raw))) {
      min = Number(raw);
    }
  }

  if (max === null) {
    const maxRule = rules.find((rule) => rule.rule_name === 'max');
    const raw = (maxRule?.rule_props as { value?: number | string })?.value;
    if (raw !== undefined && raw !== null && !Number.isNaN(Number(raw))) {
      max = Number(raw);
    }
  }

  return { min, max };
};

/**
 * Generate Zod schema for Percentage Input field based on field rules
 *
 * @param field - Field configuration from API
 * @returns Zod schema for percentage input validation
 */
export const generatePercentageInputSchema = (
  field: FormField,
): z.ZodType<number> => {
  // Check if field is required
  const isRequired =
    field.rules?.some((rule) => rule.rule_name === 'required') ?? false;

  // Extract min/max bounds with conflict resolution
  const { min, max } = extractValidationBounds(field.rules || []);

  console.debug('[percentageInputValidation] Generating schema for field:', {
    fieldId: field.field_id,
    isRequired,
    min,
    max,
  });

  // Base schema for number
  let schema = z.number();

  // Apply min validation (default to 0 for percentages if not specified)
  const minValue = min !== null ? min : 0;
  schema = schema.min(minValue, `${field.label} must be at least ${minValue}%`);

  // Apply max validation (default to 100 for percentages if not specified)
  const maxValue = max !== null ? max : 100;
  schema = schema.max(maxValue, `${field.label} must be at most ${maxValue}%`);

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
 * Validate percentage value against field rules
 *
 * @param field - Field configuration
 * @param value - Percentage value to validate
 * @returns Validation result with error message if invalid
 */
export const validatePercentageInput = (
  field: FormField,
  value: number | null | undefined,
): { valid: boolean; error?: string } => {
  const schema = generatePercentageInputSchema(field);

  try {
    schema.parse(value);
    return { valid: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstError = error.issues[0];
      return {
        valid: false,
        error: firstError?.message || 'Invalid percentage value',
      };
    }
    return { valid: false, error: 'Invalid percentage value' };
  }
};

/**
 * Get default percentage value from field configuration
 *
 * @param field - Field configuration
 * @returns Default percentage value (number)
 */
export const getDefaultPercentageInputValue = (field: FormField): number => {
  const defaultValue = field.default_value;

  // If default_value is a number
  if (typeof defaultValue === 'number') {
    return defaultValue;
  }

  // If default_value is a numeric string
  if (typeof defaultValue === 'string') {
    const parsed = parseFloat(defaultValue);
    if (!isNaN(parsed)) {
      return parsed;
    }
  }

  // Default to 0 if no valid default
  return 0;
};

/**
 * Clamp value between min and max
 *
 * @param value - Value to clamp
 * @param min - Minimum value
 * @param max - Maximum value
 * @returns Clamped value
 */
export const clampPercentage = (
  value: number,
  min: number = 0,
  max: number = 100,
): number => {
  return Math.min(Math.max(value, min), max);
};

/**
 * Format percentage value for display
 *
 * @param value - Numeric value
 * @param decimals - Number of decimal places (default: 1)
 * @returns Formatted string
 */
export const formatPercentage = (
  value: number,
  decimals: number = 1,
): string => {
  return value.toFixed(decimals);
};

/**
 * Parse percentage input string to number
 *
 * @param value - Input string
 * @returns Parsed number
 */
export const parsePercentage = (value: string): number => {
  const parsed = parseFloat(value);
  return isNaN(parsed) ? 0 : parsed;
};
