// src/features/formVersion/components/fields/fieldComponentRegistry.ts

/**
 * Field Component Registry
 * Maps field type IDs to their corresponding config and preview components
 * Provides type-safe dynamic component resolution
 * UPDATED: Registered EmailInputFieldConfig and EmailInputPreview
 */

import React from 'react';
import type { UiField } from '../../types/formVersion.ui-types';

// ============================================================================
// Component Prop Types
// ============================================================================

/**
 * Props for field configuration components
 * Used in the config drawer to edit field properties
 */
export interface FieldConfigComponentProps {
  field: UiField;
  fieldIndex: number;
  onFieldChange: (changes: Partial<UiField>) => void;
  onDelete: () => void;
}

/**
 * Props for field preview components
 * Used in the live preview to show how field will appear
 */
export interface FieldPreviewComponentProps {
  field: UiField;
}

// ============================================================================
// Component Types
// ============================================================================

export type FieldConfigComponent = React.ComponentType<FieldConfigComponentProps>;
export type FieldPreviewComponent = React.ComponentType<FieldPreviewComponentProps>;

// ============================================================================
// Registry Types
// ============================================================================

/**
 * Configuration registry mapping field_type_id to config component
 */
export type FieldConfigRegistry = Record<number, FieldConfigComponent>;

/**
 * Preview registry mapping field_type_id to preview component
 */
export type FieldPreviewRegistry = Record<number, FieldPreviewComponent>;

// ============================================================================
// Default/Fallback Components
// ============================================================================

/**
 * Default config component shown when field type is not registered
 */
const DefaultFieldConfig: FieldConfigComponent = ({ field, onFieldChange, onDelete }) => {
  return (
    <div className="p-4 border border-dashed border-gray-300 rounded-md bg-gray-50">
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-sm font-medium text-gray-900">
            Field Type ID: {field.field_type_id}
          </p>
          <p className="text-xs text-gray-500">No config component registered</p>
        </div>
        <button
          onClick={onDelete}
          className="text-xs text-red-600 hover:text-red-800"
        >
          Delete
        </button>
      </div>
      
      <div className="space-y-2">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Label
          </label>
          <input
            type="text"
            value={field.label}
            onChange={(e) => onFieldChange({ label: e.target.value })}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Placeholder
          </label>
          <input
            type="text"
            value={field.placeholder || ''}
            onChange={(e) => onFieldChange({ placeholder: e.target.value || null })}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Helper Text
          </label>
          <textarea
            value={field.helper_text || ''}
            onChange={(e) => onFieldChange({ helper_text: e.target.value || null })}
            rows={2}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <p className="mt-3 text-xs text-gray-500">
        💡 Register a custom config component for field type {field.field_type_id} in fieldComponentRegistry.ts
      </p>
    </div>
  );
};

/**
 * Default preview component shown when field type is not registered
 */
const DefaultFieldPreview: FieldPreviewComponent = ({ field }) => {
  return (
    <div className="space-y-2 p-3 border border-dashed border-gray-300 rounded-md bg-gray-50">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-gray-700">
          {field.label}
        </label>
        <span className="text-xs text-gray-500">
          Type: {field.field_type_id}
        </span>
      </div>
      
      <input
        type="text"
        placeholder={field.placeholder || 'No preview component registered'}
        disabled
        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md bg-white opacity-60"
      />
      
      {field.helper_text && (
        <p className="text-xs text-gray-500">{field.helper_text}</p>
      )}
    </div>
  );
};

// ============================================================================
// Import Field Components
// ============================================================================

// Email Input field components (REGISTERED)
import { EmailInputFieldConfig } from './config/EmailInputFieldConfig';
import { EmailInputPreview } from './preview/EmailInputPreview';

