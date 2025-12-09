// src/features/formVersion/store/formVersionBuilderSlice.ts

/**
 * Redux slice for Form Version Builder draft state
 * Manages local editing state separate from server truth (formVersion slice)
 * Handles draft changes, selections, dirty flags, and save operations
 */

import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '@/store';
import type {
  FormVersion,
  ServiceError,
  UpdateFormVersionRequest,
} from '../types';
import type {
  UiStage,
  UiStageTransition,
  StageIdLike,
  SectionIdLike,
  FieldIdLike,
} from '../types/formVersion.ui-types';
import { mapFormVersionToUi, buildUpdateFormVersionRequest } from '../utils/formVersion.mappers';
import { updateFormVersion } from '../services/api';

// ============================================================================
// State Type
// ============================================================================

/**
 * Builder state structure
 * Holds the draft configuration being edited by the user
 */
interface FormVersionBuilderState {
  // Draft data (UI types with fake IDs support)
  stages: UiStage[];
  stageTransitions: UiStageTransition[];

  // Selection state for UI focus
  selectedStageId: StageIdLike | null;
  selectedSectionId: SectionIdLike | null;
  selectedFieldId: FieldIdLike | null;

  // Dirty flag tracking
  dirty: boolean;

  // Save operation state
  saving: boolean;
  lastSavedAt: number | null;
  saveError: ServiceError | null;

  // Form version ID being edited
  formVersionId: number | null;

  // Validation errors (future expansion)
  validationErrors: Record<string, string>;
}

// ============================================================================
// Initial State
// ============================================================================

const initialState: FormVersionBuilderState = {
  stages: [],
  stageTransitions: [],
  selectedStageId: null,
  selectedSectionId: null,
  selectedFieldId: null,
  dirty: false,
  saving: false,
  lastSavedAt: null,
  saveError: null,
  formVersionId: null,
  validationErrors: {},
};

// ============================================================================
// Async Thunks
// ============================================================================

/**
 * Saves the current builder draft to the API
 * Converts UI types to API format and calls updateFormVersion
 * 
 * @param formVersionId - Form version ID to update
 * @returns Updated form version data
 */
export const saveFormVersionDraft = createAsyncThunk<
  UpdateFormVersionRequest,
  number,
  { state: RootState; rejectValue: ServiceError }
>(
  'formVersionBuilder/save',
  async (formVersionId: number, { getState, rejectWithValue }) => {
    console.info(`[FormVersionBuilderSlice] Saving draft for form version ${formVersionId}`);

    const state = getState();
    const { stages, stageTransitions } = state.formVersionBuilder;

    try {
      // Build API request from UI state
      const updateRequest = buildUpdateFormVersionRequest({
        stages,
        stageTransitions,
      });

      console.debug(
        `[FormVersionBuilderSlice] Built update request with ${updateRequest.stages.length} stages ` +
        `and ${updateRequest.stage_transitions.length} transitions`
      );

      // Call API service
      const result = await updateFormVersion(formVersionId, updateRequest);

      console.info(`[FormVersionBuilderSlice] Save successful for form version ${formVersionId}`);

      return result;
    } catch (error) {
      const serviceError = error as ServiceError;
      console.error(
        `[FormVersionBuilderSlice] Save failed for form version ${formVersionId}:`,
        serviceError.message
      );
      return rejectWithValue(serviceError);
    }
  }
);

// ============================================================================
// Slice Definition
// ============================================================================

