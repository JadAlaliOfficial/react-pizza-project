// src/features/formVersion/components/fields/rules/EndsWithRuleComponent.tsx

/**
 * Ends With Rule Component
 *
 * UI for the "ends_with" validation rule
 * Backend rule name: "ends_with"
 *
 * Behavior:
 * - String must end with one of the specified suffix values
 * - Uses rule_props JSON: { "values"?: string[] }
 */

import React, { useEffect, useMemo, useRef, useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import type { RuleComponentProps } from "../ruleComponentRegistry";

interface EndsWithRuleProps {
  values?: string[];
}

export const EndsWithRuleComponent: React.FC<RuleComponentProps> = ({
  rule,
  ruleIndex,
  onEnabledChange,
  onRulePropsChange,
}) => {
  console.debug("[EndsWithRuleComponent] Rendering for rule:", rule.input_rule_id);

  const isEnabled =
    rule.input_rule_id !== null && rule.input_rule_id !== undefined;

  const parsedProps = useMemo((): EndsWithRuleProps => {
    if (!rule.rule_props) {
      return {};
    }

    try {
      const parsed = JSON.parse(rule.rule_props);
      return parsed as EndsWithRuleProps;
    } catch (error) {
      console.warn("[EndsWithRuleComponent] Failed to parse rule_props:", error);
      return {};
    }
  }, [rule.rule_props]);

  const { values } = parsedProps;

  const [text, setText] = useState<string>("");

  const hydratedRef = useRef(false);
  useEffect(() => {
    if (!hydratedRef.current) {
      if (values && values.length > 0) {
        setText(values.join(", "));
      }
      hydratedRef.current = true;
    }
  }, [values]);

  const handleEnabledChange = (checked: boolean): void => {
    console.debug("[EndsWithRuleComponent] Enabled changed:", checked);
    onEnabledChange(checked);
  };

  const handleValuesChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ): void => {
    const value = e.target.value;
    setText(value);

    const valuesArray =
      value.trim() === ""
        ? undefined
        : value
            .split(",")
            .map((v) => v.trim())
            .filter((v) => v.length > 0);

    const newProps: EndsWithRuleProps = {
      ...parsedProps,
      values: valuesArray,
    };

    const hasValues = Array.isArray(newProps.values) && newProps.values.length > 0;
    const propsJson = hasValues ? JSON.stringify(newProps) : null;
    onRulePropsChange(propsJson);
  };

  return (
    <div className="space-y-3 p-3 border rounded-md hover:bg-accent/50 transition-colors">
      <div className="flex items-center space-x-2">
        <Checkbox
          id={`rule-ends-with-${ruleIndex}`}
          checked={isEnabled}
          onCheckedChange={handleEnabledChange}
        />
        <div className="flex-1">
          <Label
            htmlFor={`rule-ends-with-${ruleIndex}`}
            className="text-sm font-medium cursor-pointer"
          >
            Ends With
          </Label>
          <p className="text-xs text-muted-foreground mt-0.5">
            String must end with specified value(s)
          </p>
        </div>
      </div>

      {isEnabled && (
        <div className="ml-6 space-y-2">
          <Label
            htmlFor={`ends-with-values-${ruleIndex}`}
            className="text-sm"
          >
            Suffix Values <span className="text-destructive">*</span>
          </Label>
          <Input
            id={`ends-with-values-${ruleIndex}`}
            type="text"
            placeholder="e.g., .com, .org (comma-separated)"
            value={text}
            onChange={handleValuesChange}
            required={isEnabled}
          />
          <p className="text-xs text-muted-foreground">
            Enter one or more values separated by commas
          </p>
        </div>
      )}
    </div>
  );
};
