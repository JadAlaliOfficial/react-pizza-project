// components/field-rules/StartsWithRule.tsx
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface StartsWithRuleProps {
  enabled: boolean;
  values?: string;
  onEnabledChange: (enabled: boolean) => void;
  onValuesChange: (values: string | undefined) => void;
}

export function StartsWithRule({
  enabled,
  values,
  onEnabledChange,
  onValuesChange,
}: StartsWithRuleProps) {
  const handleValuesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    onValuesChange(value === "" ? undefined : value);
  };

  return (
    <div className="space-y-3 p-3 border rounded-md hover:bg-accent/50 transition-colors">
      <div className="flex items-center space-x-2">
        <Checkbox
          id="rule-starts-with"
          checked={enabled}
          onCheckedChange={onEnabledChange}
        />
        <div className="flex-1">
          <Label
            htmlFor="rule-starts-with"
            className="text-sm font-medium cursor-pointer"
          >
            Starts With
          </Label>
          <p className="text-xs text-muted-foreground mt-0.5">
            String must start with specified values
          </p>
        </div>
      </div>

      {enabled && (
        <div className="ml-6 space-y-2">
          <Label htmlFor="starts-with-values" className="text-sm">
            Prefix Values <span className="text-destructive">*</span>
          </Label>
          <Input
            id="starts-with-values"
            type="text"
            placeholder="e.g., http, https (comma-separated)"
            value={values ?? ""}
            onChange={handleValuesChange}
            required={enabled}
          />
          <p className="text-xs text-muted-foreground">
            Enter one or more values separated by commas
          </p>
        </div>
      )}
    </div>
  );
}