// Text Input field components (REGISTERED)
import { TextInputFieldConfig } from './config/TextInputFieldConfig';
import { TextInputPreview } from './preview/TextInputPreview';
// Number Input field components (REGISTERED)
import { NumberInputFieldConfig } from './config/NumberInputFieldConfig';
import { NumberInputPreview } from './preview/NumberInputPreview';
// Phone Input field components (REGISTERED)
import { PhoneInputFieldConfig } from './config/PhoneInputFieldConfig';
import { PhoneInputPreview } from './preview/PhoneInputPreview';
// TextArea Input field components (REGISTERED)
import { TextAreaFieldConfig } from './config/TextAreaFieldConfig';
import { TextAreaPreview } from './preview/TextAreaPreview';
// Date Input field components (REGISTERED)
import { DateInputFieldConfig } from './config/DateInputFieldConfig';
import { DateInputPreview } from './preview/DateInputPreview';
// Time Input field components (REGISTERED)
import { TimeInputFieldConfig } from './config/TimeInputFieldConfig';
import { TimeInputPreview } from './preview/TimeInputPreview';
// DateTime Input field components (REGISTERED)
import { DateTimeInputFieldConfig } from './config/DateTimeInputFieldConfig';
import { DateTimeInputPreview } from './preview/DateTimeInputPreview';
// Checkbox Input field components (REGISTERED)
import { CheckboxFieldConfig } from './config/CheckboxFieldConfig';
import { CheckboxPreview } from './preview/CheckboxPreview';
// Radio Input field components (REGISTERED)
import { RadioButtonFieldConfig } from './config/RadioButtonFieldConfig';
import { RadioButtonPreview } from './preview/RadioButtonPreview';
// Dropdown Select Input field components (REGISTERED)
import { DropdownSelectFieldConfig } from './config/DropdownSelectFieldConfig';
import { DropdownSelectPreview } from './preview/DropdownSelectPreview';
// MultiSelect Input field components (REGISTERED)
import { MultiSelectFieldConfig } from './config/MultiSelectFieldConfig';
import { MultiSelectPreview } from './preview/MultiSelectPreview';
// File Upload Input field components (REGISTERED)
import { FileUploadFieldConfig } from './config/FileUploadFieldConfig';
import { FileUploadPreview } from './preview/FileUploadPreview';
// Image Upload Input field components (REGISTERED)
import { ImageUploadFieldConfig } from './config/ImageUploadFieldConfig';
import { ImageUploadPreview } from './preview/ImageUploadPreview';
// Video Upload Input field components (REGISTERED)
import { VideoUploadFieldConfig } from './config/VideoUploadFieldConfig';
import { VideoUploadPreview } from './preview/VideoUploadPreview';
// Document Upload Input field components (REGISTERED)
import { DocumentUploadFieldConfig } from './config/DocumentUploadFieldConfig';
import { DocumentUploadPreview } from './preview/DocumentUploadPreview';
// Url Input field components (REGISTERED)
import { UrlInputFieldConfig } from './config/UrlInputFieldConfig';
import { UrlInputPreview } from './preview/UrlInputPreview';
// Password Input field components (REGISTERED)
import { PasswordInputFieldConfig } from './config/PasswordInputFieldConfig';
import { PasswordInputPreview } from './preview/PasswordInputPreview';
// Color Picker Input field components (REGISTERED)
import { ColorPickerFieldConfig } from './config/ColorPickerFieldConfig';
import { ColorPickerPreview } from './preview/ColorPickerPreview';
// Rating Input field components (REGISTERED)
import { RatingFieldConfig } from './config/RatingFieldConfig';
import { RatingPreview } from './preview/RatingPreview';
// Slider Input field components (REGISTERED)
import { SliderFieldConfig } from './config/SliderFieldConfig';
import { SliderPreview } from './preview/SliderPreview';
// Toggle Switch Input field components (REGISTERED)
import { ToggleSwitchFieldConfig } from './config/ToggleSwitchFieldConfig';
import { ToggleSwitchPreview } from './preview/ToggleSwitchPreview';
// Currency Input field components (REGISTERED)
import { CurrencyInputFieldConfig } from './config/CurrencyInputFieldConfig';
import { CurrencyInputPreview } from './preview/CurrencyInputPreview';
// Percentage Input field components (REGISTERED)
import { PercentageInputFieldConfig } from './config/PercentageInputFieldConfig';
import { PercentageInputPreview } from './preview/PercentageInputPreview';
// Signature Pad Input field components (REGISTERED)
import { SignaturePadFieldConfig } from './config/SignaturePadFieldConfig';
import { SignaturePadPreview } from './preview/SignaturePadPreview';
// Location Picker Input field components (REGISTERED)
import { LocationPickerFieldConfig } from './config/LocationPickerFieldConfig';
import { LocationPickerPreview } from './preview/LocationPickerPreview';
// Address Input field components (REGISTERED)
import { AddressInputFieldConfig } from './config/AddressInputFieldConfig';
import { AddressInputPreview } from './preview/AddressInputPreview';



