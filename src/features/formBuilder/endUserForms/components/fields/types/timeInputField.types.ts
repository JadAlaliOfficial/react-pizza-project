/**
 * ================================
 * TIME INPUT FIELD TYPES
 * ================================
 * TypeScript types for Time Input field component
 */

import type { FormField } from '@/features/formBuilder/endUserForms/types/formStructure.types';

/**
 * Time value type
 * Format: HH:MM (24-hour format)
 */
export type TimeValue = string;

/**
 * Props for TimeInput component
 */
export interface TimeInputProps {
  /**
   * Field configuration from API
   */
  field: FormField;
  
  /**
   * Current value of the time field (HH:MM format)
   */
  value?: string | null;
  
  /**
   * Callback when time value changes
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
  languageId?: number;
  
  /**
   * Additional CSS classes
   */
  className?: string;
}
