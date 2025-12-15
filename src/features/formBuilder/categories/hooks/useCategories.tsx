/**
 * ================================
 * CATEGORIES MODULE - Custom React Hooks
 * ================================
 * Provides clean, reusable hooks for Categories operations.
 * Each hook encapsulates Redux state, dispatch logic, and error handling.
 * Designed for easy consumption in React components.
 */

import { useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '@/store'; // Adjust path to your store types
import {
  fetchCategories,
  fetchCategoryById,
  createCategory,
  updateCategory,
  assignFormsToCategory,
  unassignFormsFromCategory,
  deleteCategory,
  clearErrors,
  clearSuccessMessages,
  clearSelectedCategory,
  selectAllCategories,
  selectSelectedCategory,
} from '../store/categoriesSlice';
import type {
  Category,
  CreateCategoryDto,
  UpdateCategoryDto,
  AssignFormsToCategoryDto,
  UnassignFormsFromCategoryDto,
  Id,
} from '../types';

/**
 * ================================
 * useListCategories Hook
 * ================================
 * Fetches and manages list of all categories (no pagination).
 * 
 * @param autoFetch - Whether to automatically fetch on mount (default: true)
 * @returns Object containing categories data, loading state, error, and refetch function
 */
export const useListCategories = (autoFetch: boolean = true) => {
  const dispatch = useDispatch<AppDispatch>();

  // Select state from Redux
  const categories = useSelector(selectAllCategories);
  const isLoading = useSelector((state: RootState) => state.categories.isListLoading);
  const error = useSelector((state: RootState) => state.categories.listError);

  /**
   * Fetch categories
   */
  const fetchData = useCallback(() => {
    console.debug('[useListCategories] Fetching categories');
    dispatch(fetchCategories());
  }, [dispatch]);

  /**
   * Refetch function for manual refresh
   */
  const refetch = useCallback(() => {
    console.debug('[useListCategories] Manual refetch triggered');
    dispatch(clearErrors());
    fetchData();
  }, [dispatch, fetchData]);

  /**
   * Clear errors manually
   */
  const clearError = useCallback(() => {
    dispatch(clearErrors());
  }, [dispatch]);

  // Auto-fetch on mount if enabled
  useEffect(() => {
    if (autoFetch) {
      console.debug('[useListCategories] Auto-fetching on mount');
      fetchData();
    }
  }, [autoFetch, fetchData]);

  return {
    /** Array of all categories */
    categories,
    /** Loading state */
    isLoading,
    /** Error message (user-friendly string or null) */
    error,
    /** Function to manually refetch data */
    refetch,
    /** Function to clear error state */
    clearError,
  };
};

/**
 * ================================
 * useGetCategory Hook
 * ================================
 * Fetches a single category by ID with full details.
 * 
 * @param id - Category ID to fetch (null to skip fetching)
 * @param autoFetch - Whether to automatically fetch on mount (default: true)
 * @returns Object containing category data, loading state, error, and refetch function
 */
export const useGetCategory = (
  id: Id | null,
  autoFetch: boolean = true
) => {
  const dispatch = useDispatch<AppDispatch>();

  // Select state from Redux
  const category = useSelector(selectSelectedCategory);
  const isLoading = useSelector((state: RootState) => state.categories.isGetLoading);
  const error = useSelector((state: RootState) => state.categories.getError);

  /**
   * Fetch category by ID
   */
  const fetchData = useCallback(() => {
    if (id === null) {
      console.warn('[useGetCategory] ID is null, skipping fetch');
      return;
    }
    console.debug(`[useGetCategory] Fetching category with ID: ${id}`);
    dispatch(fetchCategoryById(id));
  }, [dispatch, id]);

  /**
   * Refetch function for manual refresh
   */
  const refetch = useCallback(() => {
    console.debug('[useGetCategory] Manual refetch triggered');
    dispatch(clearErrors());
    fetchData();
  }, [dispatch, fetchData]);

  /**
   * Clear the selected category (useful when navigating away)
   */
  const clearCategory = useCallback(() => {
    console.debug('[useGetCategory] Clearing selected category');
    dispatch(clearSelectedCategory());
  }, [dispatch]);

  /**
   * Clear error manually
   */
  const clearError = useCallback(() => {
    dispatch(clearErrors());
  }, [dispatch]);

  // Auto-fetch on mount or when ID changes
  useEffect(() => {
    if (autoFetch && id !== null) {
      console.debug(`[useGetCategory] Auto-fetching for ID: ${id}`);
      fetchData();
    }

    // Cleanup: clear selected category when component unmounts
    return () => {
      dispatch(clearSelectedCategory());
    };
  }, [autoFetch, id, fetchData, dispatch]);

  return {
    /** The fetched category (or null if not loaded) */
    category,
    /** Loading state */
    isLoading,
    /** Error message (user-friendly string or null) */
    error,
    /** Function to manually refetch data */
    refetch,
    /** Function to clear the selected category */
    clearCategory,
    /** Function to clear error state */
    clearError,
  };
};

/**
 * ================================
 * useCreateCategory Hook
 * ================================
 * Handles category creation with loading/error states and success feedback.
 * 
 * @returns Object containing create function, loading state, error, and success message
 */
export const useCreateCategory = () => {
  const dispatch = useDispatch<AppDispatch>();

  // Select state from Redux
  const isLoading = useSelector((state: RootState) => state.categories.isCreateLoading);
  const error = useSelector((state: RootState) => state.categories.createError);
  const successMessage = useSelector((state: RootState) => state.categories.createSuccess);
  const createdCategory = useSelector(selectSelectedCategory); // The newly created category

  /**
   * Create a new category
   * @param data - Category data (name)
   * @returns Promise that resolves to the created category or rejects with error
   */
  const create = useCallback(
    async (data: CreateCategoryDto): Promise<Category> => {
      console.debug('[useCreateCategory] Creating category with data:', data);
      const resultAction = await dispatch(createCategory(data));

      if (createCategory.fulfilled.match(resultAction)) {
        console.debug('[useCreateCategory] Category created successfully:', resultAction.payload);
        return resultAction.payload;
      } else {
        const errorMessage = resultAction.payload?.message || 'Failed to create category';
        console.error('[useCreateCategory] Create failed:', errorMessage);
        throw new Error(errorMessage);
      }
    },
    [dispatch]
  );

  /**
   * Clear error message
   */
  const clearError = useCallback(() => {
    dispatch(clearErrors());
  }, [dispatch]);

  /**
   * Clear success message
   */
  const clearSuccess = useCallback(() => {
    dispatch(clearSuccessMessages());
  }, [dispatch]);

  return {
    /** Function to create a category */
    create,
    /** Loading state */
    isLoading,
    /** Error message (user-friendly string or null) */
    error,
    /** Success message (user-friendly string or null) */
    successMessage,
    /** The newly created category (if successful) */
    createdCategory,
    /** Function to clear error state */
    clearError,
    /** Function to clear success message */
    clearSuccess,
  };
};

/**
 * ================================
 * useUpdateCategory Hook
 * ================================
 * Handles category updates with loading/error states and success feedback.
 * 
 * @returns Object containing update function, loading state, error, and success message
 */
export const useUpdateCategory = () => {
  const dispatch = useDispatch<AppDispatch>();

  // Select state from Redux
  const isLoading = useSelector((state: RootState) => state.categories.isUpdateLoading);
  const error = useSelector((state: RootState) => state.categories.updateError);
  const successMessage = useSelector((state: RootState) => state.categories.updateSuccess);

  /**
   * Update an existing category
   * @param id - Category ID to update
   * @param data - Updated category data (name)
   * @returns Promise that resolves to the updated category or rejects with error
   */
  const update = useCallback(
    async (id: Id, data: UpdateCategoryDto): Promise<Category> => {
      console.debug(`[useUpdateCategory] Updating category ID ${id} with data:`, data);
      const resultAction = await dispatch(updateCategory({ id, data }));

      if (updateCategory.fulfilled.match(resultAction)) {
        console.debug('[useUpdateCategory] Category updated successfully:', resultAction.payload);
        return resultAction.payload;
      } else {
        const errorMessage = resultAction.payload?.message || 'Failed to update category';
        console.error('[useUpdateCategory] Update failed:', errorMessage);
        throw new Error(errorMessage);
      }
    },
    [dispatch]
  );

  /**
   * Clear error message
   */
  const clearError = useCallback(() => {
    dispatch(clearErrors());
  }, [dispatch]);

  /**
   * Clear success message
   */
  const clearSuccess = useCallback(() => {
    dispatch(clearSuccessMessages());
  }, [dispatch]);

  return {
    /** Function to update a category */
    update,
    /** Loading state */
    isLoading,
    /** Error message (user-friendly string or null) */
    error,
    /** Success message (user-friendly string or null) */
    successMessage,
    /** Function to clear error state */
    clearError,
    /** Function to clear success message */
    clearSuccess,
  };
};

/**
 * ================================
 * useAssignFormsToCategory Hook
 * ================================
 * Handles assigning forms to a category with loading/error states and success feedback.
 * 
 * @returns Object containing assign function, loading state, error, and success message
 */
export const useAssignFormsToCategory = () => {
  const dispatch = useDispatch<AppDispatch>();

  // Select state from Redux
  const isLoading = useSelector((state: RootState) => state.categories.isAssignLoading);
  const error = useSelector((state: RootState) => state.categories.assignError);
  const successMessage = useSelector((state: RootState) => state.categories.assignSuccess);

  /**
   * Assign forms to a category
   * @param data - AssignFormsToCategoryDto with category_id and form_ids
   * @returns Promise that resolves with success message or rejects with error
   */
  const assign = useCallback(
    async (data: AssignFormsToCategoryDto): Promise<string> => {
      console.debug('[useAssignFormsToCategory] Assigning forms with data:', data);
      const resultAction = await dispatch(assignFormsToCategory(data));

      if (assignFormsToCategory.fulfilled.match(resultAction)) {
        console.debug('[useAssignFormsToCategory] Forms assigned successfully:', resultAction.payload.message);
        return resultAction.payload.message;
      } else {
        const errorMessage = resultAction.payload?.message || 'Failed to assign forms to category';
        console.error('[useAssignFormsToCategory] Assign failed:', errorMessage);
        throw new Error(errorMessage);
      }
    },
    [dispatch]
  );

  /**
   * Clear error message
   */
  const clearError = useCallback(() => {
    dispatch(clearErrors());
  }, [dispatch]);

  /**
   * Clear success message
   */
  const clearSuccess = useCallback(() => {
    dispatch(clearSuccessMessages());
  }, [dispatch]);

  return {
    /** Function to assign forms to a category */
    assign,
    /** Loading state */
    isLoading,
    /** Error message (user-friendly string or null) */
    error,
    /** Success message (user-friendly string or null) */
    successMessage,
    /** Function to clear error state */
    clearError,
    /** Function to clear success message */
    clearSuccess,
  };
};

/**
 * ================================
 * useUnassignFormsFromCategory Hook
 * ================================
 * Handles unassigning forms from categories with loading/error states and success feedback.
 * 
 * @returns Object containing unassign function, loading state, error, and success message
 */
export const useUnassignFormsFromCategory = () => {
  const dispatch = useDispatch<AppDispatch>();

  // Select state from Redux
  const isLoading = useSelector((state: RootState) => state.categories.isUnassignLoading);
  const error = useSelector((state: RootState) => state.categories.unassignError);
  const successMessage = useSelector((state: RootState) => state.categories.unassignSuccess);

  /**
   * Unassign forms from their categories
   * @param data - UnassignFormsFromCategoryDto with form_ids
   * @returns Promise that resolves with success message or rejects with error
   */
  const unassign = useCallback(
    async (data: UnassignFormsFromCategoryDto): Promise<string> => {
      console.debug('[useUnassignFormsFromCategory] Unassigning forms with data:', data);
      const resultAction = await dispatch(unassignFormsFromCategory(data));

      if (unassignFormsFromCategory.fulfilled.match(resultAction)) {
        console.debug('[useUnassignFormsFromCategory] Forms unassigned successfully:', resultAction.payload.message);
        return resultAction.payload.message;
      } else {
        const errorMessage = resultAction.payload?.message || 'Failed to unassign forms from category';
        console.error('[useUnassignFormsFromCategory] Unassign failed:', errorMessage);
        throw new Error(errorMessage);
      }
    },
    [dispatch]
  );

  /**
   * Clear error message
   */
  const clearError = useCallback(() => {
    dispatch(clearErrors());
  }, [dispatch]);

  /**
   * Clear success message
   */
  const clearSuccess = useCallback(() => {
    dispatch(clearSuccessMessages());
  }, [dispatch]);

  return {
    /** Function to unassign forms from categories */
    unassign,
    /** Loading state */
    isLoading,
    /** Error message (user-friendly string or null) */
    error,
    /** Success message (user-friendly string or null) */
    successMessage,
    /** Function to clear error state */
    clearError,
    /** Function to clear success message */
    clearSuccess,
  };
};

/**
 * ================================
 * useDeleteCategory Hook
 * ================================
 * Handles category deletion with loading/error states and success feedback.
 * 
 * @returns Object containing delete function, loading state, error, and success message
 */
export const useDeleteCategory = () => {
  const dispatch = useDispatch<AppDispatch>();

  // Select state from Redux
  const isLoading = useSelector((state: RootState) => state.categories.isDeleteLoading);
  const error = useSelector((state: RootState) => state.categories.deleteError);
  const successMessage = useSelector((state: RootState) => state.categories.deleteSuccess);

  /**
   * Delete a category by ID
   * @param id - Category ID to delete
   * @returns Promise that resolves with success message or rejects with error
   */
  const remove = useCallback(
    async (id: Id): Promise<string> => {
      console.debug(`[useDeleteCategory] Deleting category ID: ${id}`);
      const resultAction = await dispatch(deleteCategory(id));

      if (deleteCategory.fulfilled.match(resultAction)) {
        console.debug('[useDeleteCategory] Category deleted successfully:', resultAction.payload.message);
        return resultAction.payload.message;
      } else {
        const errorMessage = resultAction.payload?.message || 'Failed to delete category';
        console.error('[useDeleteCategory] Delete failed:', errorMessage);
        throw new Error(errorMessage);
      }
    },
    [dispatch]
  );

  /**
   * Clear error message
   */
  const clearError = useCallback(() => {
    dispatch(clearErrors());
  }, [dispatch]);

  /**
   * Clear success message
   */
  const clearSuccess = useCallback(() => {
    dispatch(clearSuccessMessages());
  }, [dispatch]);

  return {
    /** Function to delete a category */
    remove,
    /** Loading state */
    isLoading,
    /** Error message (user-friendly string or null) */
    error,
    /** Success message (user-friendly string or null) */
    successMessage,
    /** Function to clear error state */
    clearError,
    /** Function to clear success message */
    clearSuccess,
  };
};
