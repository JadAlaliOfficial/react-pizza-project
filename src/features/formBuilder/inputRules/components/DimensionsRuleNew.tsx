// features/formBuilder/inputRules/components/DimensionsRuleNew.tsx

import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { type ChangeEvent } from "react";
import { useRule } from "@/features/formBuilder/inputRules/hooks/useRule";
import type {
  DimensionsRuleData,
} from "@/features/formBuilder/inputRules/types/file-rule-types";

type Props = { id: string };

// UI for the "dimensions" rule
// ----------------------------
// Backend name: "dimensions"
// Props:
// {
//   minwidth?: number;
//   maxwidth?: number;
//   minheight?: number;
//   maxheight?: number;
//   width?: number;
//   height?: number;
// }
export function DimensionsRuleNew({ id }: Props) {
  const { rule, setEnabled, patch } = useRule<DimensionsRuleData>(id);
  if (!rule) return null;

  const { enabled, props } = rule;
  const {
    width,
    height,
    minwidth,
    maxwidth,
    minheight,
    maxheight,
  } = props;

  const handleChange = (
    field:
      | "width"
      | "height"
      | "minwidth"
      | "maxwidth"
      | "minheight"
      | "maxheight",
    e: ChangeEvent<HTMLInputElement>
  ) => {
    const value = e.target.value;
    const numeric =
      value === "" || Number.isNaN(Number(value))
        ? undefined
        : Number(value);

    patch({
      props: {
        ...props,
        [field]: numeric,
      },
    } as Partial<DimensionsRuleData>);
  };

  return (
    <div className="space-y-3 p-3 border rounded-md hover:bg-accent/50 transition-colors">
      <div className="flex items-center space-x-2">
        <Checkbox
          id={`rule-dimensions-${id}`}
          checked={enabled}
          onCheckedChange={(val) => setEnabled(!!val)}
        />
        <div className="flex-1">
          <Label
            htmlFor={`rule-dimensions-${id}`}
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
          {/* Exact width / height */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label
                htmlFor={`dimensions-width-${id}`}
                className="text-xs"
              >
                Exact Width (px)
              </Label>
              <Input
                id={`dimensions-width-${id}`}
                type="number"
                min="0"
                step="1"
                placeholder="e.g., 1920"
                value={width ?? ""}
                onChange={(e) => handleChange("width", e)}
                className="h-8"
              />
            </div>
            <div className="space-y-1.5">
              <Label
                htmlFor={`dimensions-height-${id}`}
                className="text-xs"
              >
                Exact Height (px)
              </Label>
              <Input
                id={`dimensions-height-${id}`}
                type="number"
                min="0"
                step="1"
                placeholder="e.g., 1080"
                value={height ?? ""}
                onChange={(e) => handleChange("height", e)}
                className="h-8"
              />
            </div>
          </div>

          {/* Min / max width */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label
                htmlFor={`dimensions-minwidth-${id}`}
                className="text-xs"
              >
                Min Width (px)
              </Label>
              <Input
                id={`dimensions-minwidth-${id}`}
                type="number"
                min="0"
                step="1"
                placeholder="e.g., 800"
                value={minwidth ?? ""}
                onChange={(e) => handleChange("minwidth", e)}
                className="h-8"
              />
            </div>
            <div className="space-y-1.5">
              <Label
                htmlFor={`dimensions-maxwidth-${id}`}
                className="text-xs"
              >
                Max Width (px)
              </Label>
              <Input
                id={`dimensions-maxwidth-${id}`}
                type="number"
                min="0"
                step="1"
                placeholder="e.g., 3840"
                value={maxwidth ?? ""}
                onChange={(e) => handleChange("maxwidth", e)}
                className="h-8"
              />
            </div>
          </div>

          {/* Min / max height */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label
                htmlFor={`dimensions-minheight-${id}`}
                className="text-xs"
              >
                Min Height (px)
              </Label>
              <Input
                id={`dimensions-minheight-${id}`}
                type="number"
                min="0"
                step="1"
                placeholder="e.g., 600"
                value={minheight ?? ""}
                onChange={(e) => handleChange("minheight", e)}
                className="h-8"
              />
            </div>
            <div className="space-y-1.5">
              <Label
                htmlFor={`dimensions-maxheight-${id}`}
                className="text-xs"
              >
                Max Height (px)
              </Label>
              <Input
                id={`dimensions-maxheight-${id}`}
                type="number"
                min="0"
                step="1"
                placeholder="e.g., 2160"
                value={maxheight ?? ""}
                onChange={(e) => handleChange("maxheight", e)}
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
