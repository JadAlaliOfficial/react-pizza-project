// src/features/formVersion/components/fields/rules/MimesRuleComponent.tsx

/**
 * Mimes Rule Component
 *
 * UI for the "mimes" validation rule
 * Backend rule name: "mimes"
 *
 * Behavior:
 * - File must be of specified MIME-like types / extensions (e.g., jpg, png, pdf)
 * - Uses rule_props JSON: { "types"?: string[] }
 */

import React, { useEffect, useMemo, useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import type { RuleComponentProps } from "../ruleComponentRegistry";

interface MimesRuleProps {
  types?: string[];
}

export const MimesRuleComponent: React.FC<RuleComponentProps> = ({
  rule,
  ruleIndex,
  onEnabledChange,
  onRulePropsChange,
}) => {
  console.debug("[MimesRuleComponent] Rendering for rule:", rule.input_rule_id);

  const isEnabled =
    rule.input_rule_id !== null && rule.input_rule_id !== undefined;

  const parsedProps = useMemo((): MimesRuleProps => {
    if (!rule.rule_props) {
      return {};
    }

    try {
      const parsed = JSON.parse(rule.rule_props);
      return parsed as MimesRuleProps;
    } catch (error) {
      console.warn("[MimesRuleComponent] Failed to parse rule_props:", error);
      return {};
    }
  }, [rule.rule_props]);

  const { types } = parsedProps;

  // Local input string so we don't lose commas while typing
  const [inputValue, setInputValue] = useState<string>(() =>
    types?.join(", ") ?? ""
  );

  // If the underlying props.types changes from outside, sync our input
  useEffect(() => {
    setInputValue(types?.join(", ") ?? "");
  }, [types]);

  const handleEnabledChange = (checked: boolean): void => {
    console.debug("[MimesRuleComponent] Enabled changed:", checked);
    onEnabledChange(checked);
  };

  const handleTypesChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ): void => {
    const value = e.target.value;
    setInputValue(value);

    const typesArray =
      value.trim() === ""
        ? undefined
        : value
            .split(",")
            .map((t) => t.trim())
            .filter((t) => t.length > 0);

    const newProps: MimesRuleProps = {
      ...parsedProps,
      types: typesArray,
    };

    const hasTypes =
      Array.isArray(newProps.types) && newProps.types.length > 0;
    const propsJson = hasTypes ? JSON.stringify(newProps) : null;
    onRulePropsChange(propsJson);
  };

  return (
    <div className="space-y-3 p-3 border rounded-md hover:bg-accent/50 transition-colors">
      <div className="flex items-center space-x-2">
        <Checkbox
          id={`rule-mimes-${ruleIndex}`}
          checked={isEnabled}
          onCheckedChange={handleEnabledChange}
        />
        <div className="flex-1">
          <Label
            htmlFor={`rule-mimes-${ruleIndex}`}
            className="text-sm font-medium cursor-pointer"
          >
            Mimes
          </Label>
          <p className="text-xs text-muted-foreground mt-0.5">
            File must be of specified MIME types (e.g., jpg, png, pdf)
          </p>
        </div>
      </div>

      {isEnabled && (
        <div className="ml-6 space-y-2">
          <Label
            htmlFor={`mimes-types-${ruleIndex}`}
            className="text-sm"
          >
            Allowed Types <span className="text-destructive">*</span>
          </Label>
          <Input
            id={`mimes-types-${ruleIndex}`}
            type="text"
            placeholder="e.g., jpg, png, pdf, docx"
            value={inputValue}
            onChange={handleTypesChange}
            required={isEnabled}
          />
          <p className="text-xs text-muted-foreground">
            Comma-separated list of allowed file extensions
          </p>
        </div>
      )}
    </div>
  );
};
