/**
 * ================================
 * VALIDATION ENGINE
 * ================================
 * Central validation engine for all form field types
 * Handles Zod schema generation, conflict resolution, and cross-field validation
 *
 * Key Features:
 * - Conflict resolution for overlapping rules (min/max vs between, numeric vs integer)
 * - Cross-field validation (same/different) with access to all form values
 * - Field-specific validation logic per field type
 * - Consistent error messaging
 *
 * Architecture Decisions:
 * - Cross-field validation requires ALL form values to be passed in
 * - Field components remain dumb - they never validate themselves
 * - Pure functions with explicit dependencies
 * - Returns structured validation results, not exceptions
 */

import { z } from 'zod';
import type {
  FormField,
  FieldRule,
} from '@/features/formBuilder/endUserForms/types/formStructure.types';
import type { JsonValue } from '@/features/formBuilder/endUserForms/types/submitInitialForm.types';
import type { RuntimeFieldValues } from '../../types/runtime.types';

// ================================
// TYPES
// ================================

/**
 * Result of validating a single field
 */
export interface ValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Extracted cross-field validation rules
 */
export interface CrossFieldRules {
  sameAs: number | null;
  differentFrom: number | null;
}

// ================================
// HELPER FUNCTIONS
// ================================

/**
 * Extract validation bounds with conflict resolution
 * Priority: individual min/max rules override between rule
 * Applies to: text (string length), number, currency, percentage, date, file size
 */
const extractValidationBounds = (
  rules: FieldRule[],
): { min: number | null; max: number | null } => {
  let min: number | null = null;
  let max: number | null = null;

  const betweenRule = rules.find((rule) => rule.rule_name === 'between');
  if (betweenRule?.rule_props) {
    const props = betweenRule.rule_props as { min?: number; max?: number };
    if (typeof props.min === 'number') min = props.min;
    if (typeof props.max === 'number') max = props.max;
  }

  const minRule = rules.find((rule) => rule.rule_name === 'min');
  if (minRule?.rule_props) {
    const props = minRule.rule_props as { value?: number };
    if (typeof props.value === 'number') min = props.value;
  }

  const maxRule = rules.find((rule) => rule.rule_name === 'max');
  if (maxRule?.rule_props) {
    const props = maxRule.rule_props as { value?: number };
    if (typeof props.value === 'number') max = props.value;
  }

  return { min, max };
};

/**
 * Extract date validation bounds
 * Handles: before, after, before_or_equal, after_or_equal
 */
const extractDateValidationBounds = (
  rules: FieldRule[],
): {
  before: string | null;
  after: string | null;
  beforeOrEqual: string | null;
  afterOrEqual: string | null;
} => {
  let before: string | null = null;
  let after: string | null = null;
  let beforeOrEqual: string | null = null;
  let afterOrEqual: string | null = null;

  rules.forEach((rule) => {
    const props = rule.rule_props as { date?: string } | null;
    switch (rule.rule_name) {
      case 'before':
        if (props?.date) before = props.date;
        break;
      case 'after':
        if (props?.date) after = props.date;
        break;
      case 'before_or_equal':
        if (props?.date) beforeOrEqual = props.date;
        break;
      case 'after_or_equal':
        if (props?.date) afterOrEqual = props.date;
        break;
    }
  });

  return { before, after, beforeOrEqual, afterOrEqual };
};

/**
 * Check number type rules with conflict resolution
 * Priority: numeric takes priority over integer (allows decimals)
 */
const getNumberTypeRules = (
  rules: FieldRule[],
): { isNumeric: boolean; isInteger: boolean; allowDecimals: boolean } => {
  const hasNumeric = rules.some((rule) => rule.rule_name === 'numeric');
  const hasInteger = rules.some((rule) => rule.rule_name === 'integer');

  if (hasNumeric && hasInteger) {
    return { isNumeric: true, isInteger: false, allowDecimals: true };
  }

  if (hasInteger) {
    return { isNumeric: false, isInteger: true, allowDecimals: false };
  }

  return { isNumeric: hasNumeric, isInteger: false, allowDecimals: true };
};

/**
 * Extract cross-field validation rules (same/different)
 * These rules require comparison with other field values
 */
