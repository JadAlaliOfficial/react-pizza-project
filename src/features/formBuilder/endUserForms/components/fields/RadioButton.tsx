/**
 * ================================
 * RADIO BUTTON COMPONENT
 * ================================
 * Production-ready Radio Button field component with:
 * - Dynamic configuration from API field data
 * - Zod validation based on field rules
 * - Radio group for single selection
 * - Options parsed from placeholder JSON
 * - Default selection support
 * - ForwardRef support for parent scrolling
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

/**
 * RadioButton Component
 * 
 * Renders a radio button group for single selection
 * Integrates with form systems via onChange callback
 * Supports forwardRef for scrolling to errors
 * 
 * @example
 * ```
 * <RadioButton
 *   ref={radioRef}
 *   field={fieldData}
 *   value={selectedValue}
 *   onChange={(newValue) => setValue(newValue)}
 *   error={errors.radio?.message}
 * />
 * ```
 */
export const RadioButton = forwardRef<HTMLDivElement, RadioButtonProps>(
  ({ field, value, onChange, error, disabled = false, className }, ref) => {
    console.debug('[RadioButton] Rendering for field:', field.field_id);

    // Parse options from placeholder
    const options = parseRadioButtonOptions(field);

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
    const isRequired = field.rules?.some((rule) => rule.rule_name === 'required') ?? false;

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

      console.debug('[RadioButton] Selection changed:', {
        fieldId: field.field_id,
        selectedValue: newValue,
      });
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
              No options available for this radio button field
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
          <Label className="text-sm font-medium">
            {field.label}
            {isRequired && <span className="text-destructive ml-1">*</span>}
          </Label>
        </div>

        {/* Radio Group */}
        <RadioGroup
          value={localValue}
          onValueChange={handleValueChange}
          disabled={disabled}
          className={cn(error && 'border border-destructive rounded-lg p-3 bg-destructive/5')}
          aria-labelledby={radioGroupId}
          aria-required={isRequired}
          aria-invalid={!!error}
        >
          <div className="space-y-3">
            {options.map((option, index) => {
              const optionId = `${radioGroupId}-option-${index}`;

              return (
                <div key={`${option}-${index}`} className="flex items-center space-x-3">
                  <RadioGroupItem
                    value={option}
                    id={optionId}
                    className={cn(
                      error && 'border-destructive'
                    )}
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
  }
);

RadioButton.displayName = 'RadioButton';

export default RadioButton;
