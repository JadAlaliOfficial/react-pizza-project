/**
 * ================================
 * EMAIL INPUT COMPONENT
 * ================================
 * Production-ready Email Input field component with:
 * - Dynamic configuration from API field data
 * - Zod validation based on field rules
 * - Email-specific validation (or custom regex)
 * - Starts with / ends with validation
 * - Same / different field comparison (handled at form level)
 * - ForwardRef support for parent scrolling
 */

import React, { useEffect, useState, forwardRef } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Mail } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { EmailInputProps } from './types/emailInputField.types';
import {
  getDefaultEmailInputValue,
  hasRegexRule,
} from './validation/emailInputValidation';

/**
 * EmailInput Component
 * 
 * Renders an email input with validation
 * Integrates with form systems via onChange callback
 * Supports forwardRef for scrolling to errors
 * 
 * @example
 * ```
 * <EmailInput
 *   ref={emailRef}
 *   field={fieldData}
 *   value={emailValue}
 *   onChange={(newValue) => setValue(newValue)}
 *   error={errors.email?.message}
 * />
 * ```
 */
export const EmailInput = forwardRef<HTMLDivElement, EmailInputProps>(
  ({ field, value, onChange, error, disabled = false, className }, ref) => {
    console.debug('[EmailInput] Rendering for field:', field.field_id);

    // Initialize with default value or current value
    const [localValue, setLocalValue] = useState<string>(() => {
      if (value) return value;
      
      if (field.current_value && typeof field.current_value === 'string') {
        return field.current_value;
      }
      
      return getDefaultEmailInputValue(field);
    });

    // Check if field is required
    const isRequired = field.rules?.some((rule) => rule.rule_name === 'required') ?? false;
    
    // Check if using custom regex instead of email validation
    const usesCustomRegex = hasRegexRule(field);

    // Update local value when external value changes
    useEffect(() => {
      if (value !== undefined) {
        setLocalValue(value || '');
      }
    }, [value]);

    /**
     * Handle input change
     */
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      setLocalValue(newValue);
      onChange(newValue);

      console.debug('[EmailInput] Value changed:', {
        fieldId: field.field_id,
        value: newValue,
      });
    };

    // Generate unique ID for accessibility
    const emailInputId = `email-input-${field.field_id}`;

    // Get placeholder
    const placeholder = field.placeholder || 'Enter email address';

    // Count rules (excluding unique which is server-side)
    const ruleCount = field.rules?.filter((rule) => rule.rule_name !== 'unique').length || 0;

    return (
      <div ref={ref} className={cn('space-y-2', className)}>
        {/* Field Label with Icon */}
        <div className="flex items-center gap-2">
          <Mail className="h-4 w-4 text-purple-500" />
          <Label htmlFor={emailInputId} className="text-sm font-medium">
            {field.label}
            {isRequired && <span className="text-destructive ml-1">*</span>}
          </Label>
          {ruleCount > 0 && (
            <span className="text-xs text-muted-foreground">
              ({ruleCount} rule{ruleCount !== 1 ? 's' : ''})
            </span>
          )}
        </div>

        {/* Email Input */}
        <Input
          id={emailInputId}
          type={usesCustomRegex ? 'text' : 'email'}
          value={localValue}
          onChange={handleInputChange}
          placeholder={placeholder}
          disabled={disabled}
          className={cn(
            'h-10',
            error && 'border-destructive focus-visible:ring-destructive'
          )}
          aria-label={field.label}
          aria-required={isRequired}
          aria-invalid={!!error}
          aria-describedby={
            error
              ? `${emailInputId}-error`
              : field.helper_text
              ? `${emailInputId}-description`
              : undefined
          }
        />

        {/* Helper Text */}
        {field.helper_text && !error && (
          <p
            id={`${emailInputId}-description`}
            className="text-xs text-muted-foreground"
          >
            {field.helper_text}
          </p>
        )}

        {/* Error Message */}
        {error && (
          <p
            id={`${emailInputId}-error`}
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

EmailInput.displayName = 'EmailInput';

export default EmailInput;
