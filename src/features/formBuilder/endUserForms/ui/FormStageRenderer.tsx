/**
 * ================================
 * FORM STAGE RENDERER
 * ================================
 *
 * Main renderer for a form stage - the top-level UI component.
 * Orchestrates rendering of sections, fields, and form controls.
 *
 * Key Responsibilities:
 * - Render all sections in the current stage
 * - Render form submit button with transitions
 * - Handle form submission with success/error callbacks
 * - Display form-level validation errors
 * - Show loading/submitting states
 * - Apply stage-level layout and styling
 *
 * Architecture Decisions:
 * - Connects to useRuntimeForm hook for all state
 * - Pure presentation - business logic in hook
 * - Responsive layout with mobile support
 * - Accessible form structure
 * - RTL/LTR support from language config (no internal RTL logic)
 * - No debug logs in production
 *
 * Usage Pattern:
 * - CompleteFormRenderer is the main entry point
 * - Used in pages/routes that display forms
 * - Handles entire form lifecycle
 */

import React from 'react';
import type { FormStructureData } from '@/features/formBuilder/endUserForms/types/formStructure.types';
import type { SubmitInitialStageData } from '@/features/formBuilder/endUserForms/types/submitInitialForm.types';
import { useRuntimeForm } from '../hooks/useRuntimeForm';
import { useSubmitInitialStage } from '@/features/formBuilder/endUserForms/hooks/submitInitialForm.hook';
import { SectionListRenderer } from './SectionRenderer';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';

// ================================
// COMPONENT PROPS
// ================================

/**
 * Props for CompleteFormRenderer
 */
export interface CompleteFormRendererProps {
  /**
   * Form structure data from API (loaded via useFormStructure)
   */
  formStructure: FormStructureData;

  /**
   * Form version ID to render
   */
  formVersionId: number;

  /**
   * Optional record ID for editing existing records
   */
  recordId?: number;

  /**
   * Language ID (1=English, 2=Arabic, 3=Spanish)
   */
  languageId?: 1 | 2 | 3;

  /**
   * Callback when form is successfully submitted
   */
  onSuccess?: (data: SubmitInitialStageData) => void;

  /**
   * Optional custom class for form container
   */
  className?: string;

  /**
   * Optional custom class for sections container
   */
  sectionsClassName?: string;

  /**
   * Optional custom class for submit button container
   */
  submitContainerClassName?: string;
}

// ================================
// MAIN COMPONENT
// ================================

/**
 * CompleteFormRenderer - Main form rendering component
 *
 * Integrates with useRuntimeForm hook and renders complete form UI
 *
 * @example
 * ```
 * const { data: formStructure } = useFormStructure({ formVersionId: 23 });
 *
 * return (
 *   <CompleteFormRenderer
 *     formStructure={formStructure}
 *     formVersionId={23}
 *     languageId={1}
 *     onSuccess={(data) => {
 *       if (data.is_complete) {
 *         navigate('/success');
 *       } else {
 *         navigate(`/forms/${formVersionId}/stage/${data.current_stage_id}`);
 *       }
 *     }}
 *   />
 * );
 * ```
 */
export const CompleteFormRenderer: React.FC<CompleteFormRendererProps> = ({
  formStructure,
  formVersionId,
  recordId,
  languageId = 1,
  onSuccess,
  className,
  sectionsClassName,
  submitContainerClassName,
}) => {
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
    isFormValid,
    canSubmit,
    selectTransition,
  } = useRuntimeForm({
    formVersionId,
    recordId,
    languageId,
  });

  const { data: submissionData, isSuccess } = useSubmitInitialStage();

  // ================================
  // EFFECTS
  // ================================

  React.useEffect(() => {
    if (isSuccess && submissionData && onSuccess) {
      onSuccess(submissionData);
    }
  }, [isSuccess, submissionData, onSuccess]);

  // ================================
  // FORM SUBMISSION HANDLER
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
      dir={formState.language.direction}
    >
      {/* Form Header */}
      {formStructure.form_name && (
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            {formStructure.form_name}
          </h1>
          {formStructure.stage?.stage_name && (
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Stage: {formStructure.stage.stage_name}
            </p>
          )}
        </div>
      )}

      {/* Global Form Errors */}
      {validationState.globalErrors.length > 0 && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <ul className="list-inside list-disc space-y-1">
              {validationState.globalErrors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Render All Sections */}
      {formStructure.stage?.sections && (
        <SectionListRenderer
          sections={formStructure.stage.sections}
          isSectionVisible={isSectionVisible}
          getFieldValue={getFieldValue}
          getFieldError={getFieldError}
          getFieldTouched={(fieldId) =>
            formState.fieldValues[fieldId]?.touched || false
          }
          isFieldVisible={isFieldVisible}
          direction={formState.language.direction}
          onChange={setFieldValue}
          onBlur={setFieldTouched}
          containerClassName={sectionsClassName}
          sectionClassName="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800"
          fieldsContainerClassName="space-y-6"
          languageId={languageId}
        />
      )}

      {/* Submit Button Container */}
      <div
        className={
          submitContainerClassName || 'mt-8 flex items-center justify-between'
        }
      >
        {/* Validation Summary */}
        <div className="text-sm text-gray-600 dark:text-gray-400">
          {!isFormValid && (
            <span className="flex items-center text-red-600 dark:text-red-400">
              <AlertCircle className="mr-1 h-4 w-4" />
              Please fix errors before submitting
            </span>
          )}
          {isFormValid && !formState.isSubmitting && (
            <span className="flex items-center text-green-600 dark:text-green-400">
              <CheckCircle2 className="mr-1 h-4 w-4" />
              Form is valid
            </span>
          )}
        </div>

        {/* Submit Actions */}
        <div className="flex gap-2">
          {submitButtonState.availableTransitions.length > 0 ? (
            submitButtonState.availableTransitions.map((transition) => (
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
            ))
          ) : (
            <Button
              type="submit"
              disabled={!canSubmit || formState.isSubmitting}
              size="lg"
              className="min-w-40"
            >
              {formState.isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                submitButtonState.submitLabel || 'Submit'
              )}
            </Button>
          )}
        </div>
      </div>

      {/* Form Completion Message */}
      {submitButtonState.availableTransitions.some((t) => t.isComplete) && (
        <div className="mt-6 rounded-md bg-green-50 p-4 dark:bg-green-900/20">
          <p className="text-sm text-green-800 dark:text-green-200">
            ✓ This is the final stage. Submitting will complete the form.
          </p>
        </div>
      )}
    </form>
  );
};

// ================================
// DEFAULT EXPORT
// ================================

export default CompleteFormRenderer;
