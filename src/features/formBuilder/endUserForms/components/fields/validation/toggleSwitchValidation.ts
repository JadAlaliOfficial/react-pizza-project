/**
 * ================================
 * TOGGLE SWITCH FIELD VALIDATION
 * ================================
 * Zod schema generation for Toggle Switch fields based on field rules
 * Handles: required
 * Note: For toggles, "required" typically means must be true (accepted)
 */

import { z } from 'zod';
import type { FormField } from '@/features/formBuilder/endUserForms/types/formStructure.types';

/**
 * Generate Zod schema for Toggle Switch field based on field rules
 * 
 * @param field - Field configuration from API
 * @returns Zod schema for toggle validation
 */
export const generateToggleSwitchSchema = (
  field: FormField
): z.ZodType<boolean> => {
  // Check if field is required
  const isRequired = field.rules?.some(
    (rule) => rule.rule_name === 'required'
  ) ?? false;

  console.debug('[toggleSwitchValidation] Generating schema for field:', {
    fieldId: field.field_id,
    isRequired,
  });

  // Base schema for boolean
  let schema = z.boolean();

  // If required, validate that it must be true (checked)
  // This is common for terms acceptance, age verification, etc.
  if (isRequired) {
    schema = schema.refine(
      (value) => value === true,
      {
        message: `${field.label} must be enabled`,
      }
    );
  }

  return schema;
};

/**
 * Validate toggle value against field rules
 * 
 * @param field - Field configuration
 * @param value - Toggle value to validate
 * @returns Validation result with error message if invalid
 */
export const validateToggleSwitch = (
  field: FormField,
  value: boolean | null | undefined
): { valid: boolean; error?: string } => {
  const schema = generateToggleSwitchSchema(field);

  try {
    schema.parse(value ?? false);
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
 * Get default toggle value from field configuration
 * 
 * @param field - Field configuration
 * @returns Default toggle value (boolean)
 */
export const getDefaultToggleSwitchValue = (field: FormField): boolean => {
  // Try default_value first
  if (field.default_value !== null && field.default_value !== undefined) {
    // Handle various possible formats
    if (typeof field.default_value === 'boolean') {
      return field.default_value;
    }
    
    if (typeof field.default_value === 'number') {
      return field.default_value === 1;
    }
    
    if (typeof field.default_value === 'string') {
      const value = field.default_value.toLowerCase();
      return value === '1' || value === 'true' || value === 'yes' || value === 'on';
    }
  }

  // Try current_value
  if (field.current_value !== null && field.current_value !== undefined) {
    if (typeof field.current_value === 'boolean') {
      return field.current_value;
    }
    
    if (typeof field.current_value === 'number') {
      return field.current_value === 1;
    }
    
    if (typeof field.current_value === 'string') {
      const value = field.current_value.toLowerCase();
      return value === '1' || value === 'true' || value === 'yes' || value === 'on';
    }
  }

  // Default to false (off)
  return false;
};

/**
 * Convert boolean to API-compatible format
 * 
 * @param value - Boolean value
 * @returns Number (1 for true, 0 for false)
 */
export const toggleToApiValue = (value: boolean): number => {
  return value ? 1 : 0;
};

/**
 * Convert API value to boolean
 * 
 * @param value - Value from API (could be number, string, or boolean)
 * @returns Boolean value
 */
export const apiValueToToggle = (
  value: number | string | boolean | null | undefined
): boolean => {
  if (value === null || value === undefined) {
    return false;
  }

  if (typeof value === 'boolean') {
    return value;
  }

  if (typeof value === 'number') {
    return value === 1;
  }

  if (typeof value === 'string') {
    const normalized = value.toLowerCase();
    return normalized === '1' || normalized === 'true' || normalized === 'yes' || normalized === 'on';
  }

  return false;
};
