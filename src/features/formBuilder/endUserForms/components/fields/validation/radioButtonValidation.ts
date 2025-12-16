/**
 * ================================
 * RADIO BUTTON FIELD VALIDATION
 * ================================
 * Zod schema generation for Radio Button fields based on field rules
 * Handles: required
 */

import { z } from 'zod';
import type { FormField } from '@/features/formBuilder/endUserForms/types/formStructure.types';

/**
 * Parse options from field placeholder
 * Options are stored as JSON array in placeholder field
 * 
 * @param field - Field configuration
 * @returns Array of option strings
 */
export const parseRadioButtonOptions = (field: FormField): string[] => {
  try {
    if (!field.placeholder) return [];
    const parsed = JSON.parse(field.placeholder);
    return Array.isArray(parsed) ? parsed.filter((opt) => typeof opt === 'string') : [];
  } catch (error) {
    console.warn('[radioButtonValidation] Failed to parse options:', error);
    return [];
  }
};

/**
 * Parse default selected value
 * 
 * @param field - Field configuration
 * @returns Default selected option string or empty string
 */
export const parseDefaultSelectedValue = (field: FormField): string => {
  try {
    const defaultValue = field.default_value;
    
    // If string, return directly
    if (typeof defaultValue === 'string') {
      return defaultValue;
    }
    
    return '';
  } catch (error) {
    console.warn('[radioButtonValidation] Failed to parse default value:', error);
    return '';
  }
};

/**
 * Generate Zod schema for Radio Button field based on field rules
 * 
 * @param field - Field configuration from API
 * @returns Zod schema for radio button validation
 */
export const generateRadioButtonSchema = (field: FormField): z.ZodType<string> => {
  // Check if field is required
  const isRequired = field.rules?.some(
    (rule) => rule.rule_name === 'required'
  ) ?? false;

  // Get valid options
  const options = parseRadioButtonOptions(field);

  console.debug('[radioButtonValidation] Generating schema for field:', {
    fieldId: field.field_id,
    isRequired,
    optionsCount: options.length,
  });

  // Base schema for string
  let schema = z.string();

  // Validate that value is from available options
  if (options.length > 0) {
    schema = schema.refine(
      (value) => !value || options.includes(value),
      {
        message: 'Selected value must be from available options',
      }
    );
  }

  // If required, ensure value is selected
  if (isRequired) {
    schema = schema.min(1, `${field.label} is required`);
  }

  // If not required, allow empty string
  if (!isRequired) {
    return z.union([schema, z.literal('')]);
  }

  return schema;
};

/**
 * Validate radio button value against field rules
 * 
 * @param field - Field configuration
 * @param value - Radio button value to validate
 * @returns Validation result with error message if invalid
 */
export const validateRadioButton = (
  field: FormField,
  value: string | null | undefined
): { valid: boolean; error?: string } => {
  const schema = generateRadioButtonSchema(field);

  try {
    schema.parse(value || '');
    return { valid: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstError = error.issues[0];
      return {
        valid: false,
        error: firstError?.message || 'Invalid selection',
      };
    }
    return { valid: false, error: 'Invalid selection' };
  }
};

/**
 * Get default radio button value from field configuration
 * 
 * @param field - Field configuration
 * @returns Default radio button value (string)
 */
export const getDefaultRadioButtonValue = (field: FormField): string => {
  const defaultSelected = parseDefaultSelectedValue(field);
  const options = parseRadioButtonOptions(field);

  // Validate that default selection is in options
  if (defaultSelected && options.includes(defaultSelected)) {
    return defaultSelected;
  }

  return '';
};

/**
 * Format options for display
 * 
 * @param options - Array of option strings
 * @returns Array of option objects
 */
export const formatRadioButtonOptions = (
  options: string[]
): Array<{ value: string; label: string }> => {
  return options.map((option) => ({
    value: option,
    label: option,
  }));
};
