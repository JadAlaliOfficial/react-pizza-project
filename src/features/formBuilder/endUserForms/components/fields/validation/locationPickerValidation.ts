/**
 * ================================
 * LOCATION PICKER FIELD VALIDATION
 * ================================
 * Zod schema generation for Location Picker fields based on field rules
 * Handles: required
 */

import { z } from 'zod';
import type { FormField } from '@/features/formBuilder/endUserForms/types/formStructure.types';
import type { LocationValue } from '../types/locationPickerField.types';

/**
 * Validate location coordinates
 * 
 * @param lat - Latitude (-90 to 90)
 * @param lng - Longitude (-180 to 180)
 * @returns True if valid coordinates
 */
export const isValidCoordinates = (lat: number, lng: number): boolean => {
  return !isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
};

/**
 * Generate Zod schema for Location Picker field based on field rules
 * 
 * @param field - Field configuration from API
 * @returns Zod schema for location validation
 */
export const generateLocationPickerSchema = (
  field: FormField
): z.ZodType<LocationValue | null> => {
  // Check if field is required
  const isRequired = field.rules?.some(
    (rule) => rule.rule_name === 'required'
  ) ?? false;

  console.debug('[locationPickerValidation] Generating schema for field:', {
    fieldId: field.field_id,
    isRequired,
  });

  // Schema for location object
  const locationSchema = z.object({
    lat: z.number().min(-90).max(90),
    lng: z.number().min(-180).max(180),
    address: z.string().optional(),
  });

  // If required, location must be provided
  if (isRequired) {
    return locationSchema.nullable().refine(
      (value) => value !== null,
      {
        message: `${field.label} is required`,
      }
    );
  }

  // If not required, allow null
  return locationSchema.nullable();
};

/**
 * Validate location value against field rules
 * 
 * @param field - Field configuration
 * @param value - Location value to validate
 * @returns Validation result with error message if invalid
 */
export const validateLocationPicker = (
  field: FormField,
  value: LocationValue | null | undefined
): { valid: boolean; error?: string } => {
  const schema = generateLocationPickerSchema(field);

  try {
    schema.parse(value || null);
    return { valid: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstError = error.issues[0];
      return {
        valid: false,
        error: firstError?.message || 'Invalid location',
      };
    }
    return { valid: false, error: 'Invalid location' };
  }
};

/**
 * Get default location from field configuration
 * Defaults to New York City
 * 
 * @param field - Field configuration
 * @returns Default location value or null
 */
export const getDefaultLocationPickerValue = (
  _field: FormField
): LocationValue | null => {
  // Location pickers typically don't have defaults
  // User should select their own location
  return null;
};

/**
 * Get user's current location using Geolocation API
 * 
 * @returns Promise resolving to coordinates or null if denied
 */
export const getUserCurrentLocation = (): Promise<
  { lat: number; lng: number } | null
> => {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve(null);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      () => {
        // Permission denied or error
        resolve(null);
      }
    );
  });
};

/**
 * Format coordinates for display
 * 
 * @param lat - Latitude
 * @param lng - Longitude
 * @returns Formatted coordinates string
 */
export const formatCoordinates = (lat: number, lng: number): string => {
  return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
};

/**
 * Get Google Maps URL for location
 * 
 * @param lat - Latitude
 * @param lng - Longitude
 * @returns Google Maps URL
 */
export const getGoogleMapsUrl = (lat: number, lng: number): string => {
  return `https://www.google.com/maps/search/${lat},${lng}`;
};

/**
 * Get OpenStreetMap URL for location
 * 
 * @param lat - Latitude
 * @param lng - Longitude
 * @param zoom - Zoom level (default 15)
 * @returns OpenStreetMap URL
 */
export const getOpenStreetMapUrl = (
  lat: number,
  lng: number,
  zoom: number = 15
): string => {
  return `https://www.openstreetmap.org/?lat=${lat}&lon=${lng}&zoom=${zoom}`;
};
