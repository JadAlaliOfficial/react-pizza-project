// src/features/formVersion/hooks/useFormVersionBuilder.ts

/**
 * Main Form Version Builder Hook
 * Provides unified access to all builder functionality
 * UPDATED: Added transition actions export
 */

import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '@/store';
import type {
  UiStage,
  UiStageTransition,
  StageIdLike,
  SectionIdLike,
  FieldIdLike,
} from '../types/formVersion.ui-types';
import { useStageActions } from './useFormVersionBuilder.stages';
import { useSectionActions } from './useFormVersionBuilder.sections';
import { useFieldActions } from './useFormVersionBuilder.fields';
import { useTransitionActions } from './useFormVersionBuilder.transitions';
import type { FormVersion } from '../types';
import { mapFormVersionToUi } from '../utils/formVersion.mappers';
import {
  initializeBuilder,
  resetBuilder,
  setSelectedStageId as setSelectedStageIdAction,
  setSelectedSectionId as setSelectedSectionIdAction,
  setSelectedFieldId as setSelectedFieldIdAction,
  addSection,
  updateSection,
  removeSection,
  reorderSections,
  addField,
  updateField,
  removeField,
  reorderFields,
} from '../store/formVersionBuilderSlice';

// ============================================================================
// Selectors
// ============================================================================

/**
 * Selects the entire builder state
 */
const selectBuilderState = (state: RootState) => state.formVersionBuilder;

/**
 * Selects all stages from builder
 */
const selectStages = (state: RootState): UiStage[] =>
  state.formVersionBuilder.stages;

/**
 * Selects all transitions from builder
 */
const selectTransitions = (state: RootState): UiStageTransition[] =>
  state.formVersionBuilder.stageTransitions;

/**
 * Selects the dirty flag
 */
const selectDirty = (state: RootState): boolean =>
  state.formVersionBuilder.dirty;

/**
 * Selects last saved timestamp
 */
const selectLastSavedAt = (state: RootState): number | null =>
  state.formVersionBuilder.lastSavedAt;

/**
 * Selects selected stage ID
 */
const selectSelectedStageId = (state: RootState): StageIdLike | null =>
  state.formVersionBuilder.selectedStageId;

/**
 * Selects selected section ID
 */
const selectSelectedSectionId = (state: RootState): SectionIdLike | null =>
  state.formVersionBuilder.selectedSectionId;

/**
 * Selects selected field ID
 */
const selectSelectedFieldId = (state: RootState): FieldIdLike | null =>
  state.formVersionBuilder.selectedFieldId;

// ============================================================================
// Main Hook
// ============================================================================

/**
 * Main hook for Form Version Builder
 * Provides unified access to all builder state and actions
 * 
 * @returns Builder state and action dispatchers
 * 
 * @example
 * const builder = useFormVersionBuilder();
 * console.log(builder.stages);
 * console.log(builder.transitions);
 * builder.stageActions.addStage('New Stage');
 * builder.transitionActions.addTransition(stageId1, stageId2);
 */
export const useFormVersionBuilder = () => {
  const dispatch = useDispatch<AppDispatch>();
  // State
  const builderState = useSelector(selectBuilderState);
  const stages = useSelector(selectStages);
  const transitions = useSelector(selectTransitions);
  const dirty = useSelector(selectDirty);
  const lastSavedAt = useSelector(selectLastSavedAt);
  const selectedStageId = useSelector(selectSelectedStageId);
  const selectedSectionId = useSelector(selectSelectedSectionId);
  const selectedFieldId = useSelector(selectSelectedFieldId);

  // Actions
  const stageActions = useStageActions();
  const sectionActions = useSectionActions();
  const fieldActions = useFieldActions();
  const transitionActions = useTransitionActions();

  return {
    // State
    formVersionId: builderState.formVersionId,
    stages,
    transitions,
    dirty,
    lastSavedAt,
    selectedStageId,
    selectedSectionId,
    selectedFieldId,

    // Actions (grouped by entity type)
    stageActions,
    sectionActions,
    fieldActions,
    transitionActions,

    initializeFrom: (formVersion: FormVersion) => {
      const { stages, stageTransitions } = mapFormVersionToUi(formVersion);
      dispatch(
        initializeBuilder({
          formVersionId: formVersion.id,
          stages,
          stageTransitions,
        })
      );
    },

    reset: () => {
      dispatch(resetBuilder());
    },

    setSelectedStageId: (id: StageIdLike | null) => {
      dispatch(setSelectedStageIdAction(id));
    },

    setSelectedSectionId: (id: SectionIdLike | null) => {
      dispatch(setSelectedSectionIdAction(id));
    },

    setSelectedFieldId: (id: FieldIdLike | null) => {
      dispatch(setSelectedFieldIdAction(id));
    },

    addSection: (stageId: StageIdLike, section: UiStage['sections'][number]) => {
      dispatch(addSection({ stageId, section }));
    },

    updateSection: (stageId: StageIdLike, section: UiStage['sections'][number]) => {
      dispatch(updateSection({ stageId, section }));
    },

    removeSection: (stageId: StageIdLike, sectionId: SectionIdLike) => {
      dispatch(removeSection({ stageId, sectionId }));
    },

    reorderSections: (stageId: StageIdLike, sections: UiStage['sections']) => {
      dispatch(reorderSections({ stageId, sections }));
    },

    addField: (
      stageId: StageIdLike,
      sectionId: SectionIdLike,
      fieldTypeId: number,
      defaults?: Partial<import('../types/formVersion.ui-types').UiField>
    ) => {
      dispatch(addField({ stageId, sectionId, fieldTypeId, defaults }));
    },

    updateField: (
      stageId: StageIdLike,
      sectionId: SectionIdLike,
      fieldId: FieldIdLike,
      changes: Partial<import('../types/formVersion.ui-types').UiField>
    ) => {
      dispatch(updateField({ stageId, sectionId, fieldId, changes }));
    },

    removeField: (
      stageId: StageIdLike,
      sectionId: SectionIdLike,
      fieldId: FieldIdLike
    ) => {
      dispatch(removeField({ stageId, sectionId, fieldId }));
    },

    reorderFields: (
      stageId: StageIdLike,
      sectionId: SectionIdLike,
      fields: import('../types/formVersion.ui-types').UiField[]
    ) => {
      dispatch(reorderFields({ stageId, sectionId, fields }));
    },

    // Convenience getters
    selectedStage: stages.find((s) => s.id === selectedStageId),
    selectedSection: stages
      .flatMap((s) => s.sections)
      .find((sec) => sec.id === selectedSectionId),
    selectedField: stages
      .flatMap((s) => s.sections)
      .flatMap((sec) => sec.fields)
      .find((f) => f.id === selectedFieldId),
  };
};

// Re-export specific hooks for granular usage
export { useStageActions } from './useFormVersionBuilder.stages';
export { useSectionActions } from './useFormVersionBuilder.sections';
export { useFieldActions } from './useFormVersionBuilder.fields';
export {
  useTransitionActions,
  useTransitionSelection,
  useTransitionById,
} from './useFormVersionBuilder.transitions';
