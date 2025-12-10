// src/features/formVersion/components/fields/rules/ConfirmedRuleComponent.tsx

/**
 * Confirmed Rule Component
 *
 * UI for the "confirmed" validation rule
 * Backend rule name: "confirmed"
 *
 * Behavior:
 * - Field must match a confirmation field (e.g., password confirmation)
 * - Uses rule_props JSON: { "confirmationvalue"?: string }
 */

import React, { useMemo } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import type { RuleComponentProps } from "../ruleComponentRegistry";

// ============================================================================
// Rule Props Type
// ============================================================================

interface ConfirmedRuleProps {
  confirmationvalue?: string;
}

// ============================================================================
// Component
// ============================================================================

export const ConfirmedRuleComponent: React.FC<RuleComponentProps> = ({
  rule,
  ruleIndex,
  onEnabledChange,
  onRulePropsChange,
}) => {
  console.debug("[ConfirmedRuleComponent] Rendering for rule:", rule.input_rule_id);

  // Determine if rule is enabled (non-null input_rule_id)
  const isEnabled =
    rule.input_rule_id !== null && rule.input_rule_id !== undefined;

  /**
   * Parse rule_props from JSON string
   */
  const parsedProps = useMemo((): ConfirmedRuleProps => {
    if (!rule.rule_props) {
      return {};
    }

    try {
      const parsed = JSON.parse(rule.rule_props);
      return parsed as ConfirmedRuleProps;
    } catch (error) {
      console.warn("[ConfirmedRuleComponent] Failed to parse rule_props:", error);
      return {};
    }
  }, [rule.rule_props]);

  const { confirmationvalue } = parsedProps;

  /**
   * Handles checkbox change (enable/disable rule)
   */
  const handleEnabledChange = (checked: boolean): void => {
    console.debug("[ConfirmedRuleComponent] Enabled changed:", checked);
    onEnabledChange(checked);
  };

  /**
   * Handles confirmation field key change
   * Serializes props to JSON and calls onRulePropsChange
   */
  const handleConfirmationFieldChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ): void => {
    const value = e.target.value.trim();
    console.debug("[ConfirmedRuleComponent] confirmationvalue changed:", value);

    const newProps: ConfirmedRuleProps = {
      ...parsedProps,
      confirmationvalue: value === "" ? undefined : value,
    };

    const hasValue =
      newProps.confirmationvalue !== undefined &&
      newProps.confirmationvalue !== null &&
      newProps.confirmationvalue !== "";

    const propsJson = hasValue ? JSON.stringify(newProps) : null;
    onRulePropsChange(propsJson);
  };

  return (
    <div className="space-y-3 p-3 border rounded-md hover:bg-accent/50 transition-colors">
      {/* Checkbox + Label */}
      <div className="flex items-center space-x-2">
        <Checkbox
          id={`rule-confirmed-${ruleIndex}`}
          checked={isEnabled}
          onCheckedChange={handleEnabledChange}
        />
        <div className="flex-1">
          <Label
            htmlFor={`rule-confirmed-${ruleIndex}`}
            className="text-sm font-medium cursor-pointer"
          >
            Confirmed
          </Label>
          <p className="text-xs text-muted-foreground mt-0.5">
            Field must match a confirmation field (e.g., password confirmation)
          </p>
        </div>
      </div>

      {/* Confirmation field key input (shown when enabled) */}
      {isEnabled && (
        <div className="ml-6 space-y-2">
          <Label
            htmlFor={`confirmed-field-${ruleIndex}`}
            className="text-sm"
          >
            Confirmation Field Key <span className="text-destructive">*</span>
          </Label>
          <Input
            id={`confirmed-field-${ruleIndex}`}
            type="text"
            placeholder="e.g., password_confirmation"
            value={confirmationvalue ?? ""}
            onChange={handleConfirmationFieldChange}
            required={isEnabled}
          />
          <p className="text-xs text-muted-foreground">
            Name/key of the field that this value must match.
          </p>
        </div>
      )}
    </div>
  );
};
