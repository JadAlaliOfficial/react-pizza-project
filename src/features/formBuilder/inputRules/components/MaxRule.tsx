// components/field-rules/MaxRule.tsx
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useState, type ChangeEvent } from "react";

export function MaxRule() {
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
          id="rule-max"
          checked={enabled}
          onCheckedChange={(val) => setEnabled(!!val)}
        />
        <div className="flex-1">
          <Label
            htmlFor="rule-max"
            className="text-sm font-medium cursor-pointer"
          >
            Maximum
          </Label>
          <p className="text-xs text-muted-foreground mt-0.5">
            Field value must not exceed this value
          </p>
        </div>
      </div>

      {enabled && (
        <div className="ml-6 space-y-2">
          <Label htmlFor="max-value" className="text-sm">
            Maximum value <span className="text-destructive">*</span>
          </Label>
          <Input
            id="max-value"
            type="number"
            placeholder="Enter maximum value"
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
