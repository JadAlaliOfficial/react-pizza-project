// components/field-rules/DateFormatRule.tsx
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface DateFormatRuleProps {
  enabled: boolean;
  format?: string;
  onEnabledChange: (enabled: boolean) => void;
  onFormatChange: (format: string | undefined) => void;
}

export function DateFormatRule({
  enabled,
  format,
  onEnabledChange,
  onFormatChange,
}: DateFormatRuleProps) {
  const handleFormatChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.trim();
    onFormatChange(value === "" ? undefined : value);
  };

  return (
    <div className="space-y-3 p-3 border rounded-md hover:bg-accent/50 transition-colors">
      <div className="flex items-center space-x-2">
        <Checkbox
          id="rule-date-format"
          checked={enabled}
          onCheckedChange={onEnabledChange}
        />
        <div className="flex-1">
          <Label
            htmlFor="rule-date-format"
            className="text-sm font-medium cursor-pointer"
          >
            Date Format
          </Label>
          <p className="text-xs text-muted-foreground mt-0.5">
            Date must match a specific format
          </p>
        </div>
      </div>

      {enabled && (
        <div className="ml-6 space-y-2">
          <Label htmlFor="date-format-value" className="text-sm">
            Format <span className="text-destructive">*</span>
          </Label>
          <Input
            id="date-format-value"
            type="text"
            placeholder="e.g., Y-m-d, m/d/Y, d-m-Y H:i:s"
            value={format ?? ""}
            onChange={handleFormatChange}
            required={enabled}
            className="max-w-md font-mono text-sm"
          />
          <p className="text-xs text-muted-foreground">
            PHP date format (e.g., Y-m-d for 2024-12-31, m/d/Y for 12/31/2024)
          </p>
        </div>
      )}
    </div>
  );
}
