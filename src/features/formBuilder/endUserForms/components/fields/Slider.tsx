/**
 * ================================
 * SLIDER COMPONENT
 * ================================
 *
 * Production-ready Slider field component.
 *
 * Responsibilities:
 * - Render range slider
 * - Emit numeric value via onChange callback
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

import { useEffect, useState, forwardRef } from 'react';
import { Label } from '@/components/ui/label';
import { Slider as SliderUI } from '@/components/ui/slider';
import { SlidersHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { SliderProps } from './types/sliderField.types';
import {
  getDefaultSliderValue,
  getSliderMin,
  getSliderMax,
  getSliderStep,
} from './validation/sliderValidation';

// ================================
// LOCALIZATION
// ================================

const getLocalizedSliderConfig = (languageId?: number) => {
  if (languageId === 2) {
    // Arabic
    return {
      helperInline: 'اسحب للتعديل',
      ariaSuffix: ' - حقل منزلق للقيم',
    };
  }

  if (languageId === 3) {
    // Spanish
    return {
      helperInline: 'Arrastra para ajustar',
      ariaSuffix: ' - campo de control deslizante',
    };
  }

  // English (default)
  return {
    helperInline: 'Drag to adjust',
    ariaSuffix: ' - slider field',
  };
};

/**
 * Slider Component
 *
 * Renders a range slider with live value display
 * Integrates with form systems via onChange callback
 * Supports forwardRef for scrolling to errors
 *
 * @example
 * ```
 * <Slider
 *   ref={sliderRef}
 *   field={fieldData}
 *   value={sliderValue}
 *   onChange={(newValue) => setValue(newValue)}
 *   error={errors.slider?.message}
 * />
 * ```
 */
export const Slider = forwardRef<HTMLDivElement, SliderProps>(
  ({ field, value, onChange, onBlur, error, disabled = false, className, languageId }, ref) => {
    const minValue = getSliderMin(field);
    const maxValue = getSliderMax(field);
    const step = getSliderStep(field);

    const [localValue, setLocalValue] = useState<number>(() => {
      if (typeof value === 'number' && !isNaN(value)) {
        return value;
      }

      if (field.current_value && typeof field.current_value === 'number') {
        return field.current_value;
      }

      return getDefaultSliderValue(field);
    });

    const isRequired =
      field.rules?.some((rule) => rule.rule_name === 'required') ?? false;

    const { helperInline, ariaSuffix } = getLocalizedSliderConfig(languageId);

    useEffect(() => {
      if (typeof value === 'number' && !isNaN(value)) {
        setLocalValue(value);
      }
    }, [value]);

    const handleValueChange = (newValue: number[]) => {
      const val = newValue[0];
      setLocalValue(val);
      onChange(val);
    };

    const sliderId = `slider-${field.field_id}`;

    return (
      <div
        ref={ref}
        className={cn('space-y-3', className)}
        aria-label={`${field.label}${ariaSuffix}`}
      >
        {/* Field Label with Icon */}
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-indigo-500" />
          <Label htmlFor={sliderId} className="text-sm font-medium">
            {field.label}
            {isRequired && <span className="text-destructive ml-1">*</span>}
          </Label>
        </div>

        {/* Slider Component */}
        <div className="space-y-3 px-1">
          {/* Value Display */}
          <div className="flex items-center justify-center">
            <div
              className={cn(
                'px-4 py-2 border rounded-lg',
                error
                  ? 'bg-destructive/5 border-destructive'
                  : 'bg-indigo-50 border-indigo-200',
              )}
            >
              <span
                className={cn(
                  'text-2xl font-bold',
                  error ? 'text-destructive' : 'text-indigo-600',
                )}
              >
                {step === 1 ? localValue : localValue.toFixed(1)}
              </span>
            </div>
          </div>

          {/* Slider Track */}
          <div className="relative">
            <SliderUI
              id={sliderId}
              value={[localValue]}
              onValueChange={handleValueChange}
              onValueCommit={() => onBlur?.()}
              min={minValue}
              max={maxValue}
              step={step}
              disabled={disabled}
              className={cn(
                'w-full',
                error && '[&_[role=slider]]:border-destructive',
              )}
              aria-label={field.label}
              aria-required={isRequired}
              aria-invalid={!!error}
              aria-describedby={
                error
                  ? `${sliderId}-error`
                  : field.helper_text
                    ? `${sliderId}-description`
                    : undefined
              }
            />
            {/* Min/Max Labels */}
            <div className="flex justify-between text-xs text-muted-foreground mt-2">
              <span className="font-medium">{minValue}</span>
              <span className="text-[10px] italic">{helperInline}</span>
              <span className="font-medium">{maxValue}</span>
            </div>
          </div>
        </div>

        {/* Helper Text */}
        {field.helper_text && !error && (
          <p
            id={`${sliderId}-description`}
            className="text-xs text-muted-foreground"
          >
            {field.helper_text}
          </p>
        )}

        {/* Error Message */}
        {error && (
          <p
            id={`${sliderId}-error`}
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

Slider.displayName = 'Slider';

export default Slider;
