/**
 * ================================
 * DATE INPUT COMPONENT
 * ================================
 * Production-ready Date Input field component with:
 * - Dynamic configuration from API field data
 * - Zod validation based on field rules
 * - Native date picker with calendar interface
 * - Support for before, after, before_or_equal, after_or_equal rules
 * - Min/max date constraints
 * - ForwardRef support for parent scrolling
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

/**
 * DateInput Component
 * 
 * Renders a native date input with calendar picker and validation
 * Integrates with form systems via onChange callback
 * Supports forwardRef for scrolling to errors
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
  ({ field, value, onChange, error, disabled = false, className }, ref) => {
    console.debug('[DateInput] Rendering for field:', field.field_id);

    // Initialize with default value or current value
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

    // Check if field is required
    const isRequired = field.rules?.some((rule) => rule.rule_name === 'required') ?? false;

    // Get min and max dates from validation rules
    const minDate = getMinDate(field.rules || []);
    const maxDate = getMaxDate(field.rules || []);

    // Update local value when external value changes
    useEffect(() => {
      if (value && isValidDate(value)) {
        setLocalValue(value);
      }
    }, [value]);

    /**
     * Handle date change
     */
    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newDate = e.target.value;
      
      setLocalValue(newDate);
      onChange(newDate);

      console.debug('[DateInput] Date changed:', {
        fieldId: field.field_id,
        date: newDate,
      });
    };

    // Generate unique ID for accessibility
    const dateInputId = `date-input-${field.field_id}`;

    return (
      <div ref={ref} className={cn('space-y-3', className)}>
        {/* Field Label with Icon */}
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-indigo-500" />
          <Label htmlFor={dateInputId} className="text-sm font-medium">
            {field.label}
            {isRequired && <span className="text-destructive ml-1">*</span>}
          </Label>
        </div>

        {/* Date Input */}
        <div className="relative">
          <Input
            id={dateInputId}
            type="date"
            value={localValue}
            onChange={handleDateChange}
            min={minDate || undefined}
            max={maxDate || undefined}
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
                ? `${dateInputId}-error`
                : field.helper_text
                ? `${dateInputId}-description`
                : undefined
            }
          />
        </div>

        {/* Helper Text */}
        {field.helper_text && !error && (
          <p
            id={`${dateInputId}-description`}
            className="text-xs text-muted-foreground"
          >
            {field.helper_text}
          </p>
        )}

        {/* Error Message */}
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
  }
);

DateInput.displayName = 'DateInput';

export default DateInput;
