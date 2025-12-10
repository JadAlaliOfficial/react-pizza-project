// src/features/formVersion/components/fields/rules/MimeTypesRuleComponent.tsx

/**
 * Mime Types Rule Component
 *
 * UI for the "mimetypes" validation rule
 * Backend rule name: "mimetypes"
 *
 * Behavior:
 * - File must match specified MIME type patterns
 * - Uses rule_props JSON: { "types"?: string[] }
 */

import React, { useEffect, useMemo, useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import type { RuleComponentProps } from "../ruleComponentRegistry";

interface MimeTypesRuleProps {
  types?: string[];
}

export const MimeTypesRuleComponent: React.FC<RuleComponentProps> = ({
  rule,
  ruleIndex,
  onEnabledChange,
  onRulePropsChange,
}) => {
  console.debug("[MimeTypesRuleComponent] Rendering for rule:", rule.input_rule_id);

  const isEnabled =
    rule.input_rule_id !== null && rule.input_rule_id !== undefined;

  const parsedProps = useMemo((): MimeTypesRuleProps => {
    if (!rule.rule_props) {
      return {};
    }

    try {
      const parsed = JSON.parse(rule.rule_props);
      return parsed as MimeTypesRuleProps;
    } catch (error) {
      console.warn("[MimeTypesRuleComponent] Failed to parse rule_props:", error);
      return {};
    }
  }, [rule.rule_props]);

  const { types } = parsedProps;

  // Local input string so commas don't disappear while typing
  const [inputValue, setInputValue] = useState<string>(() =>
    types?.join(", ") ?? ""
  );

  useEffect(() => {
    setInputValue(types?.join(", ") ?? "");
  }, [types]);

  const handleEnabledChange = (checked: boolean): void => {
    console.debug("[MimeTypesRuleComponent] Enabled changed:", checked);
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

    const newProps: MimeTypesRuleProps = {
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
          id={`rule-mimetypes-${ruleIndex}`}
          checked={isEnabled}
          onCheckedChange={handleEnabledChange}
        />
        <div className="flex-1">
          <Label
            htmlFor={`rule-mimetypes-${ruleIndex}`}
            className="text-sm font-medium cursor-pointer"
          >
            Mime Types
          </Label>
          <p className="text-xs text-muted-foreground mt-0.5">
            File must match specified MIME type patterns
          </p>
        </div>
      </div>

      {isEnabled && (
        <div className="ml-6 space-y-2">
          <Label
            htmlFor={`mimetypes-value-${ruleIndex}`}
            className="text-sm"
          >
            MIME Types <span className="text-destructive">*</span>
          </Label>
          <Input
            id={`mimetypes-value-${ruleIndex}`}
            type="text"
            placeholder="e.g., image/jpeg, application/pdf, video/*"
            value={inputValue}
            onChange={handleTypesChange}
            required={isEnabled}
            className="font-mono text-sm"
          />
          <p className="text-xs text-muted-foreground">
            Comma-separated MIME type patterns (supports wildcards like image/*, video/*)
          </p>
        </div>
      )}
    </div>
  );
};
