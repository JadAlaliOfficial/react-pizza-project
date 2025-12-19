/**
 * ================================
 * RADIO BUTTON COMPONENT
 * ================================
 *
 * Production-ready Radio Button field component.
 *
 * Responsibilities:
 * - Render radio button group for single selection
 * - Emit changes via onChange callback
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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Circle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { RadioButtonProps } from './types/radioButtonField.types';
import {
  getDefaultRadioButtonValue,
  parseRadioButtonOptions,
} from './validation/radioButtonValidation';

// ================================
// LOCALIZATION
// ================================

const getLocalizedRadioConfig = (languageId?: number) => {
  if (languageId === 2) {
    // Arabic
    return {
      noOptionsText: 'لا توجد خيارات متاحة لهذا الحقل من نوع زر الاختيار',
      ariaSuffix: ' - مجموعة أزرار اختيار',
    };
  }

  if (languageId === 3) {
    // Spanish
    return {
      noOptionsText:
        'No hay opciones disponibles para este campo de botón de opción',
      ariaSuffix: ' - grupo de botones de opción',
    };
  }

  // English (default)
  return {
    noOptionsText: 'No options available for this radio button field',
    ariaSuffix: ' - radio button group',
  };
};

// ================================
// COMPONENT
// ================================

export const RadioButton = forwardRef<HTMLDivElement, RadioButtonProps>(
  ({ field, value, onChange, error, disabled = false, className, languageId }, ref) => {
    // Parse options from placeholder
    const options = parseRadioButtonOptions(field);

    const { noOptionsText, ariaSuffix } = getLocalizedRadioConfig(languageId);

    // Initialize with default value or current value
    const [localValue, setLocalValue] = useState<string>(() => {
      if (value) return value;

      if (field.current_value && typeof field.current_value === 'string') {
        // Validate current value is in options
        if (options.includes(field.current_value)) {
          return field.current_value;
        }
      }

      return getDefaultRadioButtonValue(field);
    });

    // Check if field is required
    const isRequired =
      field.rules?.some((rule) => rule.rule_name === 'required') ?? false;

    // Update local value when external value changes
    useEffect(() => {
      if (value !== undefined) {
        setLocalValue(value || '');
      }
    }, [value]);

    /**
     * Handle radio selection change
     */
    const handleValueChange = (newValue: string) => {
      setLocalValue(newValue);
      onChange(newValue);
    };

    // Generate unique ID for accessibility
    const radioGroupId = `radio-group-${field.field_id}`;

    // If no options, show warning
    if (options.length === 0) {
      return (
        <div ref={ref} className={cn('space-y-2', className)}>
          <Label className="text-sm font-medium text-muted-foreground">
            {field.label}
            {isRequired && <span className="text-destructive ml-1">*</span>}
          </Label>
          <div className="p-3 border border-yellow-300 bg-yellow-50 rounded-md">
            <p className="text-xs text-yellow-800">
              {noOptionsText}
            </p>
          </div>
        </div>
      );
    }

    return (
      <div ref={ref} className={cn('space-y-2', className)}>
        {/* Field Label with Icon */}
        <div className="flex items-center gap-2">
          <Circle className="h-4 w-4 text-cyan-500" />
          <Label className="text-sm font-medium" id={radioGroupId}>
            {field.label}
            {isRequired && <span className="text-destructive ml-1">*</span>}
          </Label>
        </div>

        {/* Radio Group */}
        <RadioGroup
          value={localValue}
          onValueChange={handleValueChange}
          disabled={disabled}
          className={cn(
            error && 'border border-destructive rounded-lg p-3 bg-destructive/5',
          )}
          aria-labelledby={radioGroupId}
          aria-label={`${field.label}${ariaSuffix}`}
          aria-required={isRequired}
          aria-invalid={!!error}
        >
          <div className="space-y-3">
            {options.map((option, index) => {
              const optionId = `${radioGroupId}-option-${index}`;

              return (
                <div
                  key={`${option}-${index}`}
                  className="flex items-center space-x-3"
                >
                  <RadioGroupItem
                    value={option}
                    id={optionId}
                    className={cn(error && 'border-destructive')}
                  />
                  <Label
                    htmlFor={optionId}
                    className="text-sm font-normal cursor-pointer leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {option}
                  </Label>
                </div>
              );
            })}
          </div>
        </RadioGroup>

        {/* Helper Text */}
        {field.helper_text && !error && (
          <p className="text-xs text-muted-foreground">{field.helper_text}</p>
        )}

        {/* Error Message */}
        {error && (
          <p className="text-xs text-destructive font-medium" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  },
);

RadioButton.displayName = 'RadioButton';

export default RadioButton;
