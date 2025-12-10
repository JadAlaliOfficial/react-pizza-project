// src/features/formVersion/components/fields/preview/ToggleSwitchPreview.tsx

/**
 * Toggle Switch Preview Component
 *
 * Displays a preview of how the Toggle Switch field will appear in the form
 * Shows toggle switch with on/off states
 */

import React, { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
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

  const hasRules = field.rules && field.rules.length > 0;
  const isRequired = field.rules?.some(
    (rule) => rule.input_rule_id !== null && rule.input_rule_id !== undefined
  );

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <ToggleLeft className="h-3.5 w-3.5 text-teal-500" />
        <Label className="text-sm font-medium flex-1">
          {field.label}
          {isRequired && <span className="text-destructive ml-1">*</span>}
        </Label>
        <Badge variant="secondary" className="text-[10px] h-4 px-1.5">
          Toggle Switch
        </Badge>
        {hasRules && (
          <span className="text-[10px] text-muted-foreground font-normal">
            ({field.rules.length} rule{field.rules.length !== 1 ? 's' : ''})
          </span>
        )}
      </div>

      {/* Toggle Switch Component */}
      <div className="flex items-center gap-3 p-4 border rounded-lg bg-muted/30">
        <Switch
          checked={isOn}
          onCheckedChange={setIsOn}
          disabled
          className="data-[state=checked]:bg-teal-500"
        />
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">
              {isOn ? 'Enabled' : 'Disabled'}
            </span>
            <Badge
              variant={isOn ? 'default' : 'secondary'}
              className={`text-xs ${
                isOn
                  ? 'bg-teal-500 hover:bg-teal-600'
                  : 'bg-gray-300 text-gray-700'
              }`}
            >
              {isOn ? 'ON' : 'OFF'}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {isOn ? 'Feature is enabled' : 'Feature is disabled'}
          </p>
        </div>
      </div>

      {/* Alternative Layout - Inline */}
      <div className="flex items-center justify-between p-3 border rounded-lg">
        <div>
          <p className="text-sm font-medium">{field.label}</p>
          {field.helper_text && (
            <p className="text-xs text-muted-foreground">
              {field.helper_text}
            </p>
          )}
        </div>
        <Switch
          checked={isOn}
          onCheckedChange={setIsOn}
          disabled
          className="data-[state=checked]:bg-teal-500"
        />
      </div>

      <p className="text-[10px] text-teal-600 italic">
        🔘 Toggle switch with smooth animation. Values stored as "1" (on) or "0" (off); useful for filters on enabled or disabled state.
      </p>
    </div>
  );
};