const extractCrossFieldRules = (rules: FieldRule[]): CrossFieldRules => {
  let sameAs: number | null = null;
  let differentFrom: number | null = null;

  rules.forEach((rule) => {
    if (rule.rule_name === 'same' && rule.rule_props) {
      const props = rule.rule_props as { comparevalue?: number | string };
      if (props.comparevalue) {
        sameAs =
          typeof props.comparevalue === 'number'
            ? props.comparevalue
            : parseInt(String(props.comparevalue), 10);
      }
    }

    if (rule.rule_name === 'different' && rule.rule_props) {
      const props = rule.rule_props as { comparevalue?: number | string };
      if (props.comparevalue) {
        differentFrom =
          typeof props.comparevalue === 'number'
            ? props.comparevalue
            : parseInt(String(props.comparevalue), 10);
      }
    }
  });

  return { sameAs, differentFrom };
};

/**
 * Check if field is required
 */
const isFieldRequired = (rules: FieldRule[]): boolean => {
  return rules.some((rule) => rule.rule_name === 'required');
};

/**
 * Compare two date strings
 */
const compareDates = (date1: string, date2: string): number => {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  if (d1 < d2) return -1;
  if (d1 > d2) return 1;
  return 0;
};

/**
 * Format date for display
 */
const formatDateForDisplay = (isoDate: string): string => {
  try {
    const date = new Date(isoDate);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return isoDate;
  }
};

/**
 * Check if file matches MIME type pattern (supports wildcards)
 */
const matchesMimeType = (fileMimeType: string, pattern: string): boolean => {
  if (pattern === '*/*') return true;

  if (pattern.endsWith('/*')) {
    const category = pattern.split('/')[0];
    return fileMimeType.startsWith(category + '/');
  }

  return fileMimeType === pattern;
};

/**
 * Format file size for display
 */
const formatFileSize = (sizeInKB: number): string => {
  if (sizeInKB < 1024) {
    return `${sizeInKB} KB`;
  }
  const sizeInMB = sizeInKB / 1024;
  return `${sizeInMB.toFixed(1)} MB`;
};

/**
 * Get file size in KB from File object
 */
const getFileSizeInKB = (file: File): number => {
  return file.size / 1024;
};

/**
 * Normalize values for cross-field comparison
 * Handles different types (string, number, boolean, objects, arrays)
 */
const normalizeForComparison = (value: JsonValue): string => {
  if (value === null || value === undefined) {
    return '';
  }
  if (typeof value === 'object') {
    return JSON.stringify(value);
  }
  return String(value);
};

// ================================
// CROSS-FIELD VALIDATION
// ================================

/**
 * Validate cross-field rules (same/different)
 * This is the core cross-field validation logic that requires all form values
 *
 * @param field - The field being validated
 * @param value - The current value of the field
 * @param allFieldValues - All field values in the form (required for cross-field checks)
 * @returns ValidationResult with error message if validation fails
 */
const validateCrossFieldRules = (
  field: FormField,
  value: JsonValue,
  allFieldValues: RuntimeFieldValues,
): ValidationResult => {
  const crossFieldRules = extractCrossFieldRules(field.rules || []);

  // Validate "same" rule
  if (crossFieldRules.sameAs !== null) {
    const compareFieldId = crossFieldRules.sameAs;
    const compareFieldValue = allFieldValues[compareFieldId];

    if (!compareFieldValue) {
      return {
        valid: false,
        error: `Cannot validate: comparison field (ID: ${compareFieldId}) not found`,
      };
    }

    const currentNormalized = normalizeForComparison(value);
    const compareNormalized = normalizeForComparison(compareFieldValue.value);

    if (currentNormalized !== compareNormalized) {
      return {
        valid: false,
        error: `${field.label} must match the other field (ID: ${compareFieldId})`,
      };
    }
  }

  // Validate "different" rule
  if (crossFieldRules.differentFrom !== null) {
    const compareFieldId = crossFieldRules.differentFrom;
    const compareFieldValue = allFieldValues[compareFieldId];

    if (!compareFieldValue) {
      return {
        valid: false,
        error: `Cannot validate: comparison field (ID: ${compareFieldId}) not found`,
      };
    }

    const currentNormalized = normalizeForComparison(value);
    const compareNormalized = normalizeForComparison(compareFieldValue.value);

    if (currentNormalized === compareNormalized) {
      return {
        valid: false,
        error: `${field.label} must be different from the other field (ID: ${compareFieldId})`,
      };
    }
  }

  return { valid: true };
};

