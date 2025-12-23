/**
 * ================================
 * URL INPUT FIELD TYPES
 * ================================
 * TypeScript types for URL Input field component
 */

import type { FormField } from '@/features/formBuilder/endUserForms/types/formStructure.types';

/**
 * URL value type
 * String representing a valid URL
 */
export type UrlValue = string;

/**
 * Props for UrlInput component
 */
export interface UrlInputProps {
  /**
   * Field configuration from API
   */
  field: FormField;
  
  /**
   * Current value of the URL field
   */
  value?: string | null;
  
  /**
   * Callback when URL value changes
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
   * Callback when field loses focus
   */
  onBlur?: () => void;
}
