/**
 * ================================
 * CURRENCY INPUT COMPONENT
 * ================================
 * Production-ready Currency Input field component with:
 * - Dynamic configuration from API field data
 * - Zod validation based on field rules (required, min, max, between)
 * - Automatic thousand separators
 * - Decimal place formatting
 * - Currency symbol display
 * - Conflict resolution for min/max/between rules
 * - ForwardRef support for parent scrolling
 */

import React, { useEffect, useState, forwardRef } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { DollarSign } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { CurrencyInputProps } from './types/currencyInputField.types';
import { DEFAULT_CURRENCY_FORMAT } from './types/currencyInputField.types';
import {
  getDefaultCurrencyInputValue,
  formatCurrency,
  parseCurrency,
  cleanCurrencyInput,
} from './validation/currencyInputValidation';

/**
 * CurrencyInput Component
 * 
 * Renders a currency input with symbol, thousand separators, and validation
 * Integrates with form systems via onChange callback
 * Supports forwardRef for scrolling to errors
 * 
 * @example
 * ```tsx
 * <CurrencyInput
 *   ref={currencyRef}
 *   field={fieldData}
 *   value={currencyValue}
 *   onChange={(newValue) => setValue(newValue)}
 *   error={errors.currency?.message}
 * />
 * ```
 */
export const CurrencyInput = forwardRef<HTMLDivElement, CurrencyInputProps>(
  (
    {
      field,
      value,
      onChange,
      error,
      disabled = false,
      className,
      currencySymbol = DEFAULT_CURRENCY_FORMAT.symbol,
    },
    ref
  ) => {
    console.debug('[CurrencyInput] Rendering for field:', field.field_id);

    // State for display value (raw input during editing, formatted when not focused)
    const [displayValue, setDisplayValue] = useState<string>('');
    const [isFocused, setIsFocused] = useState<boolean>(false);

    // Initialize with default value or current value
    useEffect(() => {
      if (isFocused) {
        // Don't update while user is typing
        return;
      }

      let initialValue: number;

      if (typeof value === 'number' && !isNaN(value)) {
        initialValue = value;
      } else if (field.current_value && typeof field.current_value === 'number') {
        initialValue = field.current_value;
      } else {
        initialValue = getDefaultCurrencyInputValue(field);
      }

      // Format and display
      if (initialValue !== 0 || field.default_value !== null) {
        setDisplayValue(formatCurrency(initialValue));
      } else {
        setDisplayValue('');
      }
    }, [field, value, isFocused]);

    // Check if field is required
    const isRequired = field.rules?.some((rule) => rule.rule_name === 'required') ?? false;

    /**
     * Handle input change - allow free typing
     */
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const input = e.target.value;

      // Clean input but keep it flexible
      const cleaned = cleanCurrencyInput(input, displayValue);

      // Update display value immediately (no formatting while typing)
      setDisplayValue(cleaned);

      // Parse and send numeric value to parent
      if (cleaned === '' || cleaned === '.') {
        onChange(0);
      } else {
        const numericValue = parseCurrency(cleaned);
        if (!isNaN(numericValue)) {
          onChange(numericValue);
        }
      }

      console.debug('[CurrencyInput] Value changed:', {
        fieldId: field.field_id,
        input,
        cleaned,
        numeric: cleaned ? parseCurrency(cleaned) : 0,
      });
    };

    /**
     * Format with thousand separators on blur
     */
    const handleBlur = () => {
      setIsFocused(false);

      if (displayValue && displayValue !== '.') {
        const numericValue = parseCurrency(displayValue);
        if (!isNaN(numericValue) && numericValue !== 0) {
          setDisplayValue(formatCurrency(numericValue));
        } else if (numericValue === 0 && displayValue !== '') {
          setDisplayValue('0.00');
        }
      } else {
        setDisplayValue('');
      }
    };

    /**
     * Remove formatting on focus for easier editing
     */
    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(true);

      if (displayValue) {
        const numericValue = parseCurrency(displayValue);
        if (!isNaN(numericValue)) {
          // Show raw number without commas for editing
          const rawValue = numericValue.toString();
          setDisplayValue(rawValue);
          
          // Select all after a tiny delay to ensure value is updated
          setTimeout(() => {
            e.target.select();
          }, 0);
        }
      }
    };

    /**
     * Handle key press - allow only valid characters
     */
    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
      const key = e.key;
      const currentValue = displayValue;

      // Allow: digits, dot (only one), backspace, delete, arrows, tab
      if (
        !/[0-9.]/.test(key) &&
        key !== 'Backspace' &&
        key !== 'Delete' &&
        key !== 'ArrowLeft' &&
        key !== 'ArrowRight' &&
        key !== 'Tab'
      ) {
        e.preventDefault();
        return;
      }

      // Prevent multiple dots
      if (key === '.' && currentValue.includes('.')) {
        e.preventDefault();
        return;
      }

      // Prevent more than 2 decimal places
      const dotIndex = currentValue.indexOf('.');
      if (dotIndex !== -1) {
        const cursorPosition = (e.target as HTMLInputElement).selectionStart || 0;
        const afterDot = currentValue.substring(dotIndex + 1);
        
        // If cursor is after dot and we already have 2 decimals, prevent typing
        if (cursorPosition > dotIndex && afterDot.length >= 2 && /[0-9]/.test(key)) {
          e.preventDefault();
        }
      }
    };

    // Generate unique ID for accessibility
    const currencyInputId = `currency-input-${field.field_id}`;

    // Get placeholder
    const placeholder = field.placeholder || '0.00';

    return (
      <div ref={ref} className={cn('space-y-3', className)}>
        {/* Field Label with Icon */}
        <div className="flex items-center gap-2">
          <DollarSign className="h-4 w-4 text-emerald-500" />
          <Label htmlFor={currencyInputId} className="text-sm font-medium">
            {field.label}
            {isRequired && <span className="text-destructive ml-1">*</span>}
          </Label>
        </div>

        {/* Currency Input */}
        <div className="relative">
          {/* Currency Symbol */}
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-600 font-bold text-lg pointer-events-none z-10">
            {currencySymbol}
          </span>

          {/* Input Field */}
          <Input
            id={currencyInputId}
            type="text"
            inputMode="decimal"
            value={displayValue}
            onChange={handleInputChange}
            onBlur={handleBlur}
            onFocus={handleFocus}
            onKeyDown={handleKeyPress}
            placeholder={placeholder}
            disabled={disabled}
            className={cn(
              'h-11 pl-10 pr-4 text-right text-lg font-semibold',
              'border-emerald-200 focus:border-emerald-500',
              error && 'border-destructive focus-visible:ring-destructive'
            )}
            aria-label={field.label}
            aria-required={isRequired}
            aria-invalid={!!error}
            aria-describedby={
              error
                ? `${currencyInputId}-error`
                : field.helper_text
                ? `${currencyInputId}-description`
                : undefined
            }
          />
        </div>

        {/* Helper Text */}
        {field.helper_text && !error && (
          <p
            id={`${currencyInputId}-description`}
            className="text-xs text-muted-foreground"
          >
            {field.helper_text}
          </p>
        )}

        {/* Error Message */}
        {error && (
          <p
            id={`${currencyInputId}-error`}
            className="text-xs text-destructive font-medium"
            role="alert"
          >
            {error}
          </p>
        )}
      </div>
    );
  }
);

CurrencyInput.displayName = 'CurrencyInput';

export default CurrencyInput;
