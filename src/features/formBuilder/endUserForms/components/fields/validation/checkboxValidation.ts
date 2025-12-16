/**
 * ================================
 * CHECKBOX FIELD VALIDATION
 * ================================
 * Zod schema generation for Checkbox fields based on field rules
 */

import { z } from 'zod';
import type { FormField } from '@/features/formBuilder/endUserForms/types/formStructure.types';

/**
 * Generate Zod schema for Checkbox field based on field rules
 * 
 * @param field - Field configuration from API
 * @returns Zod schema for checkbox validation
 */
export const generateCheckboxSchema = (field: FormField): z.ZodType<boolean> => {
  // Check if field is required
  const isRequired = field.rules?.some(
    (rule) => rule.rule_name === 'required'
  ) ?? false;

  console.debug('[checkboxValidation] Generating schema for field:', {
    fieldId: field.field_id,
    isRequired,
  });

  // If required, checkbox must be checked (true)
  if (isRequired) {
    return z.boolean().refine((value) => value === true, {
      message: `${field.label} must be checked`,
    });
  }

  // If not required, accept any boolean value
  return z.boolean();
};

/**
 * Validate checkbox value against field rules
 * 
 * @param field - Field configuration
 * @param value - Checkbox value to validate
 * @returns Validation result with error message if invalid
 */
export const validateCheckbox = (
  field: FormField,
  value: boolean | null | undefined
): { valid: boolean; error?: string } => {
  const schema = generateCheckboxSchema(field);

  try {
    schema.parse(value);
    return { valid: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstError = error.issues[0];
      return {
        valid: false,
        error: firstError?.message || 'Invalid checkbox value',
      };
    }
    return { valid: false, error: 'Invalid checkbox value' };
  }
};

/**
 * Get default checkbox value from field configuration
 * API uses 1 for checked, 0 for unchecked
 * 
 * @param field - Field configuration
 * @returns Default checkbox value (boolean)
 */
export const getDefaultCheckboxValue = (field: FormField): boolean => {
  const defaultValue = field.default_value;

  // Handle different possible default value formats
  if (typeof defaultValue === 'boolean') {
    return defaultValue;
  }

  if (typeof defaultValue === 'number') {
    return defaultValue === 1;
  }

  if (typeof defaultValue === 'string') {
    return defaultValue === '1' || defaultValue.toLowerCase() === 'true';
  }

  // Default to unchecked if no default value
  return false;
};

/**
 * Convert boolean value to API format (1 or 0)
 * 
 * @param value - Boolean value
 * @returns API-compatible value (1 or 0)
 */
export const convertCheckboxValueToAPI = (value: boolean): number => {
  return value ? 1 : 0;
};

/**
 * Convert API value to boolean
 * 
 * @param value - API value (1, 0, true, false, "1", "0")
 * @returns Boolean value
 */
export const convertAPIValueToCheckbox = (
  value: number | boolean | string | null | undefined
): boolean => {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return value === 1;
  if (typeof value === 'string') return value === '1' || value.toLowerCase() === 'true';
  return false;
};
