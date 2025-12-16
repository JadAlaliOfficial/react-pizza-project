/**
 * ================================
 * DROPDOWN SELECT FIELD VALIDATION
 * ================================
 * Zod schema generation for Dropdown Select fields based on field rules
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
export const parseDropdownOptions = (field: FormField): string[] => {
  try {
    if (!field.placeholder) return [];
    const parsed = JSON.parse(field.placeholder);
    return Array.isArray(parsed) ? parsed.filter((opt) => typeof opt === 'string') : [];
  } catch (error) {
    console.warn('[dropdownSelectValidation] Failed to parse options:', error);
    return [];
  }
};

/**
 * Generate Zod schema for Dropdown Select field based on field rules
 * 
 * @param field - Field configuration from API
 * @returns Zod schema for dropdown validation
 */
export const generateDropdownSelectSchema = (field: FormField): z.ZodType<string> => {
  // Check if field is required
  const isRequired = field.rules?.some(
    (rule) => rule.rule_name === 'required'
  ) ?? false;

  // Get valid options
  const options = parseDropdownOptions(field);

  console.debug('[dropdownSelectValidation] Generating schema for field:', {
    fieldId: field.field_id,
    isRequired,
    optionsCount: options.length,
  });

  // Base schema for string
  let schema: z.ZodTypeAny = z.string();

  // Validate that value is one of the available options
  if (options.length > 0) {
    schema = z.enum([options[0], ...options.slice(1)] as [string, ...string[]], {
      message: 'Please select a valid option',
    });
  }

  // If not required, allow empty string
  if (!isRequired) {
    return z.union([schema, z.literal('')]) as z.ZodType<string>;
  }

  // If required, ensure not empty
  return schema.refine((val) => val !== '', {
    message: `${field.label} is required`,
  }) as z.ZodType<string>;
};

/**
 * Validate dropdown value against field rules
 * 
 * @param field - Field configuration
 * @param value - Dropdown value to validate
 * @returns Validation result with error message if invalid
 */
export const validateDropdownSelect = (
  field: FormField,
  value: string | null | undefined
): { valid: boolean; error?: string } => {
  const schema = generateDropdownSelectSchema(field);

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
 * Get default dropdown value from field configuration
 * 
 * @param field - Field configuration
 * @returns Default dropdown value (string)
 */
export const getDefaultDropdownSelectValue = (field: FormField): string => {
  const defaultValue = field.default_value;

  // If default_value is a string, validate it's in options
  if (typeof defaultValue === 'string') {
    const options = parseDropdownOptions(field);
    // Only return if it's a valid option
    if (options.includes(defaultValue)) {
      return defaultValue;
    }
  }

  // Default to empty string
  return '';
};

/**
 * Format options for display
 * Converts option strings to objects with value and label
 * 
 * @param options - Array of option strings
 * @returns Array of option objects
 */
export const formatDropdownOptions = (options: string[]): Array<{ value: string; label: string }> => {
  return options.map((option) => ({
    value: option,
    label: option,
  }));
};
