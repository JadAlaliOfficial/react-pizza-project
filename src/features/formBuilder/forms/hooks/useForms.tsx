/**
 * ================================
 * FORMS MODULE - Custom React Hooks
 * ================================
 * Provides clean, reusable hooks for Forms operations.
 * Each hook encapsulates Redux state, dispatch logic, and error handling.
 * Designed for easy consumption in React components.
 */

import { useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '@/store'; // Adjust path to your store types
import {
  fetchForms,
  fetchFormById,
  createForm,
  updateForm,
  archiveForm,
  restoreForm,
  clearErrors,
  clearSuccessMessages,
  clearSelectedForm,
  selectAllForms,
  selectPagination,
  selectSelectedForm,
} from '../store/formsSlice';
import type {
  Form,
  ListFormsQueryParams,
  CreateFormDto,
  UpdateFormDto,
  Id,
} from '../types';

/**
 * ================================
 * useListForms Hook
 * ================================
 * Fetches and manages paginated list of forms with filters and sorting.
 * 
 * @param params - Optional query parameters for filtering/sorting
 * @param autoFetch - Whether to automatically fetch on mount (default: true)
 * @returns Object containing forms data, loading state, error, and refetch function
 */
export const useListForms = (
  params?: ListFormsQueryParams,
  autoFetch: boolean = true
) => {
  const dispatch = useDispatch<AppDispatch>();

  // Select state from Redux
  const forms = useSelector(selectAllForms);
  const pagination = useSelector(selectPagination);
  const isLoading = useSelector((state: RootState) => state.forms.isListLoading);
  const error = useSelector((state: RootState) => state.forms.listError);

  /**
   * Fetch forms with current params
   */
  const fetchData = useCallback(() => {
    console.debug('[useListForms] Fetching forms with params:', params);
    dispatch(fetchForms(params));
  }, [dispatch, params]);

  /**
   * Refetch function for manual refresh
   */
  const refetch = useCallback(() => {
    console.debug('[useListForms] Manual refetch triggered');
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
      console.debug('[useListForms] Auto-fetching on mount');
      fetchData();
    }
  }, [autoFetch, fetchData]);

  return {
    /** Array of forms for current page */
    forms,
    /** Pagination metadata */
    pagination,
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
 * useGetForm Hook
 * ================================
 * Fetches a single form by ID with full details.
 * 
 * @param id - Form ID to fetch (null to skip fetching)
 * @param autoFetch - Whether to automatically fetch on mount (default: true)
 * @returns Object containing form data, loading state, error, and refetch function
 */
export const useGetForm = (
  id: Id | null,
  autoFetch: boolean = true
) => {
  const dispatch = useDispatch<AppDispatch>();

  // Select state from Redux
  const form = useSelector(selectSelectedForm);
  const isLoading = useSelector((state: RootState) => state.forms.isGetLoading);
  const error = useSelector((state: RootState) => state.forms.getError);

  /**
   * Fetch form by ID
   */
  const fetchData = useCallback(() => {
    if (id === null) {
      console.warn('[useGetForm] ID is null, skipping fetch');
      return;
    }
    console.debug(`[useGetForm] Fetching form with ID: ${id}`);
    dispatch(fetchFormById(id));
  }, [dispatch, id]);

  /**
   * Refetch function for manual refresh
   */
  const refetch = useCallback(() => {
    console.debug('[useGetForm] Manual refetch triggered');
    dispatch(clearErrors());
    fetchData();
  }, [dispatch, fetchData]);

  /**
   * Clear the selected form (useful when navigating away)
   */
  const clearForm = useCallback(() => {
    console.debug('[useGetForm] Clearing selected form');
    dispatch(clearSelectedForm());
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
      console.debug(`[useGetForm] Auto-fetching for ID: ${id}`);
      fetchData();
    }

    // Cleanup: clear selected form when component unmounts
    return () => {
      dispatch(clearSelectedForm());
    };
  }, [autoFetch, id, fetchData, dispatch]);

  return {
    /** The fetched form (or null if not loaded) */
    form,
    /** Loading state */
    isLoading,
    /** Error message (user-friendly string or null) */
    error,
    /** Function to manually refetch data */
    refetch,
    /** Function to clear the selected form */
    clearForm,
    /** Function to clear error state */
    clearError,
  };
};

/**
 * ================================
 * useCreateForm Hook
 * ================================
 * Handles form creation with loading/error states and success feedback.
 * 
 * @returns Object containing create function, loading state, error, and success message
 */
export const useCreateForm = () => {
  const dispatch = useDispatch<AppDispatch>();

  // Select state from Redux
  const isLoading = useSelector((state: RootState) => state.forms.isCreateLoading);
  const error = useSelector((state: RootState) => state.forms.createError);
  const successMessage = useSelector((state: RootState) => state.forms.createSuccess);
  const createdForm = useSelector(selectSelectedForm); // The newly created form

  /**
   * Create a new form
   * @param data - Form data (name and category_id)
   * @returns Promise that resolves to the created form or rejects with error
   */
  const create = useCallback(
    async (data: CreateFormDto): Promise<Form> => {
      console.debug('[useCreateForm] Creating form with data:', data);
      const resultAction = await dispatch(createForm(data));

      if (createForm.fulfilled.match(resultAction)) {
        console.debug('[useCreateForm] Form created successfully:', resultAction.payload);
        return resultAction.payload;
      } else {
        const errorMessage = resultAction.payload?.message || 'Failed to create form';
        console.error('[useCreateForm] Create failed:', errorMessage);
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
    /** Function to create a form */
    create,
    /** Loading state */
    isLoading,
    /** Error message (user-friendly string or null) */
    error,
    /** Success message (user-friendly string or null) */
    successMessage,
    /** The newly created form (if successful) */
    createdForm,
    /** Function to clear error state */
    clearError,
    /** Function to clear success message */
    clearSuccess,
  };
};

/**
 * ================================
 * useUpdateForm Hook
 * ================================
 * Handles form updates with loading/error states and success feedback.
 * 
 * @returns Object containing update function, loading state, error, and success message
 */
export const useUpdateForm = () => {
  const dispatch = useDispatch<AppDispatch>();

  // Select state from Redux
  const isLoading = useSelector((state: RootState) => state.forms.isUpdateLoading);
  const error = useSelector((state: RootState) => state.forms.updateError);
  const successMessage = useSelector((state: RootState) => state.forms.updateSuccess);

  /**
   * Update an existing form
   * @param id - Form ID to update
   * @param data - Updated form data (name and category_id)
   * @returns Promise that resolves to the updated form or rejects with error
   */
  const update = useCallback(
    async (id: Id, data: UpdateFormDto): Promise<Form> => {
      console.debug(`[useUpdateForm] Updating form ID ${id} with data:`, data);
      const resultAction = await dispatch(updateForm({ id, data }));

      if (updateForm.fulfilled.match(resultAction)) {
        console.debug('[useUpdateForm] Form updated successfully:', resultAction.payload);
        return resultAction.payload;
      } else {
        const errorMessage = resultAction.payload?.message || 'Failed to update form';
        console.error('[useUpdateForm] Update failed:', errorMessage);
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
    /** Function to update a form */
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
 * useArchiveForm Hook
 * ================================
 * Handles form archiving with loading/error states and success feedback.
 * 
 * @returns Object containing archive function, loading state, error, and success message
 */
export const useArchiveForm = () => {
  const dispatch = useDispatch<AppDispatch>();

  // Select state from Redux
  const isLoading = useSelector((state: RootState) => state.forms.isArchiveLoading);
  const error = useSelector((state: RootState) => state.forms.archiveError);
  const successMessage = useSelector((state: RootState) => state.forms.archiveSuccess);

  /**
   * Archive a form by ID
   * @param id - Form ID to archive
   * @returns Promise that resolves with success message or rejects with error
   */
  const archive = useCallback(
    async (id: Id): Promise<string> => {
      console.debug(`[useArchiveForm] Archiving form ID: ${id}`);
      const resultAction = await dispatch(archiveForm(id));

      if (archiveForm.fulfilled.match(resultAction)) {
        console.debug('[useArchiveForm] Form archived successfully:', resultAction.payload.message);
        return resultAction.payload.message;
      } else {
        const errorMessage = resultAction.payload?.message || 'Failed to archive form';
        console.error('[useArchiveForm] Archive failed:', errorMessage);
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
    /** Function to archive a form */
    archive,
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
 * useRestoreForm Hook
 * ================================
 * Handles form restoration with loading/error states and success feedback.
 * 
 * @returns Object containing restore function, loading state, error, and success message
 */
export const useRestoreForm = () => {
  const dispatch = useDispatch<AppDispatch>();

  // Select state from Redux
  const isLoading = useSelector((state: RootState) => state.forms.isRestoreLoading);
  const error = useSelector((state: RootState) => state.forms.restoreError);
  const successMessage = useSelector((state: RootState) => state.forms.restoreSuccess);

  /**
   * Restore an archived form by ID
   * @param id - Form ID to restore
   * @returns Promise that resolves with success message or rejects with error
   */
  const restore = useCallback(
    async (id: Id): Promise<string> => {
      console.debug(`[useRestoreForm] Restoring form ID: ${id}`);
      const resultAction = await dispatch(restoreForm(id));

      if (restoreForm.fulfilled.match(resultAction)) {
        console.debug('[useRestoreForm] Form restored successfully:', resultAction.payload.message);
        return resultAction.payload.message;
      } else {
        const errorMessage = resultAction.payload?.message || 'Failed to restore form';
        console.error('[useRestoreForm] Restore failed:', errorMessage);
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
    /** Function to restore a form */
    restore,
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
