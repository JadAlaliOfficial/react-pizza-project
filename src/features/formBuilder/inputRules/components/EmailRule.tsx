// components/field-rules/EmailRule.tsx
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface EmailRule {
  enabled: boolean;
  onEnabledChange: (enabled: boolean) => void;
}

export function EmailRule({ enabled, onEnabledChange }: EmailRule) {
  return (
    <div className="flex items-center space-x-2 p-3 border rounded-md hover:bg-accent/50 transition-colors">
      <Checkbox
        id="rule-email"
        checked={enabled}
        onCheckedChange={onEnabledChange}
      />
      <div className="flex-1">
        <Label
          htmlFor="rule-email"
          className="text-sm font-medium cursor-pointer"
        >
          Email
        </Label>
        <p className="text-xs text-muted-foreground mt-0.5">
          Field must be a valid email address
        </p>
      </div>
    </div>
  );
}
