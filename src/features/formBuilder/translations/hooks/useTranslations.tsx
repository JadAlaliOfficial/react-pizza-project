// translations.hooks.ts

/**
 * React hooks for translations feature.
 * Provides convenient access to translations state and operations.
 *
 * These hooks abstract Redux complexity and provide a clean API for components.
 *
 * UPDATED: Compatible with nested original/translated structure for stages, sections, transitions, and fields
 */

import { useCallback, useMemo, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '@/store';
import {
  fetchAvailableLanguages,
  fetchLocalizableData,
  saveTranslations,
  clearAllErrors,
  clearLanguagesError,
  clearLocalizableDataError,
  clearSaveError,
  resetSaveStatus,
  clearLocalizableDataCache,
  updateFieldTranslationInCache,
  updateStageTranslationInCache,
  updateSectionTranslationInCache,
  updateTransitionTranslationInCache,
  updateFormNameInCache,
  selectLanguages,
  selectLanguagesLoaded,
  selectLocalizableDataByKey,
  selectIsLoadingLanguages,
  selectIsLoadingLocalizableData,
  selectIsSaving,
  selectLanguagesError,
  selectLocalizableDataError,
  selectSaveError,
  selectLastSaveSuccess,
  selectLastSaveTimestamp,
} from '../store/translationsSlice';
import type {
  SaveTranslationsPayload,
  LocalizableDataCacheKey,
} from '../types';

// ============================================================================
// Hook: useTranslationsLanguages
// ============================================================================

/**
 * Hook for managing available translation languages.
 *
 * Features:
 * - Auto-fetch on mount (configurable)
 * - Loading state tracking
 * - Error handling
 * - Manual refetch capability
 *
 * @param options - Configuration options
 * @param options.autoFetch - Whether to automatically fetch languages on mount (default: true)
 * @returns Languages data and control methods
 */
export const useTranslationsLanguages = (
  options: { autoFetch?: boolean } = {},
) => {
  const { autoFetch = true } = options;
  const dispatch = useDispatch<AppDispatch>();

  const languages = useSelector((state: RootState) => selectLanguages(state));
  const languagesLoaded = useSelector((state: RootState) =>
    selectLanguagesLoaded(state),
  );
  const isLoading = useSelector((state: RootState) =>
    selectIsLoadingLanguages(state),
  );
  const error = useSelector((state: RootState) => selectLanguagesError(state));

  const fetchLanguages = useCallback(() => {
    console.log('[useTranslationsLanguages] Fetching languages...');
    return dispatch(fetchAvailableLanguages());
  }, [dispatch]);

  const clearError = useCallback(() => {
    console.log('[useTranslationsLanguages] Clearing error');
    dispatch(clearLanguagesError());
  }, [dispatch]);

  useEffect(() => {
    if (autoFetch && !languagesLoaded && !isLoading) {
      console.log(
        '[useTranslationsLanguages] Auto-fetching languages on mount',
      );
      fetchLanguages();
    }
  }, [autoFetch, languagesLoaded, isLoading, fetchLanguages]);

  return useMemo(
    () => ({
      languages,
      languagesLoaded,
      isLoading,
      error,
      refetch: fetchLanguages,
      clearError,
    }),
    [languages, languagesLoaded, isLoading, error, fetchLanguages, clearError],
  );
};

// ============================================================================
// Hook: useLocalizableData
// ============================================================================

/**
 * Hook for managing localizable data (form name, stages, sections, transitions, and fields).
 *
 * Features:
 * - Auto-fetch on mount when params are available
 * - Caching support (avoids redundant API calls)
 * - Loading state tracking
 * - Error handling
 * - Force refresh capability
 *
 * The returned data has nested structure:
 * - data.form_name: { original: string, translated: string }
 * - data.stages[]: { stage_id, original: {name}, translated: {name} }
 * - data.sections[]: { section_id, stage_id, original: {name}, translated: {name} }
 * - data.transitions[]: { stage_transition_id, original: {label}, translated: {label} }
 * - data.fields[]: { field_id, original: {...}, translated: {...} }
 *
 * @param formVersionId - Form version ID to fetch data for
 * @param languageId - Language ID to fetch translations for
 * @returns Localizable data and control methods
 */
export const useLocalizableData = (
  formVersionId: number | null | undefined,
  languageId: number | null | undefined,
) => {
  const dispatch = useDispatch<AppDispatch>();

  const cacheKey = useMemo(() => {
    if (formVersionId && languageId) {
      return `${formVersionId}_${languageId}` as LocalizableDataCacheKey;
    }
    return null;
  }, [formVersionId, languageId]);

  const cachedData = useSelector((state: RootState) =>
    cacheKey ? selectLocalizableDataByKey(state, cacheKey) : undefined,
  );

  const isLoading = useSelector((state: RootState) =>
    selectIsLoadingLocalizableData(state),
  );
  const error = useSelector((state: RootState) =>
    selectLocalizableDataError(state),
  );

  const fetchData = useCallback(
    (force: boolean = false) => {
      if (!formVersionId || !languageId) {
        console.warn('[useLocalizableData] Cannot fetch: missing params');
        return;
      }

      if (force && cacheKey) {
        console.log(
          `[useLocalizableData] Force refresh: clearing cache for ${cacheKey}`,
        );
        dispatch(clearLocalizableDataCache(cacheKey));
      }

      console.log(
        `[useLocalizableData] Fetching for form_version_id=${formVersionId}, language_id=${languageId}`,
      );
      return dispatch(
        fetchLocalizableData({
          form_version_id: formVersionId,
          language_id: languageId,
        }),
      );
    },
    [dispatch, formVersionId, languageId, cacheKey],
  );

  const clearError = useCallback(() => {
    console.log('[useLocalizableData] Clearing error');
    dispatch(clearLocalizableDataError());
  }, [dispatch]);

  // Cache update methods
  const updateFieldInCache = useCallback(
    (
      fieldId: number,
      updates: Partial<{
        label: string;
        helper_text: string;
        default_value: string;
        place_holder: string;
      }>,
    ) => {
      if (cacheKey) {
        dispatch(updateFieldTranslationInCache({ cacheKey, fieldId, updates }));
      }
    },
    [dispatch, cacheKey],
  );

  const updateStageInCache = useCallback(
    (stageId: number, name: string) => {
      if (cacheKey) {
        dispatch(updateStageTranslationInCache({ cacheKey, stageId, name }));
      }
    },
    [dispatch, cacheKey],
  );

  const updateSectionInCache = useCallback(
    (sectionId: number, name: string) => {
      if (cacheKey) {
        dispatch(
          updateSectionTranslationInCache({ cacheKey, sectionId, name }),
        );
      }
    },
    [dispatch, cacheKey],
  );

  const updateTransitionInCache = useCallback(
    (transitionId: number, label: string) => {
      if (cacheKey) {
        dispatch(
          updateTransitionTranslationInCache({ cacheKey, transitionId, label }),
        );
      }
    },
    [dispatch, cacheKey],
  );

  const updateFormName = useCallback(
    (formName: string) => {
      if (cacheKey) {
        dispatch(updateFormNameInCache({ cacheKey, formName }));
      }
    },
    [dispatch, cacheKey],
  );

  useEffect(() => {
    if (formVersionId && languageId && !cachedData && !isLoading) {
      console.log('[useLocalizableData] Auto-fetching on params change');
      fetchData();
    }
  }, [formVersionId, languageId, cachedData, isLoading, fetchData]);

  return useMemo(
    () => ({
      data: cachedData,
      isCached: !!cachedData,
      isLoading,
      error,
      fetch: fetchData,
      refetch: () => fetchData(true),
      clearError,
      // Cache update methods
      updateFieldInCache,
      updateStageInCache,
      updateSectionInCache,
      updateTransitionInCache,
      updateFormName,
    }),
    [
      cachedData,
      isLoading,
      error,
      fetchData,
      clearError,
      updateFieldInCache,
      updateStageInCache,
      updateSectionInCache,
      updateTransitionInCache,
      updateFormName,
    ],
  );
};

// ============================================================================
// Hook: useSaveTranslations
// ============================================================================

/**
 * Hook for saving translations.
 *
 * Features:
 * - Save operation with loading state
 * - Success/failure tracking
 * - Error handling
 * - Status reset capability
 *
 * The save payload expects flat structure:
 * - form_name: string
 * - stage_translations: [{ stage_id, name }]
 * - section_translations: [{ section_id, name }]
 * - transition_translations: [{ stage_transition_id, label }]
 * - field_translations: [{ field_id, label, helper_text, default_value, place_holder }]
 *
 * Use utility functions from types to convert from nested structure to flat structure.
 *
 * @returns Save function and operation status
 */
export const useSaveTranslations = () => {
  const dispatch = useDispatch<AppDispatch>();

  const isSaving = useSelector((state: RootState) => selectIsSaving(state));
  const error = useSelector((state: RootState) => selectSaveError(state));
  const lastSaveSuccess = useSelector((state: RootState) =>
    selectLastSaveSuccess(state),
  );
  const lastSaveTimestamp = useSelector((state: RootState) =>
    selectLastSaveTimestamp(state),
  );

  const save = useCallback(
    async (payload: SaveTranslationsPayload) => {
      console.log(
        `[useSaveTranslations] Saving for form_version_id=${payload.form_version_id}, language_id=${payload.language_id}`,
      );
      console.log(
        `[useSaveTranslations] Payload:`,
        `${payload.stage_translations.length} stages,`,
        `${payload.section_translations.length} sections,`,
        `${payload.transition_translations.length} transitions,`,
        `${payload.field_translations.length} fields`,
      );
      const result = await dispatch(saveTranslations(payload));
      return result;
    },
    [dispatch],
  );

  const clearError = useCallback(() => {
    console.log('[useSaveTranslations] Clearing error');
    dispatch(clearSaveError());
  }, [dispatch]);

  const resetStatus = useCallback(() => {
    console.log('[useSaveTranslations] Resetting save status');
    dispatch(resetSaveStatus());
  }, [dispatch]);

  return useMemo(
    () => ({
      save,
      isSaving,
      error,
      lastSaveSuccess,
      lastSaveTimestamp,
      clearError,
      resetStatus,
    }),
    [
      save,
      isSaving,
      error,
      lastSaveSuccess,
      lastSaveTimestamp,
      clearError,
      resetStatus,
    ],
  );
};

// ============================================================================
// Hook: useTranslationsErrorManagement
// ============================================================================

/**
 * Hook for centralized error management across all translation operations.
 *
 * Features:
 * - Access to all error states
 * - Individual error clearing
 * - Clear all errors at once
 * - Check if any errors exist
 *
 * @returns Error states and clearing methods
 */
export const useTranslationsErrorManagement = () => {
  const dispatch = useDispatch<AppDispatch>();

  const languagesError = useSelector((state: RootState) =>
    selectLanguagesError(state),
  );
  const localizableDataError = useSelector((state: RootState) =>
    selectLocalizableDataError(state),
  );
  const saveError = useSelector((state: RootState) => selectSaveError(state));

  const hasAnyError = !!(languagesError || localizableDataError || saveError);

  const clearAll = useCallback(() => {
    console.log('[useTranslationsErrorManagement] Clearing all errors');
    dispatch(clearAllErrors());
  }, [dispatch]);

  const clearLanguages = useCallback(() => {
    console.log('[useTranslationsErrorManagement] Clearing languages error');
    dispatch(clearLanguagesError());
  }, [dispatch]);

  const clearLocalizableData = useCallback(() => {
    console.log(
      '[useTranslationsErrorManagement] Clearing localizable data error',
    );
    dispatch(clearLocalizableDataError());
  }, [dispatch]);

  const clearSave = useCallback(() => {
    console.log('[useTranslationsErrorManagement] Clearing save error');
    dispatch(clearSaveError());
  }, [dispatch]);

  return useMemo(
    () => ({
      errors: {
        languages: languagesError,
        localizableData: localizableDataError,
        save: saveError,
      },
      hasAnyError,
      clearAll,
      clearLanguages,
      clearLocalizableData,
      clearSave,
    }),
    [
      languagesError,
      localizableDataError,
      saveError,
      hasAnyError,
      clearAll,
      clearLanguages,
      clearLocalizableData,
      clearSave,
    ],
  );
};

// ============================================================================
// Hook: useTranslationsWorkflow
// ============================================================================

/**
 * Composite hook that combines all translation hooks for complete workflow.
 *
 * This is a convenience hook that provides access to:
 * - Available languages
 * - Localizable data for specific form/language (stages, sections, transitions, fields)
 * - Save operations
 * - Error management
 *
 * Perfect for full-featured translation pages that need everything.
 *
 * @param formVersionId - Form version ID
 * @param languageId - Language ID
 * @returns Combined translation workflow interface
 */
export const useTranslationsWorkflow = (
  formVersionId: number | null | undefined,
  languageId: number | null | undefined,
) => {
  const languages = useTranslationsLanguages();
  const localizableData = useLocalizableData(formVersionId, languageId);
  const save = useSaveTranslations();
  const errorManagement = useTranslationsErrorManagement();

  return useMemo(
    () => ({
      languages,
      localizableData,
      save,
      errorManagement,
    }),
    [languages, localizableData, save, errorManagement],
  );
};
