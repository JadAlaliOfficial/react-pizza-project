/**
 * ================================
 * SELECT INPUT SCHEMAS
 * ================================
 * Dropdown, MultiSelect, Radio, Checkbox, Toggle schemas
 */

import { z } from 'zod';
import type { FormField } from '../validationEngine.types';
import {
  isFieldRequired,
  extractValidationBounds,
} from '../validationEngine.helpers';

export const generateDropdownSchema = (field: FormField): z.ZodType => {
  const isRequired = isFieldRequired(field.rules || []);
  let schema = z.string();

  if (!isRequired) {
    return z.union([schema, z.literal('')]);
  }

  return schema.min(1, `${field.label} is required`);
};

export const generateMultiSelectSchema = (field: FormField): z.ZodType => {
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

export const generateRadioGroupSchema = (field: FormField): z.ZodType => {
  const isRequired = isFieldRequired(field.rules || []);
  let schema = z.string();

  if (!isRequired) {
    return z.union([schema, z.literal('')]);
  }

  return schema.min(1, `${field.label} is required`);
};

export const generateCheckboxSchema = (field: FormField): z.ZodType => {
  const isRequired = isFieldRequired(field.rules || []);
  let schema = z.boolean();

  if (isRequired) {
    schema = schema.refine((val) => val === true, {
      message: `${field.label} must be checked`,
    });
  }

  return schema;
};

export const generateToggleSwitchSchema = (_field: FormField): z.ZodType => {
  return z.boolean();
};
