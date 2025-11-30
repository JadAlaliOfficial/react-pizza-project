// components/field-rules/AlphaNumericRule.tsx
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface AlphaNumericRule {
  enabled: boolean;
  onEnabledChange: (enabled: boolean) => void;
}

export function AlphaNumericRule({ enabled, onEnabledChange }: AlphaNumericRule) {
  return (
    <div className="flex items-center space-x-2 p-3 border rounded-md hover:bg-accent/50 transition-colors">
      <Checkbox
        id="rule-alpha-numeric"
        checked={enabled}
        onCheckedChange={onEnabledChange}
      />
      <div className="flex-1">
        <Label
          htmlFor="rule-alpha-numeric"
          className="text-sm font-medium cursor-pointer"
        >
          Alpha Numeric
        </Label>
        <p className="text-xs text-muted-foreground mt-0.5">
          Field must contain only alphabetic and numeric characters
        </p>
      </div>
    </div>
  );
}
