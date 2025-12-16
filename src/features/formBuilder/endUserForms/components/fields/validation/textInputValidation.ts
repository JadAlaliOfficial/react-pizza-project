/**
 * ================================
 * TEXT INPUT FIELD VALIDATION
 * ================================
 * Zod schema generation for Text Input fields based on field rules
 * Handles: required, min, max, between, regex, alpha, alpha_num, alpha_dash, starts_with, ends_with
 * Note: same/different validation handled at form level via superRefine
 * Note: unique is ignored (server-side validation)
 */

import { z } from 'zod';
import type { FormField, FieldRule } from '@/features/formBuilder/endUserForms/types/formStructure.types';

/**
 * Extract validation bounds from rules with conflict resolution
 * Priority: individual min/max rules override between rule
 * For text fields, this applies to string length
 * 
 * @param rules - Field validation rules
 * @returns Object with min and max length bounds
 */
const extractValidationBounds = (
  rules: FieldRule[]
): { min: number | null; max: number | null } => {
  let min: number | null = null;
  let max: number | null = null;

  // First, check for between rule
  const betweenRule = rules.find((rule) => rule.rule_name === 'between');
  if (betweenRule?.rule_props) {
    const props = betweenRule.rule_props as { min?: number; max?: number };
    if (typeof props.min === 'number') min = props.min;
    if (typeof props.max === 'number') max = props.max;
  }

  // Then, override with individual min rule (takes priority)
  const minRule = rules.find((rule) => rule.rule_name === 'min');
  if (minRule?.rule_props) {
    const props = minRule.rule_props as { value?: number };
    if (typeof props.value === 'number') min = props.value;
  }

  // Finally, override with individual max rule (takes priority)
  const maxRule = rules.find((rule) => rule.rule_name === 'max');
  if (maxRule?.rule_props) {
    const props = maxRule.rule_props as { value?: number };
    if (typeof props.value === 'number') max = props.value;
  }

  return { min, max };
};

/**
 * Extract validation rules from field
 * 
 * @param rules - Field validation rules
 * @returns Object with validation parameters
 */
const extractTextValidationRules = (
  rules: FieldRule[]
): {
  regex: string | null;
  alpha: boolean;
  alphaNum: boolean;
  alphaDash: boolean;
  startsWith: string[] | null;
  endsWith: string[] | null;
  sameAs: number | null;
  differentFrom: number | null;
} => {
  let regex: string | null = null;
  let alpha = false;
  let alphaNum = false;
  let alphaDash = false;
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
      case 'alpha':
        alpha = true;
        break;
      case 'alpha_num':
        alphaNum = true;
        break;
      case 'alpha_dash':
        alphaDash = true;
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

  return { regex, alpha, alphaNum, alphaDash, startsWith, endsWith, sameAs, differentFrom };
};

/**
 * Get comparison field IDs for same/different rules
 * 
 * @param rules - Field validation rules
 * @returns Object with comparison field IDs
 */
export const getCrossFieldRules = (
  rules: FieldRule[]
): { sameAs: number | null; differentFrom: number | null } => {
  const { sameAs, differentFrom } = extractTextValidationRules(rules);
  return { sameAs, differentFrom };
};

/**
 * Generate Zod schema for Text Input field based on field rules
 * Note: same/different validation is handled at form level via superRefine
 * 
 * @param field - Field configuration from API
 * @returns Zod schema for text validation
 */
export const generateTextInputSchema = (
  field: FormField
): z.ZodType<string> => {
  // Check if field is required
  const isRequired = field.rules?.some(
    (rule) => rule.rule_name === 'required'
  ) ?? false;

  // Extract min/max bounds
  const { min, max } = extractValidationBounds(field.rules || []);

  // Extract other validation rules
  const { regex, alpha, alphaNum, alphaDash, startsWith, endsWith } = extractTextValidationRules(
    field.rules || []
  );

  console.debug('[textInputValidation] Generating schema for field:', {
    fieldId: field.field_id,
    isRequired,
    min,
    max,
    hasRegex: !!regex,
    alpha,
    alphaNum,
    alphaDash,
    startsWith,
    endsWith,
  });

  // Base schema for string
  let schema = z.string();

  // Apply min length validation
  if (min !== null) {
    schema = schema.min(min, `${field.label} must be at least ${min} characters`);
  }

  // Apply max length validation
  if (max !== null) {
    schema = schema.max(max, `${field.label} must be at most ${max} characters`);
  }

  // If regex rule exists, use it (takes priority over alpha rules)
  if (regex) {
    try {
      const regexPattern = new RegExp(regex);
      schema = schema.regex(regexPattern, `${field.label} does not match the required pattern`);
    } catch (error) {
      console.error('[textInputValidation] Invalid regex pattern:', regex);
    }
  } else {
    // Apply alpha rules (only if no regex)
    // Priority: alpha_dash > alpha_num > alpha
    if (alphaDash) {
      schema = schema.regex(
        /^[a-zA-Z0-9_-]*$/,
        `${field.label} must contain only letters, numbers, dashes, and underscores`
      );
    } else if (alphaNum) {
      schema = schema.regex(
        /^[a-zA-Z0-9]*$/,
        `${field.label} must contain only letters and numbers`
      );
    } else if (alpha) {
      schema = schema.regex(
        /^[a-zA-Z]*$/,
        `${field.label} must contain only letters`
      );
    }
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
 * Validate text value against field rules
 * 
 * @param field - Field configuration
 * @param value - Text value to validate
 * @returns Validation result with error message if invalid
 */
export const validateTextInput = (
  field: FormField,
  value: string | null | undefined
): { valid: boolean; error?: string } => {
  const schema = generateTextInputSchema(field);

  try {
    schema.parse(value || '');
    return { valid: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstError = error.issues[0];
      return {
        valid: false,
        error: firstError?.message || 'Invalid text',
      };
    }
    return { valid: false, error: 'Invalid text' };
  }
};

/**
 * Get default text value from field configuration
 * 
 * @param field - Field configuration
 * @returns Default text value (string)
 */
export const getDefaultTextInputValue = (field: FormField): string => {
  const defaultValue = field.default_value;

  // If default_value is a string
  if (typeof defaultValue === 'string') {
    return defaultValue;
  }

  // Default to empty string
  return '';
};

/**
 * Check if field has regex rule
 * 
 * @param field - Field configuration
 * @returns True if regex rule exists
 */
export const hasRegexRule = (field: FormField): boolean => {
  return field.rules?.some((rule) => rule.rule_name === 'regex') ?? false;
};
