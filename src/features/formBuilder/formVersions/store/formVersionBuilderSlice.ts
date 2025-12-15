// src/features/formVersion/store/formVersionBuilderSlice.ts

/**
 * Redux slice for Form Version Builder
 * Manages draft state for form versions during editing
 * Extended with transitions and action management
 */

import {
  createSlice,
  createAsyncThunk,
  type PayloadAction,
} from '@reduxjs/toolkit';
import type { RootState } from '@/store';
import type { ServiceError } from '../types';
import { buildUpdateFormVersionRequest } from '../utils/formVersion.mappers';
import { updateFormVersion } from '../services/api';
import type {
  UiStage,
  UiStageTransition,
  StageIdLike,
  SectionIdLike,
  FieldIdLike,
  TransitionIdLike,
} from '../types/formVersion.ui-types';

// Import reducers from modular files
import { stageReducers } from './formVersionBuilder.stages';
import { sectionReducers } from './formVersionBuilder.sections';
import { transitionReducers } from './formVersionBuilder.transitions';

// ============================================================================
// State Type
// ============================================================================

export interface FormVersionBuilderState {
  /**
   * Form version ID being edited
   */
  formVersionId: number | null;

  /**
   * Stages in the form version
   */
  stages: UiStage[];

  /**
   * Stage transitions (workflow)
   */
  stageTransitions: UiStageTransition[];

  /**
   * Whether there are unsaved changes
   */
  dirty: boolean;

  /**
   * Timestamp of last save
   */
  lastSavedAt: number | null;

  /**
   * Currently selected stage ID (for UI focus)
   */
  selectedStageId: StageIdLike | null;

  /**
   * Currently selected section ID (for UI focus)
   */
  selectedSectionId: SectionIdLike | null;

  /**
   * Currently selected field ID (for UI focus)
   */
  selectedFieldId: FieldIdLike | null;

  /**
   * Currently selected transition ID (for UI focus)
   */
  selectedTransitionId: TransitionIdLike | null;

  /**
   * Saving state and error for draft persistence
   */
  saving?: boolean;
  saveError?: ServiceError | null;

  /**
   * Validation errors keyed by field
   */
  validationErrors?: Record<string, string>;
}

// ============================================================================
// Initial State
// ============================================================================

const initialState: FormVersionBuilderState = {
  formVersionId: null,
  stages: [],
  stageTransitions: [],
  dirty: false,
  lastSavedAt: null,
  selectedStageId: null,
  selectedSectionId: null,
  selectedFieldId: null,
  selectedTransitionId: null,
  saving: false,
  saveError: null,
  validationErrors: {},
};

// ============================================================================
// Slice Definition
// ============================================================================

