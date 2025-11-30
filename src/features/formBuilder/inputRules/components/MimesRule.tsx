// components/field-rules/MimesRule.tsx
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface MimesRule {
  enabled: boolean;
  types?: string[];
  onEnabledChange: (enabled: boolean) => void;
  onTypesChange: (types: string[] | undefined) => void;
}

export function MimesRule({
  enabled,
  types,
  onEnabledChange,
  onTypesChange,
}: MimesRule) {
  const handleTypesChange = (value: string) => {
    const typesArray = value === "" ? undefined : value.split(",").map((t) => t.trim());
    onTypesChange(typesArray);
  };

  return (
    <div className="space-y-3 p-3 border rounded-md hover:bg-accent/50 transition-colors">
      <div className="flex items-center space-x-2">
        <Checkbox
          id="rule-mimes"
          checked={enabled}
          onCheckedChange={onEnabledChange}
        />
        <div className="flex-1">
          <Label
            htmlFor="rule-mimes"
            className="text-sm font-medium cursor-pointer"
          >
            Mimes
          </Label>
          <p className="text-xs text-muted-foreground mt-0.5">
            File must be of specified MIME types (e.g., jpg, png, pdf)
          </p>
        </div>
      </div>

      {enabled && (
        <div className="ml-6 space-y-2">
          <Label htmlFor="mimes-types" className="text-sm">
            Allowed Types <span className="text-destructive">*</span>
          </Label>
          <Input
            id="mimes-types"
            type="text"
            placeholder="e.g., jpg, png, pdf, docx"
            value={types?.join(", ") ?? ""}
            onChange={(e) => handleTypesChange(e.target.value)}
            required={enabled}
          />
          <p className="text-xs text-muted-foreground">
            Comma-separated list of allowed file extensions
          </p>
        </div>
      )}
    </div>
  );
}
