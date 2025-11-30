// components/field-rules/SameRule.tsx
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface SameRuleProps {
  enabled: boolean;
  field?: string;
  onEnabledChange: (enabled: boolean) => void;
  onFieldChange: (field: string | undefined) => void;
}

export function SameRule({
  enabled,
  field,
  onEnabledChange,
  onFieldChange,
}: SameRuleProps) {
  const handleFieldChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    onFieldChange(value === "" ? undefined : value);
  };

  return (
    <div className="space-y-3 p-3 border rounded-md hover:bg-accent/50 transition-colors">
      <div className="flex items-center space-x-2">
        <Checkbox
          id="rule-same"
          checked={enabled}
          onCheckedChange={onEnabledChange}
        />
        <div className="flex-1">
          <Label
            htmlFor="rule-same"
            className="text-sm font-medium cursor-pointer"
          >
            Same
          </Label>
          <p className="text-xs text-muted-foreground mt-0.5">
            Field must match another field
          </p>
        </div>
      </div>

      {enabled && (
        <div className="ml-6 space-y-2">
          <Label htmlFor="same-field" className="text-sm">
            Field to Match <span className="text-destructive">*</span>
          </Label>
          <Input
            id="same-field"
            type="text"
            placeholder="e.g., password, email"
            value={field ?? ""}
            onChange={handleFieldChange}
            required={enabled}
          />
          <p className="text-xs text-muted-foreground">
            Enter the name or identifier of the field to compare with
          </p>
        </div>
      )}
    </div>
  );
}
