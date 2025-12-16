/**
 * ================================
 * IMAGE UPLOAD FIELD TYPES
 * ================================
 * TypeScript types for Image Upload field component
 */

import type { FormField } from '@/features/formBuilder/endUserForms/types/formStructure.types';

/**
 * Image upload value type
 * Can be File object or null
 */
export type ImageUploadValue = File | null;

/**
 * Props for ImageUpload component
 */
export interface ImageUploadProps {
  /**
   * Field configuration from API
   */
  field: FormField;
  
  /**
   * Current value of the image field (File object)
   */
  value?: File | null;
  
  /**
   * Callback when image value changes
   */
  onChange: (value: File | null) => void;
  
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
}

/**
 * Image dimensions type
 */
export interface ImageDimensions {
  width: number;
  height: number;
}

/**
 * Dimension validation rules
 */
export interface DimensionRules {
  width?: number;
  height?: number;
  minwidth?: number;
  maxwidth?: number;
  minheight?: number;
  maxheight?: number;
}
