// src/features/formVersion/components/preview/TextInputPreview.tsx

/**
 * Text Input Preview Component
 *
 * Displays a preview of how the Text Input field will appear in the form
 */

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Field } from "@/features/formBuilder/formVersions/types";

type TextInputPreviewProps = {
  field: Field;
};

export function TextInputPreview({ field }: TextInputPreviewProps) {
  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">
        {field.label}
        {/* You can add a required indicator based on field rules */}
      </Label>
      <Input
        placeholder={field.placeholder ?? undefined}
        defaultValue={field.default_value ?? undefined}
        disabled
        className="bg-muted/30"
      />
      {field.helper_text && (
        <p className="text-xs text-muted-foreground">{field.helper_text}</p>
      )}
    </div>
  );
}