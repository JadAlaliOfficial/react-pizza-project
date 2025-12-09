// src/features/formVersion/types/formVersion.ui-types.ts

/**
 * UI-layer types for Form Version Builder
 * Extends domain types to support fake IDs for entities not yet persisted to the backend
 * These types are used exclusively in the UI state and mapping layer
 */

import type {
  Stage,
  Section,
  Field,
  StageTransition,
  AccessRule,
  InputRule,
  TransitionAction,
  ActionProps,
} from './index';

// ============================================================================
// Fake ID Types
// ============================================================================

/**
 * Fake ID format for UI-only entities
 * Format: "FAKE_<random_number>"
 * Example: "FAKE_123456789"
 */
export type FakeId = `FAKE_${number}`;

/**
 * Union type for stage IDs: real numeric ID or fake string ID
 */
export type StageIdLike = number | FakeId;

/**
 * Union type for section IDs: real numeric ID or fake string ID
 */
export type SectionIdLike = number | FakeId;

/**
 * Union type for field IDs: real numeric ID or fake string ID
 */
export type FieldIdLike = number | FakeId;

// ============================================================================
// UI Entity Types
// ============================================================================

/**
 * UI version of Field with fake ID support
 * Used for fields that haven't been saved to the backend yet
 */
export interface UiField extends Omit<Field, 'id' | 'section_id'> {
  id?: FieldIdLike;
  section_id?: SectionIdLike;
  field_type_id: number;
  label: string;
  placeholder: string | null;
  helper_text: string | null;
  default_value: string | null;
  visibility_condition: string | null;
  visibility_conditions?: string | null;
  rules: InputRule[];
}

/**
 * UI version of Section with fake ID support
 * Used for sections that haven't been saved to the backend yet
 */
export interface UiSection extends Omit<Section, 'id' | 'stage_id' | 'fields'> {
  id?: SectionIdLike;
  stage_id?: StageIdLike;
  name: string;
  order?: number;
  visibility_condition?: string | null;
  visibility_conditions?: string | null;
  fields: UiField[];
}

/**
 * UI version of Stage with fake ID support
 * Used for stages that haven't been saved to the backend yet
 */
export interface UiStage extends Omit<Stage, 'id' | 'form_version_id' | 'sections'> {
  id?: StageIdLike;
  form_version_id?: number;
  name: string;
  is_initial: boolean;
  visibility_condition: string | null;
  sections: UiSection[];
  access_rule: AccessRule | null;
}

/**
 * UI version of StageTransition with fake ID support
 * Used for transitions referencing stages that may have fake IDs
 */
export interface UiStageTransition extends Omit<StageTransition, 'id' | 'from_stage_id' | 'to_stage_id'> {
  id?: number | FakeId;
  form_version_id?: number;
  from_stage_id: StageIdLike;
  to_stage_id: StageIdLike;
  to_complete: boolean;
  label: string;
  condition: string | null;
  actions: TransitionAction<ActionProps>[];
}

// ============================================================================
// Type Guards
// ============================================================================

/**
 * Type guard to check if an ID is a fake ID
 * @param id - ID to check
 * @returns True if ID is a fake ID string
 */
export function isFakeId(id: StageIdLike | SectionIdLike | FieldIdLike | undefined): id is FakeId {
  return typeof id === 'string' && id.startsWith('FAKE_');
}

/**
 * Type guard to check if an ID is a real numeric ID
 * @param id - ID to check
 * @returns True if ID is a real number
 */
export function isRealId(id: StageIdLike | SectionIdLike | FieldIdLike | undefined): id is number {
  return typeof id === 'number';
}
