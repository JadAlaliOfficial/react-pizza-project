// src/features/formVersion/components/fields/rules/DimensionsRuleComponent.tsx

/**
 * Dimensions Rule Component
 *
 * UI for the "dimensions" validation rule
 * Backend rule name: "dimensions"
 *
 * Behavior:
 * - Image must meet dimension requirements (width, height, min/max)
 * - Uses rule_props JSON:
 *   {
 *     minwidth?: number;
 *     maxwidth?: number;
 *     minheight?: number;
 *     maxheight?: number;
 *     width?: number;
 *     height?: number;
 *   }
 */

import React, { useMemo } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import type { RuleComponentProps } from "../ruleComponentRegistry";

interface DimensionsRuleProps {
  width?: number;
  height?: number;
  minwidth?: number;
  maxwidth?: number;
  minheight?: number;
  maxheight?: number;
}

export const DimensionsRuleComponent: React.FC<RuleComponentProps> = ({
  rule,
  ruleIndex,
  onEnabledChange,
  onRulePropsChange,
}) => {
  console.debug("[DimensionsRuleComponent] Rendering for rule:", rule.input_rule_id);

  const isEnabled =
    rule.input_rule_id !== null && rule.input_rule_id !== undefined;

  const parsedProps = useMemo((): DimensionsRuleProps => {
    if (!rule.rule_props) {
      return {};
    }

    try {
      const parsed = JSON.parse(rule.rule_props);
      return parsed as DimensionsRuleProps;
    } catch (error) {
      console.warn("[DimensionsRuleComponent] Failed to parse rule_props:", error);
      return {};
    }
  }, [rule.rule_props]);

  const {
    width,
    height,
    minwidth,
    maxwidth,
    minheight,
    maxheight,
  } = parsedProps;

  const handleEnabledChange = (checked: boolean): void => {
    console.debug("[DimensionsRuleComponent] Enabled changed:", checked);
    onEnabledChange(checked);
  };

  const updateProps = (next: DimensionsRuleProps): void => {
    const hasAnyValue =
      next.width !== undefined ||
      next.height !== undefined ||
      next.minwidth !== undefined ||
      next.maxwidth !== undefined ||
      next.minheight !== undefined ||
      next.maxheight !== undefined;

    const json = hasAnyValue ? JSON.stringify(next) : null;
    onRulePropsChange(json);
  };

  const handleChange = (
    field:
      | "width"
      | "height"
      | "minwidth"
      | "maxwidth"
      | "minheight"
      | "maxheight",
    e: React.ChangeEvent<HTMLInputElement>
  ): void => {
    const value = e.target.value;
    const numeric =
      value === "" || Number.isNaN(Number(value))
        ? undefined
        : Number(value);

    updateProps({
      ...parsedProps,
      [field]: numeric,
    });
  };

  return (
    <div className="space-y-3 p-3 border rounded-md hover:bg-accent/50 transition-colors">
      <div className="flex items-center space-x-2">
        <Checkbox
          id={`rule-dimensions-${ruleIndex}`}
          checked={isEnabled}
          onCheckedChange={handleEnabledChange}
        />
        <div className="flex-1">
          <Label
            htmlFor={`rule-dimensions-${ruleIndex}`}
            className="text-sm font-medium cursor-pointer"
          >
            Dimensions
          </Label>
          <p className="text-xs text-muted-foreground mt-0.5">
            Image must meet dimension requirements (width, height, min/max)
          </p>
        </div>
      </div>

      {isEnabled && (
        <div className="ml-6 space-y-3">
          {/* Exact width / height */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label
                htmlFor={`dimensions-width-${ruleIndex}`}
                className="text-xs"
              >
                Exact Width (px)
              </Label>
              <Input
                id={`dimensions-width-${ruleIndex}`}
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
                htmlFor={`dimensions-height-${ruleIndex}`}
                className="text-xs"
              >
                Exact Height (px)
              </Label>
              <Input
                id={`dimensions-height-${ruleIndex}`}
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
                htmlFor={`dimensions-minwidth-${ruleIndex}`}
                className="text-xs"
              >
                Min Width (px)
              </Label>
              <Input
                id={`dimensions-minwidth-${ruleIndex}`}
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
                htmlFor={`dimensions-maxwidth-${ruleIndex}`}
                className="text-xs"
              >
                Max Width (px)
              </Label>
              <Input
                id={`dimensions-maxwidth-${ruleIndex}`}
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
                htmlFor={`dimensions-minheight-${ruleIndex}`}
                className="text-xs"
              >
                Min Height (px)
              </Label>
              <Input
                id={`dimensions-minheight-${ruleIndex}`}
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
                htmlFor={`dimensions-maxheight-${ruleIndex}`}
                className="text-xs"
              >
                Max Height (px)
              </Label>
              <Input
                id={`dimensions-maxheight-${ruleIndex}`}
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
};
