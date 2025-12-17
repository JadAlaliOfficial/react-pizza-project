// src/features/forms/components/ListFormVersionsPage.tsx

import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useGetForm } from '../hooks/useForms';
import { usePublishFormVersion } from '@/features/formBuilder/formVersions/hooks/useFormVersions';
import type { FormVersion } from '../types';

// ShadCN components
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Loader2, ArrowLeft, Eye, Edit, Send, Globe } from 'lucide-react';

export const ListFormVersionsPage: React.FC = () => {
  const { formId } = useParams<{ formId: string }>();
  const navigate = useNavigate();

  // Parse formId to number
  const parsedFormId = formId ? parseInt(formId, 10) : null;

  // Fetch form with all versions using the useGetForm hook
  const { form, isLoading, error, refetch } = useGetForm(parsedFormId);

  // Publish hook
  const { publishFormVersion, loading: isPublishing } = usePublishFormVersion();

  // State for publish confirmation dialog
  const [versionToPublish, setVersionToPublish] = useState<FormVersion | null>(null);

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusBadge = (status: string) => {
    const variantMap: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      draft: 'secondary',
      published: 'default',
      archived: 'destructive',
    };

    return (
      <Badge variant={variantMap[status] || 'outline'}>
        {status}
      </Badge>
    );
  };

  const handlePublishConfirm = async () => {
    if (!versionToPublish) return;

    try {
      await publishFormVersion(versionToPublish.id);
      toast.success('Form version published', {
        description: `Version ${versionToPublish.version_number} has been published successfully.`,
      });
      setVersionToPublish(null);
      // Refetch to get updated data
      refetch();
    } catch (err) {
      setVersionToPublish(null);
      toast.error('Failed to publish form version', {
        description: err instanceof Error ? err.message : 'An unexpected error occurred',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="p-6">
          <p className="text-red-800">{error}</p>
          <Button
            variant="outline"
            onClick={() => navigate('/forms')}
            className="mt-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Forms
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!form) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-muted-foreground">Form not found.</p>
          <Button
            variant="outline"
            onClick={() => navigate('/forms')}
            className="mt-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Forms
          </Button>
        </CardContent>
      </Card>
    );
  }

  const versions = form.form_versions || [];

  return (
    <>
      {/* Header Section */}
      <Card className="mb-6">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-2xl font-bold">Form Versions</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              All versions for: <strong>{form.name}</strong>
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => navigate('/forms')}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Forms
          </Button>
        </CardHeader>
      </Card>

      {/* Versions Table */}
      <Card>
        <CardContent className="p-6">
          {versions.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              No versions found for this form.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Version ID</TableHead>
                  <TableHead>Version Number</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Published At</TableHead>
                  <TableHead>Created At</TableHead>
                  <TableHead>Updated At</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {versions.map((version: FormVersion) => (
                  <TableRow key={version.id}>
                    <TableCell>{version.id}</TableCell>
                    <TableCell className="font-medium">
                      v{version.version_number}
                    </TableCell>
                    <TableCell>{getStatusBadge(version.status)}</TableCell>
                    <TableCell>
                      {version.published_at ? (
                        formatDate(version.published_at)
                      ) : (
                        <Badge variant="outline">Not published</Badge>
                      )}
                    </TableCell>
                    <TableCell>{formatDate(version.created_at)}</TableCell>
                    <TableCell>{formatDate(version.updated_at)}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {/* View Action */}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(`/form-version-builder/${version.id}`)}
                          className="gap-1 text-blue-600 hover:text-blue-700"
                          title="View version"
                        >
                          <Eye className="h-4 w-4" />
                          View
                        </Button>

                        {/* Translation Action */}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(`/translations/${parsedFormId}/${version.id}`)}
                          className="gap-1 text-orange-600 hover:text-orange-700"
                          title="Translate version"
                        >
                          <Globe className="h-4 w-4" />
                          Translate
                        </Button>

                        {/* Update Action - Only for draft versions */}
                        {version.status === 'draft' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate(`/form-version-builder/${version.id}`)}
                            className="gap-1 text-green-600 hover:text-green-700"
                            title="Edit version"
                          >
                            <Edit className="h-4 w-4" />
                            Edit
                          </Button>
                        )}

                        {/* Publish Action - Only for draft versions */}
                        {version.status === 'draft' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setVersionToPublish(version)}
                            disabled={isPublishing}
                            className="gap-1 text-purple-600 hover:text-purple-700"
                            title="Publish version"
                          >
                            <Send className="h-4 w-4" />
                            Publish
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Publish Confirmation Dialog */}
      <AlertDialog
        open={!!versionToPublish}
        onOpenChange={(open) => !open && setVersionToPublish(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Publish Form Version</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to publish version {versionToPublish?.version_number} of "{form?.name}"?
              This will make this version live and available for use.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handlePublishConfirm} disabled={isPublishing}>
              {isPublishing && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Publish
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default ListFormVersionsPage;