const formVersionBuilderSlice = createSlice({
  name: 'formVersionBuilder',
  initialState,
  reducers: {
    /**
     * Initializes the builder from a form version
     */
    initializeBuilder: (
      state,
      action: PayloadAction<{
        formVersionId: number;
        stages: UiStage[];
        stageTransitions: UiStageTransition[];
      }>,
    ) => {
      console.info(
        '[FormVersionBuilderSlice] Initializing builder for form version',
        action.payload.formVersionId,
      );

      state.formVersionId = action.payload.formVersionId;
      state.stages = action.payload.stages;
      state.stageTransitions = action.payload.stageTransitions;
      state.dirty = false;
      state.lastSavedAt = null;
      state.selectedStageId = null;
      state.selectedSectionId = null;
      state.selectedFieldId = null;
      state.selectedTransitionId = null;

      console.info(
        `[FormVersionBuilderSlice] Initialized with ${state.stages.length} stages and ${state.stageTransitions.length} transitions`,
      );
    },

    /**
     * Resets the builder to initial state
     */
    resetBuilder: (_state) => {
      console.info('[FormVersionBuilderSlice] Resetting builder');
      return initialState;
    },

    /**
     * Marks the builder as saved
     */
    markAsSaved: (state) => {
      console.debug('[FormVersionBuilderSlice] Marking as saved');
      state.dirty = false;
      state.lastSavedAt = Date.now();
    },

    /**
     * Sets stages array (reducer provided by stageReducers handles it)
     */

    /**
     * Sets the selected stage ID
     */
    setSelectedStageId: (
      state,
      action: PayloadAction<StageIdLike | string | null>,
    ) => {
      const payload = action.payload;

      // Handle string that might be a number
      if (typeof payload === 'string') {
        const parsed = parseInt(payload, 10);
        state.selectedStageId = isNaN(parsed) ? payload : parsed;
      } else {
        state.selectedStageId = payload;
      }

      console.debug(
        '[FormVersionBuilderSlice] Selected stage ID set to:',
        state.selectedStageId,
      );
    },

    /**
     * Sets the selected section ID
     */
    setSelectedSectionId: (
      state,
      action: PayloadAction<SectionIdLike | null>,
    ) => {
      console.debug(
        '[FormVersionBuilderSlice] Setting selected section:',
        action.payload,
      );
      state.selectedSectionId = action.payload;
    },

    /**
     * Sets the selected field ID
     */
    setSelectedFieldId: (state, action: PayloadAction<FieldIdLike | null>) => {
      console.debug(
        '[FormVersionBuilderSlice] Setting selected field:',
        action.payload,
      );
      state.selectedFieldId = action.payload;
    },

    // ========================================================================
    // Stage Reducers (imported)
    // ========================================================================
    ...stageReducers,

    // ========================================================================
    // Section Reducers (imported)
    // ========================================================================
    ...sectionReducers,

    // ========================================================================
    // Transition Reducers (imported)
    // ========================================================================
    ...transitionReducers,

    /**
     * Sets validation errors
     */
    setValidationErrors: (
      state,
      action: PayloadAction<Record<string, string>>,
    ) => {
      state.validationErrors = action.payload || {};
    },

    /**
     * Clears validation errors
     */
    clearValidationErrors: (state) => {
      state.validationErrors = {};
    },
  },
  extraReducers: (builder) => {
    builder.addCase(saveFormVersionDraft.pending, (state) => {
      state.saving = true;
      state.saveError = null;
    });

    builder.addCase(saveFormVersionDraft.fulfilled, (state) => {
      state.saving = false;
    });

    builder.addCase(saveFormVersionDraft.rejected, (state, action) => {
      state.saving = false;
      state.saveError = (action.payload as ServiceError) || {
        message: 'Save failed',
      };
    });
  },
});

// ============================================================================
// Exports
// ============================================================================

export const {
  initializeBuilder,
  resetBuilder,
  markAsSaved,
  setStages,
  setStageTransitions,
  addStageTransition,
  removeStageTransition,
  setSelectedStageId,
  setSelectedSectionId,
  setSelectedFieldId,

  // Stage actions
  addStage,
  updateStage,
  removeStage,

  // Section actions
  addSection,
  updateSection,
  removeSection,
  reorderSections,

  // Field actions
  addField,
  updateField,
  removeField,
  reorderFields,

  // Transition actions
  addTransition,
  updateTransition,
  removeTransition,
  setSelectedTransitionId,

  // Transition action management
  addTransitionAction,
  updateTransitionAction,
  removeTransitionAction,
  reorderTransitionActions,
  setValidationErrors,
  clearValidationErrors,
} = formVersionBuilderSlice.actions;

export default formVersionBuilderSlice.reducer;

// ============================================================================
// Async Thunks
// ============================================================================

export const saveFormVersionDraft = createAsyncThunk<
  void,
  number,
  { state: RootState; rejectValue: ServiceError }
>(
  'formVersionBuilder/saveDraft',
  async (id: number, { getState, rejectWithValue, dispatch }) => {
    try {
      const state = getState();
      const builder = state.formVersionBuilder;
      const request = buildUpdateFormVersionRequest({
        stages: builder.stages,
        stageTransitions: builder.stageTransitions,
      });
      // console.log('Request:', request);
      await updateFormVersion(id, request);

      dispatch(markAsSaved());
    } catch (error) {
      const serviceError = error as ServiceError;
      return rejectWithValue(serviceError);
    }
  },
);

