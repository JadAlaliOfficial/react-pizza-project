/**
 * ================================
 * SPECIAL INPUT SCHEMAS
 * ================================
 * Phone, URL, Color, Location, Address schemas
 */

import { z } from 'zod';
import type { FormField } from '../validationEngine.types';
import {
  isFieldRequired,
  cleanPhoneNumber,
  isValidPhoneFormat,
} from '../validationEngine.helpers';

export const generatePhoneInputSchema = (field: FormField): z.ZodType => {
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

export const generateUrlInputSchema = (field: FormField): z.ZodType => {
  const isRequired = isFieldRequired(field.rules || []);
  let schema = z.string().url(`${field.label} must be a valid URL`);

  if (!isRequired) {
    return z.union([schema, z.literal('')]);
  }

  return schema.min(1, `${field.label} is required`);
};

export const generateColorPickerSchema = (field: FormField): z.ZodType => {
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

export const generateLocationPickerSchema = (field: FormField): z.ZodType => {
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

  return z
    .object({
      lat: z.number(),
      lng: z.number(),
      address: z.string().optional(),
    })
    .nullable()
    .refine((val) => val !== null, {
      message: `${field.label} is required`,
    });
};

export const generateAddressSchema = (field: FormField): z.ZodType => {
  const isRequired = isFieldRequired(field.rules || []);

  // Required subfield: trims spaces, then requires at least 1 char
  const requiredString = z.string().trim().min(1, { message: 'All fields of the address input are Required' });

  // Optional subfield: trims spaces, allows empty string
  const optionalString = z.string().trim().optional().default('');

  const addressObjectSchema = z.object({
    street: isRequired ? requiredString : optionalString,
    city: isRequired ? requiredString : optionalString,
    state: isRequired ? requiredString : optionalString,
    postal_code: isRequired ? requiredString : optionalString,
    country: isRequired ? requiredString : optionalString,
  });

  // If not required, accept the normal runtime shape (object with empty strings)
  // AND also accept null just in case the API ever sends null.
  if (!isRequired) {
    return z.union([addressObjectSchema, z.null()]);
  }

  // If required, enforce all subfields required (and trimmed).
  // (You can keep it just `return addressObjectSchema;` since runtime value is an object,
  // but this also gives a clean "Required" error if value is null.)
  return z
    .union([addressObjectSchema, z.null()])
    .refine((val) => val !== null, {
      message: 'All fields of the address input are Required',
    });
};
