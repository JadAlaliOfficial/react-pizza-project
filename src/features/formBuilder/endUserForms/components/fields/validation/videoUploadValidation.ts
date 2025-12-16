/**
 * ================================
 * VIDEO UPLOAD FIELD VALIDATION
 * ================================
 * Zod schema generation for Video Upload fields based on field rules
 * Handles: required, mimetypes, min_file_size, max_file_size
 */

import { z } from 'zod';
import type { FormField, FieldRule } from '@/features/formBuilder/endUserForms/types/formStructure.types';

/**
 * Common video MIME types
 */
export const COMMON_VIDEO_TYPES = [
  'video/mp4',
  'video/mpeg',
  'video/quicktime',
  'video/x-msvideo',
  'video/x-matroska',
  'video/webm',
  'video/ogg',
] as const;

/**
 * Extract file size bounds from rules (in KB)
 * 
 * @param rules - Field validation rules
 * @returns Object with min and max file size in KB
 */
const extractFileSizeBounds = (
  rules: FieldRule[]
): { minSize: number | null; maxSize: number | null } => {
  let minSize: number | null = null;
  let maxSize: number | null = null;

  const minRule = rules.find((rule) => rule.rule_name === 'min_file_size');
  if (minRule?.rule_props) {
    const props = minRule.rule_props as { minsize?: number };
    if (typeof props.minsize === 'number') minSize = props.minsize;
  }

  const maxRule = rules.find((rule) => rule.rule_name === 'max_file_size');
  if (maxRule?.rule_props) {
    const props = maxRule.rule_props as { maxsize?: number };
    if (typeof props.maxsize === 'number') maxSize = props.maxsize;
  }

  return { minSize, maxSize };
};

/**
 * Extract allowed MIME types from rules
 * 
 * @param rules - Field validation rules
 * @returns Array of allowed MIME types
 */
const extractAllowedMimeTypes = (rules: FieldRule[]): string[] => {
  const mimetypesRule = rules.find((rule) => rule.rule_name === 'mimetypes');
  
  if (mimetypesRule?.rule_props) {
    const props = mimetypesRule.rule_props as { types?: string[] };
    if (props.types && Array.isArray(props.types)) {
      return props.types;
    }
  }

  // Default to common video types
  return ['video/*'];
};

/**
 * Check if file matches allowed MIME types (supports wildcards)
 * 
 * @param file - File to check
 * @param allowedTypes - Array of allowed MIME types (can include wildcards)
 * @returns True if file matches
 */
export const matchesMimeType = (file: File, allowedTypes: string[]): boolean => {
  return allowedTypes.some((allowedType) => {
    // Handle wildcard patterns (e.g., "video/*")
    if (allowedType.includes('*')) {
      const pattern = allowedType.replace('*', '.*');
      const regex = new RegExp(`^${pattern}$`);
      return regex.test(file.type);
    }
    
    // Exact match
    return file.type === allowedType;
  });
};

/**
 * Format file size for display
 * 
 * @param bytes - File size in bytes
 * @returns Formatted string (e.g., "1.5 MB")
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

/**
 * Convert KB to bytes
 * 
 * @param kb - Size in kilobytes
 * @returns Size in bytes
 */
export const kbToBytes = (kb: number): number => kb * 1024;

/**
 * Convert bytes to KB
 * 
 * @param bytes - Size in bytes
 * @returns Size in kilobytes
 */
export const bytesToKb = (bytes: number): number => bytes / 1024;

/**
 * Generate Zod schema for Video Upload field based on field rules
 * 
 * @param field - Field configuration from API
 * @returns Zod schema for video validation
 */
export const generateVideoUploadSchema = (
  field: FormField
): z.ZodType<File | null> => {
  // Check if field is required
  const isRequired = field.rules?.some(
    (rule) => rule.rule_name === 'required'
  ) ?? false;

  // Extract validation parameters
  const { minSize, maxSize } = extractFileSizeBounds(field.rules || []);
  const allowedTypes = extractAllowedMimeTypes(field.rules || []);

  console.debug('[videoUploadValidation] Generating schema for field:', {
    fieldId: field.field_id,
    isRequired,
    minSize,
    maxSize,
    allowedTypes,
  });

  // Base schema for File or null
  let schema = z.instanceof(File).nullable();

  // Apply MIME type validation
  schema = schema.refine(
    (file) => {
      if (!file) return !isRequired;
      return matchesMimeType(file, allowedTypes);
    },
    {
      message: `${field.label} must be a valid video file`,
    }
  );

  // Apply min file size validation
  if (minSize !== null) {
    schema = schema.refine(
      (file) => {
        if (!file) return !isRequired;
        return bytesToKb(file.size) >= minSize;
      },
      {
        message: `${field.label} must be at least ${formatFileSize(kbToBytes(minSize))}`,
      }
    );
  }

  // Apply max file size validation
  if (maxSize !== null) {
    schema = schema.refine(
      (file) => {
        if (!file) return !isRequired;
        return bytesToKb(file.size) <= maxSize;
      },
      {
        message: `${field.label} must be less than ${formatFileSize(kbToBytes(maxSize))}`,
      }
    );
  }

  // If required, ensure file is provided
  if (isRequired) {
    schema = schema.refine(
      (file) => file !== null,
      {
        message: `${field.label} is required`,
      }
    );
  }

  return schema;
};

/**
 * Validate video file against field rules
 * 
 * @param field - Field configuration
 * @param file - Video file to validate
 * @returns Validation result with error message if invalid
 */
export const validateVideoUpload = (
  field: FormField,
  file: File | null | undefined
): { valid: boolean; error?: string } => {
  const schema = generateVideoUploadSchema(field);

  try {
    schema.parse(file || null);
    return { valid: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstError = error.issues[0];
      return {
        valid: false,
        error: firstError?.message || 'Invalid video file',
      };
    }
    return { valid: false, error: 'Invalid video file' };
  }
};

/**
 * Get default video upload value
 * Video uploads typically don't have defaults
 * 
 * @param field - Field configuration
 * @returns Default value (always null)
 */
export const getDefaultVideoUploadValue = (_field: FormField): null => {
  return null;
};

/**
 * Get accepted file types for input element
 * 
 * @param field - Field configuration
 * @returns Comma-separated string of accepted file types
 */
export const getAcceptedFileTypes = (field: FormField): string => {
  const allowedTypes = extractAllowedMimeTypes(field.rules || []);
  return allowedTypes.join(',');
};

/**
 * Get max file size for display
 * 
 * @param field - Field configuration
 * @returns Formatted max size string or null
 */
export const getMaxFileSizeDisplay = (field: FormField): string | null => {
  const { maxSize } = extractFileSizeBounds(field.rules || []);
  
  if (maxSize !== null) {
    return formatFileSize(kbToBytes(maxSize));
  }
  
  return null;
};
