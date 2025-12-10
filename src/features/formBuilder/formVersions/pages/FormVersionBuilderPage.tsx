// src/features/formVersion/pages/FormVersionBuilderPage.tsx

/**
 * Form Version Builder Page
 * Main page component that orchestrates form version editing
 * Uses Redux builder slice for draft state management
 * Extended to load field types and input rules for Fields tab
 */

import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Save, Upload, AlertCircle, CheckCircle } from 'lucide-react';
import { useFormVersion, usePublishFormVersion } from '../hooks/useFormVersions';
import { useFormVersionBuilder } from '../hooks/useFormVersionBuilder';
import { useBuilderSave } from '../hooks/useFormVersionBuilder.save';
import { useFieldTypes } from '@/features/formBuilder/fieldTypes/hooks/useFieldTypes';
import { useInputRules } from '@/features/formBuilder/inputRules/hooks/useInputRules';
import { FormVersionConfigDrawer } from '../components/ConfigDrawer/FormVersionConfigDrawer';
import { FormVersionLivePreview } from '../components/preview/FormVersionLivePreview';

// ============================================================================
// Component
// ============================================================================

/**
 * FormVersionBuilderPage Component
 * 
 * Main page for editing form versions with visual builder interface.
 * Features:
 * - Split layout: preview (left) + config (right)
 * - Redux builder slice for draft state
 * - Real-time data sync with server
 * - Save and publish operations
 * - Loading and error states
 * - Preloads field types and input rules for Fields tab
 */
