// src/features/formVersion/components/preview/MultiSelectPreview.tsx

/**
 * Multi-Select Preview Component
 *
 * Displays a preview of how the Multi-Select field will appear in the form
 * Shows checkbox list with all options
 */

import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { CheckSquare } from "lucide-react";
import type { Field } from "@/features/formBuilder/formVersions/types";

type MultiSelectPreviewProps = {
  field: Field;
};

export function MultiSelectPreview({ field }: MultiSelectPreviewProps) {
  // Parse options from placeholder
  const getOptions = (): string[] => {
    try {
      if (!field.placeholder) return ["Option 1", "Option 2", "Option 3"];
      const parsed = JSON.parse(field.placeholder);
      return Array.isArray(parsed) && parsed.length > 0
        ? parsed
        : ["Option 1", "Option 2", "Option 3"];
    } catch {
      return ["Option 1", "Option 2", "Option 3"];
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

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 mb-1">
        <CheckSquare className="h-3 w-3 text-indigo-500" />
        <Label className="text-sm font-medium">
          {field.label}
          {/* You can add a required indicator based on field rules */}
        </Label>
        <Badge variant="secondary" className="text-[10px]">
          Multi-Select
        </Badge>
      </div>

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

      {field.helper_text && (
        <p className="text-xs text-muted-foreground">{field.helper_text}</p>
      )}

      <p className="text-[10px] text-indigo-600 italic">
        ✓ Multiple selections allowed. Options: {options.length}. Selected by
        default: {defaultSelected.length}. Values stored as JSON array.
      </p>
    </div>
  );
}
