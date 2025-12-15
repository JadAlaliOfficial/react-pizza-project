// formVersion.slice.ts

/**
 * Production-ready Redux Toolkit slice for Form Version state management
 * Implements normalized state structure with comprehensive async thunk handling
 */

import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '@/store';
import type {
  FormVersionState,
  FormVersion,
  Stage,
  StageTransition,
  ServiceError,
  UpdateFormVersionRequest,
} from '../types';
import {
  getFormVersion,
  updateFormVersion,
  publishFormVersion,
  createFormVersion,
} from '../services/api';

// ============================================================================
// Initial State
// ============================================================================

/**
 * Initial state for form version slice
 * Scalable normalized structure for efficient lookups and updates
 */
const initialState: FormVersionState = {
  current: null,
  stages: [],
  stageTransitions: [],
  loading: {
    fetch: false,
    update: false,
    publish: false,
  },
  errors: {
    fetch: null,
    update: null,
    publish: null,
  },
  lastFetched: null,
};

// ============================================================================
// Async Thunks
// ============================================================================

/**
 * Fetches a form version by ID
 * 
 * @param {number} id - Form version ID
 * @returns {Promise<FormVersion>} Complete form version with nested data
 * 
 * @example
 * dispatch(fetchFormVersionById(4));
 */
export const fetchFormVersionById = createAsyncThunk<
  FormVersion,
  number,
  { rejectValue: ServiceError }
>(
  'formVersion/fetchById',
  async (id: number, { rejectWithValue }) => {
    try {
      console.debug(`[FormVersionSlice] Fetching form version with ID: ${id}`);
      const data = await getFormVersion(id);
      console.info(`[FormVersionSlice] Successfully fetched form version ${id}`);
      return data;
    } catch (error) {
      const serviceError = error as ServiceError;
      console.error(
        `[FormVersionSlice] Fetch failed for ID ${id}:`,
        serviceError.message
      );
      return rejectWithValue(serviceError);
    }
  }
);

/**
 * Updates a form version with new configuration
 * 
 * @param {Object} params - Update parameters
 * @param {number} params.id - Form version ID
 * @param {UpdateFormVersionRequest} params.data - Updated stages and transitions
 * @returns {Promise<{id: number, data: UpdateFormVersionRequest}>} Updated data with ID
 * 
 * @example
 * dispatch(updateFormVersionById({
 *   id: 4,
 *   data: { stages: [...], stage_transitions: [...] }
 * }));
 */
export const updateFormVersionById = createAsyncThunk<
  { id: number; data: UpdateFormVersionRequest },
  { id: number; data: UpdateFormVersionRequest },
  { rejectValue: ServiceError }
>(
  'formVersion/updateById',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      console.debug(
        `[FormVersionSlice] Updating form version ${id} with ` +
        `${data.stages.length} stages, ${data.stage_transitions.length} transitions`
      );
      
      const result = await updateFormVersion(id, data);
      
      console.info(`[FormVersionSlice] Successfully updated form version ${id}`);
      
      // Return both ID and data for proper state update
      return { id, data: result };
    } catch (error) {
      const serviceError = error as ServiceError;
      console.error(
        `[FormVersionSlice] Update failed for ID ${id}:`,
        serviceError.message
      );
      return rejectWithValue(serviceError);
    }
  }
);

/**
 * Publishes a draft form version, making it live
 * 
 * @param {number} id - Form version ID
 * @returns {Promise<{id: number, status: string, published_at: string}>} Published metadata
 * 
 * @example
 * dispatch(publishFormVersionById(4));
 */
export const publishFormVersionById = createAsyncThunk<
  { id: number; status: string; published_at: string; version_number: number },
  number,
  { rejectValue: ServiceError }
>(
  'formVersion/publishById',
  async (id: number, { rejectWithValue }) => {
    try {
      console.debug(`[FormVersionSlice] Publishing form version ${id}`);
      
      const data = await publishFormVersion(id);
      
      console.info(
        `[FormVersionSlice] Successfully published form version ${id} ` +
        `at ${data.published_at}`
      );
      
      return {
        id: data.id,
        status: data.status,
        published_at: data.published_at,
        version_number: data.version_number,
      };
    } catch (error) {
      const serviceError = error as ServiceError;
      console.error(
        `[FormVersionSlice] Publish failed for ID ${id}:`,
        serviceError.message
      );
      return rejectWithValue(serviceError);
    }
  }
);

/**
 * Creates a new form version for a given form ID
 * 
 * @param formId - Parent form ID
 * @returns Newly created form version
 */
