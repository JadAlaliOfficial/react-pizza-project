/**
 * ================================
 * DROPDOWN SELECT FIELD TYPES
 * ================================
 * TypeScript types for Dropdown Select field component
 */

import type { FormField } from '@/features/formBuilder/endUserForms/types/formStructure.types';

/**
 * Dropdown value type
 * Selected option value (string)
 */
export type DropdownValue = string;

/**
 * Props for DropdownSelect component
 */
export interface DropdownSelectProps {
  /**
   * Field configuration from API
   */
  field: FormField;
  
  /**
   * Current value of the dropdown field
   */
  value?: string | null;
  
  /**
   * Callback when dropdown value changes
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

/**
 * Dropdown option type
 */
export interface DropdownOption {
  value: string;
  label: string;
}
