// src/features/formVersion/components/fields/rules/MaxFileSizeRuleComponent.tsx

/**
 * Max File Size Rule Component
 *
 * UI for the "max_file_size" validation rule
 * Backend rule name: "max_file_size"
 *
 * Behavior:
 * - Maximum file size in kilobytes (e.g., 30MB = 30720)
 * - Uses rule_props JSON: { "maxsize"?: number }
 */

import React, { useMemo } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import type { RuleComponentProps } from "../ruleComponentRegistry";

interface MaxFileSizeRuleProps {
  maxsize?: number;
}

export const MaxFileSizeRuleComponent: React.FC<RuleComponentProps> = ({
  rule,
  ruleIndex,
  onEnabledChange,
  onRulePropsChange,
}) => {
  console.debug(
    "[MaxFileSizeRuleComponent] Rendering for rule:",
    rule.input_rule_id
  );

  const isEnabled =
    rule.input_rule_id !== null && rule.input_rule_id !== undefined;

  const parsedProps = useMemo((): MaxFileSizeRuleProps => {
    if (!rule.rule_props) {
      return {};
    }

    try {
      const parsed = JSON.parse(rule.rule_props);
      return parsed as MaxFileSizeRuleProps;
    } catch (error) {
      console.warn(
        "[MaxFileSizeRuleComponent] Failed to parse rule_props:",
        error
      );
      return {};
    }
  }, [rule.rule_props]);

  const { maxsize } = parsedProps;

  const handleEnabledChange = (checked: boolean): void => {
    console.debug("[MaxFileSizeRuleComponent] Enabled changed:", checked);
    onEnabledChange(checked);
  };

  const updateProps = (next: MaxFileSizeRuleProps): void => {
    const hasValue =
      next.maxsize !== undefined && next.maxsize !== null && !Number.isNaN(next.maxsize);
    const json = hasValue ? JSON.stringify(next) : null;
    onRulePropsChange(json);
  };

  const handleMaxSizeChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ): void => {
    const value = e.target.value;
    const numeric =
      value === "" || Number.isNaN(Number(value))
        ? undefined
        : Number(value);

    updateProps({
      ...parsedProps,
      maxsize: numeric,
    });
  };

  return (
    <div className="space-y-3 p-3 border rounded-md hover:bg-accent/50 transition-colors">
      <div className="flex items-center space-x-2">
        <Checkbox
          id={`rule-max-file-size-${ruleIndex}`}
          checked={isEnabled}
          onCheckedChange={handleEnabledChange}
        />
        <div className="flex-1">
          <Label
            htmlFor={`rule-max-file-size-${ruleIndex}`}
            className="text-sm font-medium cursor-pointer"
          >
            Max File Size
          </Label>
          <p className="text-xs text-muted-foreground mt-0.5">
            Maximum file size in kilobytes (e.g., 30MB = 30720)
          </p>
        </div>
      </div>

      {isEnabled && (
        <div className="ml-6 space-y-2">
          <Label
            htmlFor={`max-file-size-value-${ruleIndex}`}
            className="text-sm"
          >
            Max Size (KB) <span className="text-destructive">*</span>
          </Label>
          <Input
            id={`max-file-size-value-${ruleIndex}`}
            type="number"
            min="0"
            step="1"
            placeholder="e.g., 30720 (30MB)"
            value={maxsize ?? ""}
            onChange={handleMaxSizeChange}
            required={isEnabled}
            className="max-w-xs"
          />
          <p className="text-xs text-muted-foreground">
            Maximum size in kilobytes (1 MB = 1024 KB, 10 MB = 10240 KB)
          </p>
        </div>
      )}
    </div>
  );
};
