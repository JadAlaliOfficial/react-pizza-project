/**
 * ================================
 * CURRENCY INPUT FIELD VALIDATION
 * ================================
 * Zod schema generation for Currency Input fields based on field rules
 * Handles conflicting rules: min, max, and between
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
 * Generate Zod schema for Currency Input field based on field rules
 * 
 * @param field - Field configuration from API
 * @returns Zod schema for currency input validation
 */
export const generateCurrencyInputSchema = (field: FormField): z.ZodType<number> => {
  // Check if field is required
  const isRequired = field.rules?.some(
    (rule) => rule.rule_name === 'required'
  ) ?? false;

  // Extract min/max bounds with conflict resolution
  const { min, max } = extractValidationBounds(field.rules || []);

  console.debug('[currencyInputValidation] Generating schema for field:', {
    fieldId: field.field_id,
    isRequired,
    min,
    max,
  });

  // Base schema for number
  let schema = z.number();

  // Apply min validation
  if (min !== null) {
    schema = schema.min(min, `${field.label} must be at least ${min}`);
  }

  // Apply max validation
  if (max !== null) {
    schema = schema.max(max, `${field.label} must be at most ${max}`);
  }

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
 * Validate currency value against field rules
 * 
 * @param field - Field configuration
 * @param value - Currency value to validate
 * @returns Validation result with error message if invalid
 */
export const validateCurrencyInput = (
  field: FormField,
  value: number | null | undefined
): { valid: boolean; error?: string } => {
  const schema = generateCurrencyInputSchema(field);

  try {
    schema.parse(value);
    return { valid: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstError = error.issues[0];
      return {
        valid: false,
        error: firstError?.message || 'Invalid currency value',
      };
    }
    return { valid: false, error: 'Invalid currency value' };
  }
};

/**
 * Get default currency value from field configuration
 * 
 * @param field - Field configuration
 * @returns Default currency value (number)
 */
export const getDefaultCurrencyInputValue = (field: FormField): number => {
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
 * Format number as currency with thousand separators
 * 
 * @param value - Numeric value
 * @param decimals - Number of decimal places (default: 2)
 * @returns Formatted string (e.g., "1,234.56")
 */
export const formatCurrency = (value: number | string, decimals: number = 2): string => {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  
  if (isNaN(num)) return '';

  // Format with fixed decimals
  const fixed = num.toFixed(decimals);
  
  // Split into integer and decimal parts
  const parts = fixed.split('.');
  
  // Add thousand separators to integer part
  const integerPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  
  // Return formatted value
  return decimals > 0 ? `${integerPart}.${parts[1]}` : integerPart;
};

/**
 * Parse formatted currency string to number
 * 
 * @param value - Formatted currency string (e.g., "1,234.56")
 * @returns Parsed number
 */
export const parseCurrency = (value: string): number => {
  // Remove all non-numeric characters except dot and minus
  const cleaned = value.replace(/[^0-9.-]/g, '');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
};

/**
 * Validate and clean currency input string - FLEXIBLE VERSION
 * Allows typing freely, only restricts invalid characters
 * 
 * @param value - Input string
 * @param previousValue - Previous input value
 * @returns Cleaned string
 */
export const cleanCurrencyInput = (value: string, previousValue: string = ''): string => {
  // If empty, allow it
  if (value === '') return '';

  // Remove all characters except digits and dot
  let cleaned = value.replace(/[^0-9.]/g, '');

  // Handle multiple dots - keep only the first one
  const dotIndex = cleaned.indexOf('.');
  if (dotIndex !== -1) {
    // Split at first dot
    const beforeDot = cleaned.substring(0, dotIndex);
    const afterDot = cleaned.substring(dotIndex + 1).replace(/\./g, ''); // Remove any other dots
    
    // Limit decimals to 2 digits, but allow typing
    if (afterDot.length <= 2) {
      cleaned = beforeDot + '.' + afterDot;
    } else {
      // If trying to add more than 2 decimals, keep previous value
      cleaned = previousValue;
    }
  }

  return cleaned;
};
