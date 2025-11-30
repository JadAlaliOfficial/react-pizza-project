/**
 * ================================
 * CATEGORIES MODULE - Redux Slice
 * ================================
 * Manages all Categories-related state using Redux Toolkit.
 * - Uses createAsyncThunk for API operations
 * - Implements normalized state patterns for scalability
 * - Handles loading, success, and error states per operation
 * - Strongly typed with comprehensive TypeScript support
 */

import { createSlice, createAsyncThunk, type PayloadAction, createSelector } from '@reduxjs/toolkit';
import { CategoriesService } from '../services/api';
import type {
  Category,
  CreateCategoryDto,
  UpdateCategoryDto,
  AssignFormsToCategoryDto,
  UnassignFormsFromCategoryDto,
  Id,
  ApiError,
} from '../types';

/**
 * State shape for the Categories slice
 */
interface CategoriesState {
  // Normalized storage: Categories by ID for efficient lookups and updates
  categoriesById: Record<Id, Category>;
  // Ordered list of Category IDs (for rendering lists in correct order)
  categoryIds: Id[];
  // Currently selected/viewed category (for detail views)
  selectedCategory: Category | null;

  // Loading states per operation
  isListLoading: boolean;
  isGetLoading: boolean;
  isCreateLoading: boolean;
  isUpdateLoading: boolean;
  isAssignLoading: boolean;
  isUnassignLoading: boolean;
  isDeleteLoading: boolean;

  // Error states per operation (user-friendly messages)
  listError: string | null;
  getError: string | null;
  createError: string | null;
  updateError: string | null;
  assignError: string | null;
  unassignError: string | null;
  deleteError: string | null;

  // Success messages for user feedback
  createSuccess: string | null;
  updateSuccess: string | null;
  assignSuccess: string | null;
  unassignSuccess: string | null;
  deleteSuccess: string | null;
}

/**
 * Initial state for Categories slice
 */
const initialState: CategoriesState = {
  categoriesById: {},
  categoryIds: [],
  selectedCategory: null,

  isListLoading: false,
  isGetLoading: false,
  isCreateLoading: false,
  isUpdateLoading: false,
  isAssignLoading: false,
  isUnassignLoading: false,
  isDeleteLoading: false,

  listError: null,
  getError: null,
  createError: null,
  updateError: null,
  assignError: null,
  unassignError: null,
  deleteError: null,

  createSuccess: null,
  updateSuccess: null,
  assignSuccess: null,
  unassignSuccess: null,
  deleteSuccess: null,
};

/**
 * ==========================
 * ASYNC THUNKS (API Actions)
 * ==========================
 */

/**
 * Fetch all categories (no pagination)
 */
export const fetchCategories = createAsyncThunk<
  Category[],
  void,
  { rejectValue: ApiError }
>(
  'categories/fetchCategories',
  async (_, { rejectWithValue }) => {
    try {
      console.debug('[categoriesSlice] fetchCategories called');
      const response = await CategoriesService.listCategories();
      console.debug('[categoriesSlice] fetchCategories success:', response);
      return response.data;
    } catch (error) {
      console.error('[categoriesSlice] fetchCategories error:', error);
      return rejectWithValue(error as ApiError);
    }
  }
);

/**
 * Fetch a single category by ID
 */
export const fetchCategoryById = createAsyncThunk<
  Category,
  Id,
  { rejectValue: ApiError }
>(
  'categories/fetchCategoryById',
  async (id, { rejectWithValue }) => {
    try {
      console.debug(`[categoriesSlice] fetchCategoryById called with ID: ${id}`);
      const response = await CategoriesService.getCategory(id);
      console.debug('[categoriesSlice] fetchCategoryById success:', response);
      return response.data;
    } catch (error) {
      console.error('[categoriesSlice] fetchCategoryById error:', error);
      return rejectWithValue(error as ApiError);
    }
  }
);

/**
 * Create a new category
 */
export const createCategory = createAsyncThunk<
  Category,
  CreateCategoryDto,
  { rejectValue: ApiError }
