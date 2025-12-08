// src/features/formVersion/components/preview/RadioButtonPreview.tsx

/**
 * Radio Button Preview Component
 *
 * Displays a preview of how the Radio Button field will appear in the form
 * Shows all options with radio buttons
 */

import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Circle } from "lucide-react";
import type { Field } from "@/features/formBuilder/formVersions/types";

type RadioButtonPreviewProps = {
  field: Field;
};

export function RadioButtonPreview({ field }: RadioButtonPreviewProps) {
  // Parse options from placeholder
  const getOptions = (): string[] => {
    try {
      if (!field.placeholder) return ["Option 1", "Option 2"];
      const parsed = JSON.parse(field.placeholder);
      return Array.isArray(parsed) && parsed.length > 0
        ? parsed
        : ["Option 1", "Option 2"];
    } catch {
      return ["Option 1", "Option 2"];
    }
  };

  const options = getOptions();

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 mb-1">
        <Circle className="h-3 w-3 text-cyan-500" />
        <Label className="text-sm font-medium">
          {field.label}
          {/* You can add a required indicator based on field rules */}
        </Label>
        <Badge variant="secondary" className="text-[10px]">
          Radio
        </Badge>
      </div>

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

      {field.helper_text && (
        <p className="text-xs text-muted-foreground">{field.helper_text}</p>
      )}

      <p className="text-[10px] text-cyan-600 italic">
        ✓ Single selection. Options: {options.length}. Mutually exclusive
        choices.
      </p>
    </div>
  );
}
