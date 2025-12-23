/**
 * ================================
 * PERCENTAGE INPUT COMPONENT
 * ================================
 *
 * Production-ready Percentage Input field component.
 *
 * Responsibilities:
 * - Render percentage input with symbol and progress bar
 * - Emit numeric value changes via onChange callback
 * - Display validation errors from parent
 * - Apply min/max clamping on blur
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
 * - Visual progress bar shows clamped value
 * - Min/max extracted from field rules (default 0-100)
 */

import React, { useEffect, useState, forwardRef } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Percent } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { PercentageInputProps } from './types/percentageInputField.types';
import {
  getDefaultPercentageInputValue,
  formatPercentage,
  parsePercentage,
  clampPercentage,
} from './validation/percentageInputValidation';

// ================================
// LOCALIZATION
// ================================

const getLocalizedPercentageConfig = (languageId?: number) => {
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
 * PercentageInput Component
 *
 * Renders a percentage input with symbol, progress bar, and validation.
 * Integrates with form systems via onChange callback.
 * Supports forwardRef for scrolling to errors.
 *
 * @example
 * ```
 * <PercentageInput
 *   ref={percentageRef}
 *   field={fieldData}
 *   value={percentageValue}
 *   onChange={(newValue) => setValue(newValue)}
 *   error={errors.percentage?.message}
 * />
 * ```
 */
export const PercentageInput = forwardRef<HTMLDivElement, PercentageInputProps>(
  ({ field, value, onChange, onBlur, error, disabled = false, className, languageId }, ref) => {
    const [displayValue, setDisplayValue] = useState<string>('');
    const [isFocused, setIsFocused] = useState<boolean>(false);

    const minRule = field.rules?.find((r) => r.rule_name === 'min');
    const maxRule = field.rules?.find((r) => r.rule_name === 'max');
    const betweenRule = field.rules?.find((r) => r.rule_name === 'between');

    const min =
      (minRule?.rule_props as { value?: number })?.value ??
      (betweenRule?.rule_props as { min?: number })?.min ??
      0;
    const max =
      (maxRule?.rule_props as { value?: number })?.value ??
      (betweenRule?.rule_props as { max?: number })?.max ??
      100;

    useEffect(() => {
      if (isFocused) {
        return;
      }

      let initialValue: number;

      if (typeof value === 'number' && !isNaN(value)) {
        initialValue = value;
      } else if (field.current_value && typeof field.current_value === 'number') {
        initialValue = field.current_value;
      } else {
        initialValue = getDefaultPercentageInputValue(field);
      }

      setDisplayValue(initialValue.toString());
    }, [field, value, isFocused]);

    const isRequired =
      field.rules?.some((rule) => rule.rule_name === 'required') ?? false;

    const numericValue = parsePercentage(displayValue);
    const clampedValue = clampPercentage(numericValue, min, max);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const input = e.target.value;

      if (input === '' || input === '.' || /^-?\d*\.?\d*$/.test(input)) {
        setDisplayValue(input);

        if (input === '' || input === '.' || input === '-') {
          onChange(0);
        } else {
          const numericValue = parsePercentage(input);
          if (!isNaN(numericValue)) {
            onChange(numericValue);
          }
        }
      }
    };

    const handleBlur = () => {
      setIsFocused(false);

      if (displayValue && displayValue !== '.') {
        const numericValue = parsePercentage(displayValue);
        if (!isNaN(numericValue)) {
          const clamped = clampPercentage(numericValue, min, max);
          setDisplayValue(formatPercentage(clamped, 1));

          if (clamped !== numericValue) {
            onChange(clamped);
          }
        }
      } else {
        setDisplayValue('0');
        onChange(0);
      }
      
      onBlur?.();
    };

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(true);
      setTimeout(() => {
        e.target.select();
      }, 0);
    };

    const percentageInputId = `percentage-input-${field.field_id}`;
    const { placeholder: localizedPlaceholder } =
      getLocalizedPercentageConfig(languageId);
    const placeholder = field.placeholder || localizedPlaceholder;

    return (
      <div ref={ref} className={cn('space-y-3', className)}>
        <div className="flex items-center gap-2">
          <Percent className="h-4 w-4 text-blue-500" />
          <Label htmlFor={percentageInputId} className="text-sm font-medium">
            {field.label}
            {isRequired && <span className="text-destructive ml-1">*</span>}
          </Label>
        </div>

        <div className="relative">
          <Input
            id={percentageInputId}
            type="text"
            inputMode="decimal"
            value={displayValue}
            onChange={handleInputChange}
            onBlur={handleBlur}
            onFocus={handleFocus}
            placeholder={placeholder}
            disabled={disabled}
            className={cn(
              'h-11 pr-12 text-right text-lg font-semibold',
              'border-blue-200 focus:border-blue-500',
              error && 'border-destructive focus-visible:ring-destructive',
            )}
            aria-label={field.label}
            aria-required={isRequired}
            aria-invalid={!!error}
            aria-describedby={
              error
                ? `${percentageInputId}-error`
                : field.helper_text
                  ? `${percentageInputId}-description`
                  : undefined
            }
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-600 font-bold text-xl pointer-events-none">
            %
          </span>
        </div>

        <div className="p-4 border border-blue-200 rounded-lg bg-blue-50/50">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Progress:</span>
              <span className="text-xs font-bold text-blue-600">
                {clampedValue.toFixed(1)}%
              </span>
            </div>

            <Progress value={clampedValue} max={max} className="h-4" />

            <div className="flex justify-between text-[10px] text-muted-foreground">
              <span>{min}%</span>
              <span className="font-bold text-blue-600 text-sm">
                {clampedValue.toFixed(1)}%
              </span>
              <span>{max}%</span>
            </div>
          </div>
        </div>

        {field.helper_text && !error && (
          <p
            id={`${percentageInputId}-description`}
            className="text-xs text-muted-foreground"
          >
            {field.helper_text}
          </p>
        )}

        {error && (
          <p
            id={`${percentageInputId}-error`}
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

PercentageInput.displayName = 'PercentageInput';

export default PercentageInput;
