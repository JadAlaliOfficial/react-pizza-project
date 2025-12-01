// components/field-rules/UniqueRule.tsx
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useState } from "react";

export function UniqueRule() {
  const [enabled, setEnabled] = useState(false);
  return (
    <div className="space-y-3 p-3 border rounded-md hover:bg-accent/50 transition-colors">
      <div className="flex items-center space-x-2">
        <Checkbox
          id="rule-unique"
          checked={enabled}
          onCheckedChange={(val) => setEnabled(!!val)}
        />
        <div className="flex-1">
          <Label
            htmlFor="rule-unique"
            className="text-sm font-medium cursor-pointer"
          >
            Unique
          </Label>
          <p className="text-xs text-muted-foreground mt-0.5">
            Value must be unique across all entries
          </p>
        </div>
      </div>
    </div>
  );
}
