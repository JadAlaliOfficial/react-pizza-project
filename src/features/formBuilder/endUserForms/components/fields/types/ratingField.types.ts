/**
 * ================================
 * RATING FIELD TYPES
 * ================================
 * TypeScript types for Rating field component
 */

import type { FormField } from '@/features/formBuilder/endUserForms/types/formStructure.types';

/**
 * Rating value type
 * Number from 0 to maxStars (typically 5)
 */
export type RatingValue = number;

/**
 * Props for Rating component
 */
export interface RatingProps {
  /**
   * Field configuration from API
   */
  field: FormField;
  
  /**
   * Current value of the rating field (0-5)
   */
  value?: number | null;
  
  /**
   * Callback when rating value changes
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
  
  /**
   * Maximum number of stars (default: 5)
   */
  maxStars?: number;

  /**
   * Callback when field loses focus
   */
  onBlur?: () => void;
}
