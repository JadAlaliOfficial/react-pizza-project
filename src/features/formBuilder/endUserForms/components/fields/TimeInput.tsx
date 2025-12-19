/**
 * ================================
 * TIME INPUT COMPONENT
 * ================================
 *
 * Production-ready Time Input field component.
 *
 * Responsibilities:
 * - Render time input
 * - Emit value via onChange callback
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
 * - Local state for controlled input behavior
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

// ================================
// LOCALIZATION
// ================================

const getLocalizedTimeConfig = (languageId?: number) => {
  if (languageId === 2) {
    // Arabic
    return {
      placeholder: 'ساعة:دقيقة',
      nowLabel: 'الآن',
      nowTitle: 'تعيين على الوقت الحالي',
      clearLabel: 'مسح',
      clearTitle: 'مسح الوقت',
      ariaSuffix: ' - حقل إدخال الوقت',
    };
  }

  if (languageId === 3) {
    // Spanish
    return {
      placeholder: 'HH:MM',
      nowLabel: 'Ahora',
      nowTitle: 'Establecer a la hora actual',
      clearLabel: 'Borrar',
      clearTitle: 'Borrar hora',
      ariaSuffix: ' - campo de entrada de hora',
    };
  }

  // English (default)
  return {
    placeholder: 'HH:MM',
    nowLabel: 'Now',
    nowTitle: 'Set to current time',
    clearLabel: 'Clear',
    clearTitle: 'Clear time',
    ariaSuffix: ' - time input field',
  };
};

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
  ({ field, value, onChange, error, disabled = false, className, languageId }, ref) => {
    const [localValue, setLocalValue] = useState<string>(() => {
      if (value !== null && value !== undefined) {
        return String(value);
      }

      if (field.current_value !== null && field.current_value !== undefined) {
        return String(field.current_value);
      }

      return getDefaultTimeInputValue(field);
    });

    const isRequired =
      field.rules?.some((rule) => rule.rule_name === 'required') ?? false;

    useEffect(() => {
      if (value !== null && value !== undefined) {
        setLocalValue(String(value));
      }
    }, [value]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      setLocalValue(newValue);
      onChange(newValue);
    };

    const handleSetNow = () => {
      if (disabled) return;

      const currentTime = getCurrentTime();
      setLocalValue(currentTime);
      onChange(currentTime);
    };

    const handleClear = () => {
      if (disabled) return;

      setLocalValue('');
      onChange('');
    };

    const timeInputId = `time-input-${field.field_id}`;

    const {
      placeholder: localizedPlaceholder,
      nowLabel,
      nowTitle,
      clearLabel,
      clearTitle,
      ariaSuffix,
    } = getLocalizedTimeConfig(languageId);

    const placeholder = field.placeholder || localizedPlaceholder;
    const displayTime = localValue ? formatTimeDisplay(localValue) : null;

    return (
      <div
        ref={ref}
        className={cn('space-y-2', className)}
        aria-label={`${field.label}${ariaSuffix}`}
      >
        {/* Field Label with Icon */}
        <div className="flex items-center justify-between">
          <Label
            htmlFor={timeInputId}
            className="text-sm font-medium flex items-center gap-2"
          >
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
              error && 'border-destructive focus-visible:ring-destructive',
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
            title={nowTitle}
          >
            {nowLabel}
          </Button>

          {!isRequired && localValue && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleClear}
              disabled={disabled}
              className="shrink-0"
              title={clearTitle}
            >
              {clearLabel}
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
  },
);

TimeInput.displayName = 'TimeInput';

export default TimeInput;
