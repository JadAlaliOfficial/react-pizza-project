/**
 * ================================
 * TIME INPUT FIELD VALIDATION
 * ================================
 * Zod schema generation for Time Input fields based on field rules
 * Handles: required
 * Time format: HH:MM (24-hour format)
 */

import { z } from 'zod';
import type { FormField } from '@/features/formBuilder/endUserForms/types/formStructure.types';

/**
 * Regex pattern for time validation (HH:MM format, 24-hour)
 * Hours: 00-23
 * Minutes: 00-59
 */
const TIME_PATTERN = /^([01]\d|2[0-3]):([0-5]\d)$/;

/**
 * Validate time format
 * 
 * @param time - Time string to validate
 * @returns True if valid HH:MM format
 */
export const isValidTimeFormat = (time: string): boolean => {
  return TIME_PATTERN.test(time);
};

/**
 * Generate Zod schema for Time Input field based on field rules
 * 
 * @param field - Field configuration from API
 * @returns Zod schema for time validation
 */
export const generateTimeInputSchema = (field: FormField): z.ZodType<string> => {
  // Check if field is required
  const isRequired = field.rules?.some(
    (rule) => rule.rule_name === 'required'
  ) ?? false;

  console.debug('[timeInputValidation] Generating schema for field:', {
    fieldId: field.field_id,
    isRequired,
  });

  // Base schema for string with time format validation
  let schema = z.string().refine(
    (value) => {
      if (!value) return !isRequired; // Allow empty if not required
      return isValidTimeFormat(value);
    },
    {
      message: `${field.label} must be a valid time (HH:MM)`,
    }
  );

  // If not required, allow empty string
  if (!isRequired) {
    return z.union([schema, z.literal('')]);
  }

  // If required, ensure non-empty
  return schema.min(1, `${field.label} is required`);
};

/**
 * Validate time value against field rules
 * 
 * @param field - Field configuration
 * @param value - Time value to validate
 * @returns Validation result with error message if invalid
 */
export const validateTimeInput = (
  field: FormField,
  value: string | null | undefined
): { valid: boolean; error?: string } => {
  const schema = generateTimeInputSchema(field);

  try {
    schema.parse(value || '');
    return { valid: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstError = error.issues[0];
      return {
        valid: false,
        error: firstError?.message || 'Invalid time',
      };
    }
    return { valid: false, error: 'Invalid time' };
  }
};

/**
 * Get default time value from field configuration
 * 
 * @param field - Field configuration
 * @returns Default time value in HH:MM format
 */
export const getDefaultTimeInputValue = (field: FormField): string => {
  // Try default_value first
  if (field.default_value !== null && field.default_value !== undefined) {
    const value = String(field.default_value);
    if (isValidTimeFormat(value)) {
      return value;
    }
  }

  // Try current_value
  if (field.current_value !== null && field.current_value !== undefined) {
    const value = String(field.current_value);
    if (isValidTimeFormat(value)) {
      return value;
    }
  }

  // Return empty string (no default time)
  return '';
};

/**
 * Format time for display (converts 24h to 12h format)
 * 
 * @param time - Time in HH:MM format (24-hour)
 * @returns Formatted time string (12-hour with AM/PM)
 */
export const formatTimeDisplay = (time: string): string => {
  if (!time || !isValidTimeFormat(time)) {
    return '';
  }

  const [hours, minutes] = time.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12; // Convert 0 to 12 for midnight

  return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
};

/**
 * Get current time in HH:MM format
 * 
 * @returns Current time string
 */
export const getCurrentTime = (): string => {
  const now = new Date();
  const hours = now.getHours().toString().padStart(2, '0');
  const minutes = now.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
};

/**
 * Parse time string to hours and minutes
 * 
 * @param time - Time string in HH:MM format
 * @returns Object with hours and minutes, or null if invalid
 */
export const parseTime = (
  time: string
): { hours: number; minutes: number } | null => {
  if (!isValidTimeFormat(time)) {
    return null;
  }

  const [hours, minutes] = time.split(':').map(Number);
  return { hours, minutes };
};
