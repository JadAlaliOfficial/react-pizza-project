// src/features/forms/types.ts

import type { JsonValue } from '@/features/formBuilder/endUserForms/types/submitInitialForm.types';

/**
 * Visibility operators supported by backend.
 * (Includes optional legacy aliases for safety.)
 */
export type VisibilityOperator =
  // Backend canonical
  | 'filled'
  | 'empty'
  | 'equals'
  | 'not_equals'
  | 'greater_than'
  | 'less_than'
  | 'greater_or_equal'
  | 'less_or_equal'
  | 'contains'
  | 'not_contains'
  | 'starts_with'
  | 'ends_with'
  | 'in'
  | 'not_in'
  // Optional legacy aliases (if older data exists)
  | 'not_empty'
  | 'greater_than_or_equal'
  | 'less_than_or_equal'
  // Optional symbol aliases (if you ever support them)
  | '=='
  | '==='
  | '!='
  | '!=='
  | '>'
  | '>='
  | '<'
  | '<=';

/**
 * Base visibility condition for a single field check
 */
export interface SimpleVisibilityCondition {
  field_id: number;
  operator: VisibilityOperator;
  value: JsonValue;
}

/**
 * Complex visibility condition with logical operators (and/or)
 */
export interface ComplexVisibilityCondition {
  logic: 'and' | 'or';
  conditions: SimpleVisibilityCondition[];
}

/**
 * Visibility condition wrapper
 * Can contain either a simple condition or a complex one with logic
 */
export interface VisibilityConditionWrapper {
  show_when: SimpleVisibilityCondition | ComplexVisibilityCondition | null;
}

/**
 * Field visibility condition (nullable)
 */
export type FieldVisibilityCondition = VisibilityConditionWrapper | null;

/**
 * Rule properties - varies by rule type
 * Using index signature for flexibility while maintaining type safety
 */
export type RuleProps =
  | { value?: number | string }
  | { min?: number; max?: number }
  | { date?: string }
  | { maxsize?: number }
  | { minsize?: number }
  | { types?: string[] }
  | { values?: string[] }
  | { comparevalue?: string }
  | { pattern?: string }
  | {
      width?: number;
      height?: number;
      minwidth?: number;
      maxwidth?: number;
      minheight?: number;
      maxheight?: number;
    }
  | null;

/**
 * Validation rule for a field
 */
export interface FieldRule {
  rule_id: number;
  input_rule_id: number;
  rule_name: string;
  rule_description: string;
  rule_props: RuleProps;
  rule_condition: any | null;
}

/**
 * Address value structure
 */
export interface AddressValue {
  street: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
}

/**
 * Field default value - highly variable based on field type
 */
export type FieldDefaultValue =
  | string
  | number
  | boolean
  | AddressValue
  | string[]
  | null;

/**
 * Form field with all properties
 */
export interface FormField {
  field_id: number;
  field_type_id: number;
  field_type: string;
  label: string;
  placeholder: string | null;
  helper_text: string | null;
  default_value: FieldDefaultValue;
  current_value: FieldDefaultValue;
  visibility_condition: FieldVisibilityCondition;
  rules: FieldRule[];
}

/**
 * Section containing multiple fields
 */
export interface FormSection {
  section_id: number;
  section_name: string;
  section_order: number;
  visibility_condition: FieldVisibilityCondition;
  fields: FormField[];
}

/**
 * Access control rules for a stage
 */
export interface AccessRule {
  allow_authenticated_users: boolean;
  allowed_users: string[] | null;
  allowed_roles: string[] | null;
  allowed_permissions: string[] | null;
  email_field_id: number | null;
}

/**
 * Transition action
 */
export interface TransitionAction {
  action_id: number;
  action_name: string;
}

/**
 * Transition condition (same shape as visibility wrapper)
 */
export type TransitionCondition = VisibilityConditionWrapper;

/**
 * Available transition between stages
 */
export interface FormTransition {
  transition_id: number;
  label: string;
  to_stage_id: number | null;
  to_stage_name: string | null;
  to_complete: boolean;
  condition: TransitionCondition | null;
  actions: TransitionAction[];
}

/**
 * Form stage containing sections
 */
export interface FormStage {
  stage_id: number;
  stage_name: string;
  is_initial: boolean;
  visibility_condition: FieldVisibilityCondition;
  access_rule: AccessRule;
  sections: FormSection[];
}

/**
 * Complete form structure data
 */
export interface FormStructureData {
  form_version_id: number;
  form_name: string;
  version_number: number;
  stage: FormStage;
  available_transitions: FormTransition[];
}

/**
 * API response wrapper
 */
export interface FormStructureResponse {
  success: boolean;
  data: FormStructureData;
}

/**
 * Custom error for authentication issues
 */
export class AuthMissingError extends Error {
  constructor(message: string = 'Authentication token is missing') {
    super(message);
    this.name = 'AuthMissingError';
  }
}

/**
 * Standardized API error
 */
export interface ApiError {
  status: number;
  message: string;
  data?: any;
}
