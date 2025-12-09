// src/features/formVersion/store/formVersionBuilder.sections.ts
// UPDATE: Import and use createDefaultField helper

/**
 * Section-specific reducers for Form Version Builder
 * Handles section CRUD operations within stages
 * Extended with field CRUD operations within sections
 * UPDATED: Uses field defaults helper for better UX
 */

import type { PayloadAction } from '@reduxjs/toolkit';
import type { UiSection, UiField, StageIdLike, SectionIdLike, FieldIdLike } from '../types/formVersion.ui-types';
import type { FormVersionBuilderState } from './formVersionBuilderSlice';
import { createDefaultField } from '../utils/fieldDefaults';

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
        state.selectedFieldId = null;
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

  // ========================================================================
  // Field Actions (nested within sections)
  // ========================================================================

  /**
   * Adds a new field to a specific section
   * Creates field with fake ID and sensible defaults based on field type
   * UPDATED: Now uses createDefaultField helper for better UX
   */
  addField: (
    state: FormVersionBuilderState,
    action: PayloadAction<{
      stageId: StageIdLike;
      sectionId: SectionIdLike;
      fieldTypeId: number;
      defaults?: Partial<UiField>;
    }>
  ) => {
    const { stageId, sectionId, fieldTypeId, defaults } = action.payload;

    console.info(
      `[SectionReducers] Adding field with type ${fieldTypeId} to section ${sectionId} in stage ${stageId}`
    );

    const stage = state.stages.find((s) => s.id === stageId);
    if (!stage) {
      console.warn(`[SectionReducers] Stage ${stageId} not found for adding field`);
      return;
    }

    const section = stage.sections.find((sec) => sec.id === sectionId);
    if (!section) {
      console.warn(`[SectionReducers] Section ${sectionId} not found for adding field`);
      return;
    }

    // Create new field with sensible defaults based on field type
    const newField = createDefaultField(sectionId, fieldTypeId, defaults);

    section.fields.push(newField);
    state.dirty = true;

    console.debug(`[SectionReducers] Created field with ID: ${newField.id}`);
  },

  /**
   * Updates a field within a section
   * Accepts partial field data to merge with existing
   */
  updateField: (
    state: FormVersionBuilderState,
    action: PayloadAction<{
      stageId: StageIdLike;
      sectionId: SectionIdLike;
      fieldId: FieldIdLike;
      changes: Partial<UiField>;
    }>
  ) => {
    const { stageId, sectionId, fieldId, changes } = action.payload;

    console.debug(
      `[SectionReducers] Updating field ${fieldId} in section ${sectionId}, stage ${stageId}`
    );

    const stage = state.stages.find((s) => s.id === stageId);
    if (!stage) {
      console.warn(`[SectionReducers] Stage ${stageId} not found for updating field`);
      return;
    }

    const section = stage.sections.find((sec) => sec.id === sectionId);
    if (!section) {
      console.warn(`[SectionReducers] Section ${sectionId} not found for updating field`);
      return;
    }

    const fieldIndex = section.fields.findIndex((f) => f.id === fieldId);
    if (fieldIndex === -1) {
      console.warn(`[SectionReducers] Field ${fieldId} not found for update`);
      return;
    }

    // Merge changes with existing field
    section.fields[fieldIndex] = {
      ...section.fields[fieldIndex],
      ...changes,
    };

    state.dirty = true;
    console.debug(`[SectionReducers] Field ${fieldId} updated successfully`);
  },

  /**
   * Removes a field from a section
   */
  removeField: (
    state: FormVersionBuilderState,
    action: PayloadAction<{
      stageId: StageIdLike;
      sectionId: SectionIdLike;
      fieldId: FieldIdLike;
    }>
  ) => {
    const { stageId, sectionId, fieldId } = action.payload;

    console.info(
      `[SectionReducers] Removing field ${fieldId} from section ${sectionId}, stage ${stageId}`
    );

    const stage = state.stages.find((s) => s.id === stageId);
    if (!stage) {
      console.warn(`[SectionReducers] Stage ${stageId} not found for removing field`);
      return;
    }

    const section = stage.sections.find((sec) => sec.id === sectionId);
    if (!section) {
      console.warn(`[SectionReducers] Section ${sectionId} not found for removing field`);
      return;
    }

    section.fields = section.fields.filter((f) => f.id !== fieldId);
    state.dirty = true;

    // Clear selection if deleted field was selected
    if (state.selectedFieldId === fieldId) {
      state.selectedFieldId = null;
    }

    console.debug(`[SectionReducers] Field ${fieldId} removed successfully`);
  },

  /**
   * Reorders fields within a section
   * Accepts new fields array in desired order
   */
  reorderFields: (
    state: FormVersionBuilderState,
    action: PayloadAction<{
      stageId: StageIdLike;
      sectionId: SectionIdLike;
      fields: UiField[];
    }>
  ) => {
    const { stageId, sectionId, fields } = action.payload;

    console.debug(
      `[SectionReducers] Reordering fields in section ${sectionId}, stage ${stageId}`
    );

    const stage = state.stages.find((s) => s.id === stageId);
    if (!stage) {
      console.warn(`[SectionReducers] Stage ${stageId} not found for reordering fields`);
      return;
    }

    const section = stage.sections.find((sec) => sec.id === sectionId);
    if (!section) {
      console.warn(`[SectionReducers] Section ${sectionId} not found for reordering fields`);
      return;
    }

    section.fields = fields;
    state.dirty = true;
    console.debug(`[SectionReducers] Fields reordered successfully`);
  },
};
