// src/features/formVersion/components/preview/DateInputPreview.tsx

/**
 * Date Input Preview Component
 *
 * Displays a preview of how the Date Input field will appear in the form
 * Shows native date picker with calendar interface
 */

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "lucide-react";
import type { Field } from "@/features/formBuilder/formVersions/types";

type DateInputPreviewProps = {
  field: Field;
};

export function DateInputPreview({ field }: DateInputPreviewProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Calendar className="h-3 w-3 text-indigo-500" />
        <Label className="text-sm font-medium">
          {field.label}
          {/* You can add a required indicator based on field rules */}
        </Label>
        <Badge variant="secondary" className="text-[10px]">
          Date
        </Badge>
      </div>

      <Input
        type="date"
        placeholder={field.placeholder ?? "YYYY-MM-DD"}
        defaultValue={field.default_value ?? undefined}
        disabled
        className="bg-muted/30"
      />

      {field.helper_text && (
        <p className="text-xs text-muted-foreground">{field.helper_text}</p>
      )}

      <p className="text-[10px] text-indigo-600 italic">
        ✓ Normalized to YYYY-MM-DD format. Supports date range validation.
      </p>
    </div>
  );
}
