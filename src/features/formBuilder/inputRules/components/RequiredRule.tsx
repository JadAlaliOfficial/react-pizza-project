// components/field-rules/RequiredRule.tsx
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface RequiredRuleProps {
  enabled: boolean;
  onEnabledChange: (enabled: boolean) => void;
}

export function RequiredRule({ enabled, onEnabledChange }: RequiredRuleProps) {
  return (
    <div className="flex items-center space-x-2 p-3 border rounded-md hover:bg-accent/50 transition-colors">
      <Checkbox
        id="rule-required"
        checked={enabled}
        onCheckedChange={onEnabledChange}
      />
      <div className="flex-1">
        <Label
          htmlFor="rule-required"
          className="text-sm font-medium cursor-pointer"
        >
          Required
        </Label>
        <p className="text-xs text-muted-foreground mt-0.5">
          Field must have a value
        </p>
      </div>
    </div>
  );
}
