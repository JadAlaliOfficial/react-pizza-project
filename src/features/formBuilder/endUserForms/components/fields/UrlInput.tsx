/**
 * ================================
 * URL INPUT COMPONENT
 * ================================
 *
 * Production-ready URL Input field component.
 *
 * Responsibilities:
 * - Render URL input
 * - Emit URL string via onChange callback
 * - Display validation errors from parent
 * - Apply disabled state
 * - Support accessibility
 *
 * Architecture Decisions:
 * - Dumb component - no validation/visibility/business logic
 * - Props match RuntimeFieldProps contract
 * - No RTL logic (handled by parent)
 * - ForwardRef for error scrolling
 * - Local state for controlled input behavior
 */

import React, { useEffect, useState, forwardRef } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Link as LinkIcon,
  ExternalLink,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { UrlInputProps } from './types/urlInputField.types';
import {
  getDefaultUrlInputValue,
  ensureProtocol,
  isValidUrl,
  extractDomain,
} from './validation/urlInputValidation';

// ================================
// LOCALIZATION
// ================================

const getLocalizedUrlConfig = (languageId?: number) => {
  if (languageId === 2) {
    // Arabic
    return {
      placeholder: 'https://example.com',
      openTitle: 'فتح الرابط في علامة تبويب جديدة',
      ariaSuffix: ' - حقل إدخال رابط',
    };
  }

  if (languageId === 3) {
    // Spanish
    return {
      placeholder: 'https://ejemplo.com',
      openTitle: 'Abrir enlace en una nueva pestaña',
      ariaSuffix: ' - campo de entrada de URL',
    };
  }

  // English (default)
  return {
    placeholder: 'https://example.com',
    openTitle: 'Open link in new tab',
    ariaSuffix: ' - URL input field',
  };
};

/**
 * UrlInput Component
 *
 * Renders a URL input with validation and helper features
 * Integrates with form systems via onChange callback
 * Supports forwardRef for scrolling to errors
 *
 * @example
 * ```
 * <UrlInput
 *   ref={urlRef}
 *   field={fieldData}
 *   value={urlValue}
 *   onChange={(newValue) => setValue(newValue)}
 *   error={errors.url?.message}
 * />
 * ```
 */
export const UrlInput = forwardRef<HTMLDivElement, UrlInputProps>(
  ({ field, value, onChange, error, disabled = false, className, languageId }, ref) => {
    const [localValue, setLocalValue] = useState<string>(() => {
      if (value !== null && value !== undefined) {
        return String(value);
      }

      if (field.current_value !== null && field.current_value !== undefined) {
        return String(field.current_value);
      }

      return getDefaultUrlInputValue(field);
    });

    const [isValid, setIsValid] = useState<boolean>(false);

    const isRequired =
      field.rules?.some((rule) => rule.rule_name === 'required') ?? false;

    useEffect(() => {
      if (value !== null && value !== undefined) {
        setLocalValue(String(value));
      }
    }, [value]);

    useEffect(() => {
      setIsValid(localValue ? isValidUrl(localValue) : false);
    }, [localValue]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      setLocalValue(newValue);
      onChange(newValue);
    };

    const handleBlur = () => {
      if (localValue && !isValidUrl(localValue)) {
        const withProtocol = ensureProtocol(localValue);
        setLocalValue(withProtocol);
        onChange(withProtocol);

        console.debug('[UrlInput] Auto-prepended protocol:', {
          fieldId: field.field_id,
          original: localValue,
          updated: withProtocol,
        });
      }
    };

    const handleOpenLink = () => {
      if (!isValid || !localValue) return;

      window.open(localValue, '_blank', 'noopener,noreferrer');

      console.debug('[UrlInput] Opened link:', {
        fieldId: field.field_id,
        url: localValue,
      });
    };

    const urlInputId = `url-input-${field.field_id}`;

    const { placeholder: localizedPlaceholder, openTitle, ariaSuffix } =
      getLocalizedUrlConfig(languageId);
    const placeholder = field.placeholder || localizedPlaceholder;

    const domain = isValid ? extractDomain(localValue) : null;

    return (
      <div
        ref={ref}
        className={cn('space-y-2', className)}
        aria-label={`${field.label}${ariaSuffix}`}
      >
        {/* Field Label with Icon */}
        <div className="flex items-center justify-between">
          <Label
            htmlFor={urlInputId}
            className="text-sm font-medium flex items-center gap-2"
          >
            <LinkIcon className="h-4 w-4 text-cyan-500" />
            {field.label}
            {isRequired && <span className="text-destructive ml-1">*</span>}
          </Label>

          {/* Domain Display */}
          {domain && (
            <span className="text-xs text-cyan-600 font-mono">{domain}</span>
          )}
        </div>

        {/* URL Input with Icons and Open Button */}
        <div className="relative">
          {/* Link Icon */}
          <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
            <LinkIcon className="h-4 w-4 text-cyan-500" />
          </div>

          {/* Input Field */}
          <Input
            id={urlInputId}
            type="url"
            value={localValue}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder={placeholder}
            disabled={disabled}
            className={cn(
              'pl-9 pr-20 h-10',
              error && 'border-destructive focus-visible:ring-destructive',
            )}
            aria-label={field.label}
            aria-required={isRequired}
            aria-invalid={!!error}
            aria-describedby={
              error
                ? `${urlInputId}-error`
                : field.helper_text
                  ? `${urlInputId}-description`
                  : undefined
            }
          />

          {/* Validation Indicator */}
          {localValue && (
            <div className="absolute right-12 top-1/2 -translate-y-1/2 pointer-events-none">
              {isValid ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <AlertCircle className="h-4 w-4 text-amber-500" />
              )}
            </div>
          )}

          {/* Open Link Button */}
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={handleOpenLink}
            disabled={disabled || !isValid}
            className="absolute right-1 top-1/2 -translate-y-1/2 h-8 px-2"
            title={openTitle}
          >
            <ExternalLink className="h-3 w-3" />
          </Button>
        </div>

        {/* Helper Text */}
        {field.helper_text && !error && (
          <p
            id={`${urlInputId}-description`}
            className="text-xs text-muted-foreground"
          >
            {field.helper_text}
          </p>
        )}

        {/* Error Message */}
        {error && (
          <p
            id={`${urlInputId}-error`}
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

UrlInput.displayName = 'UrlInput';

export default UrlInput;
