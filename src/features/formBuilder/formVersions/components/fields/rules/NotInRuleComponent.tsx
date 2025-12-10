// src/features/formVersion/components/fields/rules/NotInRuleComponent.tsx

/**
 * Not In Rule Component
 *
 * UI for the "not_in" validation rule
 * Backend rule name: "not_in"
 *
 * Behavior:
 * - Field value must NOT be one of the specified values
 * - Uses rule_props JSON: { "values"?: string[] }
 */

import React, { useEffect, useMemo, useRef, useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import type { RuleComponentProps } from "../ruleComponentRegistry";

interface NotInRuleProps {
  values?: string[];
}

export const NotInRuleComponent: React.FC<RuleComponentProps> = ({
  rule,
  ruleIndex,
  onEnabledChange,
  onRulePropsChange,
}) => {
  console.debug("[NotInRuleComponent] Rendering for rule:", rule.input_rule_id);

  const isEnabled =
    rule.input_rule_id !== null && rule.input_rule_id !== undefined;

  const parsedProps = useMemo((): NotInRuleProps => {
    if (!rule.rule_props) {
      return {};
    }

    try {
      const parsed = JSON.parse(rule.rule_props);
      return parsed as NotInRuleProps;
    } catch (error) {
      console.warn("[NotInRuleComponent] Failed to parse rule_props:", error);
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
    console.debug("[NotInRuleComponent] Enabled changed:", checked);
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

    const newProps: NotInRuleProps = {
      ...parsedProps,
      values: valuesArray,
    };

    const hasValues =
      Array.isArray(newProps.values) && newProps.values.length > 0;
    const propsJson = hasValues ? JSON.stringify(newProps) : null;
    onRulePropsChange(propsJson);
  };

  return (
    <div className="space-y-3 p-3 border rounded-md hover:bg-accent/50 transition-colors">
      <div className="flex items-center space-x-2">
        <Checkbox
          id={`rule-not-in-${ruleIndex}`}
          checked={isEnabled}
          onCheckedChange={handleEnabledChange}
        />
        <div className="flex-1">
          <Label
            htmlFor={`rule-not-in-${ruleIndex}`}
            className="text-sm font-medium cursor-pointer"
          >
            Not In
          </Label>
          <p className="text-xs text-muted-foreground mt-0.5">
            Field value must NOT be one of the specified values
          </p>
        </div>
      </div>

      {isEnabled && (
        <div className="ml-6 space-y-2">
          <Label
            htmlFor={`not-in-values-${ruleIndex}`}
            className="text-sm"
          >
            Disallowed Values <span className="text-destructive">*</span>
          </Label>
          <Input
            id={`not-in-values-${ruleIndex}`}
            type="text"
            placeholder="e.g., banned1, banned2, banned3"
            value={text}
            onChange={handleValuesChange}
            required={isEnabled}
          />
          <p className="text-xs text-muted-foreground">
            Comma-separated list of values that are NOT allowed
          </p>
        </div>
      )}
    </div>
  );
};
