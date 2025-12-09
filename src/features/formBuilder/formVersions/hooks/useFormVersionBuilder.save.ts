// src/features/formVersion/hooks/useFormVersionBuilder.save.ts

/**
 * Save operation hook for Form Version Builder
 * Handles draft persistence to API
 */

import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch } from '@/store';
import {
  saveFormVersionDraft,
  selectBuilderFormVersionId,
  selectBuilderSaving,
  selectBuilderSaveError,
} from '../store/formVersionBuilderSlice';

// ============================================================================
// Save Hook
// ============================================================================

/**
 * Hook for saving builder draft to API
 * Exposes save function with loading and error states
 * 
 * @returns Save function and related state
 * 
 * @example
 * const { save, saving, error } = useBuilderSave();
 * 
 * const handleSave = async () => {
 *   try {
 *     await save();
 *     toast.success('Saved!');
 *   } catch (err) {
 *     toast.error('Save failed');
 *   }
 * };
 */
export const useBuilderSave = () => {
  const dispatch = useDispatch<AppDispatch>();
  const formVersionId = useSelector(selectBuilderFormVersionId);
  const saving = useSelector(selectBuilderSaving);
  const saveError = useSelector(selectBuilderSaveError);

  const save = useCallback(async (): Promise<void> => {
    if (!formVersionId) {
      console.error('[useBuilderSave] Cannot save: No form version ID');
      throw new Error('No form version ID set in builder');
    }

    console.info(
      '[useBuilderSave] Triggering save for form version',
      formVersionId
    );

    try {
      await dispatch(saveFormVersionDraft(formVersionId)).unwrap();
      console.info('[useBuilderSave] Save successful');
    } catch (error) {
      console.error('[useBuilderSave] Save failed:', error);
      throw error;
    }
  }, [dispatch, formVersionId]);

  return {
    save,
    saving,
    error: saveError,
  };
};
