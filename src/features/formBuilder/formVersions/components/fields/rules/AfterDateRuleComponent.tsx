// src/features/formVersion/components/fields/rules/AfterDateRuleComponent.tsx

/**
 * After Date Rule Component
 * Example rule component adapted for Form Version Builder
 * Provides UI for configuring the "after" date validation rule
 */

import React, { useMemo } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import type { RuleComponentProps } from '../ruleComponentRegistry';

// ============================================================================
// Rule Props Type
// ============================================================================

/**
 * Props structure for "after" rule
 * Stored in rule.rule_props as JSON string
 */
interface AfterRuleProps {
  date?: string;
}

// ============================================================================
// Component
// ============================================================================

/**
 * AfterDateRuleComponent
 * 
 * UI for the "after" date validation rule
 * Features:
 * - Enable/disable checkbox
 * - Date input for the "after" date
 * - Automatic JSON serialization of rule_props
 * 
 * Rule behavior:
 * - Field value must be a date after the specified date
 * - Commonly used for date inputs (birthdate, appointment, etc.)
 */
export const AfterDateRuleComponent: React.FC<RuleComponentProps> = ({
  rule,
  ruleIndex,
  onEnabledChange,
  onRulePropsChange,
}) => {
  console.debug('[AfterDateRuleComponent] Rendering for rule:', rule.input_rule_id);

  // Determine if rule is enabled
  const isEnabled = rule.input_rule_id !== null && rule.input_rule_id !== undefined;

  /**
   * Parse rule_props from JSON string
   */
  const parsedProps = useMemo((): AfterRuleProps => {
    if (!rule.rule_props) {
      return {};
    }

    try {
      const parsed = JSON.parse(rule.rule_props);
      return parsed as AfterRuleProps;
    } catch (error) {
      console.warn('[AfterDateRuleComponent] Failed to parse rule_props:', error);
      return {};
    }
  }, [rule.rule_props]);

  /**
   * Handles checkbox change (enable/disable rule)
   */
  const handleEnabledChange = (checked: boolean): void => {
    console.debug('[AfterDateRuleComponent] Enabled changed:', checked);
    onEnabledChange(checked);
  };

  /**
   * Handles date input change
   * Serializes props to JSON and calls onRulePropsChange
   */
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const newDate = e.target.value;
    console.debug('[AfterDateRuleComponent] Date changed:', newDate);

    const newProps: AfterRuleProps = {
      ...parsedProps,
      date: newDate || undefined,
    };

    // Serialize to JSON string
    const propsJson = JSON.stringify(newProps);
    onRulePropsChange(propsJson);
  };

  return (
    <div className="space-y-3 p-3 border rounded-md hover:bg-accent/50 transition-colors">
      {/* Checkbox + Label */}
      <div className="flex items-center space-x-2">
        <Checkbox
          id={`rule-after-date-${ruleIndex}`}
          checked={isEnabled}
          onCheckedChange={handleEnabledChange}
        />
        <div className="flex-1">
          <Label
            htmlFor={`rule-after-date-${ruleIndex}`}
            className="text-sm font-medium cursor-pointer"
          >
            After Date
          </Label>
          <p className="text-xs text-muted-foreground mt-0.5">
            Field must be a date after the specified date
          </p>
        </div>
      </div>

      {/* Date Input (shown when enabled) */}
      {isEnabled && (
        <div className="ml-6 space-y-2">
          <Label htmlFor={`after-date-value-${ruleIndex}`} className="text-sm">
            Date <span className="text-destructive">*</span>
          </Label>
          <Input
            id={`after-date-value-${ruleIndex}`}
            type="date"
            value={parsedProps.date || ''}
            onChange={handleDateChange}
            required={isEnabled}
            className="max-w-xs"
          />
          <p className="text-xs text-gray-500">
            Field value must be after this date
          </p>
        </div>
      )}
    </div>
  );
};