// TODO: Import additional field components here as you create them
// import { NumberInputFieldConfig } from './config/NumberInputFieldConfig';
// import { NumberInputPreview } from './preview/NumberInputPreview';
// ... etc

// ============================================================================
// Config Registry
// ============================================================================

/**
 * Maps field_type_id to configuration component
 * 
 * IMPORTANT: Adjust field_type_id values based on your backend data.
 * Use the IDs returned by useFieldTypes() hook.
 * 
 * To find the correct ID for Email Input:
 * 1. Check browser console logs when useFieldTypes loads
 * 2. Or check your backend field_types table
 * 3. Update the key below to match the actual ID
 * 
 * Example field type IDs (adjust to your backend):
 * 1: Text Input
 * 2: Email Input
 * 3: Number Input
 * 4: TextArea
 * 5: Select
 * 6: Date Input
 * 7: Time Input
 * 8: DateTime Input
 * 9: Checkbox
 * 10: Radio
 * ... etc
 */
export const fieldConfigRegistry: FieldConfigRegistry = {
  // Email Input field type
  // NOTE: Change this ID to match your backend's field_type_id for "Email Input"
  1: TextInputFieldConfig,
  2: EmailInputFieldConfig,
  3: NumberInputFieldConfig,
  4: PhoneInputFieldConfig,
  5: TextAreaFieldConfig,
  6: DateInputFieldConfig,
  7: TimeInputFieldConfig,
  8: DateTimeInputFieldConfig,
  9: CheckboxFieldConfig,
  10: RadioButtonFieldConfig,
  11: DropdownSelectFieldConfig,
  12: MultiSelectFieldConfig,
  13: FileUploadFieldConfig,
  14: ImageUploadFieldConfig,
  15: VideoUploadFieldConfig,
  16: DocumentUploadFieldConfig,
  17: UrlInputFieldConfig,
  18: PasswordInputFieldConfig,
  19: ColorPickerFieldConfig,
  20: RatingFieldConfig,
  21: SliderFieldConfig,
  22: ToggleSwitchFieldConfig,
  23: CurrencyInputFieldConfig,
  24: PercentageInputFieldConfig,
  25: SignaturePadFieldConfig,
  26: LocationPickerFieldConfig,
  27: AddressInputFieldConfig,
  
  // Add more field types here as you create them:
  // 1: TextInputFieldConfig,
  // 3: NumberInputFieldConfig,
  // 4: TextAreaFieldConfig,
  // 5: SelectFieldConfig,
  // 6: DateInputFieldConfig,
  // 7: TimeInputFieldConfig,
  // 8: DateTimeInputFieldConfig,
  // 9: CheckboxFieldConfig,
  // 10: RadioFieldConfig,
  // 11: FileUploadFieldConfig,
  // 12: CheckboxGroupFieldConfig,
  // 13: RadioGroupFieldConfig,
  // ... etc for all 27 types
};

// ============================================================================
// Preview Registry
// ============================================================================

