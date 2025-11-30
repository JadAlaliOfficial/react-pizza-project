/**
 * ================================
 * FORMS MODULE - Redux Slice
 * ================================
 * Manages all Forms-related state using Redux Toolkit.
 * - Uses createAsyncThunk for API operations
 * - Implements normalized state patterns for scalability
 * - Handles loading, success, and error states per operation
 * - Strongly typed with comprehensive TypeScript support
 */

import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import { FormsService } from '../services/api';
import type {
  Form,
  ListFormsQueryParams,
  CreateFormDto,
  UpdateFormDto,
  Pagination,
  Id,
  ApiError,
} from '../types';

/**
 * State shape for the Forms slice
 */
interface FormsState {
  // Normalized storage: Forms by ID for efficient lookups and updates
  formsById: Record<Id, Form>;
  // Ordered list of Form IDs (for rendering lists in correct order)
  formIds: Id[];
  // Pagination metadata
  pagination: Pagination | null;
  // Currently selected/viewed form (for detail views)
  selectedForm: Form | null;

  // Loading states per operation
  isListLoading: boolean;
  isGetLoading: boolean;
  isCreateLoading: boolean;
  isUpdateLoading: boolean;
  isArchiveLoading: boolean;
  isRestoreLoading: boolean;

  // Error states per operation (user-friendly messages)
  listError: string | null;
  getError: string | null;
  createError: string | null;
  updateError: string | null;
  archiveError: string | null;
  restoreError: string | null;

  // Success messages for user feedback
  createSuccess: string | null;
  updateSuccess: string | null;
  archiveSuccess: string | null;
  restoreSuccess: string | null;
}

/**
 * Initial state for Forms slice
 */
const initialState: FormsState = {
  formsById: {},
  formIds: [],
  pagination: null,
  selectedForm: null,

  isListLoading: false,
  isGetLoading: false,
  isCreateLoading: false,
  isUpdateLoading: false,
  isArchiveLoading: false,
  isRestoreLoading: false,

  listError: null,
  getError: null,
  createError: null,
  updateError: null,
  archiveError: null,
  restoreError: null,

  createSuccess: null,
  updateSuccess: null,
  archiveSuccess: null,
  restoreSuccess: null,
};

/**
 * ==========================
 * ASYNC THUNKS (API Actions)
 * ==========================
 */

/**
 * Fetch paginated list of forms with filters and sorting
 */
export const fetchForms = createAsyncThunk<
  { forms: Form[]; pagination: Pagination },
  ListFormsQueryParams | undefined,
  { rejectValue: ApiError }
>(
  'forms/fetchForms',
  async (params, { rejectWithValue }) => {
    try {
      console.debug('[formsSlice] fetchForms called with params:', params);
      const response = await FormsService.listForms(params);
      console.debug('[formsSlice] fetchForms success:', response);
      return {
        forms: response.data,
        pagination: response.pagination,
      };
    } catch (error) {
      console.error('[formsSlice] fetchForms error:', error);
      return rejectWithValue(error as ApiError);
    }
  }
);

/**
 * Fetch a single form by ID
 */
export const fetchFormById = createAsyncThunk<
  Form,
  Id,
  { rejectValue: ApiError }
>(
  'forms/fetchFormById',
  async (id, { rejectWithValue }) => {
    try {
      console.debug(`[formsSlice] fetchFormById called with ID: ${id}`);
      const response = await FormsService.getForm(id);
      console.debug('[formsSlice] fetchFormById success:', response);
      return response.data;
    } catch (error) {
      console.error('[formsSlice] fetchFormById error:', error);
      return rejectWithValue(error as ApiError);
    }
  }
);

/**
 * Create a new form
 */
export const createForm = createAsyncThunk<
  Form,
  CreateFormDto,
  { rejectValue: ApiError }
>(
  'forms/createForm',
  async (data, { rejectWithValue }) => {
    try {
      console.debug('[formsSlice] createForm called with data:', data);
      const response = await FormsService.createForm(data);
      console.debug('[formsSlice] createForm success:', response);
      return response.data;
    } catch (error) {
      console.error('[formsSlice] createForm error:', error);
      return rejectWithValue(error as ApiError);
    }
  }
);

/**
 * Update an existing form
 */
export const updateForm = createAsyncThunk<
  Form,
  { id: Id; data: UpdateFormDto },
  { rejectValue: ApiError }
>(
  'forms/updateForm',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      console.debug(`[formsSlice] updateForm called for ID ${id} with data:`, data);
      const response = await FormsService.updateForm(id, data);
      console.debug('[formsSlice] updateForm success:', response);
      return response.data;
    } catch (error) {
      console.error('[formsSlice] updateForm error:', error);
      return rejectWithValue(error as ApiError);
    }
  }
);

/**
 * Archive a form
 */
export const archiveForm = createAsyncThunk<
  { id: Id; message: string },
  Id,
  { rejectValue: ApiError }
