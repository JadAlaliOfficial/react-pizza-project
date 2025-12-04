// src/features/formVersion/components/preview/CheckboxPreview.tsx

/**
 * Checkbox Preview Component
 *
 * Displays a preview of how the Checkbox field will appear in the form
 * Shows checkbox with label next to it
 */

import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { CheckSquare } from "lucide-react";
import type { Field } from "@/features/formBuilder/formVersions/types";

type CheckboxPreviewProps = {
  field: Field;
};

export function CheckboxPreview({ field }: CheckboxPreviewProps) {
  const isDefaultChecked = field.default_value === "1";

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 mb-1">
        <CheckSquare className="h-3 w-3 text-emerald-500" />
        <Badge variant="secondary" className="text-[10px]">
          Checkbox
        </Badge>
      </div>

      <div className="flex items-center space-x-3">
        <Checkbox
          id={`preview-checkbox-${field.id}`}
          defaultChecked={isDefaultChecked}
          disabled
        />
        <Label
          htmlFor={`preview-checkbox-${field.id}`}
          className="text-sm font-medium cursor-pointer"
        >
          {field.label}
          {/* You can add a required indicator based on field rules */}
        </Label>
      </div>

      {field.helper_text && (
        <p className="text-xs text-muted-foreground ml-7">
          {field.helper_text}
        </p>
      )}

      <p className="text-[10px] text-emerald-600 italic ml-7">
        ✓ Value: "1" (checked) or "0" (unchecked). Binary boolean field.
      </p>
    </div>
  );
}
