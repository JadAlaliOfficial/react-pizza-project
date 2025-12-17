/**
 * ================================
 * FIELD REGISTRY
 * ================================
 * 
 * Central registry mapping field types to React components.
 * This enables dynamic field rendering based on form structure from API.
 */

import React from 'react';
import type { RuntimeFieldProps, RuntimeFieldComponent } from '../types/runtime.types';

// ================================
// FIELD COMPONENT IMPORTS
// ================================

// Text-based fields
import TextInputComponent from '@/features/formBuilder/endUserForms/components/fields/TextInput';
import TextAreaComponent from '@/features/formBuilder/endUserForms/components/fields/TextArea';
import EmailInputComponent from '@/features/formBuilder/endUserForms/components/fields/EmailInput';
import PhoneInputComponent from '@/features/formBuilder/endUserForms/components/fields/PhoneInput';
import PasswordInputComponent from '@/features/formBuilder/endUserForms/components/fields/PasswordInput';
import UrlInputComponent from '@/features/formBuilder/endUserForms/components/fields/UrlInput';

// Numeric fields
import NumberInputComponent from '@/features/formBuilder/endUserForms/components/fields/NumberInput';
import CurrencyInputComponent from '@/features/formBuilder/endUserForms/components/fields/CurrencyInput';
import PercentageInputComponent from '@/features/formBuilder/endUserForms/components/fields/PercentageInput';

// Date/Time fields
import DateInputComponent from '@/features/formBuilder/endUserForms/components/fields/DateInput';
import DateTimeInputComponent from '@/features/formBuilder/endUserForms/components/fields/DateTimeInput';
import TimeInputComponent from '@/features/formBuilder/endUserForms/components/fields/TimeInput';

// Boolean fields
import CheckboxInputComponent from '@/features/formBuilder/endUserForms/components/fields/CheckboxInput';
import ToggleSwitchComponent from '@/features/formBuilder/endUserForms/components/fields/ToggleSwitch';

// Selection fields
import RadioButtonComponent from '@/features/formBuilder/endUserForms/components/fields/RadioButton';
import DropdownSelectComponent from '@/features/formBuilder/endUserForms/components/fields/DropdownSelect';
import MultiSelectComponent from '@/features/formBuilder/endUserForms/components/fields/MultiSelect';

// File/Media fields
import FileUploadComponent from '@/features/formBuilder/endUserForms/components/fields/FileUpload';
import ImageUploadComponent from '@/features/formBuilder/endUserForms/components/fields/ImageUpload';
import DocumentUploadComponent from '@/features/formBuilder/endUserForms/components/fields/DocumentUpload';

// Special fields
import SignaturePadComponent from '@/features/formBuilder/endUserForms/components/fields/SignaturePad';
import ColorPickerInputComponent from '@/features/formBuilder/endUserForms/components/fields/ColorPickerInput';
import PopupLocationPickerComponent from '@/features/formBuilder/endUserForms/components/fields/PopupLocationPicker';
import AddressInputComponent from '@/features/formBuilder/endUserForms/components/fields/AddressInput';
import RatingComponent from '@/features/formBuilder/endUserForms/components/fields/Rating';
import SliderComponent from '@/features/formBuilder/endUserForms/components/fields/Slider';

// ================================
// FALLBACK COMPONENT
// ================================

const UnknownFieldComponent: React.FC<RuntimeFieldProps> = ({ field }) => {
  return (
    <div className="rounded-md border border-amber-500 bg-amber-50 p-4">
      <p className="text-sm font-medium text-amber-800">
        Unknown field type: {field.field_type}
      </p>
      <p className="mt-1 text-xs text-amber-600">
        Field ID: {field.field_id} - {field.label}
      </p>
    </div>
  );
};

// ================================
// ADAPTER WRAPPERS
// ================================

/**
 * These wrappers adapt RuntimeFieldProps to each component's specific props
 * This allows the registry to work with your existing components
 */