>(
  'forms/archiveForm',
  async (id, { rejectWithValue }) => {
    try {
      console.debug(`[formsSlice] archiveForm called for ID: ${id}`);
      const response = await FormsService.archiveForm(id);
      console.debug('[formsSlice] archiveForm success:', response);
      return { id, message: response.message };
    } catch (error) {
      console.error('[formsSlice] archiveForm error:', error);
      return rejectWithValue(error as ApiError);
    }
  }
);

/**
 * Restore an archived form
 */
export const restoreForm = createAsyncThunk<
  { id: Id; message: string },
  Id,
  { rejectValue: ApiError }
>(
  'forms/restoreForm',
  async (id, { rejectWithValue }) => {
    try {
      console.debug(`[formsSlice] restoreForm called for ID: ${id}`);
      const response = await FormsService.restoreForm(id);
      console.debug('[formsSlice] restoreForm success:', response);
      return { id, message: response.message };
    } catch (error) {
      console.error('[formsSlice] restoreForm error:', error);
      return rejectWithValue(error as ApiError);
    }
  }
);

/**
 * ==========================
 * SLICE DEFINITION
 * ==========================
 */

const formsSlice = createSlice({
  name: 'forms',
  initialState,
  reducers: {
    /**
     * Clear all error messages (useful after displaying errors to user)
     */
    clearErrors(state) {
      state.listError = null;
      state.getError = null;
      state.createError = null;
      state.updateError = null;
      state.archiveError = null;
      state.restoreError = null;
    },

    /**
     * Clear all success messages (useful after displaying toasts)
     */
    clearSuccessMessages(state) {
      state.createSuccess = null;
      state.updateSuccess = null;
      state.archiveSuccess = null;
      state.restoreSuccess = null;
    },

    /**
     * Clear selected form (useful when navigating away from detail view)
     */
    clearSelectedForm(state) {
      state.selectedForm = null;
    },

    /**
     * Manually set selected form (useful for optimistic updates or caching)
     */
    setSelectedForm(state, action: PayloadAction<Form>) {
      state.selectedForm = action.payload;
    },
  },
  extraReducers: (builder) => {
    /**
     * ===========================
     * FETCH FORMS (LIST)
     * ===========================
     */
    builder.addCase(fetchForms.pending, (state) => {
      console.debug('[formsSlice] fetchForms.pending');
      state.isListLoading = true;
      state.listError = null;
    });
    builder.addCase(fetchForms.fulfilled, (state, action) => {
      console.debug('[formsSlice] fetchForms.fulfilled with payload:', action.payload);
      state.isListLoading = false;
      state.listError = null;

      // Normalize forms by ID for efficient updates
      const formsById: Record<Id, Form> = {};
      const formIds: Id[] = [];

      action.payload.forms.forEach((form) => {
        formsById[form.id] = form;
        formIds.push(form.id);
      });

      state.formsById = formsById;
      state.formIds = formIds;
      state.pagination = action.payload.pagination;
    });
    builder.addCase(fetchForms.rejected, (state, action) => {
      console.error('[formsSlice] fetchForms.rejected with error:', action.payload);
      state.isListLoading = false;
      state.listError = action.payload?.message || 'Failed to fetch forms';
    });

    /**
     * ===========================
     * FETCH FORM BY ID
     * ===========================
     */
    builder.addCase(fetchFormById.pending, (state) => {
      console.debug('[formsSlice] fetchFormById.pending');
      state.isGetLoading = true;
      state.getError = null;
    });
    builder.addCase(fetchFormById.fulfilled, (state, action) => {
      console.debug('[formsSlice] fetchFormById.fulfilled with payload:', action.payload);
      state.isGetLoading = false;
      state.getError = null;
      state.selectedForm = action.payload;

      // Also update in normalized store if it exists there
      if (state.formsById[action.payload.id]) {
        state.formsById[action.payload.id] = action.payload;
      }
    });
    builder.addCase(fetchFormById.rejected, (state, action) => {
      console.error('[formsSlice] fetchFormById.rejected with error:', action.payload);
      state.isGetLoading = false;
      state.getError = action.payload?.message || 'Failed to fetch form details';
    });

    /**
     * ===========================
     * CREATE FORM
     * ===========================
     */
    builder.addCase(createForm.pending, (state) => {
      console.debug('[formsSlice] createForm.pending');
      state.isCreateLoading = true;
      state.createError = null;
      state.createSuccess = null;
    });
    builder.addCase(createForm.fulfilled, (state, action) => {
      console.debug('[formsSlice] createForm.fulfilled with payload:', action.payload);
      state.isCreateLoading = false;
      state.createError = null;
      state.createSuccess = 'Form created successfully';

      // Add new form to normalized store
      const newForm = action.payload;
      state.formsById[newForm.id] = newForm;
      state.formIds.unshift(newForm.id); // Add to beginning of list

      // Set as selected form for immediate navigation to detail view
      state.selectedForm = newForm;
    });
    builder.addCase(createForm.rejected, (state, action) => {
      console.error('[formsSlice] createForm.rejected with error:', action.payload);
      state.isCreateLoading = false;
      state.createError = action.payload?.message || 'Failed to create form';
      state.createSuccess = null;
    });

    /**
     * ===========================
     * UPDATE FORM
     * ===========================
     */
    builder.addCase(updateForm.pending, (state) => {
      console.debug('[formsSlice] updateForm.pending');
      state.isUpdateLoading = true;
      state.updateError = null;
      state.updateSuccess = null;
    });
    builder.addCase(updateForm.fulfilled, (state, action) => {
      console.debug('[formsSlice] updateForm.fulfilled with payload:', action.payload);
      state.isUpdateLoading = false;
      state.updateError = null;
      state.updateSuccess = 'Form updated successfully';

      // Update form in normalized store
      const updatedForm = action.payload;
      state.formsById[updatedForm.id] = updatedForm;

      // Update selected form if it's the one being updated
      if (state.selectedForm?.id === updatedForm.id) {
        state.selectedForm = updatedForm;
      }
    });
    builder.addCase(updateForm.rejected, (state, action) => {
      console.error('[formsSlice] updateForm.rejected with error:', action.payload);
      state.isUpdateLoading = false;
      state.updateError = action.payload?.message || 'Failed to update form';
      state.updateSuccess = null;
    });

    /**
     * ===========================
     * ARCHIVE FORM
     * ===========================
     */
    builder.addCase(archiveForm.pending, (state) => {
      console.debug('[formsSlice] archiveForm.pending');
      state.isArchiveLoading = true;
      state.archiveError = null;
      state.archiveSuccess = null;
    });
    builder.addCase(archiveForm.fulfilled, (state, action) => {
      console.debug('[formsSlice] archiveForm.fulfilled with payload:', action.payload);
      state.isArchiveLoading = false;
      state.archiveError = null;
      state.archiveSuccess = action.payload.message;

      // Mark form as archived in normalized store
      const formId = action.payload.id;
      if (state.formsById[formId]) {
        state.formsById[formId].is_archived = true;
      }

      // Update selected form if it's the archived one
      if (state.selectedForm?.id === formId) {
        state.selectedForm.is_archived = true;
      }
    });
    builder.addCase(archiveForm.rejected, (state, action) => {
      console.error('[formsSlice] archiveForm.rejected with error:', action.payload);
      state.isArchiveLoading = false;
      state.archiveError = action.payload?.message || 'Failed to archive form';
      state.archiveSuccess = null;
    });

    /**
     * ===========================
     * RESTORE FORM
     * ===========================
     */
    builder.addCase(restoreForm.pending, (state) => {
      console.debug('[formsSlice] restoreForm.pending');
      state.isRestoreLoading = true;
      state.restoreError = null;
      state.restoreSuccess = null;
    });
    builder.addCase(restoreForm.fulfilled, (state, action) => {
      console.debug('[formsSlice] restoreForm.fulfilled with payload:', action.payload);
      state.isRestoreLoading = false;
      state.restoreError = null;
      state.restoreSuccess = action.payload.message;

      // Mark form as not archived in normalized store
      const formId = action.payload.id;
      if (state.formsById[formId]) {
        state.formsById[formId].is_archived = false;
      }

      // Update selected form if it's the restored one
      if (state.selectedForm?.id === formId) {
        state.selectedForm.is_archived = false;
      }
    });
    builder.addCase(restoreForm.rejected, (state, action) => {
      console.error('[formsSlice] restoreForm.rejected with error:', action.payload);
      state.isRestoreLoading = false;
      state.restoreError = action.payload?.message || 'Failed to restore form';
      state.restoreSuccess = null;
    });
  },
});

/**
 * Export actions for use in components
 */
export const {
  clearErrors,
  clearSuccessMessages,
  clearSelectedForm,
  setSelectedForm,
} = formsSlice.actions;

/**
 * Export reducer for store configuration
 */
export default formsSlice.reducer;

/**
 * ==========================
 * SELECTORS
 * ==========================
 * Memoized selectors for efficient state access
 */

/**
 * Select all forms as an array (in correct order)
 */
export const selectAllForms = (state: { forms: FormsState }): Form[] => {
  return state.forms.formIds.map((id) => state.forms.formsById[id]);
};

/**
 * Select a form by ID
 */
export const selectFormById = (state: { forms: FormsState }, id: Id): Form | undefined => {
  return state.forms.formsById[id];
};

/**
 * Select pagination metadata
 */
export const selectPagination = (state: { forms: FormsState }): Pagination | null => {
  return state.forms.pagination;
};

/**
 * Select currently selected/viewed form
 */
export const selectSelectedForm = (state: { forms: FormsState }): Form | null => {
  return state.forms.selectedForm;
};
