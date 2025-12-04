// src/features/formVersion/components/preview/EmailInputPreview.tsx

/**
 * Email Input Preview Component
 *
 * Displays a preview of how the Email Input field will appear in the form
 * Shows email-specific features like type="email" and lowercase hint
 */

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Mail } from "lucide-react";
import type { Field } from "@/features/formBuilder/formVersions/types";

type EmailInputPreviewProps = {
  field: Field;
};

export function EmailInputPreview({ field }: EmailInputPreviewProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Mail className="h-3 w-3 text-purple-500" />
        <Label className="text-sm font-medium">
          {field.label}
          {/* You can add a required indicator based on field rules */}
        </Label>
        <Badge variant="secondary" className="text-[10px]">
          Email
        </Badge>
      </div>
      
      <Input
        type="email"
        placeholder={field.placeholder ?? "your@email.com"}
        defaultValue={field.default_value ?? undefined}
        disabled
        className="bg-muted/30"
      />
      
      {field.helper_text && (
        <p className="text-xs text-muted-foreground">{field.helper_text}</p>
      )}
      
      <p className="text-[10px] text-purple-600 italic">
        ✓ Automatically validated and converted to lowercase
      </p>
    </div>
  );
}
