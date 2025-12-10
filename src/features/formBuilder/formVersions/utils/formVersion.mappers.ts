// src/features/formVersion/utils/formVersion.mappers.ts

/**
 * Mappers for converting between API domain types and UI types
 * Handles fake ID logic and ensures API contract compliance
 * UPDATED: Added action serialization with ACTION_TYPE_TO_ID mapping
 */

import type {
  FormVersion,
  Stage,
  Section,
  Field,
  StageTransition,
  StageTransitionAPI,
  TransitionActionAPI,
  UpdateFormVersionRequest,
  InputRule as ApiInputRule,
  ActionType,
} from '../types';

import type {
  UiStage,
  UiSection,
  UiField,
  UiStageTransition,
  UiTransitionAction,
  InputRule as UiInputRule,
} from '../types/formVersion.ui-types';

import { isRealId } from '../types/formVersion.ui-types';
import { generateFakeId } from './fakeId';

// ============================================================================
// Action ID Mapping
// ============================================================================

/**
 * Maps ActionType (UI string) to action_id (backend numeric ID)
 * MUST match the backend actions table IDs
 * 
 * Backend mapping:
 * - SendEmailActionConfig → action_id = 1
 * - SendNotificationActionConfig → action_id = 2
 * - CallWebhookActionConfig → action_id = 3
 */
const ACTION_TYPE_TO_ID: Record<ActionType, number> = {
  'Send Email': 1,
  'Send Notification': 2,
  'Call Webhook': 3,
};

/**
 * Reverse mapping: action_id → ActionType
 * Used when deserializing from API to UI
 */
const ACTION_ID_TO_TYPE: Record<number, ActionType> = {
  1: 'Send Email',
  2: 'Send Notification',
  3: 'Call Webhook',
};

/**
 * Converts ActionType to action_id
 * @throws Error if actionType is not recognized
 */
function getActionId(actionType: ActionType): number {
  const id = ACTION_TYPE_TO_ID[actionType];
  if (!id) {
    throw new Error(`[FormVersionMappers] Unknown action type: ${actionType}`);
  }
  return id;
}

/**
 * Converts action_id to ActionType
 * @throws Error if action_id is not recognized
 */
function getActionType(actionId: number): ActionType {
  const type = ACTION_ID_TO_TYPE[actionId];
  if (!type) {
    throw new Error(`[FormVersionMappers] Unknown action ID: ${actionId}`);
  }
  return type;
}

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
    visibility_conditions:
      field.visibility_conditions ?? field.visibility_condition ?? null,
    rules: (field.rules || []).map(
      (rule): UiInputRule => ({
        input_rule_id: rule.input_rule_id,
        rule_props: rule.rule_props ?? null,
        rule_condition: rule.rule_condition ?? null,
      }),
    ),
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
    visibility_conditions:
      section.visibility_conditions ?? section.visibility_condition ?? null,
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
    visibility_conditions: stage.visibility_condition ?? null,
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

/**
 * Maps API StageTransition to UiStageTransition
 * Deserializes actions from API format (action_id + JSON string) to UI format
 */
function mapStageTransitionToUi(transition: StageTransition): UiStageTransition {
  console.debug('[MapperTransitionToUi] Mapping transition:', transition.id);

  // Deserialize actions from API format to UI format
  const actions: UiTransitionAction[] = (transition.actions || []).map((apiAction: any) => {
    // If action already has actionType (from GET response), use it directly
    if ('actionType' in apiAction && apiAction.actionType) {
      return {
        id: apiAction.id ?? null,
        actionType: apiAction.actionType,
        actionProps: apiAction.actionProps as Record<string, any>,
      };
    }
    
    // Otherwise deserialize from action_id (from API format)
    const actionType = getActionType(apiAction.action_id!);
    const actionProps = typeof apiAction.action_props === 'string'
      ? JSON.parse(apiAction.action_props)
      : apiAction.action_props;

    return {
      id: apiAction.id ?? null,
      actionType,
      actionProps: actionProps as Record<string, any>,
    };
  });

  return {
    id: transition.id ?? generateFakeId(),
    from_stage_id: transition.from_stage_id,
    to_stage_id: (transition as any).to_stage_id ?? null,
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
    id: field.id as number | string,
    section_id: field.section_id as number | string,
    field_type_id: field.field_type_id,
    label: field.label,
    placeholder: field.placeholder,
    helper_text: field.helper_text,
    default_value: field.default_value,
    visibility_conditions: field.visibility_conditions,
    rules: field.rules
      .filter((rule) => rule.input_rule_id !== null)
      .map(
        (rule): ApiInputRule => ({
          id: null,
          input_rule_id: rule.input_rule_id as number,
          rule_props: rule.rule_props ?? null,
          rule_condition: rule.rule_condition,
        }),
      ),
  };
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
    visibility_conditions: section.visibility_conditions ?? null,
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
    visibility_condition:
      stage.visibility_conditions ?? stage.visibility_condition ?? null,
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

/**
 * Maps UiStageTransition to API StageTransitionAPI format
 * UPDATED: 
 * - Keeps fake IDs as-is (doesn't convert to null or filter out)
 * - Converts actions to API format with action_id (number) and action_props (JSON string)
 */
function mapStageTransitionToApi(
  transition: UiStageTransition,
): StageTransitionAPI {
  console.debug('[MapperTransitionToApi] Mapping transition:', transition.id);

  // Serialize actions to API format
  const actions: TransitionActionAPI[] = transition.actions.map((action) => {
    const actionId = getActionId(action.actionType);
    console.debug(
      `[MapperTransitionToApi] Mapping action "${action.actionType}" to action_id ${actionId}`
    );

    return {
      id: typeof action.id === 'number' ? action.id : null,
      action_id: actionId,
      action_props: JSON.stringify(action.actionProps),
    };
  });

  // Build API transition - keep stage IDs as they are (even if fake)
  const apiTransition: StageTransitionAPI = {
    id: transition.id as number | string,
    from_stage_id: transition.from_stage_id as number | string,
    to_stage_id:
      transition.to_stage_id === null
        ? null
        : (transition.to_stage_id as number | string),
    to_complete:
      transition.to_stage_id === null ? true : transition.to_complete,
    label: transition.label,
    condition: transition.condition ?? null,
    actions,
  };

  console.debug(
    `[MapperTransitionToApi] Mapped transition ${transition.id}:`,
    `from_stage_id=${apiTransition.from_stage_id}, ` +
    `to_stage_id=${apiTransition.to_stage_id}, ` +
    `${apiTransition.actions.length} actions`
  );

  return apiTransition;
}

/**
 * Builds UpdateFormVersionRequest from UI state
 * Strips fake IDs from stages but keeps them in transitions
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

    // Map transitions to API format (NO FILTERING - keep all transitions)
    const stageTransitions = input.stageTransitions.map((transition) => {
      try {
        return mapStageTransitionToApi(transition);
      } catch (error) {
        console.error(
          '[FormVersionMappers] Error mapping transition:',
          transition.label,
          error,
        );
        throw error;
      }
    });

    console.info(
      `[FormVersionMappers] Built request with ${stages.length} stages ` +
        `and ${stageTransitions.length} transitions`,
    );

    return {
      stages,
      stage_transitions: stageTransitions as any, // Cast needed due to type mismatch
    };
  } catch (error) {
    console.error('[FormVersionMappers] Error building update request:', error);
    throw error;
  }
}
