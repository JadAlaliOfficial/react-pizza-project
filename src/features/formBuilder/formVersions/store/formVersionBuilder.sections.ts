// src/features/formVersion/store/formVersionBuilder.sections.ts

/**
 * Section-specific reducers for Form Version Builder
 * Handles section CRUD operations within stages
 */

import type { PayloadAction } from '@reduxjs/toolkit';
import type { UiSection, StageIdLike, SectionIdLike } from '../types/formVersion.ui-types';
import type { FormVersionBuilderState } from './formVersionBuilderSlice';

// ============================================================================
// Section Reducers
// ============================================================================

export const sectionReducers = {
  /**
   * Adds a new section to a specific stage
   */
  addSection: (
    state: FormVersionBuilderState,
    action: PayloadAction<{ stageId: StageIdLike; section: UiSection }>
  ) => {
    console.info(
      `[SectionReducers] Adding section ${action.payload.section.id} to stage ${action.payload.stageId}`
    );

    const stage = state.stages.find((s) => s.id === action.payload.stageId);
    if (stage) {
      stage.sections.push(action.payload.section);
      state.dirty = true;
    } else {
      console.warn(
        `[SectionReducers] Stage ${action.payload.stageId} not found for adding section`
      );
    }
  },

  /**
   * Updates a section within a stage
   */
  updateSection: (
    state: FormVersionBuilderState,
    action: PayloadAction<{ stageId: StageIdLike; section: UiSection }>
  ) => {
    console.debug(
      `[SectionReducers] Updating section ${action.payload.section.id} in stage ${action.payload.stageId}`
    );

    const stage = state.stages.find((s) => s.id === action.payload.stageId);
    if (stage) {
      const sectionIndex = stage.sections.findIndex(
        (sec) => sec.id === action.payload.section.id
      );
      if (sectionIndex !== -1) {
        stage.sections[sectionIndex] = action.payload.section;
        state.dirty = true;
      } else {
        console.warn(
          `[SectionReducers] Section ${action.payload.section.id} not found in stage ${action.payload.stageId}`
        );
      }
    } else {
      console.warn(
        `[SectionReducers] Stage ${action.payload.stageId} not found for updating section`
      );
    }
  },

  /**
   * Removes a section from a stage
   */
  removeSection: (
    state: FormVersionBuilderState,
    action: PayloadAction<{ stageId: StageIdLike; sectionId: SectionIdLike }>
  ) => {
    console.info(
      `[SectionReducers] Removing section ${action.payload.sectionId} from stage ${action.payload.stageId}`
    );

    const stage = state.stages.find((s) => s.id === action.payload.stageId);
    if (stage) {
      stage.sections = stage.sections.filter(
        (sec) => sec.id !== action.payload.sectionId
      );
      state.dirty = true;

      // Clear selection if deleted section was selected
      if (state.selectedSectionId === action.payload.sectionId) {
        state.selectedSectionId = null;
      }
    } else {
      console.warn(
        `[SectionReducers] Stage ${action.payload.stageId} not found for removing section`
      );
    }
  },

  /**
   * Reorders sections within a stage
   * Accepts new sections array with updated order values
   */
  reorderSections: (
    state: FormVersionBuilderState,
    action: PayloadAction<{ stageId: StageIdLike; sections: UiSection[] }>
  ) => {
    console.debug(
      `[SectionReducers] Reordering sections in stage ${action.payload.stageId}`
    );

    const stage = state.stages.find((s) => s.id === action.payload.stageId);
    if (stage) {
      stage.sections = action.payload.sections;
      state.dirty = true;
    } else {
      console.warn(
        `[SectionReducers] Stage ${action.payload.stageId} not found for reordering sections`
      );
    }
  },
};