const formVersionBuilderSlice = createSlice({
  name: 'formVersionBuilder',
  initialState,
  reducers: {
    /**
     * Initializes builder from an existing FormVersion
     * Converts API types to UI types using mapper
     */
    initializeFromFormVersion: (state, action: PayloadAction<FormVersion>) => {
      console.info(
        `[FormVersionBuilderSlice] Initializing from form version ${action.payload.id}`
      );

      const { stages, stageTransitions } = mapFormVersionToUi(action.payload);

      state.stages = stages;
      state.stageTransitions = stageTransitions;
      state.formVersionId = action.payload.id;
      state.dirty = false;
      state.lastSavedAt = null;
      state.saveError = null;
      state.validationErrors = {};

      console.debug(
        `[FormVersionBuilderSlice] Initialized with ${stages.length} stages and ` +
        `${stageTransitions.length} transitions`
      );
    },

    /**
     * Resets builder to initial state
     */
    resetBuilder: (state) => {
      console.info('[FormVersionBuilderSlice] Resetting builder state');
      Object.assign(state, initialState);
    },

    /**
     * Sets all stages (replaces entire stages array)
     */
    setStages: (state, action: PayloadAction<UiStage[]>) => {
      console.debug(
        `[FormVersionBuilderSlice] Setting ${action.payload.length} stages`
      );
      state.stages = action.payload;
      state.dirty = true;
    },

    /**
     * Updates a single stage by ID
     */
    updateStage: (state, action: PayloadAction<UiStage>) => {
      console.debug(
        `[FormVersionBuilderSlice] Updating stage ${action.payload.id}`
      );

      const index = state.stages.findIndex((s) => s.id === action.payload.id);
      if (index !== -1) {
        state.stages[index] = action.payload;
        state.dirty = true;
      } else {
        console.warn(
          `[FormVersionBuilderSlice] Stage ${action.payload.id} not found for update`
        );
      }
    },

    /**
     * Adds a new stage
     */
    addStage: (state, action: PayloadAction<UiStage>) => {
      console.info(
        `[FormVersionBuilderSlice] Adding stage ${action.payload.id}`
      );
      state.stages.push(action.payload);
      state.dirty = true;
    },

    /**
     * Removes a stage by ID
     */
    removeStage: (state, action: PayloadAction<StageIdLike>) => {
      console.info(`[FormVersionBuilderSlice] Removing stage ${action.payload}`);
      
      const initialIndex = state.stages.findIndex((s) => s.id === action.payload);
      const wasInitial = initialIndex !== -1 && state.stages[initialIndex].is_initial;
      
      state.stages = state.stages.filter((s) => s.id !== action.payload);
      
      // If we removed the initial stage and there are remaining stages, make first one initial
      if (wasInitial && state.stages.length > 0) {
        console.debug('[FormVersionBuilderSlice] Removed initial stage, making first remaining stage initial');
        state.stages[0].is_initial = true;
      }
      
      state.dirty = true;

      // Clear selection if deleted stage was selected
      if (state.selectedStageId === action.payload) {
        state.selectedStageId = null;
      }
    },

    /**
     * Sets all stage transitions
     */
    setStageTransitions: (state, action: PayloadAction<UiStageTransition[]>) => {
      console.debug(
        `[FormVersionBuilderSlice] Setting ${action.payload.length} stage transitions`
      );
      state.stageTransitions = action.payload;
      state.dirty = true;
    },

    /**
     * Adds a new stage transition
     */
    addStageTransition: (state, action: PayloadAction<UiStageTransition>) => {
      console.info('[FormVersionBuilderSlice] Adding stage transition');
      state.stageTransitions.push(action.payload);
      state.dirty = true;
    },

    /**
     * Removes a stage transition by index
     */
    removeStageTransition: (state, action: PayloadAction<number>) => {
      console.info(
        `[FormVersionBuilderSlice] Removing stage transition at index ${action.payload}`
      );
      state.stageTransitions = state.stageTransitions.filter(
        (_, index) => index !== action.payload
      );
      state.dirty = true;
    },

    /**
     * Sets selected stage ID
     */
    setSelectedStageId: (state, action: PayloadAction<StageIdLike | null>) => {
      console.debug(`[FormVersionBuilderSlice] Setting selected stage: ${action.payload}`);
      state.selectedStageId = action.payload;
    },

    /**
     * Sets selected section ID
     */
    setSelectedSectionId: (state, action: PayloadAction<SectionIdLike | null>) => {
      console.debug(`[FormVersionBuilderSlice] Setting selected section: ${action.payload}`);
      state.selectedSectionId = action.payload;
    },

    /**
     * Sets selected field ID
     */
    setSelectedFieldId: (state, action: PayloadAction<FieldIdLike | null>) => {
      console.debug(`[FormVersionBuilderSlice] Setting selected field: ${action.payload}`);
      state.selectedFieldId = action.payload;
    },

    /**
     * Manually marks draft as dirty or clean
     */
    setDirty: (state, action: PayloadAction<boolean>) => {
      console.debug(`[FormVersionBuilderSlice] Setting dirty flag: ${action.payload}`);
      state.dirty = action.payload;
    },

    /**
     * Clears save error
     */
    clearSaveError: (state) => {
      console.debug('[FormVersionBuilderSlice] Clearing save error');
      state.saveError = null;
    },

    /**
     * Sets validation errors
     */
    setValidationErrors: (state, action: PayloadAction<Record<string, string>>) => {
      console.debug('[FormVersionBuilderSlice] Setting validation errors');
      state.validationErrors = action.payload;
    },

    /**
     * Clears all validation errors
     */
    clearValidationErrors: (state) => {
      console.debug('[FormVersionBuilderSlice] Clearing validation errors');
      state.validationErrors = {};
    },
  },

  extraReducers: (builder) => {
    // ========================================================================
    // Save Draft
    // ========================================================================
    builder.addCase(saveFormVersionDraft.pending, (state) => {
      console.debug('[FormVersionBuilderSlice] Save pending');
      state.saving = true;
      state.saveError = null;
    });

    builder.addCase(saveFormVersionDraft.fulfilled, (state, _action) => {
      console.info('[FormVersionBuilderSlice] Save fulfilled');
      state.saving = false;
      state.dirty = false;
      state.lastSavedAt = Date.now();
      state.saveError = null;

      // Update the draft with the saved data (which may have real IDs now)
    //   const { stages, stageTransitions } = buildUpdateFormVersionRequest({
    //     stages: state.stages,
    //     stageTransitions: state.stageTransitions,
    //   });

      // Note: We keep the UI types in state, but mark as clean
      // The real IDs will come from refetching the formVersion
      console.debug('[FormVersionBuilderSlice] Draft marked as saved');
    });

    builder.addCase(saveFormVersionDraft.rejected, (state, action) => {
      console.error(
        '[FormVersionBuilderSlice] Save rejected:',
        action.payload?.message
      );
      state.saving = false;
      state.saveError = action.payload || {
        message: 'Failed to save form version draft',
      };
    });
  },
});

