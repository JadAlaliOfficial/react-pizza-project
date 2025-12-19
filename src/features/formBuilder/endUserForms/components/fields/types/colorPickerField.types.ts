/**
 * ================================
 * COLOR PICKER FIELD TYPES
 * ================================
 * TypeScript types for Color Picker field component
 */

import type { FormField } from '@/features/formBuilder/endUserForms/types/formStructure.types';

/**
 * Color value type
 * Hex color string format: #RRGGBB
 */
export type ColorValue = string;

/**
 * Props for ColorPickerInput component
 */
export interface ColorPickerInputProps {
  /**
   * Field configuration from API
   */
  field: FormField;
  
  /**
   * Current value of the color picker field (hex color)
   */
  value?: string | null;
  
  /**
   * Callback when color value changes
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
}

/**
 * Preset color palette
 */
export const COLOR_PRESETS = [
  '#ef4444', // Red
  '#f59e0b', // Orange
  '#10b981', // Green
  '#3b82f6', // Blue
  '#8b5cf6', // Purple
  '#ec4899', // Pink
  '#06b6d4', // Cyan
  '#84cc16', // Lime
  '#f97316', // Orange
  '#6366f1', // Indigo
  '#14b8a6', // Teal
  '#a855f7', // Violet
];
