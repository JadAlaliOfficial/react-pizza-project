// formVersion.hooks.ts

/**
 * Production-ready custom React hooks for Form Version operations
 * Provides ergonomic interface for components with automatic state management
 */

import { useEffect, useCallback, useMemo, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch } from '@/store';
import {
  fetchFormVersionById,
  updateFormVersionById,
  publishFormVersionById,
  clearFormVersion,
  clearError,
  selectCurrentFormVersion,
  selectStages,
  selectStageTransitions,
  selectFormVersionLoading,
  selectFormVersionErrors,
  selectIsPublished,
  selectIsDraft,
} from '../store/formVersionsSlice';
import type {
  UseFormVersionReturn,
  UseUpdateFormVersionReturn,
  UsePublishFormVersionReturn,
  UpdateFormVersionRequest,
  FormVersion,
  Stage,
  StageTransition,
  ServiceError,
} from '../types';
import { createFormVersionByFormId } from '../store/formVersionsSlice';

// ============================================================================
// useFormVersion Hook
// ============================================================================

/**
 * Hook to fetch and manage a form version by ID
 * Automatically fetches data when ID changes and handles cleanup on unmount
 * 
 * @param {number | null} id - Form version ID to fetch (null to skip fetching)
 * @param {Object} options - Configuration options
 * @param {boolean} options.refetchOnMount - Whether to refetch on mount even if data exists
 * @param {number} options.cacheTimeout - Cache validity duration in ms (default: 5 minutes)
 * @returns {UseFormVersionReturn} Form version data, loading state, and refetch function
 * 
 * @example
 * const { formVersion, stages, loading, error, refetch } = useFormVersion(4);
 * 
 * if (loading) return <Spinner />;
 * if (error) return <Error message={error.message} />;
 * 
 * return <FormBuilder stages={stages} onSave={refetch} />;
 */
export const useFormVersion = (
  id: number | null,
  options: {
    refetchOnMount?: boolean;
    cacheTimeout?: number;
  } = {}
): UseFormVersionReturn => {
  const dispatch = useDispatch<AppDispatch>();
  
  // Configuration with defaults
  const { refetchOnMount = false, cacheTimeout = 5 * 60 * 1000 } = options;

  // Select state from Redux
  const formVersion = useSelector(selectCurrentFormVersion);
  const stages = useSelector(selectStages);
  const stageTransitions = useSelector(selectStageTransitions);
  const loading = useSelector(selectFormVersionLoading);
  const errors = useSelector(selectFormVersionErrors);

  // Track if we've already fetched to prevent double-fetch on mount
  const hasFetchedRef = useRef(false);
  const previousIdRef = useRef<number | null>(null);

  /**
   * Memoized refetch function to manually trigger data fetch
   */
  const refetch = useCallback(async () => {
    if (id === null) {
      console.warn('[useFormVersion] Cannot refetch: ID is null');
      return;
    }

    console.debug(`[useFormVersion] Manual refetch requested for ID: ${id}`);
    
    try {
      await dispatch(fetchFormVersionById(id)).unwrap();
      console.info(`[useFormVersion] Refetch successful for ID: ${id}`);
    } catch (error) {
      console.error(`[useFormVersion] Refetch failed for ID: ${id}:`, error);
      // Error is already in Redux state, no need to throw
    }
  }, [id, dispatch]);

  /**
   * Effect to fetch form version when ID changes
   */
  useEffect(() => {
    // Skip if no ID provided
    if (id === null) {
      console.debug('[useFormVersion] Skipping fetch: ID is null');
      return;
    }

    // Check if ID changed
    const idChanged = previousIdRef.current !== id;
    previousIdRef.current = id;

    // Determine if we should fetch
    const shouldFetch =
      idChanged || // ID changed
      refetchOnMount || // Explicitly requested refetch on mount
      !formVersion || // No data exists
      formVersion.id !== id; // Data is for different ID

    if (!shouldFetch && hasFetchedRef.current) {
      console.debug(
        `[useFormVersion] Skipping fetch for ID ${id}: Data already loaded`
      );
      return;
    }

    // Check cache validity if data exists
    if (formVersion && formVersion.id === id && !refetchOnMount) {
      const now = Date.now();
      const lastFetched = formVersion.updated_at
        ? new Date(formVersion.updated_at).getTime()
        : 0;
      
      const isCacheValid = now - lastFetched < cacheTimeout;
      
      if (isCacheValid) {
        console.debug(
          `[useFormVersion] Using cached data for ID ${id} ` +
          `(age: ${Math.round((now - lastFetched) / 1000)}s)`
        );
        hasFetchedRef.current = true;
        return;
      }
    }

    console.info(`[useFormVersion] Fetching form version with ID: ${id}`);
    hasFetchedRef.current = true;

    dispatch(fetchFormVersionById(id))
      .unwrap()
      .then(() => {
        console.info(`[useFormVersion] Successfully loaded form version ${id}`);
      })
      .catch((error: ServiceError) => {
        console.error(
          `[useFormVersion] Failed to load form version ${id}:`,
          error.message
        );
      });
  }, [id, dispatch, formVersion, refetchOnMount, cacheTimeout]);

  /**
   * Cleanup effect to clear state on unmount
   */
  useEffect(() => {
    return () => {
      console.debug('[useFormVersion] Component unmounting, clearing state');
      dispatch(clearFormVersion());
      hasFetchedRef.current = false;
      previousIdRef.current = null;
    };
  }, [dispatch]);

  // Memoized return value to prevent unnecessary rerenders
  return useMemo(
    () => ({
      formVersion,
      stages,
      stageTransitions,
      loading: loading.fetch,
      error: errors.fetch,
      refetch,
    }),
    [formVersion, stages, stageTransitions, loading.fetch, errors.fetch, refetch]
  );
};