export const createFormVersionByFormId = createAsyncThunk<
  FormVersion,
  { formId: number; copy_from_current?: boolean },
  { rejectValue: ServiceError }
>(
  'formVersion/createByFormId',
  async ({ formId, copy_from_current }, { rejectWithValue }) => {
    try {
      console.debug(`[FormVersionSlice] Creating new version for form ${formId}`);
      const data = await createFormVersion(formId, { copy_from_current });
      console.info(
        `[FormVersionSlice] Created version ${data.id} (#${data.version_number}) for form ${formId}`
      );
      return data;
    } catch (error) {
      const serviceError = error as ServiceError;
      console.error(
        `[FormVersionSlice] Create version failed for form ${formId}:`,
        serviceError.message
      );
      return rejectWithValue(serviceError);
    }
  }
);

// ============================================================================
// Slice Definition
// ============================================================================

/**
 * Form Version slice with reducers and extra reducers for async operations
 */
const formVersionSlice = createSlice({
  name: 'formVersion',
  initialState,
  reducers: {
    /**
     * Clears all form version state and resets to initial values
     */
    clearFormVersion: (state) => {
      console.debug('[FormVersionSlice] Clearing form version state');
      state.current = null;
      state.stages = [];
      state.stageTransitions = [];
      state.errors = {
        fetch: null,
        update: null,
        publish: null,
      };
      state.lastFetched = null;
    },

    /**
     * Clears a specific error type
     * @param {PayloadAction<'fetch' | 'update' | 'publish'>} action - Error type to clear
     */
    clearError: (state, action: PayloadAction<'fetch' | 'update' | 'publish'>) => {
      console.debug(`[FormVersionSlice] Clearing ${action.payload} error`);
      state.errors[action.payload] = null;
    },

    /**
     * Manually updates stages in state (optimistic update support)
     * @param {PayloadAction<Stage[]>} action - New stages array
     */
    updateStages: (state, action: PayloadAction<Stage[]>) => {
      console.debug(
        `[FormVersionSlice] Manually updating ${action.payload.length} stages`
      );
      state.stages = action.payload;
      
      // Update current if it exists
      if (state.current) {
        state.current.stages = action.payload;
      }
    },

    /**
     * Manually updates stage transitions in state
     * @param {PayloadAction<StageTransition[]>} action - New transitions array
     */
    updateStageTransitions: (state, action: PayloadAction<StageTransition[]>) => {
      console.debug(
        `[FormVersionSlice] Manually updating ${action.payload.length} transitions`
      );
      state.stageTransitions = action.payload;
      
      // Update current if it exists
      if (state.current) {
        state.current.stage_transitions = action.payload;
      }
    },
  },
  extraReducers: (builder) => {
    // ========================================================================
    // Fetch Form Version
    // ========================================================================
    builder.addCase(fetchFormVersionById.pending, (state) => {
      console.debug('[FormVersionSlice] Fetch pending');
      state.loading.fetch = true;
      state.errors.fetch = null;
    });

    builder.addCase(fetchFormVersionById.fulfilled, (state, action) => {
      console.info(
        `[FormVersionSlice] Fetch fulfilled for version ${action.payload.id}`
      );
      
      state.loading.fetch = false;
      state.current = action.payload;
      
      // Normalize stages and transitions for quick access
      state.stages = action.payload.stages || [];
      state.stageTransitions = action.payload.stage_transitions || [];
      
      state.lastFetched = Date.now();
      state.errors.fetch = null;
    });

    builder.addCase(fetchFormVersionById.rejected, (state, action) => {
      console.error('[FormVersionSlice] Fetch rejected:', action.payload?.message);
      
      state.loading.fetch = false;
      state.errors.fetch = action.payload || {
        message: 'Failed to fetch form version',
      };
    });

    // ========================================================================
    // Update Form Version
    // ========================================================================
    builder.addCase(updateFormVersionById.pending, (state) => {
      console.debug('[FormVersionSlice] Update pending');
      state.loading.update = true;
      state.errors.update = null;
    });

    builder.addCase(updateFormVersionById.fulfilled, (state, action) => {
      console.info(
        `[FormVersionSlice] Update fulfilled for version ${action.payload.id}`
      );
      
      state.loading.update = false;
      
      // Update normalized state
      state.stages = action.payload.data.stages;
      state.stageTransitions = action.payload.data.stage_transitions as unknown as StageTransition[];
      
      // Update current version if it exists and matches ID
      if (state.current && state.current.id === action.payload.id) {
        state.current = {
          ...state.current,
          stages: action.payload.data.stages,
          stage_transitions: action.payload.data.stage_transitions as unknown as StageTransition[],
          updated_at: new Date().toISOString(),
        };
      }
      
      state.errors.update = null;
    });

    builder.addCase(updateFormVersionById.rejected, (state, action) => {
      console.error('[FormVersionSlice] Update rejected:', action.payload?.message);
      
      state.loading.update = false;
      state.errors.update = action.payload || {
        message: 'Failed to update form version',
      };
    });

    // ========================================================================
    // Publish Form Version
    // ========================================================================
    builder.addCase(publishFormVersionById.pending, (state) => {
      console.debug('[FormVersionSlice] Publish pending');
      state.loading.publish = true;
      state.errors.publish = null;
    });

    builder.addCase(publishFormVersionById.fulfilled, (state, action) => {
      console.info(
        `[FormVersionSlice] Publish fulfilled for version ${action.payload.id}`
      );
      
      state.loading.publish = false;
      
      // Update current version status and published_at if it matches
      if (state.current && state.current.id === action.payload.id) {
        state.current = {
          ...state.current,
          status: 'published',
          published_at: action.payload.published_at,
          updated_at: new Date().toISOString(),
        };
      }
      
      state.errors.publish = null;
    });

    builder.addCase(publishFormVersionById.rejected, (state, action) => {
      console.error('[FormVersionSlice] Publish rejected:', action.payload?.message);
      
      state.loading.publish = false;
      state.errors.publish = action.payload || {
        message: 'Failed to publish form version',
      };
    });

    // ========================================================================
    // Create Form Version for Form
    // ========================================================================
    builder.addCase(createFormVersionByFormId.fulfilled, (state, action) => {
      // Set newly created version as current for immediate editing
      state.current = action.payload;
      state.stages = action.payload.stages || [];
      state.stageTransitions = action.payload.stage_transitions || [];
      state.lastFetched = Date.now();
    });
  },
});

