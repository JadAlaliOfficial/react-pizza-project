// components/field-rules/IntegerRule.tsx
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface IntegerRuleProps {
  enabled: boolean;
  onEnabledChange: (enabled: boolean) => void;
}

export function IntegerRule({ enabled, onEnabledChange }: IntegerRuleProps) {
  return (
    <div className="flex items-center space-x-2 p-3 border rounded-md hover:bg-accent/50 transition-colors">
      <Checkbox
        id="rule-integer"
        checked={enabled}
        onCheckedChange={onEnabledChange}
      />
      <div className="flex-1">
        <Label
          htmlFor="rule-integer"
          className="text-sm font-medium cursor-pointer"
        >
          Integer
        </Label>
        <p className="text-xs text-muted-foreground mt-0.5">
          Field must be an integer value (no decimals)
        </p>
      </div>
    </div>
  );
}
