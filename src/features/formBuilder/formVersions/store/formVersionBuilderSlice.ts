// src/features/formVersion/store/formVersionBuilderSlice.ts

/**
 * Core Redux slice for Form Version Builder
 * Manages initialization, save operations, and shared state
 * Combines stage and section sub-slices for modular architecture
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
  UiSection,
  UiField,
  UiStageTransition,
  StageIdLike,
  SectionIdLike,
  FieldIdLike,
} from '../types/formVersion.ui-types';
import { mapFormVersionToUi, buildUpdateFormVersionRequest } from '../utils/formVersion.mappers';
import { updateFormVersion } from '../services/api';
import { stageReducers, stageExtraReducers } from './formVersionBuilder.stages';
import { sectionReducers } from './formVersionBuilder.sections';

// ============================================================================
// State Type
// ============================================================================

/**
 * Builder state structure
 * Holds the draft configuration being edited by the user
 */
export interface FormVersionBuilderState {
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

export const initialState: FormVersionBuilderState = {
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
// Helper Functions
// ============================================================================

/**
 * Parses stage ID from string to appropriate type
 * Handles both numeric IDs and fake IDs
 */
export function parseStageId(idString: string): StageIdLike {
  if (idString.startsWith('FAKE_')) {
    return idString as StageIdLike;
  }
  return parseInt(idString, 10);
}

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
    // ========================================================================
    // Core Actions
    // ========================================================================

    /**
     * Initializes builder from an existing FormVersion
     * Converts API types to UI types using mapper
     * Automatically selects the first stage if available
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

      // Auto-select first stage if available and no stage is selected
      if (stages.length > 0 && !state.selectedStageId) {
        state.selectedStageId = stages[0].id;
        console.debug(`[FormVersionBuilderSlice] Auto-selected first stage: ${stages[0].id}`);
      }

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

    // ========================================================================
    // Selection Actions
    // ========================================================================

    /**
     * Sets selected stage ID
     * Handles both string (from Select component) and direct ID values
     * Clears section/field selection when stage changes
     */
    setSelectedStageId: (state, action: PayloadAction<StageIdLike | string | null>) => {
      const newStageId = action.payload;
      
      if (newStageId === null) {
        console.debug('[FormVersionBuilderSlice] Clearing selected stage');
        state.selectedStageId = null;
        state.selectedSectionId = null;
        state.selectedFieldId = null;
        return;
      }

      // Parse string to appropriate type (number or FakeId)
      const parsedId = typeof newStageId === 'string' ? parseStageId(newStageId) : newStageId;
      
      console.debug(`[FormVersionBuilderSlice] Setting selected stage: ${parsedId}`);
      
      // Only clear selections if stage actually changed
      if (state.selectedStageId !== parsedId) {
        state.selectedStageId = parsedId;
        state.selectedSectionId = null;
        state.selectedFieldId = null;
      }
    },

    /**
     * Sets selected section ID
     */
    setSelectedSectionId: (state, action: PayloadAction<SectionIdLike | null>) => {
      console.debug(`[FormVersionBuilderSlice] Setting selected section: ${action.payload}`);
      state.selectedSectionId = action.payload;
      // Clear field selection when section changes
      if (action.payload !== state.selectedSectionId) {
        state.selectedFieldId = null;
      }
    },

    /**
     * Sets selected field ID
     */
    setSelectedFieldId: (state, action: PayloadAction<FieldIdLike | null>) => {
      console.debug(`[FormVersionBuilderSlice] Setting selected field: ${action.payload}`);
      state.selectedFieldId = action.payload;
    },

    // ========================================================================
    // Utility Actions
    // ========================================================================

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

    // Import stage reducers
    ...stageReducers,

    // Import section reducers (includes field reducers)
    ...sectionReducers,
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

    // Add stage-specific extra reducers
    stageExtraReducers(builder);
  },
});

// ============================================================================
// Actions Export
// ============================================================================

export const {
  initializeFromFormVersion,
  resetBuilder,
  setSelectedStageId,
  setSelectedSectionId,
  setSelectedFieldId,
  setDirty,
  clearSaveError,
  setValidationErrors,
  clearValidationErrors,
  // Stage actions
  setStages,
  updateStage,
  addStage,
  removeStage,
  setStageTransitions,
  addStageTransition,
  removeStageTransition,
  // Section actions
  addSection,
  updateSection,
  removeSection,
  reorderSections,
  // Field actions (from section reducers)
  addField,
  updateField,
  removeField,
  reorderFields,
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
 * Selects all sections from a specific stage
 */
export const selectSectionsByStageId = (stageId: StageIdLike | null) => (
  state: RootState
): UiSection[] => {
  if (!stageId) return [];
  const stage = state.formVersionBuilder.stages.find((s) => s.id === stageId);
  return stage?.sections || [];
};

/**
 * Selects a specific section by stage ID and section ID
 */
export const selectSectionById = (stageId: StageIdLike | null, sectionId: SectionIdLike | null) => (
  state: RootState
): UiSection | undefined => {
  if (!stageId || !sectionId) return undefined;
  const stage = state.formVersionBuilder.stages.find((s) => s.id === stageId);
  return stage?.sections.find((sec) => sec.id === sectionId);
};

/**
 * Selects all fields from a specific section
 */
export const selectFieldsBySectionId = (stageId: StageIdLike | null, sectionId: SectionIdLike | null) => (
  state: RootState
): UiField[] => {
  if (!stageId || !sectionId) return [];
  const stage = state.formVersionBuilder.stages.find((s) => s.id === stageId);
  const section = stage?.sections.find((sec) => sec.id === sectionId);
  return section?.fields || [];
};

/**
 * Selects a specific field by IDs
 */
export const selectFieldById = (
  stageId: StageIdLike | null,
  sectionId: SectionIdLike | null,
  fieldId: FieldIdLike | null
) => (state: RootState): UiField | undefined => {
  if (!stageId || !sectionId || !fieldId) return undefined;
  const stage = state.formVersionBuilder.stages.find((s) => s.id === stageId);
  const section = stage?.sections.find((sec) => sec.id === sectionId);
  return section?.fields.find((f) => f.id === fieldId);
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
 * Selects the currently selected section object
 */
export const selectSelectedSection = (state: RootState): UiSection | undefined => {
  const selectedStageId = state.formVersionBuilder.selectedStageId;
  const selectedSectionId = state.formVersionBuilder.selectedSectionId;
  if (!selectedStageId || !selectedSectionId) return undefined;
  
  const stage = state.formVersionBuilder.stages.find((s) => s.id === selectedStageId);
  return stage?.sections.find((sec) => sec.id === selectedSectionId);
};

/**
 * Selects the currently selected field object
 */
export const selectSelectedField = (state: RootState): UiField | undefined => {
  const selectedStageId = state.formVersionBuilder.selectedStageId;
  const selectedSectionId = state.formVersionBuilder.selectedSectionId;
  const selectedFieldId = state.formVersionBuilder.selectedFieldId;
  if (!selectedStageId || !selectedSectionId || !selectedFieldId) return undefined;
  
  const stage = state.formVersionBuilder.stages.find((s) => s.id === selectedStageId);
  const section = stage?.sections.find((sec) => sec.id === selectedSectionId);
  return section?.fields.find((f) => f.id === selectedFieldId);
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
