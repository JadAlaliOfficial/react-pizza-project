/**
 * ================================
 * NUMBER INPUT FIELD TYPES
 * ================================
 * TypeScript types for Number Input field component
 */

import type { FormField } from '@/features/formBuilder/endUserForms/types/formStructure.types';

/**
 * Number value type
 */
export type NumberValue = number;

/**
 * Props for NumberInput component
 */
export interface NumberInputProps {
  /**
   * Field configuration from API
   */
  field: FormField;
  
  /**
   * Current value of the number field
   */
  value?: number | null;
  
  /**
   * Callback when number value changes
   */
  onChange: (value: number) => void;
  
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
