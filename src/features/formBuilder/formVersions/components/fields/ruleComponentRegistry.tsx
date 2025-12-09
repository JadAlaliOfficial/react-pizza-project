// src/features/formVersion/components/fields/ruleComponentRegistry.ts

/**
 * Rule Component Registry
 * Maps input rule names/IDs to their corresponding UI components
 * Provides type-safe dynamic rule component resolution
 * UPDATED: Registered AfterDateRuleComponent
 */

import React from 'react';
import type { InputRule as UiInputRule } from '../../types/formVersion.ui-types';

// ============================================================================
// Component Prop Types
// ============================================================================

/**
 * Props for rule configuration components
 * Used to edit rule properties and enable/disable rules
 */
export interface RuleComponentProps {
  /**
   * The rule configuration from field.rules array
   */
  rule: UiInputRule;
  
  /**
   * Index in the field.rules array
   */
  ruleIndex: number;
  
  /**
   * Callback when rule is enabled/disabled
   */
  onEnabledChange: (enabled: boolean) => void;
  
  /**
   * Callback when rule props change
   */
  onRulePropsChange: (ruleProps: string | null) => void;
  
  /**
   * Callback when rule condition changes
   */
  onRuleConditionChange: (ruleCondition: string | null) => void;
}

// ============================================================================
// Component Type
// ============================================================================

export type RuleComponent = React.ComponentType<RuleComponentProps>;

// ============================================================================
// Registry Type
// ============================================================================

/**
 * Rule registry mapping rule name to component
 * Keyed by rule name (e.g., "required", "email", "after")
 */
export type RuleComponentRegistry = Record<string, RuleComponent>;

// ============================================================================
// Default/Fallback Component
// ============================================================================

/**
 * Default rule component shown when rule is not registered
 * Provides basic enable/disable + JSON editor for rule_props
 */
