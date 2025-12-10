// components/field-rules/AfterOrEqualRuleComponent.tsx
/**
 * After Or Equal Date Rule Component
 * Provides UI for configuring the "after_or_equal" date validation rule
 * Adapted for Form Version Builder rule registry pattern
 */

import React, { useMemo } from 'react';
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import type { RuleComponentProps } from '../ruleComponentRegistry';

// ============================================================================
// Rule Props Type
// ============================================================================

/**
 * Props structure for "after_or_equal" rule
 * Stored in rule.rule_props as JSON string
 */
interface AfterOrEqualRuleProps {
  date?: string;
}

// ============================================================================
// Component
// ============================================================================

/**
 * AfterOrEqualRuleComponent
 * 
 * UI for the "after_or_equal" date validation rule
 * Features:
 * - Enable/disable checkbox
 * - Date input for the "after or equal" date
 * - Automatic JSON serialization of rule_props
 * 
 * Rule behavior:
 * - Field value must be a date after or equal to the specified date
 * - Commonly used for date inputs (start dates, minimum dates, etc.)
 */
export const AfterOrEqualRuleComponent: React.FC<RuleComponentProps> = ({
  rule,
  ruleIndex,
  onEnabledChange,
  onRulePropsChange,
}) => {
  console.debug('[AfterOrEqualRuleComponent] Rendering for rule:', rule.input_rule_id);

  // Determine if rule is enabled
  const isEnabled = rule.input_rule_id !== null && rule.input_rule_id !== undefined;

  /**
   * Parse rule_props from JSON string
   */
  const parsedProps = useMemo((): AfterOrEqualRuleProps => {
    if (!rule.rule_props) {
      return {};
    }

    try {
      const parsed = JSON.parse(rule.rule_props);
      return parsed as AfterOrEqualRuleProps;
    } catch (error) {
      console.warn('[AfterOrEqualRuleComponent] Failed to parse rule_props:', error);
      return {};
    }
  }, [rule.rule_props]);

  /**
   * Handles checkbox change (enable/disable rule)
   */
  const handleEnabledChange = (checked: boolean): void => {
    console.debug('[AfterOrEqualRuleComponent] Enabled changed:', checked);
    onEnabledChange(checked);
  };

  /**
   * Handles date input change
   * Serializes props to JSON and calls onRulePropsChange
   */
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const newDate = e.target.value;
    console.debug('[AfterOrEqualRuleComponent] Date changed:', newDate);

    const newProps: AfterOrEqualRuleProps = {
      ...parsedProps,
      date: newDate || undefined,
    };

    // Serialize to JSON string, set null when no date
    const propsJson = newProps.date ? JSON.stringify(newProps) : null;
    onRulePropsChange(propsJson);
  };

  return (
    <div className="space-y-3 p-3 border rounded-md hover:bg-accent/50 transition-colors">
      {/* Checkbox + Label */}
      <div className="flex items-center space-x-2">
        <Checkbox
          id={`rule-after-or-equal-${ruleIndex}`}
          checked={isEnabled}
          onCheckedChange={handleEnabledChange}
        />
        <div className="flex-1">
          <Label
            htmlFor={`rule-after-or-equal-${ruleIndex}`}
            className="text-sm font-medium cursor-pointer"
          >
            After Or Equal
          </Label>
          <p className="text-xs text-muted-foreground mt-0.5">
            Date must be after or equal to the specified date
          </p>
        </div>
      </div>

      {/* Date Input (shown when enabled) */}
      {isEnabled && (
        <div className="ml-6 space-y-2">
          <Label
            htmlFor={`after-or-equal-date-value-${ruleIndex}`}
            className="text-sm"
          >
            Date <span className="text-destructive">*</span>
          </Label>
          <Input
            id={`after-or-equal-date-value-${ruleIndex}`}
            type="date"
            value={parsedProps.date ?? ""}
            onChange={handleDateChange}
            required={isEnabled}
            className="max-w-xs"
          />
          <p className="text-xs text-muted-foreground">
            Field value must be after or equal to this date
          </p>
        </div>
      )}
    </div>
  );
};
