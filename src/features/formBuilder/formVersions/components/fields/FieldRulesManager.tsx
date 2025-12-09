// src/features/formVersion/components/fields/FieldRulesManager.tsx

/**
 * Field Rules Manager Component
 * Manages input rules for a field
 * Dynamically renders rule components based on field type and available rules
 */

import React, { useEffect, useMemo } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertCircle, CheckCircle2, Shield } from 'lucide-react';
import type { UiField, InputRule as UiInputRule } from '../../types/formVersion.ui-types';
import { useInputRules } from '@/features/formBuilder/inputRules/hooks/useInputRules';
import { getRuleComponent } from './ruleComponentRegistry';

// ============================================================================
// Props
// ============================================================================

interface FieldRulesManagerProps {
  /**
   * The field being edited
   */
  field: UiField;

  /**
   * Callback when rules array changes
   */
  onRulesChange: (rules: UiInputRule[]) => void;
}

// ============================================================================
// Component
// ============================================================================

/**
 * FieldRulesManager Component
 * 
 * Filters input rules based on field type
 * Dynamically renders rule components using ruleComponentRegistry
 * Manages enabling/disabling and updating rule props
 * 
 * Features:
 * - Fetches available rules from backend
 * - Filters by field.field_type_id
 * - Shows rule components for applicable rules
 * - Updates field.rules array
 */
export const FieldRulesManager: React.FC<FieldRulesManagerProps> = ({
  field,
  onRulesChange,
}) => {
  const { items: inputRules, loading, error } = useInputRules();

  console.debug('[FieldRulesManager] Rendering for field:', field.id);

  // Ensure input rules are loaded
  useEffect(() => {
    console.debug('[FieldRulesManager] Input rules status:', { loading, count: inputRules.length });
  }, [loading, inputRules.length]);

  /**
   * Filters rules applicable to this field type
   * Checks if rule.field_types includes this field's type
   */
  const applicableRules = useMemo(() => {
    const filtered = inputRules.filter((rule) =>
      rule.field_types?.some((ft) => ft.id === field.field_type_id)
    );

    console.debug(
      '[FieldRulesManager] Applicable rules for field type',
      field.field_type_id,
      ':',
      filtered.length
    );

    return filtered;
  }, [inputRules, field.field_type_id]);

  /**
   * Gets existing rule config from field.rules by input_rule_id
   */
  const getExistingRule = (inputRuleId: number): UiInputRule | undefined => {
    return field.rules.find((r) => r.input_rule_id === inputRuleId);
  };

  /**
   * Checks if a rule is currently enabled
   */
  const isRuleEnabled = (inputRuleId: number): boolean => {
    return field.rules.some((r) => r.input_rule_id === inputRuleId);
  };

  /**
   * Handles enabling/disabling a rule
   */
  const handleRuleEnabledChange = (inputRuleId: number, enabled: boolean): void => {
    console.debug('[FieldRulesManager] Rule enabled change:', inputRuleId, enabled);

    let newRules: UiInputRule[];

    if (enabled) {
      // Add rule if not present
      if (!isRuleEnabled(inputRuleId)) {
        const newRule: UiInputRule = {
          input_rule_id: inputRuleId,
          rule_props: null,
          rule_condition: null,
        };
        newRules = [...field.rules, newRule];
      } else {
        newRules = field.rules;
      }
    } else {
      // Remove rule
      newRules = field.rules.filter((r) => r.input_rule_id !== inputRuleId);
    }

    onRulesChange(newRules);
  };

  /**
   * Handles rule props change
   */
  const handleRulePropsChange = (inputRuleId: number, ruleProps: string | null): void => {
    console.debug('[FieldRulesManager] Rule props change:', inputRuleId, ruleProps);

    const newRules = field.rules.map((r) => {
      if (r.input_rule_id === inputRuleId) {
        return { ...r, rule_props: ruleProps };
      }
      return r;
    });

    onRulesChange(newRules);
  };

  /**
   * Handles rule condition change
   */
  const handleRuleConditionChange = (inputRuleId: number, ruleCondition: string | null): void => {
    console.debug('[FieldRulesManager] Rule condition change:', inputRuleId, ruleCondition);

    const newRules = field.rules.map((r) => {
      if (r.input_rule_id === inputRuleId) {
        return { ...r, rule_condition: ruleCondition };
      }
      return r;
    });

    onRulesChange(newRules);
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center py-8 text-gray-500">
        <Loader2 className="h-5 w-5 animate-spin mr-2" />
        <span className="text-sm">Loading validation rules...</span>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>Error loading rules:</strong> {error}
        </AlertDescription>
      </Alert>
    );
  }

  // No applicable rules
  if (applicableRules.length === 0) {
    return (
      <Alert>
        <Shield className="h-4 w-4" />
        <AlertDescription className="text-xs">
          No validation rules are available for this field type.
        </AlertDescription>
      </Alert>
    );
  }

  // Render applicable rules
  return (
    <div className="space-y-3">
      {/* Summary */}
      <div className="flex items-center justify-between text-xs text-gray-600">
        <span>
          {applicableRules.length} rule{applicableRules.length !== 1 ? 's' : ''} available
        </span>
        {field.rules.length > 0 && (
          <div className="flex items-center gap-1 text-green-600">
            <CheckCircle2 className="h-3 w-3" />
            <span>{field.rules.length} enabled</span>
          </div>
        )}
      </div>

      {/* Rule Components */}
      <div className="space-y-2">
        {applicableRules.map((inputRule, index) => {
          // Get the rule component for this rule
          const RuleComponent = getRuleComponent(inputRule.name);

          // Get existing rule config or create placeholder
          const existingRule = getExistingRule(inputRule.id);
          const ruleConfig: UiInputRule = existingRule || {
            input_rule_id: inputRule.id,
            rule_props: null,
            rule_condition: null,
          };

          return (
            <RuleComponent
              key={inputRule.id}
              rule={ruleConfig}
              ruleIndex={index}
              onEnabledChange={(enabled) =>
                handleRuleEnabledChange(inputRule.id, enabled)
              }
              onRulePropsChange={(props) =>
                handleRulePropsChange(inputRule.id, props)
              }
              onRuleConditionChange={(condition) =>
                handleRuleConditionChange(inputRule.id, condition)
              }
            />
          );
        })}
      </div>

      {/* Help Text */}
      <div className="pt-2 border-t">
        <p className="text-xs text-gray-500">
          💡 Enable rules by checking the boxes. Configure rule-specific properties as needed.
        </p>
      </div>
    </div>
  );
};
