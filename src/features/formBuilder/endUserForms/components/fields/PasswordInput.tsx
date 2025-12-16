/**
 * ================================
 * PASSWORD INPUT COMPONENT
 * ================================
 * Production-ready Password Input field component with:
 * - Dynamic configuration from API field data
 * - Zod validation based on field rules
 * - Toggle visibility (show/hide password)
 * - Password strength indicator
 * - Same / different field comparison (handled at form level)
 * - ForwardRef support for parent scrolling
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

/**
 * PasswordInput Component
 * 
 * Renders a password input with visibility toggle and strength indicator
 * Integrates with form systems via onChange callback
 * Supports forwardRef for scrolling to errors
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
  ({ field, value, onChange, error, disabled = false, className }, ref) => {
    console.debug('[PasswordInput] Rendering for field:', field.field_id);

    // State for password visibility and strength
    const [showPassword, setShowPassword] = useState<boolean>(false);
    const [localValue, setLocalValue] = useState<string>(() => {
      if (value) return value;
      
      if (field.current_value && typeof field.current_value === 'string') {
        return field.current_value;
      }
      
      return getDefaultPasswordInputValue(field);
    });

    // Check if field is required
    const isRequired = field.rules?.some((rule) => rule.rule_name === 'required') ?? false;

    // Calculate password strength
    const strength = calculatePasswordStrength(localValue);
    const strengthBars = getPasswordStrengthBars(strength);
    const strengthColor = getPasswordStrengthColor(strength);
    const strengthTextColor = getPasswordStrengthTextColor(strength);

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

      console.debug('[PasswordInput] Value changed:', {
        fieldId: field.field_id,
        length: newValue.length,
        strength: calculatePasswordStrength(newValue),
      });
    };

    /**
     * Toggle password visibility
     */
    const togglePasswordVisibility = () => {
      setShowPassword((prev) => !prev);
    };

    // Generate unique ID for accessibility
    const passwordInputId = `password-input-${field.field_id}`;

    // Get placeholder
    const placeholder = field.placeholder || 'Enter password...';

    return (
      <div ref={ref} className={cn('space-y-2', className)}>
        {/* Field Label with Icon */}
        <div className="flex items-center gap-2">
          <Lock className="h-4 w-4 text-red-500" />
          <Label htmlFor={passwordInputId} className="text-sm font-medium">
            {field.label}
            {isRequired && <span className="text-destructive ml-1">*</span>}
          </Label>
        </div>

        {/* Password Input with Toggle Visibility */}
        <div className="relative">
          {/* Lock Icon */}
          <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
            <Lock className="h-4 w-4 text-red-500" />
          </div>

          {/* Input */}
          <Input
            id={passwordInputId}
            type={showPassword ? 'text' : 'password'}
            value={localValue}
            onChange={handleInputChange}
            placeholder={placeholder}
            disabled={disabled}
            className={cn(
              'pl-9 pr-10 h-10',
              error && 'border-destructive focus-visible:ring-destructive'
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

          {/* Toggle Visibility Button */}
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={togglePasswordVisibility}
            disabled={disabled}
            className="absolute right-1 top-1/2 -translate-y-1/2 h-8 px-2 hover:bg-transparent"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4 text-muted-foreground" />
            ) : (
              <Eye className="h-4 w-4 text-muted-foreground" />
            )}
          </Button>
        </div>

        {/* Password Strength Indicator */}
        {localValue && localValue.length > 0 && !error && (
          <div className="space-y-1">
            <div className="flex gap-1">
              {[1, 2, 3, 4].map((bar) => (
                <div
                  key={bar}
                  className={cn(
                    'h-1.5 flex-1 rounded-full transition-colors',
                    bar <= strengthBars ? strengthColor : 'bg-muted'
                  )}
                />
              ))}
            </div>
            <p className="text-[10px] text-muted-foreground">
              Password strength:{' '}
              <span className={cn('font-medium capitalize', strengthTextColor)}>
                {strength}
              </span>
            </p>
          </div>
        )}

        {/* Helper Text */}
        {field.helper_text && !error && (
          <p
            id={`${passwordInputId}-description`}
            className="text-xs text-muted-foreground"
          >
            {field.helper_text}
          </p>
        )}

        {/* Error Message */}
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
  }
);

PasswordInput.displayName = 'PasswordInput';

export default PasswordInput;
