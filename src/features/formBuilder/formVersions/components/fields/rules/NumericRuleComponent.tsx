// src/features/formVersion/components/fields/rules/NumericRuleComponent.tsx

/**
 * Numeric Rule Component
 *
 * UI for the "numeric" validation rule
 * Backend rule name: "numeric"
 *
 * Behavior:
 * - Field must be a numeric value
 * - No additional rule_props are required (rule_props stays null)
 */

import React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import type { RuleComponentProps } from "../ruleComponentRegistry";

export const NumericRuleComponent: React.FC<RuleComponentProps> = ({
  rule,
  ruleIndex,
  onEnabledChange,
  onRulePropsChange,
}) => {
  console.debug("[NumericRuleComponent] Rendering for rule:", rule.input_rule_id);

  const isEnabled =
    rule.input_rule_id !== null && rule.input_rule_id !== undefined;

  const handleEnabledChange = (checked: boolean): void => {
    console.debug("[NumericRuleComponent] Enabled changed:", checked);
    onEnabledChange(checked);

    // Ensure rule_props stays null since this rule has no configuration props
    if (rule.rule_props !== null) {
      onRulePropsChange(null);
    }
  };

  return (
    <div className="flex items-center space-x-2 p-3 border rounded-md hover:bg-accent/50 transition-colors">
      <Checkbox
        id={`rule-numeric-${ruleIndex}`}
        checked={isEnabled}
        onCheckedChange={handleEnabledChange}
      />
      <div className="flex-1">
        <Label
          htmlFor={`rule-numeric-${ruleIndex}`}
          className="text-sm font-medium cursor-pointer"
        >
          Numeric
        </Label>
        <p className="text-xs text-muted-foreground mt-0.5">
          Field must be a numeric value
        </p>
      </div>
    </div>
  );
};
