/**
 * ================================
 * PASSWORD INPUT FIELD TYPES
 * ================================
 * TypeScript types for Password Input field component
 */

import type { FormField } from '@/features/formBuilder/endUserForms/types/formStructure.types';

/**
 * Password value type
 */
export type PasswordValue = string;

/**
 * Password strength levels
 */
export type PasswordStrength = 'weak' | 'fair' | 'good' | 'strong';

/**
 * Props for PasswordInput component
 */
export interface PasswordInputProps {
  /**
   * Field configuration from API
   */
  field: FormField;
  
  /**
   * Current value of the password field
   */
  value?: string | null;
  
  /**
   * Callback when password value changes
   */
  onChange: (value: string) => void;
  
  /**
   * Error message to display (from form validation)
   */
  error?: string;
  
  /**
   * Whether the field is disabled
   */
  disabled?: boolean;
  
  /**
   * Additional CSS classes
   */
  className?: string;
}