// ============================================================================
// useUpdateFormVersion Hook
// ============================================================================

/**
 * Hook to update a form version with new configuration
 * Returns a callback function and loading/error states
 * 
 * @returns {UseUpdateFormVersionReturn} Update function, loading state, and error
 * 
 * @example
 * const { updateFormVersion, loading, error } = useUpdateFormVersion();
 * 
 * const handleSave = async () => {
 *   try {
 *     await updateFormVersion(4, {
 *       stages: [...],
 *       stage_transitions: [...]
 *     });
 *     toast.success('Form version updated successfully');
 *   } catch (err) {
 *     toast.error('Failed to update form version');
 *   }
 * };
 */
export const useUpdateFormVersion = (): UseUpdateFormVersionReturn => {
  const dispatch = useDispatch<AppDispatch>();
  
  // Select loading and error states
  const loading = useSelector(selectFormVersionLoading);
  const errors = useSelector(selectFormVersionErrors);

  // Track if component is mounted for safe async operations
  const isMountedRef = useRef(true);

  /**
   * Update function wrapped in useCallback for stability
   */
  const updateFormVersion = useCallback(
    async (id: number, data: UpdateFormVersionRequest): Promise<void> => {
      console.info(
        `[useUpdateFormVersion] Updating form version ${id} with ` +
        `${data.stages.length} stages and ${data.stage_transitions.length} transitions`
      );

      // Clear previous errors
      dispatch(clearError('update'));

      try {
        await dispatch(updateFormVersionById({ id, data })).unwrap();
        
        if (isMountedRef.current) {
          console.info(
            `[useUpdateFormVersion] Successfully updated form version ${id}`
          );
        }
      } catch (error) {
        if (isMountedRef.current) {
          const serviceError = error as ServiceError;
          console.error(
            `[useUpdateFormVersion] Update failed for ID ${id}:`,
            serviceError.message
          );
          throw serviceError;
        }
      }
    },
    [dispatch]
  );

  /**
   * Cleanup effect to track mount state
   */
  useEffect(() => {
    isMountedRef.current = true;
    
    return () => {
      isMountedRef.current = false;
      console.debug('[useUpdateFormVersion] Component unmounted');
    };
  }, []);

  // Memoized return value
  return useMemo(
    () => ({
      updateFormVersion,
      loading: loading.update,
      error: errors.update,
    }),
    [updateFormVersion, loading.update, errors.update]
  );
};

// ============================================================================
// usePublishFormVersion Hook
// ============================================================================

/**
 * Hook to publish a form version, making it live
 * Returns a callback function and loading/error states
 * 
 * @returns {UsePublishFormVersionReturn} Publish function, loading state, and error
 * 
 * @example
 * const { publishFormVersion, loading, error } = usePublishFormVersion();
 * 
 * const handlePublish = async () => {
 *   if (!confirm('Are you sure you want to publish this version?')) return;
 *   
 *   try {
 *     await publishFormVersion(4);
 *     toast.success('Form version published successfully');
 *     navigate('/forms');
 *   } catch (err) {
 *     toast.error('Failed to publish form version');
 *   }
 * };
 */
