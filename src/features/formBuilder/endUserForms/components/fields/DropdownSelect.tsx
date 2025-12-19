/**
 * ================================
 * DROPDOWN SELECT COMPONENT
 * ================================
 *
 * Production-ready Dropdown Select field component.
 *
 * Responsibilities:
 * - Render dropdown select with options from API configuration
 * - Emit selected value changes via onChange callback
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
 * - Local state for controlled select behavior
 * - Options parsed from field.placeholder (JSON format)
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

// ================================
// LOCALIZATION
// ================================

const getLocalizedDropdownConfig = (languageId?: number) => {
  if (languageId === 2) {
    // Arabic
    return {
      placeholder: 'اختر خيارًا...',
      noOptionsText: 'لا توجد خيارات متاحة لهذا القائمة',
      ariaSuffix: ' - قائمة منسدلة',
    };
  }

  if (languageId === 3) {
    // Spanish
    return {
      placeholder: 'Selecciona una opción...',
      noOptionsText: 'No hay opciones disponibles para este menú',
      ariaSuffix: ' - menú desplegable',
    };
  }

  // English (default)
  return {
    placeholder: 'Select an option...',
    noOptionsText: 'No options available for this dropdown',
    ariaSuffix: ' - dropdown',
  };
};

// ================================
// COMPONENT
// ================================

/**
 * DropdownSelect Component
 *
 * Renders a dropdown select with options from API configuration.
 * Integrates with form systems via onChange callback.
 * Supports forwardRef for scrolling to errors.
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
  ({ field, value, onChange, error, disabled = false, className, languageId }, ref) => {
    const options = parseDropdownOptions(field);

    const [localValue, setLocalValue] = useState<string>(() => {
      if (value) return value;

      if (field.current_value && typeof field.current_value === 'string') {
        if (options.includes(field.current_value)) {
          return field.current_value;
        }
      }

      return getDefaultDropdownSelectValue(field);
    });

    const isRequired =
      field.rules?.some((rule) => rule.rule_name === 'required') ?? false;

    const { placeholder, noOptionsText, ariaSuffix } =
      getLocalizedDropdownConfig(languageId);

    useEffect(() => {
      // Only sync from outside if value is actually provided (not just empty default)
      if (value !== undefined && value !== null) {
        setLocalValue(value);
      }
    }, [value]);

    const handleValueChange = (newValue: string) => {
      setLocalValue(newValue);
      onChange(newValue);
    };

    const dropdownId = `dropdown-select-${field.field_id}`;

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
        <div className="flex items-center gap-2">
          <ChevronDown className="h-4 w-4 text-sky-500" />
          <Label htmlFor={dropdownId} className="text-sm font-medium">
            {field.label}
            {isRequired && <span className="text-destructive ml-1">*</span>}
          </Label>
        </div>

        <Select
          value={localValue}
          onValueChange={handleValueChange}
          disabled={disabled}
        >
          <SelectTrigger
            id={dropdownId}
            className={cn(
              'h-10',
              error && 'border-destructive focus:ring-destructive',
            )}
            aria-label={`${field.label}${ariaSuffix}`}
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
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent>
            {options.map((option, index) => (
              <SelectItem key={`${option}-${index}`} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {field.helper_text && !error && (
          <p
            id={`${dropdownId}-description`}
            className="text-xs text-muted-foreground"
          >
            {field.helper_text}
          </p>
        )}

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
  },
);

DropdownSelect.displayName = 'DropdownSelect';

export default DropdownSelect;
