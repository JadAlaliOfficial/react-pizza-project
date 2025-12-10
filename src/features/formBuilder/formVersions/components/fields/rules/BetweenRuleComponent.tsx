// src/features/formVersion/components/fields/rules/BetweenRuleComponent.tsx

/**
 * Between Rule Component
 *
 * UI for the "between" validation rule
 * Backend rule name: "between"
 *
 * Behavior:
 * - Field value must be between minimum and maximum numeric values
 * - Uses rule_props JSON: { "min"?: number; "max"?: number }
 */

import React, { useMemo } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import type { RuleComponentProps } from "../ruleComponentRegistry";

// ============================================================================
// Rule Props Type
// ============================================================================

interface BetweenRuleProps {
  min?: number;
  max?: number;
}

// ============================================================================
// Component
// ============================================================================

export const BetweenRuleComponent: React.FC<RuleComponentProps> = ({
  rule,
  ruleIndex,
  onEnabledChange,
  onRulePropsChange,
}) => {
  console.debug("[BetweenRuleComponent] Rendering for rule:", rule.input_rule_id);

  // Determine if rule is enabled
  const isEnabled =
    rule.input_rule_id !== null && rule.input_rule_id !== undefined;

  /**
   * Parse rule_props from JSON string
   */
  const parsedProps = useMemo((): BetweenRuleProps => {
    if (!rule.rule_props) {
      return {};
    }

    try {
      const parsed = JSON.parse(rule.rule_props);
      return parsed as BetweenRuleProps;
    } catch (error) {
      console.warn("[BetweenRuleComponent] Failed to parse rule_props:", error);
      return {};
    }
  }, [rule.rule_props]);

  const { min, max } = parsedProps;

  /**
   * Handles checkbox change (enable/disable rule)
   */
  const handleEnabledChange = (checked: boolean): void => {
    console.debug("[BetweenRuleComponent] Enabled changed:", checked);
    onEnabledChange(checked);
  };

  /**
   * Update props JSON helper
   */
  const updateProps = (next: BetweenRuleProps): void => {
    const hasAnyValue =
      next.min !== undefined && next.min !== null
        ? true
        : next.max !== undefined && next.max !== null
        ? true
        : false;

    const json = hasAnyValue ? JSON.stringify(next) : null;
    onRulePropsChange(json);
  };

  /**
   * Handles minimum value change
   */
  const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const raw = e.target.value;

    if (raw === "") {
      updateProps({
        ...parsedProps,
        min: undefined,
      });
      return;
    }

    const numericValue = Number(raw);
    if (Number.isNaN(numericValue)) return;

    updateProps({
      ...parsedProps,
      min: numericValue,
    });
  };

  /**
   * Handles maximum value change
   */
  const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const raw = e.target.value;

    if (raw === "") {
      updateProps({
        ...parsedProps,
        max: undefined,
      });
      return;
    }

    const numericValue = Number(raw);
    if (Number.isNaN(numericValue)) return;

    updateProps({
      ...parsedProps,
      max: numericValue,
    });
  };

  return (
    <div className="space-y-3 p-3 border rounded-md hover:bg-accent/50 transition-colors">
      {/* Checkbox + Label */}
      <div className="flex items-center space-x-2">
        <Checkbox
          id={`rule-between-${ruleIndex}`}
          checked={isEnabled}
          onCheckedChange={handleEnabledChange}
        />
        <div className="flex-1">
          <Label
            htmlFor={`rule-between-${ruleIndex}`}
            className="text-sm font-medium cursor-pointer"
          >
            Between
          </Label>
          <p className="text-xs text-muted-foreground mt-0.5">
            Field value must be between minimum and maximum values
          </p>
        </div>
      </div>

      {/* Min/Max Inputs (shown when enabled) */}
      {isEnabled && (
        <div className="ml-6 space-y-3">
          <div className="space-y-2">
            <Label
              htmlFor={`between-min-${ruleIndex}`}
              className="text-sm"
            >
              Minimum value <span className="text-destructive">*</span>
            </Label>
            <Input
              id={`between-min-${ruleIndex}`}
              type="number"
              placeholder="Enter minimum value"
              value={min ?? ""}
              onChange={handleMinChange}
              required={isEnabled}
              className="max-w-xs"
            />
          </div>

          <div className="space-y-2">
            <Label
              htmlFor={`between-max-${ruleIndex}`}
              className="text-sm"
            >
              Maximum value <span className="text-destructive">*</span>
            </Label>
            <Input
              id={`between-max-${ruleIndex}`}
              type="number"
              placeholder="Enter maximum value"
              value={max ?? ""}
              onChange={handleMaxChange}
              required={isEnabled}
              className="max-w-xs"
            />
          </div>
        </div>
      )}
    </div>
  );
};
