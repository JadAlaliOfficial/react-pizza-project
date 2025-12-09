// src/features/formVersion/hooks/useFormVersionBuilder.ts

/**
 * Custom hooks for Form Version Builder slice
 * Provides ergonomic interface for components to interact with builder state
 */

import { useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch } from '@/store';
import type { FormVersion } from '../types';
import type { UiStage, UiStageTransition, StageIdLike, SectionIdLike, FieldIdLike } from '../types/formVersion.ui-types';
import {
  initializeFromFormVersion,
  resetBuilder,
  setStages,
  updateStage,
  addStage,
  removeStage,
  setStageTransitions,
  addStageTransition,
  removeStageTransition,
  setSelectedStageId,
  setSelectedSectionId,
  setSelectedFieldId,
  setDirty,
  clearSaveError,
  setValidationErrors,
  clearValidationErrors,
  saveFormVersionDraft,
  selectBuilderStages,
  selectBuilderStageTransitions,
  selectBuilderStageById,
  selectSelectedStageId,
  selectSelectedSectionId,
  selectSelectedFieldId,
  selectSelectedStage,
  selectBuilderDirty,
  selectBuilderSaving,
  selectBuilderLastSavedAt,
  selectBuilderSaveError,
  selectBuilderFormVersionId,
  selectBuilderValidationErrors,
  selectHasValidationErrors,
} from '../store/formVersionBuilderSlice';

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
 * builder.setStages(newStages);
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
  const dirty = useSelector(selectBuilderDirty);
  const saving = useSelector(selectBuilderSaving);
  const lastSavedAt = useSelector(selectBuilderLastSavedAt);
  const saveError = useSelector(selectBuilderSaveError);
  const formVersionId = useSelector(selectBuilderFormVersionId);
  const validationErrors = useSelector(selectBuilderValidationErrors);
  const hasValidationErrors = useSelector(selectHasValidationErrors);

  // Action dispatchers
  const actions = useMemo(
    () => ({
      initializeFrom: (formVersion: FormVersion) => {
        console.info('[useFormVersionBuilder] Initializing from FormVersion');
        dispatch(initializeFromFormVersion(formVersion));
      },

      reset: () => {
        console.info('[useFormVersionBuilder] Resetting builder');
        dispatch(resetBuilder());
      },

      setStages: (stages: UiStage[]) => {
        console.debug('[useFormVersionBuilder] Setting stages');
        dispatch(setStages(stages));
      },

      updateStage: (stage: UiStage) => {
        console.debug('[useFormVersionBuilder] Updating stage', stage.id);
        dispatch(updateStage(stage));
      },

      addStage: (stage: UiStage) => {
        console.info('[useFormVersionBuilder] Adding stage', stage.id);
        dispatch(addStage(stage));
      },

      removeStage: (stageId: StageIdLike) => {
        console.info('[useFormVersionBuilder] Removing stage', stageId);
        dispatch(removeStage(stageId));
      },

      setStageTransitions: (transitions: UiStageTransition[]) => {
        console.debug('[useFormVersionBuilder] Setting stage transitions');
        dispatch(setStageTransitions(transitions));
      },

      addStageTransition: (transition: UiStageTransition) => {
        console.info('[useFormVersionBuilder] Adding stage transition');
        dispatch(addStageTransition(transition));
      },

      removeStageTransition: (index: number) => {
        console.info('[useFormVersionBuilder] Removing stage transition', index);
        dispatch(removeStageTransition(index));
      },

      setSelectedStageId: (stageId: StageIdLike | null) => {
        console.debug('[useFormVersionBuilder] Setting selected stage', stageId);
        dispatch(setSelectedStageId(stageId));
      },

      setSelectedSectionId: (sectionId: SectionIdLike | null) => {
        console.debug('[useFormVersionBuilder] Setting selected section', sectionId);
        dispatch(setSelectedSectionId(sectionId));
      },

      setSelectedFieldId: (fieldId: FieldIdLike | null) => {
        console.debug('[useFormVersionBuilder] Setting selected field', fieldId);
        dispatch(setSelectedFieldId(fieldId));
      },

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
    dirty,
    saving,
    lastSavedAt,
    saveError,
    formVersionId,
    validationErrors,
    hasValidationErrors,

    // Actions
    ...actions,
  };
};

// ============================================================================
// Save Hook
// ============================================================================

/**
 * Hook for saving builder draft to API
 * Exposes save function with loading and error states
 * 
 * @returns Save function and related state
 * 
 * @example
 * const { save, saving, error } = useBuilderSave();
 * 
 * const handleSave = async () => {
 *   try {
 *     await save();
 *     toast.success('Saved!');
 *   } catch (err) {
 *     toast.error('Save failed');
 *   }
 * };
 */
export const useBuilderSave = () => {
  const dispatch = useDispatch<AppDispatch>();
  const formVersionId = useSelector(selectBuilderFormVersionId);
  const saving = useSelector(selectBuilderSaving);
  const saveError = useSelector(selectBuilderSaveError);

  const save = useCallback(async (): Promise<void> => {
    if (!formVersionId) {
      console.error('[useBuilderSave] Cannot save: No form version ID');
      throw new Error('No form version ID set in builder');
    }

    console.info('[useBuilderSave] Triggering save for form version', formVersionId);

    try {
      await dispatch(saveFormVersionDraft(formVersionId)).unwrap();
      console.info('[useBuilderSave] Save successful');
    } catch (error) {
      console.error('[useBuilderSave] Save failed:', error);
      throw error;
    }
  }, [dispatch, formVersionId]);

  return {
    save,
    saving,
    error: saveError,
  };
};

// ============================================================================
// Stage Selection Hook
// ============================================================================

/**
 * Hook for managing stage selection
 * Provides helper to get stage by ID
 * 
 * @param stageId - Stage ID to select/retrieve
 * @returns Selected stage and setter
 * 
 * @example
 * const { stage, setSelected } = useStageSelection(stageId);
 */
export const useStageSelection = (stageId?: StageIdLike | null) => {
  const dispatch = useDispatch<AppDispatch>();
  const stage = useSelector(selectBuilderStageById(stageId || null));
  const selectedStageId = useSelector(selectSelectedStageId);

  const setSelected = useCallback(
    (id: StageIdLike | null) => {
      dispatch(setSelectedStageId(id));
    },
    [dispatch]
  );

  return {
    stage,
    selectedStageId,
    setSelected,
  };
};

// ============================================================================
// Validation Hook
// ============================================================================

/**
 * Hook for validation state management
 * 
 * @returns Validation errors and helpers
 * 
 * @example
 * const { errors, hasErrors, setErrors, clearErrors } = useBuilderValidation();
 * 
 * if (!stageName) {
 *   setErrors({ stageName: 'Name is required' });
 * }
 */
export const useBuilderValidation = () => {
  const dispatch = useDispatch<AppDispatch>();
  const errors = useSelector(selectBuilderValidationErrors);
  const hasErrors = useSelector(selectHasValidationErrors);

  const setErrors = useCallback(
    (errors: Record<string, string>) => {
      dispatch(setValidationErrors(errors));
    },
    [dispatch]
  );

  const clearErrors = useCallback(() => {
    dispatch(clearValidationErrors());
  }, [dispatch]);

  return {
    errors,
    hasErrors,
    setErrors,
    clearErrors,
  };
};
