/**
 * ================================
 * DATE/TIME SCHEMAS
 * ================================
 * Date, Time, DateTime schemas
 */

import { z } from 'zod';
import type { FormField } from '../validationEngine.types';
import {
  isFieldRequired,
  extractDateValidationBounds,
  compareDates,
  formatDateForDisplay,
} from '../validationEngine.helpers';

export const generateDateInputSchema = (field: FormField): z.ZodType => {
  const isRequired = isFieldRequired(field.rules || []);
  const { before, after, beforeOrEqual, afterOrEqual } =
    extractDateValidationBounds(field.rules || []);

  let schema = z.string();

  if (before) {
    schema = schema.refine(
      (value) => {
        if (!value) return !isRequired;
        return compareDates(value, before) < 0;
      },
      {
        message: `${field.label} must be before ${formatDateForDisplay(before)}`,
      },
    );
  }

  if (after) {
    schema = schema.refine(
      (value) => {
        if (!value) return !isRequired;
        return compareDates(value, after) > 0;
      },
      {
        message: `${field.label} must be after ${formatDateForDisplay(after)}`,
      },
    );
  }

  if (beforeOrEqual) {
    schema = schema.refine(
      (value) => {
        if (!value) return !isRequired;
        return compareDates(value, beforeOrEqual) <= 0;
      },
      {
        message: `${field.label} must be on or before ${formatDateForDisplay(
          beforeOrEqual,
        )}`,
      },
    );
  }

  if (afterOrEqual) {
    schema = schema.refine(
      (value) => {
        if (!value) return !isRequired;
        return compareDates(value, afterOrEqual) >= 0;
      },
      {
        message: `${field.label} must be on or after ${formatDateForDisplay(
          afterOrEqual,
        )}`,
      },
    );
  }

  if (!isRequired) {
    return z.union([schema, z.literal('')]);
  }

  return schema
    .refine((val) => val !== null && val !== undefined, {
      message: `${field.label} is required`,
    })
    .min(1, `${field.label} is required`);
};

export const generateTimeInputSchema = (field: FormField): z.ZodType => {
  const isRequired = isFieldRequired(field.rules || []);

  if (!isRequired) {
    return z.union([
      z
        .string()
        .regex(/^\d{2}:\d{2}$/, `${field.label} must be a valid time (HH:MM)`),
      z.literal(''),
    ]);
  }

  return z
    .string()
    .refine((val) => val !== null && val !== undefined, {
      message: `${field.label} is required`,
    })
    .min(1, `${field.label} is required`)
    .regex(/^\d{2}:\d{2}$/, `${field.label} must be a valid time (HH:MM)`);
};

export const generateDateTimeInputSchema = (field: FormField): z.ZodType => {
  const isRequired = isFieldRequired(field.rules || []);
  const { before, after, beforeOrEqual, afterOrEqual } =
    extractDateValidationBounds(field.rules || []);

  // Base schema: datetime string with the required format
  let schema = z
    .string()
    .regex(
      /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/,
      `${field.label} must be a valid date and time (YYYY-MM-DDTHH:MM)`,
    );

  if (before) {
    schema = schema.refine(
      (value) => {
        if (!value) return !isRequired;
        return compareDates(value, before) < 0;
      },
      {
        message: `${field.label} must be before ${formatDateForDisplay(before)}`,
      },
    );
  }

  if (after) {
    schema = schema.refine(
      (value) => {
        if (!value) return !isRequired;
        return compareDates(value, after) > 0;
      },
      {
        message: `${field.label} must be after ${formatDateForDisplay(after)}`,
      },
    );
  }

  if (beforeOrEqual) {
    schema = schema.refine(
      (value) => {
        if (!value) return !isRequired;
        return compareDates(value, beforeOrEqual) <= 0;
      },
      {
        message: `${field.label} must be on or before ${formatDateForDisplay(
          beforeOrEqual,
        )}`,
      },
    );
  }

  if (afterOrEqual) {
    schema = schema.refine(
      (value) => {
        if (!value) return !isRequired;
        return compareDates(value, afterOrEqual) >= 0;
      },
      {
        message: `${field.label} must be on or after ${formatDateForDisplay(
          afterOrEqual,
        )}`,
      },
    );
  }

  if (!isRequired) {
    // Allow empty string when not required
    return z.union([schema, z.literal('')]);
  }

  // Required field: non-null, non-empty, plus all above refinements
  return schema
    .refine((val) => val !== null && val !== undefined, {
      message: `${field.label} is required`,
    })
    .min(1, `${field.label} is required`);
};
