/**
 * ================================
 * DATETIME INPUT COMPONENT
 * ================================
 * Production-ready DateTime Input field component with:
 * - Dynamic configuration from API field data
 * - Zod validation based on field rules
 * - Native datetime-local picker with calendar and time interface
 * - Support for before, after, before_or_equal, after_or_equal rules
 * - Min/max datetime constraints
 * - ForwardRef support for parent scrolling
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

/**
 * DateTimeInput Component
 * 
 * Renders a native datetime-local input with calendar and time picker
 * Integrates with form systems via onChange callback
 * Supports forwardRef for scrolling to errors
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
  ({ field, value, onChange, error, disabled = false, className }, ref) => {
    console.debug('[DateTimeInput] Rendering for field:', field.field_id);

    // Initialize with default value or current value
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

    // Check if field is required
    const isRequired = field.rules?.some((rule) => rule.rule_name === 'required') ?? false;

    // Get min and max datetimes from validation rules
    const minDateTime = getMinDateTime(field.rules || []);
    const maxDateTime = getMaxDateTime(field.rules || []);

    // Convert min/max if they're date-only (add T00:00)
    const minDateTimeFormatted = minDateTime ? dateToDateTime(minDateTime) : undefined;
    const maxDateTimeFormatted = maxDateTime ? dateToDateTime(maxDateTime) : undefined;

    // Update local value when external value changes
    useEffect(() => {
      if (value && isValidDateTime(value)) {
        setLocalValue(value.substring(0, 16));
      }
    }, [value]);

    /**
     * Handle datetime change
     */
    const handleDateTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newDateTime = e.target.value;
      
      setLocalValue(newDateTime);
      onChange(newDateTime);

      console.debug('[DateTimeInput] DateTime changed:', {
        fieldId: field.field_id,
        datetime: newDateTime,
      });
    };

    // Generate unique ID for accessibility
    const dateTimeInputId = `datetime-input-${field.field_id}`;

    return (
      <div ref={ref} className={cn('space-y-3', className)}>
        {/* Field Label with Icon */}
        <div className="flex items-center gap-2">
          <CalendarClock className="h-4 w-4 text-purple-500" />
          <Label htmlFor={dateTimeInputId} className="text-sm font-medium">
            {field.label}
            {isRequired && <span className="text-destructive ml-1">*</span>}
          </Label>
        </div>

        {/* DateTime Input */}
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
            aria-label={field.label}
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

        {/* Helper Text */}
        {field.helper_text && !error && (
          <p
            id={`${dateTimeInputId}-description`}
            className="text-xs text-muted-foreground"
          >
            {field.helper_text}
          </p>
        )}

        {/* Error Message */}
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
