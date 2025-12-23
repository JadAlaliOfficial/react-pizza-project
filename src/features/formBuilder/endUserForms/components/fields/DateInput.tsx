/**
 * ================================
 * DATE INPUT COMPONENT
 * ================================
 *
 * Production-ready Date Input field component.
 *
 * Responsibilities:
 * - Render native date input with calendar picker
 * - Emit date string changes via onChange callback
 * - Display validation errors from parent
 * - Apply min/max date constraints from field rules
 * - Apply disabled state
 * - Support accessibility
 *
 * Architecture Decisions:
 * - Dumb component - no validation/visibility/business logic
 * - Props match RuntimeFieldProps contract
 * - No debug logs
 * - No RTL logic (handled by parent)
 * - ForwardRef for error scrolling
 * - Local state for controlled input behavior
 */

import React, { useEffect, useState, forwardRef } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { DateInputProps } from './types/dateInputField.types';
import {
  getDefaultDateInputValue,
  getMinDate,
  getMaxDate,
  isValidDate,
} from './validation/dateInputValidation';

// ================================
// LOCALIZATION
// ================================

const getLocalizedDateConfig = (languageId?: number) => {
  if (languageId === 2) {
    // Arabic
    return {
      ariaSuffix: ' - حقل اختيار التاريخ',
    };
  }

  if (languageId === 3) {
    // Spanish
    return {
      ariaSuffix: ' - campo de selección de fecha',
    };
  }

  // English (default)
  return {
    ariaSuffix: ' - date selection field',
  };
};

// ================================
// COMPONENT
// ================================

/**
 * DateInput Component
 *
 * Renders a native date input with calendar picker and validation.
 * Integrates with form systems via onChange callback.
 * Supports forwardRef for scrolling to errors.
 *
 * @example
 * ```
 * <DateInput
 *   ref={dateRef}
 *   field={fieldData}
 *   value={dateValue}
 *   onChange={(newDate) => setValue(newDate)}
 *   error={errors.date?.message}
 * />
 * ```
 */
export const DateInput = forwardRef<HTMLDivElement, DateInputProps>(
  ({ field, value, onChange, error, disabled = false, className, languageId, onBlur }, ref) => {
    const [localValue, setLocalValue] = useState<string>(() => {
      if (value && isValidDate(value)) return value;

      if (field.current_value && typeof field.current_value === 'string') {
        const currentVal = field.current_value;
        if (isValidDate(currentVal)) {
          return currentVal;
        }
      }

      return getDefaultDateInputValue(field);
    });

    const isRequired =
      field.rules?.some((rule) => rule.rule_name === 'required') ?? false;

    const minDate = getMinDate(field.rules || []);
    const maxDate = getMaxDate(field.rules || []);

    const { ariaSuffix } = getLocalizedDateConfig(languageId);

    useEffect(() => {
      if (value && isValidDate(value)) {
        setLocalValue(value);
      }
    }, [value]);

    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newDate = e.target.value;

      setLocalValue(newDate);
      onChange(newDate);
    };

    const handleBlur = () => {
      if (onBlur) {
        onBlur();
      }
    };

    const dateInputId = `date-input-${field.field_id}`;

    return (
      <div ref={ref} className={cn('space-y-3', className)}>
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-indigo-500" />
          <Label htmlFor={dateInputId} className="text-sm font-medium">
            {field.label}
            {isRequired && <span className="text-destructive ml-1">*</span>}
          </Label>
        </div>

        <div className="relative">
          <Input
            id={dateInputId}
            type="date"
            value={localValue}
            onChange={handleDateChange}
            onBlur={handleBlur}
            min={minDate || undefined}
            max={maxDate || undefined}
            disabled={disabled}
            className={cn(
              'h-10',
              error && 'border-destructive focus-visible:ring-destructive',
            )}
            aria-label={`${field.label}${ariaSuffix}`}
            aria-required={isRequired}
            aria-invalid={!!error}
            aria-describedby={
              error
                ? `${dateInputId}-error`
                : field.helper_text
                  ? `${dateInputId}-description`
                  : undefined
            }
          />
        </div>

        {field.helper_text && !error && (
          <p
            id={`${dateInputId}-description`}
            className="text-xs text-muted-foreground"
          >
            {field.helper_text}
          </p>
        )}

        {error && (
          <p
            id={`${dateInputId}-error`}
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

DateInput.displayName = 'DateInput';

export default DateInput;
