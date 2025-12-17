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
 * - Handle form submission
 * - Display form-level validation errors
 * - Show loading/submitting states
 * - Apply stage-level layout and styling
 * 
 * Architecture Decisions:
 * - Connects to useRuntimeForm hook for all state
 * - Pure presentation - business logic in hook
 * - Responsive layout with mobile support
 * - Accessible form structure
 * - RTL/LTR support throughout
 * 
 * Usage Pattern:
 * - This is the main entry point for rendering a form
 * - Used in pages/routes that display forms
 * - Handles entire form lifecycle
 */

import React from 'react';
import type { FormStructureData } from '@/features/formBuilder/endUserForms/types/formStructure.types';
import { useRuntimeForm } from '../hooks/useRuntimeForm';
import { SectionListRenderer } from './SectionRenderer';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';

// ================================
// COMPONENT PROPS
// ================================

export interface FormStageRendererProps {
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
   * Optional callback when form is successfully submitted
   */
  onSuccess?: (data: any) => void;

  /**
   * Optional callback when form submission fails
   */
  onError?: (error: any) => void;

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
 * FormStageRenderer - Main form rendering component
 * 
 * Integrates with useRuntimeForm hook and renders complete form UI
 * 
 * @example
 * ```
 * <FormStageRenderer
 *   formVersionId={23}
 *   languageId={1}
 *   onSuccess={(data) => {
 *     console.log('Form submitted:', data);
 *     router.push('/success');
 *   }}
 *   onError={(error) => {
 *     console.error('Submission failed:', error);
 *   }}
 * />
 * ```
 */
export const FormStageRenderer: React.FC<FormStageRendererProps> = ({
  formVersionId,
  recordId,
  languageId = 1,
  onSuccess,
  onError,
  className,
  sectionsClassName,
  submitContainerClassName,
}) => {
  // ================================
  // RUNTIME FORM HOOK
  // ================================

  const {
    formState,
    visibilityMap,
    validationState,
    submitButtonState,
    handleSubmit,
    isFormValid,
    canSubmit,
  } = useRuntimeForm({
    formVersionId,
    recordId,
    languageId,
  });

  // ================================
  // FORM SUBMISSION HANDLER
  // ================================

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await handleSubmit();
      
      // Call success callback if provided
      if (onSuccess) {
        onSuccess(formState);
      }
    } catch (error) {
      // Call error callback if provided
      if (onError) {
        onError(error);
      }
    }
  };

  // ================================
  // LOADING STATE
  // ================================

  // If form structure is loading (handled by useFormStructure internally)
  // For now, we'll check if we have sections
  // TODO: Expose loading state from useRuntimeForm if needed

  // ================================
  // RENDER
  // ================================

  return (
    <form
      onSubmit={onSubmit}
      className={className || 'mx-auto max-w-4xl'}
      dir={formState.language.direction}
    >
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

      {/* Form Sections */}
      <div className={sectionsClassName || 'space-y-8'}>
        {/* This will be populated when we integrate with formStructure */}
        {/* For now, placeholder for sections rendering */}
        <div className="text-center text-gray-500">
          Form sections will render here
        </div>
      </div>

      {/* Submit Button Container */}
      <div className={submitContainerClassName || 'mt-8 flex justify-end'}>
        <Button
          type="submit"
          disabled={!canSubmit || formState.isSubmitting}
          className="min-w-32"
        >
          {formState.isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Submitting...
            </>
          ) : (
            submitButtonState.submitLabel
          )}
        </Button>
      </div>

      {/* Form State Debug Info (Development Only) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-8 rounded-md border border-gray-300 bg-gray-50 p-4">
          <details>
            <summary className="cursor-pointer text-sm font-medium text-gray-700">
              Debug Info
            </summary>
            <div className="mt-2 space-y-2 text-xs text-gray-600">
              <div>Form Valid: {isFormValid ? '✅' : '❌'}</div>
              <div>Can Submit: {canSubmit ? '✅' : '❌'}</div>
              <div>Is Submitting: {formState.isSubmitting ? '✅' : '❌'}</div>
              <div>Language: {formState.language.name} ({formState.language.direction})</div>
              <div>Visible Fields: {Object.values(visibilityMap.fields).filter(Boolean).length}</div>
              <div>Visible Sections: {Object.values(visibilityMap.sections).filter(Boolean).length}</div>
            </div>
          </details>
        </div>
      )}
    </form>
  );
};

// ================================
// COMPLETE FORM RENDERER
// ================================

/**
 * Props for CompleteFormRenderer with form structure data
 */
export interface CompleteFormRendererProps extends FormStageRendererProps {
  /**
   * Form structure data from API
   */
  formStructure: FormStructureData;
}

/**
 * CompleteFormRenderer - Renders form with provided structure data
 * Use this when you already have the form structure loaded
 * 
 * @example
 * ```
 * const { data: formStructure } = useFormStructure({ formVersionId: 23 });
 * 
 * return (
 *   <CompleteFormRenderer
 *     formVersionId={23}
 *     formStructure={formStructure}
 *     languageId={1}
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
  onError,
  className,
  sectionsClassName,
  submitContainerClassName,
}) => {
  const {
    formState,
    visibilityMap,
    validationState,
    getFieldValue,
    setFieldValue,
    setFieldTouched,
    getFieldError,
    isFieldVisible,
    isSectionVisible,
    submitButtonState,
    handleSubmit,
    isFormValid,
    canSubmit,
  } = useRuntimeForm({
    formVersionId,
    recordId,
    languageId,
  });

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await handleSubmit();
      
      if (onSuccess) {
        onSuccess(formState);
      }
    } catch (error) {
      if (onError) {
        onError(error);
      }
    }
  };

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
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Stage: {formStructure.stage.stage_name}
          </p>
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
      <SectionListRenderer
        sections={formStructure.stage.sections}
        isSectionVisible={isSectionVisible}
        getFieldValue={getFieldValue}
        getFieldError={getFieldError}
        getFieldTouched={(fieldId) => formState.fieldValues[fieldId]?.touched || false}
        isFieldVisible={isFieldVisible}
        direction={formState.language.direction}
        onChange={setFieldValue}
        onBlur={setFieldTouched}
        containerClassName={sectionsClassName}
        sectionClassName="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800"
        fieldsContainerClassName="space-y-6"
      />

      {/* Available Transitions Info (if multiple) */}
      {submitButtonState.availableTransitions.length > 1 && (
        <div className="mt-6 rounded-md bg-blue-50 p-4 dark:bg-blue-900/20">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            Multiple transitions available. Using: <strong>{submitButtonState.submitLabel}</strong>
          </p>
        </div>
      )}

      {/* Submit Button */}
      <div className={submitContainerClassName || 'mt-8 flex items-center justify-between'}>
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

        {/* Submit Button */}
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
            submitButtonState.submitLabel
          )}
        </Button>
      </div>

      {/* Form Completion Message */}
      {submitButtonState.availableTransitions.some(t => t.isComplete) && (
        <div className="mt-6 rounded-md bg-green-50 p-4 dark:bg-green-900/20">
          <p className="text-sm text-green-800 dark:text-green-200">
            ✓ This is the final stage. Submitting will complete the form.
          </p>
        </div>
      )}

      {/* Debug Info */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-8 rounded-md border border-gray-300 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800">
          <details>
            <summary className="cursor-pointer text-sm font-medium text-gray-700 dark:text-gray-300">
              🔍 Debug Info
            </summary>
            <div className="mt-4 space-y-3 text-xs">
              <div className="rounded bg-white p-3 dark:bg-gray-900">
                <h4 className="mb-2 font-semibold text-gray-900 dark:text-gray-100">Form State</h4>
                <div className="space-y-1 text-gray-600 dark:text-gray-400">
                  <div>Form Valid: {isFormValid ? '✅' : '❌'}</div>
                  <div>Can Submit: {canSubmit ? '✅' : '❌'}</div>
                  <div>Is Submitting: {formState.isSubmitting ? '✅' : '❌'}</div>
                  <div>Language: {formState.language.name} ({formState.language.direction})</div>
                </div>
              </div>

              <div className="rounded bg-white p-3 dark:bg-gray-900">
                <h4 className="mb-2 font-semibold text-gray-900 dark:text-gray-100">Visibility</h4>
                <div className="space-y-1 text-gray-600 dark:text-gray-400">
                  <div>Visible Fields: {Object.values(visibilityMap.fields).filter(Boolean).length}</div>
                  <div>Visible Sections: {Object.values(visibilityMap.sections).filter(Boolean).length}</div>
                  <div>Visible Transitions: {Object.values(visibilityMap.transitions).filter(Boolean).length}</div>
                </div>
              </div>

              <div className="rounded bg-white p-3 dark:bg-gray-900">
                <h4 className="mb-2 font-semibold text-gray-900 dark:text-gray-100">Transitions</h4>
                <div className="space-y-1 text-gray-600 dark:text-gray-400">
                  <div>Available: {submitButtonState.availableTransitions.length}</div>
                  <div>Selected: {submitButtonState.submitLabel}</div>
                  <div>To Complete: {submitButtonState.availableTransitions.some(t => t.isComplete) ? '✅' : '❌'}</div>
                </div>
              </div>

              <div className="rounded bg-white p-3 dark:bg-gray-900">
                <h4 className="mb-2 font-semibold text-gray-900 dark:text-gray-100">Validation Errors</h4>
                {Object.keys(validationState.fieldErrors).length > 0 ? (
                  <ul className="list-inside list-disc space-y-1 text-red-600 dark:text-red-400">
                    {Object.entries(validationState.fieldErrors).map(([fieldId, error]) => (
                      error && <li key={fieldId}>Field {fieldId}: {error}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-green-600 dark:text-green-400">No validation errors ✓</p>
                )}
              </div>
            </div>
          </details>
        </div>
      )}
    </form>
  );
};

// ================================
// DEFAULT EXPORT
// ================================

export default FormStageRenderer;
