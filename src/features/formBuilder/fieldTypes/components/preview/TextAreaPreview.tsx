// src/features/formVersion/components/preview/TextAreaPreview.tsx

/**
 * Text Area Preview Component
 *
 * Displays a preview of how the Text Area field will appear in the form
 * Shows multi-line text support with proper formatting
 */

import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { AlignLeft } from "lucide-react";
import type { Field } from "@/features/formBuilder/formVersions/types";

type TextAreaPreviewProps = {
  field: Field;
};

export function TextAreaPreview({ field }: TextAreaPreviewProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <AlignLeft className="h-3 w-3 text-orange-500" />
        <Label className="text-sm font-medium">
          {field.label}
          {/* You can add a required indicator based on field rules */}
        </Label>
      </div>

      <Textarea
        placeholder={field.placeholder ?? "Enter your text here..."}
        defaultValue={field.default_value ?? undefined}
        disabled
        className="bg-muted/30 min-h-[100px]"
        rows={4}
      />

      {field.helper_text && (
        <p className="text-xs text-muted-foreground">{field.helper_text}</p>
      )}

    </div>
  );
}
