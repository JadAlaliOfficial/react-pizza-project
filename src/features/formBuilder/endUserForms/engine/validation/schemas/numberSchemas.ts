/**
 * ================================
 * NUMBER INPUT SCHEMAS
 * ================================
 * Number, Currency, Percentage, Slider, Rating schemas
 */

import { z } from 'zod';
import type { FormField } from '../validationEngine.types';
import {
  extractValidationBounds,
  isFieldRequired,
  getNumberTypeRules,
} from '../validationEngine.helpers';

const extractNumericBounds = (field: FormField) => {
  let min: number | null = null;
  let max: number | null = null;

  const betweenRule = (field.rules || []).find(
    (rule) => rule.rule_name === 'between',
  );
  const betweenProps =
    (betweenRule?.rule_props as { min?: number; max?: number }) || {};
  const { min: betweenMin, max: betweenMax } = betweenProps;

  if (betweenMin !== undefined) {
    min = Number(betweenMin);
  }
  if (betweenMax !== undefined) {
    max = Number(betweenMax);
  }

  if (min === null) {
    const { min: standaloneMin } = extractValidationBounds(field.rules || []);
    min = standaloneMin;
  }
  if (max === null) {
    const { max: standaloneMax } = extractValidationBounds(field.rules || []);
    max = standaloneMax;
  }

  return { min, max };
};

export const generateNumberInputSchema = (field: FormField): z.ZodType => {
  const isRequired = isFieldRequired(field.rules || []);
  const { min, max } = extractNumericBounds(field);
  const { allowDecimals } = getNumberTypeRules(field.rules || []);

  const baseNumber = z
    .number({ message: `${field.label} must be a number` })
    .refine((n) => Number.isFinite(n), {
      message: `${field.label} must be a number`,
    });

  let numberSchema = baseNumber;

  if (!allowDecimals) {
    numberSchema = numberSchema.int(
      `${field.label} must be an integer (no decimals)`,
    );
  }
  if (min !== null)
    numberSchema = numberSchema.min(
      min,
      `${field.label} must be at least ${min}`,
    );
  if (max !== null)
    numberSchema = numberSchema.max(
      max,
      `${field.label} must be at most ${max}`,
    );

  const schema = z.preprocess(
    (val) => {
      if (val === '' || val === null || val === undefined) return null;
      if (typeof val === 'number') return val;
      if (typeof val === 'string') {
        const t = val.trim();
        if (t === '') return null;
        const n = Number(t);
        return Number.isFinite(n) ? n : NaN;
      }
      return val;
    },
    z.union([numberSchema, z.null()]),
  );

  if (!isRequired) return schema.optional();

  return schema.refine((v) => typeof v === 'number' && Number.isFinite(v), {
    message: `${field.label} is required`,
  });
};

// numberSchemas.ts

export const generateCurrencyInputSchema = (field: FormField): z.ZodType => {
  const isRequired = isFieldRequired(field.rules || []);
  const { min, max } = extractNumericBounds(field);

  let schema = z.number();

  if (min !== null)
    schema = schema.min(min, `${field.label} must be at least ${min}`);
  if (max !== null)
    schema = schema.max(max, `${field.label} must be at most ${max}`);

  // ✅ runtime empty = null
  const nullable = z.union([schema, z.null()]);

  if (!isRequired) {
    return nullable.optional();
  }

  return nullable.refine((val) => typeof val === 'number' && !isNaN(val), {
    message: `${field.label} is required`,
  });
};

export const generatePercentageInputSchema = (field: FormField): z.ZodType => {
  const isRequired = isFieldRequired(field.rules || []);
  const { min, max } = extractNumericBounds(field);

  let schema = z.number();

  const minValue = min !== null ? min : 0;
  schema = schema.min(minValue, `${field.label} must be at least ${minValue}%`);

  const maxValue = max !== null ? max : 100;
  schema = schema.max(maxValue, `${field.label} must be at most ${maxValue}%`);

  if (!isRequired) {
    return schema.optional() as z.ZodType;
  }

  return schema.refine(
    (val) =>
      val !== undefined && val !== null && !isNaN(val as unknown as number),
    {
      message: `${field.label} is required`,
    },
  );
};

export const generateSliderSchema = (field: FormField): z.ZodType => {
  const isRequired = isFieldRequired(field.rules || []);
  const { min, max } = extractNumericBounds(field);

  let schema = z.number();

  if (min !== null) {
    schema = schema.min(min, `${field.label} must be at least ${min}`);
  }

  if (max !== null) {
    schema = schema.max(max, `${field.label} must be at most ${max}`);
  }

  if (!isRequired) {
    return schema.optional() as z.ZodType;
  }

  return schema;
};

export const generateRatingSchema = (field: FormField): z.ZodType => {
  const isRequired = isFieldRequired(field.rules || []);
  const { min, max } = extractValidationBounds(field.rules || []);

  let schema = z.number();

  if (min !== null) {
    schema = schema.min(min, `${field.label} rating must be at least ${min}`);
  }

  if (max !== null) {
    schema = schema.max(max, `${field.label} rating must be at most ${max}`);
  }

  if (!isRequired) {
    return schema.optional() as z.ZodType;
  }

  return schema.refine((val) => val !== undefined && val !== null, {
    message: `${field.label} is required`,
  });
};
