// src/features/formVersion/components/fields/rules/SizeRuleComponent.tsx

/**
 * Size Rule Component
 *
 * UI for the "size" validation rule
 * Backend rule name: "size"
 *
 * Behavior:
 * - File size must be equal to specified size in kilobytes
 * - Uses rule_props JSON: { "size"?: number }
 */

import React, { useMemo } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import type { RuleComponentProps } from "../ruleComponentRegistry";

interface SizeRuleProps {
  size?: number;
}

export const SizeRuleComponent: React.FC<RuleComponentProps> = ({
  rule,
  ruleIndex,
  onEnabledChange,
  onRulePropsChange,
}) => {
  console.debug("[SizeRuleComponent] Rendering for rule:", rule.input_rule_id);

  const isEnabled =
    rule.input_rule_id !== null && rule.input_rule_id !== undefined;

  const parsedProps = useMemo((): SizeRuleProps => {
    if (!rule.rule_props) {
      return {};
    }

    try {
      const parsed = JSON.parse(rule.rule_props);
      return parsed as SizeRuleProps;
    } catch (error) {
      console.warn("[SizeRuleComponent] Failed to parse rule_props:", error);
      return {};
    }
  }, [rule.rule_props]);

  const { size } = parsedProps;

  const handleEnabledChange = (checked: boolean): void => {
    console.debug("[SizeRuleComponent] Enabled changed:", checked);
    onEnabledChange(checked);
  };

  const updateProps = (next: SizeRuleProps): void => {
    const hasValue =
      next.size !== undefined && next.size !== null && !Number.isNaN(next.size);
    const json = hasValue ? JSON.stringify(next) : null;
    onRulePropsChange(json);
  };

  const handleSizeChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ): void => {
    const value = e.target.value;
    const numeric =
      value === "" || Number.isNaN(Number(value))
        ? undefined
        : Number(value);

    updateProps({
      ...parsedProps,
      size: numeric,
    });
  };

  return (
    <div className="space-y-3 p-3 border rounded-md hover:bg-accent/50 transition-colors">
      <div className="flex items-center space-x-2">
        <Checkbox
          id={`rule-size-${ruleIndex}`}
          checked={isEnabled}
          onCheckedChange={handleEnabledChange}
        />
        <div className="flex-1">
          <Label
            htmlFor={`rule-size-${ruleIndex}`}
            className="text-sm font-medium cursor-pointer"
          >
            Size
          </Label>
          <p className="text-xs text-muted-foreground mt-0.5">
            File size must be equal to specified size in kilobytes
          </p>
        </div>
      </div>

      {isEnabled && (
        <div className="ml-6 space-y-2">
          <Label
            htmlFor={`size-value-${ruleIndex}`}
            className="text-sm"
          >
            Size (KB) <span className="text-destructive">*</span>
          </Label>
          <Input
            id={`size-value-${ruleIndex}`}
            type="number"
            min="0"
            step="1"
            placeholder="e.g., 1024"
            value={size ?? ""}
            onChange={handleSizeChange}
            required={isEnabled}
            className="max-w-xs"
          />
          <p className="text-xs text-muted-foreground">
            Exact file size in kilobytes (1 MB = 1024 KB)
          </p>
        </div>
      )}
    </div>
  );
};
