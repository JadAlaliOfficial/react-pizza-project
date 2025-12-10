// src/features/formVersion/utils/formVersion.mappers.ts

/**
 * Mappers for converting between API domain types and UI types
 * Handles fake ID logic and ensures API contract compliance
 * UPDATED: Added action serialization/deserialization with actionIdMap
 */

import type {
  FormVersion,
  Stage,
  Section,
  Field,
  StageTransition,
  UpdateFormVersionRequest,
  InputRule as ApiInputRule,
} from '../types';
import type {
  UiStage,
  UiSection,
  UiField,
  UiStageTransition,
  UiTransitionAction,
  InputRule as UiInputRule,
} from '../types/formVersion.ui-types';
import { isFakeId, isRealId } from '../types/formVersion.ui-types';
import { generateFakeId } from './fakeId';

// ============================================================================
// Note on Actions
// ============================================================================
// Actions in API types (`StageTransition.actions`) use `TransitionAction` with
// `actionType` and structured `actionProps`. UI uses `UiTransitionAction` with
// the same shape minus backend-specific IDs. No serialization to JSON strings
// is needed when building `UpdateFormVersionRequest`.

// ============================================================================
// API to UI Mappers
// ============================================================================

/**
 * Maps API Field to UiField
 * Preserves all field properties and converts IDs to UI format
 * Ensures every UI field has an ID (generates fake ID if missing)
 */
function mapFieldToUi(field: Field): UiField {
  return {
    id: field.id ?? generateFakeId(),
    section_id: field.section_id ?? generateFakeId(),
    field_type_id: field.field_type_id,
    label: field.label,
    placeholder: field.placeholder ?? null,
    helper_text: field.helper_text ?? null,
    default_value: field.default_value ?? null,
    visibility_condition: field.visibility_condition ?? null,
    visibility_conditions: field.visibility_conditions ?? field.visibility_condition ?? null,
    rules: (field.rules || []).map((rule): UiInputRule => ({
      input_rule_id: rule.input_rule_id,
      rule_props: rule.rule_props ?? null,
      rule_condition: rule.rule_condition ?? null,
    })),
  };
}

/**
 * Maps API Section to UiSection
 * Converts nested fields to UI format
 * Ensures every UI section has an ID (generates fake ID if missing)
 */
function mapSectionToUi(section: Section): UiSection {
  return {
    id: section.id ?? generateFakeId(),
    stage_id: section.stage_id ?? generateFakeId(),
    name: section.name,
    description: null,
    order: section.order ?? 0,
    is_repeatable: false,
    min_entries: null,
    max_entries: null,
    visibility_condition: section.visibility_condition ?? null,
    visibility_conditions: section.visibility_conditions ?? section.visibility_condition ?? null,
    fields: (section.fields || []).map(mapFieldToUi),
  };
}

/**
 * Maps API Stage to UiStage
 * Converts nested sections to UI format
 * Ensures every UI stage has an ID (generates fake ID if missing)
 */
function mapStageToUi(stage: Stage): UiStage {
  return {
    id: stage.id ?? generateFakeId(),
    form_version_id: stage.form_version_id,
    name: stage.name,
    description: null,
    order: 0,
    is_initial: stage.is_initial,
    allow_rejection: false,
    visibility_condition: stage.visibility_condition ?? null,
    access_rule: stage.access_rule ?? {
      allowed_users: null,
      allowed_roles: null,
      allowed_permissions: null,
      allow_authenticated_users: false,
      email_field_id: null,
    },
    sections: (stage.sections || []).map(mapSectionToUi),
  };
}

// No action deserialization is required; API already provides structured actions.

/**
 * Maps API StageTransition to UiStageTransition
 * Preserves transition structure with stage ID references
 * Deserializes actions from API format to UI format
 */
function mapStageTransitionToUi(transition: StageTransition): UiStageTransition {
  console.debug('[MapperTransitionToUi] Mapping transition:', transition.id);

  const actions: UiTransitionAction[] = (transition.actions || []).map((a) => ({
    actionType: a.actionType,
    actionProps: a.actionProps as Record<string, any>,
  }));

  return {
    id: transition.id ?? generateFakeId(),
    from_stage_id: transition.from_stage_id,
    to_stage_id: transition.to_stage_id,
    label: transition.label,
    condition: transition.condition ?? null,
    to_complete: transition.to_complete,
    actions,
  };
}

/**
 * Maps FormVersion from API to UI types
 * Converts stages and transitions to UI format for editing
 *
 * @param formVersion - API FormVersion object (can be null)
 * @returns Object containing UI stages and transitions
 */
export function mapFormVersionToUi(formVersion: FormVersion | null): {
  stages: UiStage[];
  stageTransitions: UiStageTransition[];
} {
  console.info('[FormVersionMappers] Mapping FormVersion to UI format');

  if (!formVersion) {
    console.debug(
      '[FormVersionMappers] FormVersion is null, returning empty arrays',
    );
    return {
      stages: [],
      stageTransitions: [],
    };
  }

  const stages = (formVersion.stages || []).map(mapStageToUi);
  const stageTransitions = (formVersion.stage_transitions || []).map(
    mapStageTransitionToUi,
  );

  console.info(
    `[FormVersionMappers] Mapped ${stages.length} stages and ${stageTransitions.length} transitions`,
  );

  return {
    stages,
    stageTransitions,
  };
}

// ============================================================================
// UI to API Mappers
// ============================================================================

/**
 * Maps UiField to API Field format
 * Strips fake IDs and ensures API compliance
 */
