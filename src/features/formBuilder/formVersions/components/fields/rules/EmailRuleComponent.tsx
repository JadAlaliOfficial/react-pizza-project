// src/features/formVersion/components/fields/rules/EmailRuleComponent.tsx

/**
 * Email Rule Component
 *
 * UI for the "email" validation rule
 * Backend rule name: "email"
 *
 * Behavior:
 * - Field must be a valid email address
 * - No additional rule_props are required (rule_props stays null)
 */

import React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import type { RuleComponentProps } from "../ruleComponentRegistry";

export const EmailRuleComponent: React.FC<RuleComponentProps> = ({
  rule,
  ruleIndex,
  onEnabledChange,
  onRulePropsChange,
}) => {
  console.debug("[EmailRuleComponent] Rendering for rule:", rule.input_rule_id);

  const isEnabled =
    rule.input_rule_id !== null && rule.input_rule_id !== undefined;

  const handleEnabledChange = (checked: boolean): void => {
    console.debug("[EmailRuleComponent] Enabled changed:", checked);
    onEnabledChange(checked);

    // Ensure rule_props stays null since this rule has no configuration props
    if (rule.rule_props !== null) {
      onRulePropsChange(null);
    }
  };

  return (
    <div className="flex items-center space-x-2 p-3 border rounded-md hover:bg-accent/50 transition-colors">
      <Checkbox
        id={`rule-email-${ruleIndex}`}
        checked={isEnabled}
        onCheckedChange={handleEnabledChange}
      />
      <div className="flex-1">
        <Label
          htmlFor={`rule-email-${ruleIndex}`}
          className="text-sm font-medium cursor-pointer"
        >
          Email
        </Label>
        <p className="text-xs text-muted-foreground mt-0.5">
          Field must be a valid email address
        </p>
      </div>
    </div>
  );
};
