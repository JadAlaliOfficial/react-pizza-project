// src/features/formVersion/components/fields/rules/SameRuleComponent.tsx

/**
 * Same Rule Component
 *
 * UI for the "same" validation rule
 * Backend rule name: "same"
 *
 * Behavior:
 * - Field must match another field
 * - Uses rule_props JSON: { "comparevalue"?: string }
 */

import React, { useMemo } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import type { RuleComponentProps } from "../ruleComponentRegistry";

interface SameRuleProps {
  comparevalue?: string;
}

export const SameRuleComponent: React.FC<RuleComponentProps> = ({
  rule,
  ruleIndex,
  onEnabledChange,
  onRulePropsChange,
}) => {
  console.debug("[SameRuleComponent] Rendering for rule:", rule.input_rule_id);

  const isEnabled =
    rule.input_rule_id !== null && rule.input_rule_id !== undefined;

  const parsedProps = useMemo((): SameRuleProps => {
    if (!rule.rule_props) {
      return {};
    }

    try {
      const parsed = JSON.parse(rule.rule_props);
      return parsed as SameRuleProps;
    } catch (error) {
      console.warn("[SameRuleComponent] Failed to parse rule_props:", error);
      return {};
    }
  }, [rule.rule_props]);

  const { comparevalue } = parsedProps;

  const handleEnabledChange = (checked: boolean): void => {
    console.debug("[SameRuleComponent] Enabled changed:", checked);
    onEnabledChange(checked);
  };

  const handleFieldChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ): void => {
    const value = e.target.value.trim();
    console.debug("[SameRuleComponent] comparevalue changed:", value);

    const newProps: SameRuleProps = {
      ...parsedProps,
      comparevalue: value === "" ? undefined : value,
    };

    const hasValue =
      newProps.comparevalue !== undefined &&
      newProps.comparevalue !== null &&
      newProps.comparevalue !== "";

    const propsJson = hasValue ? JSON.stringify(newProps) : null;
    onRulePropsChange(propsJson);
  };

  return (
    <div className="space-y-3 p-3 border rounded-md hover:bg-accent/50 transition-colors">
      <div className="flex items-center space-x-2">
        <Checkbox
          id={`rule-same-${ruleIndex}`}
          checked={isEnabled}
          onCheckedChange={handleEnabledChange}
        />
        <div className="flex-1">
          <Label
            htmlFor={`rule-same-${ruleIndex}`}
            className="text-sm font-medium cursor-pointer"
          >
            Same
          </Label>
          <p className="text-xs text-muted-foreground mt-0.5">
            Field must match another field
          </p>
        </div>
      </div>

      {isEnabled && (
        <div className="ml-6 space-y-2">
          <Label
            htmlFor={`same-field-${ruleIndex}`}
            className="text-sm"
          >
            Field to Match <span className="text-destructive">*</span>
          </Label>
          <Input
            id={`same-field-${ruleIndex}`}
            type="text"
            placeholder="e.g., password, email"
            value={comparevalue ?? ""}
            onChange={handleFieldChange}
            required={isEnabled}
          />
          <p className="text-xs text-muted-foreground">
            Enter the name or identifier of the field to compare with
          </p>
        </div>
      )}
    </div>
  );
};
