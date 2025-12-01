// components/field-rules/JSONRule.tsx
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useState } from "react";

export function JSONRule() {
  const [enabled, setEnabled] = useState(false);
  return (
    <div className="space-y-3 p-3 border rounded-md hover:bg-accent/50 transition-colors">
      <div className="flex items-center space-x-2">
        <Checkbox
          id="rule-json"
          checked={enabled}
          onCheckedChange={(val) => setEnabled(!!val)}
        />
        <div className="flex-1">
          <Label
            htmlFor="rule-json"
            className="text-sm font-medium cursor-pointer"
          >
            JSON
          </Label>
          <p className="text-xs text-muted-foreground mt-0.5">
            Field must contain valid JSON format
          </p>
        </div>
      </div>
    </div>
  );
}
