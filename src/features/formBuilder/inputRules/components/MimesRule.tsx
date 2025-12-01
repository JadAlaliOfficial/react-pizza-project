// components/field-rules/MimesRule.tsx
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useState, type ChangeEvent } from "react";

export function MimesRule() {
  const [enabled, setEnabled] = useState(false);
  const [types, setTypes] = useState<string[] | undefined>(undefined);
  const handleTypesChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const typesArray = value === "" ? undefined : value.split(",").map((t) => t.trim());
    setTypes(typesArray);
  };

  return (
    <div className="space-y-3 p-3 border rounded-md hover:bg-accent/50 transition-colors">
      <div className="flex items-center space-x-2">
        <Checkbox
          id="rule-mimes"
          checked={enabled}
          onCheckedChange={(val) => setEnabled(!!val)}
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
            onChange={handleTypesChange}
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
