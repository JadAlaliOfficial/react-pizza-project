// src/features/formVersion/components/fields/rules/MinFileSizeRuleComponent.tsx

/**
 * Min File Size Rule Component
 *
 * UI for the "min_file_size" validation rule
 * Backend rule name: "min_file_size"
 *
 * Behavior:
 * - Minimum file size in kilobytes
 * - Uses rule_props JSON: { "minsize"?: number }
 */

import React, { useMemo } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import type { RuleComponentProps } from "../ruleComponentRegistry";

interface MinFileSizeRuleProps {
  minsize?: number;
}

export const MinFileSizeRuleComponent: React.FC<RuleComponentProps> = ({
  rule,
  ruleIndex,
  onEnabledChange,
  onRulePropsChange,
}) => {
  console.debug(
    "[MinFileSizeRuleComponent] Rendering for rule:",
    rule.input_rule_id
  );

  const isEnabled =
    rule.input_rule_id !== null && rule.input_rule_id !== undefined;

  const parsedProps = useMemo((): MinFileSizeRuleProps => {
    if (!rule.rule_props) {
      return {};
    }

    try {
      const parsed = JSON.parse(rule.rule_props);
      return parsed as MinFileSizeRuleProps;
    } catch (error) {
      console.warn(
        "[MinFileSizeRuleComponent] Failed to parse rule_props:",
        error
      );
      return {};
    }
  }, [rule.rule_props]);

  const { minsize } = parsedProps;

  const handleEnabledChange = (checked: boolean): void => {
    console.debug("[MinFileSizeRuleComponent] Enabled changed:", checked);
    onEnabledChange(checked);
  };

  const updateProps = (next: MinFileSizeRuleProps): void => {
    const hasValue =
      next.minsize !== undefined &&
      next.minsize !== null &&
      !Number.isNaN(next.minsize);
    const json = hasValue ? JSON.stringify(next) : null;
    onRulePropsChange(json);
  };

  const handleMinSizeChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ): void => {
    const value = e.target.value;
    const numeric =
      value === "" || Number.isNaN(Number(value))
        ? undefined
        : Number(value);

    updateProps({
      ...parsedProps,
      minsize: numeric,
    });
  };

  return (
    <div className="space-y-3 p-3 border rounded-md hover:bg-accent/50 transition-colors">
      <div className="flex items-center space-x-2">
        <Checkbox
          id={`rule-min-file-size-${ruleIndex}`}
          checked={isEnabled}
          onCheckedChange={handleEnabledChange}
        />
        <div className="flex-1">
          <Label
            htmlFor={`rule-min-file-size-${ruleIndex}`}
            className="text-sm font-medium cursor-pointer"
          >
            Min File Size
          </Label>
          <p className="text-xs text-muted-foreground mt-0.5">
            Minimum file size in kilobytes
          </p>
        </div>
      </div>

      {isEnabled && (
        <div className="ml-6 space-y-2">
          <Label
            htmlFor={`min-file-size-value-${ruleIndex}`}
            className="text-sm"
          >
            Min Size (KB) <span className="text-destructive">*</span>
          </Label>
          <Input
            id={`min-file-size-value-${ruleIndex}`}
            type="number"
            min="0"
            step="1"
            placeholder="e.g., 100"
            value={minsize ?? ""}
            onChange={handleMinSizeChange}
            required={isEnabled}
            className="max-w-xs"
          />
          <p className="text-xs text-muted-foreground">
            Minimum size in kilobytes (1 MB = 1024 KB)
          </p>
        </div>
      )}
    </div>
  );
};
