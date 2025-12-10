// src/features/formVersion/components/fields/ruleComponentRegistry.ts

/**
 * Rule Component Registry
 * Maps input rule names/IDs to their corresponding UI components
 * Provides type-safe dynamic rule component resolution
 * UPDATED: Registered AfterDateRuleComponent
 */

import React from 'react';
import type { InputRule as UiInputRule } from '../../types/formVersion.ui-types';
import { JsonEditor } from './rules/JsonEditor';

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
const DefaultRuleComponent: RuleComponent = ({ rule, ruleIndex, onEnabledChange, onRulePropsChange }) => {
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
          <label htmlFor={`rule-${ruleIndex}`} className="text-sm font-medium text-gray-900 cursor-pointer">
            Rule
          </label>
        </div>
      </div>
      {isEnabled && (
        <div className="ml-6 mt-2">
          <JsonEditor
            id={`rule-props-${ruleIndex}`}
            label="Rule Props (JSON)"
            value={rule.rule_props}
            onChange={(v) => onRulePropsChange(v)}
          />
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
// After or Equal Date Rule (REGISTERED)
import { AfterOrEqualRuleComponent } from './rules/AfterOrEqualRuleComponent';
// Alpha Dash Rule (REGISTERED)
import { AlphaDashRuleComponent } from './rules/AlphaDashRuleComponent';
// Alpha Numeric Rule (REGISTERED)
import { AlphaNumRuleComponent } from './rules/AlphaNumRuleComponent';
// Alpha Rule (REGISTERED)
import { AlphaRuleComponent } from './rules/AlphaRuleComponent';
// Before Date Rule (REGISTERED)
import { BeforeDateRuleComponent } from './rules/BeforeDateRuleComponent';
// Before or Equal Date Rule (REGISTERED)
import { BeforeOrEqualRuleComponent } from './rules/BeforeOrEqualRuleComponent';
// Between Rule (REGISTERED)
import { BetweenRuleComponent } from './rules/BetweenRuleComponent';
// Confirmed Rule (REGISTERED)
import { ConfirmedRuleComponent } from './rules/ConfirmedRuleComponent';
// Date Format Rule (REGISTERED)
import { DateFormatRuleComponent } from './rules/DateFormatRuleComponent';
// Date Rule (REGISTERED)
import { DateRuleComponent } from './rules/DateRuleComponent';
// Different Rule (REGISTERED)
import { DifferentRuleComponent } from './rules/DifferentRuleComponent';
// Dimensions Rule (REGISTERED)
import { DimensionsRuleComponent } from './rules/DimensionsRuleComponent';
// Email Rule (REGISTERED)
import { EmailRuleComponent } from './rules/EmailRuleComponent';
// Ends With Rule (REGISTERED)
import { EndsWithRuleComponent } from './rules/EndsWithRuleComponent';
// In Array Rule (REGISTERED)
import { InRuleComponent } from './rules/InRuleComponent';
// Integer Rule (REGISTERED)
import { IntegerRuleComponent } from './rules/IntegerRuleComponent';
// Json Rule (REGISTERED)
import { JsonRuleComponent } from './rules/JsonRuleComponent';
// Latitude Rule (REGISTERED)
import { LatitudeRuleComponent } from './rules/LatitudeRuleComponent';
// Longitude Rule (REGISTERED)
import { LongitudeRuleComponent } from './rules/LongitudeRuleComponent';
// Max File Size Rule (REGISTERED)
import { MaxFileSizeRuleComponent } from './rules/MaxFileSizeRuleComponent';
// Max Rule (REGISTERED)
import { MaxRuleComponent } from './rules/MaxRuleComponent';
// Mimes Rule (REGISTERED)
import { MimesRuleComponent } from './rules/MimesRuleComponent';
// Mime Types Rule (REGISTERED)
import { MimeTypesRuleComponent } from './rules/MimeTypesRuleComponent';
// Min File Size Rule (REGISTERED)
import { MinFileSizeRuleComponent } from './rules/MinFileSizeRuleComponent';
// Min Rule (REGISTERED)
import { MinRuleComponent } from './rules/MinRuleComponent';
// Not In Array Rule (REGISTERED)
import { NotInRuleComponent } from './rules/NotInRuleComponent';
// Numeric Rule (REGISTERED)
import { NumericRuleComponent } from './rules/NumericRuleComponent';
// Regex Rule (REGISTERED)
import { RegexRuleComponent } from './rules/RegexRuleComponent';
// Required Rule (REGISTERED)
import { RequiredRuleComponent } from './rules/RequiredRuleComponent';
// Same Rule (REGISTERED)
import { SameRuleComponent } from './rules/SameRuleComponent';
// Size Rule (REGISTERED)
import { SizeRuleComponent } from './rules/SizeRuleComponent';
// StartsWith Rule (REGISTERED)
import { StartsWithRuleComponent } from './rules/StartsWithRuleComponent';
// Unique Rule (REGISTERED)
import { UniqueRuleComponent } from './rules/UniqueRuleComponent';
// Url Rule (REGISTERED)
import { UrlRuleComponent } from './rules/UrlRuleComponent';

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
  // After or equal date rule (REGISTERED)
  'after_or_equal': AfterOrEqualRuleComponent,
  // Alpha Dash Rule (REGISTERED)
  'alpha_dash': AlphaDashRuleComponent,
  // Alpha Numeric Rule (REGISTERED)
  'alpha_num': AlphaNumRuleComponent,
  // Alpha Rule (REGISTERED)
  'alpha': AlphaRuleComponent,
  // Before Date Rule (REGISTERED)
  'before': BeforeDateRuleComponent,
  // Before or Equal Date Rule (REGISTERED)
  'before_or_equal': BeforeOrEqualRuleComponent,
  // Between Rule (REGISTERED)
  'between': BetweenRuleComponent,
  // Confirmed Rule (REGISTERED)
  'confirmed': ConfirmedRuleComponent,
  // Date Format Rule (REGISTERED)
  'date_format': DateFormatRuleComponent,
  // Date Rule (REGISTERED)
  'date': DateRuleComponent,
  // Different Rule (REGISTERED)
  'different': DifferentRuleComponent,
  // Dimensions Rule (REGISTERED)
  'dimensions': DimensionsRuleComponent,
  // Email Rule (REGISTERED)
  'email': EmailRuleComponent,
  // Ends With Rule (REGISTERED)
  'ends_with': EndsWithRuleComponent,
  // In Rule (REGISTERED)
  'in': InRuleComponent,
  // Integer Rule (REGISTERED)
  'integer': IntegerRuleComponent,
  // JSON Rule (REGISTERED)
  'json': JsonRuleComponent,
  // Latitude Rule (REGISTERED)
  'latitude': LatitudeRuleComponent,
  // Longitude Rule (REGISTERED)
  'longitude': LongitudeRuleComponent,
  // Max File Size Rule (REGISTERED)
  'max_file_size': MaxFileSizeRuleComponent,
  // Max Rule (REGISTERED)
  'max': MaxRuleComponent,
  // Mimes Rule (REGISTERED)
  'mimes': MimesRuleComponent,
  // Mime Types Rule (REGISTERED)
  'mimetypes': MimeTypesRuleComponent,
  // Min File Size Rule (REGISTERED)
  'min_file_size': MinFileSizeRuleComponent,
  // Min Rule (REGISTERED)
  'min': MinRuleComponent,
  // Not In Array Rule (REGISTERED)
  'not_in': NotInRuleComponent,
  // Numeric Rule (REGISTERED)
  'numeric': NumericRuleComponent,
  // Regex Rule (REGISTERED)
  'regex': RegexRuleComponent,
  // Required Rule (REGISTERED)
  'required': RequiredRuleComponent,
  // Same Rule (REGISTERED)
  'same': SameRuleComponent,
  // Size Rule (REGISTERED)
  'size': SizeRuleComponent,
  // StartsWith Rule (REGISTERED)
  'starts_with': StartsWithRuleComponent,
  // Unique Rule (REGISTERED)
  'unique': UniqueRuleComponent,
  // Url Rule (REGISTERED)
  'url': UrlRuleComponent,
  
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
