/**
 * ================================
 * TEXT INPUT COMPONENT
 * ================================
 *
 * Production-ready Text Input field component.
 *
 * Responsibilities:
 * - Render text input
 * - Emit value via onChange callback
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
 */

import React, { useEffect, useState, forwardRef } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Type } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { TextInputProps } from './types/textInputField.types';
import {
  getDefaultTextInputValue,
} from './validation/textInputValidation';

/**
 * TextInput Component
 * 
 * Renders a text input with validation
 * Integrates with form systems via onChange callback
 * Supports forwardRef for scrolling to errors
 * 
 * @example
 * ```
 * <TextInput
 *   ref={textRef}
 *   field={fieldData}
 *   value={textValue}
 *   onChange={(newValue) => setValue(newValue)}
 *   error={errors.text?.message}
 * />
 * ```
 */
export const TextInput = forwardRef<HTMLDivElement, TextInputProps>(
  ({ field, value, onChange, error, disabled = false, className, languageId, onBlur }, ref) => {
    // Initialize with default value or current value
    const [localValue, setLocalValue] = useState<string>(() => {
      if (value) return value;
      
      if (field.current_value && typeof field.current_value === 'string') {
        return field.current_value;
      }
      
      return getDefaultTextInputValue(field);
    });

    // Helper: get localized strings
    const getLocalizedText = () => {
      if (languageId === 2) {
        return {
          placeholder: 'أدخل النص...',
          rulesLabel: 'قاعدة',
          rulesLabelPlural: 'قواعد',
        };
      }

      if (languageId === 3) {
        return {
          placeholder: 'Ingresa texto...',
          rulesLabel: 'regla',
          rulesLabelPlural: 'reglas',
        };
      }

      return {
        placeholder: 'Enter text...',
        rulesLabel: 'rule',
        rulesLabelPlural: 'rules',
      };
    };

    const { placeholder, rulesLabel, rulesLabelPlural } = getLocalizedText();

    // Check if field is required
    const isRequired = field.rules?.some((rule) => rule.rule_name === 'required') ?? false;

    // Update local value when external value changes
    useEffect(() => {
      if (value !== undefined) {
        setLocalValue(value || '');
      }
    }, [value, field.field_id]);

    /**
     * Handle input change
     */
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      setLocalValue(newValue);
      onChange(newValue);
    };

    // Generate unique ID for accessibility
    const textInputId = `text-input-${field.field_id}`;

    // Get placeholder (localized if no custom placeholder passed from field)
    const effectivePlaceholder =
      field.placeholder ||
      placeholder;

    // Count rules (excluding unique which is server-side)
    const ruleCount = field.rules?.filter((rule) => rule.rule_name !== 'unique').length || 0;

    // Localized rules count label
    const rulesCountLabel =
      ruleCount === 1
        ? `${ruleCount} ${rulesLabel}`
        : `${ruleCount} ${rulesLabelPlural}`;

    return (
      <div ref={ref} className={cn('space-y-2', className)}>
        {/* Field Label with Icon */}
        <div className="flex items-center gap-2">
          <Type className="h-4 w-4 text-blue-500" />
          <Label htmlFor={textInputId} className="text-sm font-medium">
            {field.label}
            {isRequired && <span className="text-destructive ml-1">*</span>}
          </Label>
          {ruleCount > 0 && (
            <span className="text-xs text-muted-foreground">
              ({rulesCountLabel})
            </span>
          )}
        </div>

        {/* Text Input */}
        <Input
          id={textInputId}
          type="text"
          value={localValue}
          onChange={handleInputChange}
          onBlur={onBlur}
          placeholder={effectivePlaceholder}
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
              ? `${textInputId}-error`
              : field.helper_text
              ? `${textInputId}-description`
              : undefined
          }
        />

        {/* Helper Text */}
        {field.helper_text && !error && (
          <p
            id={`${textInputId}-description`}
            className="text-xs text-muted-foreground"
          >
            {field.helper_text}
          </p>
        )}

        {/* Error Message */}
        {error && (
          <p
            id={`${textInputId}-error`}
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

TextInput.displayName = 'TextInput';

export default TextInput;
