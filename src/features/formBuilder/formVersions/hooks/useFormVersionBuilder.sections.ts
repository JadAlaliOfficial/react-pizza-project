// src/features/formVersion/hooks/useFormVersionBuilder.sections.ts

/**
 * Section-specific hooks for Form Version Builder
 * Handles section CRUD operations within stages
 */

import { useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch } from '@/store';
import type {
  UiSection,
  StageIdLike,
  SectionIdLike,
} from '../types/formVersion.ui-types';
import {
  addSection,
  updateSection,
  removeSection,
  reorderSections,
  setSelectedSectionId,
  selectSectionsByStageId,
  selectSelectedSectionId,
  selectSelectedSection,
} from '../store/formVersionBuilderSlice';

// ============================================================================
// Section Actions Hook
// ============================================================================

/**
 * Hook for section-related actions
 * Used internally by useFormVersionBuilder
 * 
 * @returns Section action dispatchers
 */
export const useSectionActions = () => {
  const dispatch = useDispatch<AppDispatch>();

  return useMemo(
    () => ({
      addSection: (stageId: StageIdLike, section: UiSection) => {
        console.info(
          '[useSectionActions] Adding section',
          section.id,
          'to stage',
          stageId
        );
        dispatch(addSection({ stageId, section }));
      },

      updateSection: (stageId: StageIdLike, section: UiSection) => {
        console.debug(
          '[useSectionActions] Updating section',
          section.id,
          'in stage',
          stageId
        );
        dispatch(updateSection({ stageId, section }));
      },

      removeSection: (stageId: StageIdLike, sectionId: SectionIdLike) => {
        console.info(
          '[useSectionActions] Removing section',
          sectionId,
          'from stage',
          stageId
        );
        dispatch(removeSection({ stageId, sectionId }));
      },

      reorderSections: (stageId: StageIdLike, sections: UiSection[]) => {
        console.debug(
          '[useSectionActions] Reordering sections in stage',
          stageId
        );
        dispatch(reorderSections({ stageId, sections }));
      },
    }),
    [dispatch]
  );
};

// ============================================================================
// Section Selection Hook
// ============================================================================

/**
 * Hook for managing sections in a specific stage
 * Provides section list and selection helpers
 * 
 * @param stageId - Stage ID to manage sections for
 * @returns Sections, selected section, and actions
 * 
 * @example
 * const { sections, selectedSection, setSelected } = useSectionSelection(stageId);
 */
export const useSectionSelection = (stageId: StageIdLike | null) => {
  const dispatch = useDispatch<AppDispatch>();
  const sections = useSelector(selectSectionsByStageId(stageId));
  const selectedSectionId = useSelector(selectSelectedSectionId);
  const selectedSection = useSelector(selectSelectedSection);

  const setSelected = useCallback(
    (id: SectionIdLike | null) => {
      dispatch(setSelectedSectionId(id));
    },
    [dispatch]
  );

  return {
    sections,
    selectedSectionId,
    selectedSection,
    setSelected,
  };
};
