// src/features/formVersion/components/fields/rules/AlphaNumRuleComponent.tsx

/**
 * Alpha Numeric Rule Component
 *
 * UI for the "alpha_num" validation rule
 * Backend rule name: "alpha_num"
 *
 * Behavior:
 * - Field must contain only alphabetic and numeric characters
 * - No additional rule_props are required (rule_props stays null)
 */

import React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import type { RuleComponentProps } from "../ruleComponentRegistry";

// ============================================================================
// Component
// ============================================================================

export const AlphaNumRuleComponent: React.FC<RuleComponentProps> = ({
  rule,
  ruleIndex,
  onEnabledChange,
  onRulePropsChange,
}) => {
  console.debug("[AlphaNumRuleComponent] Rendering for rule:", rule.input_rule_id);

  // Enabled state comes from having a non-null / non-undefined input_rule_id
  const isEnabled =
    rule.input_rule_id !== null && rule.input_rule_id !== undefined;

  /**
   * Handles checkbox change (enable/disable rule)
   * This rule has no props, so rule_props remains null.
   */
  const handleEnabledChange = (checked: boolean): void => {
    console.debug("[AlphaNumRuleComponent] Enabled changed:", checked);
    onEnabledChange(checked);

    // Ensure rule_props stays null since this rule has no configuration props
    if (rule.rule_props !== null) {
      onRulePropsChange(null);
    }
  };

  return (
    <div className="flex items-center space-x-2 p-3 border rounded-md hover:bg-accent/50 transition-colors">
      <Checkbox
        id={`rule-alpha-numeric-${ruleIndex}`}
        checked={isEnabled}
        onCheckedChange={handleEnabledChange}
      />
      <div className="flex-1">
        <Label
          htmlFor={`rule-alpha-numeric-${ruleIndex}`}
          className="text-sm font-medium cursor-pointer"
        >
          Alpha Numeric
        </Label>
        <p className="text-xs text-muted-foreground mt-0.5">
          Field must contain only alphabetic and numeric characters
        </p>
      </div>
    </div>
  );
};
