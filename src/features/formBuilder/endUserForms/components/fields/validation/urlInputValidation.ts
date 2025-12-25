/**
 * ================================
 * URL INPUT FIELD VALIDATION
 * ================================
 * Zod schema generation for URL Input fields based on field rules
 * Handles: required, url, min, max, starts_with, ends_with
 *
 * Fixes:
 * - null/undefined safe parsing
 * - required wins over "invalid url"
 * - protocol normalization on submit (no need to blur)
 * - whitespace treated as empty
 */

import { z } from 'zod';
import type {
  FormField,
  FieldRule,
} from '@/features/formBuilder/endUserForms/types/formStructure.types';

const extractLengthBounds = (
  rules: FieldRule[],
): { min: number | null; max: number | null } => {
  let min: number | null = null;
  let max: number | null = null;

  const minRule = rules.find((rule) => rule.rule_name === 'min');
  if (minRule?.rule_props) {
    const props = minRule.rule_props as { value?: number };
    if (typeof props.value === 'number' && props.value > 0) min = props.value;
  }

  const maxRule = rules.find((rule) => rule.rule_name === 'max');
  if (maxRule?.rule_props) {
    const props = maxRule.rule_props as { value?: number };
    if (typeof props.value === 'number') max = props.value;
  }

  return { min, max };
};

export const ensureProtocol = (url: string): string => {
  if (!url) return url;
  const trimmed = url.trim();

  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }

  return `https://${trimmed}`;
};

export const isValidUrl = (url: string): boolean => {
  if (!url) return false;

  try {
    const urlObj = new URL(url);
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
  } catch {
    return false;
  }
};

/**
 * Normalize incoming values (including submit-time)
 * - null/undefined -> ''
 * - trim whitespace
 * - if non-empty and missing protocol -> prepend https://
 */
const normalizeUrlValue = (raw: unknown): string => {
  if (raw === null || raw === undefined) return '';
  const trimmed = String(raw).trim();
  if (trimmed === '') return '';
  return ensureProtocol(trimmed);
};

export const generateUrlInputSchema = (field: FormField): z.ZodType<string> => {
  const isRequired =
    field.rules?.some((rule) => rule.rule_name === 'required') ?? false;

  const { min, max } = extractLengthBounds(field.rules || []);

  const startsWithRule = field.rules?.find(
    (rule) => rule.rule_name === 'starts_with',
  );
  const endsWithRule = field.rules?.find((rule) => rule.rule_name === 'ends_with');

  const startsWithValues =
    (startsWithRule?.rule_props as { values?: string[] } | undefined)?.values ||
    [];
  const endsWithValues =
    (endsWithRule?.rule_props as { values?: string[] } | undefined)?.values || [];

  return z
    .preprocess(
      (val) => normalizeUrlValue(val),
      z.string({
        message: `${field.label} must be a valid URL`,
      }),
    )
    .superRefine((value, ctx) => {
      // Required first
      if (value === '') {
        if (isRequired) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `${field.label} is required`,
          });
        }
        return; // optional empty is valid
      }

      // URL format
      if (!isValidUrl(value)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `${field.label} must be a valid URL`,
        });
        return;
      }

      // starts_with / ends_with (apply to normalized value)
      if (startsWithValues.length > 0) {
        const ok = startsWithValues.some((prefix) => value.startsWith(prefix));
        if (!ok) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `${field.label} must start with: ${startsWithValues.join(' or ')}`,
          });
          return;
        }
      }

      if (endsWithValues.length > 0) {
        const ok = endsWithValues.some((suffix) => value.endsWith(suffix));
        if (!ok) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `${field.label} must end with: ${endsWithValues.join(' or ')}`,
          });
          return;
        }
      }

      // min/max length (after normalization)
      if (min !== null && value.length < min) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `${field.label} must be at least ${min} characters`,
        });
        return;
      }

      if (max !== null && value.length > max) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `${field.label} must be at most ${max} characters`,
        });
        return;
      }
    }) as z.ZodType<string>;
};

export const validateUrlInput = (
  field: FormField,
  value: string | null | undefined,
): { valid: boolean; error?: string } => {
  const schema = generateUrlInputSchema(field);

  const result = schema.safeParse(value);
  if (result.success) return { valid: true };

  const first = result.error.issues[0];
  return { valid: false, error: first?.message || 'Invalid URL' };
};

export const getDefaultUrlInputValue = (field: FormField): string => {
  if (field.default_value !== null && field.default_value !== undefined) {
    return String(field.default_value);
  }
  if (field.current_value !== null && field.current_value !== undefined) {
    return String(field.current_value);
  }
  return '';
};

export const extractDomain = (url: string): string => {
  if (!url || !isValidUrl(url)) return '';

  try {
    const urlObj = new URL(url);
    return urlObj.hostname;
  } catch {
    return '';
  }
};
