/**
 * ================================
 * NUMBER INPUT COMPONENT
 * ================================
 *
 * Production-ready Number Input field component.
 *
 * Responsibilities:
 * - Render number input with integer/decimal support
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
 * - Local state for display value (allows flexible input during editing)
 * - Step value determined by field rules (integer vs numeric)
 */

import React, { useEffect, useState, forwardRef } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Hash } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { NumberInputProps } from './types/numberInputField.types';
import {
  getDefaultNumberInputValue,
  getStepValue,
} from './validation/numberInputValidation';

// ================================
// LOCALIZATION
// ================================

const getLocalizedNumberConfig = (languageId?: number) => {
  if (languageId === 2) {
    // Arabic
    return {
      placeholder: '٠',
    };
  }

  if (languageId === 3) {
    // Spanish
    return {
      placeholder: '0',
    };
  }

  // English (default)
  return {
    placeholder: '0',
  };
};

// ================================
// COMPONENT
// ================================

/**
 * NumberInput Component
 *
 * Renders a number input with validation.
 * Integrates with form systems via onChange callback.
 * Supports forwardRef for scrolling to errors.
 *
 * @example
 * ```
 * <NumberInput
 *   ref={numberRef}
 *   field={fieldData}
 *   value={numberValue}
 *   onChange={(newValue) => setValue(newValue)}
 *   error={errors.number?.message}
 * />
 * ```
 */
export const NumberInput = forwardRef<HTMLDivElement, NumberInputProps>(
  ({ field, value, onChange, error, disabled = false, className, languageId, onBlur }, ref) => {
    const [displayValue, setDisplayValue] = useState<string>('');
    const [isFocused, setIsFocused] = useState<boolean>(false);

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
        initialValue = getDefaultNumberInputValue(field);
      }

      setDisplayValue(initialValue.toString());
    }, [field, value, isFocused]);

    const isRequired =
      field.rules?.some((rule) => rule.rule_name === 'required') ?? false;

    const step = getStepValue(field);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const input = e.target.value;

      if (
        input === '' ||
        input === '.' ||
        input === '-' ||
        /^-?\d*\.?\d*$/.test(input)
      ) {
        setDisplayValue(input);

        if (input === '' || input === '.' || input === '-') {
          onChange(0);
        } else {
          const numericValue = parseFloat(input);
          if (!isNaN(numericValue)) {
            onChange(numericValue);
          }
        }
      }
    };

    const handleBlur = () => {
      setIsFocused(false);

      if (displayValue && displayValue !== '.' && displayValue !== '-') {
        const numericValue = parseFloat(displayValue);
        if (!isNaN(numericValue)) {
          setDisplayValue(numericValue.toString());
        }
      } else {
        setDisplayValue('0');
        onChange(0);
      }
      
      if (onBlur) {
        onBlur();
      }
    };

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(true);
      setTimeout(() => {
        e.target.select();
      }, 0);
    };

    const numberInputId = `number-input-${field.field_id}`;
    const { placeholder: localizedPlaceholder } = getLocalizedNumberConfig(languageId);
    const placeholder = field.placeholder || localizedPlaceholder;

    return (
      <div ref={ref} className={cn('space-y-2', className)}>
        <Label
          htmlFor={numberInputId}
          className="text-sm font-medium flex items-center gap-2"
        >
          <Hash className="h-4 w-4 text-green-500" />
          {field.label}
          {isRequired && <span className="text-destructive ml-1">*</span>}
        </Label>

        <Input
          id={numberInputId}
          type="number"
          step={step}
          value={displayValue}
          onChange={handleInputChange}
          onBlur={handleBlur}
          onFocus={handleFocus}
          placeholder={placeholder}
          disabled={disabled}
          className={cn(
            'h-10',
            error && 'border-destructive focus-visible:ring-destructive',
          )}
          aria-label={field.label}
          aria-required={isRequired}
          aria-invalid={!!error}
          aria-describedby={
            error
              ? `${numberInputId}-error`
              : field.helper_text
                ? `${numberInputId}-description`
                : undefined
          }
        />

        {field.helper_text && !error && (
          <p
            id={`${numberInputId}-description`}
            className="text-xs text-muted-foreground"
          >
            {field.helper_text}
          </p>
        )}

        {error && (
          <p
            id={`${numberInputId}-error`}
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

NumberInput.displayName = 'NumberInput';

export default NumberInput;
