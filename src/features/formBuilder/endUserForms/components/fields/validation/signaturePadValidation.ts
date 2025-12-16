/**
 * ================================
 * SIGNATURE PAD FIELD VALIDATION
 * ================================
 * Zod schema generation for Signature Pad fields based on field rules
 * Handles: required
 */

import { z } from 'zod';
import type { FormField } from '@/features/formBuilder/endUserForms/types/formStructure.types';

/**
 * Generate Zod schema for Signature Pad field based on field rules
 * 
 * @param field - Field configuration from API
 * @returns Zod schema for signature validation
 */
export const generateSignaturePadSchema = (
  field: FormField
): z.ZodType<string> => {
  // Check if field is required
  const isRequired = field.rules?.some(
    (rule) => rule.rule_name === 'required'
  ) ?? false;

  console.debug('[signaturePadValidation] Generating schema for field:', {
    fieldId: field.field_id,
    isRequired,
  });

  // Base schema for string (base64 data URL)
  let schema = z.string();

  // Validate that it's a valid data URL
  schema = schema.refine(
    (value) => {
      if (!value) return !isRequired; // Allow empty if not required
      return value.startsWith('data:image/png;base64,');
    },
    {
      message: `${field.label} must be a valid signature`,
    }
  );

  // If not required, allow empty string
  if (!isRequired) {
    return z.union([schema, z.literal('')]);
  }

  // If required, ensure signature exists
  return schema.min(1, `${field.label} is required`);
};

/**
 * Validate signature value against field rules
 * 
 * @param field - Field configuration
 * @param value - Signature value to validate
 * @returns Validation result with error message if invalid
 */
export const validateSignaturePad = (
  field: FormField,
  value: string | null | undefined
): { valid: boolean; error?: string } => {
  const schema = generateSignaturePadSchema(field);

  try {
    schema.parse(value || '');
    return { valid: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstError = error.issues[0];
      return {
        valid: false,
        error: firstError?.message || 'Invalid signature',
      };
    }
    return { valid: false, error: 'Invalid signature' };
  }
};

/**
 * Get default signature value from field configuration
 * 
 * @param field - Field configuration
 * @returns Default signature value (empty string - signatures don't have defaults)
 */
export const getDefaultSignaturePadValue = (_field: FormField): string => {
  // Signatures should never have default values
  return '';
};

/**
 * Check if signature is empty (blank canvas)
 * 
 * @param dataUrl - Base64 data URL of signature
 * @returns True if signature is empty
 */
export const isSignatureEmpty = (dataUrl: string): boolean => {
  if (!dataUrl || dataUrl === '') return true;
  
  // Check if it's a valid data URL
  if (!dataUrl.startsWith('data:image/png;base64,')) return true;
  
  // Additional check: a truly empty canvas will have a minimal base64 size
  // This is approximate - adjust threshold as needed
  const base64Data = dataUrl.split(',')[1];
  return !base64Data || base64Data.length < 100;
};
