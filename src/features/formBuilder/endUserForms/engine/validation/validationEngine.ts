/**
 * ================================
 * VALIDATION ENGINE
 * ================================
 * Central validation engine for all form field types
 * Handles Zod schema generation, conflict resolution, and cross-field validation
 * 
 * Key Features:
 * - Conflict resolution for overlapping rules (min/max vs between, numeric vs integer)
 * - Cross-field validation (same/different)
 * - Field-specific validation logic per field type
 * - Consistent error messaging
 */

import { z } from 'zod';
import type { FormField, FieldRule } from '@/features/formBuilder/endUserForms/types/formStructure.types';

// ================================
// TYPES
// ================================

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

export interface CrossFieldValidation {
  fieldId: number;
  ruleName: 'same' | 'different';
  compareFieldId: number;
  message: string;
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
  rules: FieldRule[]
): { min: number | null; max: number | null } => {
  let min: number | null = null;
  let max: number | null = null;

  // First, check for between rule
  const betweenRule = rules.find((rule) => rule.rule_name === 'between');
  if (betweenRule?.rule_props) {
    const props = betweenRule.rule_props as { min?: number; max?: number };
    if (typeof props.min === 'number') min = props.min;
    if (typeof props.max === 'number') max = props.max;
  }

  // Then, override with individual min rule (takes priority)
  const minRule = rules.find((rule) => rule.rule_name === 'min');
  if (minRule?.rule_props) {
    const props = minRule.rule_props as { value?: number };
    if (typeof props.value === 'number') min = props.value;
  }

  // Finally, override with individual max rule (takes priority)
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
  rules: FieldRule[]
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
  rules: FieldRule[]
): { isNumeric: boolean; isInteger: boolean; allowDecimals: boolean } => {
  const hasNumeric = rules.some((rule) => rule.rule_name === 'numeric');
  const hasInteger = rules.some((rule) => rule.rule_name === 'integer');

  // If both exist, numeric takes priority (allows decimals)
  if (hasNumeric && hasInteger) {
    return { isNumeric: true, isInteger: false, allowDecimals: true };
  }

  // If only integer, don't allow decimals
  if (hasInteger) {
    return { isNumeric: false, isInteger: true, allowDecimals: false };
  }

  // If only numeric or neither, allow decimals
  return { isNumeric: hasNumeric, isInteger: false, allowDecimals: true };
};

/**
 * Extract cross-field validation rules (same/different)
 */
