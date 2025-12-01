// components/field-rules/MinFileSizeRule.tsx
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useState, type ChangeEvent } from "react";

export function MinFileSizeRule() {
  const [enabled, setEnabled] = useState(false);
  const [minsize, setMinsize] = useState<number | undefined>(undefined);
  const handleMinSizeChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setMinsize(value === "" ? undefined : Number(value));
  };

  return (
    <div className="space-y-3 p-3 border rounded-md hover:bg-accent/50 transition-colors">
      <div className="flex items-center space-x-2">
        <Checkbox
          id="rule-min-file-size"
          checked={enabled}
          onCheckedChange={(val) => setEnabled(!!val)}
        />
        <div className="flex-1">
          <Label
            htmlFor="rule-min-file-size"
            className="text-sm font-medium cursor-pointer"
          >
            Min File Size
          </Label>
          <p className="text-xs text-muted-foreground mt-0.5">
            Minimum file size in kilobytes
          </p>
        </div>
      </div>

      {enabled && (
        <div className="ml-6 space-y-2">
          <Label htmlFor="min-file-size-value" className="text-sm">
            Min Size (KB) <span className="text-destructive">*</span>
          </Label>
          <Input
            id="min-file-size-value"
            type="number"
            min="0"
            step="1"
            placeholder="e.g., 100"
            value={minsize ?? ""}
            onChange={handleMinSizeChange}
            required={enabled}
            className="max-w-xs"
          />
          <p className="text-xs text-muted-foreground">
            Minimum size in kilobytes (1 MB = 1024 KB)
          </p>
        </div>
      )}
    </div>
  );
}
