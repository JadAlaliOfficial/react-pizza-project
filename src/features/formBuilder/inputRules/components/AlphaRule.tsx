// components/field-rules/AlphaRule.tsx
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useState } from "react";

export function AlphaRule() {
  const [enabled, setEnabled] = useState(false);
  return (
    <div className="flex items-center space-x-2 p-3 border rounded-md hover:bg-accent/50 transition-colors">
      <Checkbox
        id="rule-alpha"
        checked={enabled}
        onCheckedChange={(val) => setEnabled(!!val)}
      />
      <div className="flex-1">
        <Label
          htmlFor="rule-alpha"
          className="text-sm font-medium cursor-pointer"
        >
          Alpha
        </Label>
        <p className="text-xs text-muted-foreground mt-0.5">
          Field must contain only alphabetic characters
        </p>
      </div>
    </div>
  );
}