>(
  'categories/createCategory',
  async (data, { rejectWithValue }) => {
    try {
      console.debug('[categoriesSlice] createCategory called with data:', data);
      const response = await CategoriesService.createCategory(data);
      console.debug('[categoriesSlice] createCategory success:', response);
      return response.data;
    } catch (error) {
      console.error('[categoriesSlice] createCategory error:', error);
      return rejectWithValue(error as ApiError);
    }
  }
);

/**
 * Update an existing category
 */
export const updateCategory = createAsyncThunk<
  Category,
  { id: Id; data: UpdateCategoryDto },
  { rejectValue: ApiError }
>(
  'categories/updateCategory',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      console.debug(`[categoriesSlice] updateCategory called for ID ${id} with data:`, data);
      const response = await CategoriesService.updateCategory(id, data);
      console.debug('[categoriesSlice] updateCategory success:', response);
      return response.data;
    } catch (error) {
      console.error('[categoriesSlice] updateCategory error:', error);
      return rejectWithValue(error as ApiError);
    }
  }
);

/**
 * Assign forms to a category
 */
export const assignFormsToCategory = createAsyncThunk<
  { message: string; data: AssignFormsToCategoryDto },
  AssignFormsToCategoryDto,
  { rejectValue: ApiError }
>(
  'categories/assignFormsToCategory',
  async (data, { rejectWithValue }) => {
    try {
      console.debug('[categoriesSlice] assignFormsToCategory called with data:', data);
      const response = await CategoriesService.assignFormsToCategory(data);
      console.debug('[categoriesSlice] assignFormsToCategory success:', response);
      return { message: response.message, data };
    } catch (error) {
      console.error('[categoriesSlice] assignFormsToCategory error:', error);
      return rejectWithValue(error as ApiError);
    }
  }
);

/**
 * Unassign forms from their categories
 */
export const unassignFormsFromCategory = createAsyncThunk<
  { message: string; form_ids: Id[] },
  UnassignFormsFromCategoryDto,
  { rejectValue: ApiError }
>(
  'categories/unassignFormsFromCategory',
  async (data, { rejectWithValue }) => {
    try {
      console.debug('[categoriesSlice] unassignFormsFromCategory called with data:', data);
      const response = await CategoriesService.unassignFormsFromCategory(data);
      console.debug('[categoriesSlice] unassignFormsFromCategory success:', response);
      return { message: response.message, form_ids: data.form_ids };
    } catch (error) {
      console.error('[categoriesSlice] unassignFormsFromCategory error:', error);
      return rejectWithValue(error as ApiError);
    }
  }
);

/**
 * Delete a category
 */
export const deleteCategory = createAsyncThunk<
  { id: Id; message: string },
  Id,
  { rejectValue: ApiError }
>(
  'categories/deleteCategory',
  async (id, { rejectWithValue }) => {
    try {
      console.debug(`[categoriesSlice] deleteCategory called for ID: ${id}`);
      const response = await CategoriesService.deleteCategory(id);
      console.debug('[categoriesSlice] deleteCategory success:', response);
      return { id, message: response.message };
    } catch (error) {
      console.error('[categoriesSlice] deleteCategory error:', error);
      return rejectWithValue(error as ApiError);
    }
  }
);

/**
 * ==========================
 * SLICE DEFINITION
 * ==========================
 */