const extractCrossFieldRules = (
  rules: FieldRule[]
): { sameAs: number | null; differentFrom: number | null } => {
  let sameAs: number | null = null;
  let differentFrom: number | null = null;

  rules.forEach((rule) => {
    if (rule.rule_name === 'same' && rule.rule_props) {
      const props = rule.rule_props as { comparevalue?: number | string };
      if (props.comparevalue) {
        sameAs = typeof props.comparevalue === 'number'
          ? props.comparevalue
          : parseInt(props.comparevalue);
      }
    }
    if (rule.rule_name === 'different' && rule.rule_props) {
      const props = rule.rule_props as { comparevalue?: number | string };
      if (props.comparevalue) {
        differentFrom = typeof props.comparevalue === 'number'
          ? props.comparevalue
          : parseInt(props.comparevalue);
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
  
  // Handle wildcards (e.g., image/*, video/*)
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

// ================================
// TEXT INPUT VALIDATION
// ================================

const extractTextValidationRules = (
  rules: FieldRule[]
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
  const { min, max } = extractValidationBounds(field.rules || []);
  const { regex, alpha, alphaNum, alphaDash, startsWith, endsWith } = extractTextValidationRules(
    field.rules || []
  );

  console.debug('[validationEngine] Text Input schema:', {
    fieldId: field.field_id,
    isRequired,
    min,
    max,
    hasRegex: !!regex,
  });

  let schema = z.string();

  // Apply min/max length
  if (min !== null) {
    schema = schema.min(min, `${field.label} must be at least ${min} characters`);
  }
  if (max !== null) {
    schema = schema.max(max, `${field.label} must be at most ${max} characters`);
  }

  // Apply regex (takes priority over alpha rules)
  if (regex) {
    try {
      const regexPattern = new RegExp(regex);
      schema = schema.regex(regexPattern, `${field.label} does not match the required pattern`);
    } catch (error) {
      console.error('[validationEngine] Invalid regex pattern:', regex);
    }
  } else {
    // Apply alpha rules (priority: alpha_dash > alpha_num > alpha)
    if (alphaDash) {
      schema = schema.regex(
        /^[a-zA-Z0-9_-]*$/,
        `${field.label} must contain only letters, numbers, dashes, and underscores`
      );
    } else if (alphaNum) {
      schema = schema.regex(
        /^[a-zA-Z0-9]*$/,
        `${field.label} must contain only letters and numbers`
      );
    } else if (alpha) {
      schema = schema.regex(
        /^[a-zA-Z]*$/,
        `${field.label} must contain only letters`
      );
    }
  }

  // Apply starts_with validation
  if (startsWith && startsWith.length > 0) {
    schema = schema.refine(
      (value) => {
        if (!value) return true;
        return startsWith.some((prefix) => value.startsWith(prefix));
      },
      { message: `${field.label} must start with: ${startsWith.join(' or ')}` }
    );
  }

  // Apply ends_with validation
  if (endsWith && endsWith.length > 0) {
    schema = schema.refine(
      (value) => {
        if (!value) return true;
        return endsWith.some((suffix) => value.endsWith(suffix));
      },
      { message: `${field.label} must end with: ${endsWith.join(' or ')}` }
    );
  }

  // Handle required/optional
  if (!isRequired) {
    return z.union([schema, z.literal('')]);
  }

  return schema.min(1, `${field.label} is required`);
};

// ================================
// TEXT AREA VALIDATION
// ================================

const generateTextAreaSchema = (field: FormField): z.ZodType => {
  // TextArea uses same logic as Text Input
  return generateTextInputSchema(field);
};

// ================================
// EMAIL INPUT VALIDATION
// ================================

const extractEmailValidationRules = (
  rules: FieldRule[]
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
  const { regex, startsWith, endsWith } = extractEmailValidationRules(field.rules || []);

  console.debug('[validationEngine] Email Input schema:', {
    fieldId: field.field_id,
    isRequired,
    hasRegex: !!regex,
  });

  let schema = z.string();

  // If regex rule exists, use it instead of default email validation
  if (regex) {
    try {
      const regexPattern = new RegExp(regex);
      schema = schema.regex(regexPattern, `${field.label} does not match the required pattern`);
    } catch (error) {
      console.error('[validationEngine] Invalid regex pattern:', regex);
      schema = schema.email(`${field.label} must be a valid email address`);
    }
  } else {
    schema = schema.email(`${field.label} must be a valid email address`);
  }

  // Apply starts_with validation
  if (startsWith && startsWith.length > 0) {
    schema = schema.refine(
      (value) => {
        if (!value) return true;
        return startsWith.some((prefix) => value.startsWith(prefix));
      },
      { message: `${field.label} must start with: ${startsWith.join(' or ')}` }
    );
  }

  // Apply ends_with validation
  if (endsWith && endsWith.length > 0) {
    schema = schema.refine(
      (value) => {
        if (!value) return true;
        return endsWith.some((suffix) => value.endsWith(suffix));
      },
      { message: `${field.label} must end with: ${endsWith.join(' or ')}` }
    );
  }

  // Handle required/optional
  if (!isRequired) {
    return z.union([schema, z.literal('')]);
  }

  return schema.min(1, `${field.label} is required`);
};

// ================================
// NUMBER INPUT VALIDATION
// ================================

const generateNumberInputSchema = (field: FormField): z.ZodType => {
  const isRequired = isFieldRequired(field.rules || []);
  const { min, max } = extractValidationBounds(field.rules || []);
  const { allowDecimals } = getNumberTypeRules(field.rules || []);

  console.debug('[validationEngine] Number Input schema:', {
    fieldId: field.field_id,
    isRequired,
    min,
    max,
    allowDecimals,
  });

  let schema = z.coerce.number({
    message: `${field.label} must be a number`
  });

  // Apply integer validation if decimals not allowed
  if (!allowDecimals) {
    schema = schema.int(`${field.label} must be an integer (no decimals)`);
  }

  // Apply min validation
  if (min !== null) {
    schema = schema.min(min, `${field.label} must be at least ${min}`);
  }

  // Apply max validation
  if (max !== null) {
    schema = schema.max(max, `${field.label} must be at most ${max}`);
  }

  // Handle required/optional
  if (!isRequired) {
    return schema.optional() as z.ZodType;
  }

  return schema.refine((val) => val !== undefined && val !== null && !isNaN(val), {
    message: `${field.label} is required`,
  });
};

// ================================
// CURRENCY INPUT VALIDATION
// ================================

const generateCurrencyInputSchema = (field: FormField): z.ZodType => {
  const isRequired = isFieldRequired(field.rules || []);
  const { min, max } = extractValidationBounds(field.rules || []);

  console.debug('[validationEngine] Currency Input schema:', {
    fieldId: field.field_id,
    isRequired,
    min,
    max,
  });

  let schema = z.number();

  // Apply min validation
  if (min !== null) {
    schema = schema.min(min, `${field.label} must be at least ${min}`);
  }

  // Apply max validation
  if (max !== null) {
    schema = schema.max(max, `${field.label} must be at most ${max}`);
  }

  // Handle required/optional
  if (!isRequired) {
    return schema.optional() as z.ZodType;
  }

  return schema.refine((val) => val !== undefined && val !== null && !isNaN(val), {
    message: `${field.label} is required`,
  });
};

// ================================
// PERCENTAGE INPUT VALIDATION
// ================================

const generatePercentageInputSchema = (field: FormField): z.ZodType => {
  const isRequired = isFieldRequired(field.rules || []);
  const { min, max } = extractValidationBounds(field.rules || []);

  console.debug('[validationEngine] Percentage Input schema:', {
    fieldId: field.field_id,
    isRequired,
    min,
    max,
  });

  let schema = z.number();

  // Apply min validation (default to 0 for percentages if not specified)
  const minValue = min !== null ? min : 0;
  schema = schema.min(minValue, `${field.label} must be at least ${minValue}%`);

  // Apply max validation (default to 100 for percentages if not specified)
  const maxValue = max !== null ? max : 100;
  schema = schema.max(maxValue, `${field.label} must be at most ${maxValue}%`);

  // Handle required/optional
  if (!isRequired) {
    return schema.optional() as z.ZodType;
  }

  return schema.refine((val) => val !== undefined && val !== null && !isNaN(val), {
    message: `${field.label} is required`,
  });
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
  const startsWithRule = field.rules?.find((rule) => rule.rule_name === 'starts_with');

  console.debug('[validationEngine] Phone Input schema:', {
    fieldId: field.field_id,
    isRequired,
    hasRegex: !!regexRule,
    hasStartsWith: !!startsWithRule,
  });

  let schema = z.string();

  // Apply basic phone format validation
  schema = schema.refine(
    (value) => {
      if (!value) return !isRequired;
      const cleaned = cleanPhoneNumber(value);
      return isValidPhoneFormat(cleaned);
    },
    { message: `${field.label} must be a valid phone number` }
  );

  // Apply custom regex validation (overrides default if present)
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
          { message: `${field.label} format is invalid` }
        );
      } catch (e) {
        console.error('[validationEngine] Invalid regex pattern:', props.pattern);
      }
    }
  }

  // Apply starts_with validation
  if (startsWithRule?.rule_props) {
    const props = startsWithRule.rule_props as { values?: string[] };
    if (props.values && props.values.length > 0) {
      schema = schema.refine(
        (value) => {
          if (!value) return !isRequired;
          return props.values!.some((prefix) => value.startsWith(prefix));
        },
        { message: `${field.label} must start with: ${props.values.join(' or ')}` }
      );
    }
  }

  // Handle required/optional
  if (!isRequired) {
    return z.union([schema, z.literal('')]);
  }

  return schema.min(1, `${field.label} is required`);
};

// ================================
// PASSWORD INPUT VALIDATION
// ================================

const generatePasswordInputSchema = (field: FormField): z.ZodType => {
  const isRequired = isFieldRequired(field.rules || []);
  const { min, max } = extractValidationBounds(field.rules || []);

  console.debug('[validationEngine] Password Input schema:', {
    fieldId: field.field_id,
    isRequired,
    min,
    max,
  });

  let schema = z.string();

  // Apply min length
  if (min !== null) {
    schema = schema.min(min, `${field.label} must be at least ${min} characters`);
  }

  // Apply max length
  if (max !== null) {
    schema = schema.max(max, `${field.label} must be at most ${max} characters`);
  }

  // Handle required/optional
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
  const { before, after, beforeOrEqual, afterOrEqual } = extractDateValidationBounds(
    field.rules || []
  );

  console.debug('[validationEngine] Date Input schema:', {
    fieldId: field.field_id,
    isRequired,
    before,
    after,
  });

  let schema = z.string().regex(
    /^\d{4}-\d{2}-\d{2}$/,
    'Date must be in YYYY-MM-DD format'
  );

  // Apply after validation
  if (after) {
    schema = schema.refine(
      (date) => compareDates(date, after) > 0,
      { message: `${field.label} must be after ${formatDateForDisplay(after)}` }
    );
  }

  // Apply after_or_equal validation
  if (afterOrEqual) {
    schema = schema.refine(
      (date) => compareDates(date, afterOrEqual) >= 0,
      { message: `${field.label} must be on or after ${formatDateForDisplay(afterOrEqual)}` }
    );
  }

  // Apply before validation
  if (before) {
    schema = schema.refine(
      (date) => compareDates(date, before) < 0,
      { message: `${field.label} must be before ${formatDateForDisplay(before)}` }
    );
  }

  // Apply before_or_equal validation
  if (beforeOrEqual) {
    schema = schema.refine(
      (date) => compareDates(date, beforeOrEqual) <= 0,
      { message: `${field.label} must be on or before ${formatDateForDisplay(beforeOrEqual)}` }
    );
  }

  // Handle required/optional
  if (!isRequired) {
    return z.union([schema, z.literal('')]);
  }

  return schema.min(1, `${field.label} is required`);
};

// ================================
// CHECKBOX VALIDATION
// ================================

const generateCheckboxSchema = (field: FormField): z.ZodType => {
  const isRequired = isFieldRequired(field.rules || []);

  console.debug('[validationEngine] Checkbox schema:', {
    fieldId: field.field_id,
    isRequired,
  });

  // If required, checkbox must be checked (true)
  if (isRequired) {
    return z.boolean().refine((value) => value === true, {
      message: `${field.label} must be checked`,
    });
  }

  return z.boolean();
};

// ================================
// TOGGLE SWITCH VALIDATION
// ================================

const generateToggleSwitchSchema = (field: FormField): z.ZodType => {
  const isRequired = isFieldRequired(field.rules || []);

  console.debug('[validationEngine] Toggle Switch schema:', {
    fieldId: field.field_id,
    isRequired,
  });

  let schema = z.boolean();

  // If required, toggle must be true (enabled)
  if (isRequired) {
    schema = schema.refine(
      (value) => value === true,
      { message: `${field.label} must be enabled` }
    );
  }

  return schema;
};

// ================================
// RADIO BUTTON VALIDATION
// ================================

const parseRadioOptions = (field: FormField): string[] => {
  try {
    if (!field.placeholder) return [];
    const parsed = JSON.parse(field.placeholder);
    return Array.isArray(parsed) ? parsed.filter((opt) => typeof opt === 'string') : [];
  } catch (error) {
    console.warn('[validationEngine] Failed to parse radio options:', error);
    return [];
  }
};

const generateRadioButtonSchema = (field: FormField): z.ZodType => {
  const isRequired = isFieldRequired(field.rules || []);
  const options = parseRadioOptions(field);

  console.debug('[validationEngine] Radio Button schema:', {
    fieldId: field.field_id,
    isRequired,
    optionsCount: options.length,
  });

  let schema: z.ZodTypeAny = z.string();

  // Validate that value is one of the available options
  if (options.length > 0) {
    schema = z.enum([options[0], ...options.slice(1)] as [string, ...string[]], {
      message: 'Please select a valid option',
    });
  }

  // Handle required/optional
  if (!isRequired) {
    return z.union([schema, z.literal('')]) as z.ZodType;
  }

  return schema.refine((val) => val !== '', {
    message: `${field.label} is required`,
  }) as z.ZodType;
};

// ================================
// DROPDOWN SELECT VALIDATION
// ================================

const parseDropdownOptions = (field: FormField): string[] => {
  try {
    if (!field.placeholder) return [];
    const parsed = JSON.parse(field.placeholder);
    return Array.isArray(parsed) ? parsed.filter((opt) => typeof opt === 'string') : [];
  } catch (error) {
    console.warn('[validationEngine] Failed to parse dropdown options:', error);
    return [];
  }
};

const generateDropdownSelectSchema = (field: FormField): z.ZodType => {
  const isRequired = isFieldRequired(field.rules || []);
  const options = parseDropdownOptions(field);

  console.debug('[validationEngine] Dropdown Select schema:', {
    fieldId: field.field_id,
    isRequired,
    optionsCount: options.length,
  });

  let schema: z.ZodTypeAny = z.string();

  // Validate that value is one of the available options
  if (options.length > 0) {
    schema = z.enum([options[0], ...options.slice(1)] as [string, ...string[]], {
      message: 'Please select a valid option',
    });
  }

  // Handle required/optional
  if (!isRequired) {
    return z.union([schema, z.literal('')]) as z.ZodType;
  }

  return schema.refine((val) => val !== '', {
    message: `${field.label} is required`,
  }) as z.ZodType;
};

// ================================
// MULTI-SELECT VALIDATION
// ================================

const parseMultiSelectOptions = (field: FormField): string[] => {
  try {
    if (!field.placeholder) return [];
    const parsed = JSON.parse(field.placeholder);
    return Array.isArray(parsed) ? parsed.filter((opt) => typeof opt === 'string') : [];
  } catch (error) {
    console.warn('[validationEngine] Failed to parse multi-select options:', error);
    return [];
  }
};

const generateMultiSelectSchema = (field: FormField): z.ZodType => {
  const isRequired = isFieldRequired(field.rules || []);
  const options = parseMultiSelectOptions(field);

  console.debug('[validationEngine] Multi-Select schema:', {
    fieldId: field.field_id,
    isRequired,
    optionsCount: options.length,
  });

  let schema = z.array(z.string());

  // Validate that all values are from available options
  if (options.length > 0) {
    schema = schema.refine(
      (values) => values.every((val) => options.includes(val)),
      { message: 'Selected values must be from available options' }
    );
  }

  // If required, ensure at least one item is selected
  if (isRequired) {
    schema = schema.min(1, `${field.label} requires at least one selection`);
  }

  return schema;
};

// ================================
// FILE UPLOAD VALIDATION
// ================================

const extractFileValidationRules = (
  rules: FieldRule[]
): {
  minSize: number | null;
  maxSize: number | null;
  mimeTypes: string[] | null;
} => {
  let minSize: number | null = null;
  let maxSize: number | null = null;
  let mimeTypes: string[] | null = null;

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
    }
  });

  return { minSize, maxSize, mimeTypes };
};