export const FormVersionBuilderPage: React.FC = () => {
  console.info('[FormVersionBuilderPage] Initializing');

  // Get form version ID from route params
  const { id } = useParams<{ id: string }>();
  const formVersionId = id ? parseInt(id, 10) : null;

  // Server data hook (formVersion slice)
  const { formVersion, loading, error, refetch } = useFormVersion(formVersionId);

  // Builder hooks (formVersionBuilder slice)
  const builder = useFormVersionBuilder();
  const { save, saving, error: saveError } = useBuilderSave();

  // Publish hook
  const {
    publishFormVersion,
    loading: publishLoading,
    error: publishError,
  } = usePublishFormVersion();

  // Field types and input rules hooks (for Fields tab)
  const { 
    fieldTypes, 
    isLoading: fieldTypesLoading, 
    error: fieldTypesError,
    ensureLoaded: ensureFieldTypesLoaded 
  } = useFieldTypes();
  
  const { 
    items: inputRules, 
    loading: inputRulesLoading, 
    error: inputRulesError 
  } = useInputRules();

  // UI state for success messages
  const [saveSuccess, setSaveSuccess] = React.useState(false);
  const [publishSuccess, setPublishSuccess] = React.useState(false);

  // Initialize builder when formVersion loads
  useEffect(() => {
    if (formVersion) {
      console.info(
        '[FormVersionBuilderPage] FormVersion loaded, initializing builder'
      );
      builder.initializeFrom(formVersion);
    }
  }, [formVersion?.id]); // Only reinitialize when ID changes

  // Load field types and input rules on mount
  useEffect(() => {
    console.info('[FormVersionBuilderPage] Ensuring field types and input rules are loaded');
    ensureFieldTypesLoaded();
    // useInputRules hook auto-fetches on mount
  }, [ensureFieldTypesLoaded]);

  // Log field types and rules loading status
  useEffect(() => {
    console.debug(
      '[FormVersionBuilderPage] Metadata status:',
      {
        fieldTypes: fieldTypes.length,
        fieldTypesLoading,
        inputRules: inputRules.length,
        inputRulesLoading
      }
    );
  }, [fieldTypes.length, fieldTypesLoading, inputRules.length, inputRulesLoading]);

  // Cleanup builder on unmount
  useEffect(() => {
    return () => {
      console.debug('[FormVersionBuilderPage] Unmounting, resetting builder');
      builder.reset();
    };
  }, []);

  /**
   * Handles saving form version
   */
  const handleSave = async (): Promise<void> => {
    console.info('[FormVersionBuilderPage] Save triggered');
    setSaveSuccess(false);

    try {
      await save();

      console.info('[FormVersionBuilderPage] Save successful');
      setSaveSuccess(true);

      // Auto-hide success message after 3 seconds
      setTimeout(() => setSaveSuccess(false), 3000);

      // Refetch server data to sync real IDs
      if (formVersionId) {
        await refetch();
      }
    } catch (err) {
      console.error('[FormVersionBuilderPage] Save failed:', err);
      // Error is already in builder state via saveError
    }
  };

  /**
   * Handles publishing form version
   */
  const handlePublish = async (): Promise<void> => {
    if (!formVersionId) {
      console.error('[FormVersionBuilderPage] Cannot publish: No form version ID');
      return;
    }

    // Confirm before publishing
    const confirmed = window.confirm(
      'Are you sure you want to publish this form version? This will make it live.'
    );

    if (!confirmed) {
      console.debug('[FormVersionBuilderPage] Publish cancelled by user');
      return;
    }

    console.info('[FormVersionBuilderPage] Publishing form version', formVersionId);
    setPublishSuccess(false);

    try {
      await publishFormVersion(formVersionId);

      console.info('[FormVersionBuilderPage] Publish successful');
      setPublishSuccess(true);

      // Auto-hide success message after 3 seconds
      setTimeout(() => setPublishSuccess(false), 3000);

      // Refetch to sync with backend
      await refetch();
    } catch (err) {
      console.error('[FormVersionBuilderPage] Publish failed:', err);
      // Error is already in hook state via publishError
    }
  };

  // Loading state
  if (loading && !formVersion) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-sm text-gray-600">Loading form version...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !formVersion) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50 p-4">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Failed to load form version</strong>
            <p className="mt-2 text-sm">{error.message}</p>
            <Button onClick={() => refetch()} className="mt-4" variant="outline" size="sm">
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Invalid ID
  if (!formVersionId) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50 p-4">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Invalid form version ID</AlertDescription>
        </Alert>
      </div>
    );
  }

  const isPublished = formVersion?.status === 'published';
  const isDraft = formVersion?.status === 'draft';

  // Check if metadata is still loading
  const metadataLoading = fieldTypesLoading || inputRulesLoading;

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">
              {formVersion?.form?.name || 'Form Version Builder'}
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Version {formVersion?.version_number} •{' '}
              <span className={isDraft ? 'text-orange-600' : 'text-green-600'}>
                {formVersion?.status}
              </span>
              {builder.dirty && <span className="text-orange-600"> • Unsaved changes</span>}
              {builder.lastSavedAt && !builder.dirty && (
                <span className="text-green-600">
                  {' '}
                  • Saved {new Date(builder.lastSavedAt).toLocaleTimeString()}
                </span>
              )}
              {metadataLoading && (
                <span className="text-blue-600"> • Loading metadata...</span>
              )}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Save button */}
            <Button
              onClick={handleSave}
              disabled={saving || !builder.dirty}
              className="gap-2"
              variant="outline"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Save
                </>
              )}
            </Button>

            {/* Publish button */}
            <Button
              onClick={handlePublish}
              disabled={publishLoading || isPublished || builder.dirty}
              className="gap-2"
              title={builder.dirty ? 'Save changes before publishing' : ''}
            >
              {publishLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Publishing...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4" />
                  {isPublished ? 'Published' : 'Publish'}
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Success messages */}
        {saveSuccess && (
          <Alert className="mt-4 bg-green-50 border-green-200">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              Form version saved successfully!
            </AlertDescription>
          </Alert>
        )}

        {publishSuccess && (
          <Alert className="mt-4 bg-green-50 border-green-200">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              Form version published successfully!
            </AlertDescription>
          </Alert>
        )}

        {/* Error messages */}
        {saveError && (
          <Alert variant="destructive" className="mt-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Save failed:</strong> {saveError.message}
            </AlertDescription>
          </Alert>
        )}

        {publishError && (
          <Alert variant="destructive" className="mt-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Publish failed:</strong> {publishError.message}
            </AlertDescription>
          </Alert>
        )}

        {/* Metadata loading errors */}
        {fieldTypesError && (
          <Alert variant="destructive" className="mt-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Field types error:</strong> {fieldTypesError}
            </AlertDescription>
          </Alert>
        )}

        {inputRulesError && (
          <Alert variant="destructive" className="mt-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Input rules error:</strong> {inputRulesError}
            </AlertDescription>
          </Alert>
        )}
      </header>

      {/* Main content: side-by-side layout */}
      <div className="flex-1 flex gap-4 p-4 overflow-hidden">
        {/* Left: Live Preview */}
        <div className="flex-1 bg-white rounded-lg border border-gray-200 overflow-auto">
          <FormVersionLivePreview />
        </div>

        {/* Right: Config Panel */}
        <div className="w-[600px] bg-white rounded-lg border border-gray-200 overflow-auto">
          <FormVersionConfigDrawer open={true} onClose={() => {}} />
        </div>
      </div>
    </div>
  );
};