// ================================
// TEXT INPUT VALIDATION
// ================================

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
      case 'regex':
        const regexProps = rule.rule_props as { pattern?: string } | null;
        if (regexProps?.pattern) regex = regexProps.pattern;
        break;
      case 'alpha':
        alpha = true;
        break;
      case 'alpha_num':
        alphaNum = true;
        break;
      case 'alpha_dash':
        alphaDash = true;
        break;
      case 'starts_with':
        const startsProps = rule.rule_props as { values?: string[] } | null;
        if (startsProps?.values) startsWith = startsProps.values;
        break;
      case 'ends_with':
        const endsProps = rule.rule_props as { values?: string[] } | null;
        if (endsProps?.values) endsWith = endsProps.values;
        break;
    }
  });

  return { regex, alpha, alphaNum, alphaDash, startsWith, endsWith };
};

const generateTextInputSchema = (field: FormField): z.ZodType => {
  const isRequired = isFieldRequired(field.rules || []);
  
  // Extract bounds with mixed between + standalone priority
  let min: number | null = null;
  let max: number | null = null;
  
  // Check for between rule first (partial priority)
  const betweenRule = (field.rules || []).find(rule => rule.rule_name === 'between');
  const betweenProps = betweenRule?.rule_props as { min?: number, max?: number } || {};
  const { min: betweenMin, max: betweenMax } = betweenProps;
  
  if (betweenMin !== undefined) {
    min = Number(betweenMin);
  }
  
  if (betweenMax !== undefined) {
    max = Number(betweenMax);
  }
  
  // Fallback logic - only use standalone if between didn't provide that bound
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

  // Apply length bounds
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

  // Regex and pattern validations
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
        /^[a-zA-Z0-9_-]*$/,
        `${field.label} must contain only letters, numbers, dashes, and underscores`,
      );
    } else if (alphaNum) {
      schema = schema.regex(
        /^[a-zA-Z0-9]*$/,
        `${field.label} must contain only letters and numbers`,
      );
    } else if (alpha) {
      schema = schema.regex(
        /^[a-zA-Z]*$/,
        `${field.label} must contain only letters`,
      );
    }
  }

  // Prefix/Suffix validations
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

const generateTextAreaSchema = (field: FormField): z.ZodType => {
  return generateTextInputSchema(field);
};

// ================================
// EMAIL INPUT VALIDATION
// ================================

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
      case 'regex':
        const regexProps = rule.rule_props as { pattern?: string } | null;
        if (regexProps?.pattern) regex = regexProps.pattern;
        break;
      case 'starts_with':
        const startsProps = rule.rule_props as { values?: string[] } | null;
        if (startsProps?.values) startsWith = startsProps.values;
        break;
      case 'ends_with':
        const endsProps = rule.rule_props as { values?: string[] } | null;
        if (endsProps?.values) endsWith = endsProps.values;
        break;
    }
  });

  return { regex, startsWith, endsWith };
};

