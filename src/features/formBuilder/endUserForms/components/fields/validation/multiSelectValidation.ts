/**
 * ================================
 * MULTI-SELECT FIELD VALIDATION
 * ================================
 * Zod schema generation for Multi-Select fields based on field rules
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
export const parseMultiSelectOptions = (field: FormField): string[] => {
  try {
    if (!field.placeholder) return [];
    const parsed = JSON.parse(field.placeholder);
    return Array.isArray(parsed) ? parsed.filter((opt) => typeof opt === 'string') : [];
  } catch (error) {
    console.warn('[multiSelectValidation] Failed to parse options:', error);
    return [];
  }
};

/**
 * Parse default selected values
 * Default values are stored as JSON array or array directly
 * 
 * @param field - Field configuration
 * @returns Array of selected option strings
 */
export const parseDefaultSelectedValues = (field: FormField): string[] => {
  try {
    const defaultValue = field.default_value;
    
    // If already an array
    if (Array.isArray(defaultValue)) {
      return defaultValue.filter((val) => typeof val === 'string');
    }
    
    // If string, try to parse as JSON
    if (typeof defaultValue === 'string') {
      const parsed = JSON.parse(defaultValue);
      return Array.isArray(parsed) ? parsed.filter((val) => typeof val === 'string') : [];
    }
    
    return [];
  } catch (error) {
    console.warn('[multiSelectValidation] Failed to parse default values:', error);
    return [];
  }
};

/**
 * Generate Zod schema for Multi-Select field based on field rules
 * 
 * @param field - Field configuration from API
 * @returns Zod schema for multi-select validation
 */
export const generateMultiSelectSchema = (field: FormField): z.ZodType<string[]> => {
  // Check if field is required
  const isRequired = field.rules?.some(
    (rule) => rule.rule_name === 'required'
  ) ?? false;

  // Get valid options
  const options = parseMultiSelectOptions(field);

  console.debug('[multiSelectValidation] Generating schema for field:', {
    fieldId: field.field_id,
    isRequired,
    optionsCount: options.length,
  });

  // Base schema for array of strings
  let schema = z.array(z.string());

  // Validate that all values are from available options
  if (options.length > 0) {
    schema = schema.refine(
      (values) => values.every((val) => options.includes(val)),
      {
        message: 'Selected values must be from available options',
      }
    );
  }

  // If required, ensure at least one item is selected
  if (isRequired) {
    schema = schema.min(1, `${field.label} requires at least one selection`);
  }

  return schema;
};

/**
 * Validate multi-select value against field rules
 * 
 * @param field - Field configuration
 * @param value - Multi-select value to validate
 * @returns Validation result with error message if invalid
 */
export const validateMultiSelect = (
  field: FormField,
  value: string[] | null | undefined
): { valid: boolean; error?: string } => {
  const schema = generateMultiSelectSchema(field);

  try {
    schema.parse(value || []);
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
 * Get default multi-select value from field configuration
 * 
 * @param field - Field configuration
 * @returns Default multi-select value (array of strings)
 */
export const getDefaultMultiSelectValue = (field: FormField): string[] => {
  const defaultSelected = parseDefaultSelectedValues(field);
  const options = parseMultiSelectOptions(field);

  // Validate that default selections are in options
  return defaultSelected.filter((val) => options.includes(val));
};

/**
 * Format options for display with checked state
 * 
 * @param options - Array of option strings
 * @param selectedValues - Array of selected values
 * @returns Array of option objects with checked state
 */
export const formatMultiSelectOptions = (
  options: string[],
  selectedValues: string[]
): Array<{ value: string; label: string; checked: boolean }> => {
  return options.map((option) => ({
    value: option,
    label: option,
    checked: selectedValues.includes(option),
  }));
};
