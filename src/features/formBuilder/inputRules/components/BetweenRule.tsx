// components/field-rules/BetweenRule.tsx
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface BetweenRule {
  enabled: boolean;
  min?: number;
  max?: number;
  onEnabledChange: (enabled: boolean) => void;
  onMinChange: (min: number | undefined) => void;
  onMaxChange: (max: number | undefined) => void;
}

export function BetweenRule({
  enabled,
  min,
  max,
  onEnabledChange,
  onMinChange,
  onMaxChange,
}: BetweenRule) {
  const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const numValue = e.target.value === "" ? undefined : Number(e.target.value);
    onMinChange(numValue);
  };

  const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const numValue = e.target.value === "" ? undefined : Number(e.target.value);
    onMaxChange(numValue);
  };

  return (
    <div className="space-y-3 p-3 border rounded-md hover:bg-accent/50 transition-colors">
      <div className="flex items-center space-x-2">
        <Checkbox
          id="rule-between"
          checked={enabled}
          onCheckedChange={onEnabledChange}
        />
        <div className="flex-1">
          <Label
            htmlFor="rule-between"
            className="text-sm font-medium cursor-pointer"
          >
            Between
          </Label>
          <p className="text-xs text-muted-foreground mt-0.5">
            Field value must be between minimum and maximum values
          </p>
        </div>
      </div>

      {enabled && (
        <div className="ml-6 space-y-3">
          <div className="space-y-2">
            <Label htmlFor="between-min" className="text-sm">
              Minimum value <span className="text-destructive">*</span>
            </Label>
            <Input
              id="between-min"
              type="number"
              placeholder="Enter minimum value"
              value={min ?? ""}
              onChange={handleMinChange}
              required={enabled}
              className="max-w-xs"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="between-max" className="text-sm">
              Maximum value <span className="text-destructive">*</span>
            </Label>
            <Input
              id="between-max"
              type="number"
              placeholder="Enter maximum value"
              value={max ?? ""}
              onChange={handleMaxChange}
              required={enabled}
              className="max-w-xs"
            />
          </div>
        </div>
      )}
    </div>
  );
}
