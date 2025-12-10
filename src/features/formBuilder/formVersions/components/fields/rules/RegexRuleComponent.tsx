// src/features/formVersion/components/fields/rules/RegexRuleComponent.tsx

/**
 * Regex Rule Component
 *
 * UI for the "regex" validation rule
 * Backend rule name: "regex"
 *
 * Behavior:
 * - Field must match the regular expression pattern
 * - Uses rule_props JSON: { "pattern"?: string }
 */

import React, { useMemo } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import type { RuleComponentProps } from "../ruleComponentRegistry";

interface RegexRuleProps {
  pattern?: string;
}

export const RegexRuleComponent: React.FC<RuleComponentProps> = ({
  rule,
  ruleIndex,
  onEnabledChange,
  onRulePropsChange,
}) => {
  console.debug("[RegexRuleComponent] Rendering for rule:", rule.input_rule_id);

  const isEnabled =
    rule.input_rule_id !== null && rule.input_rule_id !== undefined;

  const parsedProps = useMemo((): RegexRuleProps => {
    if (!rule.rule_props) {
      return {};
    }

    try {
      const parsed = JSON.parse(rule.rule_props);
      return parsed as RegexRuleProps;
    } catch (error) {
      console.warn("[RegexRuleComponent] Failed to parse rule_props:", error);
      return {};
    }
  }, [rule.rule_props]);

  const { pattern } = parsedProps;

  const handleEnabledChange = (checked: boolean): void => {
    console.debug("[RegexRuleComponent] Enabled changed:", checked);
    onEnabledChange(checked);
  };

  const handlePatternChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ): void => {
    const value = e.target.value.trim();
    console.debug("[RegexRuleComponent] pattern changed:", value);

    const newProps: RegexRuleProps = {
      ...parsedProps,
      pattern: value === "" ? undefined : value,
    };

    const hasValue =
      newProps.pattern !== undefined &&
      newProps.pattern !== null &&
      newProps.pattern !== "";

    const propsJson = hasValue ? JSON.stringify(newProps) : null;
    onRulePropsChange(propsJson);
  };

  return (
    <div className="space-y-3 p-3 border rounded-md hover:bg-accent/50 transition-colors">
      <div className="flex items-center space-x-2">
        <Checkbox
          id={`rule-regex-${ruleIndex}`}
          checked={isEnabled}
          onCheckedChange={handleEnabledChange}
        />
        <div className="flex-1">
          <Label
            htmlFor={`rule-regex-${ruleIndex}`}
            className="text-sm font-medium cursor-pointer"
          >
            Regex
          </Label>
          <p className="text-xs text-muted-foreground mt-0.5">
            Field must match the regular expression pattern
          </p>
        </div>
      </div>

      {isEnabled && (
        <div className="ml-6 space-y-2">
          <Label
            htmlFor={`regex-pattern-${ruleIndex}`}
            className="text-sm"
          >
            Pattern <span className="text-destructive">*</span>
          </Label>
          <Input
            id={`regex-pattern-${ruleIndex}`}
            type="text"
            placeholder="e.g., ^[A-Z0-9]+$"
            value={pattern ?? ""}
            onChange={handlePatternChange}
            required={isEnabled}
            className="max-w-md font-mono text-sm"
          />
          <p className="text-xs text-muted-foreground">
            Enter a valid regular expression pattern
          </p>
        </div>
      )}
    </div>
  );
};