// ============================================================================
// Actions Export
// ============================================================================

export const {
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
} = formVersionBuilderSlice.actions;

// ============================================================================
// Selectors
// ============================================================================

/**
 * Selects all stages from builder draft
 */
export const selectBuilderStages = (state: RootState): UiStage[] =>
  state.formVersionBuilder.stages;

/**
 * Selects all stage transitions from builder draft
 */
export const selectBuilderStageTransitions = (state: RootState): UiStageTransition[] =>
  state.formVersionBuilder.stageTransitions;

/**
 * Selects a stage by ID
 */
export const selectBuilderStageById = (stageId: StageIdLike | null) => (
  state: RootState
): UiStage | undefined => {
  if (!stageId) return undefined;
  return state.formVersionBuilder.stages.find((s) => s.id === stageId);
};

/**
 * Selects the currently selected stage ID
 */
export const selectSelectedStageId = (state: RootState): StageIdLike | null =>
  state.formVersionBuilder.selectedStageId;

/**
 * Selects the currently selected section ID
 */
export const selectSelectedSectionId = (state: RootState): SectionIdLike | null =>
  state.formVersionBuilder.selectedSectionId;

/**
 * Selects the currently selected field ID
 */
export const selectSelectedFieldId = (state: RootState): FieldIdLike | null =>
  state.formVersionBuilder.selectedFieldId;

/**
 * Selects the currently selected stage object
 */
export const selectSelectedStage = (state: RootState): UiStage | undefined => {
  const selectedId = state.formVersionBuilder.selectedStageId;
  if (!selectedId) return undefined;
  return state.formVersionBuilder.stages.find((s) => s.id === selectedId);
};

/**
 * Selects dirty flag
 */
export const selectBuilderDirty = (state: RootState): boolean =>
  state.formVersionBuilder.dirty;

/**
 * Selects saving flag
 */
export const selectBuilderSaving = (state: RootState): boolean =>
  state.formVersionBuilder.saving;

/**
 * Selects last saved timestamp
 */
export const selectBuilderLastSavedAt = (state: RootState): number | null =>
  state.formVersionBuilder.lastSavedAt;

/**
 * Selects save error
 */
export const selectBuilderSaveError = (state: RootState): ServiceError | null =>
  state.formVersionBuilder.saveError;

/**
 * Selects form version ID being edited
 */
export const selectBuilderFormVersionId = (state: RootState): number | null =>
  state.formVersionBuilder.formVersionId;

/**
 * Selects validation errors
 */
export const selectBuilderValidationErrors = (state: RootState): Record<string, string> =>
  state.formVersionBuilder.validationErrors;

/**
 * Selects whether there are any validation errors
 */
export const selectHasValidationErrors = (state: RootState): boolean =>
  Object.keys(state.formVersionBuilder.validationErrors).length > 0;

// ============================================================================
// Reducer Export
// ============================================================================

export default formVersionBuilderSlice.reducer;
