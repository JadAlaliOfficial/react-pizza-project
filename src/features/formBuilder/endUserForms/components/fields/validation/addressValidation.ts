/**
 * ================================
 * ADDRESS FIELD VALIDATION
 * ================================
 * Zod schema generation for Address Input fields based on field rules
 */

import { z, ZodError } from 'zod';
import type { FormField } from '@/features/formBuilder/endUserForms/types/formStructure.types';
import type { AddressValue } from '../types/addressField.types';

/**
 * Generate Zod schema for Address Input field based on field rules
 * 
 * @param field - Field configuration from API
 * @returns Zod schema for address validation
 */
export const generateAddressSchema = (field: FormField): z.ZodType<AddressValue> => {
  // Check if field is required
  const isRequired = field.rules?.some(
    (rule) => rule.rule_name === 'required'
  ) ?? false;

  console.debug('[addressValidation] Generating schema for field:', {
    fieldId: field.field_id,
    isRequired,
  });

  // Base schema for each address subfield
  const streetSchema = isRequired
    ? z.string().min(1, 'Street address is required')
    : z.string().optional().default('');

  const citySchema = isRequired
    ? z.string().min(1, 'City is required')
    : z.string().optional().default('');

  const stateSchema = isRequired
    ? z.string().min(1, 'State/Province is required')
    : z.string().optional().default('');

  const postalCodeSchema = isRequired
    ? z.string().min(1, 'Postal/ZIP code is required')
    : z.string().optional().default('');

  const countrySchema = isRequired
    ? z.string().min(1, 'Country is required')
    : z.string().optional().default('');

  // Combine into address object schema
  const addressSchema = z.object({
    street: streetSchema,
    city: citySchema,
    state: stateSchema,
    postal_code: postalCodeSchema,
    country: countrySchema,
  });

  // If required, add refinement to ensure at least one field is filled
  if (isRequired) {
    return addressSchema.refine(
      (data) => {
        // At least one field must be filled
        return (
          data.street.length > 0 ||
          data.city.length > 0 ||
          data.state.length > 0 ||
          data.postal_code.length > 0 ||
          data.country.length > 0
        );
      },
      {
        message: 'Address is required',
        path: ['street'], // Show error on street field
      }
    );
  }

  return addressSchema;
};

/**
 * Validate address value against field rules
 * 
 * @param field - Field configuration
 * @param value - Address value to validate
 * @returns Validation result with error message if invalid
 */
export const validateAddress = (
  field: FormField,
  value: AddressValue | null | undefined
): { valid: boolean; error?: string } => {
  const schema = generateAddressSchema(field);

  try {
    schema.parse(value);
    return { valid: true };
  } catch (error) {
    if (error instanceof ZodError) {
      const firstError = error.issues[0]; // Changed from 'errors' to 'issues'
      return {
        valid: false,
        error: firstError?.message || 'Invalid address',
      };
    }
    return { valid: false, error: 'Invalid address' };
  }
};

/**
 * Get default address value from field configuration
 * 
 * @param field - Field configuration
 * @returns Default address value
 */
export const getDefaultAddressValue = (field: FormField): AddressValue => {
  const defaultValue = field.default_value;

  // If default_value is already an object with address structure
  if (
    defaultValue &&
    typeof defaultValue === 'object' &&
    'street' in defaultValue
  ) {
    return {
      street: (defaultValue as any).street || '',
      city: (defaultValue as any).city || '',
      state: (defaultValue as any).state || '',
      postal_code: (defaultValue as any).postal_code || '',
      country: (defaultValue as any).country || '',
    };
  }

  // Return empty address if no default value
  return {
    street: '',
    city: '',
    state: '',
    postal_code: '',
    country: '',
  };
};