const categoriesSlice = createSlice({
  name: 'categories',
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
      state.assignError = null;
      state.unassignError = null;
      state.deleteError = null;
    },

    /**
     * Clear all success messages (useful after displaying toasts)
     */
    clearSuccessMessages(state) {
      state.createSuccess = null;
      state.updateSuccess = null;
      state.assignSuccess = null;
      state.unassignSuccess = null;
      state.deleteSuccess = null;
    },

    /**
     * Clear selected category (useful when navigating away from detail view)
     */
    clearSelectedCategory(state) {
      state.selectedCategory = null;
    },

    /**
     * Manually set selected category (useful for optimistic updates or caching)
     */
    setSelectedCategory(state, action: PayloadAction<Category>) {
      state.selectedCategory = action.payload;
    },
  },
  extraReducers: (builder) => {
    /**
     * ===========================
     * FETCH CATEGORIES (LIST)
     * ===========================
     */
    builder.addCase(fetchCategories.pending, (state) => {
      console.debug('[categoriesSlice] fetchCategories.pending');
      state.isListLoading = true;
      state.listError = null;
    });
    builder.addCase(fetchCategories.fulfilled, (state, action) => {
      console.debug('[categoriesSlice] fetchCategories.fulfilled with payload:', action.payload);
      state.isListLoading = false;
      state.listError = null;

      // Normalize categories by ID for efficient updates
      const categoriesById: Record<Id, Category> = {};
      const categoryIds: Id[] = [];

      action.payload.forEach((category) => {
        categoriesById[category.id] = category;
        categoryIds.push(category.id);
      });

      state.categoriesById = categoriesById;
      state.categoryIds = categoryIds;
    });
    builder.addCase(fetchCategories.rejected, (state, action) => {
      console.error('[categoriesSlice] fetchCategories.rejected with error:', action.payload);
      state.isListLoading = false;
      state.listError = action.payload?.message || 'Failed to fetch categories';
    });

    /**
     * ===========================
     * FETCH CATEGORY BY ID
     * ===========================
     */
    builder.addCase(fetchCategoryById.pending, (state) => {
      console.debug('[categoriesSlice] fetchCategoryById.pending');
      state.isGetLoading = true;
      state.getError = null;
    });
    builder.addCase(fetchCategoryById.fulfilled, (state, action) => {
      console.debug('[categoriesSlice] fetchCategoryById.fulfilled with payload:', action.payload);
      state.isGetLoading = false;
      state.getError = null;
      state.selectedCategory = action.payload;

      // Also update in normalized store if it exists there
      if (state.categoriesById[action.payload.id]) {
        state.categoriesById[action.payload.id] = action.payload;
      }
    });
    builder.addCase(fetchCategoryById.rejected, (state, action) => {
      console.error('[categoriesSlice] fetchCategoryById.rejected with error:', action.payload);
      state.isGetLoading = false;
      state.getError = action.payload?.message || 'Failed to fetch category details';
    });

    /**
     * ===========================
     * CREATE CATEGORY
     * ===========================
     */
    builder.addCase(createCategory.pending, (state) => {
      console.debug('[categoriesSlice] createCategory.pending');
      state.isCreateLoading = true;
      state.createError = null;
      state.createSuccess = null;
    });
    builder.addCase(createCategory.fulfilled, (state, action) => {
      console.debug('[categoriesSlice] createCategory.fulfilled with payload:', action.payload);
      state.isCreateLoading = false;
      state.createError = null;
      state.createSuccess = 'Category created successfully';

      // Add new category to normalized store
      const newCategory = action.payload;
      state.categoriesById[newCategory.id] = newCategory;
      state.categoryIds.push(newCategory.id);

      // Set as selected category for immediate navigation to detail view
      state.selectedCategory = newCategory;
    });
    builder.addCase(createCategory.rejected, (state, action) => {
      console.error('[categoriesSlice] createCategory.rejected with error:', action.payload);
      state.isCreateLoading = false;
      state.createError = action.payload?.message || 'Failed to create category';
      state.createSuccess = null;
    });

    /**
     * ===========================
     * UPDATE CATEGORY
     * ===========================
     */
    builder.addCase(updateCategory.pending, (state) => {
      console.debug('[categoriesSlice] updateCategory.pending');
      state.isUpdateLoading = true;
      state.updateError = null;
      state.updateSuccess = null;
    });
    builder.addCase(updateCategory.fulfilled, (state, action) => {
      console.debug('[categoriesSlice] updateCategory.fulfilled with payload:', action.payload);
      state.isUpdateLoading = false;
      state.updateError = null;
      state.updateSuccess = 'Category updated successfully';

      // Update category in normalized store
      const updatedCategory = action.payload;
      state.categoriesById[updatedCategory.id] = updatedCategory;

      // Update selected category if it's the one being updated
      if (state.selectedCategory?.id === updatedCategory.id) {
        state.selectedCategory = updatedCategory;
      }
    });
    builder.addCase(updateCategory.rejected, (state, action) => {
      console.error('[categoriesSlice] updateCategory.rejected with error:', action.payload);
      state.isUpdateLoading = false;
      state.updateError = action.payload?.message || 'Failed to update category';
      state.updateSuccess = null;
    });

    /**
     * ===========================
     * ASSIGN FORMS TO CATEGORY
     * ===========================
     */
    builder.addCase(assignFormsToCategory.pending, (state) => {
      console.debug('[categoriesSlice] assignFormsToCategory.pending');
      state.isAssignLoading = true;
      state.assignError = null;
      state.assignSuccess = null;
    });
    builder.addCase(assignFormsToCategory.fulfilled, (state, action) => {
      console.debug('[categoriesSlice] assignFormsToCategory.fulfilled with payload:', action.payload);
      state.isAssignLoading = false;
      state.assignError = null;
      state.assignSuccess = action.payload.message;
    });
    builder.addCase(assignFormsToCategory.rejected, (state, action) => {
      console.error('[categoriesSlice] assignFormsToCategory.rejected with error:', action.payload);
      state.isAssignLoading = false;
      state.assignError = action.payload?.message || 'Failed to assign forms to category';
      state.assignSuccess = null;
    });

    /**
     * ===========================
     * UNASSIGN FORMS FROM CATEGORY
     * ===========================
     */
    builder.addCase(unassignFormsFromCategory.pending, (state) => {
      console.debug('[categoriesSlice] unassignFormsFromCategory.pending');
      state.isUnassignLoading = true;
      state.unassignError = null;
      state.unassignSuccess = null;
    });
    builder.addCase(unassignFormsFromCategory.fulfilled, (state, action) => {
      console.debug('[categoriesSlice] unassignFormsFromCategory.fulfilled with payload:', action.payload);
      state.isUnassignLoading = false;
      state.unassignError = null;
      state.unassignSuccess = action.payload.message;
    });
    builder.addCase(unassignFormsFromCategory.rejected, (state, action) => {
      console.error('[categoriesSlice] unassignFormsFromCategory.rejected with error:', action.payload);
      state.isUnassignLoading = false;
      state.unassignError = action.payload?.message || 'Failed to unassign forms from category';
      state.unassignSuccess = null;
    });

    /**
     * ===========================
     * DELETE CATEGORY
     * ===========================
     */
    builder.addCase(deleteCategory.pending, (state) => {
      console.debug('[categoriesSlice] deleteCategory.pending');
      state.isDeleteLoading = true;
      state.deleteError = null;
      state.deleteSuccess = null;
    });
    builder.addCase(deleteCategory.fulfilled, (state, action) => {
      console.debug('[categoriesSlice] deleteCategory.fulfilled with payload:', action.payload);
      state.isDeleteLoading = false;
      state.deleteError = null;
      state.deleteSuccess = action.payload.message;

      // Remove category from normalized store
      const categoryId = action.payload.id;
      delete state.categoriesById[categoryId];
      state.categoryIds = state.categoryIds.filter((id) => id !== categoryId);

      // Clear selected category if it's the deleted one
      if (state.selectedCategory?.id === categoryId) {
        state.selectedCategory = null;
      }
    });
    builder.addCase(deleteCategory.rejected, (state, action) => {
      console.error('[categoriesSlice] deleteCategory.rejected with error:', action.payload);
      state.isDeleteLoading = false;
      state.deleteError = action.payload?.message || 'Failed to delete category';
      state.deleteSuccess = null;
    });
  },
});

/**
 * Export actions for use in components
 */
export const {
  clearErrors,
  clearSuccessMessages,
  clearSelectedCategory,
  setSelectedCategory,
} = categoriesSlice.actions;

/**
 * Export reducer for store configuration
 */
export default categoriesSlice.reducer;

/**
 * ==========================
 * SELECTORS
 * ==========================
 * Memoized selectors for efficient state access
 */

/**
 * Select all categories as an array (in correct order)
 */
import type { RootState } from '@/store';

const selectCatagoriesState = (state: RootState) => state.catagories;

export const selectAllCategories = createSelector(
  [selectCatagoriesState],
  (catagories): Category[] => catagories.categoryIds.map((id) => catagories.categoriesById[id])
);

/**
 * Select a category by ID
 */
export const selectCategoryById = createSelector(
  [selectCatagoriesState, (_: RootState, id: Id) => id],
  (catagories, id): Category | undefined => catagories.categoriesById[id]
);

/**
 * Select currently selected/viewed category
 */
export const selectSelectedCategory = createSelector(
  [selectCatagoriesState],
  (catagories): Category | null => catagories.selectedCategory
);
