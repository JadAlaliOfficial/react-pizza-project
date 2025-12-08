// src/features/formVersion/components/fields/ColorPickerFieldConfig.tsx

/**
 * Color Picker Field Configuration Component
 *
 * Provides UI for configuring a Color Picker field:
 * - Label (main question)
 * - Placeholder (e.g., "Select a color")
 * - Default value (hex color)
 * - Helper text
 * - Visibility conditions
 */

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Trash2, Palette, Info } from "lucide-react";
import type { Field } from "@/features/formBuilder/formVersions/types";

type ColorPickerFieldConfigProps = {
  field: Field;
  fieldIndex: number;
  onFieldChange: (updatedField: Partial<Field>) => void;
  onDelete: () => void;
};

export function ColorPickerFieldConfig({
  field,
  fieldIndex,
  onFieldChange,
  onDelete,
}: ColorPickerFieldConfigProps) {
  const [defaultColor, setDefaultColor] = useState(
    field.default_value || "#3B82F6"
  );

  return (
    <Card className="p-4 border-l-4 border-l-purple-500">
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <Palette className="h-4 w-4 text-purple-500" />
            <Badge variant="outline" className="text-xs">
              Color Picker
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

        {/* Info Alert */}
        <Alert className="bg-purple-50 border-purple-200">
          <Info className="h-4 w-4 text-purple-600" />
          <AlertDescription className="text-xs text-purple-900">
            Color picker for visual color selection. Values stored as lowercase
            hex format (#rrggbb). Includes color preview and palette options.
          </AlertDescription>
        </Alert>

        {/* Label */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">
            Label <span className="text-destructive">*</span>
          </label>
          <Input
            value={field.label}
            onChange={(e) => onFieldChange({ label: e.target.value })}
            placeholder="e.g., Choose your brand color"
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
            value={field.placeholder ?? ""}
            onChange={(e) =>
              onFieldChange({ placeholder: e.target.value || null })
            }
            placeholder="e.g., Select a color"
            className="h-9"
            maxLength={255}
          />
        </div>

        {/* Default Value (Color) */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">
            Default Color Value
          </label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Input
                type="text"
                value={defaultColor}
                onChange={(e) => {
                  setDefaultColor(e.target.value);
                  onFieldChange({ default_value: e.target.value || null });
                }}
                placeholder="#3B82F6"
                className="h-9 pl-12"
                maxLength={7}
              />
              <div
                className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded border-2 border-gray-300"
                style={{ backgroundColor: defaultColor }}
              ></div>
            </div>
            <input
              type="color"
              value={defaultColor}
              onChange={(e) => {
                setDefaultColor(e.target.value);
                onFieldChange({ default_value: e.target.value || null });
              }}
              className="h-9 w-16 cursor-pointer rounded border"
            />
          </div>
          <p className="text-[10px] text-muted-foreground">
            💡 Pre-selected color in hex format (e.g., #3B82F6 for blue)
          </p>
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
            placeholder="Additional information (e.g., 'Choose a color that represents your brand')"
            className="min-h-[60px] text-xs"
          />
        </div>

        {/* Color Format Information */}
        <div className="p-3 border rounded-md bg-muted/30">
          <p className="text-[10px] font-medium text-muted-foreground mb-2">
            🎨 Color Format Details:
          </p>
          <div className="space-y-1 text-[10px] text-muted-foreground">
            <div>
              • <strong>Format:</strong> Hex color (#RRGGBB)
            </div>
            <div>
              • <strong>Storage:</strong> Lowercase hex string
            </div>
            <div>
              • <strong>Example:</strong> #3b82f6 (blue), #ef4444 (red)
            </div>
            <div>
              • <strong>Preview:</strong> Visual color swatch display
            </div>
          </div>
        </div>

        {/* Color Picker Features */}
        <div className="p-3 border rounded-md bg-muted/30">
          <p className="text-[10px] font-medium text-muted-foreground mb-2">
            🎨 Color Picker Features:
          </p>
          <div className="space-y-1 text-[10px] text-muted-foreground">
            <div>
              • <strong>Visual Selector:</strong> Click to open color picker
            </div>
            <div>
              • <strong>Hex Input:</strong> Manual hex color entry
            </div>
            <div>
              • <strong>Color Swatch:</strong> Live preview of selected color
            </div>
            <div>
              • <strong>Palette:</strong> Common color presets (optional)
            </div>
          </div>
        </div>

        {/* Common Use Cases */}
        <div className="p-3 border rounded-md bg-muted/30">
          <p className="text-[10px] font-medium text-muted-foreground mb-2">
            🎨 Common Use Cases:
          </p>
          <div className="space-y-1 text-[10px] text-muted-foreground">
            <div>
              • <strong>Branding:</strong> Brand color selection, logo colors
            </div>
            <div>
              • <strong>Design:</strong> UI themes, color schemes, preferences
            </div>
            <div>
              • <strong>Customization:</strong> Product colors, event colors
            </div>
            <div>
              • <strong>Organization:</strong> Category colors, status indicators
            </div>
          </div>
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
            <span className="text-[10px] text-muted-foreground">
              • required
            </span>
            <span className="text-[10px] text-muted-foreground">• regex</span>
            <span className="text-[10px] text-muted-foreground">
              • in (specific colors)
            </span>
            <span className="text-[10px] text-muted-foreground">
              • notin (restrict colors)
            </span>
          </div>
          <p className="text-[10px] text-purple-700 mt-2 font-medium">
            💡 Use "regex" to validate hex format. Use "in" to limit color
            choices.
          </p>
        </div>

        {/* Example Validation Configuration */}
        <Alert className="bg-amber-50 border-amber-200">
          <Info className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-xs text-amber-900">
            <strong>Example Validation:</strong> Add "regex" rule with props:{" "}
            <code className="bg-amber-100 px-1 rounded">
              {`{ "pattern": "/^#([A-Fa-f0-9]{6})$/" }`}
            </code>{" "}
            to ensure valid hex format. Or use "in" with props:{" "}
            <code className="bg-amber-100 px-1 rounded">
              {`{ "values": ["#3b82f6", "#ef4444", "#10b981"] }`}
            </code>{" "}
            to limit color palette.
          </AlertDescription>
        </Alert>
      </div>
    </Card>
  );
}
