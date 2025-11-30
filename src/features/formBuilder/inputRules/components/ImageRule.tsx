// components/field-rules/ImageRule.tsx
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface ImageRule {
  enabled: boolean;
  minWidth?: number;
  maxWidth?: number;
  minHeight?: number;
  maxHeight?: number;
  width?: number;
  height?: number;
  onEnabledChange: (enabled: boolean) => void;
  onPropsChange: (props: {
    minWidth?: number;
    maxWidth?: number;
    minHeight?: number;
    maxHeight?: number;
    width?: number;
    height?: number;
  }) => void;
}

export function ImageRule({
  enabled,
  minWidth,
  maxWidth,
  minHeight,
  maxHeight,
  width,
  height,
  onEnabledChange,
  onPropsChange,
}: ImageRule) {
  const handleChange = (field: string, value: string) => {
    const numValue = value === "" ? undefined : Number(value);
    onPropsChange({
      minWidth,
      maxWidth,
      minHeight,
      maxHeight,
      width,
      height,
      [field]: numValue,
    });
  };

  return (
    <div className="space-y-3 p-3 border rounded-md hover:bg-accent/50 transition-colors">
      <div className="flex items-center space-x-2">
        <Checkbox
          id="rule-image"
          checked={enabled}
          onCheckedChange={onEnabledChange}
        />
        <div className="flex-1">
          <Label
            htmlFor="rule-image"
            className="text-sm font-medium cursor-pointer"
          >
            Image
          </Label>
          <p className="text-xs text-muted-foreground mt-0.5">
            Field must be an image with optional dimension requirements
          </p>
        </div>
      </div>

      {enabled && (
        <div className="ml-6 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="image-min-width" className="text-sm">
                Min Width (px)
              </Label>
              <Input
                id="image-min-width"
                type="number"
                placeholder="e.g., 800"
                value={minWidth ?? ""}
                onChange={(e) => handleChange("minWidth", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="image-max-width" className="text-sm">
                Max Width (px)
              </Label>
              <Input
                id="image-max-width"
                type="number"
                placeholder="e.g., 1920"
                value={maxWidth ?? ""}
                onChange={(e) => handleChange("maxWidth", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="image-min-height" className="text-sm">
                Min Height (px)
              </Label>
              <Input
                id="image-min-height"
                type="number"
                placeholder="e.g., 600"
                value={minHeight ?? ""}
                onChange={(e) => handleChange("minHeight", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="image-max-height" className="text-sm">
                Max Height (px)
              </Label>
              <Input
                id="image-max-height"
                type="number"
                placeholder="e.g., 1080"
                value={maxHeight ?? ""}
                onChange={(e) => handleChange("maxHeight", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="image-width" className="text-sm">
                Exact Width (px)
              </Label>
              <Input
                id="image-width"
                type="number"
                placeholder="e.g., 1200"
                value={width ?? ""}
                onChange={(e) => handleChange("width", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="image-height" className="text-sm">
                Exact Height (px)
              </Label>
              <Input
                id="image-height"
                type="number"
                placeholder="e.g., 800"
                value={height ?? ""}
                onChange={(e) => handleChange("height", e.target.value)}
              />
            </div>
          </div>

          <p className="text-xs text-muted-foreground">
            All dimension fields are optional. Leave empty if not needed.
          </p>
        </div>
      )}
    </div>
  );
}
