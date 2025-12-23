/**
 * ================================
 * FILE UPLOAD FIELD TYPES
 * ================================
 * TypeScript types for File Upload field component
 */

import type { FormField } from '@/features/formBuilder/endUserForms/types/formStructure.types';

/**
 * File upload value type
 * Can be File object or null
 */
export type FileUploadValue = File | null;

/**
 * Props for FileUpload component
 */
export interface FileUploadProps {
  /**
   * Field configuration from API
   */
  field: FormField;
  
  /**
   * Current value of the file field (File object)
   */
  value?: File | null;
  
  /**
   * Callback when file value changes
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
   * Callback when the field loses focus
   */
  onBlur?: () => void;
}
