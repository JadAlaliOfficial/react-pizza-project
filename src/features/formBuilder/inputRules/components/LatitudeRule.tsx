// components/field-rules/LatitudeRule.tsx
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useState } from "react";

export function LatitudeRule() {
  const [enabled, setEnabled] = useState(false);
  return (
    <div className="space-y-3 p-3 border rounded-md hover:bg-accent/50 transition-colors">
      <div className="flex items-center space-x-2">
        <Checkbox
          id="rule-latitude"
          checked={enabled}
          onCheckedChange={(val) => setEnabled(!!val)}
        />
        <div className="flex-1">
          <Label
            htmlFor="rule-latitude"
            className="text-sm font-medium cursor-pointer"
          >
            Latitude
          </Label>
          <p className="text-xs text-muted-foreground mt-0.5">
            Must be a valid latitude coordinate (-90 to 90)
          </p>
        </div>
      </div>
    </div>
  );
}
