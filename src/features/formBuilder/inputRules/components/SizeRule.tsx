// components/field-rules/SizeRule.tsx
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useState, type ChangeEvent } from "react";

export function SizeRule() {
  const [enabled, setEnabled] = useState(false);
  const [size, setSize] = useState<number | undefined>(undefined);
  const handleSizeChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSize(value === "" ? undefined : Number(value));
  };

  return (
    <div className="space-y-3 p-3 border rounded-md hover:bg-accent/50 transition-colors">
      <div className="flex items-center space-x-2">
        <Checkbox
          id="rule-size"
          checked={enabled}
          onCheckedChange={(val) => setEnabled(!!val)}
        />
        <div className="flex-1">
          <Label
            htmlFor="rule-size"
            className="text-sm font-medium cursor-pointer"
          >
            Size
          </Label>
          <p className="text-xs text-muted-foreground mt-0.5">
            File size must be equal to specified size in kilobytes
          </p>
        </div>
      </div>

      {enabled && (
        <div className="ml-6 space-y-2">
          <Label htmlFor="size-value" className="text-sm">
            Size (KB) <span className="text-destructive">*</span>
          </Label>
          <Input
            id="size-value"
            type="number"
            min="0"
            step="1"
            placeholder="e.g., 1024"
            value={size ?? ""}
            onChange={handleSizeChange}
            required={enabled}
            className="max-w-xs"
          />
          <p className="text-xs text-muted-foreground">
            Exact file size in kilobytes (1 MB = 1024 KB)
          </p>
        </div>
      )}
    </div>
  );
}