export const usePublishFormVersion = (): UsePublishFormVersionReturn => {
  const dispatch = useDispatch<AppDispatch>();
  
  // Select loading and error states
  const loading = useSelector(selectFormVersionLoading);
  const errors = useSelector(selectFormVersionErrors);

  // Track if component is mounted for safe async operations
  const isMountedRef = useRef(true);

  /**
   * Publish function wrapped in useCallback for stability
   */
  const publishFormVersion = useCallback(
    async (id: number): Promise<void> => {
      console.info(`[usePublishFormVersion] Publishing form version ${id}`);

      // Clear previous errors
      dispatch(clearError('publish'));

      try {
        await dispatch(publishFormVersionById(id)).unwrap();
        
        if (isMountedRef.current) {
          console.info(
            `[usePublishFormVersion] Successfully published form version ${id}`
          );
        }
      } catch (error) {
        if (isMountedRef.current) {
          const serviceError = error as ServiceError;
          console.error(
            `[usePublishFormVersion] Publish failed for ID ${id}:`,
            serviceError.message
          );
          throw serviceError;
        }
      }
    },
    [dispatch]
  );

  /**
   * Cleanup effect to track mount state
   */
  useEffect(() => {
    isMountedRef.current = true;
    
    return () => {
      isMountedRef.current = false;
      console.debug('[usePublishFormVersion] Component unmounted');
    };
  }, []);

  // Memoized return value
  return useMemo(
    () => ({
      publishFormVersion,
      loading: loading.publish,
      error: errors.publish,
    }),
    [publishFormVersion, loading.publish, errors.publish]
  );
};

/**
 * Hook to create a new form version for a given form
 * Returns a callback function and loading/error states
 */
export const useCreateFormVersion = () => {
  const dispatch = useDispatch<AppDispatch>();
  const loading = useSelector(selectFormVersionLoading);
  const errors = useSelector(selectFormVersionErrors);

  const createVersion = useCallback(
    async (
      formId: number,
      options?: { copy_from_current?: boolean }
    ): Promise<FormVersion> => {
      console.info(
        `[useCreateFormVersion] Creating version for form ${formId} (copy_from_current=${options?.copy_from_current ?? true})`
      );
      dispatch(clearError('fetch'));
      const result = await dispatch(
        createFormVersionByFormId({ formId, copy_from_current: options?.copy_from_current })
      ).unwrap();
      return result;
    },
    [dispatch]
  );

  return useMemo(
    () => ({
      createFormVersion: createVersion,
      loading: loading.fetch,
      error: errors.fetch,
    }),
    [createVersion, loading.fetch, errors.fetch]
  );
};

// ============================================================================
// Utility Hooks
// ============================================================================

/**
 * Hook to check if current form version is published
 * Useful for conditional rendering of publish/edit controls
 * 
 * @returns {boolean} True if current version is published
 * 
 * @example
 * const isPublished = useIsFormVersionPublished();
 * 
 * return (
 *   <Button disabled={isPublished}>
 *     {isPublished ? 'Published' : 'Publish'}
 *   </Button>
 * );
 */
export const useIsFormVersionPublished = (): boolean => {
  return useSelector(selectIsPublished);
};

/**
 * Hook to check if current form version is draft
 * Useful for conditional rendering of draft indicators
 * 
 * @returns {boolean} True if current version is draft
 * 
 * @example
 * const isDraft = useIsFormVersionDraft();
 * 
 * return isDraft && <Badge variant="warning">Draft</Badge>;
 */
export const useIsFormVersionDraft = (): boolean => {
  return useSelector(selectIsDraft);
};

/**
 * Hook to get all stages from current form version
 * Shorthand for useSelector(selectStages)
 * 
 * @returns {Stage[]} Array of stages
 * 
 * @example
 * const stages = useFormVersionStages();
 * 
 * return stages.map(stage => (
 *   <StageCard key={stage.id} stage={stage} />
 * ));
 */
export const useFormVersionStages = (): Stage[] => {
  return useSelector(selectStages);
};

/**
 * Hook to get all stage transitions from current form version
 * Shorthand for useSelector(selectStageTransitions)
 * 
 * @returns {StageTransition[]} Array of stage transitions
 * 
 * @example
 * const transitions = useFormVersionTransitions();
 * 
 * return <WorkflowDiagram transitions={transitions} />;
 */
export const useFormVersionTransitions = (): StageTransition[] => {
  return useSelector(selectStageTransitions);
};

/**
 * Hook to get current form version data
 * Shorthand for useSelector(selectCurrentFormVersion)
 * 
 * @returns {FormVersion | null} Current form version or null
 * 
 * @example
 * const formVersion = useCurrentFormVersion();
 * 
 * if (!formVersion) return <EmptyState />;
 * 
 * return <FormHeader name={formVersion.form?.name} />;
 */
export const useCurrentFormVersion = (): FormVersion | null => {
  return useSelector(selectCurrentFormVersion);
};
