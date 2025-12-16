/**
 * ================================
 * TIME INPUT COMPONENT
 * ================================
 * Production-ready Time Input field component with:
 * - Dynamic configuration from API field data
 * - Zod validation based on field rules
 * - Native HTML5 time picker
 * - 24-hour format (HH:MM)
 * - Quick time helper display
 * - ForwardRef support for parent scrolling
 */

import React, { useEffect, useState, forwardRef } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { TimeInputProps } from './types/timeInputField.types';
import {
  getDefaultTimeInputValue,
  formatTimeDisplay,
  getCurrentTime,
} from './validation/timeInputValidation';

/**
 * TimeInput Component
 * 
 * Renders a native HTML5 time picker
 * Integrates with form systems via onChange callback
 * Supports forwardRef for scrolling to errors
 * 
 * @example
 * ```
 * <TimeInput
 *   ref={timeRef}
 *   field={fieldData}
 *   value={timeValue}
 *   onChange={(newValue) => setValue(newValue)}
 *   error={errors.time?.message}
 * />
 * ```
 */
export const TimeInput = forwardRef<HTMLDivElement, TimeInputProps>(
  ({ field, value, onChange, error, disabled = false, className }, ref) => {
    console.debug('[TimeInput] Rendering for field:', field.field_id);

    // Initialize with default value or current value
    const [localValue, setLocalValue] = useState<string>(() => {
      if (value !== null && value !== undefined) {
        return String(value);
      }
      
      if (field.current_value !== null && field.current_value !== undefined) {
        return String(field.current_value);
      }
      
      return getDefaultTimeInputValue(field);
    });

    // Check if field is required
    const isRequired = field.rules?.some((rule) => rule.rule_name === 'required') ?? false;

    // Update local value when external value changes
    useEffect(() => {
      if (value !== null && value !== undefined) {
        setLocalValue(String(value));
      }
    }, [value]);

    /**
     * Handle time input change
     */
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      setLocalValue(newValue);
      onChange(newValue);

      console.debug('[TimeInput] Value changed:', {
        fieldId: field.field_id,
        value: newValue,
      });
    };

    /**
     * Set time to current time
     */
    const handleSetNow = () => {
      if (disabled) return;
      
      const currentTime = getCurrentTime();
      setLocalValue(currentTime);
      onChange(currentTime);

      console.debug('[TimeInput] Set to current time:', {
        fieldId: field.field_id,
        value: currentTime,
      });
    };

    /**
     * Clear time value
     */
    const handleClear = () => {
      if (disabled) return;
      
      setLocalValue('');
      onChange('');

      console.debug('[TimeInput] Cleared:', {
        fieldId: field.field_id,
      });
    };

    // Generate unique ID for accessibility
    const timeInputId = `time-input-${field.field_id}`;

    // Get placeholder
    const placeholder = field.placeholder || 'HH:MM';

    // Get formatted display time
    const displayTime = localValue ? formatTimeDisplay(localValue) : null;

    return (
      <div ref={ref} className={cn('space-y-2', className)}>
        {/* Field Label with Icon */}
        <div className="flex items-center justify-between">
          <Label htmlFor={timeInputId} className="text-sm font-medium flex items-center gap-2">
            <Clock className="h-4 w-4 text-teal-500" />
            {field.label}
            {isRequired && <span className="text-destructive ml-1">*</span>}
          </Label>

          {/* Display formatted time (12-hour) */}
          {displayTime && (
            <span className="text-xs font-medium text-teal-600">
              {displayTime}
            </span>
          )}
        </div>

        {/* Time Input with Quick Actions */}
        <div className="flex gap-2">
          <Input
            id={timeInputId}
            type="time"
            value={localValue}
            onChange={handleChange}
            placeholder={placeholder}
            disabled={disabled}
            className={cn(
              'flex-1',
              error && 'border-destructive focus-visible:ring-destructive'
            )}
            aria-label={field.label}
            aria-required={isRequired}
            aria-invalid={!!error}
            aria-describedby={
              error
                ? `${timeInputId}-error`
                : field.helper_text
                ? `${timeInputId}-description`
                : undefined
            }
          />

          {/* Quick Action Buttons */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleSetNow}
            disabled={disabled}
            className="shrink-0"
            title="Set to current time"
          >
            Now
          </Button>

          {!isRequired && localValue && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleClear}
              disabled={disabled}
              className="shrink-0"
              title="Clear time"
            >
              Clear
            </Button>
          )}
        </div>

        {/* Helper Text */}
        {field.helper_text && !error && (
          <p
            id={`${timeInputId}-description`}
            className="text-xs text-muted-foreground"
          >
            {field.helper_text}
          </p>
        )}

        {/* Error Message */}
        {error && (
          <p
            id={`${timeInputId}-error`}
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

TimeInput.displayName = 'TimeInput';

export default TimeInput;