/**
 * Maps field_type_id to preview component
 * 
 * IMPORTANT: Use the same field_type_id values as in fieldConfigRegistry
 */
export const fieldPreviewRegistry: FieldPreviewRegistry = {
  // Email Input field type
  // NOTE: Change this ID to match your backend's field_type_id for "Email Input"
  1: TextInputPreview,
  2: EmailInputPreview,
  3: NumberInputPreview,
  4: PhoneInputPreview,
  5: TextAreaPreview,
  6: DateInputPreview,
  7: TimeInputPreview,
  8: DateTimeInputPreview,
  9: CheckboxPreview,
  10: RadioButtonPreview,
  11: DropdownSelectPreview,
  12: MultiSelectPreview,
  13: FileUploadPreview,
  14: ImageUploadPreview,
  15: VideoUploadPreview,
  16: DocumentUploadPreview,
  17: UrlInputPreview,
  18: PasswordInputPreview,
  19: ColorPickerPreview,
  20: RatingPreview,
  21: SliderPreview,
  22: ToggleSwitchPreview,
  23: CurrencyInputPreview,
  24: PercentageInputPreview,
  25: SignaturePadPreview,
  26: LocationPickerPreview,
  27: AddressInputPreview,
  
  // Add more field types here as you create them:
  // 1: TextInputPreview,
  // 3: NumberInputPreview,
  // 4: TextAreaPreview,
  // 5: SelectPreview,
  // 6: DateInputPreview,
  // 7: TimeInputPreview,
  // 8: DateTimeInputPreview,
  // 9: CheckboxPreview,
  // 10: RadioPreview,
  // 11: FileUploadPreview,
  // 12: CheckboxGroupPreview,
  // 13: RadioGroupPreview,
  // ... etc for all 27 types
};

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Gets the config component for a field type
 * Returns default component if field type not registered
 * 
 * @param fieldTypeId - Field type ID to look up
 * @returns Config component for the field type
 */
export const getFieldConfigComponent = (fieldTypeId: number): FieldConfigComponent => {
  const component = fieldConfigRegistry[fieldTypeId];
  
  if (!component) {
    console.warn(
      `[FieldComponentRegistry] No config component registered for field type ${fieldTypeId}, using default`
    );
    return DefaultFieldConfig;
  }
  
  return component;
};

/**
 * Gets the preview component for a field type
 * Returns default component if field type not registered
 * 
 * @param fieldTypeId - Field type ID to look up
 * @returns Preview component for the field type
 */
export const getFieldPreviewComponent = (fieldTypeId: number): FieldPreviewComponent => {
  const component = fieldPreviewRegistry[fieldTypeId];
  
  if (!component) {
    console.warn(
      `[FieldComponentRegistry] No preview component registered for field type ${fieldTypeId}, using default`
    );
    return DefaultFieldPreview;
  }
  
  return component;
};

/**
 * Checks if a field type has a registered config component
 * 
 * @param fieldTypeId - Field type ID to check
 * @returns True if component is registered
 */
export const hasFieldConfigComponent = (fieldTypeId: number): boolean => {
  return fieldTypeId in fieldConfigRegistry;
};

/**
 * Checks if a field type has a registered preview component
 * 
 * @param fieldTypeId - Field type ID to check
 * @returns True if component is registered
 */
export const hasFieldPreviewComponent = (fieldTypeId: number): boolean => {
  return fieldTypeId in fieldPreviewRegistry;
};

/**
 * Gets list of all registered field type IDs
 * 
 * @returns Array of field type IDs that have registered components
 */
export const getRegisteredFieldTypeIds = (): number[] => {
  const configIds = Object.keys(fieldConfigRegistry).map(Number);
  const previewIds = Object.keys(fieldPreviewRegistry).map(Number);
  
  // Return unique IDs that have both config and preview
  return Array.from(new Set([...configIds, ...previewIds])).sort((a, b) => a - b);
};