const generateFileUploadSchema = (field: FormField): z.ZodType => {
  const isRequired = isFieldRequired(field.rules || []);
  const { minSize, maxSize, mimeTypes } = extractFileValidationRules(field.rules || []);

  console.debug('[validationEngine] File Upload schema:', {
    fieldId: field.field_id,
    isRequired,
    minSize,
    maxSize,
    mimeTypes,
  });

  let schema = z.instanceof(File, { message: `${field.label} must be a valid file` });

  // Apply MIME type validation
  if (mimeTypes && mimeTypes.length > 0) {
    schema = schema.refine(
      (file) => mimeTypes.some((type) => matchesMimeType(file.type, type)),
      { message: `File type must be one of: ${mimeTypes.join(', ')}` }
    );
  }

  // Apply min file size validation
  if (minSize !== null) {
    schema = schema.refine(
      (file) => getFileSizeInKB(file) >= minSize,
      { message: `File size must be at least ${formatFileSize(minSize)}` }
    );
  }

  // Apply max file size validation
  if (maxSize !== null) {
    schema = schema.refine(
      (file) => getFileSizeInKB(file) <= maxSize,
      { message: `File size must be less than ${formatFileSize(maxSize)}` }
    );
  }

  // Handle required/optional
  if (!isRequired) {
    return z.union([schema, z.null()]);
  }

  return schema.refine((file) => file !== null, {
    message: `${field.label} is required`,
  });
};

