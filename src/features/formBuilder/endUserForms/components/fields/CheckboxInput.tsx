/**
 * ================================
 * CHECKBOX INPUT COMPONENT
 * ================================
 *
 * Production-ready Checkbox field component.
 *
 * Responsibilities:
 * - Render single checkbox with label
 * - Emit boolean value changes via onChange callback
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
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import type { CheckboxInputProps } from './types/checkboxField.types';
import {
  getDefaultCheckboxValue,
  convertAPIValueToCheckbox,
} from './validation/checkboxValidation';

// ================================
// LOCALIZATION
// ================================

const getLocalizedCheckboxConfig = (languageId?: number) => {
  if (languageId === 2) {
    // Arabic
    return {
      ariaDescriptionSuffix: ' - خانة اختيار',
    };
  }

  if (languageId === 3) {
    // Spanish
    return {
      ariaDescriptionSuffix: ' - casilla de verificación',
    };
  }

  // English (default)
  return {
    ariaDescriptionSuffix: ' - checkbox',
  };
};

// ================================
// COMPONENT
// ================================

/**
 * CheckboxInput Component
 *
 * Renders a single checkbox with label and validation.
 * Integrates with form systems via onChange callback.
 * Supports forwardRef for scrolling to errors.
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
  ({ field, value, onChange, error, disabled = false, className, languageId, onBlur }, ref) => {
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

    const { ariaDescriptionSuffix } = getLocalizedCheckboxConfig(languageId);

    const isRequired =
      field.rules?.some((rule) => rule.rule_name === 'required') ?? false;

    useEffect(() => {
      if (typeof value === 'boolean') {
        setLocalValue(value);
      }
    }, [value]);

    const handleChange = (checked: boolean) => {
      setLocalValue(checked);
      onChange(checked);
    };

    const handleBlur = () => {
      if (onBlur) {
        onBlur();
      }
    };

    const checkboxId = `checkbox-${field.field_id}`;

    return (
      <div ref={ref} className={cn('space-y-2', className)}>
        <div className="flex items-start space-x-3">
          {isRequired && (
            <span className="text-destructive text-sm font-medium pt-0.5">
              *
            </span>
          )}

          <Checkbox
            id={checkboxId}
            checked={localValue}
            onCheckedChange={handleChange}
            onBlur={handleBlur}
            disabled={disabled}
            aria-required={isRequired}
            aria-invalid={!!error}
            aria-describedby={
              error
                ? `${checkboxId}-error`
                : field.helper_text
                  ? `${checkboxId}-description`
                  : undefined
            }
            aria-label={`${field.label}${ariaDescriptionSuffix}`}
            className={cn(
              'mt-0.5',
              error && 'border-destructive data-[state=checked]:bg-destructive',
            )}
          />

          <div className="flex-1 space-y-1">
            <Label
              htmlFor={checkboxId}
              className={cn(
                'text-sm font-medium cursor-pointer leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
                error && 'text-destructive',
              )}
            >
              {field.label}
            </Label>

            {field.helper_text && !error && (
              <p
                id={`${checkboxId}-description`}
                className="text-xs text-muted-foreground"
              >
                {field.helper_text}
              </p>
            )}

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
  },
);

CheckboxInput.displayName = 'CheckboxInput';

export default CheckboxInput;
