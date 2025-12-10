// src/features/formVersion/hooks/useFormVersionBuilder.transitions.ts

/**
 * Transition-specific hooks for Form Version Builder
 * Handles transition CRUD operations and action management
 * Provides convenient access to transition actions and selection
 */

import {  useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '@/store';
import type {
  UiStageTransition,
  UiTransitionAction,
  StageIdLike,
  TransitionIdLike,
  ActionType,
} from '../types/formVersion.ui-types';
import {
  addTransition,
  updateTransition,
  removeTransition,
  setSelectedTransitionId,
  addTransitionAction,
  updateTransitionAction,
  removeTransitionAction,
  reorderTransitionActions,
} from '../store/formVersionBuilderSlice';

// ============================================================================
// Selectors
// ============================================================================

/**
 * Selects all transitions from builder state
 */
export const selectTransitions = (state: RootState): UiStageTransition[] =>
  state.formVersionBuilder.stageTransitions;

/**
 * Selects the currently selected transition ID
 */
export const selectSelectedTransitionId = (
  state: RootState
): TransitionIdLike | null => state.formVersionBuilder.selectedTransitionId ?? null;

/**
 * Selects the currently selected transition object
 */
export const selectSelectedTransition = (
  state: RootState
): UiStageTransition | undefined => {
  const selectedId = selectSelectedTransitionId(state);
  if (!selectedId) return undefined;

  return state.formVersionBuilder.stageTransitions.find(
    (t) => t.id === selectedId
  );
};

/**
 * Selects a transition by ID
 */
export const selectTransitionById = (transitionId: TransitionIdLike | null) => (
  state: RootState
): UiStageTransition | undefined => {
  if (!transitionId) return undefined;
  return state.formVersionBuilder.stageTransitions.find(
    (t) => t.id === transitionId
  );
};

/**
 * Selects transitions that originate from a specific stage
 */
export const selectTransitionsFromStage = (stageId: StageIdLike | null) => (
  state: RootState
): UiStageTransition[] => {
  if (!stageId) return [];
  return state.formVersionBuilder.stageTransitions.filter(
    (t) => t.from_stage_id === stageId
  );
};

/**
 * Selects transitions that lead to a specific stage
 */
export const selectTransitionsToStage = (stageId: StageIdLike | null) => (
  state: RootState
): UiStageTransition[] => {
  if (!stageId) return [];
  return state.formVersionBuilder.stageTransitions.filter(
    (t) => t.to_stage_id === stageId
  );
};

// ============================================================================
// Transition Actions Hook
// ============================================================================

/**
 * Hook for transition-related actions
 * Used internally by useFormVersionBuilder
 *
 * @returns Transition action dispatchers
 */
export const useTransitionActions = () => {
  const dispatch = useDispatch<AppDispatch>();

  return useMemo(
    () => ({
      addTransition: (fromStageId: StageIdLike, toStageId: StageIdLike) => {
        console.info(
          '[useTransitionActions] Adding transition from',
          fromStageId,
          'to',
          toStageId
        );
        dispatch(addTransition({ fromStageId, toStageId }));
      },

      updateTransition: (
        transitionId: TransitionIdLike,
        changes: Partial<Omit<UiStageTransition, 'id' | 'actions'>>
      ) => {
        console.debug(
          '[useTransitionActions] Updating transition',
          transitionId
        );
        dispatch(updateTransition({ transitionId, changes }));
      },

      removeTransition: (transitionId: TransitionIdLike) => {
        console.info(
          '[useTransitionActions] Removing transition',
          transitionId
        );
        dispatch(removeTransition({ transitionId }));
      },

      setSelectedTransitionId: (transitionId: TransitionIdLike | null) => {
        console.debug(
          '[useTransitionActions] Setting selected transition',
          transitionId
        );
        dispatch(setSelectedTransitionId(transitionId));
      },

      addAction: (transitionId: TransitionIdLike, actionType: ActionType) => {
        console.info(
          '[useTransitionActions] Adding action',
          actionType,
          'to transition',
          transitionId
        );
        dispatch(addTransitionAction({ transitionId, actionType }));
      },

      updateAction: (
        transitionId: TransitionIdLike,
        actionIndex: number,
        changes: Partial<UiTransitionAction>
      ) => {
        console.debug(
          '[useTransitionActions] Updating action',
          actionIndex,
          'in transition',
          transitionId
        );
        dispatch(updateTransitionAction({ transitionId, actionIndex, changes }));
      },

      removeAction: (transitionId: TransitionIdLike, actionIndex: number) => {
        console.info(
          '[useTransitionActions] Removing action',
          actionIndex,
          'from transition',
          transitionId
        );
        dispatch(removeTransitionAction({ transitionId, actionIndex }));
      },

      reorderActions: (
        transitionId: TransitionIdLike,
        actions: UiTransitionAction[]
      ) => {
        console.debug(
          '[useTransitionActions] Reordering actions in transition',
          transitionId
        );
        dispatch(reorderTransitionActions({ transitionId, actions }));
      },
    }),
    [dispatch]
  );
};

// ============================================================================
// Transition Selection Hook
// ============================================================================

/**
 * Hook for managing transition selection
 * Provides transitions list, selected transition, and selection helpers
 *
 * @returns Transitions, selected transition, and setSelected function
 *
 * @example
 * const { transitions, selectedTransition, setSelected } = useTransitionSelection();
 */
export const useTransitionSelection = () => {
  const transitions = useSelector(selectTransitions);
  const selectedTransitionId = useSelector(selectSelectedTransitionId);
  const selectedTransition = useSelector(selectSelectedTransition);
  const transitionActions = useTransitionActions();

  return {
    transitions,
    selectedTransitionId,
    selectedTransition,
    setSelected: transitionActions.setSelectedTransitionId,
  };
};

// ============================================================================
// Transition by ID Hook
// ============================================================================

/**
 * Hook to get a specific transition by its ID
 *
 * @param transitionId - Transition ID to look up
 * @returns The matching transition or undefined
 *
 * @example
 * const transition = useTransitionById(transitionId);
 */
export const useTransitionById = (
  transitionId: TransitionIdLike | null
): UiStageTransition | undefined => {
  return useSelector(selectTransitionById(transitionId));
};
