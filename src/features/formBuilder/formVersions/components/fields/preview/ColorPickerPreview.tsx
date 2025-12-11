// src/features/formVersion/components/fields/preview/ColorPickerPreview.tsx

/**
 * Color Picker Preview Component
 *
 * Displays a preview of how the Color Picker field will appear in the form
 * Shows color picker input with visual color swatch
 */

import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Palette } from 'lucide-react';
import type { FieldPreviewComponentProps } from '../fieldComponentRegistry';

// ============================================================================
// Component
// ============================================================================

/**
 * ColorPickerPreview Component
 *
 * Preview component for Color Picker field type
 * Features:
 * - Label with palette icon and badge
 * - Disabled hex input with swatch
 * - Static palette presets
 * - Rule/required hints
 */
export const ColorPickerPreview: React.FC<FieldPreviewComponentProps> = ({
  field,
}) => {
  console.debug('[ColorPickerPreview] Rendering for field:', field.id);

  const defaultColor = field.default_value || '#3B82F6';
  const isRequired = field.rules?.some(
    (rule) => rule.input_rule_id !== null && rule.input_rule_id !== undefined
  );

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Palette className="h-3.5 w-3.5 text-purple-500" />
        <Label className="text-sm font-medium flex-1">
          {field.label}
          {isRequired && <span className="text-destructive ml-1">*</span>}
        </Label>
      </div>

      {/* Color Picker Input */}
      <div className="space-y-2">
        {/* Visual Color Display */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Input
              type="text"
              placeholder={field.placeholder || 'Select a color'}
              defaultValue={defaultColor}
              disabled
              className="pl-12 h-10 bg-white font-mono"
            />
            <div
              className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded border-2 border-gray-300 shadow-sm"
              style={{ backgroundColor: defaultColor }}
            />
          </div>
          {/* Color Picker Button (visual only) */}
          <Button
            size="sm"
            variant="outline"
            className="h-10 px-3"
            disabled
          >
            <Palette className="h-4 w-4" />
          </Button>
        </div>

        {/* Color Palette Presets (Optional) */}
        <div className="flex gap-1.5">
          {['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899'].map(
            (color) => (
              <button
                key={color}
                className="w-7 h-7 rounded border-2 border-gray-300 hover:border-gray-400 transition-colors disabled:cursor-not-allowed"
                style={{ backgroundColor: color }}
                disabled
                title={color}
              />
            )
          )}
        </div>
      </div>

      {field.helper_text && (
        <p className="text-xs text-muted-foreground">{field.helper_text}</p>
      )}
    </div>
  );
};
