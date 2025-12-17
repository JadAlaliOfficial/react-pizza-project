/**
 * ================================
 * FORM PAGE - NEW RUNTIME SYSTEM
 * ================================
 * 
 * Simplified form page using the new runtime form system.
 * All complexity (visibility, validation, state management) is handled internally.
 */

import { useNavigate, useParams } from 'react-router-dom';
import { CompleteFormRenderer } from '@/features/formBuilder/endUserForms/ui/FormStageRenderer';
import { useFormStructure } from '@/features/formBuilder/endUserForms/hooks/formStructure.hook';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

export default function FormPage() {
  const navigate = useNavigate();
  const params = useParams<{ formVersionId: string; languageId: string }>();

  // Get form parameters from URL path
  const formVersionId = parseInt(params.formVersionId || '0');
  const languageId = parseInt(params.languageId || '1') as 1 | 2 | 3;
  
  // Optional: Get recordId from query params if editing existing record
  const recordId = undefined; // Or get from query params if needed

  // Fetch form structure
  const {
    data: formStructure,
    isLoading,
    error,
  } = useFormStructure({ formVersionId, languageId });

  // ================================
  // LOADING STATE
  // ================================

  if (isLoading) {
    return (
      <div className="container mx-auto max-w-4xl py-8">
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-64" />
          </CardHeader>
          <CardContent className="space-y-6">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
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
      <div className="container mx-auto max-w-4xl py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load form. Please try again later.
            {error && (
              <div className="mt-2 text-xs">
                Error: {error.message || 'Unknown error'}
              </div>
            )}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // ================================
  // SUCCESS HANDLERS
  // ================================

  const handleSuccess = (data: any) => {
    console.log('Form submitted successfully:', data);
    
    // Show success message or redirect
    navigate('/dashboard');
  };

  const handleError = (error: any) => {
    console.error('Form submission failed:', error);
    // Error is already displayed by the form renderer
  };

  // ================================
  // RENDER FORM
  // ================================

  return (
    <div className="container mx-auto max-w-4xl py-8">
      <Card>
        <CardContent className="pt-6">
          <CompleteFormRenderer
            formVersionId={formVersionId}
            recordId={recordId}
            languageId={languageId}
            formStructure={formStructure}
            onSuccess={handleSuccess}
            onError={handleError}
          />
        </CardContent>
      </Card>
    </div>
  );
}
