/**
 * ================================
 * PASSWORD INPUT COMPONENT
 * ================================
 *
 * Production-ready Password Input field component.
 *
 * Responsibilities:
 * - Render password input with visibility toggle
 * - Display password strength indicator
 * - Emit password string changes via onChange callback
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
 * - Local state for password visibility and controlled input
 * - Strength calculation is UI-only (validation happens in engine)
 */

import React, { useEffect, useState, forwardRef } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Lock, Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { PasswordInputProps } from './types/passwordInputField.types';
import {
  getDefaultPasswordInputValue,
  calculatePasswordStrength,
  getPasswordStrengthColor,
  getPasswordStrengthTextColor,
  getPasswordStrengthBars,
} from './validation/passwordInputValidation';

// ================================
// LOCALIZATION
// ================================

const getLocalizedPasswordConfig = (languageId?: number) => {
  if (languageId === 2) {
    // Arabic
    return {
      placeholder: 'أدخل كلمة المرور...',
      showLabel: 'إظهار كلمة المرور',
      hideLabel: 'إخفاء كلمة المرور',
      strengthLabel: 'قوة كلمة المرور',
    };
  }

  if (languageId === 3) {
    // Spanish
    return {
      placeholder: 'Ingresa la contraseña...',
      showLabel: 'Mostrar contraseña',
      hideLabel: 'Ocultar contraseña',
      strengthLabel: 'Fortaleza de la contraseña',
    };
  }

  // English (default)
  return {
    placeholder: 'Enter password...',
    showLabel: 'Show password',
    hideLabel: 'Hide password',
    strengthLabel: 'Password strength',
  };
};

// ================================
// COMPONENT
// ================================

/**
 * PasswordInput Component
 *
 * Renders a password input with visibility toggle and strength indicator.
 * Integrates with form systems via onChange callback.
 * Supports forwardRef for scrolling to errors.
 *
 * @example
 * ```
 * <PasswordInput
 *   ref={passwordRef}
 *   field={fieldData}
 *   value={passwordValue}
 *   onChange={(newValue) => setValue(newValue)}
 *   error={errors.password?.message}
 * />
 * ```
 */
export const PasswordInput = forwardRef<HTMLDivElement, PasswordInputProps>(
  ({ field, value, onChange, error, disabled = false, className, languageId }, ref) => {
    const [showPassword, setShowPassword] = useState<boolean>(false);
    const [localValue, setLocalValue] = useState<string>(() => {
      if (value) return value;

      if (field.current_value && typeof field.current_value === 'string') {
        return field.current_value;
      }

      return getDefaultPasswordInputValue(field);
    });

    const isRequired =
      field.rules?.some((rule) => rule.rule_name === 'required') ?? false;

    const strength = calculatePasswordStrength(localValue);
    const strengthBars = getPasswordStrengthBars(strength);
    const strengthColor = getPasswordStrengthColor(strength);
    const strengthTextColor = getPasswordStrengthTextColor(strength);

    const {
      placeholder: localizedPlaceholder,
      showLabel,
      hideLabel,
      strengthLabel,
    } = getLocalizedPasswordConfig(languageId);

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

    const togglePasswordVisibility = () => {
      setShowPassword((prev) => !prev);
    };

    const passwordInputId = `password-input-${field.field_id}`;
    const placeholder = field.placeholder || localizedPlaceholder;

    return (
      <div ref={ref} className={cn('space-y-2', className)}>
        <div className="flex items-center gap-2">
          <Lock className="h-4 w-4 text-red-500" />
          <Label htmlFor={passwordInputId} className="text-sm font-medium">
            {field.label}
            {isRequired && <span className="text-destructive ml-1">*</span>}
          </Label>
        </div>

        <div className="relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
            <Lock className="h-4 w-4 text-red-500" />
          </div>

          <Input
            id={passwordInputId}
            type={showPassword ? 'text' : 'password'}
            value={localValue}
            onChange={handleInputChange}
            placeholder={placeholder}
            disabled={disabled}
            className={cn(
              'pl-9 pr-10 h-10',
              error && 'border-destructive focus-visible:ring-destructive',
            )}
            aria-label={field.label}
            aria-required={isRequired}
            aria-invalid={!!error}
            aria-describedby={
              error
                ? `${passwordInputId}-error`
                : field.helper_text
                  ? `${passwordInputId}-description`
                  : undefined
            }
          />

          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={togglePasswordVisibility}
            disabled={disabled}
            className="absolute right-1 top-1/2 -translate-y-1/2 h-8 px-2 hover:bg-transparent"
            aria-label={showPassword ? hideLabel : showLabel}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4 text-muted-foreground" />
            ) : (
              <Eye className="h-4 w-4 text-muted-foreground" />
            )}
          </Button>
        </div>

        {localValue && localValue.length > 0 && !error && (
          <div className="space-y-1">
            <div className="flex gap-1">
              {[1, 2, 3, 4].map((bar) => (
                <div
                  key={bar}
                  className={cn(
                    'h-1.5 flex-1 rounded-full transition-colors',
                    bar <= strengthBars ? strengthColor : 'bg-muted',
                  )}
                />
              ))}
            </div>
            <p className="text-[10px] text-muted-foreground">
              {strengthLabel}:{' '}
              <span
                className={cn('font-medium capitalize', strengthTextColor)}
              >
                {strength}
              </span>
            </p>
          </div>
        )}

        {field.helper_text && !error && (
          <p
            id={`${passwordInputId}-description`}
            className="text-xs text-muted-foreground"
          >
            {field.helper_text}
          </p>
        )}

        {error && (
          <p
            id={`${passwordInputId}-error`}
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

PasswordInput.displayName = 'PasswordInput';

export default PasswordInput;
