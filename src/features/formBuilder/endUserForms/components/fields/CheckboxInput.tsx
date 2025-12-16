/**
 * ================================
 * CHECKBOX INPUT COMPONENT
 * ================================
 * Production-ready Checkbox field component with:
 * - Dynamic configuration from API field data
 * - Zod validation based on field rules
 * - Proper styling matching preview component
 * - Required checkbox validation (must be checked if required)
 * - Accessibility support
 * - ForwardRef support for parent scrolling
 */

import { useEffect, useState, forwardRef } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import type { CheckboxInputProps } from './types/checkboxField.types';
import {
  getDefaultCheckboxValue,
  convertAPIValueToCheckbox,
} from './validation/checkboxValidation';

/**
 * CheckboxInput Component
 * 
 * Renders a single checkbox with label and validation
 * Integrates with form systems via onChange callback
 * Supports forwardRef for scrolling to errors
 * 
 * @example
 * ```
 * <CheckboxInput
 *   ref={checkboxRef}
 *   field={fieldData}
 *   value={checkboxValue}
 *   onChange={(newValue) => setValue(newValue)}
 *   error={errors.checkbox?.message}
 * />
 * ```
 */
export const CheckboxInput = forwardRef<HTMLDivElement, CheckboxInputProps>(
  ({ field, value, onChange, error, disabled = false, className }, ref) => {
    console.debug('[CheckboxInput] Rendering for field:', field.field_id);

    // Initialize with default value or current value
    const [localValue, setLocalValue] = useState<boolean>(() => {
      if (typeof value === 'boolean') return value;
      
      if (field.current_value !== null && field.current_value !== undefined) {
        const currentVal = field.current_value;
        if (
          typeof currentVal === 'boolean' ||
          typeof currentVal === 'number' ||
          typeof currentVal === 'string'
        ) {
          return convertAPIValueToCheckbox(currentVal);
        }
      }
      
      return getDefaultCheckboxValue(field);
    });

    // Check if field is required
    const isRequired = field.rules?.some((rule) => rule.rule_name === 'required') ?? false;

    // Update local value when external value changes
    useEffect(() => {
      if (typeof value === 'boolean') {
        setLocalValue(value);
      }
    }, [value]);

    /**
     * Handle checkbox change
     */
    const handleChange = (checked: boolean) => {
      setLocalValue(checked);
      onChange(checked);

      console.debug('[CheckboxInput] Checkbox changed:', {
        fieldId: field.field_id,
        checked,
      });
    };

    // Generate unique ID for accessibility
    const checkboxId = `checkbox-${field.field_id}`;

    return (
      <div ref={ref} className={cn('space-y-2', className)}>
        {/* Checkbox with Label */}
        <div className="flex items-start space-x-3">
          {/* Required Indicator */}
          {isRequired && (
            <span className="text-destructive text-sm font-medium pt-0.5">*</span>
          )}

          {/* Checkbox */}
          <Checkbox
            id={checkboxId}
            checked={localValue}
            onCheckedChange={handleChange}
            disabled={disabled}
            aria-required={isRequired}
            aria-invalid={!!error}
            aria-describedby={
              error ? `${checkboxId}-error` : field.helper_text ? `${checkboxId}-description` : undefined
            }
            className={cn(
              'mt-0.5',
              error && 'border-destructive data-[state=checked]:bg-destructive'
            )}
          />

          {/* Label */}
          <div className="flex-1 space-y-1">
            <Label
              htmlFor={checkboxId}
              className={cn(
                'text-sm font-medium cursor-pointer leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
                error && 'text-destructive'
              )}
            >
              {field.label}
            </Label>

            {/* Helper Text */}
            {field.helper_text && !error && (
              <p
                id={`${checkboxId}-description`}
                className="text-xs text-muted-foreground"
              >
                {field.helper_text}
              </p>
            )}

            {/* Error Message */}
            {error && (
              <p
                id={`${checkboxId}-error`}
                className="text-xs text-destructive font-medium"
                role="alert"
              >
                {error}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }
);

CheckboxInput.displayName = 'CheckboxInput';

export default CheckboxInput;
