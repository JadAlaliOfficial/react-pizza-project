// components/field-rules/NotInRule.tsx
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface NotInRuleProps {
  enabled: boolean;
  values?: string[];
  onEnabledChange: (enabled: boolean) => void;
  onValuesChange: (values: string[] | undefined) => void;
}

export function NotInRule({
  enabled,
  values,
  onEnabledChange,
  onValuesChange,
}: NotInRuleProps) {
  const handleValuesChange = (value: string) => {
    const valuesArray = value === "" ? undefined : value.split(",").map((v) => v.trim());
    onValuesChange(valuesArray);
  };

  return (
    <div className="space-y-3 p-3 border rounded-md hover:bg-accent/50 transition-colors">
      <div className="flex items-center space-x-2">
        <Checkbox
          id="rule-not-in"
          checked={enabled}
          onCheckedChange={onEnabledChange}
        />
        <div className="flex-1">
          <Label
            htmlFor="rule-not-in"
            className="text-sm font-medium cursor-pointer"
          >
            Not In
          </Label>
          <p className="text-xs text-muted-foreground mt-0.5">
            Field value must NOT be one of the specified values
          </p>
        </div>
      </div>

      {enabled && (
        <div className="ml-6 space-y-2">
          <Label htmlFor="not-in-values" className="text-sm">
            Disallowed Values <span className="text-destructive">*</span>
          </Label>
          <Input
            id="not-in-values"
            type="text"
            placeholder="e.g., banned1, banned2, banned3"
            value={values?.join(", ") ?? ""}
            onChange={(e) => handleValuesChange(e.target.value)}
            required={enabled}
          />
          <p className="text-xs text-muted-foreground">
            Comma-separated list of values that are NOT allowed
          </p>
        </div>
      )}
    </div>
  );
}
