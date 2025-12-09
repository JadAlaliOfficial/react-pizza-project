// src/features/formVersion/store/formVersionBuilder.stages.ts

/**
 * Stage-specific reducers for Form Version Builder
 * Handles stage and stage transition CRUD operations
 */

import type { PayloadAction, ActionReducerMapBuilder } from '@reduxjs/toolkit';
import type { UiStage, UiStageTransition, StageIdLike } from '../types/formVersion.ui-types';
import type { FormVersionBuilderState } from './formVersionBuilderSlice';

// ============================================================================
// Stage Reducers
// ============================================================================

export const stageReducers = {
  /**
   * Sets all stages (replaces entire stages array)
   */
  setStages: (state: FormVersionBuilderState, action: PayloadAction<UiStage[]>) => {
    console.debug(
      `[StageReducers] Setting ${action.payload.length} stages`
    );
    state.stages = action.payload;
    state.dirty = true;
  },

  /**
   * Updates a single stage by ID
   */
  updateStage: (state: FormVersionBuilderState, action: PayloadAction<UiStage>) => {
    console.debug(
      `[StageReducers] Updating stage ${action.payload.id}`
    );

    const index = state.stages.findIndex((s) => s.id === action.payload.id);
    if (index !== -1) {
      state.stages[index] = action.payload;
      state.dirty = true;
    } else {
      console.warn(
        `[StageReducers] Stage ${action.payload.id} not found for update`
      );
    }
  },

  /**
   * Adds a new stage
   */
  addStage: (state: FormVersionBuilderState, action: PayloadAction<UiStage>) => {
    console.info(
      `[StageReducers] Adding stage ${action.payload.id}`
    );
    state.stages.push(action.payload);
    state.dirty = true;

    // Auto-select if it's the first stage
    if (state.stages.length === 1) {
      state.selectedStageId = action.payload.id;
      console.debug(`[StageReducers] Auto-selected new first stage: ${action.payload.id}`);
    }
  },

  /**
   * Removes a stage by ID
   */
  removeStage: (state: FormVersionBuilderState, action: PayloadAction<StageIdLike>) => {
    console.info(`[StageReducers] Removing stage ${action.payload}`);
    
    const initialIndex = state.stages.findIndex((s) => s.id === action.payload);
    const wasInitial = initialIndex !== -1 && state.stages[initialIndex].is_initial;
    
    state.stages = state.stages.filter((s) => s.id !== action.payload);
    
    // If we removed the initial stage and there are remaining stages, make first one initial
    if (wasInitial && state.stages.length > 0) {
      console.debug('[StageReducers] Removed initial stage, making first remaining stage initial');
      state.stages[0].is_initial = true;
    }
    
    state.dirty = true;

    // Clear selection if deleted stage was selected, and select first stage if available
    if (state.selectedStageId === action.payload) {
      state.selectedStageId = state.stages.length > 0 ? state.stages[0].id : null;
      state.selectedSectionId = null;
      console.debug(`[StageReducers] Selected stage was deleted, switching to: ${state.selectedStageId}`);
    }
  },

  // ========================================================================
  // Stage Transition Actions
  // ========================================================================

  /**
   * Sets all stage transitions
   */
  setStageTransitions: (state: FormVersionBuilderState, action: PayloadAction<UiStageTransition[]>) => {
    console.debug(
      `[StageReducers] Setting ${action.payload.length} stage transitions`
    );
    state.stageTransitions = action.payload;
    state.dirty = true;
  },

  /**
   * Adds a new stage transition
   */
  addStageTransition: (state: FormVersionBuilderState, action: PayloadAction<UiStageTransition>) => {
    console.info('[StageReducers] Adding stage transition');
    state.stageTransitions.push(action.payload);
    state.dirty = true;
  },

  /**
   * Removes a stage transition by index
   */
  removeStageTransition: (state: FormVersionBuilderState, action: PayloadAction<number>) => {
    console.info(
      `[StageReducers] Removing stage transition at index ${action.payload}`
    );
    state.stageTransitions = state.stageTransitions.filter(
      (_, index) => index !== action.payload
    );
    state.dirty = true;
  },
};

// ============================================================================
// Extra Reducers (for async thunks, if needed)
// ============================================================================

export const stageExtraReducers = (_builder: ActionReducerMapBuilder<FormVersionBuilderState>) => {
  // Placeholder for future async thunks related to stages
  // Example: fetchStageTemplates, validateStage, etc.
};
