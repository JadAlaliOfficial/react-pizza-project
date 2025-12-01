// components/field-rules/EndsWithRule.tsx
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useState } from "react";

export function EndsWithRule() {
  const [enabled, setEnabled] = useState(false);
  const [values, setValues] = useState<string | undefined>(undefined);
  const handleValuesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setValues(value === "" ? undefined : value);
  };

  return (
    <div className="space-y-3 p-3 border rounded-md hover:bg-accent/50 transition-colors">
      <div className="flex items-center space-x-2">
        <Checkbox
          id="rule-ends-with"
          checked={enabled}
          onCheckedChange={(val) => setEnabled(!!val)}
        />
        <div className="flex-1">
          <Label
            htmlFor="rule-ends-with"
            className="text-sm font-medium cursor-pointer"
          >
            Ends With
          </Label>
          <p className="text-xs text-muted-foreground mt-0.5">
            String must end with specified values
          </p>
        </div>
      </div>

      {enabled && (
        <div className="ml-6 space-y-2">
          <Label htmlFor="ends-with-values" className="text-sm">
            Suffix Values <span className="text-destructive">*</span>
          </Label>
          <Input
            id="ends-with-values"
            type="text"
            placeholder="e.g., .com, .org (comma-separated)"
            value={values ?? ""}
            onChange={handleValuesChange}
            required={enabled}
          />
          <p className="text-xs text-muted-foreground">
            Enter one or more values separated by commas
          </p>
        </div>
      )}
    </div>
  );
}
