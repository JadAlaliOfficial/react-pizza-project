/**
 * ================================
 * TEXT INPUT SCHEMAS
 * ================================
 * Text, TextArea, Email, Password schemas
 */

import { z } from 'zod';
import type { FormField, FieldRule } from '../validationEngine.types';
import {
  extractValidationBounds,
  isFieldRequired,
} from '../validationEngine.helpers';

const extractTextValidationRules = (
  rules: FieldRule[],
): {
  regex: string | null;
  alpha: boolean;
  alphaNum: boolean;
  alphaDash: boolean;
  startsWith: string[] | null;
  endsWith: string[] | null;
} => {
  let regex: string | null = null;
  let alpha = false;
  let alphaNum = false;
  let alphaDash = false;
  let startsWith: string[] | null = null;
  let endsWith: string[] | null = null;

  rules.forEach((rule) => {
    switch (rule.rule_name) {
      case 'regex': {
        const regexProps = rule.rule_props as { pattern?: string } | null;
        if (regexProps?.pattern) regex = regexProps.pattern;
        break;
      }
      case 'alpha':
        alpha = true;
        break;
      case 'alpha_num':
        alphaNum = true;
        break;
      case 'alpha_dash':
        alphaDash = true;
        break;
      case 'starts_with': {
        const startsProps = rule.rule_props as { values?: string[] } | null;
        if (startsProps?.values) startsWith = startsProps.values;
        break;
      }
      case 'ends_with': {
        const endsProps = rule.rule_props as { values?: string[] } | null;
        if (endsProps?.values) endsWith = endsProps.values;
        break;
      }
      default:
        break;
    }
  });

  return { regex, alpha, alphaNum, alphaDash, startsWith, endsWith };
};

export const generateTextInputSchema = (field: FormField): z.ZodType => {
  const isRequired = isFieldRequired(field.rules || []);

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

  const { regex, alpha, alphaNum, alphaDash, startsWith, endsWith } =
    extractTextValidationRules(field.rules || []);

  let schema = z.string();

  if (min !== null) {
    schema = schema.min(
      min,
      `${field.label} must be at least ${min} characters`,
    );
  }

  if (max !== null) {
    schema = schema.max(
      max,
      `${field.label} must be at most ${max} characters`,
    );
  }

  if (regex) {
    try {
      const regexPattern = new RegExp(regex);
      schema = schema.regex(
        regexPattern,
        `${field.label} does not match the required pattern`,
      );
    } catch (error) {
      console.error('[validationEngine] Invalid regex pattern:', regex);
    }
  } else {
    if (alphaDash) {
      schema = schema.regex(
        /^[a-zA-Z0-9_-\s]*$/,
        `${field.label} must contain only letters, numbers, dashes, underscores, spaces, and newlines`,
      );
    } else if (alphaNum) {
      schema = schema.regex(
        /^[a-zA-Z0-9\s]*$/,
        `${field.label} must contain only letters, numbers, spaces, and newlines`,
      );
    } else if (alpha) {
      schema = schema.regex(
        /^[a-zA-Z\s]*$/,
        `${field.label} must contain only letters, spaces, and newlines`,
      );
    }
  }

  if (startsWith && startsWith.length > 0) {
    schema = schema.refine(
      (value) => {
        if (!value) return true;
        return startsWith.some((prefix) => value.startsWith(prefix));
      },
      { message: `${field.label} must start with: ${startsWith.join(' or ')}` },
    );
  }

  if (endsWith && endsWith.length > 0) {
    schema = schema.refine(
      (value) => {
        if (!value) return true;
        return endsWith.some((suffix) => value.endsWith(suffix));
      },
      { message: `${field.label} must end with: ${endsWith.join(' or ')}` },
    );
  }

  if (!isRequired) {
    return z.union([schema, z.literal('')]);
  }

  return schema.min(1, `${field.label} is required`);
};

export const generateTextAreaSchema = (field: FormField): z.ZodType => {
  return generateTextInputSchema(field);
};

