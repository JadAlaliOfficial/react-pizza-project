/**
 * ================================
 * PERCENTAGE INPUT COMPONENT
 * ================================
 * Production-ready Percentage Input field component with:
 * - Dynamic configuration from API field data
 * - Zod validation based on field rules
 * - Visual progress bar
 * - Min/max validation with conflict resolution
 * - Percentage symbol display
 * - ForwardRef support for parent scrolling
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

/**
 * PercentageInput Component
 * 
 * Renders a percentage input with symbol, progress bar, and validation
 * Integrates with form systems via onChange callback
 * Supports forwardRef for scrolling to errors
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
  ({ field, value, onChange, error, disabled = false, className }, ref) => {
    console.debug('[PercentageInput] Rendering for field:', field.field_id);

    // State for display value (string during editing, number when not focused)
    const [displayValue, setDisplayValue] = useState<string>('');
    const [isFocused, setIsFocused] = useState<boolean>(false);

    // Get min/max from rules (default to 0-100)
    const minRule = field.rules?.find((r) => r.rule_name === 'min');
    const maxRule = field.rules?.find((r) => r.rule_name === 'max');
    const betweenRule = field.rules?.find((r) => r.rule_name === 'between');

    const min = (minRule?.rule_props as { value?: number })?.value ?? 
                (betweenRule?.rule_props as { min?: number })?.min ?? 
                0;
    const max = (maxRule?.rule_props as { value?: number })?.value ?? 
                (betweenRule?.rule_props as { max?: number })?.max ?? 
                100;

    // Initialize with default value or current value
    useEffect(() => {
      if (isFocused) {
        // Don't update while user is typing
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

    // Check if field is required
    const isRequired = field.rules?.some((rule) => rule.rule_name === 'required') ?? false;

    // Get numeric value for progress bar
    const numericValue = parsePercentage(displayValue);
    const clampedValue = clampPercentage(numericValue, min, max);

    /**
     * Handle input change - allow free typing
     */
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const input = e.target.value;

      // Allow empty, numbers, and decimal point
      if (input === '' || input === '.' || /^-?\d*\.?\d*$/.test(input)) {
        setDisplayValue(input);

        // Parse and send numeric value to parent
        if (input === '' || input === '.' || input === '-') {
          onChange(0);
        } else {
          const numericValue = parsePercentage(input);
          if (!isNaN(numericValue)) {
            onChange(numericValue);
          }
        }
      }

      console.debug('[PercentageInput] Value changed:', {
        fieldId: field.field_id,
        input,
        numeric: input ? parsePercentage(input) : 0,
      });
    };

    /**
     * Handle blur - format and clamp value
     */
    const handleBlur = () => {
      setIsFocused(false);

      if (displayValue && displayValue !== '.') {
        const numericValue = parsePercentage(displayValue);
        if (!isNaN(numericValue)) {
          // Clamp value and format
          const clamped = clampPercentage(numericValue, min, max);
          setDisplayValue(formatPercentage(clamped, 1));
          
          // Update parent if value was clamped
          if (clamped !== numericValue) {
            onChange(clamped);
          }
        }
      } else {
        setDisplayValue('0');
        onChange(0);
      }
    };

    /**
     * Handle focus
     */
    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(true);
      // Select all for easy replacement
      setTimeout(() => {
        e.target.select();
      }, 0);
    };

    // Generate unique ID for accessibility
    const percentageInputId = `percentage-input-${field.field_id}`;

    // Get placeholder
    const placeholder = field.placeholder || '0';

    return (
      <div ref={ref} className={cn('space-y-3', className)}>
        {/* Field Label with Icon */}
        <div className="flex items-center gap-2">
          <Percent className="h-4 w-4 text-blue-500" />
          <Label htmlFor={percentageInputId} className="text-sm font-medium">
            {field.label}
            {isRequired && <span className="text-destructive ml-1">*</span>}
          </Label>
        </div>

        {/* Percentage Input */}
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
              error && 'border-destructive focus-visible:ring-destructive'
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
          {/* Percentage Symbol */}
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-600 font-bold text-xl pointer-events-none">
            %
          </span>
        </div>

        {/* Visual Progress Bar */}
        <div className="p-4 border border-blue-200 rounded-lg bg-blue-50/50">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Progress:</span>
              <span className="text-xs font-bold text-blue-600">{clampedValue.toFixed(1)}%</span>
            </div>

            <Progress 
              value={clampedValue} 
              max={max}
              className="h-4"
            />

            <div className="flex justify-between text-[10px] text-muted-foreground">
              <span>{min}%</span>
              <span className="font-bold text-blue-600 text-sm">{clampedValue.toFixed(1)}%</span>
              <span>{max}%</span>
            </div>
          </div>
        </div>

        {/* Helper Text */}
        {field.helper_text && !error && (
          <p
            id={`${percentageInputId}-description`}
            className="text-xs text-muted-foreground"
          >
            {field.helper_text}
          </p>
        )}

        {/* Error Message */}
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
  }
);

PercentageInput.displayName = 'PercentageInput';

export default PercentageInput;
