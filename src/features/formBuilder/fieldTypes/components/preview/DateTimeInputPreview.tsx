// src/features/formVersion/components/preview/DateTimeInputPreview.tsx

/**
 * DateTime Input Preview Component
 *
 * Displays a preview of how the DateTime Input field will appear in the form
 * Shows native datetime-local picker with both date and time selection
 */

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { CalendarClock } from "lucide-react";
import type { Field } from "@/features/formBuilder/formVersions/types";

type DateTimeInputPreviewProps = {
  field: Field;
};

export function DateTimeInputPreview({ field }: DateTimeInputPreviewProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <CalendarClock className="h-3 w-3 text-purple-500" />
        <Label className="text-sm font-medium">
          {field.label}
          {/* You can add a required indicator based on field rules */}
        </Label>
        <Badge variant="secondary" className="text-[10px]">
          DateTime
        </Badge>
      </div>

      <Input
        type="datetime-local"
        placeholder={field.placeholder ?? "YYYY-MM-DD HH:MM"}
        defaultValue={field.default_value ?? undefined}
        disabled
        className="bg-muted/30"
      />

      {field.helper_text && (
        <p className="text-xs text-muted-foreground">{field.helper_text}</p>
      )}

      <p className="text-[10px] text-purple-600 italic">
        ✓ Normalized to YYYY-MM-DD HH:MM:SS format. Combines date and time in a
        single field.
      </p>
    </div>
  );
}