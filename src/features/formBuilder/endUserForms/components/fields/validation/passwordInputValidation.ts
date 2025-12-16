/**
 * ================================
 * PASSWORD INPUT FIELD VALIDATION
 * ================================
 * Zod schema generation for Password Input fields based on field rules
 * Handles: required
 * Note: same/different validation handled at form level via superRefine
 */

import { z } from 'zod';
import type { FormField, FieldRule } from '@/features/formBuilder/endUserForms/types/formStructure.types';
import type { PasswordStrength } from '../types/passwordInputField.types';

/**
 * Get comparison field IDs for same/different rules
 * 
 * @param rules - Field validation rules
 * @returns Object with comparison field IDs
 */
export const getCrossFieldRules = (
  rules: FieldRule[]
): { sameAs: number | null; differentFrom: number | null } => {
  let sameAs: number | null = null;
  let differentFrom: number | null = null;

  rules.forEach((rule) => {
    if (rule.rule_name === 'same' && rule.rule_props) {
      const props = rule.rule_props as { comparevalue?: number | string };
      if (props.comparevalue) {
        sameAs = typeof props.comparevalue === 'number' 
          ? props.comparevalue 
          : parseInt(props.comparevalue);
      }
    }
    if (rule.rule_name === 'different' && rule.rule_props) {
      const props = rule.rule_props as { comparevalue?: number | string };
      if (props.comparevalue) {
        differentFrom = typeof props.comparevalue === 'number' 
          ? props.comparevalue 
          : parseInt(props.comparevalue);
      }
    }
  });

  return { sameAs, differentFrom };
};

/**
 * Generate Zod schema for Password Input field based on field rules
 * Note: same/different validation is handled at form level via superRefine
 * 
 * @param field - Field configuration from API
 * @returns Zod schema for password validation
 */
export const generatePasswordInputSchema = (
  field: FormField
): z.ZodType<string> => {
  // Check if field is required
  const isRequired = field.rules?.some(
    (rule) => rule.rule_name === 'required'
  ) ?? false;

  console.debug('[passwordInputValidation] Generating schema for field:', {
    fieldId: field.field_id,
    isRequired,
  });

  // Base schema for string
  let schema = z.string();

  // If not required, allow empty string
  if (!isRequired) {
    return z.union([schema, z.literal('')]);
  }

  // If required, ensure not empty
  return schema.min(1, `${field.label} is required`);
};

/**
 * Validate password value against field rules
 * 
 * @param field - Field configuration
 * @param value - Password value to validate
 * @returns Validation result with error message if invalid
 */
export const validatePasswordInput = (
  field: FormField,
  value: string | null | undefined
): { valid: boolean; error?: string } => {
  const schema = generatePasswordInputSchema(field);

  try {
    schema.parse(value || '');
    return { valid: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstError = error.issues[0];
      return {
        valid: false,
        error: firstError?.message || 'Invalid password',
      };
    }
    return { valid: false, error: 'Invalid password' };
  }
};

/**
 * Get default password value from field configuration
 * 
 * @param field - Field configuration
 * @returns Default password value (empty string - passwords don't have defaults)
 */
export const getDefaultPasswordInputValue = (_field: FormField): string => {
  // Passwords should never have default values for security reasons
  return '';
};

/**
 * Calculate password strength based on common criteria
 * 
 * @param password - Password string
 * @returns Strength level
 */
export const calculatePasswordStrength = (password: string): PasswordStrength => {
  if (!password || password.length === 0) {
    return 'weak';
  }

  let score = 0;

  // Length check
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;

  // Contains lowercase
  if (/[a-z]/.test(password)) score++;

  // Contains uppercase
  if (/[A-Z]/.test(password)) score++;

  // Contains numbers
  if (/\d/.test(password)) score++;

  // Contains special characters
  if (/[^a-zA-Z0-9]/.test(password)) score++;

  // Map score to strength
  if (score <= 2) return 'weak';
  if (score <= 3) return 'fair';
  if (score <= 4) return 'good';
  return 'strong';
};

/**
 * Get password strength color
 * 
 * @param strength - Password strength
 * @returns Tailwind color class
 */
export const getPasswordStrengthColor = (strength: PasswordStrength): string => {
  switch (strength) {
    case 'weak':
      return 'bg-red-500';
    case 'fair':
      return 'bg-orange-500';
    case 'good':
      return 'bg-yellow-500';
    case 'strong':
      return 'bg-green-500';
  }
};

/**
 * Get password strength text color
 * 
 * @param strength - Password strength
 * @returns Tailwind text color class
 */
export const getPasswordStrengthTextColor = (strength: PasswordStrength): string => {
  switch (strength) {
    case 'weak':
      return 'text-red-600';
    case 'fair':
      return 'text-orange-600';
    case 'good':
      return 'text-yellow-600';
    case 'strong':
      return 'text-green-600';
  }
};

/**
 * Get number of strength bars to fill
 * 
 * @param strength - Password strength
 * @returns Number of bars (1-4)
 */
export const getPasswordStrengthBars = (strength: PasswordStrength): number => {
  switch (strength) {
    case 'weak':
      return 1;
    case 'fair':
      return 2;
    case 'good':
      return 3;
    case 'strong':
      return 4;
  }
};
