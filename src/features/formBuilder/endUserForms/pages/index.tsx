/**
 * ================================
 * FORM PAGE - RUNTIME SYSTEM
 * ================================
 *
 * Main form page using the runtime form system.
 *
 * Responsibilities:
 * - Route parameter extraction (formVersionId, languageId)
 * - Fetch form structure via useFormStructure
 * - Apply RTL/language at page level (not in field components)
 * - Pass form structure to renderer
 * - Handle loading, error, and success states
 *
 * Architecture Decisions:
 * - Page-level RTL application (dir attribute on root element)
 * - Language configuration centralized via LANGUAGE_MAP
 * - All business logic delegated to runtime form hook and renderer
 * - Clean separation: routing/loading vs form rendering
 * - No debug logs
 */

import { useNavigate, useParams } from 'react-router-dom';
import { CompleteFormRenderer } from '@/features/formBuilder/endUserForms/ui/FormStageRenderer';
import { useFormStructure } from '@/features/formBuilder/endUserForms/hooks/formStructure.hook';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { LANGUAGE_MAP, type LanguageId } from '@/features/formBuilder/endUserForms/types/runtime.types';

export default function FormPage() {
  const navigate = useNavigate();
  const params = useParams<{ formVersionId: string; languageId: string }>();

  const formVersionId = parseInt(params.formVersionId || '0');
  const languageId = parseInt(params.languageId || '1') as LanguageId;
  const recordId = undefined;

  const languageConfig = LANGUAGE_MAP[languageId];

  const {
    data: formStructure,
    isLoading,
    error,
  } = useFormStructure({
    formVersionId,
    languageId,
  });

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

  if (error || !formStructure) {
    return (
      <div className="container mx-auto py-8" dir={languageConfig.direction}>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error?.message || 'Failed to load form. Please try again.'}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // ================================
  // SUCCESS STATE - RENDER FORM
  // ================================

  return (
    <div className="container mx-auto py-8" dir={languageConfig.direction}>
      <CompleteFormRenderer
        formStructure={formStructure}
        formVersionId={formVersionId}
        languageId={languageId}
        recordId={recordId}
        onSuccess={(data) => {
          if (data.is_complete) {
            navigate('/forms/success');
          } else {
            navigate(`/forms/${formVersionId}/stage/${data.current_stage_id}`);
          }
        }}
      />
    </div>
  );
}