function mapFieldToApi(field: UiField): Field {
  const apiField: Field = {
    field_type_id: field.field_type_id,
    label: field.label,
    placeholder: field.placeholder,
    helper_text: field.helper_text,
    default_value: field.default_value,
    visibility_condition: field.visibility_condition,
    visibility_conditions: field.visibility_conditions ?? field.visibility_condition,
    rules: field.rules
      .filter((rule) => rule.input_rule_id !== null)
      .map((rule): ApiInputRule => ({
        id: rule.input_rule_id as number,
        input_rule_id: rule.input_rule_id as number,
        rule_props: rule.rule_props,
        rule_condition: rule.rule_condition,
      })),
  };

  // Only include ID if it's a real numeric ID (skip fake IDs)
  if (isRealId(field.id)) {
    apiField.id = field.id;
  }

  // Only include section_id if it's a real numeric ID (skip fake IDs)
  if (isRealId(field.section_id)) {
    apiField.section_id = field.section_id;
  }

  return apiField;
}

/**
 * Maps UiSection to API Section format
 * Strips fake IDs and converts nested fields
 */
function mapSectionToApi(section: UiSection): Section {
  const apiSection: Section = {
    name: section.name,
    order: section.order,
    visibility_condition: section.visibility_condition ?? null,
    visibility_conditions: section.visibility_conditions ?? section.visibility_condition ?? null,
    fields: section.fields.map(mapFieldToApi),
  };

  // Only include ID if it's a real numeric ID (skip fake IDs)
  if (isRealId(section.id)) {
    apiSection.id = section.id;
  }

  // Only include stage_id if it's a real numeric ID (skip fake IDs)
  if (isRealId(section.stage_id)) {
    apiSection.stage_id = section.stage_id;
  }

  return apiSection;
}

/**
 * Maps UiStage to API Stage format
 * Strips fake IDs and converts nested sections
 */
function mapStageToApi(stage: UiStage): Stage {
  const apiStage: Stage = {
    name: stage.name,
    is_initial: stage.is_initial,
    visibility_condition: stage.visibility_condition ?? null,
    sections: stage.sections.map(mapSectionToApi),
    access_rule: stage.access_rule ?? {
      allowed_users: null,
      allowed_roles: null,
      allowed_permissions: null,
      allow_authenticated_users: false,
      email_field_id: null,
    },
  };

  // Only include ID if it's a real numeric ID (skip fake IDs)
  if (isRealId(stage.id)) {
    apiStage.id = stage.id;
  }

  // Only include form_version_id if it's defined
  if (stage.form_version_id !== undefined) {
    apiStage.form_version_id = stage.form_version_id;
  }

  return apiStage;
}

// No action serialization to JSON is required for update requests.

/**
 * Maps UiStageTransition to API StageTransition format
 * Validates that from_stage_id and to_stage_id are real IDs
 * Serializes actions to API format
 * Logs warnings for transitions with fake IDs (should not happen in production)
 */
function mapStageTransitionToApi(
  transition: UiStageTransition,
): StageTransition | null {
  console.debug('[MapperTransitionToApi] Mapping transition:', transition.id);

  if (isFakeId(transition.from_stage_id)) {
    console.warn(
      `[MapperTransitionToApi] Skipping transition with fake from_stage_id: ${transition.from_stage_id}`,
    );
    return null;
  }

  if (isFakeId(transition.to_stage_id)) {
    console.warn(
      `[MapperTransitionToApi] Skipping transition with fake to_stage_id: ${transition.to_stage_id}`,
    );
    return null;
  }

  const apiTransition: StageTransition = {
    from_stage_id: transition.from_stage_id as number,
    to_stage_id: transition.to_stage_id as number,
    to_complete: transition.to_complete,
    label: transition.label,
    condition: transition.condition ?? null,
    actions: transition.actions.map((a) => ({
      actionType: a.actionType,
      actionProps: a.actionProps,
    })),
  };

  if (isRealId(transition.id)) {
    apiTransition.id = transition.id;
  }

  return apiTransition;
}

/**
 * Builds UpdateFormVersionRequest from UI state
 * Strips fake IDs and ensures API compliance
 *
 * @param input - UI stages and transitions
 * @returns UpdateFormVersionRequest ready for API
 */
export function buildUpdateFormVersionRequest(input: {
  stages: UiStage[];
  stageTransitions: UiStageTransition[];
}): UpdateFormVersionRequest {
  console.info(
    `[FormVersionMappers] Building update request with ${input.stages.length} stages ` +
      `and ${input.stageTransitions.length} transitions`,
  );

  try {
    // Map stages to API format
    const stages = input.stages.map((stage) => {
      try {
        return mapStageToApi(stage);
      } catch (error) {
        console.error(
          '[FormVersionMappers] Error mapping stage:',
          stage.name,
          error,
        );
        throw error;
      }
    });

    // Map transitions to API format, filtering out null results
    const stageTransitions = input.stageTransitions
      .map((transition) => {
        try {
          return mapStageTransitionToApi(transition);
        } catch (error) {
          console.error(
            '[FormVersionMappers] Error mapping transition:',
            transition.label,
            error,
          );
          return null;
        }
      })
      .filter((t): t is StageTransition => t !== null);

    console.info(
      `[FormVersionMappers] Built request with ${stages.length} stages ` +
        `and ${stageTransitions.length} transitions (filtered from ${input.stageTransitions.length})`,
    );

    return {
      stages,
      stage_transitions: stageTransitions,
    };
  } catch (error) {
    console.error('[FormVersionMappers] Error building update request:', error);
    throw error;
  }
}
