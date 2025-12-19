/**
 * ================================
 * DOCUMENT UPLOAD FIELD TYPES
 * ================================
 * TypeScript types for Document Upload field component
 */

import type { FormField } from '@/features/formBuilder/endUserForms/types/formStructure.types';

/**
 * Document upload value type
 * Can be File object or null
 */
export type DocumentValue = File | null;

/**
 * Props for DocumentUpload component
 */
export interface DocumentUploadProps {
  /**
   * Field configuration from API
   */
  field: FormField;
  
  /**
   * Current value of the document field (File object)
   */
  value?: File | null;
  
  /**
   * Callback when document value changes
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
}

/**
 * File type configuration
 */
export interface FileTypeConfig {
  icon: any; // Lucide icon component
  color: string;
  bgColor: string;
  borderColor: string;
  label: string;
}

/**
 * Common MIME type mappings
 */
export const MIME_TYPE_ICONS: Record<string, FileTypeConfig> = {
  'application/pdf': {
    icon: 'FileText',
    color: 'text-red-600',
    bgColor: 'bg-red-100',
    borderColor: 'border-red-300',
    label: 'PDF',
  },
  'application/msword': {
    icon: 'File',
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    borderColor: 'border-blue-300',
    label: 'Word',
  },
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': {
    icon: 'File',
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    borderColor: 'border-blue-300',
    label: 'Word',
  },
  'application/vnd.ms-excel': {
    icon: 'FileSpreadsheet',
    color: 'text-green-600',
    bgColor: 'bg-green-100',
    borderColor: 'border-green-300',
    label: 'Excel',
  },
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': {
    icon: 'FileSpreadsheet',
    color: 'text-green-600',
    bgColor: 'bg-green-100',
    borderColor: 'border-green-300',
    label: 'Excel',
  },
  'application/vnd.ms-powerpoint': {
    icon: 'FileImage',
    color: 'text-orange-600',
    bgColor: 'bg-orange-100',
    borderColor: 'border-orange-300',
    label: 'PPT',
  },
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': {
    icon: 'FileImage',
    color: 'text-orange-600',
    bgColor: 'bg-orange-100',
    borderColor: 'border-orange-300',
    label: 'PPT',
  },
  'image/*': {
    icon: 'FileImage',
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
    borderColor: 'border-purple-300',
    label: 'Image',
  },
};