const TextInput: RuntimeFieldComponent = (props) => (
  <TextInputComponent {...props as any} />
);

const TextArea: RuntimeFieldComponent = (props) => (
  <TextAreaComponent {...props as any} />
);

const EmailInput: RuntimeFieldComponent = (props) => (
  <EmailInputComponent {...props as any} />
);

const PhoneInput: RuntimeFieldComponent = (props) => (
  <PhoneInputComponent {...props as any} />
);

const PasswordInput: RuntimeFieldComponent = (props) => (
  <PasswordInputComponent {...props as any} />
);

const UrlInput: RuntimeFieldComponent = (props) => (
  <UrlInputComponent {...props as any} />
);

const NumberInput: RuntimeFieldComponent = (props) => (
  <NumberInputComponent {...props as any} />
);

const CurrencyInput: RuntimeFieldComponent = (props) => (
  <CurrencyInputComponent {...props as any} />
);

const PercentageInput: RuntimeFieldComponent = (props) => (
  <PercentageInputComponent {...props as any} />
);

const DateInput: RuntimeFieldComponent = (props) => (
  <DateInputComponent {...props as any} />
);

const DateTimeInput: RuntimeFieldComponent = (props) => (
  <DateTimeInputComponent {...props as any} />
);

const TimeInput: RuntimeFieldComponent = (props) => (
  <TimeInputComponent {...props as any} />
);

const CheckboxInput: RuntimeFieldComponent = (props) => (
  <CheckboxInputComponent {...props as any} />
);

const ToggleSwitch: RuntimeFieldComponent = (props) => (
  <ToggleSwitchComponent {...props as any} />
);

const RadioButton: RuntimeFieldComponent = (props) => (
  <RadioButtonComponent {...props as any} />
);

const DropdownSelect: RuntimeFieldComponent = (props) => (
  <DropdownSelectComponent {...props as any} />
);

const MultiSelect: RuntimeFieldComponent = (props) => (
  <MultiSelectComponent {...props as any} />
);

const FileUpload: RuntimeFieldComponent = (props) => (
  <FileUploadComponent {...props as any} />
);

const ImageUpload: RuntimeFieldComponent = (props) => (
  <ImageUploadComponent {...props as any} />
);

const DocumentUpload: RuntimeFieldComponent = (props) => (
  <DocumentUploadComponent {...props as any} />
);

const SignaturePad: RuntimeFieldComponent = (props) => (
  <SignaturePadComponent {...props as any} />
);

const ColorPickerInput: RuntimeFieldComponent = (props) => (
  <ColorPickerInputComponent {...props as any} />
);

const PopupLocationPicker: RuntimeFieldComponent = (props) => (
  <PopupLocationPickerComponent {...props as any} />
);

const AddressInput: RuntimeFieldComponent = (props) => (
  <AddressInputComponent {...props as any} />
);

const Rating: RuntimeFieldComponent = (props) => (
  <RatingComponent {...props as any} />
);

const Slider: RuntimeFieldComponent = (props) => (
  <SliderComponent {...props as any} />
);

const VideoUpload: RuntimeFieldComponent = (props) => (
  <FileUploadComponent {...props as any} />
);

// ================================
// FIELD REGISTRY MAP
// ================================

/**
 * Central registry mapping field_type to React component
 * 
 * Field type names match EXACTLY what comes from backend API
 */
