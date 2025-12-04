// src/features/formVersion/components/preview/ColorPickerPreview.tsx

/**
 * Color Picker Preview Component
 *
 * Displays a preview of how the Color Picker field will appear in the form
 * Shows color picker input with visual color swatch
 */

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Palette } from "lucide-react";
import type { Field } from "@/features/formBuilder/formVersions/types";

type ColorPickerPreviewProps = {
  field: Field;
};

export function ColorPickerPreview({ field }: ColorPickerPreviewProps) {
  const defaultColor = field.default_value || "#3B82F6";

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Palette className="h-3 w-3 text-purple-500" />
        <Label className="text-sm font-medium">
          {field.label}
          {/* You can add a required indicator based on field rules */}
        </Label>
        <Badge variant="secondary" className="text-[10px]">
          Color Picker
        </Badge>
      </div>

      {/* Color Picker Input */}
      <div className="space-y-2">
        {/* Visual Color Display */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Input
              type="text"
              placeholder={field.placeholder || "Select a color"}
              defaultValue={defaultColor}
              disabled
              className="pl-12 h-10 bg-white font-mono"
            />
            <div
              className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded border-2 border-gray-300 shadow-sm"
              style={{ backgroundColor: defaultColor }}
            ></div>
          </div>
          {/* Color Picker Button */}
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
          {["#ef4444", "#f59e0b", "#10b981", "#3b82f6", "#8b5cf6", "#ec4899"].map(
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

      <p className="text-[10px] text-purple-600 italic">
        ✓ Color picker with visual preview. Values stored as hex (#rrggbb).
        Filter by exact color or color range.
      </p>
    </div>
  );
}
