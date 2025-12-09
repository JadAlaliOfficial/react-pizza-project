// src/features/formVersion/hooks/useFormVersionBuilder.stages.ts

/**
 * Stage-specific hooks for Form Version Builder
 * Handles stage and stage transition actions
 */

import { useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch } from '@/store';
import type {
  UiStage,
  UiStageTransition,
  StageIdLike,
} from '../types/formVersion.ui-types';
import {
  setStages,
  updateStage,
  addStage,
  removeStage,
  setStageTransitions,
  addStageTransition,
  removeStageTransition,
  setSelectedStageId,
  selectBuilderStageById,
  selectSelectedStageId,
} from '../store/formVersionBuilderSlice';

// ============================================================================
// Stage Actions Hook
// ============================================================================

/**
 * Hook for stage-related actions
 * Used internally by useFormVersionBuilder
 * 
 * @returns Stage action dispatchers
 */
export const useStageActions = () => {
  const dispatch = useDispatch<AppDispatch>();

  return useMemo(
    () => ({
      // Stage actions
      setStages: (stages: UiStage[]) => {
        console.debug('[useStageActions] Setting stages');
        dispatch(setStages(stages));
      },

      updateStage: (stage: UiStage) => {
        console.debug('[useStageActions] Updating stage', stage.id);
        dispatch(updateStage(stage));
      },

      addStage: (stage: UiStage) => {
        console.info('[useStageActions] Adding stage', stage.id);
        dispatch(addStage(stage));
      },

      removeStage: (stageId: StageIdLike) => {
        console.info('[useStageActions] Removing stage', stageId);
        dispatch(removeStage(stageId));
      },

      // Transition actions
      setStageTransitions: (transitions: UiStageTransition[]) => {
        console.debug('[useStageActions] Setting stage transitions');
        dispatch(setStageTransitions(transitions));
      },

      addStageTransition: (transition: UiStageTransition) => {
        console.info('[useStageActions] Adding stage transition');
        dispatch(addStageTransition(transition));
      },

      removeStageTransition: (index: number) => {
        console.info('[useStageActions] Removing stage transition', index);
        dispatch(removeStageTransition(index));
      },
    }),
    [dispatch]
  );
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
