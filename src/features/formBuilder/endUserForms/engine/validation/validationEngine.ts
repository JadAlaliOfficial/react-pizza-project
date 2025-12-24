/**
 * ================================
 * VALIDATION ENGINE
 * ================================
 * Public API + schema factory + cross-field validation glue.
 */

import { normalizeForComparison } from './validationEngine.helpers';
import { z } from 'zod';
import type {
  ValidationResult,
  FormField,
  JsonValue,
  RuntimeFieldValues,
} from './validationEngine.types';
import {
  generateTextInputSchema,
  generateTextAreaSchema,
  generateEmailInputSchema,
  generateNumberInputSchema,
  generateCurrencyInputSchema,
  generatePercentageInputSchema,
  generatePhoneInputSchema,
  generateUrlInputSchema,
  generateDateInputSchema,
  generateTimeInputSchema,
  generateDateTimeInputSchema,
  generateDropdownSchema,
  generateMultiSelectSchema,
  generateCheckboxSchema,
  generateToggleSwitchSchema,
  generateRadioGroupSchema,
  generateSliderSchema,
  generateRatingSchema,
  generateFileUploadSchema,
  generateImageUploadSchema,
  generateVideoUploadSchema,
  generateDocumentUploadSchema,
  generateSignaturePadSchema,
  generateColorPickerSchema,
  generateLocationPickerSchema,
  generateAddressSchema,
  generatePasswordSchema,
} from './validationEngine.schemas';
import { extractCrossFieldRules } from './validationEngine.helpers';

/* ---------- Cross-field validation ---------- */

const validateCrossFieldRules = (
  field: FormField,
  value: JsonValue,
  allFieldValues: RuntimeFieldValues,
): ValidationResult => {
  const crossFieldRules = extractCrossFieldRules(field.rules || []);

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

/* ---------- Schema factory ---------- */

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

/* ---------- Public API ---------- */

export const validateField = (
  field: FormField,
  value: JsonValue,
  allFieldValues: RuntimeFieldValues,
): ValidationResult => {
  const schema = generateFieldSchema(field);
  const result = schema.safeParse(value);

  if (!result.success) {
    const errorMessage =
      result.error.issues[0]?.message || 'Validation failed';
    return {
      valid: false,
      error: errorMessage,
    };
  }

  const crossFieldResult = validateCrossFieldRules(field, value, allFieldValues);
  if (!crossFieldResult.valid) {
    return crossFieldResult;
  }

  return { valid: true };
};

export const hasCrossFieldRules = (field: FormField): boolean => {
  const rules = extractCrossFieldRules(field.rules || []);
  return rules.sameAs !== null || rules.differentFrom !== null;
};

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
