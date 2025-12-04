// src/features/formVersion/components/preview/TimeInputPreview.tsx

/**
 * Time Input Preview Component
 *
 * Displays a preview of how the Time Input field will appear in the form
 * Shows native time picker with clock interface
 */

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Clock } from "lucide-react";
import type { Field } from "@/features/formBuilder/formVersions/types";

type TimeInputPreviewProps = {
  field: Field;
};

export function TimeInputPreview({ field }: TimeInputPreviewProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Clock className="h-3 w-3 text-teal-500" />
        <Label className="text-sm font-medium">
          {field.label}
          {/* You can add a required indicator based on field rules */}
        </Label>
        <Badge variant="secondary" className="text-[10px]">
          Time
        </Badge>
      </div>

      <Input
        type="time"
        placeholder={field.placeholder ?? "HH:MM"}
        defaultValue={field.default_value ?? undefined}
        disabled
        className="bg-muted/30"
      />

      {field.helper_text && (
        <p className="text-xs text-muted-foreground">{field.helper_text}</p>
      )}

      <p className="text-[10px] text-teal-600 italic">
        ✓ Normalized to HH:MM:SS format (24-hour). Supports time range
        validation.
      </p>
    </div>
  );
}
