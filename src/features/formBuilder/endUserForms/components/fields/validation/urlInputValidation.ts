/**
 * ================================
 * URL INPUT FIELD VALIDATION
 * ================================
 * Zod schema generation for URL Input fields based on field rules
 * Handles: required, url, min, max, starts_with, ends_with, unique
 */

import { z } from 'zod';
import type { FormField, FieldRule } from '@/features/formBuilder/endUserForms/types/formStructure.types';

/**
 * Extract length bounds from rules
 * 
 * @param rules - Field validation rules
 * @returns Object with min and max length bounds
 */
const extractLengthBounds = (
  rules: FieldRule[]
): { min: number | null; max: number | null } => {
  let min: number | null = null;
  let max: number | null = null;

  const minRule = rules.find((rule) => rule.rule_name === 'min');
  if (minRule?.rule_props) {
    const props = minRule.rule_props as { value?: number };
    if (typeof props.value === 'number' && props.value > 0) {
      min = props.value;
    }
  }

  const maxRule = rules.find((rule) => rule.rule_name === 'max');
  if (maxRule?.rule_props) {
    const props = maxRule.rule_props as { value?: number };
    if (typeof props.value === 'number') max = props.value;
  }

  return { min, max };
};

/**
 * Auto-prepend protocol if missing
 * 
 * @param url - URL string
 * @returns URL with protocol
 */
export const ensureProtocol = (url: string): string => {
  if (!url) return url;
  
  const trimmed = url.trim();
  
  // Check if protocol already exists (case insensitive)
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }
  
  // Prepend https:// by default
  return `https://${trimmed}`;
};

/**
 * Validate URL format
 * 
 * @param url - URL string to validate
 * @returns True if valid URL
 */
export const isValidUrl = (url: string): boolean => {
  if (!url) return false;
  
  try {
    const urlObj = new URL(url);
    // Ensure protocol is http or https
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
  } catch {
    return false;
  }
};

/**
 * Generate Zod schema for URL Input field based on field rules
 * 
 * @param field - Field configuration from API
 * @returns Zod schema for URL validation
 */
export const generateUrlInputSchema = (field: FormField): z.ZodType<string> => {
  // Check if field is required
  const isRequired = field.rules?.some(
    (rule) => rule.rule_name === 'required'
  ) ?? false;

  // Check if URL validation is required
  const hasUrlValidation = field.rules?.some(
    (rule) => rule.rule_name === 'url'
  ) ?? false;

  // Extract validation parameters
  const { min, max } = extractLengthBounds(field.rules || []);

  // Find specific rules
  const startsWithRule = field.rules?.find((rule) => rule.rule_name === 'starts_with');
  const endsWithRule = field.rules?.find((rule) => rule.rule_name === 'ends_with');

  console.debug('[urlInputValidation] Generating schema for field:', {
    fieldId: field.field_id,
    isRequired,
    hasUrlValidation,
    min,
    max,
    hasStartsWith: !!startsWithRule,
    hasEndsWith: !!endsWithRule,
  });

  // Base schema for string
  let schema = z.string();

  // Apply URL validation (Zod's built-in URL validator)
  if (hasUrlValidation) {
    schema = schema.url(`${field.label} must be a valid URL`);
  } else {
    // Custom URL validation as fallback
    schema = schema.refine(
      (value) => {
        if (!value) return !isRequired;
        return isValidUrl(value);
      },
      {
        message: `${field.label} must be a valid URL`,
      }
    );
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
 * Validate URL value against field rules
 * 
 * @param field - Field configuration
 * @param value - URL value to validate
 * @returns Validation result with error message if invalid
 */
export const validateUrlInput = (
  field: FormField,
  value: string | null | undefined
): { valid: boolean; error?: string } => {
  const schema = generateUrlInputSchema(field);

  try {
    schema.parse(value || '');
    return { valid: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstError = error.issues[0];
      return {
        valid: false,
        error: firstError?.message || 'Invalid URL',
      };
    }
    return { valid: false, error: 'Invalid URL' };
  }
};

/**
 * Get default URL value from field configuration
 * 
 * @param field - Field configuration
 * @returns Default URL value
 */
export const getDefaultUrlInputValue = (field: FormField): string => {
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
 * Extract domain from URL
 * 
 * @param url - URL string
 * @returns Domain name or empty string
 */
export const extractDomain = (url: string): string => {
  if (!url || !isValidUrl(url)) {
    return '';
  }

  try {
    const urlObj = new URL(url);
    return urlObj.hostname;
  } catch {
    return '';
  }
};
