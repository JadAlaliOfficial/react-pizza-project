/**
 * ================================
 * RATING FIELD VALIDATION
 * ================================
 * Zod schema generation for Rating fields based on field rules
 * Handles: required
 */

import { z } from 'zod';
import type { FormField } from '@/features/formBuilder/endUserForms/types/formStructure.types';

/**
 * Maximum number of stars for rating
 */
const MAX_STARS = 5;

/**
 * Generate Zod schema for Rating field based on field rules
 *
 * @param field - Field configuration from API
 * @returns Zod schema for rating validation
 */
export const generateRatingSchema = (field: FormField): z.ZodType<number> => {
  // Check if field is required
  const isRequired =
    field.rules?.some((rule) => rule.rule_name === 'required') ?? false;

  console.debug('[ratingValidation] Generating schema for field:', {
    fieldId: field.field_id,
    isRequired,
  });

  // Base schema for number with range validation
  let schema = z.coerce
    .number()
    .min(0, `${field.label} must be at least 0`)
    .max(MAX_STARS, `${field.label} must be at most ${MAX_STARS}`);

  // If not required, allow 0 or undefined
  if (!isRequired) {
    return schema.optional() as z.ZodType<number>;
  }

  // If required, ensure rating is greater than 0
  return schema.min(1, `${field.label} is required`);
};

/**
 * Validate rating value against field rules
 *
 * @param field - Field configuration
 * @param value - Rating value to validate
 * @returns Validation result with error message if invalid
 */
export const validateRating = (
  field: FormField,
  value: number | null | undefined,
): { valid: boolean; error?: string } => {
  const schema = generateRatingSchema(field);

  try {
    schema.parse(value ?? 0);
    return { valid: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstError = error.issues[0];
      return {
        valid: false,
        error: firstError?.message || 'Invalid rating',
      };
    }
    return { valid: false, error: 'Invalid rating' };
  }
};

/**
 * Get default rating value from field configuration
 *
 * @param field - Field configuration
 * @returns Default rating value (0-5)
 */
export const getDefaultRatingValue = (field: FormField): number => {
  const defaultValue = field.default_value;

  // If default_value is a number
  if (typeof defaultValue === 'number') {
    return Math.max(0, Math.min(MAX_STARS, defaultValue));
  }

  // If default_value is a numeric string
  if (typeof defaultValue === 'string') {
    const parsed = parseInt(defaultValue, 10);
    if (!isNaN(parsed)) {
      return Math.max(0, Math.min(MAX_STARS, parsed));
    }
  }

  // Default to 0 (no rating)
  return 0;
};

/**
 * Clamp rating value to valid range
 *
 * @param value - Rating value
 * @param maxStars - Maximum number of stars
 * @returns Clamped rating value
 */
export const clampRating = (
  value: number,
  maxStars: number = MAX_STARS,
): number => {
  return Math.max(0, Math.min(maxStars, Math.round(value)));
};
