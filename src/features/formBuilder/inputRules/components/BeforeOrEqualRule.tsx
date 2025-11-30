// components/field-rules/BeforeOrEqualRule.tsx
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface BeforeOrEqualRuleProps {
  enabled: boolean;
  date?: string;
  onEnabledChange: (enabled: boolean) => void;
  onDateChange: (date: string | undefined) => void;
}

export function BeforeOrEqualRule({
  enabled,
  date,
  onEnabledChange,
  onDateChange,
}: BeforeOrEqualRuleProps) {
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    onDateChange(value === "" ? undefined : value);
  };

  return (
    <div className="space-y-3 p-3 border rounded-md hover:bg-accent/50 transition-colors">
      <div className="flex items-center space-x-2">
        <Checkbox
          id="rule-before-or-equal"
          checked={enabled}
          onCheckedChange={onEnabledChange}
        />
        <div className="flex-1">
          <Label
            htmlFor="rule-before-or-equal"
            className="text-sm font-medium cursor-pointer"
          >
            Before Or Equal
          </Label>
          <p className="text-xs text-muted-foreground mt-0.5">
            Date must be before or equal to the specified date
          </p>
        </div>
      </div>

      {enabled && (
        <div className="ml-6 space-y-2">
          <Label htmlFor="before-or-equal-date-value" className="text-sm">
            Date <span className="text-destructive">*</span>
          </Label>
          <Input
            id="before-or-equal-date-value"
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
