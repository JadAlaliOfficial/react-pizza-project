/**
 * ================================
 * SIGNATURE PAD FIELD TYPES
 * ================================
 * TypeScript types for Signature Pad field component
 */

import type { FormField } from '@/features/formBuilder/endUserForms/types/formStructure.types';

/**
 * Signature value type
 * Base64 encoded PNG image data URL
 */
export type SignatureValue = string;

/**
 * Props for SignaturePad component
 */
export interface SignaturePadProps {
  /**
   * Field configuration from API
   */
  field: FormField;
  
  /**
   * Current value of the signature field (base64 data URL)
   */
  value?: string | null;
  
  /**
   * Callback when signature value changes
   */
  onChange: (value: string) => void;
  
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
}

/**
 * Point coordinates for drawing
 */
export interface Point {
  x: number;
  y: number;
}
