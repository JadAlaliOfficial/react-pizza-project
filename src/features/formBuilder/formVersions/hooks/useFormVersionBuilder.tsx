// src/features/formVersion/hooks/useFormVersionBuilder.ts

/**
 * Core hook for Form Version Builder
 * Provides comprehensive access to builder state and all actions
 * Re-exports specialized hooks for convenience
 */

import { useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch } from '@/store';
import type { FormVersion } from '../types';
import {
  initializeFromFormVersion,
  resetBuilder,
  setDirty,
  clearSaveError,
  setValidationErrors,
  clearValidationErrors,
  selectBuilderStages,
  selectBuilderStageTransitions,
  selectSelectedStageId,
  selectSelectedSectionId,
  selectSelectedFieldId,
  selectSelectedStage,
  selectSelectedSection,
  selectBuilderDirty,
  selectBuilderSaving,
  selectBuilderLastSavedAt,
  selectBuilderSaveError,
  selectBuilderFormVersionId,
  selectBuilderValidationErrors,
  selectHasValidationErrors,
} from '../store/formVersionBuilderSlice';
import { useStageActions } from './useFormVersionBuilder.stages';
import { useSectionActions } from './useFormVersionBuilder.sections';
import { useSelectionActions } from './useFormVersionBuilder.selections';

// Re-export specialized hooks
export { useBuilderSave } from './useFormVersionBuilder.save';
export { useBuilderValidation } from './useFormVersionBuilder.validation';

// ============================================================================
// Main Builder Hook
// ============================================================================

/**
 * Main hook for accessing builder state and actions
 * Provides comprehensive access to draft data, flags, and actions
 * 
 * @returns Builder state and action dispatchers
 * 
 * @example
 * const builder = useFormVersionBuilder();
 * 
 * // Read state
 * console.log(builder.stages, builder.dirty);
 * 
 * // Dispatch actions
 * builder.initializeFrom(formVersion);
 * builder.addSection(stageId, section);
 */
export const useFormVersionBuilder = () => {
  const dispatch = useDispatch<AppDispatch>();

  // Select state
  const stages = useSelector(selectBuilderStages);
  const stageTransitions = useSelector(selectBuilderStageTransitions);
  const selectedStageId = useSelector(selectSelectedStageId);
  const selectedSectionId = useSelector(selectSelectedSectionId);
  const selectedFieldId = useSelector(selectSelectedFieldId);
  const selectedStage = useSelector(selectSelectedStage);
  const selectedSection = useSelector(selectSelectedSection);
  const dirty = useSelector(selectBuilderDirty);
  const saving = useSelector(selectBuilderSaving);
  const lastSavedAt = useSelector(selectBuilderLastSavedAt);
  const saveError = useSelector(selectBuilderSaveError);
  const formVersionId = useSelector(selectBuilderFormVersionId);
  const validationErrors = useSelector(selectBuilderValidationErrors);
  const hasValidationErrors = useSelector(selectHasValidationErrors);

  // Get actions from specialized hooks
  const stageActions = useStageActions();
  const sectionActions = useSectionActions();
  const selectionActions = useSelectionActions();

  // Core actions
  const coreActions = useMemo(
    () => ({
      // Initialization
      initializeFrom: (formVersion: FormVersion) => {
        console.info('[useFormVersionBuilder] Initializing from FormVersion');
        dispatch(initializeFromFormVersion(formVersion));
      },

      reset: () => {
        console.info('[useFormVersionBuilder] Resetting builder');
        dispatch(resetBuilder());
      },

      // Utility actions
      setDirty: (dirty: boolean) => {
        console.debug('[useFormVersionBuilder] Setting dirty flag', dirty);
        dispatch(setDirty(dirty));
      },

      clearSaveError: () => {
        console.debug('[useFormVersionBuilder] Clearing save error');
        dispatch(clearSaveError());
      },

      setValidationErrors: (errors: Record<string, string>) => {
        console.debug('[useFormVersionBuilder] Setting validation errors');
        dispatch(setValidationErrors(errors));
      },

      clearValidationErrors: () => {
        console.debug('[useFormVersionBuilder] Clearing validation errors');
        dispatch(clearValidationErrors());
      },
    }),
    [dispatch]
  );

  return {
    // State
    stages,
    stageTransitions,
    selectedStageId,
    selectedSectionId,
    selectedFieldId,
    selectedStage,
    selectedSection,
    dirty,
    saving,
    lastSavedAt,
    saveError,
    formVersionId,
    validationErrors,
    hasValidationErrors,

    // Actions (combined from all modules)
    ...coreActions,
    ...stageActions,
    ...sectionActions,
    ...selectionActions,
  };
};
