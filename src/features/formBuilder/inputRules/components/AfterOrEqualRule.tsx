// components/field-rules/AfterOrEqualRule.tsx
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface AfterOrEqualRuleProps {
  enabled: boolean;
  date?: string;
  onEnabledChange: (enabled: boolean) => void;
  onDateChange: (date: string | undefined) => void;
}

export function AfterOrEqualRule({
  enabled,
  date,
  onEnabledChange,
  onDateChange,
}: AfterOrEqualRuleProps) {
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    onDateChange(value === "" ? undefined : value);
  };

  return (
    <div className="space-y-3 p-3 border rounded-md hover:bg-accent/50 transition-colors">
      <div className="flex items-center space-x-2">
        <Checkbox
          id="rule-after-or-equal"
          checked={enabled}
          onCheckedChange={onEnabledChange}
        />
        <div className="flex-1">
          <Label
            htmlFor="rule-after-or-equal"
            className="text-sm font-medium cursor-pointer"
          >
            After Or Equal
          </Label>
          <p className="text-xs text-muted-foreground mt-0.5">
            Date must be after or equal to the specified date
          </p>
        </div>
      </div>

      {enabled && (
        <div className="ml-6 space-y-2">
          <Label htmlFor="after-or-equal-date-value" className="text-sm">
            Date <span className="text-destructive">*</span>
          </Label>
          <Input
            id="after-or-equal-date-value"
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
