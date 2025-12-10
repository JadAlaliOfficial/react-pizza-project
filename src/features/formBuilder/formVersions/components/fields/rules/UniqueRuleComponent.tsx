// src/features/formVersion/components/fields/rules/UniqueRuleComponent.tsx

/**
 * Unique Rule Component
 *
 * UI for the "unique" validation rule
 * Backend rule name: "unique"
 *
 * Behavior:
 * - Value must be unique across all entries
 * - No additional rule_props are required (rule_props stays null)
 */

import React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import type { RuleComponentProps } from "../ruleComponentRegistry";

export const UniqueRuleComponent: React.FC<RuleComponentProps> = ({
  rule,
  ruleIndex,
  onEnabledChange,
  onRulePropsChange,
}) => {
  console.debug("[UniqueRuleComponent] Rendering for rule:", rule.input_rule_id);

  const isEnabled =
    rule.input_rule_id !== null && rule.input_rule_id !== undefined;

  const handleEnabledChange = (checked: boolean): void => {
    console.debug("[UniqueRuleComponent] Enabled changed:", checked);
    onEnabledChange(checked);

    // Ensure rule_props stays null since this rule has no configuration props
    if (rule.rule_props !== null) {
      onRulePropsChange(null);
    }
  };

  return (
    <div className="space-y-3 p-3 border rounded-md hover:bg-accent/50 transition-colors">
      <div className="flex items-center space-x-2">
        <Checkbox
          id={`rule-unique-${ruleIndex}`}
          checked={isEnabled}
          onCheckedChange={handleEnabledChange}
        />
        <div className="flex-1">
          <Label
            htmlFor={`rule-unique-${ruleIndex}`}
            className="text-sm font-medium cursor-pointer"
          >
            Unique
          </Label>
          <p className="text-xs text-muted-foreground mt-0.5">
            Value must be unique across all entries
          </p>
        </div>
      </div>
    </div>
  );
};
