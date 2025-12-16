/**
 * ================================
 * DATETIME INPUT FIELD VALIDATION
 * ================================
 * Zod schema generation for DateTime Input fields based on field rules
 * Handles: required, before, after, before_or_equal, after_or_equal
 */

import { z } from 'zod';
import type { FormField, FieldRule } from '@/features/formBuilder/endUserForms/types/formStructure.types';

/**
 * Extract datetime validation bounds from rules
 * Handles before, after, before_or_equal, after_or_equal rules
 * 
 * @param rules - Field validation rules
 * @returns Object with validation dates
 */
const extractDateTimeValidationBounds = (
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
 * Compare two datetime strings
 * Handles both date-only (YYYY-MM-DD) and datetime (YYYY-MM-DDTHH:mm) formats
 * 
 * @param datetime1 - First datetime string
 * @param datetime2 - Second datetime string
 * @returns -1 if datetime1 < datetime2, 0 if equal, 1 if datetime1 > datetime2
 */
const compareDateTimes = (datetime1: string, datetime2: string): number => {
  const d1 = new Date(datetime1);
  const d2 = new Date(datetime2);
  
  if (d1 < d2) return -1;
  if (d1 > d2) return 1;
  return 0;
};

/**
 * Generate Zod schema for DateTime Input field based on field rules
 * 
 * @param field - Field configuration from API
 * @returns Zod schema for datetime input validation
 */
export const generateDateTimeInputSchema = (field: FormField): z.ZodType<string> => {
  // Check if field is required
  const isRequired = field.rules?.some(
    (rule) => rule.rule_name === 'required'
  ) ?? false;

  // Extract datetime validation bounds
  const { before, after, beforeOrEqual, afterOrEqual } = extractDateTimeValidationBounds(
    field.rules || []
  );

  console.debug('[dateTimeInputValidation] Generating schema for field:', {
    fieldId: field.field_id,
    isRequired,
    before,
    after,
    beforeOrEqual,
    afterOrEqual,
  });

  // Base schema for datetime string (ISO format: YYYY-MM-DDTHH:mm)
  let schema = z.string().regex(
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/,
    'DateTime must be in YYYY-MM-DDTHH:mm format'
  );

  // Apply after validation
  if (after) {
    schema = schema.refine(
      (datetime) => compareDateTimes(datetime, after) > 0,
      {
        message: `${field.label} must be after ${formatDateTimeForDisplay(after)}`,
      }
    );
  }

  // Apply after_or_equal validation
  if (afterOrEqual) {
    schema = schema.refine(
      (datetime) => compareDateTimes(datetime, afterOrEqual) >= 0,
      {
        message: `${field.label} must be on or after ${formatDateTimeForDisplay(afterOrEqual)}`,
      }
    );
  }

  // Apply before validation
  if (before) {
    schema = schema.refine(
      (datetime) => compareDateTimes(datetime, before) < 0,
      {
        message: `${field.label} must be before ${formatDateTimeForDisplay(before)}`,
      }
    );
  }

  // Apply before_or_equal validation
  if (beforeOrEqual) {
    schema = schema.refine(
      (datetime) => compareDateTimes(datetime, beforeOrEqual) <= 0,
      {
        message: `${field.label} must be on or before ${formatDateTimeForDisplay(beforeOrEqual)}`,
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
 * Validate datetime value against field rules
 * 
 * @param field - Field configuration
 * @param value - DateTime value to validate
 * @returns Validation result with error message if invalid
 */
export const validateDateTimeInput = (
  field: FormField,
  value: string | null | undefined
): { valid: boolean; error?: string } => {
  const schema = generateDateTimeInputSchema(field);

  try {
    schema.parse(value || '');
    return { valid: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstError = error.issues[0];
      return {
        valid: false,
        error: firstError?.message || 'Invalid datetime value',
      };
    }
    return { valid: false, error: 'Invalid datetime value' };
  }
};

/**
 * Get default datetime value from field configuration
 * 
 * @param field - Field configuration
 * @returns Default datetime value (ISO string YYYY-MM-DDTHH:mm)
 */
export const getDefaultDateTimeInputValue = (field: FormField): string => {
  const defaultValue = field.default_value;

  // If default_value is a valid datetime string
  if (typeof defaultValue === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(defaultValue)) {
    // Return first 16 characters (YYYY-MM-DDTHH:mm)
    return defaultValue.substring(0, 16);
  }

  // Default to empty string
  return '';
};

/**
 * Format ISO datetime string for display
 * 
 * @param isoDateTime - ISO datetime string (YYYY-MM-DDTHH:mm or YYYY-MM-DD)
 * @returns Formatted datetime string (e.g., "Dec 15, 2025 at 8:00 AM")
 */
export const formatDateTimeForDisplay = (isoDateTime: string): string => {
  try {
    const date = new Date(isoDateTime);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  } catch {
    return isoDateTime;
  }
};

/**
 * Get min datetime for input based on validation rules
 * Returns the most restrictive min datetime
 * 
 * @param rules - Field validation rules
 * @returns Min datetime string or null
 */
export const getMinDateTime = (rules: FieldRule[]): string | null => {
  const { after, afterOrEqual } = extractDateTimeValidationBounds(rules);
  
  if (after && afterOrEqual) {
    // Return the later of the two datetimes
    return compareDateTimes(after, afterOrEqual) > 0 ? after : afterOrEqual;
  }
  
  return after || afterOrEqual;
};

/**
 * Get max datetime for input based on validation rules
 * Returns the most restrictive max datetime
 * 
 * @param rules - Field validation rules
 * @returns Max datetime string or null
 */
export const getMaxDateTime = (rules: FieldRule[]): string | null => {
  const { before, beforeOrEqual } = extractDateTimeValidationBounds(rules);
  
  if (before && beforeOrEqual) {
    // Return the earlier of the two datetimes
    return compareDateTimes(before, beforeOrEqual) < 0 ? before : beforeOrEqual;
  }
  
  return before || beforeOrEqual;
};

/**
 * Check if a datetime string is valid
 * 
 * @param datetimeString - DateTime string to validate
 * @returns True if valid datetime
 */
export const isValidDateTime = (datetimeString: string): boolean => {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(datetimeString)) return false;
  const date = new Date(datetimeString);
  return !isNaN(date.getTime());
};

/**
 * Convert date-only string to datetime string (adds T00:00)
 * 
 * @param dateString - Date string (YYYY-MM-DD)
 * @returns DateTime string (YYYY-MM-DDTHH:mm)
 */
export const dateToDateTime = (dateString: string): string => {
  if (/^\d{4}-\d{2}-\d{2}T/.test(dateString)) {
    return dateString.substring(0, 16);
  }
  return `${dateString}T00:00`;
};
