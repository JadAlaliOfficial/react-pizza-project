// components/field-rules/LongitudeRule.tsx
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useState } from "react";

export function LongitudeRule() {
  const [enabled, setEnabled] = useState(false);
  return (
    <div className="space-y-3 p-3 border rounded-md hover:bg-accent/50 transition-colors">
      <div className="flex items-center space-x-2">
        <Checkbox
          id="rule-longitude"
          checked={enabled}
          onCheckedChange={(val) => setEnabled(!!val)}
        />
        <div className="flex-1">
          <Label
            htmlFor="rule-longitude"
            className="text-sm font-medium cursor-pointer"
          >
            Longitude
          </Label>
          <p className="text-xs text-muted-foreground mt-0.5">
            Must be a valid longitude coordinate (-180 to 180)
          </p>
        </div>
      </div>
    </div>
  );
}
