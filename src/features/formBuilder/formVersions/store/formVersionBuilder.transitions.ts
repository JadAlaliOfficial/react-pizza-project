// src/features/formVersion/store/formVersionBuilder.transitions.ts

/**
 * Transition-specific reducers for Form Version Builder
 * Handles stage transition CRUD operations with action management
 */

import type { PayloadAction } from '@reduxjs/toolkit';
import type {
  UiStageTransition,
  UiTransitionAction,
  StageIdLike,
  TransitionIdLike,
  ActionType,
} from '../types/formVersion.ui-types';
import type { FormVersionBuilderState } from './formVersionBuilderSlice';
import { generateFakeId } from '../utils/fakeId';

// ============================================================================
// Transition Reducers
// ============================================================================

export const transitionReducers = {
  /**
   * Adds a new transition between stages
   */
  addTransition: (
    state: FormVersionBuilderState,
    action: PayloadAction<{
      fromStageId: StageIdLike;
      toStageId: StageIdLike;
    }>
  ) => {
    const { fromStageId, toStageId } = action.payload;

    console.info(
      `[TransitionReducers] Adding transition from ${fromStageId} to ${toStageId}`
    );

    const newTransition: UiStageTransition = {
      id: generateFakeId(),
      from_stage_id: fromStageId,
      to_stage_id: toStageId,
      label: 'New Transition',
      condition: null,
      to_complete: false,
      actions: [],
    };

    state.stageTransitions.push(newTransition);
    state.dirty = true;

    console.info(`[TransitionReducers] Created transition: ${newTransition.id}`);
  },

  /**
   * Updates a transition's properties
   */
  updateTransition: (
    state: FormVersionBuilderState,
    action: PayloadAction<{
      transitionId: TransitionIdLike;
      changes: Partial<Omit<UiStageTransition, 'id' | 'actions'>>;
    }>
  ) => {
    const { transitionId, changes } = action.payload;

    console.debug(`[TransitionReducers] Updating transition: ${transitionId}`);

    const transitionIndex = state.stageTransitions.findIndex(
      (t) => t.id === transitionId
    );

    if (transitionIndex === -1) {
      console.warn(
        `[TransitionReducers] Transition ${transitionId} not found for update`
      );
      return;
    }

    // Merge changes with existing transition (but preserve id and actions)
    state.stageTransitions[transitionIndex] = {
      ...state.stageTransitions[transitionIndex],
      ...changes,
    };

    state.dirty = true;
    console.debug(`[TransitionReducers] Transition ${transitionId} updated`);
  },

  /**
   * Removes a transition
   */
  removeTransition: (
    state: FormVersionBuilderState,
    action: PayloadAction<{ transitionId: TransitionIdLike }>
  ) => {
    const { transitionId } = action.payload;

    console.info(`[TransitionReducers] Removing transition: ${transitionId}`);

    state.stageTransitions = state.stageTransitions.filter(
      (t) => t.id !== transitionId
    );

    state.dirty = true;

    // Clear selection if deleted transition was selected
    if (state.selectedTransitionId === transitionId) {
      state.selectedTransitionId = null;
    }

    console.debug(`[TransitionReducers] Transition ${transitionId} removed`);
  },

  /**
   * Sets the selected transition ID
   */
  setSelectedTransitionId: (
    state: FormVersionBuilderState,
    action: PayloadAction<TransitionIdLike | null>
  ) => {
    console.debug(
      `[TransitionReducers] Setting selected transition: ${action.payload}`
    );
    state.selectedTransitionId = action.payload;
  },

  // ========================================================================
  // Action Management (nested within transitions)
  // ========================================================================

  /**
   * Adds a new action to a transition
   */
  addTransitionAction: (
    state: FormVersionBuilderState,
    action: PayloadAction<{
      transitionId: TransitionIdLike;
      actionType: ActionType;
    }>
  ) => {
    const { transitionId, actionType } = action.payload;

    console.info(
      `[TransitionReducers] Adding action "${actionType}" to transition ${transitionId}`
    );

    const transition = state.stageTransitions.find((t) => t.id === transitionId);

    if (!transition) {
      console.warn(
        `[TransitionReducers] Transition ${transitionId} not found for adding action`
      );
      return;
    }

    // Create new action with default props based on type
    const newAction: UiTransitionAction = {
      actionType,
      actionProps: getDefaultActionProps(actionType),
    };

    transition.actions.push(newAction);
    state.dirty = true;

    console.debug(
      `[TransitionReducers] Added action "${actionType}" to transition ${transitionId}`
    );
  },

  /**
   * Updates an action's properties within a transition
   */
  updateTransitionAction: (
    state: FormVersionBuilderState,
    action: PayloadAction<{
      transitionId: TransitionIdLike;
      actionIndex: number;
      changes: Partial<UiTransitionAction>;
    }>
  ) => {
    const { transitionId, actionIndex, changes } = action.payload;

    console.debug(
      `[TransitionReducers] Updating action ${actionIndex} in transition ${transitionId}`
    );

    const transition = state.stageTransitions.find((t) => t.id === transitionId);

    if (!transition) {
      console.warn(
        `[TransitionReducers] Transition ${transitionId} not found for updating action`
      );
      return;
    }

    if (actionIndex < 0 || actionIndex >= transition.actions.length) {
      console.warn(
        `[TransitionReducers] Action index ${actionIndex} out of bounds`
      );
      return;
    }

    // Merge changes with existing action
    transition.actions[actionIndex] = {
      ...transition.actions[actionIndex],
      ...changes,
    };

    state.dirty = true;
    console.debug(
      `[TransitionReducers] Action ${actionIndex} updated in transition ${transitionId}`
    );
  },

  /**
   * Removes an action from a transition
   */
  removeTransitionAction: (
    state: FormVersionBuilderState,
    action: PayloadAction<{
      transitionId: TransitionIdLike;
      actionIndex: number;
    }>
  ) => {
    const { transitionId, actionIndex } = action.payload;

    console.info(
      `[TransitionReducers] Removing action ${actionIndex} from transition ${transitionId}`
    );

    const transition = state.stageTransitions.find((t) => t.id === transitionId);

    if (!transition) {
      console.warn(
        `[TransitionReducers] Transition ${transitionId} not found for removing action`
      );
      return;
    }

    if (actionIndex < 0 || actionIndex >= transition.actions.length) {
      console.warn(
        `[TransitionReducers] Action index ${actionIndex} out of bounds`
      );
      return;
    }

    transition.actions.splice(actionIndex, 1);
    state.dirty = true;

    console.debug(
      `[TransitionReducers] Action ${actionIndex} removed from transition ${transitionId}`
    );
  },

  /**
   * Reorders actions within a transition
   */
  reorderTransitionActions: (
    state: FormVersionBuilderState,
    action: PayloadAction<{
      transitionId: TransitionIdLike;
      actions: UiTransitionAction[];
    }>
  ) => {
    const { transitionId, actions } = action.payload;

    console.debug(
      `[TransitionReducers] Reordering actions in transition ${transitionId}`
    );

    const transition = state.stageTransitions.find((t) => t.id === transitionId);

    if (!transition) {
      console.warn(
        `[TransitionReducers] Transition ${transitionId} not found for reordering actions`
      );
      return;
    }

    transition.actions = actions;
    state.dirty = true;

    console.debug(
      `[TransitionReducers] Actions reordered in transition ${transitionId}`
    );
  },
};

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Returns default props for a given action type
 * Provides sensible starting values for new actions
 */
function getDefaultActionProps(actionType: ActionType): Record<string, any> {
  switch (actionType) {
    case 'Send Email':
      return {
        emailSubject: 'Form Notification',
        emailContent: 'You have a new notification.',
        receiversEmails: [],
        receiversRoles: [],
        receiversUsers: [],
        ccEmails: [],
        bccEmails: [],
      };

    case 'Send Notification':
      return {
        notificationTitle: 'New Notification',
        notificationBody: 'You have a new update.',
        notificationType: 'info',
        receiversRoles: [],
        receiversUsers: [],
      };

    case 'Call Webhook':
      return {
        webhookUrl: '',
        webhookMethod: 'POST',
        webhookHeaders: {},
        webhookPayload: {},
        webhookTimeout: 30,
      };

    default:
      console.warn(
        `[TransitionReducers] Unknown action type: ${actionType}, returning empty props`
      );
      return {};
  }
}
