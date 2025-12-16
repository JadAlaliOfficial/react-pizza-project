/**
 * ================================
 * FILE UPLOAD FIELD VALIDATION
 * ================================
 * Zod schema generation for File Upload fields based on field rules
 * Handles: required, mimetypes, min_file_size, max_file_size
 */

import { z } from 'zod';
import type { FormField, FieldRule } from '@/features/formBuilder/endUserForms/types/formStructure.types';

/**
 * Extract file validation rules
 * 
 * @param rules - Field validation rules
 * @returns Object with file validation parameters
 */
const extractFileValidationRules = (
  rules: FieldRule[]
): {
  minSize: number | null;
  maxSize: number | null;
  mimeTypes: string[] | null;
} => {
  let minSize: number | null = null;
  let maxSize: number | null = null;
  let mimeTypes: string[] | null = null;

  rules.forEach((rule) => {
    switch (rule.rule_name) {
      case 'min_file_size':
        const minProps = rule.rule_props as { minsize?: number } | null;
        if (minProps?.minsize) minSize = minProps.minsize;
        break;
      case 'max_file_size':
        const maxProps = rule.rule_props as { maxsize?: number } | null;
        if (maxProps?.maxsize) maxSize = maxProps.maxsize;
        break;
      case 'mimetypes':
        const mimeProps = rule.rule_props as { types?: string[] } | null;
        if (mimeProps?.types) mimeTypes = mimeProps.types;
        break;
    }
  });

  return { minSize, maxSize, mimeTypes };
};

/**
 * Format file size for display
 * 
 * @param sizeInKB - Size in kilobytes
 * @returns Formatted string (e.g., "1.5 MB")
 */
export const formatFileSize = (sizeInKB: number): string => {
  if (sizeInKB < 1024) {
    return `${sizeInKB} KB`;
  }
  const sizeInMB = sizeInKB / 1024;
  return `${sizeInMB.toFixed(1)} MB`;
};

/**
 * Get file size in KB from File object
 * 
 * @param file - File object
 * @returns Size in kilobytes
 */
export const getFileSizeInKB = (file: File): number => {
  return file.size / 1024;
};

/**
 * Check if file matches MIME type pattern
 * Supports wildcards (e.g., image/*, video/*)
 * 
 * @param fileMimeType - File's MIME type
 * @param pattern - MIME type pattern to match
 * @returns True if matches
 */
const matchesMimeType = (fileMimeType: string, pattern: string): boolean => {
  if (pattern === '*/*') return true;
  
  // Handle wildcards (e.g., image/*, video/*)
  if (pattern.endsWith('/*')) {
    const category = pattern.split('/')[0];
    return fileMimeType.startsWith(category + '/');
  }
  
  return fileMimeType === pattern;
};

/**
 * Generate Zod schema for File Upload field based on field rules
 * 
 * @param field - Field configuration from API
 * @returns Zod schema for file upload validation
 */
export const generateFileUploadSchema = (field: FormField): z.ZodType<File | null> => {
  // Check if field is required
  const isRequired = field.rules?.some(
    (rule) => rule.rule_name === 'required'
  ) ?? false;

  // Extract file validation rules
  const { minSize, maxSize, mimeTypes } = extractFileValidationRules(field.rules || []);

  console.debug('[fileUploadValidation] Generating schema for field:', {
    fieldId: field.field_id,
    isRequired,
    minSize,
    maxSize,
    mimeTypes,
  });

  // Base schema for File
  let schema = z.instanceof(File, { message: `${field.label} must be a valid file` });

  // Apply MIME type validation
  if (mimeTypes && mimeTypes.length > 0) {
    schema = schema.refine(
      (file) => mimeTypes.some((type) => matchesMimeType(file.type, type)),
      {
        message: `File type must be one of: ${mimeTypes.join(', ')}`,
      }
    );
  }

  // Apply min file size validation
  if (minSize !== null) {
    schema = schema.refine(
      (file) => getFileSizeInKB(file) >= minSize,
      {
        message: `File size must be at least ${formatFileSize(minSize)}`,
      }
    );
  }

  // Apply max file size validation
  if (maxSize !== null) {
    schema = schema.refine(
      (file) => getFileSizeInKB(file) <= maxSize,
      {
        message: `File size must be less than ${formatFileSize(maxSize)}`,
      }
    );
  }

  // If not required, allow null
  if (!isRequired) {
    return z.union([schema, z.null()]);
  }

  // If required, ensure file is provided
  return schema.refine((file) => file !== null, {
    message: `${field.label} is required`,
  });
};

/**
 * Validate file against field rules
 * 
 * @param field - Field configuration
 * @param file - File to validate
 * @returns Validation result with error message if invalid
 */
export const validateFileUpload = (
  field: FormField,
  file: File | null | undefined
): { valid: boolean; error?: string } => {
  const schema = generateFileUploadSchema(field);

  try {
    schema.parse(file);
    return { valid: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstError = error.issues[0];
      return {
        valid: false,
        error: firstError?.message || 'Invalid file',
      };
    }
    return { valid: false, error: 'Invalid file' };
  }
};

/**
 * Get default file value from field configuration
 * 
 * @param field - Field configuration
 * @returns Default file value (null for uploads)
 */
export const getDefaultFileUploadValue = (_field: FormField): null => {
  // File uploads don't have default values
  return null;
};

/**
 * Get accepted MIME types string for input accept attribute
 * 
 * @param rules - Field validation rules
 * @returns Comma-separated MIME types string
 */
export const getAcceptedMimeTypes = (rules: FieldRule[]): string | undefined => {
  const { mimeTypes } = extractFileValidationRules(rules);
  return mimeTypes?.join(',');
};

/**
 * Get human-readable file types from MIME types
 * 
 * @param mimeTypes - Array of MIME types
 * @returns Human-readable string (e.g., "Images, Videos")
 */
export const getReadableFileTypes = (mimeTypes: string[]): string => {
  const typeNames = mimeTypes.map((type) => {
    if (type.startsWith('image/')) return 'Images';
    if (type.startsWith('video/')) return 'Videos';
    if (type.startsWith('audio/')) return 'Audio';
    if (type === 'application/pdf') return 'PDF';
    if (type.includes('word')) return 'Word';
    if (type.includes('excel') || type.includes('spreadsheet')) return 'Excel';
    if (type.includes('powerpoint') || type.includes('presentation')) return 'PowerPoint';
    return type.split('/')[1]?.toUpperCase() || type;
  });
  
  return [...new Set(typeNames)].join(', ');
};
