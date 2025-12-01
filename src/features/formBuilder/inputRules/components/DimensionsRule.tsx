// components/field-rules/DimensionsRule.tsx
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useState } from "react";

export function DimensionsRule() {
  const [enabled, setEnabled] = useState(false);
  const [width, setWidth] = useState<number | undefined>(undefined);
  const [height, setHeight] = useState<number | undefined>(undefined);
  const [minwidth, setMinwidth] = useState<number | undefined>(undefined);
  const [maxwidth, setMaxwidth] = useState<number | undefined>(undefined);
  const [minheight, setMinheight] = useState<number | undefined>(undefined);
  const [maxheight, setMaxheight] = useState<number | undefined>(undefined);

  const handleChange = (field: string, value: string) => {
    const numValue = value === "" ? undefined : Number(value);
    switch (field) {
      case "width":
        setWidth(numValue);
        break;
      case "height":
        setHeight(numValue);
        break;
      case "minwidth":
        setMinwidth(numValue);
        break;
      case "maxwidth":
        setMaxwidth(numValue);
        break;
      case "minheight":
        setMinheight(numValue);
        break;
      case "maxheight":
        setMaxheight(numValue);
        break;
    }
  };

  return (
    <div className="space-y-3 p-3 border rounded-md hover:bg-accent/50 transition-colors">
      <div className="flex items-center space-x-2">
        <Checkbox
          id="rule-dimensions"
          checked={enabled}
          onCheckedChange={(val) => setEnabled(!!val)}
        />
        <div className="flex-1">
          <Label
            htmlFor="rule-dimensions"
            className="text-sm font-medium cursor-pointer"
          >
            Dimensions
          </Label>
          <p className="text-xs text-muted-foreground mt-0.5">
            Image must meet dimension requirements (width, height, min/max)
          </p>
        </div>
      </div>

      {enabled && (
        <div className="ml-6 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="dimensions-width" className="text-xs">
                Exact Width (px)
              </Label>
              <Input
                id="dimensions-width"
                type="number"
                min="0"
                step="1"
                placeholder="e.g., 1920"
                value={width ?? ""}
                onChange={(e) => handleChange("width", e.target.value)}
                className="h-8"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="dimensions-height" className="text-xs">
                Exact Height (px)
              </Label>
              <Input
                id="dimensions-height"
                type="number"
                min="0"
                step="1"
                placeholder="e.g., 1080"
                value={height ?? ""}
                onChange={(e) => handleChange("height", e.target.value)}
                className="h-8"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="dimensions-minwidth" className="text-xs">
                Min Width (px)
              </Label>
              <Input
                id="dimensions-minwidth"
                type="number"
                min="0"
                step="1"
                placeholder="e.g., 800"
                value={minwidth ?? ""}
                onChange={(e) => handleChange("minwidth", e.target.value)}
                className="h-8"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="dimensions-maxwidth" className="text-xs">
                Max Width (px)
              </Label>
              <Input
                id="dimensions-maxwidth"
                type="number"
                min="0"
                step="1"
                placeholder="e.g., 3840"
                value={maxwidth ?? ""}
                onChange={(e) => handleChange("maxwidth", e.target.value)}
                className="h-8"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="dimensions-minheight" className="text-xs">
                Min Height (px)
              </Label>
              <Input
                id="dimensions-minheight"
                type="number"
                min="0"
                step="1"
                placeholder="e.g., 600"
                value={minheight ?? ""}
                onChange={(e) => handleChange("minheight", e.target.value)}
                className="h-8"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="dimensions-maxheight" className="text-xs">
                Max Height (px)
              </Label>
              <Input
                id="dimensions-maxheight"
                type="number"
                min="0"
                step="1"
                placeholder="e.g., 2160"
                value={maxheight ?? ""}
                onChange={(e) => handleChange("maxheight", e.target.value)}
                className="h-8"
              />
            </div>
          </div>

          <p className="text-xs text-muted-foreground">
            All fields are optional. Specify only the constraints you need.
          </p>
        </div>
      )}
    </div>
  );
}
