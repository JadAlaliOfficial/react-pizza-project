/**
 * ================================
 * TEXT AREA FIELD VALIDATION
 * ================================
 * Zod schema generation for Text Area fields based on field rules
 * Handles: required, min, max, between, alpha, alpha_num, alpha_dash,
 *          regex, starts_with, ends_with, json
 * Conflict resolution: Character format rules (alpha, alpha_num, etc.) are mutually exclusive
 */

import { z } from 'zod';
import type { FormField, FieldRule } from '@/features/formBuilder/endUserForms/types/formStructure.types';

/**
 * Character format validation types
 * Priority: alpha > alpha_num > alpha_dash (most restrictive to least)
 */
type CharacterFormat = 'alpha' | 'alpha_num' | 'alpha_dash' | null;

/**
 * Extract character format rule with priority resolution
 * 
 * @param rules - Field validation rules
 * @returns Character format type
 */
const extractCharacterFormat = (rules: FieldRule[]): CharacterFormat => {
  // Check for alpha (most restrictive)
  if (rules.some((rule) => rule.rule_name === 'alpha')) {
    return 'alpha';
  }

  // Check for alpha_num (medium restrictive)
  if (rules.some((rule) => rule.rule_name === 'alpha_num')) {
    return 'alpha_num';
  }

  // Check for alpha_dash (least restrictive)
  if (rules.some((rule) => rule.rule_name === 'alpha_dash')) {
    return 'alpha_dash';
  }

  return null;
};

/**
 * Extract length bounds from rules with conflict resolution
 * Priority: individual min/max rules override between rule
 * 
 * @param rules - Field validation rules
 * @returns Object with min and max length bounds
 */
const extractLengthBounds = (
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
 * Generate Zod schema for Text Area field based on field rules
 * 
 * @param field - Field configuration from API
 * @returns Zod schema for text area validation
 */
export const generateTextAreaSchema = (field: FormField): z.ZodType<string> => {
  // Check if field is required
  const isRequired = field.rules?.some(
    (rule) => rule.rule_name === 'required'
  ) ?? false;

  // Extract validation parameters
  const { min, max } = extractLengthBounds(field.rules || []);
  const characterFormat = extractCharacterFormat(field.rules || []);

  // Find specific rules
  const regexRule = field.rules?.find((rule) => rule.rule_name === 'regex');
  const startsWithRule = field.rules?.find((rule) => rule.rule_name === 'starts_with');
  const endsWithRule = field.rules?.find((rule) => rule.rule_name === 'ends_with');
  const jsonRule = field.rules?.find((rule) => rule.rule_name === 'json');

  console.debug('[textAreaValidation] Generating schema for field:', {
    fieldId: field.field_id,
    isRequired,
    min,
    max,
    characterFormat,
    hasRegex: !!regexRule,
    hasStartsWith: !!startsWithRule,
    hasEndsWith: !!endsWithRule,
    hasJson: !!jsonRule,
  });

  // Base schema for string
  let schema = z.string();

  // Apply character format validation
  if (characterFormat === 'alpha') {
    schema = schema.regex(
      /^[a-zA-Z\s]*$/,
      `${field.label} must contain only letters and spaces`
    );
  } else if (characterFormat === 'alpha_num') {
    schema = schema.regex(
      /^[a-zA-Z0-9\s]*$/,
      `${field.label} must contain only letters, numbers, and spaces`
    );
  } else if (characterFormat === 'alpha_dash') {
    schema = schema.regex(
      /^[a-zA-Z0-9\s\-_]*$/,
      `${field.label} must contain only letters, numbers, spaces, dashes, and underscores`
    );
  }

  // Apply custom regex validation
  if (regexRule?.rule_props) {
    const props = regexRule.rule_props as { pattern?: string };
    if (props.pattern) {
      try {
        const regex = new RegExp(props.pattern);
        schema = schema.regex(regex, `${field.label} format is invalid`);
      } catch (e) {
        console.error('[textAreaValidation] Invalid regex pattern:', props.pattern);
      }
    }
  }

  // Apply starts_with validation
  if (startsWithRule?.rule_props) {
    const props = startsWithRule.rule_props as { values?: string[] };
    if (props.values && props.values.length > 0) {
      schema = schema.refine(
        (value) => {
          if (!value) return !isRequired;
          return props.values!.some((prefix) => value.startsWith(prefix));
        },
        {
          message: `${field.label} must start with: ${props.values.join(' or ')}`,
        }
      );
    }
  }

  // Apply ends_with validation
  if (endsWithRule?.rule_props) {
    const props = endsWithRule.rule_props as { values?: string[] };
    if (props.values && props.values.length > 0) {
      schema = schema.refine(
        (value) => {
          if (!value) return !isRequired;
          return props.values!.some((suffix) => value.endsWith(suffix));
        },
        {
          message: `${field.label} must end with: ${props.values.join(' or ')}`,
        }
      );
    }
  }

  // Apply JSON validation
  if (jsonRule) {
    schema = schema.refine(
      (value) => {
        if (!value) return !isRequired;
        try {
          JSON.parse(value);
          return true;
        } catch {
          return false;
        }
      },
      {
        message: `${field.label} must be valid JSON`,
      }
    );
  }

  // Apply min length validation
  if (min !== null) {
    schema = schema.min(min, `${field.label} must be at least ${min} characters`);
  }

  // Apply max length validation
  if (max !== null) {
    schema = schema.max(max, `${field.label} must be at most ${max} characters`);
  }

  // If not required, allow empty string
  if (!isRequired) {
    return z.union([schema, z.literal('')]);
  }

  // If required, ensure non-empty
  return schema.min(1, `${field.label} is required`);
};

/**
 * Validate text area value against field rules
 * 
 * @param field - Field configuration
 * @param value - Text area value to validate
 * @returns Validation result with error message if invalid
 */
export const validateTextArea = (
  field: FormField,
  value: string | null | undefined
): { valid: boolean; error?: string } => {
  const schema = generateTextAreaSchema(field);

  try {
    schema.parse(value || '');
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
 * Get default text area value from field configuration
 * 
 * @param field - Field configuration
 * @returns Default text area value
 */
export const getDefaultTextAreaValue = (field: FormField): string => {
  // Try default_value first
  if (field.default_value !== null && field.default_value !== undefined) {
    return String(field.default_value);
  }

  // Try current_value
  if (field.current_value !== null && field.current_value !== undefined) {
    return String(field.current_value);
  }

  // Return empty string
  return '';
};

/**
 * Get character count info for display
 * 
 * @param value - Current text value
 * @param field - Field configuration
 * @returns Character count string for display
 */
export const getCharacterCountInfo = (
  value: string,
  field: FormField
): string => {
  const { max } = extractLengthBounds(field.rules || []);
  const currentLength = value?.length || 0;

  if (max !== null) {
    return `${currentLength} / ${max}`;
  }

  return `${currentLength}`;
};
