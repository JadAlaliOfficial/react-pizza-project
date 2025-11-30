// components/field-rules/MimeTypesRule.tsx
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface MimeTypesRuleProps {
  enabled: boolean;
  types?: string[];
  onEnabledChange: (enabled: boolean) => void;
  onTypesChange: (types: string[] | undefined) => void;
}

export function MimeTypesRule({
  enabled,
  types,
  onEnabledChange,
  onTypesChange,
}: MimeTypesRuleProps) {
  const handleTypesChange = (value: string) => {
    const typesArray = value === "" ? undefined : value.split(",").map((t) => t.trim());
    onTypesChange(typesArray);
  };

  return (
    <div className="space-y-3 p-3 border rounded-md hover:bg-accent/50 transition-colors">
      <div className="flex items-center space-x-2">
        <Checkbox
          id="rule-mime-types"
          checked={enabled}
          onCheckedChange={onEnabledChange}
        />
        <div className="flex-1">
          <Label
            htmlFor="rule-mime-types"
            className="text-sm font-medium cursor-pointer"
          >
            Mime Types
          </Label>
          <p className="text-xs text-muted-foreground mt-0.5">
            File must match specified MIME type patterns
          </p>
        </div>
      </div>

      {enabled && (
        <div className="ml-6 space-y-2">
          <Label htmlFor="mime-types-value" className="text-sm">
            MIME Types <span className="text-destructive">*</span>
          </Label>
          <Input
            id="mime-types-value"
            type="text"
            placeholder="e.g., image/jpeg, application/pdf, video/*"
            value={types?.join(", ") ?? ""}
            onChange={(e) => handleTypesChange(e.target.value)}
            required={enabled}
            className="font-mono text-sm"
          />
          <p className="text-xs text-muted-foreground">
            Comma-separated MIME type patterns (supports wildcards like image/*, video/*)
          </p>
        </div>
      )}
    </div>
  );
}