// ================================
// IMAGE UPLOAD VALIDATION
// ================================

const generateImageUploadSchema = (field: FormField): z.ZodType => {
  // Image uploads use same logic as file uploads
  // Additional dimension validation would be added here if needed
  return generateFileUploadSchema(field);
};

// ================================
// VIDEO UPLOAD VALIDATION
// ================================

const generateVideoUploadSchema = (field: FormField): z.ZodType => {
  // Video uploads use same logic as file uploads
  return generateFileUploadSchema(field);
};

// ================================
// DOCUMENT UPLOAD VALIDATION
// ================================

const generateDocumentUploadSchema = (field: FormField): z.ZodType => {
  // Document uploads use same logic as file uploads
  return generateFileUploadSchema(field);
};

// ================================
// SIGNATURE PAD VALIDATION
// ================================

const generateSignaturePadSchema = (field: FormField): z.ZodType => {
  const isRequired = isFieldRequired(field.rules || []);

  console.debug('[validationEngine] Signature Pad schema:', {
    fieldId: field.field_id,
    isRequired,
  });

  let schema = z.string();

  // Validate that it's a valid data URL
  schema = schema.refine(
    (value) => {
      if (!value) return !isRequired;
      return value.startsWith('data:image/png;base64,');
    },
    { message: `${field.label} must be a valid signature` }
  );

  // Handle required/optional
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

  console.debug('[validationEngine] Color Picker schema:', {
    fieldId: field.field_id,
    isRequired,
  });

  let schema = z.string();

  // Validate hex color format
  schema = schema.regex(
    /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/,
    `${field.label} must be a valid color`
  );

  // Handle required/optional
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

  console.debug('[validationEngine] Location Picker schema:', {
    fieldId: field.field_id,
    isRequired,
  });

  // Location is typically an object with lat/lng
  let schema = z.object({
    lat: z.number(),
    lng: z.number(),
    address: z.string().optional(),
  });

  // Handle required/optional
  if (!isRequired) {
    return z.union([schema, z.null()]) as z.ZodType;
  }

  return schema;
};

