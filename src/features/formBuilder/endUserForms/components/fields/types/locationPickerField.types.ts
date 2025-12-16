/**
 * ================================
 * LOCATION PICKER FIELD TYPES
 * ================================
 * TypeScript types for Location Picker field component
 */

import type { FormField } from '@/features/formBuilder/endUserForms/types/formStructure.types';

/**
 * Location coordinates
 */
export interface LocationCoords {
  lat: number;
  lng: number;
}

/**
 * Location picker value
 * Contains coordinates and optional address
 */
export interface LocationValue extends LocationCoords {
  address?: string;
}

/**
 * Props for LocationPicker component
 */
export interface LocationPickerProps {
  /**
   * Field configuration from API
   */
  field: FormField;
  
  /**
   * Current value of the location field
   */
  value?: LocationValue | null;
  
  /**
   * Callback when location value changes
   */
  onChange: (value: LocationValue) => void;
  
  /**
   * Error message to display (from form validation)
   */
  error?: string;
  
  /**
   * Whether the field is disabled
   */
  disabled?: boolean;
  
  /**
   * Additional CSS classes
   */
  className?: string;
  
  /**
   * Default location (center of map)
   * Defaults to New York City
   */
  defaultLocation?: LocationCoords;
}
