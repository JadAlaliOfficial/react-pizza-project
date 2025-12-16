/**
 * ================================
 * TOGGLE SWITCH COMPONENT
 * ================================
 * Production-ready Toggle Switch field component with:
 * - Dynamic configuration from API field data
 * - Zod validation based on field rules
 * - On/off state management
 * - Inline layout with label and helper text
 * - Required validation (must be enabled)
 * - ForwardRef support for parent scrolling
 */

import { useEffect, useState, forwardRef } from 'react';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { ToggleLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ToggleSwitchProps } from './types/toggleSwitchField.types';
import { getDefaultToggleSwitchValue } from './validation/toggleSwitchValidation';

/**
 * ToggleSwitch Component
 * 
 * Renders a toggle switch with inline layout
 * Integrates with form systems via onChange callback
 * Supports forwardRef for scrolling to errors
 * 
 * @example
 * ```
 * <ToggleSwitch
 *   ref={toggleRef}
 *   field={fieldData}
 *   value={toggleValue}
 *   onChange={(newValue) => setValue(newValue)}
 *   error={errors.toggle?.message}
 * />
 * ```
 */
export const ToggleSwitch = forwardRef<HTMLDivElement, ToggleSwitchProps>(
  ({ field, value, onChange, error, disabled = false, className }, ref) => {
    console.debug('[ToggleSwitch] Rendering for field:', field.field_id);

    // Initialize with default value or current value
    const [localValue, setLocalValue] = useState<boolean>(() => {
      if (typeof value === 'boolean') {
        return value;
      }
      
      if (field.current_value !== null && field.current_value !== undefined) {
        return getDefaultToggleSwitchValue(field);
      }
      
      return getDefaultToggleSwitchValue(field);
    });

    // Check if field is required
    const isRequired = field.rules?.some((rule) => rule.rule_name === 'required') ?? false;

    // Update local value when external value changes
    useEffect(() => {
      if (typeof value === 'boolean') {
        setLocalValue(value);
      }
    }, [value]);

    /**
     * Handle toggle change
     */
    const handleChange = (checked: boolean) => {
      setLocalValue(checked);
      onChange(checked);

      console.debug('[ToggleSwitch] Value changed:', {
        fieldId: field.field_id,
        value: checked,
      });
    };

    // Generate unique ID for accessibility
    const toggleId = `toggle-${field.field_id}`;

    return (
      <div ref={ref} className={cn('space-y-3', className)}>
        {/* Header with Icon */}
        <div className="flex items-center gap-2">
          <ToggleLeft className="h-4 w-4 text-teal-500" />
          <Label className="text-sm font-medium">
            {field.label}
            {isRequired && <span className="text-destructive ml-1">*</span>}
          </Label>
        </div>

        {/* Toggle Container - Inline Layout */}
        <div
          className={cn(
            'flex items-center justify-between p-3 border rounded-lg transition-colors',
            error
              ? 'border-destructive bg-destructive/5'
              : 'border-border bg-card hover:bg-accent/50',
            disabled && 'opacity-60 cursor-not-allowed'
          )}
        >
          {/* Label and Helper Text */}
          <div className="flex-1 pr-4">
            <p className="text-sm font-medium">{field.label}</p>
            {field.helper_text && !error && (
              <p className="text-xs text-muted-foreground mt-1">
                {field.helper_text}
              </p>
            )}
            {error && (
              <p className="text-xs text-destructive font-medium mt-1" role="alert">
                {error}
              </p>
            )}
          </div>

          {/* Toggle Switch */}
          <Switch
            id={toggleId}
            checked={localValue}
            onCheckedChange={handleChange}
            disabled={disabled}
            className={cn(
              'data-[state=checked]:bg-teal-500',
              error && 'data-[state=unchecked]:border-destructive'
            )}
            aria-label={field.label}
            aria-required={isRequired}
            aria-invalid={!!error}
            aria-describedby={error ? `${toggleId}-error` : undefined}
          />
        </div>

        {/* Status Badge (Optional) */}
        {localValue && !error && (
          <div className="flex items-center gap-2 text-xs text-teal-600">
            <div className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
            <span className="font-medium">Enabled</span>
          </div>
        )}
      </div>
    );
  }
);

ToggleSwitch.displayName = 'ToggleSwitch';

export default ToggleSwitch;
