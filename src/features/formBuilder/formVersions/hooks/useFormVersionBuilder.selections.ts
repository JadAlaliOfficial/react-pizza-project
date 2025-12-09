// src/features/formVersion/hooks/useFormVersionBuilder.selections.ts

/**
 * Selection management hooks for Form Version Builder
 * Handles stage, section, and field selection state
 */

import { useMemo } from 'react';
import { useDispatch } from 'react-redux';
import type { AppDispatch } from '@/store';
import type {
  StageIdLike,
  SectionIdLike,
  FieldIdLike,
} from '../types/formVersion.ui-types';
import {
  setSelectedStageId,
  setSelectedSectionId,
  setSelectedFieldId,
} from '../store/formVersionBuilderSlice';

// ============================================================================
// Selection Actions Hook
// ============================================================================

/**
 * Hook for selection-related actions
 * Used internally by useFormVersionBuilder
 * 
 * @returns Selection action dispatchers
 */
export const useSelectionActions = () => {
  const dispatch = useDispatch<AppDispatch>();

  return useMemo(
    () => ({
      setSelectedStageId: (stageId: StageIdLike | string | null) => {
        console.debug('[useSelectionActions] Setting selected stage', stageId);
        dispatch(setSelectedStageId(stageId));
      },

      setSelectedSectionId: (sectionId: SectionIdLike | null) => {
        console.debug('[useSelectionActions] Setting selected section', sectionId);
        dispatch(setSelectedSectionId(sectionId));
      },

      setSelectedFieldId: (fieldId: FieldIdLike | null) => {
        console.debug('[useSelectionActions] Setting selected field', fieldId);
        dispatch(setSelectedFieldId(fieldId));
      },
    }),
    [dispatch]
  );
};
