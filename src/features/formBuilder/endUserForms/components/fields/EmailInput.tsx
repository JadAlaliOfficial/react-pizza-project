/**
 * ================================
 * EMAIL INPUT COMPONENT
 * ================================
 *
 * Production-ready Email Input field component.
 *
 * Responsibilities:
 * - Render email input with appropriate input type
 * - Emit email string changes via onChange callback
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
 * - Uses type="email" unless custom regex rule exists
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

// ================================
// LOCALIZATION
// ================================

const getLocalizedEmailConfig = (languageId?: number) => {
  if (languageId === 2) {
    // Arabic
    return {
      placeholder: 'أدخل عنوان البريد الإلكتروني',
      ruleWordSingular: 'قاعدة',
      ruleWordPlural: 'قواعد',
    };
  }

  if (languageId === 3) {
    // Spanish
    return {
      placeholder: 'Ingresa la dirección de correo',
      ruleWordSingular: 'regla',
      ruleWordPlural: 'reglas',
    };
  }

  // English (default)
  return {
    placeholder: 'Enter email address',
    ruleWordSingular: 'rule',
    ruleWordPlural: 'rules',
  };
};

// ================================
// COMPONENT
// ================================

/**
 * EmailInput Component
 *
 * Renders an email input with validation.
 * Integrates with form systems via onChange callback.
 * Supports forwardRef for scrolling to errors.
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
  ({ field, value, onChange, onBlur, error, disabled = false, className, languageId }, ref) => {
    const [localValue, setLocalValue] = useState<string>(() => {
      if (value) return value;

      if (field.current_value && typeof field.current_value === 'string') {
        return field.current_value;
      }

      return getDefaultEmailInputValue(field);
    });

    const isRequired =
      field.rules?.some((rule) => rule.rule_name === 'required') ?? false;

    const usesCustomRegex = hasRegexRule(field);

    const ruleCount =
      field.rules?.filter((rule) => rule.rule_name !== 'unique').length || 0;

    const {
      placeholder: localizedPlaceholder,
      ruleWordSingular,
      ruleWordPlural,
    } = getLocalizedEmailConfig(languageId);

    useEffect(() => {
      if (value !== undefined) {
        setLocalValue(value || '');
      }
    }, [value]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      setLocalValue(newValue);
      onChange(newValue);
    };

    const emailInputId = `email-input-${field.field_id}`;
    const placeholder = field.placeholder || localizedPlaceholder;

    const rulesLabel =
      ruleCount === 1
        ? `${ruleCount} ${ruleWordSingular}`
        : `${ruleCount} ${ruleWordPlural}`;

    return (
      <div ref={ref} className={cn('space-y-2', className)}>
        <div className="flex items-center gap-2">
          <Mail className="h-4 w-4 text-purple-500" />
          <Label htmlFor={emailInputId} className="text-sm font-medium">
            {field.label}
            {isRequired && <span className="text-destructive ml-1">*</span>}
          </Label>
          {ruleCount > 0 && (
            <span className="text-xs text-muted-foreground">
              ({rulesLabel})
            </span>
          )}
        </div>

        <Input
          id={emailInputId}
          type={usesCustomRegex ? 'text' : 'email'}
          value={localValue}
          onChange={handleInputChange}
          onBlur={onBlur}
          placeholder={placeholder}
          disabled={disabled}
          className={cn(
            'h-10',
            error && 'border-destructive focus-visible:ring-destructive',
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

        {field.helper_text && !error && (
          <p
            id={`${emailInputId}-description`}
            className="text-xs text-muted-foreground"
          >
            {field.helper_text}
          </p>
        )}

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
  },
);

EmailInput.displayName = 'EmailInput';

export default EmailInput;
