// src/features/formVersion/components/preview/PasswordInputPreview.tsx

/**
 * Password Input Preview Component
 *
 * Displays a preview of how the Password Input field will appear in the form
 * Shows password input with toggle visibility and strength indicator
 */

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Lock, Eye  } from "lucide-react";
import type { Field } from "@/features/formBuilder/formVersions/types";

type PasswordInputPreviewProps = {
  field: Field;
};

export function PasswordInputPreview({ field }: PasswordInputPreviewProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Lock className="h-3 w-3 text-red-500" />
        <Label className="text-sm font-medium">
          {field.label}
          {/* You can add a required indicator based on field rules */}
        </Label>
      </div>

      {/* Password Input with Toggle Visibility */}
      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2">
          <Lock className="h-4 w-4 text-red-500" />
        </div>
        <Input
          type="password"
          placeholder={field.placeholder || ""}
          disabled
          className="pl-9 pr-10 h-10 bg-white"
        />
        {/* Toggle Visibility Button */}
        <Button
          size="sm"
          variant="ghost"
          className="absolute right-1 top-1/2 -translate-y-1/2 h-8 px-2"
          disabled
        >
          <Eye className="h-4 w-4 text-muted-foreground" />
        </Button>
      </div>

      {/* Password Strength Indicator */}
      <div className="space-y-1">
        <div className="flex gap-1">
          <div className="h-1.5 flex-1 rounded-full bg-red-200"></div>
          <div className="h-1.5 flex-1 rounded-full bg-muted"></div>
          <div className="h-1.5 flex-1 rounded-full bg-muted"></div>
          <div className="h-1.5 flex-1 rounded-full bg-muted"></div>
        </div>
        <p className="text-[10px] text-muted-foreground">
          Password strength: <span className="text-red-600 font-medium">Weak</span>
        </p>
      </div>

      {field.helper_text && (
        <p className="text-xs text-muted-foreground">{field.helper_text}</p>
      )}

      
    </div>
  );
}