// ================================
// ADDRESS VALIDATION
// ================================

const generateAddressSchema = (field: FormField): z.ZodType => {
  const isRequired = isFieldRequired(field.rules || []);

  console.debug('[validationEngine] Address schema:', {
    fieldId: field.field_id,
    isRequired,
  });

  // Address is typically an object with multiple fields
  let schema = z.object({
    street: z.string(),
    city: z.string(),
    state: z.string(),
    zip: z.string(),
    country: z.string(),
  });

  // Handle required/optional
  if (!isRequired) {
    return z.union([schema, z.null()]) as z.ZodType;
  }

  return schema;
};

// ================================
// DATE TIME INPUT VALIDATION
// ================================

const generateDateTimeInputSchema = (field: FormField): z.ZodType => {
  const isRequired = isFieldRequired(field.rules || []);

  console.debug('[validationEngine] DateTime Input schema:', {
    fieldId: field.field_id,
    isRequired,
  });

  let schema = z.string().regex(
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/,
    'DateTime must be in YYYY-MM-DDTHH:mm format'
  );

  // Handle required/optional
  if (!isRequired) {
    return z.union([schema, z.literal('')]);
  }

  return schema.min(1, `${field.label} is required`);
};

// ================================
// MAIN VALIDATION ENGINE
// ================================

