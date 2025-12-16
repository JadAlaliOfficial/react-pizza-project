/**
 * ================================
 * MULTI-SELECT COMPONENT
 * ================================
 * Production-ready Multi-Select field component with:
 * - Dynamic configuration from API field data
 * - Zod validation based on field rules
 * - Checkbox list for multiple selections
 * - Options parsed from placeholder JSON
 * - Default selections support
 * - ForwardRef support for parent scrolling
 */

import { useEffect, useState, forwardRef } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { CheckSquare } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { MultiSelectProps } from './types/multiSelectField.types';
import {
  getDefaultMultiSelectValue,
  parseMultiSelectOptions,
} from './validation/multiSelectValidation';

/**
 * MultiSelect Component
 * 
 * Renders a multi-select field with checkboxes for each option
 * Integrates with form systems via onChange callback
 * Supports forwardRef for scrolling to errors
 * 
 * @example
 * ```
 * <MultiSelect
 *   ref={multiSelectRef}
 *   field={fieldData}
 *   value={selectedValues}
 *   onChange={(newValues) => setValue(newValues)}
 *   error={errors.multiSelect?.message}
 * />
 * ```
 */
export const MultiSelect = forwardRef<HTMLDivElement, MultiSelectProps>(
  ({ field, value, onChange, error, disabled = false, className }, ref) => {
    console.debug('[MultiSelect] Rendering for field:', field.field_id);

    // Parse options from placeholder
    const options = parseMultiSelectOptions(field);

    // Initialize with default value or current value
    const [localValue, setLocalValue] = useState<string[]>(() => {
      if (value && Array.isArray(value)) return value;
      
      if (field.current_value && Array.isArray(field.current_value)) {
        // Validate current values are in options
        return field.current_value.filter((val: any) => 
          typeof val === 'string' && options.includes(val)
        );
      }
      
      return getDefaultMultiSelectValue(field);
    });

    // Check if field is required
    const isRequired = field.rules?.some((rule) => rule.rule_name === 'required') ?? false;

    // Update local value when external value changes
    useEffect(() => {
      if (value !== undefined && Array.isArray(value)) {
        setLocalValue(value);
      }
    }, [value]);

    /**
     * Handle checkbox change for an option
     */
    const handleOptionChange = (optionValue: string, checked: boolean) => {
      let newValue: string[];

      if (checked) {
        // Add option to selected values
        newValue = [...localValue, optionValue];
      } else {
        // Remove option from selected values
        newValue = localValue.filter((val) => val !== optionValue);
      }

      setLocalValue(newValue);
      onChange(newValue);

      console.debug('[MultiSelect] Selection changed:', {
        fieldId: field.field_id,
        selectedValues: newValue,
      });
    };

    /**
     * Check if an option is selected
     */
    const isOptionSelected = (optionValue: string): boolean => {
      return localValue.includes(optionValue);
    };

    // Generate unique ID for accessibility
    const multiSelectId = `multi-select-${field.field_id}`;

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
              No options available for this multi-select field
            </p>
          </div>
        </div>
      );
    }

    return (
      <div ref={ref} className={cn('space-y-3', className)}>
        {/* Field Label with Icon */}
        <div className="flex items-center gap-2">
          <CheckSquare className="h-4 w-4 text-indigo-500" />
          <Label className="text-sm font-medium">
            {field.label}
            {isRequired && <span className="text-destructive ml-1">*</span>}
          </Label>
        </div>

        {/* Checkbox Options */}
        <div
          className={cn(
            'space-y-3 p-4 border rounded-lg',
            error ? 'border-destructive bg-destructive/5' : 'bg-muted/30'
          )}
          role="group"
          aria-labelledby={multiSelectId}
          aria-required={isRequired}
          aria-invalid={!!error}
        >
          {options.map((option, index) => {
            const optionId = `${multiSelectId}-option-${index}`;
            const checked = isOptionSelected(option);

            return (
              <div key={`${option}-${index}`} className="flex items-start space-x-3">
                <Checkbox
                  id={optionId}
                  checked={checked}
                  onCheckedChange={(checkedState) => {
                    const isChecked = checkedState === true;
                    handleOptionChange(option, isChecked);
                  }}
                  disabled={disabled}
                  className={cn(
                    'mt-0.5',
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

        {/* Selection Count */}
        {localValue.length > 0 && !error && (
          <p className="text-xs text-muted-foreground">
            {localValue.length} {localValue.length === 1 ? 'item' : 'items'} selected
          </p>
        )}

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

MultiSelect.displayName = 'MultiSelect';

export default MultiSelect;
