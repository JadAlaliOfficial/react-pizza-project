// components/field-rules/ConfirmedRule.tsx
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface ConfirmedRuleProps {
  enabled: boolean;
  onEnabledChange: (enabled: boolean) => void;
}

export function ConfirmedRule({
  enabled,
  onEnabledChange,
}: ConfirmedRuleProps) {
  return (
    <div className="space-y-3 p-3 border rounded-md hover:bg-accent/50 transition-colors">
      <div className="flex items-center space-x-2">
        <Checkbox
          id="rule-confirmed"
          checked={enabled}
          onCheckedChange={onEnabledChange}
        />
        <div className="flex-1">
          <Label
            htmlFor="rule-confirmed"
            className="text-sm font-medium cursor-pointer"
          >
            Confirmed
          </Label>
          <p className="text-xs text-muted-foreground mt-0.5">
            Field must match a confirmation field (e.g., password confirmation)
          </p>
        </div>
      </div>
    </div>
  );
}