/**
 * Generate Zod schema for any field type
 * Routes to appropriate field-specific schema generator
 */
export const generateFieldSchema = (field: FormField): z.ZodType => {
  console.debug('[validationEngine] Generating schema for field:', {
    fieldId: field.field_id,
    fieldType: field.field_type,
    label: field.label,
  });

  switch (field.field_type) {
    // Text-based fields
    case 'text_input':
      return generateTextInputSchema(field);
    case 'text_area':
      return generateTextAreaSchema(field);
    case 'email_input':
      return generateEmailInputSchema(field);
    case 'password_input':
      return generatePasswordInputSchema(field);
    case 'phone_input':
      return generatePhoneInputSchema(field);

    // Numeric fields
    case 'number_input':
      return generateNumberInputSchema(field);
    case 'currency_input':
      return generateCurrencyInputSchema(field);
    case 'percentage_input':
      return generatePercentageInputSchema(field);

    // Date/Time fields
    case 'date_input':
      return generateDateInputSchema(field);
    case 'date_time_input':
      return generateDateTimeInputSchema(field);

    // Boolean fields
    case 'checkbox':
      return generateCheckboxSchema(field);
    case 'toggle_switch':
      return generateToggleSwitchSchema(field);

    // Selection fields
    case 'radio_button':
      return generateRadioButtonSchema(field);
    case 'dropdown_select':
      return generateDropdownSelectSchema(field);
    case 'multi_select':
      return generateMultiSelectSchema(field);

    // File/Media fields
    case 'file_upload':
      return generateFileUploadSchema(field);
    case 'image_upload':
      return generateImageUploadSchema(field);
    case 'video_upload':
      return generateVideoUploadSchema(field);
    case 'document_upload':
      return generateDocumentUploadSchema(field);

    // Special fields
    case 'signature_pad':
      return generateSignaturePadSchema(field);
    case 'color_picker':
      return generateColorPickerSchema(field);
    case 'location_picker':
      return generateLocationPickerSchema(field);
    case 'address':
      return generateAddressSchema(field);

    // Default fallback
    default:
      console.warn(`[validationEngine] Unknown field type: ${field.field_type}`);
      return z.any();
  }
};

