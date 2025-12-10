// src/features/formVersion/components/fields/rules/MaxRuleComponent.tsx

/**
 * Max Rule Component
 *
 * UI for the "max" validation rule
 * Backend rule name: "max"
 *
 * Behavior:
 * - Field value must not exceed this value
 * - Uses rule_props JSON: { "value"?: number }
 */

import React, { useMemo } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import type { RuleComponentProps } from "../ruleComponentRegistry";

interface MaxRuleProps {
  value?: number;
}

export const MaxRuleComponent: React.FC<RuleComponentProps> = ({
  rule,
  ruleIndex,
  onEnabledChange,
  onRulePropsChange,
}) => {
  console.debug("[MaxRuleComponent] Rendering for rule:", rule.input_rule_id);

  const isEnabled =
    rule.input_rule_id !== null && rule.input_rule_id !== undefined;

  const parsedProps = useMemo((): MaxRuleProps => {
    if (!rule.rule_props) {
      return {};
    }

    try {
      const parsed = JSON.parse(rule.rule_props);
      return parsed as MaxRuleProps;
    } catch (error) {
      console.warn("[MaxRuleComponent] Failed to parse rule_props:", error);
      return {};
    }
  }, [rule.rule_props]);

  const { value } = parsedProps;

  const handleEnabledChange = (checked: boolean): void => {
    console.debug("[MaxRuleComponent] Enabled changed:", checked);
    onEnabledChange(checked);
  };

  const updateProps = (next: MaxRuleProps): void => {
    const hasValue =
      next.value !== undefined && next.value !== null && !Number.isNaN(next.value);
    const json = hasValue ? JSON.stringify(next) : null;
    onRulePropsChange(json);
  };

  const handleValueChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ): void => {
    const raw = e.target.value;

    if (raw === "") {
      updateProps({
        ...parsedProps,
        value: undefined,
      });
      return;
    }

    const numericValue = Number(raw);
    if (Number.isNaN(numericValue)) {
      return;
    }

    updateProps({
      ...parsedProps,
      value: numericValue,
    });
  };

  return (
    <div className="space-y-3 p-3 border rounded-md hover:bg-accent/50 transition-colors">
      <div className="flex items-center space-x-2">
        <Checkbox
          id={`rule-max-${ruleIndex}`}
          checked={isEnabled}
          onCheckedChange={handleEnabledChange}
        />
        <div className="flex-1">
          <Label
            htmlFor={`rule-max-${ruleIndex}`}
            className="text-sm font-medium cursor-pointer"
          >
            Maximum
          </Label>
          <p className="text-xs text-muted-foreground mt-0.5">
            Field value must not exceed this value
          </p>
        </div>
      </div>

      {isEnabled && (
        <div className="ml-6 space-y-2">
          <Label
            htmlFor={`max-value-${ruleIndex}`}
            className="text-sm"
          >
            Maximum value <span className="text-destructive">*</span>
          </Label>
          <Input
            id={`max-value-${ruleIndex}`}
            type="number"
            placeholder="Enter maximum value"
            value={value ?? ""}
            onChange={handleValueChange}
            required={isEnabled}
            className="max-w-xs"
          />
        </div>
      )}
    </div>
  );
};
