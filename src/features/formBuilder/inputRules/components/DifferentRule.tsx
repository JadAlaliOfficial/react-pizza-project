// components/field-rules/DifferentRule.tsx
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface DifferentRuleProps {
  enabled: boolean;
  field?: string;
  onEnabledChange: (enabled: boolean) => void;
  onFieldChange: (field: string | undefined) => void;
}

export function DifferentRule({
  enabled,
  field,
  onEnabledChange,
  onFieldChange,
}: DifferentRuleProps) {
  const handleFieldChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    onFieldChange(value === "" ? undefined : value);
  };

  return (
    <div className="space-y-3 p-3 border rounded-md hover:bg-accent/50 transition-colors">
      <div className="flex items-center space-x-2">
        <Checkbox
          id="rule-different"
          checked={enabled}
          onCheckedChange={onEnabledChange}
        />
        <div className="flex-1">
          <Label
            htmlFor="rule-different"
            className="text-sm font-medium cursor-pointer"
          >
            Different
          </Label>
          <p className="text-xs text-muted-foreground mt-0.5">
            Field must be different from another field
          </p>
        </div>
      </div>

      {enabled && (
        <div className="ml-6 space-y-2">
          <Label htmlFor="different-field" className="text-sm">
            Field to Differ From <span className="text-destructive">*</span>
          </Label>
          <Input
            id="different-field"
            type="text"
            placeholder="e.g., username, old_password"
            value={field ?? ""}
            onChange={handleFieldChange}
            required={enabled}
          />
          <p className="text-xs text-muted-foreground">
            Enter the name or identifier of the field that must be different
          </p>
        </div>
      )}
    </div>
  );
}
