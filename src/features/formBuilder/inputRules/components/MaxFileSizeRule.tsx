// components/field-rules/MaxFileSizeRule.tsx
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useState, type ChangeEvent } from "react";

export function MaxFileSizeRule() {
  const [enabled, setEnabled] = useState(false);
  const [maxsize, setMaxsize] = useState<number | undefined>(undefined);
  const handleMaxSizeChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setMaxsize(value === "" ? undefined : Number(value));
  };

  return (
    <div className="space-y-3 p-3 border rounded-md hover:bg-accent/50 transition-colors">
      <div className="flex items-center space-x-2">
        <Checkbox
          id="rule-max-file-size"
          checked={enabled}
          onCheckedChange={(val) => setEnabled(!!val)}
        />
        <div className="flex-1">
          <Label
            htmlFor="rule-max-file-size"
            className="text-sm font-medium cursor-pointer"
          >
            Max File Size
          </Label>
          <p className="text-xs text-muted-foreground mt-0.5">
            Maximum file size in kilobytes (e.g., 30MB = 30720)
          </p>
        </div>
      </div>

      {enabled && (
        <div className="ml-6 space-y-2">
          <Label htmlFor="max-file-size-value" className="text-sm">
            Max Size (KB) <span className="text-destructive">*</span>
          </Label>
          <Input
            id="max-file-size-value"
            type="number"
            min="0"
            step="1"
            placeholder="e.g., 30720 (30MB)"
            value={maxsize ?? ""}
            onChange={handleMaxSizeChange}
            required={enabled}
            className="max-w-xs"
          />
          <p className="text-xs text-muted-foreground">
            Maximum size in kilobytes (1 MB = 1024 KB, 10 MB = 10240 KB)
          </p>
        </div>
      )}
    </div>
  );
}
