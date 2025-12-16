/**
 * ================================
 * PHONE INPUT COMPONENT
 * ================================
 * Production-ready Phone Input field component with:
 * - Dynamic configuration from API field data
 * - Zod validation based on field rules
 * - International phone number support (E.164 format)
 * - Auto-formatting as user types
 * - Country code prefix
 * - ForwardRef support for parent scrolling
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

/**
 * PhoneInput Component
 * 
 * Renders an international phone number input
 * Integrates with form systems via onChange callback
 * Supports forwardRef for scrolling to errors
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
  (
    {
      field,
      value,
      onChange,
      error,
      disabled = false,
      className,
    },
    ref
  ) => {
    console.debug('[PhoneInput] Rendering for field:', field.field_id);

    // Initialize with default value or current value
    const [localValue, setLocalValue] = useState<string>(() => {
      if (value !== null && value !== undefined) {
        return String(value);
      }
      
      if (field.current_value !== null && field.current_value !== undefined) {
        return String(field.current_value);
      }
      
      return getDefaultPhoneInputValue(field);
    });

    // Track if phone is valid for visual indicator
    const [isValid, setIsValid] = useState<boolean>(false);

    // Check if field is required
    const isRequired = field.rules?.some((rule) => rule.rule_name === 'required') ?? false;

    // Update local value when external value changes
    useEffect(() => {
      if (value !== null && value !== undefined) {
        setLocalValue(String(value));
      }
    }, [value]);

    // Validate phone when value changes
    useEffect(() => {
      setIsValid(localValue ? isValidPhoneFormat(cleanPhoneNumber(localValue)) : false);
    }, [localValue]);

    /**
     * Handle phone input change
     */
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      let newValue = e.target.value;
      
      // Auto-prepend + if user starts typing numbers
      if (newValue && !newValue.startsWith('+') && /^\d/.test(newValue)) {
        newValue = '+' + newValue;
      }
      
      setLocalValue(newValue);
      onChange(newValue);

      console.debug('[PhoneInput] Value changed:', {
        fieldId: field.field_id,
        value: newValue,
      });
    };

    /**
     * Handle blur - clean and validate
     */
    const handleBlur = () => {
      if (localValue) {
        const cleaned = cleanPhoneNumber(localValue);
        if (cleaned !== localValue) {
          setLocalValue(cleaned);
          onChange(cleaned);

          console.debug('[PhoneInput] Cleaned on blur:', {
            fieldId: field.field_id,
            original: localValue,
            cleaned,
          });
        }
      }
    };

    // Generate unique ID for accessibility
    const phoneInputId = `phone-input-${field.field_id}`;

    // Get placeholder
    const placeholder = field.placeholder || '+1 (555) 123-4567';

    // Get formatted display (for helper text)
    const formattedPhone = isValid ? formatPhoneNumber(localValue) : null;

    return (
      <div ref={ref} className={cn('space-y-2', className)}>
        {/* Field Label with Icon */}
        <div className="flex items-center justify-between">
          <Label htmlFor={phoneInputId} className="text-sm font-medium flex items-center gap-2">
            <Phone className="h-4 w-4 text-emerald-500" />
            {field.label}
            {isRequired && <span className="text-destructive ml-1">*</span>}
          </Label>

          {/* International indicator */}
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Globe className="h-3 w-3" />
            <span>International</span>
          </div>
        </div>

        {/* Phone Input with Icon */}
        <div className="relative">
          {/* Phone Icon */}
          <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
            <Phone className="h-4 w-4 text-emerald-500" />
          </div>

          {/* Input Field */}
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
              error && 'border-destructive focus-visible:ring-destructive'
            )}
            aria-label={field.label}
            aria-required={isRequired}
            aria-invalid={!!error}
            aria-describedby={
              error
                ? `${phoneInputId}-error`
                : field.helper_text || formattedPhone
                ? `${phoneInputId}-description`
                : undefined
            }
          />
        </div>

        {/* Formatted Phone Display */}
        {formattedPhone && !error && (
          <div className="flex items-center gap-2 text-xs text-emerald-600">
            <span className="font-medium">Formatted:</span>
            <span className="font-mono">{formattedPhone}</span>
          </div>
        )}

        {/* Helper Text */}
        {field.helper_text && !error && (
          <p
            id={`${phoneInputId}-description`}
            className="text-xs text-muted-foreground"
          >
            {field.helper_text}
          </p>
        )}

        {/* Format Hint */}
        {!localValue && !error && !field.helper_text && (
          <p className="text-xs text-muted-foreground">
            Enter phone number with country code (e.g., +1 555 123 4567)
          </p>
        )}

        {/* Error Message */}
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
  }
);

PhoneInput.displayName = 'PhoneInput';

export default PhoneInput;
