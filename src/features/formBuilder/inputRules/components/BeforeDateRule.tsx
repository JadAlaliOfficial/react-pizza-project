// components/field-rules/BeforeDateRule.tsx
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useState, type ChangeEvent } from "react";

export function BeforeDateRule() {
  const [enabled, setEnabled] = useState(false);
  const [date, setDate] = useState<string | undefined>(undefined);
  const handleDateChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setDate(value === "" ? undefined : value);
  };

  return (
    <div className="space-y-3 p-3 border rounded-md hover:bg-accent/50 transition-colors">
      <div className="flex items-center space-x-2">
        <Checkbox
          id="rule-before-date"
          checked={enabled}
          onCheckedChange={(val) => setEnabled(!!val)}
        />
        <div className="flex-1">
          <Label
            htmlFor="rule-before-date"
            className="text-sm font-medium cursor-pointer"
          >
            Before Date
          </Label>
          <p className="text-xs text-muted-foreground mt-0.5">
            Field must be a date before the specified date
          </p>
        </div>
      </div>

      {enabled && (
        <div className="ml-6 space-y-2">
          <Label htmlFor="before-date-value" className="text-sm">
            Date <span className="text-destructive">*</span>
          </Label>
          <Input
            id="before-date-value"
            type="date"
            value={date ?? ""}
            onChange={handleDateChange}
            required={enabled}
            className="max-w-xs"
          />
        </div>
      )}
    </div>
  );
}
