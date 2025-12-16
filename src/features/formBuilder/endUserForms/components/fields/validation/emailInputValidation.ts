/**
 * ================================
 * EMAIL INPUT FIELD VALIDATION
 * ================================
 * Zod schema generation for Email Input fields based on field rules
 * Handles: required, regex, starts_with, ends_with
 * Note: same/different validation handled at form level via superRefine
 * Note: unique is ignored (server-side validation)
 */

import { z } from 'zod';
import type { FormField, FieldRule } from '@/features/formBuilder/endUserForms/types/formStructure.types';

/**
 * Extract validation rules from field
 * 
 * @param rules - Field validation rules
 * @returns Object with validation parameters
 */
const extractEmailValidationRules = (
  rules: FieldRule[]
): {
  regex: string | null;
  startsWith: string[] | null;
  endsWith: string[] | null;
  sameAs: number | null;
  differentFrom: number | null;
} => {
  let regex: string | null = null;
  let startsWith: string[] | null = null;
  let endsWith: string[] | null = null;
  let sameAs: number | null = null;
  let differentFrom: number | null = null;

  rules.forEach((rule) => {
    switch (rule.rule_name) {
      case 'regex':
        const regexProps = rule.rule_props as { pattern?: string } | null;
        if (regexProps?.pattern) regex = regexProps.pattern;
        break;
      case 'starts_with':
        const startsProps = rule.rule_props as { values?: string[] } | null;
        if (startsProps?.values) startsWith = startsProps.values;
        break;
      case 'ends_with':
        const endsProps = rule.rule_props as { values?: string[] } | null;
        if (endsProps?.values) endsWith = endsProps.values;
        break;
      case 'same':
        const sameProps = rule.rule_props as { comparevalue?: number | string } | null;
        if (sameProps?.comparevalue) {
          sameAs = typeof sameProps.comparevalue === 'number' 
            ? sameProps.comparevalue 
            : parseInt(sameProps.comparevalue);
        }
        break;
      case 'different':
        const diffProps = rule.rule_props as { comparevalue?: number | string } | null;
        if (diffProps?.comparevalue) {
          differentFrom = typeof diffProps.comparevalue === 'number' 
            ? diffProps.comparevalue 
            : parseInt(diffProps.comparevalue);
        }
        break;
    }
  });

  return { regex, startsWith, endsWith, sameAs, differentFrom };
};

/**
 * Generate Zod schema for Email Input field based on field rules
 * Note: same/different validation is handled at form level via superRefine
 * 
 * @param field - Field configuration from API
 * @returns Zod schema for email validation
 */
export const generateEmailInputSchema = (
  field: FormField
): z.ZodType<string> => {
  // Check if field is required
  const isRequired = field.rules?.some(
    (rule) => rule.rule_name === 'required'
  ) ?? false;

  // Extract validation rules
  const { regex, startsWith, endsWith } = extractEmailValidationRules(
    field.rules || []
  );

  console.debug('[emailInputValidation] Generating schema for field:', {
    fieldId: field.field_id,
    isRequired,
    hasRegex: !!regex,
    startsWith,
    endsWith,
  });

  // Base schema for string
  let schema = z.string();

  // If regex rule exists, use it instead of default email validation
  if (regex) {
    try {
      const regexPattern = new RegExp(regex);
      schema = schema.regex(regexPattern, `${field.label} does not match the required pattern`);
    } catch (error) {
      console.error('[emailInputValidation] Invalid regex pattern:', regex);
      // Fallback to email validation if regex is invalid
      schema = schema.email(`${field.label} must be a valid email address`);
    }
  } else {
    // Default email validation
    schema = schema.email(`${field.label} must be a valid email address`);
  }

  // Apply starts_with validation
  if (startsWith && startsWith.length > 0) {
    schema = schema.refine(
      (value) => {
        if (!value) return true; // Skip if empty (handled by required)
        return startsWith.some((prefix) => value.startsWith(prefix));
      },
      {
        message: `${field.label} must start with: ${startsWith.join(' or ')}`,
      }
    );
  }

  // Apply ends_with validation
  if (endsWith && endsWith.length > 0) {
    schema = schema.refine(
      (value) => {
        if (!value) return true; // Skip if empty (handled by required)
        return endsWith.some((suffix) => value.endsWith(suffix));
      },
      {
        message: `${field.label} must end with: ${endsWith.join(' or ')}`,
      }
    );
  }

  // Note: same/different validation will be handled at the form level with superRefine

  // If not required, allow empty string
  if (!isRequired) {
    return z.union([schema, z.literal('')]);
  }

  // If required, ensure not empty
  return schema.min(1, `${field.label} is required`);
};

/**
 * Validate email value against field rules
 * 
 * @param field - Field configuration
 * @param value - Email value to validate
 * @returns Validation result with error message if invalid
 */
export const validateEmailInput = (
  field: FormField,
  value: string | null | undefined
): { valid: boolean; error?: string } => {
  const schema = generateEmailInputSchema(field);

  try {
    schema.parse(value || '');
    return { valid: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstError = error.issues[0];
      return {
        valid: false,
        error: firstError?.message || 'Invalid email',
      };
    }
    return { valid: false, error: 'Invalid email' };
  }
};

/**
 * Get default email value from field configuration
 * 
 * @param field - Field configuration
 * @returns Default email value (string)
 */
export const getDefaultEmailInputValue = (field: FormField): string => {
  const defaultValue = field.default_value;

  // If default_value is a string
  if (typeof defaultValue === 'string') {
    return defaultValue;
  }

  // Default to empty string
  return '';
};

/**
 * Check if field has regex rule (overrides default email validation)
 * 
 * @param field - Field configuration
 * @returns True if regex rule exists
 */
export const hasRegexRule = (field: FormField): boolean => {
  return field.rules?.some((rule) => rule.rule_name === 'regex') ?? false;
};

/**
 * Get comparison field ID for same/different rules
 * 
 * @param field - Field configuration
 * @param ruleName - Rule name ('same' or 'different')
 * @returns Field ID to compare with, or null
 */
export const getComparisonFieldId = (field: FormField, ruleName: 'same' | 'different'): number | null => {
  const rule = field.rules?.find((r) => r.rule_name === ruleName);
  if (!rule?.rule_props) return null;
  
  const props = rule.rule_props as { comparevalue?: number | string };
  if (!props.comparevalue) return null;
  
  return typeof props.comparevalue === 'number' 
    ? props.comparevalue 
    : parseInt(props.comparevalue);
};

/**
 * Check if field has same/different rules
 * 
 * @param field - Field configuration
 * @returns Object indicating which cross-field rules exist
 */
export const getCrossFieldRules = (field: FormField): {
  hasSame: boolean;
  hasDifferent: boolean;
  sameFieldId: number | null;
  differentFieldId: number | null;
} => {
  const sameFieldId = getComparisonFieldId(field, 'same');
  const differentFieldId = getComparisonFieldId(field, 'different');

  return {
    hasSame: sameFieldId !== null,
    hasDifferent: differentFieldId !== null,
    sameFieldId,
    differentFieldId,
  };
};
