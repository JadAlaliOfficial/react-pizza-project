/**
 * ================================
 * MULTI-SELECT FIELD TYPES
 * ================================
 * TypeScript types for Multi-Select field component
 */

import type { FormField } from '@/features/formBuilder/endUserForms/types/formStructure.types';

/**
 * Multi-select value type
 * Array of selected option values
 */
export type MultiSelectValue = string[];

/**
 * Props for MultiSelect component
 */
export interface MultiSelectProps {
  /**
   * Field configuration from API
   */
  field: FormField;
  
  /**
   * Current value of the multi-select field (array of selected values)
   */
  value?: string[] | null;
  
  /**
   * Callback when multi-select value changes
   */
  onChange: (value: string[]) => void;
  
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

/**
 * Multi-select option type
 */
export interface MultiSelectOption {
  value: string;
  label: string;
  checked: boolean;
}
