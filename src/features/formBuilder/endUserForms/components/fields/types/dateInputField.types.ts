/**
 * ================================
 * DATE INPUT FIELD TYPES
 * ================================
 * TypeScript types for Date Input field component
 */

import type { FormField } from '@/features/formBuilder/endUserForms/types/formStructure.types';

/**
 * Date value type
 * Stored as ISO date string (YYYY-MM-DD)
 */
export type DateValue = string;

/**
 * Props for DateInput component
 */
export interface DateInputProps {
  /**
   * Field configuration from API
   */
  field: FormField;
  
  /**
   * Current value of the date field (ISO date string)
   */
  value?: string | null;
  
  /**
   * Callback when date value changes
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

/**
 * Date validation bounds
 */
export interface DateValidationBounds {
  minDate: string | null;
  maxDate: string | null;
}
