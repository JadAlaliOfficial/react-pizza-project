/**
 * ================================
 * FORMS LIST PAGE COMPONENT
 * ================================
 * Displays paginated list of forms with CRUD operations:
 * - List forms with filters and pagination
 * - Create new form
 * - Update existing form
 * - Archive/Restore forms
 * - Navigate to form details
 * 
 * Uses ShadCN components, Sonner for toasts, and Tailwind CSS styling
 */

import React, { useState } from 'react';
import { toast } from 'sonner';
import { useListForms, useCreateForm, useUpdateForm, useArchiveForm, useRestoreForm } from '../hooks/useForms';
import type { Form, CreateFormDto, UpdateFormDto, ListFormsQueryParams } from '../types';

// ShadCN component imports (adjust paths based on your setup)
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { Loader2, Plus, Edit, Archive, ArchiveRestore, RefreshCw } from 'lucide-react';

/**
 * Main Forms List Page Component
 */
export const FormsListPage: React.FC = () => {
  // Query parameters state for filtering/pagination
  const [queryParams, setQueryParams] = useState<ListFormsQueryParams>({
    page: 1,
    per_page: 10,
    sort_by: 'creation_time',
    sort_order: 'desc',
  });

  // Hooks for data fetching and operations
  const { forms, pagination, isLoading, error, refetch } = useListForms(queryParams);
  const { create, isLoading: isCreating, successMessage: _createSuccess, clearSuccess: _clearCreateSuccess } = useCreateForm();
  const { update, isLoading: isUpdating, successMessage: _updateSuccess, clearSuccess: _clearUpdateSuccess } = useUpdateForm();
  const { archive, isLoading: isArchiving, successMessage: _archiveSuccess, clearSuccess: _clearArchiveSuccess } = useArchiveForm();
  const { restore, isLoading: isRestoring, successMessage: _restoreSuccess, clearSuccess: _clearRestoreSuccess } = useRestoreForm();

  // Dialog states
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  const [selectedForm, setSelectedForm] = useState<Form | null>(null);
  const [formToArchive, setFormToArchive] = useState<Form | null>(null);
  const [formToRestore, setFormToRestore] = useState<Form | null>(null);

  // Form input states
  const [createFormData, setCreateFormData] = useState<CreateFormDto>({
    name: '',
    category_id: 1, // Default category
  });
  const [updateFormData, setUpdateFormData] = useState<UpdateFormDto>({
    name: '',
    category_id: 1,
  });

  /**
   * Handle create form submission
   */
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const newForm = await create(createFormData);
      toast.success('Form created successfully', {
        description: `"${newForm.name}" has been created with initial version.`,
      });
      setIsCreateDialogOpen(false);
      setCreateFormData({ name: '', category_id: 1 });
      refetch(); // Refresh list
    } catch (error) {
      setIsCreateDialogOpen(false);
      toast.error('Failed to create form', {
        description: error instanceof Error ? error.message : 'An unexpected error occurred',
      });
    }
  };

  /**
   * Handle update form submission
   */
  const handleUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedForm) return;

    try {
      const updatedForm = await update(selectedForm.id, updateFormData);
      toast.success('Form updated successfully', {
        description: `"${updatedForm.name}" has been updated.`,
      });
      setIsUpdateDialogOpen(false);
      setSelectedForm(null);
      refetch(); // Refresh list
    } catch (error) {
      setIsUpdateDialogOpen(false);
      setSelectedForm(null);
      toast.error('Failed to update form', {
        description: error instanceof Error ? error.message : 'An unexpected error occurred',
      });
    }
  };

  /**
   * Open update dialog with form data pre-filled
   */
  const openUpdateDialog = (form: Form) => {
    setSelectedForm(form);
    setUpdateFormData({
      name: form.name,
      category_id: form.category_id || 1,
    });
    setIsUpdateDialogOpen(true);
  };

  /**
   * Handle archive confirmation
   */
  const handleArchiveConfirm = async () => {
    if (!formToArchive) return;

    try {
      const message = await archive(formToArchive.id);
      toast.success('Form archived', {
        description: message || `"${formToArchive.name}" has been archived along with all its versions.`,
      });
      setFormToArchive(null);
      refetch(); // Refresh list
    } catch (error) {
      toast.error('Failed to archive form', {
        description: error instanceof Error ? error.message : 'An unexpected error occurred',
      });
    }
  };

  /**
   * Handle restore confirmation
   */
  const handleRestoreConfirm = async () => {
    if (!formToRestore) return;

    try {
      const message = await restore(formToRestore.id);
      toast.success('Form restored', {
        description: message || `"${formToRestore.name}" has been restored. Latest version set as published.`,
      });
      setFormToRestore(null);
      refetch(); // Refresh list
    } catch (error) {
      toast.error('Failed to restore form', {
        description: error instanceof Error ? error.message : 'An unexpected error occurred',
      });
    }
  };

  /**
   * Handle pagination change
   */
  const handlePageChange = (newPage: number) => {
    setQueryParams((prev) => ({ ...prev, page: newPage }));
  };

  /**
   * Handle per page change
   */
  const handlePerPageChange = (newPerPage: string) => {
    setQueryParams((prev) => ({ ...prev, per_page: parseInt(newPerPage), page: 1 }));
  };

  /**
   * Format date for display
   */
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  /**
   * Get status badge for form version
   */
  const getStatusBadge = (form: Form) => {
    const latestVersion = form.form_versions?.[0];
    if (!latestVersion) return null;

    const variantMap: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      draft: 'secondary',
      published: 'default',
      archived: 'destructive',
    };

    return (
      <Badge variant={variantMap[latestVersion.status] || 'outline'}>
        {latestVersion.status}
      </Badge>
    );
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      {/* Header Section */}
      <Card className="mb-6">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-2xl font-bold">Forms Management</CardTitle>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={refetch}
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Create Form
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Form</DialogTitle>
                  <DialogDescription>
                    Create a new form with initial version, stage, and section.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleCreateSubmit}>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="create-name">Form Name</Label>
                      <Input
                        id="create-name"
                        value={createFormData.name}
                        onChange={(e) =>
                          setCreateFormData({ ...createFormData, name: e.target.value })
                        }
                        placeholder="Enter form name"
                        required
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="create-category">Category ID</Label>
                      <Input
                        id="create-category"
                        type="number"
                        value={createFormData.category_id}
                        onChange={(e) =>
                          setCreateFormData({
                            ...createFormData,
                            category_id: parseInt(e.target.value),
                          })
                        }
                        placeholder="Enter category ID"
                        required
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsCreateDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isCreating}>
                      {isCreating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Create
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
      </Card>

      {/* Error Display */}
      {error && (
        <div className="bg-destructive/15 text-destructive px-4 py-3 rounded-md mb-6">
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      {/* Table Section */}
      <Card>
        <CardContent className="pt-6">
          {isLoading && forms.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : forms.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p>No forms found. Create your first form to get started.</p>
            </div>
          ) : (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[50px]">ID</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Version</TableHead>
                      <TableHead>Created At</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {forms.map((form) => (
                      <TableRow key={form.id}>
                        <TableCell className="font-medium">{form.id}</TableCell>
                        <TableCell className="font-semibold">{form.name}</TableCell>
                        <TableCell>
                          {form.category?.name || (
                            <span className="text-muted-foreground italic">No category</span>
                          )}
                        </TableCell>
                        <TableCell>{getStatusBadge(form)}</TableCell>
                        <TableCell>
                          {form.form_versions?.[0]
                            ? `v${form.form_versions[0].version_number}`
                            : '-'}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatDate(form.created_at)}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openUpdateDialog(form)}
                              disabled={isUpdating}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            {form.is_archived ? (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setFormToRestore(form)}
                                disabled={isRestoring}
                                className="text-green-600 hover:text-green-700"
                              >
                                <ArchiveRestore className="h-4 w-4" />
                              </Button>
                            ) : (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setFormToArchive(form)}
                                disabled={isArchiving}
                                className="text-orange-600 hover:text-orange-700"
                              >
                                <Archive className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination Controls */}
              {pagination && (
                <div className="flex items-center justify-between mt-4">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="per-page" className="text-sm">
                      Rows per page:
                    </Label>
                    <Select
                      value={queryParams.per_page?.toString()}
                      onValueChange={handlePerPageChange}
                    >
                      <SelectTrigger id="per-page" className="w-[80px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="5">5</SelectItem>
                        <SelectItem value="10">10</SelectItem>
                        <SelectItem value="20">20</SelectItem>
                        <SelectItem value="50">50</SelectItem>
                      </SelectContent>
                    </Select>
                    <span className="text-sm text-muted-foreground">
                      Page {pagination.current_page} of {pagination.last_page} (
                      {pagination.total} total)
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(pagination.current_page - 1)}
                      disabled={pagination.current_page === 1 || isLoading}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(pagination.current_page + 1)}
                      disabled={pagination.current_page === pagination.last_page || isLoading}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Update Dialog */}
      <Dialog open={isUpdateDialogOpen} onOpenChange={setIsUpdateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Form</DialogTitle>
            <DialogDescription>
              Update the name and category of the selected form.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdateSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="update-name">Form Name</Label>
                <Input
                  id="update-name"
                  value={updateFormData.name}
                  onChange={(e) =>
                    setUpdateFormData({ ...updateFormData, name: e.target.value })
                  }
                  placeholder="Enter form name"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="update-category">Category ID</Label>
                <Input
                  id="update-category"
                  type="number"
                  value={updateFormData.category_id}
                  onChange={(e) =>
                    setUpdateFormData({
                      ...updateFormData,
                      category_id: parseInt(e.target.value),
                    })
                  }
                  placeholder="Enter category ID"
                  required
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsUpdateDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isUpdating}>
                {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Update
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Archive Confirmation Dialog */}
      <AlertDialog open={!!formToArchive} onOpenChange={() => setFormToArchive(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Archive Form</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to archive "{formToArchive?.name}"? This will archive
              all versions of the form.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleArchiveConfirm} disabled={isArchiving}>
              {isArchiving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Archive
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Restore Confirmation Dialog */}
      <AlertDialog open={!!formToRestore} onOpenChange={() => setFormToRestore(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Restore Form</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to restore "{formToRestore?.name}"? The latest
              version will be set as published.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleRestoreConfirm} disabled={isRestoring}>
              {isRestoring && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Restore
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default FormsListPage;
