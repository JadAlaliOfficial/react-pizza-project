/**
 * ================================
 * READ-ONLY STAGE RENDERER
 * ================================
 *
 * Renders a form stage in read-only mode.
 * Used for displaying past stages in a multi-stage form entry.
 *
 * Key Responsibilities:
 * - Render all sections in the stage
 * - Display values from field.current_value
 * - Disable all inputs
 * - No validation or submission logic
 */

import React, { useMemo } from 'react';
import type { FormStage } from '@/features/formBuilder/endUserForms/types/formStructure.types';
import type { JsonValue } from '@/features/formBuilder/endUserForms/types/submitInitialForm.types';
import { SectionListRenderer } from './SectionRenderer';
import { LANGUAGE_MAP, type LanguageId } from '../types/runtime.types';

export interface ReadOnlyStageRendererProps {
  stage: FormStage;
  languageId?: LanguageId;
  className?: string;
}

export const ReadOnlyStageRenderer: React.FC<ReadOnlyStageRendererProps> = ({
  stage,
  languageId = 1,
  className,
}) => {
  const languageConfig = LANGUAGE_MAP[languageId];

  // Create a value map from the stage structure
  // In read-only mode, we trust the current_value from the API
  const valueMap = useMemo(() => {
    const map: Record<number, JsonValue> = {};
    stage.sections.forEach((section) => {
      section.fields.forEach((field) => {
        map[field.field_id] = (field.current_value as JsonValue) ?? null;
      });
    });
    return map;
  }, [stage]);

  // Mock handlers for read-only mode
  const getFieldValue = (fieldId: number) => valueMap[fieldId] ?? null;
  const getFieldError = () => null;
  const getFieldTouched = () => false;
  const isFieldVisible = () => true; // Assume all fields in history are visible
  const isSectionVisible = () => true; // Assume all sections in history are visible
  const noop = () => {};

  return (
    <div className={className} dir={languageConfig.direction}>
      <div className="mb-6 border-b pb-4">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          {stage.stage_name}
        </h2>
        <p className="text-sm text-gray-500">(Completed)</p>
      </div>

      <SectionListRenderer
        sections={stage.sections}
        isSectionVisible={isSectionVisible}
        getFieldValue={getFieldValue}
        getFieldError={getFieldError}
        getFieldTouched={getFieldTouched}
        isFieldVisible={isFieldVisible}
        onChange={noop}
        onBlur={noop}
        disabled={true} // Force disabled state
        direction={languageConfig.direction}
        languageId={languageId}
      />
    </div>
  );
};
