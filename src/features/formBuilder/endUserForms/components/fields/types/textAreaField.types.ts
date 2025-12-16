/**
 * ================================
 * TEXT AREA FIELD TYPES
 * ================================
 * TypeScript types for Text Area field component
 */

import type { FormField } from '@/features/formBuilder/endUserForms/types/formStructure.types';

/**
 * Text Area value type
 * Multi-line string value
 */
export type TextAreaValue = string;

/**
 * Props for TextArea component
 */
export interface TextAreaProps {
  /**
   * Field configuration from API
   */
  field: FormField;
  
  /**
   * Current value of the text area field
   */
  value?: string | null;
  
  /**
   * Callback when text area value changes
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
   * Number of visible rows (default: 4)
   */
  rows?: number;
}
