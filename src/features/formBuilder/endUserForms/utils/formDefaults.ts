
import type { FormField } from '@/features/formBuilder/endUserForms/types/formStructure.types';
import type { JsonValue } from '@/features/formBuilder/endUserForms/types/submitInitialForm.types';

/**
 * Normalizes API values to runtime shapes based on field type
 */
export const normalizeByType = (field: FormField, raw: JsonValue): JsonValue => {
  const type = String(field.field_type || '').trim();

  switch (type) {
    case 'Checkbox':
    case 'Toggle Switch': {
      // API uses 0/1 sometimes; also tolerate true/false
      if (raw === 1 || raw === '1') return true;
      if (raw === 0 || raw === '0') return false;
      return Boolean(raw);
    }

    case 'Multi_Select': {
      // Ensure array
      return Array.isArray(raw) ? raw : [];
    }

    case 'Address Input': {
      // Ensure object with expected keys (best-effort)
      const obj =
        raw && typeof raw === 'object' && !Array.isArray(raw)
          ? (raw as any)
          : {};
      return {
        street: obj.street ?? '',
        city: obj.city ?? '',
        state: obj.state ?? '',
        postal_code: obj.postal_code ?? '',
        country: obj.country ?? '',
      };
    }

    case 'Location Picker': {
      const obj =
        raw && typeof raw === 'object' && !Array.isArray(raw)
          ? (raw as any)
          : {};
      return {
        lat: typeof obj.lat === 'number' ? obj.lat : null,
        lng: typeof obj.lng === 'number' ? obj.lng : null,
        address: typeof obj.address === 'string' ? obj.address : '',
      };
    }

    default:
      return raw;
  }
};

/**
 * Provides fallback default values based on field type
 */
export const fallbackByType = (field: FormField): JsonValue => {
  const type = String(field.field_type || '').trim();

  // Always no defaults (as you said)
  switch (type) {
    case 'Document Upload':
    case 'File Upload':
    case 'Image Upload':
    case 'Video Upload':
    case 'Password Input':
    case 'Signature Pad':
      return null;
  }

  // Special structured types
  switch (type) {
    case 'Multi_Select':
      return [];
    case 'Address Input':
      return { street: '', city: '', state: '', postal_code: '', country: '' };
    case 'Location Picker':
      return { lat: null, lng: null, address: '' };
  }

  // Boolean types (API is 0/1, runtime wants boolean)
  switch (type) {
    case 'Checkbox':
    case 'Toggle Switch':
      return false;
  }

  // Numeric types
  switch (type) {
    case 'Currency Input':
    case 'Number Input':
    case 'Percentage Input':
    case 'Slider':
    case 'Rating':
      return 0;
  }

  // Everything else is string-ish by default
  return '';
};

/**
 * Extract default value from field configuration
 * Priority: current_value > default_value > type-specific default
 */
export const getFieldDefaultValue = (field: FormField): JsonValue => {
  // 1) Priority: current_value first
  if (field.current_value !== null && field.current_value !== undefined) {
    return normalizeByType(field, field.current_value as JsonValue);
  }

  // 2) Then default_value (if present)
  if (field.default_value !== null && field.default_value !== undefined) {
    return normalizeByType(field, field.default_value as JsonValue);
  }

  // 3) Finally type-specific fallback
  return fallbackByType(field);
};
