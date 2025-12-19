/**
 * ================================
 * ADDRESS FIELD TYPES
 * ================================
 * TypeScript types for Address Input field component
 */

import type { FormField } from '@/features/formBuilder/endUserForms/types/formStructure.types';

/**
 * Address value structure matching API response
 */
export interface AddressValue {
  street: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
}

/**
 * Partial address value for form state (allows empty strings during input)
 */
export interface PartialAddressValue {
  street?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
}

/**
 * Props for AddressInput component
 */
export interface AddressInputProps {
  /**
   * Field configuration from API
   */
  field: FormField;
  
  /**
   * Current value of the address field
   */
  value?: AddressValue | null;
  
  /**
   * Callback when address value changes
   */
  onChange: (value: AddressValue) => void;
  
  /**
   * Error message to display (from form validation)
   */
  error?: string;
  
  /**
   * Whether the field is disabled
   */
  disabled?: boolean;
  
  /**
   * Current language ID
   */
  languageId?: number;
  /**
   * Additional CSS classes
   */
  className?: string;
}

/**
 * Address field subfield configuration
 */
export interface AddressSubField {
  key: keyof AddressValue;
  label: string;
  placeholder: string;
  gridColumn?: 'full' | 'half';
}
