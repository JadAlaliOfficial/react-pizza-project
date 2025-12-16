/**
 * ================================
 * DROPDOWN SELECT COMPONENT
 * ================================
 * Production-ready Dropdown Select field component with:
 * - Dynamic configuration from API field data
 * - Zod validation based on field rules
 * - Options parsed from placeholder JSON
 * - Native select styling with shadcn/ui
 * - ForwardRef support for parent scrolling
 */

import { useEffect, useState, forwardRef } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { DropdownSelectProps } from './types/dropdownSelectField.types';
import {
  getDefaultDropdownSelectValue,
  parseDropdownOptions,
} from './validation/dropdownSelectValidation';

/**
 * DropdownSelect Component
 * 
 * Renders a dropdown select with options from API configuration
 * Integrates with form systems via onChange callback
 * Supports forwardRef for scrolling to errors
 * 
 * @example
 * ```
 * <DropdownSelect
 *   ref={dropdownRef}
 *   field={fieldData}
 *   value={selectedValue}
 *   onChange={(newValue) => setValue(newValue)}
 *   error={errors.dropdown?.message}
 * />
 * ```
 */
export const DropdownSelect = forwardRef<HTMLDivElement, DropdownSelectProps>(
  ({ field, value, onChange, error, disabled = false, className }, ref) => {
    console.debug('[DropdownSelect] Rendering for field:', field.field_id);

    // Parse options from placeholder
    const options = parseDropdownOptions(field);

    // Initialize with default value or current value
    const [localValue, setLocalValue] = useState<string>(() => {
      if (value) return value;
      
      if (field.current_value && typeof field.current_value === 'string') {
        // Validate current value is in options
        if (options.includes(field.current_value)) {
          return field.current_value;
        }
      }
      
      return getDefaultDropdownSelectValue(field);
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
     * Handle dropdown value change
     */
    const handleValueChange = (newValue: string) => {
      setLocalValue(newValue);
      onChange(newValue);

      console.debug('[DropdownSelect] Value changed:', {
        fieldId: field.field_id,
        value: newValue,
      });
    };

    // Generate unique ID for accessibility
    const dropdownId = `dropdown-select-${field.field_id}`;

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
              No options available for this dropdown
            </p>
          </div>
        </div>
      );
    }

    return (
      <div ref={ref} className={cn('space-y-2', className)}>
        {/* Field Label with Icon */}
        <div className="flex items-center gap-2">
          <ChevronDown className="h-4 w-4 text-sky-500" />
          <Label htmlFor={dropdownId} className="text-sm font-medium">
            {field.label}
            {isRequired && <span className="text-destructive ml-1">*</span>}
          </Label>
        </div>

        {/* Dropdown Select */}
        <Select
          value={localValue}
          onValueChange={handleValueChange}
          disabled={disabled}
        >
          <SelectTrigger
            id={dropdownId}
            className={cn(
              'h-10',
              error && 'border-destructive focus:ring-destructive'
            )}
            aria-label={field.label}
            aria-required={isRequired}
            aria-invalid={!!error}
            aria-describedby={
              error
                ? `${dropdownId}-error`
                : field.helper_text
                ? `${dropdownId}-description`
                : undefined
            }
          >
            <SelectValue placeholder="Select an option..." />
          </SelectTrigger>
          <SelectContent>
            {options.map((option, index) => (
              <SelectItem key={`${option}-${index}`} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Helper Text */}
        {field.helper_text && !error && (
          <p
            id={`${dropdownId}-description`}
            className="text-xs text-muted-foreground"
          >
            {field.helper_text}
          </p>
        )}

        {/* Error Message */}
        {error && (
          <p
            id={`${dropdownId}-error`}
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

DropdownSelect.displayName = 'DropdownSelect';

export default DropdownSelect;
