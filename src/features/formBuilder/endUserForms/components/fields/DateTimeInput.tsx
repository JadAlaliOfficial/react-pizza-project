/**
 * ================================
 * DATETIME INPUT COMPONENT
 * ================================
 *
 * Production-ready DateTime Input field component.
 *
 * Responsibilities:
 * - Render native datetime-local input with calendar and time picker
 * - Emit datetime string changes via onChange callback
 * - Display validation errors from parent
 * - Apply min/max datetime constraints from field rules
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
import { CalendarClock } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { DateTimeInputProps } from './types/dateTimeInputField.types';
import {
  getDefaultDateTimeInputValue,
  getMinDateTime,
  getMaxDateTime,
  isValidDateTime,
  dateToDateTime,
} from './validation/dateTimeInputValidation';

// ================================
// LOCALIZATION
// ================================

const getLocalizedDateTimeConfig = (languageId?: number) => {
  if (languageId === 2) {
    // Arabic
    return {
      ariaSuffix: ' - حقل اختيار التاريخ والوقت',
    };
  }

  if (languageId === 3) {
    // Spanish
    return {
      ariaSuffix: ' - campo de selección de fecha y hora',
    };
  }

  // English (default)
  return {
    ariaSuffix: ' - date and time selection field',
  };
};

// ================================
// COMPONENT
// ================================

/**
 * DateTimeInput Component
 *
 * Renders a native datetime-local input with calendar and time picker.
 * Integrates with form systems via onChange callback.
 * Supports forwardRef for scrolling to errors.
 *
 * @example
 * ```
 * <DateTimeInput
 *   ref={datetimeRef}
 *   field={fieldData}
 *   value={datetimeValue}
 *   onChange={(newDateTime) => setValue(newDateTime)}
 *   error={errors.datetime?.message}
 * />
 * ```
 */
export const DateTimeInput = forwardRef<HTMLDivElement, DateTimeInputProps>(
  ({ field, value, onChange, error, disabled = false, className, languageId }, ref) => {
    const [localValue, setLocalValue] = useState<string>(() => {
      if (value && isValidDateTime(value)) return value.substring(0, 16);

      if (field.current_value && typeof field.current_value === 'string') {
        const currentVal = field.current_value;
        if (isValidDateTime(currentVal)) {
          return currentVal.substring(0, 16);
        }
      }

      return getDefaultDateTimeInputValue(field);
    });

    const isRequired =
      field.rules?.some((rule) => rule.rule_name === 'required') ?? false;

    const minDateTime = getMinDateTime(field.rules || []);
    const maxDateTime = getMaxDateTime(field.rules || []);

    const minDateTimeFormatted = minDateTime ? dateToDateTime(minDateTime) : undefined;
    const maxDateTimeFormatted = maxDateTime ? dateToDateTime(maxDateTime) : undefined;

    const { ariaSuffix } = getLocalizedDateTimeConfig(languageId);

    useEffect(() => {
      if (value && isValidDateTime(value)) {
        setLocalValue(value.substring(0, 16));
      }
    }, [value]);

    const handleDateTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newDateTime = e.target.value;

      setLocalValue(newDateTime);
      onChange(newDateTime);
    };

    const dateTimeInputId = `datetime-input-${field.field_id}`;

    return (
      <div ref={ref} className={cn('space-y-3', className)}>
        <div className="flex items-center gap-2">
          <CalendarClock className="h-4 w-4 text-purple-500" />
          <Label htmlFor={dateTimeInputId} className="text-sm font-medium">
            {field.label}
            {isRequired && <span className="text-destructive ml-1">*</span>}
          </Label>
        </div>

        <div className="relative">
          <Input
            id={dateTimeInputId}
            type="datetime-local"
            value={localValue}
            onChange={handleDateTimeChange}
            min={minDateTimeFormatted}
            max={maxDateTimeFormatted}
            disabled={disabled}
            className={cn(
              'h-10',
              error && 'border-destructive focus-visible:ring-destructive'
            )}
            aria-label={`${field.label}${ariaSuffix}`}
            aria-required={isRequired}
            aria-invalid={!!error}
            aria-describedby={
              error
                ? `${dateTimeInputId}-error`
                : field.helper_text
                ? `${dateTimeInputId}-description`
                : undefined
            }
          />
        </div>

        {field.helper_text && !error && (
          <p id={`${dateTimeInputId}-description`} className="text-xs text-muted-foreground">
            {field.helper_text}
          </p>
        )}

        {error && (
          <p
            id={`${dateTimeInputId}-error`}
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

DateTimeInput.displayName = 'DateTimeInput';

export default DateTimeInput;
