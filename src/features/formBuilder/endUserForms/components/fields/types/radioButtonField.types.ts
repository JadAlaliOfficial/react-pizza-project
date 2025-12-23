/**
 * ================================
 * RADIO BUTTON FIELD TYPES
 * ================================
 * TypeScript types for Radio Button field component
 */

import type { FormField } from '@/features/formBuilder/endUserForms/types/formStructure.types';

/**
 * Radio button value type
 * Single selected option value
 */
export type RadioButtonValue = string;

/**
 * Props for RadioButton component
 */
export interface RadioButtonProps {
  /**
   * Field configuration from API
   */
  field: FormField;
  
  /**
   * Current value of the radio button field (selected option)
   */
  value?: string | null;
  
  /**
   * Callback when radio button value changes
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

  /**
   * Callback when the field loses focus
   */
  onBlur?: () => void;
}

/**
 * Radio button option type
 */
export interface RadioButtonOption {
  value: string;
  label: string;
}
