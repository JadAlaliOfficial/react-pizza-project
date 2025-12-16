/**
 * ================================
 * IMAGE UPLOAD FIELD VALIDATION
 * ================================
 * Zod schema generation for Image Upload fields based on field rules
 * Handles: required, mimetypes, min_file_size, max_file_size, dimensions
 */

import { z } from 'zod';
import type { FormField, FieldRule } from '@/features/formBuilder/endUserForms/types/formStructure.types';
import type { ImageDimensions, DimensionRules } from '../types/imageUploadField.types';

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
  dimensions: DimensionRules | null;
} => {
  let minSize: number | null = null;
  let maxSize: number | null = null;
  let mimeTypes: string[] | null = null;
  let dimensions: DimensionRules | null = null;

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
      case 'dimensions':
        dimensions = rule.rule_props as DimensionRules;
        break;
    }
  });

  return { minSize, maxSize, mimeTypes, dimensions };
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
 * Supports wildcards (e.g., image/*)
 * 
 * @param fileMimeType - File's MIME type
 * @param pattern - MIME type pattern to match
 * @returns True if matches
 */
const matchesMimeType = (fileMimeType: string, pattern: string): boolean => {
  if (pattern === '*/*') return true;
  
  // Handle wildcards (e.g., image/*)
  if (pattern.endsWith('/*')) {
    const category = pattern.split('/')[0];
    return fileMimeType.startsWith(category + '/');
  }
  
  return fileMimeType === pattern;
};

/**
 * Get image dimensions from File object
 * 
 * @param file - Image file
 * @returns Promise resolving to dimensions
 */
export const getImageDimensions = (file: File): Promise<ImageDimensions> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve({
        width: img.naturalWidth,
        height: img.naturalHeight,
      });
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image'));
    };

    img.src = url;
  });
};

/**
 * Validate image dimensions against rules
 * 
 * @param dimensions - Image dimensions
 * @param rules - Dimension rules
 * @returns Error message if invalid, null if valid
 */
const validateDimensions = (
  dimensions: ImageDimensions,
  rules: DimensionRules
): string | null => {
  const { width, height } = dimensions;

  // Exact width match
  if (rules.width !== undefined && width !== rules.width) {
    return `Image width must be exactly ${rules.width}px (current: ${width}px)`;
  }

  // Exact height match
  if (rules.height !== undefined && height !== rules.height) {
    return `Image height must be exactly ${rules.height}px (current: ${height}px)`;
  }

  // Min width
  if (rules.minwidth !== undefined && width < rules.minwidth) {
    return `Image width must be at least ${rules.minwidth}px (current: ${width}px)`;
  }

  // Max width
  if (rules.maxwidth !== undefined && width > rules.maxwidth) {
    return `Image width must be at most ${rules.maxwidth}px (current: ${width}px)`;
  }

  // Min height
  if (rules.minheight !== undefined && height < rules.minheight) {
    return `Image height must be at least ${rules.minheight}px (current: ${height}px)`;
  }

  // Max height
  if (rules.maxheight !== undefined && height > rules.maxheight) {
    return `Image height must be at most ${rules.maxheight}px (current: ${height}px)`;
  }

  return null;
};

/**
 * Generate Zod schema for Image Upload field based on field rules
 * 
 * @param field - Field configuration from API
 * @returns Zod schema for image upload validation
 */
export const generateImageUploadSchema = (field: FormField): z.ZodType<File | null> => {
  // Check if field is required
  const isRequired = field.rules?.some(
    (rule) => rule.rule_name === 'required'
  ) ?? false;

  // Extract file validation rules
  const { minSize, maxSize, mimeTypes, dimensions } = extractFileValidationRules(field.rules || []);

  console.debug('[imageUploadValidation] Generating schema for field:', {
    fieldId: field.field_id,
    isRequired,
    minSize,
    maxSize,
    mimeTypes,
    dimensions,
  });

  // Base schema for File
  let schema = z.instanceof(File, { message: `${field.label} must be a valid file` });

  // Apply MIME type validation (default to images if not specified)
  const imageMimeTypes = mimeTypes || ['image/*'];
  schema = schema.refine(
    (file) => imageMimeTypes.some((type) => matchesMimeType(file.type, type)),
    {
      message: `File must be an image (${imageMimeTypes.join(', ')})`,
    }
  );

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

  // Apply dimension validation (async)
  if (dimensions) {
    schema = schema.refine(
      async (file) => {
        try {
          const imageDimensions = await getImageDimensions(file);
          const error = validateDimensions(imageDimensions, dimensions);
          return error === null;
        } catch {
          return false;
        }
      },
      {
        message: 'Image does not meet dimension requirements',
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
 * Validate image against field rules
 * 
 * @param field - Field configuration
 * @param file - Image file to validate
 * @returns Validation result with error message if invalid
 */
export const validateImageUpload = async (
  field: FormField,
  file: File | null | undefined
): Promise<{ valid: boolean; error?: string }> => {
  const schema = generateImageUploadSchema(field);

  try {
    await schema.parseAsync(file);
    return { valid: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstError = error.issues[0];
      return {
        valid: false,
        error: firstError?.message || 'Invalid image',
      };
    }
    return { valid: false, error: 'Invalid image' };
  }
};

/**
 * Get default image value from field configuration
 * 
 * @param field - Field configuration
 * @returns Default image value (null for uploads)
 */
export const getDefaultImageUploadValue = (_field: FormField): null => {
  // Image uploads don't have default values
  return null;
};

/**
 * Get accepted MIME types string for input accept attribute
 * 
 * @param rules - Field validation rules
 * @returns Comma-separated MIME types string
 */
export const getAcceptedMimeTypes = (rules: FieldRule[]): string => {
  const { mimeTypes } = extractFileValidationRules(rules);
  return mimeTypes?.join(',') || 'image/*';
};

/**
 * Get human-readable dimension requirements
 * 
 * @param dimensions - Dimension rules
 * @returns Human-readable string
 */
export const getReadableDimensions = (dimensions: DimensionRules): string => {
  const parts: string[] = [];

  if (dimensions.width) parts.push(`${dimensions.width}px width`);
  if (dimensions.height) parts.push(`${dimensions.height}px height`);
  if (dimensions.minwidth) parts.push(`min ${dimensions.minwidth}px width`);
  if (dimensions.maxwidth) parts.push(`max ${dimensions.maxwidth}px width`);
  if (dimensions.minheight) parts.push(`min ${dimensions.minheight}px height`);
  if (dimensions.maxheight) parts.push(`max ${dimensions.maxheight}px height`);

  return parts.join(', ');
};
