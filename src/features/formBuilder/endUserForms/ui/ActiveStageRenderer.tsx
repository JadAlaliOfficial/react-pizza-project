/**
 * ================================
 * ACTIVE STAGE RENDERER
 * ================================
 *
 * Renderer for the active (editable) stage in a multi-stage form entry.
 * Uses useLaterStageRuntime for state management and validation.
 *
 * Key Responsibilities:
 * - Render sections and fields for the active stage
 * - Handle validation and visibility
 * - Handle submission via submitLaterStage
 * - Display errors and success states
 */

import React, { useEffect } from 'react';
import type { FormStructureData } from '@/features/formBuilder/endUserForms/types/formStructure.types';
import type { SubmitLaterStageData } from '@/features/formBuilder/endUserForms/types/submitInitialForm.types';
import { useLaterStageRuntime } from '../hooks/useLaterStageRuntime';
import { useSubmitLaterStage } from '@/features/formBuilder/endUserForms/hooks/submitInitialForm.hook';
import { SectionListRenderer } from './SectionRenderer';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertCircle } from 'lucide-react';
import { LANGUAGE_MAP, type LanguageId } from '../types/runtime.types';

export interface ActiveStageRendererProps {
  formStructure: FormStructureData;
  entryPublicIdentifier: string;
  languageId?: LanguageId;
  onSuccess?: (data: SubmitLaterStageData) => void;
  className?: string;
  sectionsClassName?: string;
  submitContainerClassName?: string;
}

export const ActiveStageRenderer: React.FC<ActiveStageRendererProps> = ({
  formStructure,
  entryPublicIdentifier,
  languageId = 1,
  onSuccess,
  className,
  sectionsClassName,
  submitContainerClassName,
}) => {
  const languageConfig = LANGUAGE_MAP[languageId];

  // ================================
  // HOOKS
  // ================================

  const {
    formState,
    validationState,
    getFieldValue,
    setFieldValue,
    setFieldTouched,
    getFieldError,
    isFieldVisible,
    isSectionVisible,
    submitButtonState,
    handleSubmit: runtimeHandleSubmit,
    canSubmit,
    selectTransition,
  } = useLaterStageRuntime({
    formStructure,
    entryPublicIdentifier,
    languageId,
  });

  // Get submission state from Redux
  const { data: submissionData, isSuccess, error: submissionError } = useSubmitLaterStage();

  // ================================
  // EFFECTS
  // ================================

  useEffect(() => {
    if (isSuccess && submissionData && onSuccess) {
      onSuccess(submissionData);
    }
  }, [isSuccess, submissionData, onSuccess]);

  // ================================
  // HANDLERS
  // ================================

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await runtimeHandleSubmit();
  };

  // ================================
  // RENDER
  // ================================

  return (
    <form
      onSubmit={onSubmit}
      className={className || 'mx-auto max-w-4xl'}
      dir={languageConfig.direction}
    >
      {/* Stage Header */}
      <div className="mb-8">
        {formStructure.form_name && (
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            {formStructure.form_name}
          </h1>
        )}
        {formStructure.stage?.stage_name && (
          <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">
            {formStructure.stage.stage_name}
          </p>
        )}
      </div>

      {/* Global Errors */}
      {validationState.globalErrors.length > 0 && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <ul className="list-disc pl-4">
              {validationState.globalErrors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Submission Error */}
      {submissionError && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {submissionError.message || 'Submission failed'}
          </AlertDescription>
        </Alert>
      )}

      {/* Sections */}
      {formStructure.stage?.sections && (
        <div className={sectionsClassName}>
          <SectionListRenderer
            sections={formStructure.stage.sections}
            isSectionVisible={isSectionVisible}
            getFieldValue={getFieldValue}
            getFieldError={getFieldError}
            getFieldTouched={(fieldId) => formState.fieldValues[fieldId]?.touched || false}
            isFieldVisible={isFieldVisible}
            onChange={setFieldValue}
            onBlur={setFieldTouched}
            direction={languageConfig.direction}
            languageId={languageId}
          />
        </div>
      )}

      {/* Submit Actions */}
      <div className={submitContainerClassName || 'mt-8 flex justify-end gap-4'}>
        {/* Render buttons based on transitions */}
        {submitButtonState.availableTransitions.map((transition) => (
          <Button
            key={transition.transitionId}
            type="submit"
            onClick={() => selectTransition(transition.transitionId)}
            disabled={!canSubmit || formState.isSubmitting || transition.isDisabled}
            variant={transition.label.toLowerCase() === 'reject' ? 'secondary' : 'default'}
            className={
              transition.label.toLowerCase() === 'reject'
                ? 'bg-red-500 hover:bg-red-600 text-white min-w-32'
                : 'min-w-32'
            }
          >
            {formState.isSubmitting &&
            (formState.selectedTransitionId === transition.transitionId ||
              (!formState.selectedTransitionId &&
                submitButtonState.selectedTransitionId ===
                  transition.transitionId)) ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              transition.label
            )}
          </Button>
        ))}

        {/* Fallback Submit Button if no transitions defined (shouldn't happen usually) */}
        {submitButtonState.availableTransitions.length === 0 && (
          <Button
            type="submit"
            disabled={!canSubmit || formState.isSubmitting}
          >
            {formState.isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              'Submit'
            )}
          </Button>
        )}
      </div>
    </form>
  );
};
