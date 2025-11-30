// components/field-rules/UniqueRule.tsx
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface UniqueRuleProps {
  enabled: boolean;
  onEnabledChange: (enabled: boolean) => void;
}

export function UniqueRule({
  enabled,
  onEnabledChange,
}: UniqueRuleProps) {
  return (
    <div className="space-y-3 p-3 border rounded-md hover:bg-accent/50 transition-colors">
      <div className="flex items-center space-x-2">
        <Checkbox
          id="rule-unique"
          checked={enabled}
          onCheckedChange={onEnabledChange}
        />
        <div className="flex-1">
          <Label
            htmlFor="rule-unique"
            className="text-sm font-medium cursor-pointer"
          >
            Unique
          </Label>
          <p className="text-xs text-muted-foreground mt-0.5">
            Value must be unique across all entries
          </p>
        </div>
      </div>
    </div>
  );
}