const extractEmailValidationRules = (
  rules: FieldRule[],
): {
  regex: string | null;
  startsWith: string[] | null;
  endsWith: string[] | null;
} => {
  let regex: string | null = null;
  let startsWith: string[] | null = null;
  let endsWith: string[] | null = null;

  rules.forEach((rule) => {
    switch (rule.rule_name) {
      case 'regex': {
        const regexProps = rule.rule_props as { pattern?: string } | null;
        if (regexProps?.pattern) regex = regexProps.pattern;
        break;
      }
      case 'starts_with': {
        const startsProps = rule.rule_props as { values?: string[] } | null;
        if (startsProps?.values) startsWith = startsProps.values;
        break;
      }
      case 'ends_with': {
        const endsProps = rule.rule_props as { values?: string[] } | null;
        if (endsProps?.values) endsWith = endsProps.values;
        break;
      }
      default:
        break;
    }
  });

  return { regex, startsWith, endsWith };
};

export const generateEmailInputSchema = (field: FormField): z.ZodType => {
  const isRequired = isFieldRequired(field.rules || []);
  const { regex, startsWith, endsWith } = extractEmailValidationRules(
    field.rules || [],
  );

  if (!isRequired) {
    let schema = z.string();

    if (regex) {
      try {
        const regexPattern = new RegExp(regex);
        schema = schema.regex(
          regexPattern,
          `${field.label} does not match the required pattern`,
        );
      } catch (error) {
        schema = schema.email(`${field.label} must be a valid email address`);
      }
    } else {
      schema = schema.email(`${field.label} must be a valid email address`);
    }

    if (startsWith && startsWith.length > 0) {
      schema = schema.refine(
        (value) => {
          if (!value) return true;
          return startsWith.some((prefix) => value.startsWith(prefix));
        },
        {
          message: `${field.label} must start with: ${startsWith.join(' or ')}`,
        },
      );
    }

    if (endsWith && endsWith.length > 0) {
      schema = schema.refine(
        (value) => {
          if (!value) return true;
          return endsWith.some((suffix) => value.endsWith(suffix));
        },
        {
          message: `${field.label} must end with: ${endsWith.join(' or ')}`,
        },
      );
    }

    return z.union([schema, z.literal('')]);
  }

  let requiredSchema = z
    .string()
    .refine((val) => val !== null && val !== undefined, {
      message: `${field.label} is required`,
    })
    .min(1, `${field.label} is required`)
    .refine(
      (val) => {
        if (regex) {
          try {
            return new RegExp(regex).test(val);
          } catch {
            return z.string().email().safeParse(val).success;
          }
        }
        return z.string().email().safeParse(val).success;
      },
      {
        message: `${field.label} must be a valid email address`,
      },
    );

  if (startsWith && startsWith.length > 0) {
    requiredSchema = requiredSchema.refine(
      (value) => startsWith.some((prefix) => value.startsWith(prefix)),
      {
        message: `${field.label} must start with: ${startsWith.join(' or ')}`,
      },
    );
  }

  if (endsWith && endsWith.length > 0) {
    requiredSchema = requiredSchema.refine(
      (value) => endsWith.some((suffix) => value.endsWith(suffix)),
      {
        message: `${field.label} must end with: ${endsWith.join(' or ')}`,
      },
    );
  }

  return requiredSchema;
};

export const generatePasswordSchema = (field: FormField): z.ZodType => {
  const isRequired = isFieldRequired(field.rules || []);
  const { min, max } = extractValidationBounds(field.rules || []);

  let schema = z.string();

  if (min !== null) {
    schema = schema.min(
      min,
      `${field.label} must be at least ${min} characters`,
    );
  }

  if (max !== null) {
    schema = schema.max(
      max,
      `${field.label} must be at most ${max} characters`,
    );
  }

  if (!isRequired) {
    return z.union([schema, z.literal('')]);
  }

  return schema.min(1, `${field.label} is required`);
};
