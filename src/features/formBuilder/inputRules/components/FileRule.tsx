// components/field-rules/FileRule.tsx
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface FileRule {
  enabled: boolean;
  types?: string[];
  size?: number;
  maxSize?: number;
  minSize?: number;
  onEnabledChange: (enabled: boolean) => void;
  onPropsChange: (props: {
    types?: string[];
    size?: number;
    maxSize?: number;
    minSize?: number;
  }) => void;
}

export function FileRule({
  enabled,
  types,
  size,
  maxSize,
  minSize,
  onEnabledChange,
  onPropsChange,
}: FileRule) {
  const handleTypesChange = (value: string) => {
    const typesArray = value === "" ? undefined : value.split(",").map((t) => t.trim());
    onPropsChange({ types: typesArray, size, maxSize, minSize });
  };

  const handleSizeChange = (field: string, value: string) => {
    const numValue = value === "" ? undefined : Number(value);
    onPropsChange({
      types,
      size,
      maxSize,
      minSize,
      [field]: numValue,
    });
  };

  return (
    <div className="space-y-3 p-3 border rounded-md hover:bg-accent/50 transition-colors">
      <div className="flex items-center space-x-2">
        <Checkbox
          id="rule-file"
          checked={enabled}
          onCheckedChange={onEnabledChange}
        />
        <div className="flex-1">
          <Label
            htmlFor="rule-file"
            className="text-sm font-medium cursor-pointer"
          >
            File
          </Label>
          <p className="text-xs text-muted-foreground mt-0.5">
            Field must be a valid file upload with optional constraints
          </p>
        </div>
      </div>

      {enabled && (
        <div className="ml-6 space-y-3">
          <div className="space-y-2">
            <Label htmlFor="file-types" className="text-sm">
              Allowed File Types
            </Label>
            <Input
              id="file-types"
              type="text"
              placeholder="e.g., jpg, png, pdf"
              value={types?.join(", ") ?? ""}
              onChange={(e) => handleTypesChange(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Comma-separated list of allowed extensions
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="file-size" className="text-sm">
              Exact Size (KB)
            </Label>
            <Input
              id="file-size"
              type="number"
              placeholder="e.g., 1024"
              value={size ?? ""}
              onChange={(e) => handleSizeChange("size", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="file-max-size" className="text-sm">
              Max Size (KB)
            </Label>
            <Input
              id="file-max-size"
              type="number"
              placeholder="e.g., 30720 (30MB)"
              value={maxSize ?? ""}
              onChange={(e) => handleSizeChange("maxSize", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="file-min-size" className="text-sm">
              Min Size (KB)
            </Label>
            <Input
              id="file-min-size"
              type="number"
              placeholder="e.g., 100"
              value={minSize ?? ""}
              onChange={(e) => handleSizeChange("minSize", e.target.value)}
            />
          </div>

          <p className="text-xs text-muted-foreground">
            All fields are optional. Leave empty if not needed.
          </p>
        </div>
      )}
    </div>
  );
}
