/**
 * ================================
 * CURRENCY INPUT FIELD TYPES
 * ================================
 * TypeScript types for Currency Input field component
 */

import type { FormField } from '@/features/formBuilder/endUserForms/types/formStructure.types';

/**
 * Currency value type
 * Stored as number internally
 */
export type CurrencyValue = number;

/**
 * Props for CurrencyInput component
 */
export interface CurrencyInputProps {
  /**
   * Field configuration from API
   */
  field: FormField;
  
  /**
   * Current value of the currency field (number)
   */
  value?: number | null;
  
  /**
   * Callback when currency value changes
   */
  onChange: (value: number) => void;
  
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
   * Currency symbol to display
   * @default '$'
   */
  currencySymbol?: string;
}

/**
 * Currency formatting options
 */
export interface CurrencyFormatOptions {
  symbol: string;
  decimals: number;
  thousandsSeparator: string;
  decimalSeparator: string;
}

/**
 * Default currency format (USD)
 */
export const DEFAULT_CURRENCY_FORMAT: CurrencyFormatOptions = {
  symbol: '$',
  decimals: 2,
  thousandsSeparator: ',',
  decimalSeparator: '.',
};