const FIELD_REGISTRY: Record<string, RuntimeFieldComponent> = {
  // Text-based fields (6 types)
  'Text Input': TextInput,
  'Text Area': TextArea,
  'Email Input': EmailInput,
  'Phone Input': PhoneInput,
  'Password Input': PasswordInput,
  'URL Input': UrlInput,
  
  // Numeric fields (3 types)
  'Number Input': NumberInput,
  'Currency Input': CurrencyInput,
  'Percentage Input': PercentageInput,
  
  // Date/Time fields (3 types)
  'Date Input': DateInput,
  'DateTime Input': DateTimeInput,
  'Time Input': TimeInput,
  
  // Boolean fields (2 types)
  'Checkbox': CheckboxInput,
  'Toggle Switch': ToggleSwitch,
  
  // Selection fields (3 types)
  'Radio Button': RadioButton,
  'Dropdown Select': DropdownSelect,
  'Multi_Select': MultiSelect,
  
  // File/Media fields (4 types)
  'File Upload': FileUpload,
  'Image Upload': ImageUpload,
  'Video Upload': VideoUpload,
  'Document Upload': DocumentUpload,
  
  // Special fields (6 types)
  'Signature Pad': SignaturePad,
  'Color Picker': ColorPickerInput,
  'Location Picker': PopupLocationPicker,
  'Address Input': AddressInput,
  'Rating': Rating,
  'Slider': Slider,
};

// ================================
// PUBLIC API
// ================================

export function getFieldComponent(fieldType: string): RuntimeFieldComponent {
  const component = FIELD_REGISTRY[fieldType];
  
  if (!component) {
    console.warn(`[fieldRegistry] Unknown field type: "${fieldType}"`);
    console.warn('[fieldRegistry] Available types:', Object.keys(FIELD_REGISTRY));
    return UnknownFieldComponent;
  }
  
  return component;
}

export function isFieldTypeRegistered(fieldType: string): boolean {
  return fieldType in FIELD_REGISTRY;
}

export function getRegisteredFieldTypes(): string[] {
  return Object.keys(FIELD_REGISTRY);
}

export function registerFieldComponent(
  fieldType: string,
  component: RuntimeFieldComponent
): void {
  if (FIELD_REGISTRY[fieldType]) {
    console.warn(`[fieldRegistry] Overwriting existing field type: ${fieldType}`);
  }
  
  FIELD_REGISTRY[fieldType] = component;
  
  if (process.env.NODE_ENV === 'development') {
    console.log(`[fieldRegistry] Registered field type: ${fieldType}`);
  }
}

export function unregisterFieldComponent(fieldType: string): void {
  delete FIELD_REGISTRY[fieldType];
  
  if (process.env.NODE_ENV === 'development') {
    console.log(`[fieldRegistry] Unregistered field type: ${fieldType}`);
  }
}

export function debugFieldRegistry(): void {
  if (process.env.NODE_ENV !== 'development') {
    return;
  }
  
  console.group('[fieldRegistry] Registered Field Types');
  
  const types = getRegisteredFieldTypes().sort();
  const categories = {
    'Text-based': ['Text Input', 'Text Area', 'Email Input', 'Phone Input', 'Password Input', 'URL Input'],
    'Numeric': ['Number Input', 'Currency Input', 'Percentage Input'],
    'Date/Time': ['Date Input', 'DateTime Input', 'Time Input'],
    'Boolean': ['Checkbox', 'Toggle Switch'],
    'Selection': ['Radio Button', 'Dropdown Select', 'Multi_Select'],
    'File/Media': ['File Upload', 'Image Upload', 'Video Upload', 'Document Upload'],
    'Special': ['Signature Pad', 'Color Picker', 'Location Picker', 'Address Input', 'Rating', 'Slider'],
  };
  
  Object.entries(categories).forEach(([category, fieldTypes]) => {
    console.group(category);
    fieldTypes.forEach((type) => {
      if (types.includes(type)) {
        console.log(`✅ ${type}`);
      } else {
        console.log(`❌ ${type} (not registered)`);
      }
    });
    console.groupEnd();
  });
  
  console.log(`\nTotal: ${types.length} field types registered`);
  console.groupEnd();
}

export const fieldRegistry = {
  getComponent: getFieldComponent,
  isRegistered: isFieldTypeRegistered,
  getRegisteredTypes: getRegisteredFieldTypes,
  register: registerFieldComponent,
  unregister: unregisterFieldComponent,
  debug: debugFieldRegistry,
};

export default fieldRegistry;
