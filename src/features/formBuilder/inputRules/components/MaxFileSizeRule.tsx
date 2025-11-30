// components/field-rules/MaxFileSizeRule.tsx
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface MaxFileSizeRuleProps {
  enabled: boolean;
  maxsize?: number;
  onEnabledChange: (enabled: boolean) => void;
  onMaxSizeChange: (maxsize: number | undefined) => void;
}

export function MaxFileSizeRule({
  enabled,
  maxsize,
  onEnabledChange,
  onMaxSizeChange,
}: MaxFileSizeRuleProps) {
  const handleMaxSizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    onMaxSizeChange(value === "" ? undefined : Number(value));
  };

  return (
    <div className="space-y-3 p-3 border rounded-md hover:bg-accent/50 transition-colors">
      <div className="flex items-center space-x-2">
        <Checkbox
          id="rule-max-file-size"
          checked={enabled}
          onCheckedChange={onEnabledChange}
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
