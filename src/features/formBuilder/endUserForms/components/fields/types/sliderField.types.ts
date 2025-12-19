/**
 * ================================
 * SLIDER FIELD TYPES
 * ================================
 * TypeScript types for Slider field component
 */

import type { FormField } from '@/features/formBuilder/endUserForms/types/formStructure.types';

/**
 * Slider value type
 * Number within min/max range
 */
export type SliderValue = number;

/**
 * Props for Slider component
 */
export interface SliderProps {
  /**
   * Field configuration from API
   */
  field: FormField;
  
  /**
   * Current value of the slider field
   */
  value?: number | null;
  
  /**
   * Callback when slider value changes
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
