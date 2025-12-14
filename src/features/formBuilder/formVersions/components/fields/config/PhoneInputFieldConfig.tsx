// src/features/formVersion/components/fields/config/PhoneInputFieldConfig.tsx

/**
 * Phone Input Field Configuration Component
 *
 * Provides UI for configuring a Phone Input field:
 * - Label, placeholder, helper text
 * - Default value (phone format)
 * - Format guidance (no automatic formatting)
 * - Country code hints
 * - Regex pattern suggestions
 * - Visibility conditions
 */

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trash2, Phone } from 'lucide-react';
import type { FieldConfigComponentProps } from '../fieldComponentRegistry';
import { useFormVersionBuilder } from '../../../hooks/useFormVersionBuilder';
import type { VisibilityCondition } from '../../shared/VisibilityConditionsBuilder';
import {
  VisibilityConditionsBuilder,
  parseVisibilityConditions,
  serializeVisibilityConditions,
} from '../../shared/VisibilityConditionsBuilder';

// ============================================================================
// Component
// ============================================================================

/**
 * PhoneInputFieldConfig Component
 *
 * Configuration UI for Phone Input field type
 * Features:
 * - Phone format presets with regex patterns
 * - Country code reference
 * - type="tel" input
 * - Copy-to-clipboard regex patterns
 */
export const PhoneInputFieldConfig: React.FC<FieldConfigComponentProps> = ({
  field,
  fieldIndex,
  onFieldChange,
  onDelete,
}) => {
  console.debug('[PhoneInputFieldConfig] Rendering for field:', field.id);
  const { stages } = useFormVersionBuilder();
  const [visibilityEditorOpen, setVisibilityEditorOpen] = useState(false);
  const [builderValue, setBuilderValue] = useState<VisibilityCondition>(null);

  useEffect(() => {
    const raw =
      field.visibility_conditions ?? field.visibility_condition ?? null;
    setBuilderValue(parseVisibilityConditions(raw));
  }, [field.visibility_conditions, field.visibility_condition]);
  const [regexPattern, setRegexPattern] = useState<string>('');

  return (
    <>
      <Card className="p-4 border-l-4 border-l-cyan-500">
        <div className="space-y-3">
          {/* Header */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-cyan-500" />
              <Badge variant="outline" className="text-xs">
                Phone Input
              </Badge>
              <span className="text-xs text-muted-foreground">
                Field {fieldIndex + 1}
              </span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              type="button"
              onClick={onDelete}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>

          {/* Label */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              Label <span className="text-destructive">*</span>
            </label>
            <Input
              value={field.label}
              onChange={(e) => onFieldChange({ label: e.target.value })}
              placeholder="Enter field label"
              className="h-9"
              maxLength={255}
            />
          </div>

          {/* Placeholder */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              Placeholder
            </label>
            <Input
              value={field.placeholder ?? ''}
              onChange={(e) =>
                onFieldChange({ placeholder: e.target.value || null })
              }
              placeholder="e.g., +1 (555) 123-4567"
              className="h-9"
              maxLength={255}
            />
          </div>

          {/* Regex Pattern Hint */}
          {regexPattern && (
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                Suggested Regex Pattern
              </label>
              <div className="relative">
                <Textarea
                  value={regexPattern}
                  onChange={(e) => setRegexPattern(e.target.value)}
                  className="min-h-[50px] text-xs font-mono bg-muted/50"
                  readOnly
                />
                <Button
                  size="sm"
                  variant="ghost"
                  className="absolute top-1 right-1 h-6 text-[10px]"
                  onClick={() => {
                    navigator.clipboard.writeText(regexPattern);
                  }}
                >
                  Copy
                </Button>
              </div>
              <p className="text-[10px] text-cyan-700 italic">
                ℹ️ Add this pattern using "regex" validation rule after saving
                the field
              </p>
            </div>
          )}

          {/* Helper Text */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              Helper Text
            </label>
            <Textarea
              value={field.helper_text ?? ''}
              onChange={(e) =>
                onFieldChange({ helper_text: e.target.value || null })
              }
              placeholder="Additional information (e.g., 'Please include country code')"
              className="min-h-[60px] text-xs"
            />
          </div>

          {/* Default Value */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              Default Value (Phone Number)
            </label>
            <Input
              type="tel"
              value={field.default_value ?? ''}
              onChange={(e) =>
                onFieldChange({ default_value: e.target.value || null })
              }
              placeholder="+1 (555) 123-4567"
              className="h-9"
            />
          </div>

          {/* Visibility Conditions */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              Visibility Conditions
            </label>
            <div className="flex items-center justify-between rounded border p-2">
              <div className="text-[11px] text-muted-foreground">
                {field.visibility_conditions
                  ? 'Conditions configured'
                  : 'No conditions'}
              </div>
              <Button
                variant="outline"
                size="sm"
                type="button"
                onClick={() => setVisibilityEditorOpen(true)}
              >
                Edit Conditions
              </Button>
            </div>
          </div>
        </div>
      </Card>
      {visibilityEditorOpen && (
        <VisibilityConditionsBuilder
          value={builderValue}
          onChange={(condition) => {
            setBuilderValue(condition);
            const serialized = serializeVisibilityConditions(condition);
            onFieldChange({ visibility_conditions: serialized });
          }}
          stages={stages}
          excludeFieldId={field.id}
          open={visibilityEditorOpen}
          onClose={() => setVisibilityEditorOpen(false)}
        />
      )}
    </>
  );
};