// ============================================================================
// Actions Export
// ============================================================================

export const {
  clearFormVersion,
  clearError,
  updateStages,
  updateStageTransitions,
} = formVersionSlice.actions;

// ============================================================================
// Selectors
// ============================================================================

/**
 * Selects the current form version
 */
export const selectCurrentFormVersion = (state: RootState): FormVersion | null =>
  state.formVersion.current;

/**
 * Selects all stages from current form version
 */
export const selectStages = (state: RootState): Stage[] =>
  state.formVersion.stages;

/**
 * Selects all stage transitions from current form version
 */
export const selectStageTransitions = (state: RootState): StageTransition[] =>
  state.formVersion.stageTransitions;

/**
 * Selects the initial stage (is_initial = true)
 */
export const selectInitialStage = (state: RootState): Stage | undefined =>
  state.formVersion.stages.find((stage) => stage.is_initial);

/**
 * Selects stages by ID (memoized lookup helper)
 * @param {number} stageId - Stage ID to find
 */
export const selectStageById = (stageId: number) => (state: RootState): Stage | undefined =>
  state.formVersion.stages.find((stage) => stage.id === stageId);

/**
 * Selects all loading states
 */
export const selectFormVersionLoading = (state: RootState) =>
  state.formVersion.loading;

/**
 * Selects if any operation is currently loading
 */
export const selectIsAnyLoading = (state: RootState): boolean => {
  const { fetch, update, publish } = state.formVersion.loading;
  return fetch || update || publish;
};

/**
 * Selects all error states
 */
export const selectFormVersionErrors = (state: RootState) =>
  state.formVersion.errors;

/**
 * Selects if any error exists
 */
export const selectHasAnyError = (state: RootState): boolean => {
  const { fetch, update, publish } = state.formVersion.errors;
  return fetch !== null || update !== null || publish !== null;
};

/**
 * Selects last fetched timestamp
 */
export const selectLastFetched = (state: RootState): number | null =>
  state.formVersion.lastFetched;

/**
 * Selects form version status
 */
export const selectFormVersionStatus = (state: RootState): string | null =>
  state.formVersion.current?.status || null;

/**
 * Selects if form version is published
 */
export const selectIsPublished = (state: RootState): boolean =>
  state.formVersion.current?.status === 'published';

/**
 * Selects if form version is draft
 */
export const selectIsDraft = (state: RootState): boolean =>
  state.formVersion.current?.status === 'draft';

// ============================================================================
// Reducer Export
// ============================================================================

export default formVersionSlice.reducer;
