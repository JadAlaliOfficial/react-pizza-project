// src/features/formVersion/components/fields/TextAreaFieldConfig.tsx

/**
 * Text Area Field Configuration Component
 *
 * Provides UI for configuring a Text Area field:
 * - Label, placeholder, helper text
 * - Default value (multi-line text)
 * - Rows configuration (height)
 * - Character limits (min/max)
 * - Visibility conditions
 */

import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trash2, AlignLeft } from "lucide-react";
import type { Field } from "@/features/formBuilder/formVersions/types";

type TextAreaFieldConfigProps = {
  field: Field;
  fieldIndex: number;
  onFieldChange: (updatedField: Partial<Field>) => void;
  onDelete: () => void;
};

export function TextAreaFieldConfig({
  field,
  fieldIndex,
  onFieldChange,
  onDelete,
}: TextAreaFieldConfigProps) {

  return (
    <Card className="p-4 border-l-4 border-l-orange-500">
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <AlignLeft className="h-4 w-4 text-orange-500" />
            <Badge variant="outline" className="text-xs">
              Text Area
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
          <Textarea
            value={field.placeholder ?? ""}
            onChange={(e) =>
              onFieldChange({ placeholder: e.target.value || null })
            }
            placeholder="Enter your text here...&#10;Multiple lines are supported"
            className="min-h-[60px] text-xs"
            maxLength={255}
          />
        </div>

        {/* Helper Text */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">
            Helper Text
          </label>
          <Textarea
            value={field.helper_text ?? ""}
            onChange={(e) =>
              onFieldChange({ helper_text: e.target.value || null })
            }
            placeholder="Additional information (e.g., 'Maximum 500 characters')"
            className="min-h-[60px] text-xs"
          />
        </div>

        {/* Default Value */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">
            Default Value (Multi-line Text)
          </label>
          <Textarea
            value={field.default_value ?? ""}
            onChange={(e) =>
              onFieldChange({ default_value: e.target.value || null })
            }
            placeholder="Enter default text..."
            className="min-h-[80px] text-xs"
          />
        </div>

        {/* Visibility Conditions */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">
            Visibility Conditions (JSON)
          </label>
          <Textarea
            value={
              field.visibility_conditions ?? field.visibility_condition ?? ""
            }
            onChange={(e) =>
              onFieldChange({
                visibility_conditions: e.target.value || null,
              })
            }
            placeholder='e.g., {"field_id": 5, "operator": "equals", "value": "yes"}'
            className="min-h-[60px] text-xs font-mono"
          />
        </div>

        {/* Available Validation Rules Info */}
        <div className="pt-2 border-t">
          <p className="text-[10px] font-medium text-muted-foreground mb-1">
            📋 Available Validation Rules:
          </p>
          <div className="grid grid-cols-2 gap-1">
            <span className="text-[10px] text-muted-foreground">• required</span>
            <span className="text-[10px] text-muted-foreground">
              • min/max (length)
            </span>
            <span className="text-[10px] text-muted-foreground">• alpha</span>
            <span className="text-[10px] text-muted-foreground">
              • alphanum
            </span>
            <span className="text-[10px] text-muted-foreground">
              • alphadash
            </span>
            <span className="text-[10px] text-muted-foreground">• regex</span>
            <span className="text-[10px] text-muted-foreground">
              • startswith
            </span>
            <span className="text-[10px] text-muted-foreground">• endswith</span>
            <span className="text-[10px] text-muted-foreground">
              • json (data)
            </span>
          </div>
          <p className="text-[10px] text-orange-700 mt-2 font-medium">
            💡 Use "json" rule to validate structured data entry
          </p>
        </div>
      </div>
    </Card>
  );
}
