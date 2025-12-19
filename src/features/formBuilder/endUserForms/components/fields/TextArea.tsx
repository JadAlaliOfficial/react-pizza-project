/**
 * ================================
 * TEXT AREA COMPONENT
 * ================================
 *
 * Production-ready Text Area field component.
 *
 * Responsibilities:
 * - Render multi-line text input
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
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { AlignLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { TextAreaProps } from './types/textAreaField.types';
import {
  getDefaultTextAreaValue,
  getCharacterCountInfo,
} from './validation/textAreaValidation';

// ================================
// LOCALIZATION
// ================================

const getLocalizedTextAreaConfig = (languageId?: number) => {
  if (languageId === 2) {
    // Arabic
    return {
      placeholder: 'أدخل نصك هنا...',
      ariaSuffix: ' - حقل نص متعدد الأسطر',
    };
  }

  if (languageId === 3) {
    // Spanish
    return {
      placeholder: 'Escribe tu texto aquí...',
      ariaSuffix: ' - campo de texto multilínea',
    };
  }

  // English (default)
  return {
    placeholder: 'Enter your text here...',
    ariaSuffix: ' - multi-line text field',
  };
};

/**
 * TextArea Component
 *
 * Renders a multi-line text input area
 * Integrates with form systems via onChange callback
 * Supports forwardRef for scrolling to errors
 *
 * @example
 * ```
 * <TextArea
 *   ref={textAreaRef}
 *   field={fieldData}
 *   value={textValue}
 *   onChange={(newValue) => setValue(newValue)}
 *   error={errors.textArea?.message}
 *   rows={4}
 * />
 * ```
 */
export const TextArea = forwardRef<HTMLDivElement, TextAreaProps>(
  (
    {
      field,
      value,
      onChange,
      error,
      disabled = false,
      className,
      rows = 4,
      languageId,
    },
    ref,
  ) => {
    // Initialize with default value or current value
    const [localValue, setLocalValue] = useState<string>(() => {
      if (value !== null && value !== undefined) {
        return String(value);
      }

      if (field.current_value !== null && field.current_value !== undefined) {
        return String(field.current_value);
      }

      return getDefaultTextAreaValue(field);
    });

    const isRequired =
      field.rules?.some((rule) => rule.rule_name === 'required') ?? false;

    const maxRule = field.rules?.find((rule) => rule.rule_name === 'max');
    const betweenRule = field.rules?.find(
      (rule) => rule.rule_name === 'between',
    );
    const hasMaxLength = !!(maxRule || betweenRule);

    useEffect(() => {
      if (value !== null && value !== undefined) {
        setLocalValue(String(value));
      }
    }, [value]);

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newValue = e.target.value;
      setLocalValue(newValue);
      onChange(newValue);
    };

    const textAreaId = `textarea-${field.field_id}`;

    const { placeholder: localizedPlaceholder, ariaSuffix } =
      getLocalizedTextAreaConfig(languageId);
    const placeholder = field.placeholder || localizedPlaceholder;

    const characterCountInfo = hasMaxLength
      ? getCharacterCountInfo(localValue, field)
      : null;

    return (
      <div
        ref={ref}
        className={cn('space-y-2', className)}
        aria-label={`${field.label}${ariaSuffix}`}
      >
        {/* Field Label with Icon */}
        <div className="flex items-center justify-between">
          <Label
            htmlFor={textAreaId}
            className="text-sm font-medium flex items-center gap-2"
          >
            <AlignLeft className="h-4 w-4 text-orange-500" />
            {field.label}
            {isRequired && <span className="text-destructive ml-1">*</span>}
          </Label>

          {/* Character Counter */}
          {characterCountInfo && (
            <span className="text-xs text-muted-foreground font-mono">
              {characterCountInfo}
            </span>
          )}
        </div>

        {/* Text Area Input */}
        <Textarea
          id={textAreaId}
          value={localValue}
          onChange={handleChange}
          placeholder={placeholder}
          disabled={disabled}
          rows={rows}
          className={cn(
            'min-h-[100px] resize-y',
            error && 'border-destructive focus-visible:ring-destructive',
          )}
          aria-label={field.label}
          aria-required={isRequired}
          aria-invalid={!!error}
          aria-describedby={
            error
              ? `${textAreaId}-error`
              : field.helper_text
                ? `${textAreaId}-description`
                : undefined
          }
        />

        {/* Helper Text */}
        {field.helper_text && !error && (
          <p
            id={`${textAreaId}-description`}
            className="text-xs text-muted-foreground"
          >
            {field.helper_text}
          </p>
        )}

        {/* Error Message */}
        {error && (
          <p
            id={`${textAreaId}-error`}
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

TextArea.displayName = 'TextArea';

export default TextArea;
