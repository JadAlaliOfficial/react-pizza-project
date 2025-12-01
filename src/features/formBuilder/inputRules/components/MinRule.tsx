// components/field-rules/MinRule.tsx
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useState, type ChangeEvent } from "react";

export function MinRule() {
  const [enabled, setEnabled] = useState(false);
  const [value, setValue] = useState<number | undefined>(undefined);
  const handleValueChange = (e: ChangeEvent<HTMLInputElement>) => {
    const numValue = e.target.value === "" ? undefined : Number(e.target.value);
    setValue(numValue);
  };

  return (
    <div className="space-y-3 p-3 border rounded-md hover:bg-accent/50 transition-colors">
      <div className="flex items-center space-x-2">
        <Checkbox
          id="rule-min"
          checked={enabled}
          onCheckedChange={(val) => setEnabled(!!val)}
        />
        <div className="flex-1">
          <Label
            htmlFor="rule-min"
            className="text-sm font-medium cursor-pointer"
          >
            Minimum
          </Label>
          <p className="text-xs text-muted-foreground mt-0.5">
            Field value must be at least this value
          </p>
        </div>
      </div>

      {enabled && (
        <div className="ml-6 space-y-2">
          <Label htmlFor="min-value" className="text-sm">
            Minimum value <span className="text-destructive">*</span>
          </Label>
          <Input
            id="min-value"
            type="number"
            placeholder="Enter minimum value"
            value={value ?? ""}
            onChange={handleValueChange}
            required={enabled}
            className="max-w-xs"
          />
        </div>
      )}
    </div>
  );
}