const DefaultRuleComponent: RuleComponent = ({
  rule,
  ruleIndex,
  onEnabledChange,
  onRulePropsChange,
}) => {
  // Determine if rule is enabled (check if it has input_rule_id set)
  const isEnabled = rule.input_rule_id !== null && rule.input_rule_id !== undefined;

  return (
    <div className="p-3 border border-dashed border-gray-300 rounded-md bg-gray-50">
      <div className="flex items-center space-x-2 mb-2">
        <input
          type="checkbox"
          id={`rule-${ruleIndex}`}
          checked={isEnabled}
          onChange={(e) => onEnabledChange(e.target.checked)}
          className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
        />
        <div className="flex-1">
          <label
            htmlFor={`rule-${ruleIndex}`}
            className="text-sm font-medium text-gray-900 cursor-pointer"
          >
            Rule ID: {rule.input_rule_id || 'Unknown'}
          </label>
          <p className="text-xs text-gray-500">No component registered for this rule</p>
        </div>
      </div>

      {isEnabled && (
        <div className="ml-6 mt-2 space-y-2">
          <label className="block text-xs font-medium text-gray-700">
            Rule Props (JSON)
          </label>
          <textarea
            value={rule.rule_props || ''}
            onChange={(e) => onRulePropsChange(e.target.value || null)}
            placeholder='{"key": "value"}'
            rows={3}
            className="w-full px-2 py-1 text-xs font-mono border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-xs text-gray-500">
            💡 Register a custom component for this rule in ruleComponentRegistry.ts
          </p>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// Import Rule Components
// ============================================================================

// After Date Rule (REGISTERED)
import { AfterDateRuleComponent } from './rules/AfterDateRuleComponent';

// TODO: Import additional rule components here as you create them
// import { RequiredRuleComponent } from './rules/RequiredRuleComponent';
// import { EmailRuleComponent } from './rules/EmailRuleComponent';
// import { MinLengthRuleComponent } from './rules/MinLengthRuleComponent';
// import { MaxLengthRuleComponent } from './rules/MaxLengthRuleComponent';
// import { RegexRuleComponent } from './rules/RegexRuleComponent';
// import { UniqueRuleComponent } from './rules/UniqueRuleComponent';
// import { ConfirmedRuleComponent } from './rules/ConfirmedRuleComponent';
// import { NumericRuleComponent } from './rules/NumericRuleComponent';
// import { AlphaRuleComponent } from './rules/AlphaRuleComponent';
// import { AlphaDashRuleComponent } from './rules/AlphaDashRuleComponent';
// import { AlphaNumRuleComponent } from './rules/AlphaNumRuleComponent';
// import { BeforeDateRuleComponent } from './rules/BeforeDateRuleComponent';
// import { BetweenRuleComponent } from './rules/BetweenRuleComponent';
// import { DateRuleComponent } from './rules/DateRuleComponent';
// import { StartsWithRuleComponent } from './rules/StartsWithRuleComponent';
// import { EndsWithRuleComponent } from './rules/EndsWithRuleComponent';
// import { InArrayRuleComponent } from './rules/InArrayRuleComponent';
// import { NotInArrayRuleComponent } from './rules/NotInArrayRuleComponent';
// import { UrlRuleComponent } from './rules/UrlRuleComponent';
// import { IpAddressRuleComponent } from './rules/IpAddressRuleComponent';
// import { JsonRuleComponent } from './rules/JsonRuleComponent';
// import { MimeTypesRuleComponent } from './rules/MimeTypesRuleComponent';
// import { MimesRuleComponent } from './rules/MimesRuleComponent';
// import { ImageDimensionsRuleComponent } from './rules/ImageDimensionsRuleComponent';
// import { FileRuleComponent } from './rules/FileRuleComponent';
// import { ImageRuleComponent } from './rules/ImageRuleComponent';
// ... etc

// ============================================================================
// Rule Registry
// ============================================================================

/**
 * Maps rule name to UI component
 * 
 * IMPORTANT: Keys must match the `name` field from your backend's input_rules table
 * 
 * To find the correct rule names:
 * 1. Check browser console logs when useInputRules loads
 * 2. Or check your backend input_rules table
 * 3. Use the exact name values as keys
 * 
 * Common rule names (adjust to your backend):
 * - "required"
 * - "email"
 * - "min"
 * - "max"
 * - "after"
 * - "before"
 * - "regex"
 * - "unique"
 * - "confirmed"
 * - "numeric"
 * - "alpha"
 * - "alpha_dash"
 * - "alpha_num"
 * - "between"
 * - "date"
 * - "startswith"
 * - "endswith"
 * - "in"
 * - "not_in"
 * - "url"
 * - "ip"
 * - "json"
 * - "mimetypes"
 * - "mimes"
 * - "dimensions"
 * - "file"
 * - "image"
 * ... etc
 */
export const ruleComponentRegistry: RuleComponentRegistry = {
  // After date rule (REGISTERED)
  'after': AfterDateRuleComponent,
  
  // Add more rules here as you create their components:
  // 'required': RequiredRuleComponent,
  // 'email': EmailRuleComponent,
  // 'min': MinLengthRuleComponent,
  // 'max': MaxLengthRuleComponent,
  // 'regex': RegexRuleComponent,
  // 'unique': UniqueRuleComponent,
  // 'confirmed': ConfirmedRuleComponent,
  // 'numeric': NumericRuleComponent,
  // 'alpha': AlphaRuleComponent,
  // 'alpha_dash': AlphaDashRuleComponent,
  // 'alpha_num': AlphaNumRuleComponent,
  // 'before': BeforeDateRuleComponent,
  // 'between': BetweenRuleComponent,
  // 'date': DateRuleComponent,
  // 'startswith': StartsWithRuleComponent,
  // 'endswith': EndsWithRuleComponent,
  // 'in': InArrayRuleComponent,
  // 'not_in': NotInArrayRuleComponent,
  // 'url': UrlRuleComponent,
  // 'ip': IpAddressRuleComponent,
  // 'json': JsonRuleComponent,
  // 'mimetypes': MimeTypesRuleComponent,
  // 'mimes': MimesRuleComponent,
  // 'dimensions': ImageDimensionsRuleComponent,
  // 'file': FileRuleComponent,
  // 'image': ImageRuleComponent,
  // ... etc for all 35 rules
};

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Gets the component for a rule by name
 * Returns default component if rule not registered
 * 
 * @param ruleName - Rule name to look up (e.g., "required", "email")
 * @returns Component for the rule
 */
export const getRuleComponent = (ruleName: string): RuleComponent => {
  const component = ruleComponentRegistry[ruleName];
  
  if (!component) {
    console.warn(
      `[RuleComponentRegistry] No component registered for rule "${ruleName}", using default`
    );
    return DefaultRuleComponent;
  }
  
  return component;
};

/**
 * Gets the component for a rule by ID
 * Requires access to the inputRules data to map ID → name
 * 
 * @param ruleId - Rule ID from backend
 * @param inputRulesData - Array of input rules from useInputRules hook
 * @returns Component for the rule
 */
export const getRuleComponentById = (
  ruleId: number,
  inputRulesData: Array<{ id: number; name: string }>
): RuleComponent => {
  const inputRule = inputRulesData.find((r) => r.id === ruleId);
  
  if (!inputRule) {
    console.warn(
      `[RuleComponentRegistry] Rule with ID ${ruleId} not found in inputRules data, using default`
    );
    return DefaultRuleComponent;
  }
  
  return getRuleComponent(inputRule.name);
};

/**
 * Checks if a rule has a registered component
 * 
 * @param ruleName - Rule name to check
 * @returns True if component is registered
 */
export const hasRuleComponent = (ruleName: string): boolean => {
  return ruleName in ruleComponentRegistry;
};

/**
 * Gets list of all registered rule names
 * 
 * @returns Array of rule names that have registered components
 */
export const getRegisteredRuleNames = (): string[] => {
  return Object.keys(ruleComponentRegistry).sort();
};

/**
 * Filters input rules to only those with registered components
 * Useful for showing only rules that can be configured
 * 
 * @param inputRules - Array of all input rules from backend
 * @returns Filtered array of rules with registered components
 */
export const getRegisteredRules = (
  inputRules: Array<{ id: number; name: string }>
): Array<{ id: number; name: string }> => {
  return inputRules.filter((rule) => hasRuleComponent(rule.name));
};
