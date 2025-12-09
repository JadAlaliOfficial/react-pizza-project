// src/features/formVersion/utils/fieldDefaults.ts

/**
 * Field Defaults Utility
 * Provides sensible default values for each field type
 * Used when creating new fields to improve UX
 */

import type { UiField } from '../types/formVersion.ui-types';
import { generateFakeId } from './fakeId';

// ============================================================================
// Field Type Defaults Map
// ============================================================================

/**
 * Default values for common field types
 * Keys should match field_type_id from backend
 * 
 * IMPORTANT: Adjust IDs and defaults based on your backend field types
 */
const FIELD_TYPE_DEFAULTS: Record<number, Partial<UiField>> = {
  // Text Input (ID: 1)
  1: {
    label: 'Text Input',
    placeholder: 'Enter text...',
    helper_text: null,
    default_value: null,
  },

  // Email Input (ID: 2)
  2: {
    label: 'Email Address',
    placeholder: 'user@example.com',
    helper_text: "We'll never share your email with anyone else.",
    default_value: null,
  },

  // Number Input (ID: 3)
  3: {
    label: 'Number',
    placeholder: 'Enter number...',
    helper_text: null,
    default_value: null,
  },

  // TextArea (ID: 4)
  4: {
    label: 'Description',
    placeholder: 'Enter detailed description...',
    helper_text: null,
    default_value: null,
  },

  // Select Dropdown (ID: 5)
  5: {
    label: 'Select Option',
    placeholder: 'Choose an option...',
    helper_text: null,
    default_value: null,
  },

  // Date Input (ID: 6)
  6: {
    label: 'Date',
    placeholder: null,
    helper_text: 'Select a date',
    default_value: null,
  },

  // Time Input (ID: 7)
  7: {
    label: 'Time',
    placeholder: null,
    helper_text: 'Select a time',
    default_value: null,
  },

  // DateTime Input (ID: 8)
  8: {
    label: 'Date & Time',
    placeholder: null,
    helper_text: 'Select date and time',
    default_value: null,
  },

  // Checkbox (ID: 9)
  9: {
    label: 'I agree to the terms',
    placeholder: null,
    helper_text: null,
    default_value: null,
  },

  // Radio Group (ID: 10)
  10: {
    label: 'Radio Options',
    placeholder: null,
    helper_text: 'Select one option',
    default_value: null,
  },

  // File Upload (ID: 11)
  11: {
    label: 'Upload File',
    placeholder: null,
    helper_text: 'Maximum file size: 10MB',
    default_value: null,
  },

  // Add more field types here as needed...
  // 12-27: Define defaults for remaining field types
};

// ============================================================================
// Create Default Field Function
// ============================================================================

/**
 * Creates a new field with sensible defaults based on field type
 * 
 * @param sectionId - Parent section ID
 * @param fieldTypeId - Field type ID from backend
 * @param customDefaults - Optional custom default values to override
 * @returns New UiField with fake ID and defaults
 * 
 * @example
 * const emailField = createDefaultField(sectionId, 2);
 * // Returns email field with label "Email Address", placeholder "user@example.com", etc.
 */
export const createDefaultField = (
  sectionId: string | number,
  fieldTypeId: number,
  customDefaults?: Partial<UiField>
): UiField => {
  // Get defaults for this field type, or use generic defaults
  const typeDefaults = FIELD_TYPE_DEFAULTS[fieldTypeId] || {
    label: `Field Type ${fieldTypeId}`,
    placeholder: 'Enter value...',
    helper_text: null,
    default_value: null,
  };

  // Create base field
  const baseField: UiField = {
    id: generateFakeId(),
    section_id: sectionId,
    field_type_id: fieldTypeId,
    label: '',
    placeholder: null,
    helper_text: null,
    default_value: null,
    visibility_condition: null,
    visibility_conditions: null,
    rules: [],
  };

  // Merge: base → type defaults → custom defaults
  return {
    ...baseField,
    ...typeDefaults,
    ...customDefaults,
  };
};

// ============================================================================
// Get Field Type Default Label
// ============================================================================

/**
 * Gets the default label for a field type
 * Useful for displaying field type names in UI
 * 
 * @param fieldTypeId - Field type ID
 * @returns Default label for that field type
 * 
 * @example
 * getFieldTypeDefaultLabel(2) // "Email Address"
 * getFieldTypeDefaultLabel(999) // "New Field"
 */
export const getFieldTypeDefaultLabel = (fieldTypeId: number): string => {
  const defaults = FIELD_TYPE_DEFAULTS[fieldTypeId];
  return defaults?.label || 'New Field';
};

// ============================================================================
// Check if Field Type Has Defaults
// ============================================================================

/**
 * Checks if a field type has registered defaults
 * 
 * @param fieldTypeId - Field type ID to check
 * @returns True if defaults exist
 */
export const hasFieldTypeDefaults = (fieldTypeId: number): boolean => {
  return fieldTypeId in FIELD_TYPE_DEFAULTS;
};

// ============================================================================
// Register Custom Defaults
// ============================================================================

/**
 * Registers or updates defaults for a field type
 * Useful for dynamically adding field type support
 * 
 * @param fieldTypeId - Field type ID
 * @param defaults - Default values for this field type
 * 
 * @example
 * registerFieldTypeDefaults(15, {
 *   label: 'Phone Number',
 *   placeholder: '+1 (555) 123-4567',
 *   helper_text: 'Include country code'
 * });
 */
export const registerFieldTypeDefaults = (
  fieldTypeId: number,
  defaults: Partial<UiField>
): void => {
  console.debug('[FieldDefaults] Registering defaults for field type', fieldTypeId);
  FIELD_TYPE_DEFAULTS[fieldTypeId] = defaults;
};
