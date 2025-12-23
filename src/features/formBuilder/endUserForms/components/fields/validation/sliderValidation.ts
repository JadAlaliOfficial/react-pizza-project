/**
 * ================================
 * SLIDER FIELD VALIDATION
 * ================================
 * Zod schema generation for Slider fields based on field rules
 * Handles: required, min, max, between, integer, numeric
 * Mixed priority: between partial + standalone fallback
 */

import { z } from 'zod';
import type { FormField, FieldRule } from '@/features/formBuilder/endUserForms/types/formStructure.types';

/**
 * Extract validation bounds with mixed between + standalone priority
 * Priority: between where provided, standalone fills gaps
 * 
 * @param rules - Field validation rules
 * @returns Object with min and max bounds
 */
const extractValidationBounds = (
  rules: FieldRule[]
): { min: number | null; max: number | null } => {
  let min: number | null = null;
  let max: number | null = null;
  
  // Check for between rule first (partial priority)
  const betweenRule = rules.find(rule => rule.rule_name === 'between');
  const betweenProps = betweenRule?.rule_props as { min?: number; max?: number } || {};
  const { min: betweenMin, max: betweenMax } = betweenProps;
  
  if (betweenMin !== undefined) {
    min = Number(betweenMin);
  }
  
  if (betweenMax !== undefined) {
    max = Number(betweenMax);
  }
  
  // Fallback logic - only use standalone if between didn't provide that bound
  if (min === null) {
    const minRule = rules.find((rule) => rule.rule_name === 'min');
    if (minRule?.rule_props) {
      const props = minRule.rule_props as { value?: number };
      if (typeof props.value === 'number') min = props.value;
    }
  }
  
  if (max === null) {
    const maxRule = rules.find((rule) => rule.rule_name === 'max');
    if (maxRule?.rule_props) {
      const props = maxRule.rule_props as { value?: number };
      if (typeof props.value === 'number') max = props.value;
    }
  }

  return { min, max };
};

/**
 * Check if field requires integer values
 * Numeric takes priority over integer when both present
 */
const requiresInteger = (rules: FieldRule[]): boolean => {
  const hasNumeric = rules.some((rule) => rule.rule_name === 'numeric');
  const hasInteger = rules.some((rule) => rule.rule_name === 'integer');

  if (hasNumeric && hasInteger) {
    return false;
  }

  return hasInteger;
};

/**
 * Generate Zod schema for Slider field based on field rules
 */
export const generateSliderSchema = (field: FormField): z.ZodType<number> => {
  const isRequired = field.rules?.some(
    (rule) => rule.rule_name === 'required'
  ) ?? false;

  const { min, max } = extractValidationBounds(field.rules || []);
  const integerOnly = requiresInteger(field.rules || []);

  console.debug('[sliderValidation] Generating schema for field:', {
    fieldId: field.field_id,
    isRequired,
    min,
    max,
    integerOnly,
  });

  let schema = z.coerce.number();

  if (integerOnly) {
    schema = schema.int(`${field.label} must be an integer (no decimals)`);
  }

  const minValue = min !== null ? min : 0;
  schema = schema.min(minValue, `${field.label} must be at least ${minValue}`);

  const maxValue = max !== null ? max : 100;
  schema = schema.max(maxValue, `${field.label} must be at most ${maxValue}`);

  if (!isRequired) {
    return schema.optional() as z.ZodType<number>;
  }

  return schema.refine((val) => val !== undefined && val !== null && !isNaN(val), {
    message: `${field.label} is required`,
  });
};

/**
 * Validate slider value against field rules
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
 */
export const getDefaultSliderValue = (field: FormField): number => {
  const defaultValue = field.default_value;

  if (typeof defaultValue === 'number') {
    return defaultValue;
  }

  if (typeof defaultValue === 'string') {
    const parsed = parseFloat(defaultValue);
    if (!isNaN(parsed)) {
      return parsed;
    }
  }

  const { min, max } = extractValidationBounds(field.rules || []);
  const minValue = min !== null ? min : 0;
  const maxValue = max !== null ? max : 100;
  
  return Math.floor((minValue + maxValue) / 2);
};

/**
 * Get min value for slider
 */
export const getSliderMin = (field: FormField): number => {
  const { min } = extractValidationBounds(field.rules || []);
  return min !== null ? min : 0;
};

/**
 * Get max value for slider
 */
export const getSliderMax = (field: FormField): number => {
  const { max } = extractValidationBounds(field.rules || []);
  return max !== null ? max : 100;
};

/**
 * Get step value for slider
 */
export const getSliderStep = (field: FormField): number => {
  return requiresInteger(field.rules || []) ? 1 : 0.1;
};
