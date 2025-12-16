/**
 * ================================
 * PHONE INPUT FIELD TYPES
 * ================================
 * TypeScript types for Phone Input field component
 */

import type { FormField } from '@/features/formBuilder/endUserForms/types/formStructure.types';

/**
 * Phone value type
 * String in E.164 format (e.g., "+12133734253")
 */
export type PhoneValue = string;

/**
 * Props for PhoneInput component
 */
export interface PhoneInputProps {
  /**
   * Field configuration from API
   */
  field: FormField;
  
  /**
   * Current value of the phone field (E.164 format)
   */
  value?: string | null;
  
  /**
   * Callback when phone value changes
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
  
  /**
   * Default country code (ISO 3166-1 alpha-2)
   * Defaults to 'US'
   */
  defaultCountry?: string;
}
