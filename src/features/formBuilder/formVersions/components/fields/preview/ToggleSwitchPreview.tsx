// src/features/formVersion/components/fields/preview/ToggleSwitchPreview.tsx

/**
 * Toggle Switch Preview Component
 *
 * Displays a preview of how the Toggle Switch field will appear in the form
 * Shows toggle switch with on/off states
 */

import React, { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { ToggleLeft } from 'lucide-react';
import type { FieldPreviewComponentProps } from '../fieldComponentRegistry';

// ============================================================================
// Component
// ============================================================================

/**
 * ToggleSwitchPreview Component
 *
 * Preview component for Toggle Switch field type
 * Features:
 * - Label with toggle icon and badge
 * - Disabled toggle showing default state
 * - Inline alternative layout
 * - Rule/required hints
 */
export const ToggleSwitchPreview: React.FC<FieldPreviewComponentProps> = ({
  field,
}) => {
  console.debug('[ToggleSwitchPreview] Rendering for field:', field.id);

  const defaultState = field.default_value === '1';
  const [isOn, setIsOn] = useState(defaultState);

  const isRequired = field.rules?.some(
    (rule) => rule.input_rule_id !== null && rule.input_rule_id !== undefined,
  );

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <ToggleLeft className="h-3.5 w-3.5 text-teal-500" />
        <Label className="text-sm font-medium flex-1">
          {field.label}
          {isRequired && <span className="text-destructive ml-1">*</span>}
        </Label>
      </div>

      {/* Alternative Layout - Inline */}
      <div className="flex items-center justify-between p-3 border rounded-lg">
        <div>
          <p className="text-sm font-medium">{field.label}</p>
          {field.helper_text && (
            <p className="text-xs text-muted-foreground">{field.helper_text}</p>
          )}
        </div>
        <Switch
          checked={isOn}
          onCheckedChange={setIsOn}
          disabled
          className="data-[state=checked]:bg-teal-500"
        />
      </div>
    </div>
  );
};
