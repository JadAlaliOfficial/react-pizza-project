/**
 * ================================
 * VALIDATION ENGINE HELPERS
 * ================================
 * Shared helper functions: bounds extraction, date helpers,
 * cross-field rule extraction, normalization, file helpers, etc.
 */

import { parseISO, format } from 'date-fns';
import { z } from 'zod';
import type {
  FieldRule,
  JsonValue,
  CrossFieldRules,
} from './validationEngine.types';

/**
 * Extract validation bounds with conflict resolution
 * Priority: individual min/max rules override between rule
 * Applies to: text (string length), number, currency, percentage, date, file size
 */
export const extractValidationBounds = (
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
export const extractDateValidationBounds = (
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
      default:
        break;
    }
  });

  return { before, after, beforeOrEqual, afterOrEqual };
};

/**
 * Check number type rules with conflict resolution
 * Priority: numeric takes priority over integer (allows decimals)
 */
export const getNumberTypeRules = (
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
export const extractCrossFieldRules = (rules: FieldRule[]): CrossFieldRules => {
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
export const isFieldRequired = (rules: FieldRule[]): boolean => {
  return rules.some((rule) => rule.rule_name === 'required');
};

/**
 * Compare two date strings
 */
export const compareDates = (date1: string, date2: string): number => {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  if (d1 < d2) return -1;
  if (d1 > d2) return 1;
  return 0;
};

/**
 * Format date for display
 */
export const formatDateForDisplay = (dateStr: string): string => {
  const date = parseISO(dateStr);
  return format(date, 'MMM dd, yyyy');
};

/**
 * Check if file matches MIME type pattern (supports wildcards)
 */
export const matchesMimeType = (fileMimeType: string, pattern: string): boolean => {
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
export const formatFileSize = (sizeInKB: number): string => {
  if (sizeInKB < 1024) {
    return `${sizeInKB} KB`;
  }
  const sizeInMB = sizeInKB / 1024;
  return `${sizeInMB.toFixed(1)} MB`;
};

/**
 * Get file size in KB from File object
 */
export const getFileSizeInKB = (file: File): number => {
  return file.size / 1024;
};

/**
 * Normalize values for cross-field comparison
 * Handles different types (string, number, boolean, objects, arrays)
 */
export const normalizeForComparison = (value: JsonValue): string => {
  if (value === null || value === undefined) {
    return '';
  }
  if (typeof value === 'object') {
    return JSON.stringify(value);
  }
  return String(value);
};

/**
 * Phone helpers
 */
export const E164_PATTERN = /^[1-9]\d{1,14}$/;

export const cleanPhoneNumber = (phone: string): string => {
  if (!phone) return '';
  const cleaned = phone.replace(/[^\d+]/g, '');
  if (cleaned.startsWith('+')) {
    return '+' + cleaned.substring(1).replace(/\+/g, '');
  }
  return cleaned;
};

export const isValidPhoneFormat = (phone: string): boolean => {
  if (!phone) return false;
  return E164_PATTERN.test(phone);
};

/**
 * Common Zod shorthand (used in schemas file)
 */
export const zod = z;
