/**
 * ================================
 * DATETIME INPUT FIELD TYPES
 * ================================
 * TypeScript types for DateTime Input field component
 */

import type { FormField } from '@/features/formBuilder/endUserForms/types/formStructure.types';

/**
 * DateTime value type
 * Stored as ISO datetime string (YYYY-MM-DDTHH:mm)
 */
export type DateTimeValue = string;

/**
 * Props for DateTimeInput component
 */
export interface DateTimeInputProps {
  /**
   * Field configuration from API
   */
  field: FormField;
  
  /**
   * Current value of the datetime field (ISO datetime string)
   */
  value?: string | null;
  
  /**
   * Callback when datetime value changes
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
