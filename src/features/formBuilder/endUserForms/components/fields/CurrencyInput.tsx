/**
 * ================================
 * CURRENCY INPUT COMPONENT
 * ================================
 *
 * Production-ready Currency Input field component.
 *
 * Responsibilities:
 * - Render currency input with symbol and formatting
 * - Apply thousand separators and decimal formatting
 * - Emit numeric value changes via onChange callback
 * - Display validation errors from parent
 * - Apply disabled state
 * - Support accessibility
 *
 * Architecture Decisions:
 * - Dumb component - no validation/visibility/business logic
 * - Props match RuntimeFieldProps contract
 * - No debug logs
 * - No RTL logic (handled by parent)
 * - ForwardRef for error scrolling
 * - Local state for display formatting (raw while editing, formatted on blur)
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

// ================================
// LOCALIZATION
// ================================

const getLocalizedCurrencyConfig = (languageId?: number) => {
  if (languageId === 2) {
    // Arabic
    return {
      placeholder: '0.00',
      ariaSuffix: ' - حقل مبلغ العملة',
    };
  }

  if (languageId === 3) {
    // Spanish
    return {
      placeholder: '0,00',
      ariaSuffix: ' - campo de importe de moneda',
    };
  }

  // English (default)
  return {
    placeholder: '0.00',
    ariaSuffix: ' - currency amount field',
  };
};

// ================================
// COMPONENT
// ================================

/**
 * CurrencyInput Component
 *
 * Renders a currency input with symbol, thousand separators, and validation.
 * Integrates with form systems via onChange callback.
 * Supports forwardRef for scrolling to errors.
 *
 * @example
 * ```
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
      languageId,
    },
    ref,
  ) => {
    const [displayValue, setDisplayValue] = useState<string>('');
    const [isFocused, setIsFocused] = useState<boolean>(false);

    const { placeholder: localizedPlaceholder, ariaSuffix } =
      getLocalizedCurrencyConfig(languageId);

    useEffect(() => {
      if (isFocused) {
        return;
      }

      let initialValue: number;

      if (typeof value === 'number' && !isNaN(value)) {
        initialValue = value;
      } else if (
        field.current_value &&
        typeof field.current_value === 'number'
      ) {
        initialValue = field.current_value;
      } else {
        initialValue = getDefaultCurrencyInputValue(field);
      }

      if (initialValue !== 0 || field.default_value !== null) {
        setDisplayValue(formatCurrency(initialValue));
      } else {
        setDisplayValue('');
      }
    }, [field, value, isFocused]);

    const isRequired =
      field.rules?.some((rule) => rule.rule_name === 'required') ?? false;

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const input = e.target.value;
      const cleaned = cleanCurrencyInput(input, displayValue);

      setDisplayValue(cleaned);

      if (cleaned === '' || cleaned === '.') {
        onChange(0);
      } else {
        const numericValue = parseCurrency(cleaned);
        if (!isNaN(numericValue)) {
          onChange(numericValue);
        }
      }
    };

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

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(true);

      if (displayValue) {
        const numericValue = parseCurrency(displayValue);
        if (!isNaN(numericValue)) {
          const rawValue = numericValue.toString();
          setDisplayValue(rawValue);

          setTimeout(() => {
            e.target.select();
          }, 0);
        }
      }
    };

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
      const key = e.key;
      const currentValue = displayValue;

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

      if (key === '.' && currentValue.includes('.')) {
        e.preventDefault();
        return;
      }

      const dotIndex = currentValue.indexOf('.');
      if (dotIndex !== -1) {
        const cursorPosition =
          (e.target as HTMLInputElement).selectionStart || 0;
        const afterDot = currentValue.substring(dotIndex + 1);

        if (
          cursorPosition > dotIndex &&
          afterDot.length >= 2 &&
          /[0-9]/.test(key)
        ) {
          e.preventDefault();
        }
      }
    };

    const currencyInputId = `currency-input-${field.field_id}`;
    const placeholder = field.placeholder || localizedPlaceholder;

    return (
      <div ref={ref} className={cn('space-y-3', className)}>
        <div className="flex items-center gap-2">
          <DollarSign className="h-4 w-4 text-emerald-500" />
          <Label htmlFor={currencyInputId} className="text-sm font-medium">
            {field.label}
            {isRequired && <span className="text-destructive ml-1">*</span>}
          </Label>
        </div>

        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-600 font-bold text-lg pointer-events-none z-10">
            {currencySymbol}
          </span>

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
              error && 'border-destructive focus-visible:ring-destructive',
            )}
            aria-label={`${field.label}${ariaSuffix}`}
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

        {field.helper_text && !error && (
          <p
            id={`${currencyInputId}-description`}
            className="text-xs text-muted-foreground"
          >
            {field.helper_text}
          </p>
        )}

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
  },
);

CurrencyInput.displayName = 'CurrencyInput';

export default CurrencyInput;
