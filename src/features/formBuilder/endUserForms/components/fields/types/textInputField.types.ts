/**
 * ================================
 * TEXT INPUT FIELD TYPES
 * ================================
 * TypeScript types for Text Input field component
 */

import type { FormField } from '@/features/formBuilder/endUserForms/types/formStructure.types';

/**
 * Text value type
 */
export type TextValue = string;

/**
 * Props for TextInput component
 */
export interface TextInputProps {
  /**
   * Field configuration from API
   */
  field: FormField;
  
  /**
   * Current value of the text field
   */
  value?: string | null;
  
  /**
   * Callback when text value changes
   */
  onChange: (value: string) => void;
  
  /**
   * Callback when field loses focus
   */
  onBlur?: () => void;
  
  /**
   * Error message to display (from form validation)
   */
  error?: string;
  
  /**
   * Whether the field is disabled
   */
  disabled?: boolean;
  
  /**
   * Current language ID
   */
  languageId?: number;
  
  /**
   * Additional CSS classes
   */
  className?: string;
}
