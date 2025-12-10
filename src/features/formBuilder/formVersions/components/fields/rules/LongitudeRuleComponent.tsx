// src/features/formVersion/components/fields/rules/LongitudeRuleComponent.tsx

/**
 * Longitude Rule Component
 *
 * UI for the "longitude" validation rule
 * Backend rule name: "longitude"
 *
 * Behavior:
 * - Must be a valid longitude coordinate (-180 to 180)
 * - No additional rule_props are required (rule_props stays null)
 */

import React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import type { RuleComponentProps } from "../ruleComponentRegistry";

export const LongitudeRuleComponent: React.FC<RuleComponentProps> = ({
  rule,
  ruleIndex,
  onEnabledChange,
  onRulePropsChange,
}) => {
  console.debug("[LongitudeRuleComponent] Rendering for rule:", rule.input_rule_id);

  const isEnabled =
    rule.input_rule_id !== null && rule.input_rule_id !== undefined;

  const handleEnabledChange = (checked: boolean): void => {
    console.debug("[LongitudeRuleComponent] Enabled changed:", checked);
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
          id={`rule-longitude-${ruleIndex}`}
          checked={isEnabled}
          onCheckedChange={handleEnabledChange}
        />
        <div className="flex-1">
          <Label
            htmlFor={`rule-longitude-${ruleIndex}`}
            className="text-sm font-medium cursor-pointer"
          >
            Longitude
          </Label>
          <p className="text-xs text-muted-foreground mt-0.5">
            Must be a valid longitude coordinate (-180 to 180)
          </p>
        </div>
      </div>
    </div>
  );
};