// ============================================================================
// Selectors
// ============================================================================

export const selectBuilderFormVersionId = (state: RootState): number | null =>
  state.formVersionBuilder.formVersionId;

export const selectBuilderSaving = (state: RootState): boolean =>
  !!state.formVersionBuilder.saving;

export const selectBuilderSaveError = (state: RootState): ServiceError | null =>
  state.formVersionBuilder.saveError || null;

export const selectSelectedStageId = (state: RootState): StageIdLike | null =>
  state.formVersionBuilder.selectedStageId;

export const selectBuilderStageById =
  (stageId: StageIdLike | null) => (state: RootState) =>
    stageId === null
      ? undefined
      : state.formVersionBuilder.stages.find((s) => s.id === stageId);

export const selectSectionsByStageId =
  (stageId: StageIdLike | null) => (state: RootState) => {
    if (stageId === null) return [];
    const stage = state.formVersionBuilder.stages.find((s) => s.id === stageId);
    return stage ? stage.sections : [];
  };

export const selectSectionById =
  (stageId: StageIdLike | null, sectionId: SectionIdLike | null) =>
  (state: RootState) => {
    if (stageId === null || sectionId === null) return undefined;
    const stage = state.formVersionBuilder.stages.find((s) => s.id === stageId);
    return stage?.sections.find((sec) => sec.id === sectionId);
  };

export const selectSelectedSectionId = (
  state: RootState,
): SectionIdLike | null => state.formVersionBuilder.selectedSectionId;

export const selectSelectedSection = (state: RootState) => {
  const stageId = state.formVersionBuilder.selectedStageId;
  const sectionId = state.formVersionBuilder.selectedSectionId;
  if (stageId === null || sectionId === null) return undefined;
  const stage = state.formVersionBuilder.stages.find((s) => s.id === stageId);
  return stage?.sections.find((sec) => sec.id === sectionId);
};

export const selectFieldsBySectionId =
  (stageId: StageIdLike | null, sectionId: SectionIdLike | null) =>
  (state: RootState) => {
    if (stageId === null || sectionId === null) return [];
    const stage = state.formVersionBuilder.stages.find((s) => s.id === stageId);
    const section = stage?.sections.find((sec) => sec.id === sectionId);
    return section ? section.fields : [];
  };

export const selectFieldById =
  (
    stageId: StageIdLike | null,
    sectionId: SectionIdLike | null,
    fieldId: FieldIdLike | null,
  ) =>
  (state: RootState) => {
    if (stageId === null || sectionId === null || fieldId === null)
      return undefined;
    const stage = state.formVersionBuilder.stages.find((s) => s.id === stageId);
    const section = stage?.sections.find((sec) => sec.id === sectionId);
    return section?.fields.find((f) => f.id === fieldId);
  };

export const selectSelectedFieldId = (state: RootState): FieldIdLike | null =>
  state.formVersionBuilder.selectedFieldId;

export const selectSelectedField = (state: RootState) => {
  const stageId = state.formVersionBuilder.selectedStageId;
  const sectionId = state.formVersionBuilder.selectedSectionId;
  const fieldId = state.formVersionBuilder.selectedFieldId;
  if (stageId === null || sectionId === null || fieldId === null)
    return undefined;
  const stage = state.formVersionBuilder.stages.find((s) => s.id === stageId);
  const section = stage?.sections.find((sec) => sec.id === sectionId);
  return section?.fields.find((f) => f.id === fieldId);
};

export const selectBuilderValidationErrors = (
  state: RootState,
): Record<string, string> => state.formVersionBuilder.validationErrors || {};

export const selectHasValidationErrors = (state: RootState): boolean =>
  !!state.formVersionBuilder.validationErrors &&
  Object.keys(state.formVersionBuilder.validationErrors).length > 0;

// ============================================================================
// End Slice
// ============================================================================
