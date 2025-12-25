/**
 * ================================
 * FILE UPLOAD SCHEMAS
 * ================================
 * File, Image, Video, Document, Signature schemas
 */

import { z } from 'zod';
import type { FormField, FieldRule } from '../validationEngine.types';
import {
  isFieldRequired,
  matchesMimeType,
  formatFileSize,
  getFileSizeInKB,
} from '../validationEngine.helpers';
import { isSignatureEmpty } from '@/features/formBuilder/endUserForms/components/fields/validation/signaturePadValidation';

const extractFileValidationRules = (
  rules: FieldRule[],
): {
  maxSize: number | null;
  minSize: number | null;
  mimeTypes: string[] | null;
} => {
  let maxSize: number | null = null;
  let minSize: number | null = null;
  let mimeTypes: string[] | null = null;

  rules.forEach((rule) => {
    switch (rule.rule_name) {
      case 'max_file_size': {
        const maxProps = rule.rule_props as { maxsize?: number } | null;
        if (maxProps?.maxsize) maxSize = maxProps.maxsize;
        break;
      }
      case 'min_file_size': {
        const minProps = rule.rule_props as { minsize?: number } | null;
        if (minProps?.minsize) minSize = minProps.minsize;
        break;
      }
      case 'mimetypes': {
        const typeProps = rule.rule_props as { types?: string[] } | null;
        if (typeProps?.types) mimeTypes = typeProps.types;
        break;
      }
      default:
        break;
    }
  });

  return { maxSize, minSize, mimeTypes };
};

export const generateFileUploadSchema = (field: FormField): z.ZodType => {
  const isRequired = isFieldRequired(field.rules || []);
  const { maxSize, minSize, mimeTypes } = extractFileValidationRules(
    field.rules || [],
  );

  // Allow null/undefined in the base union so we can show a clean "is required"
  // instead of failing early with z.instanceof(File).
  let fileSchema = z.instanceof(File, {
    message: `${field.label} must be a valid file`,
  });

  if (mimeTypes && mimeTypes.length > 0) {
    fileSchema = fileSchema.refine(
      (file) => mimeTypes.some((type) => matchesMimeType(file.type, type)),
      { message: `File type must be one of: ${mimeTypes.join(', ')}` },
    );
  }

  if (minSize !== null) {
    fileSchema = fileSchema.refine((file) => getFileSizeInKB(file) >= minSize, {
      message: `File size must be at least ${formatFileSize(minSize)}`,
    });
  }

  if (maxSize !== null) {
    fileSchema = fileSchema.refine((file) => getFileSizeInKB(file) <= maxSize, {
      message: `File size must be less than ${formatFileSize(maxSize)}`,
    });
  }

  // Some callers may still hold undefined before defaults land
  const schema = z.union([fileSchema, z.null(), z.undefined()]);

  if (!isRequired) return schema;

  // Required should fail with your required message for null/undefined
  return schema.refine((value) => value instanceof File, {
    message: `${field.label} is required`,
  });
};

export const generateImageUploadSchema = (field: FormField): z.ZodType => {
  return generateFileUploadSchema(field);
};

export const generateVideoUploadSchema = (field: FormField): z.ZodType => {
  return generateFileUploadSchema(field);
};

export const generateDocumentUploadSchema = (field: FormField): z.ZodType => {
  return generateFileUploadSchema(field);
};

export const generateSignaturePadSchema = (field: FormField): z.ZodType => {
  const isRequired = isFieldRequired(field.rules || []);

  // Normalize null/undefined into empty string
  const base = z.preprocess(
    (val) => (val === null || val === undefined ? '' : val),
    z.string({
      message: `${field.label} must be a valid signature`,
    }),
  );

  const schema = base.superRefine((val, ctx) => {
    const v = val.trim();

    // Empty
    if (v.length === 0) {
      if (isRequired) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `${field.label} is required`,
        });
      }
      return;
    }

    // Optional: ensure it's an actual signature dataUrl (png)
    if (!v.startsWith('data:image/png;base64,')) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `${field.label} must be a valid signature`,
      });
      return;
    }

    // Treat “blank canvas” as empty
    if (isSignatureEmpty(v)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: isRequired
          ? `${field.label} is required`
          : `${field.label} must be a valid signature`,
      });
    }
  });

  // Optional fields should allow empty
  return isRequired ? schema : (schema.optional() as z.ZodType);
};
