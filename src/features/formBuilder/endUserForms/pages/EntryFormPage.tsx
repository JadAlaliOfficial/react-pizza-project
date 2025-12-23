/**
 * ================================
 * ENTRY FORM PAGE
 * ================================
 *
 * Page for viewing and continuing a multi-stage form entry.
 * Renders history (read-only stages) and the current active stage.
 *
 * Key Responsibilities:
 * - Fetch form entry by public identifier
 * - Display loading/error states
 * - Render read-only history of previous stages
 * - Render active stage for user completion
 * - Handle successful submission navigation
 */

import { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useFormEntry } from '../hooks/formStructure.hook';
import { ActiveStageRenderer } from '../ui/ActiveStageRenderer';
import { ReadOnlyStageRenderer } from '../ui/ReadOnlyStageRenderer';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { LANGUAGE_MAP, type LanguageId } from '../types/runtime.types';
import type { FormStructureData } from '../types/formStructure.types';

export default function EntryFormPage() {
  // const navigate = useNavigate();
  const params = useParams<{ publicIdentifier: string; languageId: string }>();

  const publicIdentifier = params.publicIdentifier || '';
  const languageId = (parseInt(params.languageId || '1') || 1) as LanguageId;
  const languageConfig = LANGUAGE_MAP[languageId];

  // ================================
  // DATA FETCHING
  // ================================

  const {
    data: entryData,
    isLoading,
    error,
  } = useFormEntry({
    publicIdentifier,
    languageId,
    fetchOnMount: true,
  });

  // ================================
  // DERIVED STATE
  // ================================

  const { activeStage, historyStages, formStructure } = useMemo(() => {
    if (!entryData) {
      return { activeStage: null, historyStages: [], formStructure: null };
    }

    // Sort stages by ID or rely on array order? usually array order is chronological
    // or we might need a sequence number. The API usually returns them in order.
    // The instructions don't specify order, but we can assume the array order is correct.

    const historyStages = entryData.stages.filter((s) => !s.is_current);
    const activeStageEntry = entryData.stages.find((s) => s.is_current);

    let formStructure: FormStructureData | null = null;
    if (activeStageEntry) {
      formStructure = {
        form_version_id: 0, // Not used in later stage runtime
        version_number: 0, // Not used in later stage runtime
        form_name: entryData.form_name,
        stage: activeStageEntry.structure,
        available_transitions: entryData.available_transitions,
      };
    }

    return {
      activeStage: activeStageEntry,
      historyStages,
      formStructure,
    };
  }, [entryData]);

  // ================================
  // LOADING STATE
  // ================================

  if (isLoading) {
    return (
      <div className="container mx-auto py-8" dir={languageConfig.direction}>
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-64" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-10 w-32" />
          </CardContent>
        </Card>
      </div>
    );
  }

  // ================================
  // ERROR STATE
  // ================================

  if (error || (!entryData && !isLoading)) {
    return (
      <div className="container mx-auto py-8" dir={languageConfig.direction}>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error?.message || 'Failed to load form entry. Please check the link and try again.'}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // ================================
  // COMPLETED STATE
  // ================================

  if (entryData?.is_complete) {
    return (
      <div className="container mx-auto py-8" dir={languageConfig.direction}>
        <Card className="border-green-200 bg-green-50">
          <CardContent className="flex flex-col items-center py-12 text-center">
            <CheckCircle2 className="mb-4 h-16 w-16 text-green-500" />
            <h1 className="mb-2 text-2xl font-bold text-green-900">
              Form Completed
            </h1>
            <p className="text-green-700">
              This form entry has been successfully completed.
            </p>
          </CardContent>
        </Card>
        
        {/* Still show history? Maybe. */}
        {historyStages.length > 0 && (
          <div className="mt-8 space-y-8 opacity-75">
            {historyStages.map((stage) => (
              <Card key={stage.stage_id}>
                <CardContent className="pt-6">
                  <ReadOnlyStageRenderer
                    stage={stage.structure}
                    languageId={languageId}
                  />
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    );
  }

  // ================================
  // ACTIVE STATE
  // ================================

  return (
    <div className="container mx-auto space-y-8 py-8" dir={languageConfig.direction}>
      {/* Form Title */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          {entryData?.form_name}
        </h1>
        {entryData?.public_identifier && (
          <p className="mt-1 text-sm text-gray-500 font-mono">
            ID: {entryData.public_identifier}
          </p>
        )}
      </div>

      {/* History Stages (Read Only) */}
      {historyStages.map((stage) => (
        <Card key={stage.stage_id} className="border-gray-200 bg-gray-50/50">
          <CardContent className="pt-6">
            <ReadOnlyStageRenderer
              stage={stage.structure}
              languageId={languageId}
            />
          </CardContent>
        </Card>
      ))}

      {/* Active Stage */}
      {formStructure && activeStage && (
        <Card className="border-blue-200 shadow-md ring-1 ring-blue-100">
          <CardContent className="pt-6">
            <ActiveStageRenderer
              formStructure={formStructure}
              entryPublicIdentifier={publicIdentifier}
              languageId={languageId}
              onSuccess={(data) => {
                if (data.is_complete) {
                  // Navigate to success page or refresh to show completion
                  // Ideally we reload the entry data to show the completed state
                  // But for now let's show a success message or navigate
                  // Maybe refetch entry?
                  window.location.reload(); 
                } else {
                  // If there's a next stage, reload to show it
                  window.location.reload();
                }
              }}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
