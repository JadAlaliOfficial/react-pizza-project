/**
 * ================================
 * PHONE INPUT FIELD VALIDATION
 * ================================
 * Zod schema generation for Phone Input fields based on field rules
 * Handles: required, regex, starts_with, unique
 * Uses international phone number format (E.164)
 */

import { z } from 'zod';
import type { FormField } from '@/features/formBuilder/endUserForms/types/formStructure.types';

/**
 * Basic phone number pattern (E.164 format)
 * Starts with +, followed by 1-15 digits
 */
const E164_PATTERN = /^\+[1-9]\d{1,14}$/;

/**
 * Validate phone number format (basic E.164 check)
 * 
 * @param phone - Phone number string
 * @returns True if valid E.164 format
 */
export const isValidPhoneFormat = (phone: string): boolean => {
  if (!phone) return false;
  return E164_PATTERN.test(phone);
};

/**
 * Format phone number for display
 * Converts E.164 to national format
 * 
 * @param phone - Phone number in E.164 format
 * @returns Formatted phone number
 */
export const formatPhoneNumber = (phone: string): string => {
  if (!phone) return '';
  
  // Basic formatting for US numbers
  if (phone.startsWith('+1') && phone.length === 12) {
    const cleaned = phone.substring(2);
    return `(${cleaned.substring(0, 3)}) ${cleaned.substring(3, 6)}-${cleaned.substring(6)}`;
  }
  
  // Return as-is for other formats
  return phone;
};

/**
 * Clean phone number input (remove non-digit characters except +)
 * 
 * @param phone - Phone number string
 * @returns Cleaned phone number
 */
export const cleanPhoneNumber = (phone: string): string => {
  if (!phone) return '';
  
  // Keep only digits and leading +
  const cleaned = phone.replace(/[^\d+]/g, '');
  
  // Ensure only one + at the start
  if (cleaned.startsWith('+')) {
    return '+' + cleaned.substring(1).replace(/\+/g, '');
  }
  
  return cleaned;
};

/**
 * Generate Zod schema for Phone Input field based on field rules
 * 
 * @param field - Field configuration from API
 * @returns Zod schema for phone validation
 */
export const generatePhoneInputSchema = (field: FormField): z.ZodType<string> => {
  // Check if field is required
  const isRequired = field.rules?.some(
    (rule) => rule.rule_name === 'required'
  ) ?? false;

  // Find specific rules
  const regexRule = field.rules?.find((rule) => rule.rule_name === 'regex');
  const startsWithRule = field.rules?.find((rule) => rule.rule_name === 'starts_with');

  console.debug('[phoneInputValidation] Generating schema for field:', {
    fieldId: field.field_id,
    isRequired,
    hasRegex: !!regexRule,
    hasStartsWith: !!startsWithRule,
  });

  // Base schema for string
  let schema = z.string();

  // Apply basic phone format validation
  schema = schema.refine(
    (value) => {
      if (!value) return !isRequired;
      
      // Clean the value first
      const cleaned = cleanPhoneNumber(value);
      
      // Check if it's a valid phone format
      return isValidPhoneFormat(cleaned);
    },
    {
      message: `${field.label} must be a valid phone number`,
    }
  );

  // Apply custom regex validation (overrides default if present)
  if (regexRule?.rule_props) {
    const props = regexRule.rule_props as { pattern?: string };
    if (props.pattern) {
      try {
        const regex = new RegExp(props.pattern);
        schema = schema.refine(
          (value) => {
            if (!value) return !isRequired;
            return regex.test(value);
          },
          {
            message: `${field.label} format is invalid`,
          }
        );
      } catch (e) {
        console.error('[phoneInputValidation] Invalid regex pattern:', props.pattern);
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

  // If not required, allow empty string
  if (!isRequired) {
    return z.union([schema, z.literal('')]);
  }

  // If required, ensure non-empty
  return schema.min(1, `${field.label} is required`);
};

/**
 * Validate phone value against field rules
 * 
 * @param field - Field configuration
 * @param value - Phone value to validate
 * @returns Validation result with error message if invalid
 */
export const validatePhoneInput = (
  field: FormField,
  value: string | null | undefined
): { valid: boolean; error?: string } => {
  const schema = generatePhoneInputSchema(field);

  try {
    schema.parse(value || '');
    return { valid: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstError = error.issues[0];
      return {
        valid: false,
        error: firstError?.message || 'Invalid phone number',
      };
    }
    return { valid: false, error: 'Invalid phone number' };
  }
};

/**
 * Get default phone value from field configuration
 * 
 * @param field - Field configuration
 * @returns Default phone value
 */
export const getDefaultPhoneInputValue = (field: FormField): string => {
  // Try default_value first
  if (field.default_value !== null && field.default_value !== undefined) {
    const value = String(field.default_value);
    const cleaned = cleanPhoneNumber(value);
    
    // Ensure it starts with +
    if (cleaned && !cleaned.startsWith('+')) {
      return '+' + cleaned;
    }
    
    return cleaned;
  }

  // Try current_value
  if (field.current_value !== null && field.current_value !== undefined) {
    const value = String(field.current_value);
    const cleaned = cleanPhoneNumber(value);
    
    // Ensure it starts with +
    if (cleaned && !cleaned.startsWith('+')) {
      return '+' + cleaned;
    }
    
    return cleaned;
  }

  // Return empty string
  return '';
};

/**
 * Get country code from phone number
 * 
 * @param phone - Phone number in E.164 format
 * @returns Country calling code (e.g., "+1", "+44")
 */
export const getCountryCode = (phone: string): string | null => {
  if (!phone || !phone.startsWith('+')) return null;
  
  // Simple extraction for common codes
  const match = phone.match(/^\+(\d{1,3})/);
  return match ? '+' + match[1] : null;
};

/**
 * Common country calling codes
 */
export const COMMON_COUNTRY_CODES = [
  { code: '+1', country: 'US', name: 'United States' },
  { code: '+1', country: 'CA', name: 'Canada' },
  { code: '+44', country: 'GB', name: 'United Kingdom' },
  { code: '+61', country: 'AU', name: 'Australia' },
  { code: '+86', country: 'CN', name: 'China' },
  { code: '+91', country: 'IN', name: 'India' },
  { code: '+49', country: 'DE', name: 'Germany' },
  { code: '+33', country: 'FR', name: 'France' },
  { code: '+81', country: 'JP', name: 'Japan' },
  { code: '+82', country: 'KR', name: 'South Korea' },
] as const;
