/**
 * ================================
 * CHECKBOX FIELD TYPES
 * ================================
 * TypeScript types for Checkbox field component
 */

import type { FormField } from '@/features/formBuilder/endUserForms/types/formStructure.types';

/**
 * Checkbox value type
 * API uses 1 for checked, 0 for unchecked
 */
export type CheckboxValue = boolean;

/**
 * Props for CheckboxInput component
 */
export interface CheckboxInputProps {
  /**
   * Field configuration from API
   */
  field: FormField;
  
  /**
   * Current value of the checkbox field
   */
  value?: boolean;
  
  /**
   * Callback when checkbox value changes
   */
  onChange: (value: boolean) => void;
  
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

  /**
   * Callback when field loses focus
   */
  onBlur?: () => void;
}
