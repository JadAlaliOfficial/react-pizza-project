// components/field-rules/UrlRule.tsx
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface UrlRule {
  enabled: boolean;
  onEnabledChange: (enabled: boolean) => void;
}

export function UrlRule({ enabled, onEnabledChange }: UrlRule) {
  return (
    <div className="flex items-center space-x-2 p-3 border rounded-md hover:bg-accent/50 transition-colors">
      <Checkbox
        id="rule-url"
        checked={enabled}
        onCheckedChange={onEnabledChange}
      />
      <div className="flex-1">
        <Label
          htmlFor="rule-url"
          className="text-sm font-medium cursor-pointer"
        >
          URL
        </Label>
        <p className="text-xs text-muted-foreground mt-0.5">
          Field must be a valid URL
        </p>
      </div>
    </div>
  );
}
