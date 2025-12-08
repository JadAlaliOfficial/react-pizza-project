// src/features/formVersion/components/fields/TextInputFieldConfig.tsx

/**
 * Text Input Field Configuration Component
 *
 * Provides UI for configuring a Text Input field:
 * - Label, placeholder, helper text
 * - Default value
 * - Visibility conditions
 * - Order
 */

import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trash2, Type } from 'lucide-react';
import type { Field } from '@/features/formBuilder/formVersions/types';

type TextInputFieldConfigProps = {
  field: Field;
  fieldIndex: number;
  onFieldChange: (updatedField: Partial<Field>) => void;
  onDelete: () => void;
};

export function TextInputFieldConfig({
  field,
  fieldIndex,
  onFieldChange,
  onDelete,
}: TextInputFieldConfigProps) {
  return (
    <Card className="p-4 border-l-4 border-l-blue-500">
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <Type className="h-4 w-4 text-blue-500" />
            <Badge variant="outline" className="text-xs">
              Text Input
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
            placeholder="Enter placeholder text"
            className="h-9"
            maxLength={255}
          />
        </div>

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
            placeholder="Additional information to help users"
            className="min-h-[60px] text-xs"
          />
        </div>

        {/* Default Value */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">
            Default Value
          </label>
          <Input
            value={field.default_value ?? ''}
            onChange={(e) =>
              onFieldChange({ default_value: e.target.value || null })
            }
            placeholder="Default value for this field"
            className="h-9"
          />
        </div>

        {/* Grid: Order & Visibility Conditions */}
        <div className="grid gap-3 md:grid-cols-[100px,1fr]">
          {/* Visibility Conditions */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              Visibility Conditions (JSON)
            </label>
            <Textarea
              value={
                field.visibility_conditions ?? field.visibility_condition ?? ''
              }
              onChange={(e) =>
                onFieldChange({
                  visibility_conditions: e.target.value || null,
                })
              }
              placeholder='e.g. {"field_id": 5, "operator": "equals", "value": "yes"}'
              className="min-h-[60px] text-xs font-mono"
            />
          </div>
        </div>

        {/* Info Note */}
        <div className="pt-2 border-t">
          <p className="text-[10px] text-muted-foreground">
            💡 Validation rules can be added after saving this field
            configuration.
          </p>
        </div>
      </div>
    </Card>
  );
}
