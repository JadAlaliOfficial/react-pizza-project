// src/features/formVersion/components/preview/PhoneInputPreview.tsx

/**
 * Phone Input Preview Component
 *
 * Displays a preview of how the Phone Input field will appear in the form
 * Shows phone-specific features like type="tel" and format guidance
 */

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Phone } from "lucide-react";
import type { Field } from "@/features/formBuilder/formVersions/types";

type PhoneInputPreviewProps = {
  field: Field;
};

export function PhoneInputPreview({ field }: PhoneInputPreviewProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Phone className="h-3 w-3 text-cyan-500" />
        <Label className="text-sm font-medium">
          {field.label}
          {/* You can add a required indicator based on field rules */}
        </Label>
        <Badge variant="secondary" className="text-[10px]">
          Phone
        </Badge>
      </div>

      <Input
        type="tel"
        placeholder={field.placeholder ?? "+1 (555) 123-4567"}
        defaultValue={field.default_value ?? undefined}
        disabled
        className="bg-muted/30"
      />

      {field.helper_text && (
        <p className="text-xs text-muted-foreground">{field.helper_text}</p>
      )}

      <p className="text-[10px] text-cyan-600 italic">
        ✓ Stored as-is without formatting. Use mobile-friendly tel keyboard.
      </p>
    </div>
  );
}