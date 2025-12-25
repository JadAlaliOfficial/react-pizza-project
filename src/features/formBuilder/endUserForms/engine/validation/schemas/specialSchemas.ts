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

  const regexRule = (field.rules || []).find(
    (rule) => rule.rule_name === 'regex',
  );
  const startsWithRule = (field.rules || []).find(
    (rule) => rule.rule_name === 'starts_with',
  );

  const regexProps =
    (regexRule?.rule_props as { pattern?: string } | null) || {};
  const startsWithProps =
    (startsWithRule?.rule_props as { prefix?: string } | null) || {};

  const pattern =
    typeof regexProps.pattern === 'string' ? regexProps.pattern.trim() : '';
  const prefix =
    typeof startsWithProps.prefix === 'string' ? startsWithProps.prefix : '';

  const isEmpty = (v: string) => v.trim().length === 0;

  let schema = z.string();

  // ✅ required first (so empty => "is required")
  if (isRequired) {
    schema = schema.min(1, `${field.label} is required`);
  }

  // ✅ if regex exists, it OVERRIDES the default phone validation (matches your comment)
  if (pattern) {
    try {
      const regexPattern = new RegExp(pattern);
      schema = schema.refine(
        (value) => {
          if (isEmpty(value)) return true; // let "required" handle it
          const cleaned = cleanPhoneNumber(value);
          return regexPattern.test(cleaned);
        },
        { message: `${field.label} format is invalid` },
      );
    } catch {
      schema = schema.refine(() => false, {
        message: `${field.label} has invalid regex configuration`,
      });
    }
  } else {
    // ✅ default E.164 validation, but skip empty so required message wins
    schema = schema.refine(
      (value) => {
        if (isEmpty(value)) return true; // let "required" handle it
        return isValidPhoneFormat(cleanPhoneNumber(value));
      },
      { message: `${field.label} must be a valid phone number` },
    );
  }

  // ✅ starts_with should also skip empty so it doesn't steal the "required" error
  if (prefix) {
    schema = schema.refine(
      (value) => {
        if (isEmpty(value)) return true;
        const cleaned = cleanPhoneNumber(value);
        return cleaned.startsWith(prefix);
      },
      { message: `${field.label} must start with ${prefix}` },
    );
  }

  // Optional field: allow undefined (your validatePhoneInput already converts null to '')
  if (!isRequired) {
    return schema.optional() as z.ZodType;
  }

  return schema;
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
  const requiredString = z
    .string()
    .trim()
    .min(1, { message: 'All fields of the address input are Required' });

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
