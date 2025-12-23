/**
 * ================================
 * VIDEO UPLOAD FIELD TYPES
 * ================================
 * TypeScript types for Video Upload field component
 */

import type { FormField } from '@/features/formBuilder/endUserForms/types/formStructure.types';

/**
 * Video upload value type
 * File object or null
 */
export type VideoUploadValue = File | null;

/**
 * Props for VideoUpload component
 */
export interface VideoUploadProps {
  /**
   * Field configuration from API
   */
  field: FormField;
  
  /**
   * Current value of the video upload field
   */
  value?: File | null;
  
  /**
   * Callback when video file changes
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
 * Video file metadata
 */
export interface VideoMetadata {
  name: string;
  size: number;
  type: string;
  duration?: number;
  url: string;
}
