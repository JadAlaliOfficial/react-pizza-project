/**
 * ================================
 * PHONE INPUT COMPONENT
 * ================================
 *
 * Production-ready Phone Input field component.
 *
 * Responsibilities:
 * - Render international phone number input
 * - Display formatted phone number
 * - Emit phone string changes via onChange callback
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
 * - Local state for controlled input and validity tracking
 * - Auto-cleans phone number on blur
 * - E.164 format support
 */

import React, { useEffect, useState, forwardRef } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Phone, Globe } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { PhoneInputProps } from './types/phoneInputField.types';
import {
  getDefaultPhoneInputValue,
  cleanPhoneNumber,
  formatPhoneNumber,
  isValidPhoneFormat,
} from './validation/phoneInputValidation';

// ================================
// LOCALIZATION
// ================================

const getLocalizedPhoneConfig = (languageId?: number) => {
  if (languageId === 2) {
    // Arabic
    return {
      placeholder: '+٩٦٦ ٥٥٥ ١٢٣ ٤٥٦',
      internationalLabel: 'دولي',
      helperHint:
        'أدخل رقم الهاتف مع رمز الدولة (مثال: ‎+٩٦٦ ٥٥٥ ١٢٣ ٤٥٦)',
      formattedLabel: 'منسّق:',
    };
  }

  if (languageId === 3) {
    // Spanish
    return {
      placeholder: '+34 612 345 678',
      internationalLabel: 'Internacional',
      helperHint:
        'Ingresa el número con código de país (p. ej., +34 612 345 678)',
      formattedLabel: 'Formateado:',
    };
  }

  // English (default)
  return {
    placeholder: '+1 (555) 123-4567',
    internationalLabel: 'International',
    helperHint:
      'Enter phone number with country code (e.g., +1 555 123 4567)',
    formattedLabel: 'Formatted:',
  };
};

// ================================
// COMPONENT
// ================================

/**
 * PhoneInput Component
 *
 * Renders an international phone number input.
 * Integrates with form systems via onChange callback.
 * Supports forwardRef for scrolling to errors.
 *
 * @example
 * ```
 * <PhoneInput
 *   ref={phoneRef}
 *   field={fieldData}
 *   value={phoneValue}
 *   onChange={(newValue) => setValue(newValue)}
 *   error={errors.phone?.message}
 * />
 * ```
 */
export const PhoneInput = forwardRef<HTMLDivElement, PhoneInputProps>(
  ({ field, value, onChange, error, disabled = false, className, languageId }, ref) => {
    const [localValue, setLocalValue] = useState<string>(() => {
      if (value !== null && value !== undefined) {
        return String(value);
      }

      if (field.current_value !== null && field.current_value !== undefined) {
        return String(field.current_value);
      }

      return getDefaultPhoneInputValue(field);
    });

    const [isValid, setIsValid] = useState<boolean>(false);

    const isRequired =
      field.rules?.some((rule) => rule.rule_name === 'required') ?? false;

    const {
      placeholder: localizedPlaceholder,
      internationalLabel,
      helperHint,
      formattedLabel,
    } = getLocalizedPhoneConfig(languageId);

    useEffect(() => {
      if (value !== null && value !== undefined) {
        setLocalValue(String(value));
      }
    }, [value]);

    useEffect(() => {
      setIsValid(
        localValue ? isValidPhoneFormat(cleanPhoneNumber(localValue)) : false,
      );
    }, [localValue]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;

      setLocalValue(newValue);
      onChange(newValue);
    };

    const handleBlur = () => {
      if (localValue) {
        const cleaned = cleanPhoneNumber(localValue);
        if (cleaned !== localValue) {
          setLocalValue(cleaned);
          onChange(cleaned);
        }
      }
    };

    const phoneInputId = `phone-input-${field.field_id}`;
    const placeholder = field.placeholder || localizedPlaceholder;
    const formattedPhone = isValid ? formatPhoneNumber(localValue) : null;

    const hasHelperDescription = !!field.helper_text || !!formattedPhone;

    return (
      <div ref={ref} className={cn('space-y-2', className)}>
        <div className="flex items-center justify-between">
          <Label
            htmlFor={phoneInputId}
            className="text-sm font-medium flex items-center gap-2"
          >
            <Phone className="h-4 w-4 text-emerald-500" />
            {field.label}
            {isRequired && <span className="text-destructive ml-1">*</span>}
          </Label>

          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Globe className="h-3 w-3" />
            <span>{internationalLabel}</span>
          </div>
        </div>

        <div className="relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
            <Phone className="h-4 w-4 text-emerald-500" />
          </div>

          <Input
            id={phoneInputId}
            type="tel"
            value={localValue}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder={placeholder}
            disabled={disabled}
            className={cn(
              'pl-9 font-mono',
              error && 'border-destructive focus-visible:ring-destructive',
            )}
            aria-label={field.label}
            aria-required={isRequired}
            aria-invalid={!!error}
            aria-describedby={
              error
                ? `${phoneInputId}-error`
                : hasHelperDescription
                  ? `${phoneInputId}-description`
                  : undefined
            }
          />
        </div>

        {formattedPhone && !error && (
          <div className="flex items-center gap-2 text-xs text-emerald-600">
            <span className="font-medium">{formattedLabel}</span>
            <span className="font-mono">{formattedPhone}</span>
          </div>
        )}

        {field.helper_text && !error && (
          <p
            id={`${phoneInputId}-description`}
            className="text-xs text-muted-foreground"
          >
            {field.helper_text}
          </p>
        )}

        {!localValue && !error && !field.helper_text && (
          <p
            id={`${phoneInputId}-description`}
            className="text-xs text-muted-foreground"
          >
            {helperHint}
          </p>
        )}

        {error && (
          <p
            id={`${phoneInputId}-error`}
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

PhoneInput.displayName = 'PhoneInput';

export default PhoneInput;
