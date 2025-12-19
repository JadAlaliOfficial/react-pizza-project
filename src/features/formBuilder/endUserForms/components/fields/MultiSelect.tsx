/**
 * ================================
 * MULTI-SELECT COMPONENT
 * ================================
 *
 * Production-ready Multi-Select field component.
 *
 * Responsibilities:
 * - Render checkbox list for multiple selections
 * - Emit array of selected values via onChange callback
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
 * - Local state for controlled checkbox behavior
 * - Options parsed from field.placeholder (JSON format)
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

// ================================
// LOCALIZATION
// ================================

const getLocalizedMultiSelectConfig = (languageId?: number) => {
  if (languageId === 2) {
    // Arabic
    return {
      noOptionsText: 'لا توجد خيارات متاحة لهذا الحقل متعدد الاختيارات',
      selectedSingular: 'عنصر محدد',
      selectedPlural: 'عناصر محددة',
      ariaSuffix: ' - حقل اختيار متعدد',
    };
  }

  if (languageId === 3) {
    // Spanish
    return {
      noOptionsText: 'No hay opciones disponibles para este campo de selección múltiple',
      selectedSingular: 'elemento seleccionado',
      selectedPlural: 'elementos seleccionados',
      ariaSuffix: ' - campo de selección múltiple',
    };
  }

  // English (default)
  return {
    noOptionsText: 'No options available for this multi-select field',
    selectedSingular: 'item selected',
    selectedPlural: 'items selected',
    ariaSuffix: ' - multi-select field',
  };
};

// ================================
// COMPONENT
// ================================

/**
 * MultiSelect Component
 *
 * Renders a multi-select field with checkboxes for each option.
 * Integrates with form systems via onChange callback.
 * Supports forwardRef for scrolling to errors.
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
  ({ field, value, onChange, error, disabled = false, className, languageId }, ref) => {
    const options = parseMultiSelectOptions(field);

    const [localValue, setLocalValue] = useState<string[]>(() => {
      if (value && Array.isArray(value)) return value;

      if (field.current_value && Array.isArray(field.current_value)) {
        return field.current_value.filter(
          (val: any) => typeof val === 'string' && options.includes(val),
        );
      }

      return getDefaultMultiSelectValue(field);
    });

    const isRequired =
      field.rules?.some((rule) => rule.rule_name === 'required') ?? false;

    const {
      noOptionsText,
      selectedSingular,
      selectedPlural,
      ariaSuffix,
    } = getLocalizedMultiSelectConfig(languageId);

    useEffect(() => {
      if (value !== undefined && Array.isArray(value)) {
        setLocalValue(value);
      }
    }, [value]);

    const handleOptionChange = (optionValue: string, checked: boolean) => {
      let newValue: string[];

      if (checked) {
        newValue = [...localValue, optionValue];
      } else {
        newValue = localValue.filter((val) => val !== optionValue);
      }

      setLocalValue(newValue);
      onChange(newValue);
    };

    const isOptionSelected = (optionValue: string): boolean => {
      return localValue.includes(optionValue);
    };

    const multiSelectId = `multi-select-${field.field_id}`;

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
      <div ref={ref} className={cn('space-y-3', className)}>
        <div className="flex items-center gap-2">
          <CheckSquare className="h-4 w-4 text-indigo-500" />
          <Label className="text-sm font-medium" id={multiSelectId}>
            {field.label}
            {isRequired && <span className="text-destructive ml-1">*</span>}
          </Label>
        </div>

        <div
          className={cn(
            'space-y-3 p-4 border rounded-lg',
            error ? 'border-destructive bg-destructive/5' : 'bg-muted/30',
          )}
          role="group"
          aria-labelledby={multiSelectId}
          aria-label={`${field.label}${ariaSuffix}`}
          aria-required={isRequired}
          aria-invalid={!!error}
        >
          {options.map((option, index) => {
            const optionId = `${multiSelectId}-option-${index}`;
            const checked = isOptionSelected(option);

            return (
              <div
                key={`${option}-${index}`}
                className="flex items-start space-x-3"
              >
                <Checkbox
                  id={optionId}
                  checked={checked}
                  onCheckedChange={(checkedState) => {
                    const isChecked = checkedState === true;
                    handleOptionChange(option, isChecked);
                  }}
                  disabled={disabled}
                  className={cn('mt-0.5', error && 'border-destructive')}
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

        {localValue.length > 0 && !error && (
          <p className="text-xs text-muted-foreground">
            {localValue.length}{' '}
            {localValue.length === 1 ? selectedSingular : selectedPlural}
          </p>
        )}

        {field.helper_text && !error && (
          <p className="text-xs text-muted-foreground">{field.helper_text}</p>
        )}

        {error && (
          <p className="text-xs text-destructive font-medium" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  },
);

MultiSelect.displayName = 'MultiSelect';

export default MultiSelect;
