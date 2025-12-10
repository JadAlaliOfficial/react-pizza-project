// src/features/formVersion/components/fields/rules/IntegerRuleComponent.tsx

/**
 * Integer Rule Component
 *
 * UI for the "integer" validation rule
 * Backend rule name: "integer"
 *
 * Behavior:
 * - Field must be an integer value (no decimals)
 * - No additional rule_props are required (rule_props stays null)
 */

import React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import type { RuleComponentProps } from "../ruleComponentRegistry";

export const IntegerRuleComponent: React.FC<RuleComponentProps> = ({
  rule,
  ruleIndex,
  onEnabledChange,
  onRulePropsChange,
}) => {
  console.debug("[IntegerRuleComponent] Rendering for rule:", rule.input_rule_id);

  const isEnabled =
    rule.input_rule_id !== null && rule.input_rule_id !== undefined;

  const handleEnabledChange = (checked: boolean): void => {
    console.debug("[IntegerRuleComponent] Enabled changed:", checked);
    onEnabledChange(checked);

    // Ensure rule_props stays null since this rule has no configuration props
    if (rule.rule_props !== null) {
      onRulePropsChange(null);
    }
  };

  return (
    <div className="flex items-center space-x-2 p-3 border rounded-md hover:bg-accent/50 transition-colors">
      <Checkbox
        id={`rule-integer-${ruleIndex}`}
        checked={isEnabled}
        onCheckedChange={handleEnabledChange}
      />

      <div className="flex-1">
        <Label
          htmlFor={`rule-integer-${ruleIndex}`}
          className="text-sm font-medium cursor-pointer"
        >
          Integer
        </Label>

        <p className="text-xs text-muted-foreground mt-0.5">
          Field must be an integer value (no decimals)
        </p>
      </div>
    </div>
  );
};
