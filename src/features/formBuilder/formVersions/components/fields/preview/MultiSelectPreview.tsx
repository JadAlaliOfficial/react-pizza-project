// src/features/formVersion/components/fields/preview/MultiSelectPreview.tsx

/**
 * Multi-Select Preview Component
 * 
 * Displays preview of how the Multi-Select field will appear in the form
 * Shows checkbox list with all options
 */

import React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { CheckSquare } from 'lucide-react';
import type { FieldPreviewComponentProps } from '../fieldComponentRegistry';

// ============================================================================
// Component
// ============================================================================

/**
 * MultiSelectPreview Component
 * 
 * Preview component for Multi-Select field type
 * Features:
 * - Shows all options from JSON placeholder as checkboxes
 * - Default multiple selections preview
 * - Authentic multi-checkbox layout
 * - Rules indicator
 * - Selection count display
 */
export const MultiSelectPreview: React.FC<FieldPreviewComponentProps> = ({
  field,
}) => {
  console.debug('[MultiSelectPreview] Rendering for field:', field.id);

  // Parse options from placeholder
  const getOptions = (): string[] => {
    try {
      if (!field.placeholder) return ['Option 1', 'Option 2', 'Option 3'];
      const parsed = JSON.parse(field.placeholder);
      return Array.isArray(parsed) && parsed.length > 0
        ? parsed
        : ['Option 1', 'Option 2', 'Option 3'];
    } catch {
      return ['Option 1', 'Option 2', 'Option 3'];
    }
  };

  // Parse default selected values
  const getDefaultSelected = (): string[] => {
    try {
      if (!field.default_value) return [];
      const parsed = JSON.parse(field.default_value);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  };

  const options = getOptions();
  const defaultSelected = getDefaultSelected();

  // Determine if field has validation rules
  const hasRules = field.rules && field.rules.length > 0;
  const isRequired = field.rules?.some(
    (rule) => rule.input_rule_id !== null && rule.input_rule_id !== undefined
  );

  return (
    <div className="space-y-2">
      {/* Header with icon, label, and rules */}
      <div className="flex items-center gap-2">
        <CheckSquare className="h-3.5 w-3.5 text-indigo-500" />
        <Label className="text-sm font-medium flex-1">
          {field.label}
          {isRequired && <span className="text-destructive ml-1">*</span>}
        </Label>
        <Badge variant="secondary" className="text-[10px] h-4 px-1.5">
          Multi-Select
        </Badge>
        {hasRules && (
          <span className="text-[10px] text-muted-foreground font-normal">
            ({field.rules.length} rule{field.rules.length !== 1 ? 's' : ''})
          </span>
        )}
      </div>

      {/* Multi-checkbox preview */}
      <div className="space-y-2 p-3 border rounded-md bg-muted/30">
        {options.map((option, index) => (
          <div key={index} className="flex items-center space-x-2">
            <Checkbox
              id={`preview-multi-${field.id}-${index}`}
              defaultChecked={defaultSelected.includes(option)}
              disabled
            />
            <Label
              htmlFor={`preview-multi-${field.id}-${index}`}
              className="text-sm font-normal cursor-pointer"
            >
              {option}
            </Label>
          </div>
        ))}
      </div>

      {/* Helper text */}
      {field.helper_text && (
        <p className="text-xs text-muted-foreground">{field.helper_text}</p>
      )}

      {/* Multi-select specific hint */}
      <p className="text-[10px] text-indigo-600 italic">
        ✓ Multiple selections allowed. Options: {options.length}. Selected by default: {defaultSelected.length}. Values stored as JSON array.
      </p>
    </div>
  );
};
