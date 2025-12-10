// src/features/formVersion/components/fields/rules/DifferentRuleComponent.tsx

/**
 * Different Rule Component
 *
 * UI for the "different" validation rule
 * Backend rule name: "different"
 *
 * Behavior:
 * - Field must be different from another field
 * - Uses rule_props JSON: { "comparevalue"?: string }
 */

import React, { useMemo } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import type { RuleComponentProps } from "../ruleComponentRegistry";

// ============================================================================
// Rule Props Type
// ============================================================================

interface DifferentRuleProps {
  comparevalue?: string;
}

// ============================================================================
// Component
// ============================================================================

export const DifferentRuleComponent: React.FC<RuleComponentProps> = ({
  rule,
  ruleIndex,
  onEnabledChange,
  onRulePropsChange,
}) => {
  console.debug("[DifferentRuleComponent] Rendering for rule:", rule.input_rule_id);

  // Determine if rule is enabled (non-null input_rule_id)
  const isEnabled =
    rule.input_rule_id !== null && rule.input_rule_id !== undefined;

  /**
   * Parse rule_props from JSON string
   */
  const parsedProps = useMemo((): DifferentRuleProps => {
    if (!rule.rule_props) {
      return {};
    }

    try {
      const parsed = JSON.parse(rule.rule_props);
      return parsed as DifferentRuleProps;
    } catch (error) {
      console.warn("[DifferentRuleComponent] Failed to parse rule_props:", error);
      return {};
    }
  }, [rule.rule_props]);

  const { comparevalue } = parsedProps;

  /**
   * Handles checkbox change (enable/disable rule)
   */
  const handleEnabledChange = (checked: boolean): void => {
    console.debug("[DifferentRuleComponent] Enabled changed:", checked);
    onEnabledChange(checked);
  };

  /**
   * Handles compare field key change
   * Serializes props to JSON and calls onRulePropsChange
   */
  const handleFieldChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ): void => {
    const value = e.target.value.trim();
    console.debug("[DifferentRuleComponent] comparevalue changed:", value);

    const newProps: DifferentRuleProps = {
      ...parsedProps,
      comparevalue: value === "" ? undefined : value,
    };

    const hasValue =
      newProps.comparevalue !== undefined &&
      newProps.comparevalue !== null &&
      newProps.comparevalue !== "";

    const propsJson = hasValue ? JSON.stringify(newProps) : null;
    onRulePropsChange(propsJson);
  };

  return (
    <div className="space-y-3 p-3 border rounded-md hover:bg-accent/50 transition-colors">
      {/* Checkbox + Label */}
      <div className="flex items-center space-x-2">
        <Checkbox
          id={`rule-different-${ruleIndex}`}
          checked={isEnabled}
          onCheckedChange={handleEnabledChange}
        />
        <div className="flex-1">
          <Label
            htmlFor={`rule-different-${ruleIndex}`}
            className="text-sm font-medium cursor-pointer"
          >
            Different
          </Label>
          <p className="text-xs text-muted-foreground mt-0.5">
            Field must be different from another field
          </p>
        </div>
      </div>

      {/* Compare field key input (shown when enabled) */}
      {isEnabled && (
        <div className="ml-6 space-y-2">
          <Label
            htmlFor={`different-field-${ruleIndex}`}
            className="text-sm"
          >
            Field to Differ From <span className="text-destructive">*</span>
          </Label>
          <Input
            id={`different-field-${ruleIndex}`}
            type="text"
            placeholder="e.g., username, old_password"
            value={comparevalue ?? ""}
            onChange={handleFieldChange}
            required={isEnabled}
          />
          <p className="text-xs text-muted-foreground">
            Enter the name or identifier of the field that must be different
          </p>
        </div>
      )}
    </div>
  );
};
