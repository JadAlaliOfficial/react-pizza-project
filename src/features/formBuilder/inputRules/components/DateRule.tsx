// components/field-rules/DateRule.tsx
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface DateRuleProps {
  enabled: boolean;
  onEnabledChange: (enabled: boolean) => void;
}

export function DateRule({ enabled, onEnabledChange }: DateRuleProps) {
  return (
    <div className="flex items-center space-x-2 p-3 border rounded-md hover:bg-accent/50 transition-colors">
      <Checkbox
        id="rule-date"
        checked={enabled}
        onCheckedChange={onEnabledChange}
      />
      <div className="flex-1">
        <Label
          htmlFor="rule-date"
          className="text-sm font-medium cursor-pointer"
        >
          Date
        </Label>
        <p className="text-xs text-muted-foreground mt-0.5">
          Field must be a valid date
        </p>
      </div>
    </div>
  );
}
