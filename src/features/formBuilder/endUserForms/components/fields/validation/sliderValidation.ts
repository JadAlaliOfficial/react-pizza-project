/**
 * ================================
 * SLIDER FIELD VALIDATION
 * ================================
 * Zod schema generation for Slider fields based on field rules
 * Handles: required, min, max, between, integer, numeric
 * Conflict resolution: min/max rules override between rule, numeric takes priority over integer
 */

import { z } from 'zod';
import type { FormField, FieldRule } from '@/features/formBuilder/endUserForms/types/formStructure.types';

/**
 * Extract validation bounds from rules with conflict resolution
 * Priority: individual min/max rules override between rule
 * 
 * @param rules - Field validation rules
 * @returns Object with min and max bounds
 */
const extractValidationBounds = (
  rules: FieldRule[]
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
 * Check if field requires integer values
 * Numeric takes priority over integer when both present
 * 
 * @param rules - Field validation rules
 * @returns True if only integers allowed
 */
const requiresInteger = (rules: FieldRule[]): boolean => {
  const hasNumeric = rules.some((rule) => rule.rule_name === 'numeric');
  const hasInteger = rules.some((rule) => rule.rule_name === 'integer');

  // If both numeric and integer exist, numeric takes priority (allows decimals)
  if (hasNumeric && hasInteger) {
    return false;
  }

  // If only integer, require integer
  return hasInteger;
};

/**
 * Generate Zod schema for Slider field based on field rules
 * 
 * @param field - Field configuration from API
 * @returns Zod schema for slider validation
 */
export const generateSliderSchema = (field: FormField): z.ZodType<number> => {
  // Check if field is required
  const isRequired = field.rules?.some(
    (rule) => rule.rule_name === 'required'
  ) ?? false;

  // Extract min/max bounds with conflict resolution
  const { min, max } = extractValidationBounds(field.rules || []);

  // Check if integer required
  const integerOnly = requiresInteger(field.rules || []);

  console.debug('[sliderValidation] Generating schema for field:', {
    fieldId: field.field_id,
    isRequired,
    min,
    max,
    integerOnly,
  });

  // Base schema for number
  let schema = z.coerce.number();

  // Apply integer validation if required
  if (integerOnly) {
    schema = schema.int(`${field.label} must be an integer (no decimals)`);
  }

  // Apply min validation (default to 0 for sliders if not specified)
  const minValue = min !== null ? min : 0;
  schema = schema.min(minValue, `${field.label} must be at least ${minValue}`);

  // Apply max validation (default to 100 for sliders if not specified)
  const maxValue = max !== null ? max : 100;
  schema = schema.max(maxValue, `${field.label} must be at most ${maxValue}`);

  // If not required, allow undefined
  if (!isRequired) {
    return schema.optional() as z.ZodType<number>;
  }

  // If required, add custom message
  return schema.refine((val) => val !== undefined && val !== null && !isNaN(val), {
    message: `${field.label} is required`,
  });
};

/**
 * Validate slider value against field rules
 * 
 * @param field - Field configuration
 * @param value - Slider value to validate
 * @returns Validation result with error message if invalid
 */
export const validateSlider = (
  field: FormField,
  value: number | null | undefined
): { valid: boolean; error?: string } => {
  const schema = generateSliderSchema(field);

  try {
    schema.parse(value);
    return { valid: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstError = error.issues[0];
      return {
        valid: false,
        error: firstError?.message || 'Invalid value',
      };
    }
    return { valid: false, error: 'Invalid value' };
  }
};

/**
 * Get default slider value from field configuration
 * 
 * @param field - Field configuration
 * @returns Default slider value
 */
export const getDefaultSliderValue = (field: FormField): number => {
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

  // Get bounds and return midpoint or min
  const { min, max } = extractValidationBounds(field.rules || []);
  const minValue = min !== null ? min : 0;
  const maxValue = max !== null ? max : 100;
  
  return Math.floor((minValue + maxValue) / 2);
};

/**
 * Get min value for slider
 * 
 * @param field - Field configuration
 * @returns Min value
 */
export const getSliderMin = (field: FormField): number => {
  const { min } = extractValidationBounds(field.rules || []);
  return min !== null ? min : 0;
};

/**
 * Get max value for slider
 * 
 * @param field - Field configuration
 * @returns Max value
 */
export const getSliderMax = (field: FormField): number => {
  const { max } = extractValidationBounds(field.rules || []);
  return max !== null ? max : 100;
};

/**
 * Get step value for slider
 * 
 * @param field - Field configuration
 * @returns Step value (1 for integers, 0.1 for decimals)
 */
export const getSliderStep = (field: FormField): number => {
  return requiresInteger(field.rules || []) ? 1 : 0.1;
};
