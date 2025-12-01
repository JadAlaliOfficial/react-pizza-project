// components/field-rules/RegexRule.tsx
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useState, type ChangeEvent } from "react";

export function RegexRule() {
  const [enabled, setEnabled] = useState(false);
  const [pattern, setPattern] = useState<string | undefined>(undefined);
  const handlePatternChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.trim();
    setPattern(value === "" ? undefined : value);
  };

  return (
    <div className="space-y-3 p-3 border rounded-md hover:bg-accent/50 transition-colors">
      <div className="flex items-center space-x-2">
        <Checkbox
          id="rule-regex"
          checked={enabled}
          onCheckedChange={(val) => setEnabled(!!val)}
        />
        <div className="flex-1">
          <Label
            htmlFor="rule-regex"
            className="text-sm font-medium cursor-pointer"
          >
            Regex
          </Label>
          <p className="text-xs text-muted-foreground mt-0.5">
            Field must match the regular expression pattern
          </p>
        </div>
      </div>

      {enabled && (
        <div className="ml-6 space-y-2">
          <Label htmlFor="regex-pattern" className="text-sm">
            Pattern <span className="text-destructive">*</span>
          </Label>
          <Input
            id="regex-pattern"
            type="text"
            placeholder="e.g., ^[A-Z0-9]+$"
            value={pattern ?? ""}
            onChange={handlePatternChange}
            required={enabled}
            className="max-w-md font-mono text-sm"
          />
          <p className="text-xs text-muted-foreground">
            Enter a valid regular expression pattern
          </p>
        </div>
      )}
    </div>
  );
}
