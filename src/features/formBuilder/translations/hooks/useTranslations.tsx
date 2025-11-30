// translations.hooks.ts

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

export const useTranslationsLanguages = (options: { autoFetch?: boolean } = {}) => {
  const { autoFetch = true } = options;
  const dispatch = useDispatch<AppDispatch>();

  const languages = useSelector((state: RootState) => selectLanguages(state));
  const languagesLoaded = useSelector((state: RootState) => selectLanguagesLoaded(state));
  const isLoading = useSelector((state: RootState) => selectIsLoadingLanguages(state));
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
      console.log('[useTranslationsLanguages] Auto-fetching languages on mount');
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
    [languages, languagesLoaded, isLoading, error, fetchLanguages, clearError]
  );
};

// ============================================================================
// Hook: useLocalizableData
// ============================================================================

export const useLocalizableData = (
  formVersionId: number | null | undefined,
  languageId: number | null | undefined
) => {
  const dispatch = useDispatch<AppDispatch>();

  const cacheKey = useMemo<LocalizableDataCacheKey | null>(() => {
    if (formVersionId && languageId) {
      return `${formVersionId}_${languageId}`;
    }
    return null;
  }, [formVersionId, languageId]);

  const cachedData = useSelector((state: RootState) =>
    cacheKey ? selectLocalizableDataByKey(state, cacheKey) : undefined
  );
  const isLoading = useSelector((state: RootState) => selectIsLoadingLocalizableData(state));
  const error = useSelector((state: RootState) => selectLocalizableDataError(state));

  const fetchData = useCallback(
    (force: boolean = false) => {
      if (!formVersionId || !languageId) {
        console.warn('[useLocalizableData] Cannot fetch: missing params');
        return;
      }

      if (force && cacheKey) {
        console.log(`[useLocalizableData] Force refresh: clearing cache for ${cacheKey}`);
        dispatch(clearLocalizableDataCache(cacheKey));
      }

      console.log(
        `[useLocalizableData] Fetching for form_version_id=${formVersionId}, language_id=${languageId}`
      );
      return dispatch(
        fetchLocalizableData({
          form_version_id: formVersionId,
          language_id: languageId,
        })
      );
    },
    [dispatch, formVersionId, languageId, cacheKey]
  );

  const clearError = useCallback(() => {
    console.log('[useLocalizableData] Clearing error');
    dispatch(clearLocalizableDataError());
  }, [dispatch]);

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
    }),
    [cachedData, isLoading, error, fetchData, clearError]
  );
};

// ============================================================================
// Hook: useSaveTranslations
// ============================================================================

export const useSaveTranslations = () => {
  const dispatch = useDispatch<AppDispatch>();

  const isSaving = useSelector((state: RootState) => selectIsSaving(state));
  const error = useSelector((state: RootState) => selectSaveError(state));
  const lastSaveSuccess = useSelector((state: RootState) => selectLastSaveSuccess(state));
  const lastSaveTimestamp = useSelector((state: RootState) => selectLastSaveTimestamp(state));

  const save = useCallback(
    async (payload: SaveTranslationsPayload) => {
      console.log(
        `[useSaveTranslations] Saving for form_version_id=${payload.form_version_id}, language_id=${payload.language_id}`
      );
      const result = await dispatch(saveTranslations(payload));
      return result;
    },
    [dispatch]
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
    [save, isSaving, error, lastSaveSuccess, lastSaveTimestamp, clearError, resetStatus]
  );
};

// ============================================================================
// Hook: useTranslationsErrorManagement
// ============================================================================

export const useTranslationsErrorManagement = () => {
  const dispatch = useDispatch<AppDispatch>();

  const languagesError = useSelector((state: RootState) => selectLanguagesError(state));
  const localizableDataError = useSelector((state: RootState) => selectLocalizableDataError(state));
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
    console.log('[useTranslationsErrorManagement] Clearing localizable data error');
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
    ]
  );
};

// ============================================================================
// Hook: useTranslationsWorkflow
// ============================================================================

export const useTranslationsWorkflow = (
  formVersionId: number | null | undefined,
  languageId: number | null | undefined
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
    [languages, localizableData, save, errorManagement]
  );
};