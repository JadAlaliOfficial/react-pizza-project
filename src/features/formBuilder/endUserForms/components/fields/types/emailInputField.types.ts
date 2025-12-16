/**
 * ================================
 * EMAIL INPUT FIELD TYPES
 * ================================
 * TypeScript types for Email Input field component
 */

import type { FormField } from '@/features/formBuilder/endUserForms/types/formStructure.types';

/**
 * Email value type
 */
export type EmailValue = string;

/**
 * Props for EmailInput component
 */
export interface EmailInputProps {
  /**
   * Field configuration from API
   */
  field: FormField;
  
  /**
   * Current value of the email field
   */
  value?: string | null;
  
  /**
   * Callback when email value changes
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
