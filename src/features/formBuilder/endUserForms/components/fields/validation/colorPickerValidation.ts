/**
 * ================================
 * COLOR PICKER FIELD VALIDATION
 * ================================
 * Zod schema generation for Color Picker fields based on field rules
 */

import { z } from 'zod';
import type { FormField } from '@/features/formBuilder/endUserForms/types/formStructure.types';

/**
 * Regex for validating hex color format (#RRGGBB or #RGB)
 */
const HEX_COLOR_REGEX = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;

/**
 * Generate Zod schema for Color Picker field based on field rules
 * 
 * @param field - Field configuration from API
 * @returns Zod schema for color picker validation
 */
export const generateColorPickerSchema = (field: FormField): z.ZodType<string> => {
  // Check if field is required
  const isRequired = field.rules?.some(
    (rule) => rule.rule_name === 'required'
  ) ?? false;

  console.debug('[colorPickerValidation] Generating schema for field:', {
    fieldId: field.field_id,
    isRequired,
  });

  // Base schema for hex color validation
  const baseSchema = z
    .string()
    .regex(HEX_COLOR_REGEX, 'Please enter a valid hex color (e.g., #3B82F6)');

  // If required, ensure value is not empty
  if (isRequired) {
    return baseSchema.min(1, `${field.label} is required`);
  }

  // If not required, allow empty string
  return z.union([baseSchema, z.literal('')]);
};

/**
 * Validate color value against field rules
 * 
 * @param field - Field configuration
 * @param value - Color value to validate
 * @returns Validation result with error message if invalid
 */
export const validateColorPicker = (
  field: FormField,
  value: string | null | undefined
): { valid: boolean; error?: string } => {
  const schema = generateColorPickerSchema(field);

  try {
    schema.parse(value || '');
    return { valid: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstError = error.issues[0];
      return {
        valid: false,
        error: firstError?.message || 'Invalid color value',
      };
    }
    return { valid: false, error: 'Invalid color value' };
  }
};

/**
 * Get default color value from field configuration
 * 
 * @param field - Field configuration
 * @returns Default color value (hex string)
 */
export const getDefaultColorPickerValue = (field: FormField): string => {
  const defaultValue = field.default_value;

  // If default_value is a valid hex color
  if (typeof defaultValue === 'string' && HEX_COLOR_REGEX.test(defaultValue)) {
    return defaultValue;
  }

  // Default to blue color if no valid default
  return '#3B82F6';
};

/**
 * Normalize hex color to uppercase 6-character format
 * 
 * @param color - Hex color string
 * @returns Normalized hex color (#RRGGBB)
 */
export const normalizeHexColor = (color: string): string => {
  // Remove # if present
  let hex = color.replace('#', '');

  // Expand shorthand (#RGB to #RRGGBB)
  if (hex.length === 3) {
    hex = hex
      .split('')
      .map((char) => char + char)
      .join('');
  }

  // Return uppercase with #
  return `#${hex.toUpperCase()}`;
};

/**
 * Validate if string is a valid hex color
 * 
 * @param color - String to validate
 * @returns True if valid hex color
 */
export const isValidHexColor = (color: string): boolean => {
  return HEX_COLOR_REGEX.test(color);
};
