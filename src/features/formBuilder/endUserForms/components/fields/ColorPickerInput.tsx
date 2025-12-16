/**
 * ================================
 * COLOR PICKER INPUT COMPONENT
 * ================================
 * Production-ready Color Picker field component with:
 * - Dynamic configuration from API field data
 * - Zod validation based on field rules
 * - Visual color swatch
 * - Preset color palette
 * - Hex input with validation
 * - ForwardRef support for parent scrolling
 */

import React, { useEffect, useState, forwardRef } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Palette } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ColorPickerInputProps } from './types/colorPickerField.types';
import { COLOR_PRESETS } from './types/colorPickerField.types';
import {
  getDefaultColorPickerValue,
  isValidHexColor,
  normalizeHexColor,
} from './validation/colorPickerValidation';

/**
 * ColorPickerInput Component
 * 
 * Renders a color picker with visual swatch, hex input, and preset palette
 * Integrates with form systems via onChange callback
 * Supports forwardRef for scrolling to errors
 * 
 * @example
 * ```
 * <ColorPickerInput
 *   ref={colorRef}
 *   field={fieldData}
 *   value={colorValue}
 *   onChange={(newColor) => setValue(newColor)}
 *   error={errors.color?.message}
 * />
 * ```
 */
export const ColorPickerInput = forwardRef<HTMLDivElement, ColorPickerInputProps>(
  ({ field, value, onChange, error, disabled = false, className }, ref) => {
    console.debug('[ColorPickerInput] Rendering for field:', field.field_id);

    // Initialize with default value or current value
    const [localValue, setLocalValue] = useState<string>(() => {
      if (value && isValidHexColor(value)) return normalizeHexColor(value);
      
      if (field.current_value && typeof field.current_value === 'string') {
        const currentVal = field.current_value;
        if (isValidHexColor(currentVal)) {
          return normalizeHexColor(currentVal);
        }
      }
      
      return getDefaultColorPickerValue(field);
    });

    // Check if field is required
    const isRequired = field.rules?.some((rule) => rule.rule_name === 'required') ?? false;

    // Update local value when external value changes
    useEffect(() => {
      if (value && isValidHexColor(value)) {
        setLocalValue(normalizeHexColor(value));
      }
    }, [value]);

    /**
     * Handle color change from input or preset
     */
    const handleColorChange = (newColor: string) => {
      // Validate and normalize color
      if (isValidHexColor(newColor)) {
        const normalized = normalizeHexColor(newColor);
        setLocalValue(normalized);
        onChange(normalized);

        console.debug('[ColorPickerInput] Color changed:', {
          fieldId: field.field_id,
          color: normalized,
        });
      }
    };

    /**
     * Handle manual hex input change
     */
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const input = e.target.value;
      setLocalValue(input);

      // Only trigger onChange if it's a valid hex color
      if (isValidHexColor(input)) {
        handleColorChange(input);
      }
    };

    /**
     * Handle preset color click
     */
    const handlePresetClick = (presetColor: string) => {
      if (!disabled) {
        handleColorChange(presetColor);
      }
    };

    /**
     * Handle native color picker change
     */
    const handleNativeColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      handleColorChange(e.target.value);
    };

    // Generate unique ID for accessibility
    const colorPickerId = `color-picker-${field.field_id}`;

    return (
      <div ref={ref} className={cn('space-y-3', className)}>
        {/* Field Label with Icon */}
        <div className="flex items-center gap-2">
          <Palette className="h-4 w-4 text-purple-500" />
          <Label htmlFor={colorPickerId} className="text-sm font-medium">
            {field.label}
            {isRequired && <span className="text-destructive ml-1">*</span>}
          </Label>
        </div>

        {/* Color Picker Input */}
        <div className="space-y-3">
          {/* Visual Color Display with Input */}
          <div className="flex gap-2">
            {/* Hex Input with Color Swatch */}
            <div className="relative flex-1">
              <Input
                id={colorPickerId}
                type="text"
                value={localValue}
                onChange={handleInputChange}
                placeholder={field.placeholder || 'Select a color'}
                disabled={disabled}
                className={cn(
                  'pl-12 h-10 font-mono uppercase',
                  error && 'border-destructive focus-visible:ring-destructive'
                )}
                aria-label={field.label}
                aria-required={isRequired}
                aria-invalid={!!error}
                aria-describedby={
                  error
                    ? `${colorPickerId}-error`
                    : field.helper_text
                    ? `${colorPickerId}-description`
                    : undefined
                }
              />
              {/* Color Swatch */}
              <div
                className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded border-2 border-gray-300 shadow-sm transition-colors"
                style={{ backgroundColor: isValidHexColor(localValue) ? localValue : '#ccc' }}
                aria-hidden="true"
              />
            </div>

            {/* Native Color Picker Button */}
            <div className="relative">
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="h-10 px-3"
                disabled={disabled}
                asChild
              >
                <label htmlFor={`${colorPickerId}-native`} className="cursor-pointer">
                  <Palette className="h-4 w-4" />
                </label>
              </Button>
              <input
                id={`${colorPickerId}-native`}
                type="color"
                value={isValidHexColor(localValue) ? localValue : '#3B82F6'}
                onChange={handleNativeColorChange}
                disabled={disabled}
                className="absolute inset-0 opacity-0 cursor-pointer"
                aria-label={`${field.label} - Color Picker`}
              />
            </div>
          </div>

          {/* Color Palette Presets */}
          <div className="flex flex-wrap gap-1.5">
            {COLOR_PRESETS.map((presetColor) => (
              <button
                key={presetColor}
                type="button"
                onClick={() => handlePresetClick(presetColor)}
                disabled={disabled}
                className={cn(
                  'w-8 h-8 rounded border-2 transition-all',
                  localValue.toLowerCase() === presetColor.toLowerCase()
                    ? 'border-gray-900 ring-2 ring-gray-900 ring-offset-2 scale-110'
                    : 'border-gray-300 hover:border-gray-400 hover:scale-105',
                  disabled && 'opacity-50 cursor-not-allowed'
                )}
                style={{ backgroundColor: presetColor }}
                title={presetColor}
                aria-label={`Select color ${presetColor}`}
              />
            ))}
          </div>
        </div>

        {/* Helper Text */}
        {field.helper_text && !error && (
          <p
            id={`${colorPickerId}-description`}
            className="text-xs text-muted-foreground"
          >
            {field.helper_text}
          </p>
        )}

        {/* Error Message */}
        {error && (
          <p
            id={`${colorPickerId}-error`}
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

ColorPickerInput.displayName = 'ColorPickerInput';

export default ColorPickerInput;
