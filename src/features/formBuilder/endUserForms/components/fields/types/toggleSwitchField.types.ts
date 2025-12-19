/**
 * ================================
 * TOGGLE SWITCH FIELD TYPES
 * ================================
 * TypeScript types for Toggle Switch field component
 */

import type { FormField } from '@/features/formBuilder/endUserForms/types/formStructure.types';

/**
 * Toggle value type
 * Boolean representing on/off state
 */
export type ToggleValue = boolean;

/**
 * Props for ToggleSwitch component
 */
export interface ToggleSwitchProps {
  /**
   * Field configuration from API
   */
  field: FormField;
  
  /**
   * Current value of the toggle field
   */
  value?: boolean | null;
  
  /**
   * Callback when toggle value changes
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
}