const generateEmailInputSchema = (field: FormField): z.ZodType => {
  const isRequired = isFieldRequired(field.rules || []);
  const { regex } = extractEmailValidationRules(field.rules || []);

  if (!isRequired) {
    // Build full schema for optional case
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
    // ... startsWith/endsWith ...
    return z.union([schema, z.literal('')]);
  }

  // ✅ REQUIRED: Build from scratch with CORRECT ORDER
  return z
    .string()
    .refine((val) => val !== null && val !== undefined, {
      message: `${field.label} is required`,
    })
    .min(1, `${field.label} is required`)
    .refine(
      (val) => {
        // Email validation LAST
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
  // Add startsWith/endsWith after email validation...
};

// ================================
// NUMBER INPUT VALIDATION
// ================================

const generateNumberInputSchema = (field: FormField): z.ZodType => {
  const isRequired = isFieldRequired(field.rules || []);
  
  // Extract bounds with mixed between + standalone priority
  let min: number | null = null;
  let max: number | null = null;
  
  // Check for between rule first (partial priority)
  const betweenRule = (field.rules || []).find(rule => rule.rule_name === 'between');
  const betweenProps = betweenRule?.rule_props as { min?: number, max?: number } || {};
  const { min: betweenMin, max: betweenMax } = betweenProps;
  
  if (betweenMin !== undefined) {
    min = Number(betweenMin);
  }
  
  if (betweenMax !== undefined) {
    max = Number(betweenMax);
  }
  
  // FIXED: Fallback logic - only use standalone if between didn't provide that bound
  if (min === null) {
    const { min: standaloneMin } = extractValidationBounds(field.rules || []);
    min = standaloneMin;
  }
  
  if (max === null) {
    const { max: standaloneMax } = extractValidationBounds(field.rules || []);
    max = standaloneMax;
  }

  const { allowDecimals } = getNumberTypeRules(field.rules || []);

  let schema = z.coerce.number({
    message: `${field.label} must be a number`,
  });

  if (!allowDecimals) {
    schema = schema.int(`${field.label} must be an integer (no decimals)`);
  }

  // Apply bounds validations
  if (min !== null) {
    schema = schema.min(min, `${field.label} must be at least ${min}`);
  }

  if (max !== null) {
    schema = schema.max(max, `${field.label} must be at most ${max}`);
  }

  if (!isRequired) {
    return schema.optional() as z.ZodType;
  }

  return schema.refine(
    (val) => val !== undefined && val !== null && !isNaN(val),
    {
      message: `${field.label} is required`,
    },
  );
};

// ================================
// CURRENCY INPUT VALIDATION
// ================================

const generateCurrencyInputSchema = (field: FormField): z.ZodType => {
  const isRequired = isFieldRequired(field.rules || []);
  
  // Extract bounds with mixed between + standalone priority
  let min: number | null = null;
  let max: number | null = null;
  
  // Check for between rule first (partial priority)
  const betweenRule = (field.rules || []).find(rule => rule.rule_name === 'between');
  const betweenProps = betweenRule?.rule_props as { min?: number, max?: number } || {};
  const { min: betweenMin, max: betweenMax } = betweenProps;
  
  if (betweenMin !== undefined) {
    min = Number(betweenMin);
  }
  
  if (betweenMax !== undefined) {
    max = Number(betweenMax);
  }
  
  // Fallback logic - only use standalone if between didn't provide that bound
  if (min === null) {
    const { min: standaloneMin } = extractValidationBounds(field.rules || []);
    min = standaloneMin;
  }
  
  if (max === null) {
    const { max: standaloneMax } = extractValidationBounds(field.rules || []);
    max = standaloneMax;
  }

  let schema = z.number();

  // Apply bounds validations
  if (min !== null) {
    schema = schema.min(min, `${field.label} must be at least ${min}`);
  }

  if (max !== null) {
    schema = schema.max(max, `${field.label} must be at most ${max}`);
  }

  if (!isRequired) {
    return schema.optional() as z.ZodType;
  }

  return schema.refine(
    (val) => val !== undefined && val !== null && !isNaN(val),
    {
      message: `${field.label} is required`,
    },
  );
};

// ================================
// PERCENTAGE INPUT VALIDATION
// ================================

const generatePercentageInputSchema = (field: FormField): z.ZodType => {
  const isRequired = isFieldRequired(field.rules || []);
  
  // Extract bounds with mixed between + standalone priority
  let min: number | null = null;
  let max: number | null = null;
  
  // Check for between rule first (partial priority)
  const betweenRule = (field.rules || []).find(rule => rule.rule_name === 'between');
  const betweenProps = betweenRule?.rule_props as { min?: number, max?: number } || {};
  const { min: betweenMin, max: betweenMax } = betweenProps;
  
  if (betweenMin !== undefined) {
    min = Number(betweenMin);
  }
  
  if (betweenMax !== undefined) {
    max = Number(betweenMax);
  }
  
  // Fallback logic - only use standalone if between didn't provide that bound
  if (min === null) {
    const { min: standaloneMin } = extractValidationBounds(field.rules || []);
    min = standaloneMin;
  }
  
  if (max === null) {
    const { max: standaloneMax } = extractValidationBounds(field.rules || []);
    max = standaloneMax;
  }

  let schema = z.number();

  // Apply percentage bounds with defaults (0-100)
  const minValue = min !== null ? min : 0;
  schema = schema.min(minValue, `${field.label} must be at least ${minValue}%`);

  const maxValue = max !== null ? max : 100;
  schema = schema.max(maxValue, `${field.label} must be at most ${maxValue}%`);

  if (!isRequired) {
    return schema.optional() as z.ZodType;
  }

  return schema.refine(
    (val) => val !== undefined && val !== null && !isNaN(val),
    {
      message: `${field.label} is required`,
    },
  );
};

// ================================
// PHONE INPUT VALIDATION
// ================================

const E164_PATTERN = /^\+[1-9]\d{1,14}$/;

const cleanPhoneNumber = (phone: string): string => {
  if (!phone) return '';
  const cleaned = phone.replace(/[^\d+]/g, '');
  if (cleaned.startsWith('+')) {
    return '+' + cleaned.substring(1).replace(/\+/g, '');
  }
  return cleaned;
};

const isValidPhoneFormat = (phone: string): boolean => {
  if (!phone) return false;
  return E164_PATTERN.test(phone);
};

const generatePhoneInputSchema = (field: FormField): z.ZodType => {
  const isRequired = isFieldRequired(field.rules || []);
  const regexRule = field.rules?.find((rule) => rule.rule_name === 'regex');
  const startsWithRule = field.rules?.find(
    (rule) => rule.rule_name === 'starts_with',
  );

  let schema = z.string();

  schema = schema.refine(
    (value) => {
      if (!value) return !isRequired;
      const cleaned = cleanPhoneNumber(value);
      return isValidPhoneFormat(cleaned);
    },
    { message: `${field.label} must be a valid phone number` },
  );

  if (regexRule?.rule_props) {
    const props = regexRule.rule_props as { pattern?: string };
    if (props.pattern) {
      try {
        const regex = new RegExp(props.pattern);
        schema = schema.refine(
          (value) => {
            if (!value) return !isRequired;
            return regex.test(value);
          },
          { message: `${field.label} format is invalid` },
        );
      } catch (e) {
        console.error(
          '[validationEngine] Invalid regex pattern:',
          props.pattern,
        );
      }
    }
  }

  if (startsWithRule?.rule_props) {
    const props = startsWithRule.rule_props as { values?: string[] };
    if (props.values && props.values.length > 0) {
      schema = schema.refine(
        (value) => {
          if (!value) return !isRequired;
          return props.values!.some((prefix) => value.startsWith(prefix));
        },
        {
          message: `${field.label} must start with: ${props.values.join(' or ')}`,
        },
      );
    }
  }

  if (!isRequired) {
    return z.union([schema, z.literal('')]);
  }

  return schema.min(1, `${field.label} is required`);
};

// ================================
// URL INPUT VALIDATION
// ================================

const generateUrlInputSchema = (field: FormField): z.ZodType => {
  const isRequired = isFieldRequired(field.rules || []);

  let schema = z.string().url(`${field.label} must be a valid URL`);

  if (!isRequired) {
    return z.union([schema, z.literal('')]);
  }

  return schema.min(1, `${field.label} is required`);
};

// ================================
// DATE INPUT VALIDATION
// ================================

const generateDateInputSchema = (field: FormField): z.ZodType => {
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
        message: `${field.label} must be on or before ${formatDateForDisplay(beforeOrEqual)}`,
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
        message: `${field.label} must be on or after ${formatDateForDisplay(afterOrEqual)}`,
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
// ================================
// TIME INPUT VALIDATION
// ================================

const generateTimeInputSchema = (field: FormField): z.ZodType => {
  const isRequired = isFieldRequired(field.rules || []);

  if (!isRequired) {
    return z.union([
      z
        .string()
        .regex(/^\d{2}:\d{2}$/, `${field.label} must be a valid time (HH:MM)`),
      z.literal(''),
    ]);
  }

  // ✅ Required: null check → length → format (in correct order)
  return z
    .string()
    .refine((val) => val !== null && val !== undefined, {
      message: `${field.label} is required`,
    })
    .min(1, `${field.label} is required`)
    .regex(/^\d{2}:\d{2}$/, `${field.label} must be a valid time (HH:MM)`);
};

// ================================
// DATE TIME INPUT VALIDATION
// ================================

const generateDateTimeInputSchema = (field: FormField): z.ZodType => {
  const isRequired = isFieldRequired(field.rules || []);

  if (!isRequired) {
    return z.union([
      z
        .string()
        .regex(
          /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/,
          `${field.label} must be a valid date and time`,
        ),
      z.literal(''),
    ]);
  }

  // ✅ Required: null check → length → format (CORRECT order)
  return z
    .string()
    .refine((val) => val !== null && val !== undefined, {
      message: `${field.label} is required`,
    })
    .min(1, `${field.label} is required`)
    .regex(
      /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/,
      `${field.label} must be a valid date and time`,
    );
};

// ================================
// DROPDOWN VALIDATION
// ================================

const generateDropdownSchema = (field: FormField): z.ZodType => {
  const isRequired = isFieldRequired(field.rules || []);

  let schema = z.string();

  if (!isRequired) {
    return z.union([schema, z.literal('')]);
  }

  return schema.min(1, `${field.label} is required`);
};

// ================================
// MULTI-SELECT VALIDATION
// ================================

const generateMultiSelectSchema = (field: FormField): z.ZodType => {
  const isRequired = isFieldRequired(field.rules || []);
  const { min, max } = extractValidationBounds(field.rules || []);

  let schema = z.array(z.string());

  if (min !== null) {
    schema = schema.min(
      min,
      `${field.label} must have at least ${min} selection(s)`,
    );
  }

  if (max !== null) {
    schema = schema.max(
      max,
      `${field.label} must have at most ${max} selection(s)`,
    );
  }

  if (!isRequired) {
    return z.union([schema, z.array(z.string()).length(0)]);
  }

  return schema.min(1, `${field.label} is required`);
};

// ================================
// CHECKBOX VALIDATION
// ================================

const generateCheckboxSchema = (field: FormField): z.ZodType => {
  const isRequired = isFieldRequired(field.rules || []);

  let schema = z.boolean();

  if (isRequired) {
    schema = schema.refine((val) => val === true, {
      message: `${field.label} must be checked`,
    });
  }

  return schema;
};

// ================================
// TOGGLE SWITCH VALIDATION
// ================================

const generateToggleSwitchSchema = (_field: FormField): z.ZodType => {
  return z.boolean();
};

// ================================
// RADIO GROUP VALIDATION
// ================================

const generateRadioGroupSchema = (field: FormField): z.ZodType => {
  const isRequired = isFieldRequired(field.rules || []);

  let schema = z.string();

  if (!isRequired) {
    return z.union([schema, z.literal('')]);
  }

  return schema.min(1, `${field.label} is required`);
};

// ================================
// SLIDER VALIDATION
// ================================

const generateSliderSchema = (field: FormField): z.ZodType => {
  const isRequired = isFieldRequired(field.rules || []);
  
  // Extract bounds with mixed between + standalone priority
  let min: number | null = null;
  let max: number | null = null;
  
  // Check for between rule first (partial priority)
  const betweenRule = (field.rules || []).find(rule => rule.rule_name === 'between');
  const betweenProps = betweenRule?.rule_props as { min?: number, max?: number } || {};
  const { min: betweenMin, max: betweenMax } = betweenProps;
  
  if (betweenMin !== undefined) {
    min = Number(betweenMin);
  }
  
  if (betweenMax !== undefined) {
    max = Number(betweenMax);
  }
  
  // Fallback logic - only use standalone if between didn't provide that bound
  if (min === null) {
    const { min: standaloneMin } = extractValidationBounds(field.rules || []);
    min = standaloneMin;
  }
  
  if (max === null) {
    const { max: standaloneMax } = extractValidationBounds(field.rules || []);
    max = standaloneMax;
  }

  let schema = z.number();
  console.log('min:', min, 'max:', max);

  // Apply bounds validations
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

// ================================
// RATING VALIDATION
// ================================

const generateRatingSchema = (field: FormField): z.ZodType => {
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

// ================================
// FILE UPLOAD VALIDATION
// ================================

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
      case 'max_file_size':
        const maxProps = rule.rule_props as { maxsize?: number } | null;
        if (maxProps?.maxsize) maxSize = maxProps.maxsize;
        break;
      case 'min_file_size':
        const minProps = rule.rule_props as { minsize?: number } | null;
        if (minProps?.minsize) minSize = minProps.minsize;
        break;
      case 'mimetypes':
        const typeProps = rule.rule_props as { types?: string[] } | null;
        if (typeProps?.types) mimeTypes = typeProps.types;
        break;
    }
  });

  return { maxSize, minSize, mimeTypes };
};

const generateFileUploadSchema = (field: FormField): z.ZodType => {
  const isRequired = isFieldRequired(field.rules || []);
  const { maxSize, minSize, mimeTypes } = extractFileValidationRules(
    field.rules || [],
  );

  let schema = z.instanceof(File);

  if (mimeTypes && mimeTypes.length > 0) {
    schema = schema.refine(
      (file) => mimeTypes.some((type) => matchesMimeType(file.type, type)),
      { message: `File type must be one of: ${mimeTypes.join(', ')}` },
    );
  }

  if (minSize !== null) {
    schema = schema.refine((file) => getFileSizeInKB(file) >= minSize, {
      message: `File size must be at least ${formatFileSize(minSize)}`,
    });
  }

  if (maxSize !== null) {
    schema = schema.refine((file) => getFileSizeInKB(file) <= maxSize, {
      message: `File size must be less than ${formatFileSize(maxSize)}`,
    });
  }

  if (!isRequired) {
    return z.union([schema, z.null()]);
  }

  return schema.refine((file) => file !== null, {
    message: `${field.label} is required`,
  });
};

const generateImageUploadSchema = (field: FormField): z.ZodType => {
  return generateFileUploadSchema(field);
};

const generateVideoUploadSchema = (field: FormField): z.ZodType => {
  return generateFileUploadSchema(field);
};

const generateDocumentUploadSchema = (field: FormField): z.ZodType => {
  return generateFileUploadSchema(field);
};

// ================================
// SIGNATURE PAD VALIDATION
// ================================

const generateSignaturePadSchema = (field: FormField): z.ZodType => {
  const isRequired = isFieldRequired(field.rules || []);

  let schema = z.string();

  schema = schema.refine(
    (value) => {
      if (!value) return !isRequired;
      return value.startsWith('data:image/png;base64,');
    },
    { message: `${field.label} must be a valid signature` },
  );

  if (!isRequired) {
    return z.union([schema, z.literal('')]);
  }

  return schema.min(1, `${field.label} is required`);
};

// ================================
// COLOR PICKER VALIDATION
// ================================

const generateColorPickerSchema = (field: FormField): z.ZodType => {
  const isRequired = isFieldRequired(field.rules || []);

  let schema = z
    .string()
    .regex(
      /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/,
      `${field.label} must be a valid color`,
    );

  if (!isRequired) {
    return z.union([schema, z.literal('')]);
  }

  return schema.min(1, `${field.label} is required`);
};

// ================================
// LOCATION PICKER VALIDATION
// ================================

const generateLocationPickerSchema = (field: FormField): z.ZodType => {
  const isRequired = isFieldRequired(field.rules || []);

  if (!isRequired) {
    return z.union([
      z.object({
        lat: z.number(),
        lng: z.number(),
        address: z.string().optional(),
      }),
      z.null(),
    ]);
  }

  // ✅ KEY: Use nullable() to allow null → then reject it with refine
  return z
    .object({
      lat: z.number(),
      lng: z.number(),
      address: z.string().optional(),
    })
    .nullable() // ✅ Allows null to pass type check
    .refine((val) => val !== null, {
      // ✅ Now catches null
      message: `${field.label} is required`,
    });
};

// ================================
// ADDRESS VALIDATION
// ================================

const generateAddressSchema = (field: FormField): z.ZodType => {
  console.log('hello from address schema');
  const isRequired = isFieldRequired(field.rules || []);

  // Helper: Reject empty strings OR spaces-only
  const nonEmptyString = z
    .string()
    .min(1)
    .refine((val) => val.trim().length > 0, {
      message: 'This field cannot be empty or contain only spaces',
    });

  let schema = z
    .object({
      street: nonEmptyString,
      city: nonEmptyString,
      state: nonEmptyString,
      postal_code: nonEmptyString,
      country: nonEmptyString,
    })
    .superRefine((data, _ctx) => {
      console.log('📍 Current Address Input Values:', data);
    });

  if (!isRequired) {
    return z.union([schema, z.null()]) as z.ZodType;
  }

  return schema;
};

// ================================
// PASSWORD VALIDATION
// ================================

const generatePasswordSchema = (field: FormField): z.ZodType => {
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

// ================================
// SCHEMA FACTORY
// ================================

/**
 * Generate Zod schema for a field based on its type
 * This schema does NOT include cross-field validation
 *
 * @param field - Form field configuration
 * @returns Zod schema for the field
 */
const generateFieldSchema = (field: FormField): z.ZodType => {
  switch (field.field_type) {
    case 'Text Input':
      return generateTextInputSchema(field);
    case 'Text Area':
      return generateTextAreaSchema(field);
    case 'Email Input':
      return generateEmailInputSchema(field);
    case 'Number Input':
      return generateNumberInputSchema(field);
    case 'Currency Input':
      return generateCurrencyInputSchema(field);
    case 'Percentage Input':
      return generatePercentageInputSchema(field);
    case 'Phone Input':
      return generatePhoneInputSchema(field);
    case 'URL Input':
      return generateUrlInputSchema(field);
    case 'Date Input':
      return generateDateInputSchema(field);
    case 'Time Input':
      return generateTimeInputSchema(field);
    case 'DateTime Input':
      return generateDateTimeInputSchema(field);
    case 'Dropdown Select':
      return generateDropdownSchema(field);
    case 'Multi_Select':
      return generateMultiSelectSchema(field);
    case 'Checkbox':
      return generateCheckboxSchema(field);
    case 'Toggle Switch':
      return generateToggleSwitchSchema(field);
    case 'Radio Button':
      return generateRadioGroupSchema(field);
    case 'Slider':
      return generateSliderSchema(field);
    case 'Rating':
      return generateRatingSchema(field);
    case 'File Upload':
      return generateFileUploadSchema(field);
    case 'Image Upload':
      return generateImageUploadSchema(field);
    case 'Video Upload':
      return generateVideoUploadSchema(field);
    case 'Document Upload':
      return generateDocumentUploadSchema(field);
    case 'Signature Pad':
      return generateSignaturePadSchema(field);
    case 'Color Picker':
      return generateColorPickerSchema(field);
    case 'Location Picker':
      return generateLocationPickerSchema(field);
    case 'Address Input':
      return generateAddressSchema(field);
    case 'Password Input':
      return generatePasswordSchema(field);
    default:
      console.warn(
        `[validationEngine] Unknown field type: ${field.field_type}, using string schema`,
      );
      return z.string();
  }
};

// ================================
// PUBLIC API
// ================================

/**
 * Validate a single field with full cross-field validation support
 *
 * This is the primary validation function used by the runtime form hook.
 * It performs both Zod schema validation AND cross-field validation.
 *
 * @param field - The field to validate
 * @param value - The current value of the field
 * @param allFieldValues - All field values in the form (required for cross-field validation)
 * @returns ValidationResult with error message if validation fails
 */
export const validateField = (
  field: FormField,
  value: JsonValue,
  allFieldValues: RuntimeFieldValues,
): ValidationResult => {
  // Step 1: Perform Zod schema validation
  const schema = generateFieldSchema(field);
  const result = schema.safeParse(value);

  if (!result.success) {
    const errorMessage = result.error.issues[0]?.message || 'Validation failed';
    return {
      valid: false,
      error: errorMessage,
    };
  }

  // Step 2: Perform cross-field validation (same/different rules)
  const crossFieldResult = validateCrossFieldRules(
    field,
    value,
    allFieldValues,
  );
  if (!crossFieldResult.valid) {
    return crossFieldResult;
  }

  return { valid: true };
};

/**
 * Check if a field has cross-field validation rules
 * Useful for determining if a field needs revalidation when other fields change
 *
 * @param field - The field to check
 * @returns true if field has same/different rules
 */
export const hasCrossFieldRules = (field: FormField): boolean => {
  const rules = extractCrossFieldRules(field.rules || []);
  return rules.sameAs !== null || rules.differentFrom !== null;
};

/**
 * Get the field IDs that this field depends on for validation
 * Used to determine when to trigger revalidation
 *
 * @param field - The field to analyze
 * @returns Array of field IDs this field depends on
 */
export const getCrossFieldDependencies = (field: FormField): number[] => {
  const rules = extractCrossFieldRules(field.rules || []);
  const dependencies: number[] = [];

  if (rules.sameAs !== null) {
    dependencies.push(rules.sameAs);
  }

  if (rules.differentFrom !== null) {
    dependencies.push(rules.differentFrom);
  }

  return dependencies;
};
