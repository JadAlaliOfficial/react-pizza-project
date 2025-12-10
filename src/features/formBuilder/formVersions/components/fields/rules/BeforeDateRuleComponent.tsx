// src/features/formVersion/components/fields/rules/BeforeDateRuleComponent.tsx

/**
 * Before Date Rule Component
 *
 * UI for the "before" date validation rule
 * Backend rule name: "before"
 *
 * Behavior:
 * - Field value must be a date before the specified date
 * - Uses rule_props JSON: { "date"?: string }
 */

import React, { useMemo } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import type { RuleComponentProps } from "../ruleComponentRegistry";

// ============================================================================
// Rule Props Type
// ============================================================================

interface BeforeRuleProps {
  date?: string;
}

// ============================================================================
// Component
// ============================================================================

export const BeforeDateRuleComponent: React.FC<RuleComponentProps> = ({
  rule,
  ruleIndex,
  onEnabledChange,
  onRulePropsChange,
}) => {
  console.debug("[BeforeDateRuleComponent] Rendering for rule:", rule.input_rule_id);

  // Determine if rule is enabled (non-null input_rule_id)
  const isEnabled =
    rule.input_rule_id !== null && rule.input_rule_id !== undefined;

  /**
   * Parse rule_props from JSON string
   */
  const parsedProps = useMemo((): BeforeRuleProps => {
    if (!rule.rule_props) {
      return {};
    }

    try {
      const parsed = JSON.parse(rule.rule_props);
      return parsed as BeforeRuleProps;
    } catch (error) {
      console.warn("[BeforeDateRuleComponent] Failed to parse rule_props:", error);
      return {};
    }
  }, [rule.rule_props]);

  /**
   * Handles checkbox change (enable/disable rule)
   */
  const handleEnabledChange = (checked: boolean): void => {
    console.debug("[BeforeDateRuleComponent] Enabled changed:", checked);
    onEnabledChange(checked);
  };

  /**
   * Handles date input change
   * Serializes props to JSON and calls onRulePropsChange
   */
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const newDate = e.target.value;
    console.debug("[BeforeDateRuleComponent] Date changed:", newDate);

    const newProps: BeforeRuleProps = {
      ...parsedProps,
      date: newDate || undefined,
    };

    const propsJson = newProps.date ? JSON.stringify(newProps) : null;
    onRulePropsChange(propsJson);
  };

  return (
    <div className="space-y-3 p-3 border rounded-md hover:bg-accent/50 transition-colors">
      {/* Checkbox + Label */}
      <div className="flex items-center space-x-2">
        <Checkbox
          id={`rule-before-date-${ruleIndex}`}
          checked={isEnabled}
          onCheckedChange={handleEnabledChange}
        />
        <div className="flex-1">
          <Label
            htmlFor={`rule-before-date-${ruleIndex}`}
            className="text-sm font-medium cursor-pointer"
          >
            Before Date
          </Label>
          <p className="text-xs text-muted-foreground mt-0.5">
            Field must be a date before the specified date
          </p>
        </div>
      </div>

      {/* Date Input (shown when enabled) */}
      {isEnabled && (
        <div className="ml-6 space-y-2">
          <Label
            htmlFor={`before-date-value-${ruleIndex}`}
            className="text-sm"
          >
            Date <span className="text-destructive">*</span>
          </Label>
          <Input
            id={`before-date-value-${ruleIndex}`}
            type="date"
            value={parsedProps.date ?? ""}
            onChange={handleDateChange}
            required={isEnabled}
            className="max-w-xs"
          />
          <p className="text-xs text-muted-foreground">
            Field value must be before this date
          </p>
        </div>
      )}
    </div>
  );
};
