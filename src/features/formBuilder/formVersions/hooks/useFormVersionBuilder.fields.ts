// src/features/formVersion/hooks/useFormVersionBuilder.fields.ts

/**
 * Field-specific hooks for Form Version Builder
 * Handles field CRUD operations within sections
 */

import { useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch } from '@/store';
import type {
  UiField,
  StageIdLike,
  SectionIdLike,
  FieldIdLike,
} from '../types/formVersion.ui-types';
import {
  addField,
  updateField,
  removeField,
  reorderFields,
  setSelectedFieldId,
  selectFieldsBySectionId,
  selectFieldById,
  selectSelectedFieldId,
  selectSelectedField,
  selectSelectedStageId,
  selectSelectedSectionId,
} from '../store/formVersionBuilderSlice';

// ============================================================================
// Field Actions Hook
// ============================================================================

/**
 * Hook for field-related actions
 * Used internally by useFormVersionBuilder
 * 
 * @returns Field action dispatchers
 */
export const useFieldActions = () => {
  const dispatch = useDispatch<AppDispatch>();

  return useMemo(
    () => ({
      addField: (
        stageId: StageIdLike,
        sectionId: SectionIdLike,
        fieldTypeId: number,
        defaults?: Partial<UiField>
      ) => {
        console.info(
          '[useFieldActions] Adding field with type',
          fieldTypeId,
          'to section',
          sectionId
        );
        dispatch(addField({ stageId, sectionId, fieldTypeId, defaults }));
      },

      updateField: (
        stageId: StageIdLike,
        sectionId: SectionIdLike,
        fieldId: FieldIdLike,
        changes: Partial<UiField>
      ) => {
        console.debug(
          '[useFieldActions] Updating field',
          fieldId,
          'in section',
          sectionId
        );
        dispatch(updateField({ stageId, sectionId, fieldId, changes }));
      },

      removeField: (
        stageId: StageIdLike,
        sectionId: SectionIdLike,
        fieldId: FieldIdLike
      ) => {
        console.info(
          '[useFieldActions] Removing field',
          fieldId,
          'from section',
          sectionId
        );
        dispatch(removeField({ stageId, sectionId, fieldId }));
      },

      reorderFields: (
        stageId: StageIdLike,
        sectionId: SectionIdLike,
        fields: UiField[]
      ) => {
        console.debug(
          '[useFieldActions] Reordering fields in section',
          sectionId
        );
        dispatch(reorderFields({ stageId, sectionId, fields }));
      },
    }),
    [dispatch]
  );
};

// ============================================================================
// Field Selection Hook
// ============================================================================

/**
 * Hook for managing fields in a specific section
 * Provides field list and selection helpers
 * 
 * @param stageId - Stage ID containing the section
 * @param sectionId - Section ID to manage fields for
 * @returns Fields, selected field, and actions
 * 
 * @example
 * const { fields, selectedField, setSelected } = useFieldSelection(stageId, sectionId);
 */
export const useFieldSelection = (
  stageId: StageIdLike | null,
  sectionId: SectionIdLike | null
) => {
  const dispatch = useDispatch<AppDispatch>();
  const fields = useSelector(selectFieldsBySectionId(stageId, sectionId));
  const selectedFieldId = useSelector(selectSelectedFieldId);
  const selectedField = useSelector(selectSelectedField);

  const setSelected = useCallback(
    (id: FieldIdLike | null) => {
      dispatch(setSelectedFieldId(id));
    },
    [dispatch]
  );

  return {
    fields,
    selectedFieldId,
    selectedField,
    setSelected,
  };
};

// ============================================================================
// Current Context Hook
// ============================================================================

/**
 * Hook to get current working context (stage, section, field)
 * Useful for components that need all three levels
 * 
 * @returns Current stage/section/field IDs and objects
 * 
 * @example
 * const { stageId, sectionId, fieldId, field } = useCurrentFieldContext();
 */
export const useCurrentFieldContext = () => {
  const stageId = useSelector(selectSelectedStageId);
  const sectionId = useSelector(selectSelectedSectionId);
  const fieldId = useSelector(selectSelectedFieldId);
  const field = useSelector(selectSelectedField);

  return {
    stageId,
    sectionId,
    fieldId,
    field,
  };
};

// ============================================================================
// Field by ID Hook
// ============================================================================

/**
 * Hook to get a specific field by its IDs
 * 
 * @param stageId - Stage ID
 * @param sectionId - Section ID
 * @param fieldId - Field ID
 * @returns The matching field or undefined
 * 
 * @example
 * const field = useFieldById(stageId, sectionId, fieldId);
 */
export const useFieldById = (
  stageId: StageIdLike | null,
  sectionId: SectionIdLike | null,
  fieldId: FieldIdLike | null
): UiField | undefined => {
  return useSelector(selectFieldById(stageId, sectionId, fieldId));
};
