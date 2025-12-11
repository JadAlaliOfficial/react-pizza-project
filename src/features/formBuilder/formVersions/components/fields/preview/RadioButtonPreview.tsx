// src/features/formVersion/components/fields/preview/RadioButtonPreview.tsx

/**
 * Radio Button Preview Component
 *
 * Displays preview of how the Radio Button field will appear in the form
 * Shows all options with radio buttons
 */

import React from 'react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Circle } from 'lucide-react';
import type { FieldPreviewComponentProps } from '../fieldComponentRegistry';

// ============================================================================
// Component
// ============================================================================

/**
 * RadioButtonPreview Component
 *
 * Preview component for Radio Button field type
 * Features:
 * - Shows all options from JSON placeholder
 * - Default selection preview
 * - Authentic radio group layout
 * - Rules indicator
 * - Dynamic option count display
 */
export const RadioButtonPreview: React.FC<FieldPreviewComponentProps> = ({
  field,
}) => {
  console.debug('[RadioButtonPreview] Rendering for field:', field.id);

  // Parse options from placeholder
  const getOptions = (): string[] => {
    try {
      if (!field.placeholder) return ['Option 1', 'Option 2'];
      const parsed = JSON.parse(field.placeholder);
      return Array.isArray(parsed) && parsed.length > 0
        ? parsed
        : ['Option 1', 'Option 2'];
    } catch {
      return ['Option 1', 'Option 2'];
    }
  };

  const options = getOptions();

  const isRequired = field.rules?.some(
    (rule) => rule.input_rule_id !== null && rule.input_rule_id !== undefined,
  );

  return (
    <div className="space-y-2">
      {/* Header with icon, label, and rules */}
      <div className="flex items-center gap-2">
        <Circle className="h-3.5 w-3.5 text-cyan-500" />
        <Label className="text-sm font-medium flex-1">
          {field.label}
          {isRequired && <span className="text-destructive ml-1">*</span>}
        </Label>
      </div>

      {/* Radio group preview */}
      <RadioGroup defaultValue={field.default_value ?? undefined} disabled>
        <div className="space-y-2">
          {options.map((option, index) => (
            <div key={index} className="flex items-center space-x-2">
              <RadioGroupItem
                value={option}
                id={`preview-radio-${field.id}-${index}`}
              />
              <Label
                htmlFor={`preview-radio-${field.id}-${index}`}
                className="text-sm font-normal cursor-pointer"
              >
                {option}
              </Label>
            </div>
          ))}
        </div>
      </RadioGroup>

      {/* Helper text */}
      {field.helper_text && (
        <p className="text-xs text-muted-foreground">{field.helper_text}</p>
      )}
    </div>
  );
};
