// src/features/formVersion/components/fields/rules/DateFormatRuleComponent.tsx

/**
 * Date Format Rule Component
 *
 * UI for the "date_format" validation rule
 * Backend rule name: "date_format"
 *
 * Behavior:
 * - Date value must match a specific format
 * - Uses rule_props JSON: { "format"?: string }
 */

import React, { useMemo } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import type { RuleComponentProps } from "../ruleComponentRegistry";

// ============================================================================
// Rule Props Type
// ============================================================================

interface DateFormatRuleProps {
  format?: string;
}

// ============================================================================
// Component
// ============================================================================

export const DateFormatRuleComponent: React.FC<RuleComponentProps> = ({
  rule,
  ruleIndex,
  onEnabledChange,
  onRulePropsChange,
}) => {
  console.debug(
    "[DateFormatRuleComponent] Rendering for rule:",
    rule.input_rule_id
  );

  // Determine if rule is enabled (non-null input_rule_id)
  const isEnabled =
    rule.input_rule_id !== null && rule.input_rule_id !== undefined;

  /**
   * Parse rule_props from JSON string
   */
  const parsedProps = useMemo((): DateFormatRuleProps => {
    if (!rule.rule_props) {
      return {};
    }

    try {
      const parsed = JSON.parse(rule.rule_props);
      return parsed as DateFormatRuleProps;
    } catch (error) {
      console.warn(
        "[DateFormatRuleComponent] Failed to parse rule_props:",
        error
      );
      return {};
    }
  }, [rule.rule_props]);

  const { format } = parsedProps;

  /**
   * Handles checkbox change (enable/disable rule)
   */
  const handleEnabledChange = (checked: boolean): void => {
    console.debug("[DateFormatRuleComponent] Enabled changed:", checked);
    onEnabledChange(checked);
  };

  /**
   * Handles format change
   * Serializes props to JSON and calls onRulePropsChange
   */
  const handleFormatChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ): void => {
    const value = e.target.value.trim();
    console.debug("[DateFormatRuleComponent] format changed:", value);

    const newProps: DateFormatRuleProps = {
      ...parsedProps,
      format: value === "" ? undefined : value,
    };

    const hasValue =
      newProps.format !== undefined &&
      newProps.format !== null &&
      newProps.format !== "";

    const propsJson = hasValue ? JSON.stringify(newProps) : null;
    onRulePropsChange(propsJson);
  };

  return (
    <div className="space-y-3 p-3 border rounded-md hover:bg-accent/50 transition-colors">
      {/* Checkbox + Label */}
      <div className="flex items-center space-x-2">
        <Checkbox
          id={`rule-date-format-${ruleIndex}`}
          checked={isEnabled}
          onCheckedChange={handleEnabledChange}
        />
        <div className="flex-1">
          <Label
            htmlFor={`rule-date-format-${ruleIndex}`}
            className="text-sm font-medium cursor-pointer"
          >
            Date Format
          </Label>
          <p className="text-xs text-muted-foreground mt-0.5">
            Date must match a specific format
          </p>
        </div>
      </div>

      {/* Format input (shown when enabled) */}
      {isEnabled && (
        <div className="ml-6 space-y-2">
          <Label
            htmlFor={`date-format-value-${ruleIndex}`}
            className="text-sm"
          >
            Format <span className="text-destructive">*</span>
          </Label>
          <Input
            id={`date-format-value-${ruleIndex}`}
            type="text"
            placeholder="e.g., Y-m-d, m/d/Y, d-m-Y H:i:s"
            value={format ?? ""}
            onChange={handleFormatChange}
            required={isEnabled}
            className="max-w-md font-mono text-sm"
          />
          <p className="text-xs text-muted-foreground">
            PHP date format (e.g., Y-m-d for 2024-12-31, m/d/Y for 12/31/2024)
          </p>
        </div>
      )}
    </div>
  );
};