/**
 * Generate complete form schema with all fields
 * Includes cross-field validation (same/different rules)
 */
export const generateFormSchema = (fields: FormField[]): z.ZodObject<any> => {
  const schemaShape: Record<string, z.ZodType> = {};
  const crossFieldValidations: CrossFieldValidation[] = [];

  // Generate schema for each field
  fields.forEach((field) => {
    const fieldKey = `field_${field.field_id}`;
    schemaShape[fieldKey] = generateFieldSchema(field);

    // Collect cross-field validation rules
    const { sameAs, differentFrom } = extractCrossFieldRules(field.rules || []);
    
    if (sameAs !== null) {
      crossFieldValidations.push({
        fieldId: field.field_id,
        ruleName: 'same',
        compareFieldId: sameAs,
        message: `${field.label} must match the other field`,
      });
    }

    if (differentFrom !== null) {
      crossFieldValidations.push({
        fieldId: field.field_id,
        ruleName: 'different',
        compareFieldId: differentFrom,
        message: `${field.label} must be different from the other field`,
      });
    }
  });

  // Create base schema
  let formSchema = z.object(schemaShape);

  // Apply cross-field validations using superRefine
  if (crossFieldValidations.length > 0) {
    formSchema = formSchema.superRefine((data, ctx) => {
      crossFieldValidations.forEach((validation) => {
        const fieldKey = `field_${validation.fieldId}`;
        const compareFieldKey = `field_${validation.compareFieldId}`;
        
        const fieldValue = data[fieldKey];
        const compareValue = data[compareFieldKey];

        if (validation.ruleName === 'same') {
          if (fieldValue !== compareValue) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: validation.message,
              path: [fieldKey],
            });
          }
        }

        if (validation.ruleName === 'different') {
          if (fieldValue === compareValue && fieldValue !== '' && fieldValue !== null) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: validation.message,
              path: [fieldKey],
            });
          }
        }
      });
    });
  }

  return formSchema;
};

/**
 * Validate a single field value
 */
export const validateField = (
  field: FormField,
  value: any
): ValidationResult => {
  const schema = generateFieldSchema(field);
  
  try {
    schema.parse(value);
    return { valid: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstError = error.issues[0];
      return {
        valid: false,
        error: firstError?.message || 'Validation failed',
      };
    }
    return { valid: false, error: 'Validation failed' };
  }
};

/**
 * Validate entire form data
 */
export const validateForm = (
  fields: FormField[],
  formData: Record<string, any>
): { valid: boolean; errors: Record<string, string> } => {
  const schema = generateFormSchema(fields);
  
  try {
    schema.parse(formData);
    return { valid: true, errors: {} };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: Record<string, string> = {};
      error.issues.forEach((issue) => {
        const path = issue.path.join('.');
        errors[path] = issue.message;
      });
      return { valid: false, errors };
    }
    return { valid: false, errors: { _form: 'Validation failed' } };
  }
};

/**
 * Extract cross-field validation requirements for a field
 */
export const getFieldCrossValidations = (field: FormField): {
  sameAs: number | null;
  differentFrom: number | null;
} => {
  return extractCrossFieldRules(field.rules || []);
};
