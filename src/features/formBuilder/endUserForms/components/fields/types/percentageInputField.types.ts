/**
 * ================================
 * PERCENTAGE INPUT FIELD TYPES
 * ================================
 * TypeScript types for Percentage Input field component
 */

import type { FormField } from '@/features/formBuilder/endUserForms/types/formStructure.types';

/**
 * Percentage value type
 * Stored as number (0-100)
 */
export type PercentageValue = number;

/**
 * Props for PercentageInput component
 */
export interface PercentageInputProps {
  /**
   * Field configuration from API
   */
  field: FormField;
  
  /**
   * Current value of the percentage field (number)
   */
  value?: number | null;
  
  /**
   * Callback when percentage value changes
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
