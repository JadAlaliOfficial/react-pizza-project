/**
 * ================================
 * NUMBER INPUT COMPONENT
 * ================================
 * Production-ready Number Input field component with:
 * - Dynamic configuration from API field data
 * - Zod validation based on field rules
 * - Integer vs numeric handling (numeric takes priority)
 * - Min/max validation with conflict resolution
 * - Same/different cross-field validation (at form level)
 * - ForwardRef support for parent scrolling
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

/**
 * NumberInput Component
 * 
 * Renders a number input with validation
 * Integrates with form systems via onChange callback
 * Supports forwardRef for scrolling to errors
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
  ({ field, value, onChange, error, disabled = false, className }, ref) => {
    console.debug('[NumberInput] Rendering for field:', field.field_id);

    // State for display value (string during editing, number when not focused)
    const [displayValue, setDisplayValue] = useState<string>('');
    const [isFocused, setIsFocused] = useState<boolean>(false);

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
        initialValue = getDefaultNumberInputValue(field);
      }

      setDisplayValue(initialValue.toString());
    }, [field, value, isFocused]);

    // Check if field is required
    const isRequired = field.rules?.some((rule) => rule.rule_name === 'required') ?? false;

    // Get step value (1 for integer, any for decimal)
    const step = getStepValue(field);

    /**
     * Handle input change - allow free typing
     */
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const input = e.target.value;

      // Allow empty, numbers, decimal point, and negative sign
      if (input === '' || input === '.' || input === '-' || /^-?\d*\.?\d*$/.test(input)) {
        setDisplayValue(input);

        // Parse and send numeric value to parent
        if (input === '' || input === '.' || input === '-') {
          onChange(0);
        } else {
          const numericValue = parseFloat(input);
          if (!isNaN(numericValue)) {
            onChange(numericValue);
          }
        }
      }

      console.debug('[NumberInput] Value changed:', {
        fieldId: field.field_id,
        input,
        numeric: input ? parseFloat(input) : 0,
      });
    };

    /**
     * Handle blur - format value
     */
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
    const numberInputId = `number-input-${field.field_id}`;

    // Get placeholder
    const placeholder = field.placeholder || '0';

    return (
      <div ref={ref} className={cn('space-y-2', className)}>
        {/* Field Label with Icon */}
        <Label htmlFor={numberInputId} className="text-sm font-medium flex items-center gap-2">
          <Hash className="h-4 w-4 text-green-500" />
          {field.label}
          {isRequired && <span className="text-destructive ml-1">*</span>}
        </Label>

        {/* Number Input */}
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
            error && 'border-destructive focus-visible:ring-destructive'
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

        {/* Helper Text */}
        {field.helper_text && !error && (
          <p
            id={`${numberInputId}-description`}
            className="text-xs text-muted-foreground"
          >
            {field.helper_text}
          </p>
        )}

        {/* Error Message */}
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
  }
);

NumberInput.displayName = 'NumberInput';

export default NumberInput;
