// src/features/formVersion/components/fields/rules/RequiredRuleComponent.tsx

/**
 * Required Rule Component
 *
 * UI for the "required" validation rule
 * Backend rule name: "required"
 *
 * Behavior:
 * - Field must have a value
 * - No additional rule_props are required (rule_props stays null)
 */

import React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import type { RuleComponentProps } from "../ruleComponentRegistry";

export const RequiredRuleComponent: React.FC<RuleComponentProps> = ({
  rule,
  ruleIndex,
  onEnabledChange,
  onRulePropsChange,
}) => {
  console.debug("[RequiredRuleComponent] Rendering for rule:", rule.input_rule_id);

  const isEnabled =
    rule.input_rule_id !== null && rule.input_rule_id !== undefined;

  const handleEnabledChange = (checked: boolean): void => {
    console.debug("[RequiredRuleComponent] Enabled changed:", checked);
    onEnabledChange(checked);

    // Ensure rule_props stays null since this rule has no configuration props
    if (rule.rule_props !== null) {
      onRulePropsChange(null);
    }
  };

  return (
    <div className="flex items-center space-x-2 p-3 border rounded-md hover:bg-accent/50 transition-colors">
      <Checkbox
        id={`rule-required-${ruleIndex}`}
        checked={isEnabled}
        onCheckedChange={handleEnabledChange}
      />
      <div className="flex-1">
        <Label
          htmlFor={`rule-required-${ruleIndex}`}
          className="text-sm font-medium cursor-pointer"
        >
          Required
        </Label>
        <p className="text-xs text-muted-foreground mt-0.5">
          Field must have a value
        </p>
      </div>
    </div>
  );
};
