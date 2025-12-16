/**
 * ================================
 * TEXT AREA COMPONENT
 * ================================
 * Production-ready Text Area field component with:
 * - Dynamic configuration from API field data
 * - Zod validation based on field rules
 * - Multi-line text input with auto-resize
 * - Character counter
 * - Comprehensive validation (alpha, regex, JSON, etc.)
 * - ForwardRef support for parent scrolling
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
    },
    ref
  ) => {
    console.debug('[TextArea] Rendering for field:', field.field_id);

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

    // Check if field is required
    const isRequired = field.rules?.some((rule) => rule.rule_name === 'required') ?? false;

    // Check if max length exists for character counter
    const maxRule = field.rules?.find((rule) => rule.rule_name === 'max');
    const betweenRule = field.rules?.find((rule) => rule.rule_name === 'between');
    const hasMaxLength = !!(maxRule || betweenRule);

    // Update local value when external value changes
    useEffect(() => {
      if (value !== null && value !== undefined) {
        setLocalValue(String(value));
      }
    }, [value]);

    /**
     * Handle text area value change
     */
    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newValue = e.target.value;
      setLocalValue(newValue);
      onChange(newValue);

      console.debug('[TextArea] Value changed:', {
        fieldId: field.field_id,
        length: newValue.length,
      });
    };

    // Generate unique ID for accessibility
    const textAreaId = `textarea-${field.field_id}`;

    // Get placeholder
    const placeholder = field.placeholder || 'Enter your text here...';

    // Get character count info
    const characterCountInfo = hasMaxLength
      ? getCharacterCountInfo(localValue, field)
      : null;

    return (
      <div ref={ref} className={cn('space-y-2', className)}>
        {/* Field Label with Icon */}
        <div className="flex items-center justify-between">
          <Label htmlFor={textAreaId} className="text-sm font-medium flex items-center gap-2">
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
            error && 'border-destructive focus-visible:ring-destructive'
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
  }
);

TextArea.displayName = 'TextArea';

export default TextArea;
