// src/features/formVersion/types/formVersion.ui-types.ts

/**
 * UI-specific types for Form Version Builder
 * These types support fake IDs for draft entities
 * Extended with all properties needed for full form version editing
 * UPDATED: Added UiTransitionAction type for action management
 */

// ============================================================================
// Base ID Types
// ============================================================================

/**
 * ID that can be either a real database ID (number) or a fake ID (string)
 */
export type StageIdLike = number | string;
export type SectionIdLike = number | string;
export type FieldIdLike = number | string;
export type TransitionIdLike = number | string;

// ============================================================================
// Fake ID Utility
// ============================================================================

/**
 * Re-export isFakeId from utility for convenience
 */
export { isFakeId } from '../utils/fakeId';

/**
 * Checks if an ID is a real numeric ID (not a fake ID)
 * @param id - The ID to check
 * @returns True if ID is a real number, false otherwise
 */
export function isRealId(id: string | number | undefined): id is number {
  return typeof id === 'number';
}

// ============================================================================
// Action Types (for Transitions)
// ============================================================================

/**
 * Action type identifiers
 * Must match backend action_types table
 */
export type ActionType = 'Send Email' | 'Send Notification' | 'Call Webhook';

/**
 * UI representation of a transition action
 * Stores action configuration before serialization to API format
 */
export interface UiTransitionAction {
  id?: number | null;
  /**
   * Type of action to perform
   */
  actionType: ActionType;

  /**
   * Action-specific properties (stored as object in UI, serialized to JSON string for API)
   */
  actionProps: Record<string, any>;
}

// ============================================================================
// Access Rule Type
// ============================================================================

/**
 * Access control rules for stage visibility
 */
export interface AccessRule {
  allowed_users: string | null;
  allowed_roles: string | null;
  allowed_permissions: string | null;
  allow_authenticated_users: boolean;
  email_field_id: number | null;
}

// ============================================================================
// Input Rule Type
// ============================================================================

/**
 * Input rule configuration for field validation
 * Stored in field.rules array
 * NOTE: This is the UI version without the 'id' property
 */
export interface InputRule {
  /**
   * ID of the input rule from backend
   * null/undefined means rule is disabled
   */
  input_rule_id: number | null;

  /**
   * Rule-specific properties as JSON string
   * Example: '{"min": 5, "max": 10}' for length rule
   */
  rule_props: string | null;

  /**
   * Conditional rule application as JSON string
   * Example: '{"field_id": 3, "value": "yes"}' to only apply if another field equals "yes"
   */
  rule_condition: string | null;
}

// ============================================================================
// Field Type
// ============================================================================

/**
 * UI representation of a form field
 * Supports fake IDs for draft fields not yet saved
 */
export interface UiField {
  id: FieldIdLike;
  section_id: SectionIdLike;
  field_type_id: number;
  label: string;
  placeholder: string | null;
  helper_text: string | null;
  default_value: string | null;
  visibility_condition: string | null; // Legacy - kept for backwards compatibility
  visibility_conditions: string | null; // New format
  rules: InputRule[];
}

// ============================================================================
// Section Type
// ============================================================================

/**
 * UI representation of a form section
 * Supports fake IDs for draft sections not yet saved
 */
export interface UiSection {
  id: SectionIdLike;
  stage_id: StageIdLike;
  name: string;
  description: string | null;
  order: number;
  is_repeatable: boolean;
  min_entries: number | null;
  max_entries: number | null;
  visibility_condition: string | null; // Legacy - kept for backwards compatibility
  visibility_conditions: string | null; // New format
  fields: UiField[];
}

// ============================================================================
// Stage Type
// ============================================================================

/**
 * UI representation of a workflow stage
 * Supports fake IDs for draft stages not yet saved
 */
export interface UiStage {
  id: StageIdLike;
  form_version_id?: number;
  name: string;
  description: string | null;
  order: number;
  is_initial: boolean;
  allow_rejection: boolean;
  visibility_condition: string | null;
  visibility_conditions: string | null;
  access_rule: AccessRule | null;
  sections: UiSection[];
}

// ============================================================================
// Stage Transition Type
// ============================================================================

/**
 * UI representation of a stage transition
 * Supports fake IDs for draft transitions not yet saved
 * Uses UiTransitionAction[] for action management (converted to/from API format)
 */
export interface UiStageTransition {
  id: TransitionIdLike;
  from_stage_id: StageIdLike;
  to_stage_id: StageIdLike | null;
  label: string;
  condition: string | null;
  to_complete: boolean;
  actions: UiTransitionAction[]; // Changed from string | null to array of action objects
}

// ============================================================================
// Helper Types
// ============================================================================

/**
 * Complete builder state structure
 */
export interface UiFormVersionDraft {
  stages: UiStage[];
  stageTransitions: UiStageTransition[];
}

/**
 * Type guard to check if ID is a fake ID
 */
export function isFakeIdType(id: unknown): id is string {
  return typeof id === 'string' && id.startsWith('FAKE_');
}
