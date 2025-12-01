// components/field-rules/InRule.tsx
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useState, type ChangeEvent } from "react";

export function InRule() {
  const [enabled, setEnabled] = useState(false);
  const [values, setValues] = useState<string[] | undefined>(undefined);
  const handleValuesChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const valuesArray = value === "" ? undefined : value.split(",").map((v) => v.trim());
    setValues(valuesArray);
  };

  return (
    <div className="space-y-3 p-3 border rounded-md hover:bg-accent/50 transition-colors">
      <div className="flex items-center space-x-2">
        <Checkbox
          id="rule-in"
          checked={enabled}
          onCheckedChange={(val) => setEnabled(!!val)}
        />
        <div className="flex-1">
          <Label
            htmlFor="rule-in"
            className="text-sm font-medium cursor-pointer"
          >
            In
          </Label>
          <p className="text-xs text-muted-foreground mt-0.5">
            Field value must be one of the specified values
          </p>
        </div>
      </div>

      {enabled && (
        <div className="ml-6 space-y-2">
          <Label htmlFor="in-values" className="text-sm">
            Allowed Values <span className="text-destructive">*</span>
          </Label>
          <Input
            id="in-values"
            type="text"
            placeholder="e.g., option1, option2, option3"
            value={values?.join(", ") ?? ""}
            onChange={handleValuesChange}
            required={enabled}
          />
          <p className="text-xs text-muted-foreground">
            Comma-separated list of allowed values
          </p>
        </div>
      )}
    </div>
  );
}
