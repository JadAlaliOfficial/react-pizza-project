/**
 * ================================
 * DATE INPUT FIELD VALIDATION
 * ================================
 * Zod schema generation for Date Input fields based on field rules
 * Handles: required, before, after, before_or_equal, after_or_equal
 */

import { z } from 'zod';
import type { FormField, FieldRule } from '@/features/formBuilder/endUserForms/types/formStructure.types';

/**
 * Extract date validation bounds from rules
 * Handles before, after, before_or_equal, after_or_equal rules
 * 
 * @param rules - Field validation rules
 * @returns Object with validation dates
 */
const extractDateValidationBounds = (
  rules: FieldRule[]
): {
  before: string | null;
  after: string | null;
  beforeOrEqual: string | null;
  afterOrEqual: string | null;
} => {
  let before: string | null = null;
  let after: string | null = null;
  let beforeOrEqual: string | null = null;
  let afterOrEqual: string | null = null;

  rules.forEach((rule) => {
    const props = rule.rule_props as { date?: string } | null;
    
    switch (rule.rule_name) {
      case 'before':
        if (props?.date) before = props.date;
        break;
      case 'after':
        if (props?.date) after = props.date;
        break;
      case 'before_or_equal':
        if (props?.date) beforeOrEqual = props.date;
        break;
      case 'after_or_equal':
        if (props?.date) afterOrEqual = props.date;
        break;
    }
  });

  return { before, after, beforeOrEqual, afterOrEqual };
};

/**
 * Compare two date strings
 * 
 * @param date1 - First date (YYYY-MM-DD)
 * @param date2 - Second date (YYYY-MM-DD)
 * @returns -1 if date1 < date2, 0 if equal, 1 if date1 > date2
 */
const compareDates = (date1: string, date2: string): number => {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  
  if (d1 < d2) return -1;
  if (d1 > d2) return 1;
  return 0;
};

/**
 * Generate Zod schema for Date Input field based on field rules
 * 
 * @param field - Field configuration from API
 * @returns Zod schema for date input validation
 */
export const generateDateInputSchema = (field: FormField): z.ZodType<string> => {
  // Check if field is required
  const isRequired = field.rules?.some(
    (rule) => rule.rule_name === 'required'
  ) ?? false;

  // Extract date validation bounds
  const { before, after, beforeOrEqual, afterOrEqual } = extractDateValidationBounds(
    field.rules || []
  );

  console.debug('[dateInputValidation] Generating schema for field:', {
    fieldId: field.field_id,
    isRequired,
    before,
    after,
    beforeOrEqual,
    afterOrEqual,
  });

  // Base schema for date string (ISO format: YYYY-MM-DD)
  let schema = z.string().regex(
    /^\d{4}-\d{2}-\d{2}$/,
    'Date must be in YYYY-MM-DD format'
  );

  // Apply after validation
  if (after) {
    schema = schema.refine(
      (date) => compareDates(date, after) > 0,
      {
        message: `${field.label} must be after ${formatDateForDisplay(after)}`,
      }
    );
  }

  // Apply after_or_equal validation
  if (afterOrEqual) {
    schema = schema.refine(
      (date) => compareDates(date, afterOrEqual) >= 0,
      {
        message: `${field.label} must be on or after ${formatDateForDisplay(afterOrEqual)}`,
      }
    );
  }

  // Apply before validation
  if (before) {
    schema = schema.refine(
      (date) => compareDates(date, before) < 0,
      {
        message: `${field.label} must be before ${formatDateForDisplay(before)}`,
      }
    );
  }

  // Apply before_or_equal validation
  if (beforeOrEqual) {
    schema = schema.refine(
      (date) => compareDates(date, beforeOrEqual) <= 0,
      {
        message: `${field.label} must be on or before ${formatDateForDisplay(beforeOrEqual)}`,
      }
    );
  }

  // If not required, allow empty string
  if (!isRequired) {
    return z.union([schema, z.literal('')]);
  }

  // If required, ensure not empty
  return schema.min(1, `${field.label} is required`);
};

/**
 * Validate date value against field rules
 * 
 * @param field - Field configuration
 * @param value - Date value to validate
 * @returns Validation result with error message if invalid
 */
export const validateDateInput = (
  field: FormField,
  value: string | null | undefined
): { valid: boolean; error?: string } => {
  const schema = generateDateInputSchema(field);

  try {
    schema.parse(value || '');
    return { valid: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstError = error.issues[0];
      return {
        valid: false,
        error: firstError?.message || 'Invalid date value',
      };
    }
    return { valid: false, error: 'Invalid date value' };
  }
};

/**
 * Get default date value from field configuration
 * 
 * @param field - Field configuration
 * @returns Default date value (ISO string YYYY-MM-DD)
 */
export const getDefaultDateInputValue = (field: FormField): string => {
  const defaultValue = field.default_value;

  // If default_value is a valid date string
  if (typeof defaultValue === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(defaultValue)) {
    return defaultValue;
  }

  // Default to empty string
  return '';
};

/**
 * Format ISO date string for display
 * 
 * @param isoDate - ISO date string (YYYY-MM-DD)
 * @returns Formatted date string (e.g., "Dec 15, 2025")
 */
export const formatDateForDisplay = (isoDate: string): string => {
  try {
    const date = new Date(isoDate);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return isoDate;
  }
};

/**
 * Get min date for input based on validation rules
 * Returns the most restrictive min date
 * 
 * @param rules - Field validation rules
 * @returns Min date string or null
 */
export const getMinDate = (rules: FieldRule[]): string | null => {
  const { after, afterOrEqual } = extractDateValidationBounds(rules);
  
  if (after && afterOrEqual) {
    // Return the later of the two dates
    return compareDates(after, afterOrEqual) > 0 ? after : afterOrEqual;
  }
  
  return after || afterOrEqual;
};

/**
 * Get max date for input based on validation rules
 * Returns the most restrictive max date
 * 
 * @param rules - Field validation rules
 * @returns Max date string or null
 */
export const getMaxDate = (rules: FieldRule[]): string | null => {
  const { before, beforeOrEqual } = extractDateValidationBounds(rules);
  
  if (before && beforeOrEqual) {
    // Return the earlier of the two dates
    return compareDates(before, beforeOrEqual) < 0 ? before : beforeOrEqual;
  }
  
  return before || beforeOrEqual;
};

/**
 * Check if a date string is valid
 * 
 * @param dateString - Date string to validate
 * @returns True if valid date
 */
export const isValidDate = (dateString: string): boolean => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateString)) return false;
  const date = new Date(dateString);
  return !isNaN(date.getTime());
};
