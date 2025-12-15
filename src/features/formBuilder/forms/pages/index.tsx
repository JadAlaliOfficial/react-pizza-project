// src/features/forms/components/FormsListPage.tsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
  useListForms,
  useCreateForm,
  useUpdateForm,
  useArchiveForm,
  useRestoreForm,
} from '../hooks/useForms';
import type {
  Form,
  CreateFormDto,
  UpdateFormDto,
  ListFormsQueryParams,
} from '../types';
import {
  useListCategories,
  useAssignFormsToCategory,
  useUnassignFormsFromCategory,
} from '@/features/formBuilder/categories/hooks/useCategories';
import { useCreateFormVersion } from '@/features/formBuilder/formVersions/hooks/useFormVersions';
import type {
  Category,
  AssignFormsToCategoryDto,
  UnassignFormsFromCategoryDto,
} from '@/features/formBuilder/categories/types';

// Drawer component
import { CategoriesDrawer } from '../components/CategoriesDrawer';

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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
import { Checkbox } from '@/components/ui/checkbox';
import {
  Loader2,
  Plus,
  Edit,
  Archive,
  ArchiveRestore,
  Link2,
  Link2Off,
  FolderTree,
  PlusCircle,
  List,
} from 'lucide-react';

export const FormsListPage: React.FC = () => {
  const navigate = useNavigate();

  // Query parameters state for filtering/pagination
  const [queryParams, setQueryParams] = useState<ListFormsQueryParams>({
    page: 1,
    per_page: 10,
    sort_by: 'creation_time',
    sort_order: 'desc',
  });

  // Hooks for forms
  const { forms, pagination, isLoading, error, refetch } =
    useListForms(queryParams);
  const { create, isLoading: isCreating } = useCreateForm();
  const { update, isLoading: isUpdating } = useUpdateForm();
  const { archive, isLoading: isArchiving } = useArchiveForm();
  const { restore, isLoading: isRestoring } = useRestoreForm();

  // Hooks for categories
  const { categories, isLoading: isCategoriesLoading } =
    useListCategories(true);
  const { assign, isLoading: isAssigning } = useAssignFormsToCategory();
  const { unassign, isLoading: isUnassigning } = useUnassignFormsFromCategory();

  // Create version dialog state
  const [formForNewVersion, setFormForNewVersion] = useState<Form | null>(null);
  const [copyFromCurrent, setCopyFromCurrent] = useState<boolean>(true);
  const { createFormVersion, loading: createVersionLoading } =
    useCreateFormVersion();

  // Categories drawer state
  const [isCategoriesDrawerOpen, setIsCategoriesDrawerOpen] = useState(false);

  // Dialog states
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  const [selectedForm, setSelectedForm] = useState<Form | null>(null);
  const [formToArchive, setFormToArchive] = useState<Form | null>(null);
  const [formToRestore, setFormToRestore] = useState<Form | null>(null);

  // Assign dialog state
  const [assignDialogForm, setAssignDialogForm] = useState<Form | null>(null);
  const [selectedCategoryIdForAssign, setSelectedCategoryIdForAssign] =
    useState('');

  // Form input states
  const [createFormData, setCreateFormData] = useState<{
    name: string;
    category_id: number | undefined;
  }>({
    name: '',
    category_id: undefined,
  });

  const [updateFormData, setUpdateFormData] = useState<{
    name: string;
    category_id: number | null;
  }>({
    name: '',
    category_id: null,
  });

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createFormData.name.trim()) {
      toast.error('Form name is required');
      return;
    }

    try {
      const payload: CreateFormDto = {
        name: createFormData.name.trim(),
        category_id: createFormData.category_id ?? null,
      };
      const newForm = await create(payload);
      toast.success('Form created successfully', {
        description: `"${newForm.name}" has been created with initial version.`,
      });
      setIsCreateDialogOpen(false);
      setCreateFormData({ name: '', category_id: undefined });

      const firstVersionId = newForm.form_versions?.[0]?.id;
      if (firstVersionId) {
        navigate(`/form-version-builder/${firstVersionId}`);
      } else {
        refetch();
      }
    } catch (err) {
      setIsCreateDialogOpen(false);
      toast.error('Failed to create form', {
        description:
          err instanceof Error ? err.message : 'An unexpected error occurred',
      });
    }
  };

  const handleUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedForm) return;
    if (!updateFormData.name.trim()) {
      toast.error('Form name is required');
      return;
    }

    try {
      const payload: UpdateFormDto = {
        name: updateFormData.name.trim(),
        category_id: updateFormData.category_id ?? null,
      };
      const updatedForm = await update(selectedForm.id, payload);
      toast.success('Form updated successfully', {
        description: `"${updatedForm.name}" has been updated.`,
      });
      setIsUpdateDialogOpen(false);
      setSelectedForm(null);
      refetch();
    } catch (err) {
      setIsUpdateDialogOpen(false);
      setSelectedForm(null);
      toast.error('Failed to update form', {
        description:
          err instanceof Error ? err.message : 'An unexpected error occurred',
      });
    }
  };

  const openUpdateDialog = (form: Form) => {
    setSelectedForm(form);
    setUpdateFormData({
      name: form.name,
      category_id: form.category_id ?? null,
    });
    setIsUpdateDialogOpen(true);
  };

  const handleArchiveConfirm = async () => {
    if (!formToArchive) return;

    try {
      const message = await archive(formToArchive.id);
      toast.success('Form archived', {
        description:
          message ||
          `"${formToArchive.name}" has been archived along with all its versions.`,
      });
      setFormToArchive(null);
      refetch();
    } catch (err) {
      toast.error('Failed to archive form', {
        description:
          err instanceof Error ? err.message : 'An unexpected error occurred',
      });
    }
  };

  const handleRestoreConfirm = async () => {
    if (!formToRestore) return;

    try {
      const message = await restore(formToRestore.id);
      toast.success('Form restored', {
        description:
          message ||
          `"${formToRestore.name}" has been restored. Latest version set as published.`,
      });
      setFormToRestore(null);
      refetch();
    } catch (err) {
      toast.error('Failed to restore form', {
        description:
          err instanceof Error ? err.message : 'An unexpected error occurred',
      });
    }
  };

  const handlePageChange = (newPage: number) => {
    setQueryParams((prev) => ({ ...prev, page: newPage }));
  };

  const handlePerPageChange = (newPerPage: string) => {
    setQueryParams((prev) => ({
      ...prev,
      per_page: parseInt(newPerPage, 10),
      page: 1,
    }));
  };

  // Assign / change category
  const openAssignDialog = (form: Form) => {
    setAssignDialogForm(form);
    setSelectedCategoryIdForAssign(
      form.category_id ? String(form.category_id) : '',
    );
  };

  const closeAssignDialog = () => {
    setAssignDialogForm(null);
    setSelectedCategoryIdForAssign('');
  };

  const handleAssignConfirm = async () => {
    if (!assignDialogForm || !selectedCategoryIdForAssign) return;

    try {
      const dto: AssignFormsToCategoryDto = {
        category_id: parseInt(selectedCategoryIdForAssign, 10),
        form_ids: [assignDialogForm.id],
      };
      const message = await assign(dto);
      toast.success('Category assigned', {
        description:
          message ||
          `"${assignDialogForm.name}" has been assigned to the selected category.`,
      });
      closeAssignDialog();
      refetch();
    } catch {
      // Errors surfaced via hook/toast
    }
  };

  // Unassign category
  const handleUnassign = async (form: Form) => {
    try {
      const dto: UnassignFormsFromCategoryDto = {
        form_ids: [form.id],
      };
      const message = await unassign(dto);
      toast.success('Category unassigned', {
        description:
          message || `"${form.name}" has been unassigned from its category.`,
      });
      refetch();
    } catch {
      // Errors surfaced via hook/toast
    }
  };

  // Handle new version creation with copy option
  const handleCreateVersionSubmit = async () => {
    if (!formForNewVersion) return;

    try {
      const version = await createFormVersion(formForNewVersion.id, {
        copy_from_current: copyFromCurrent,
      });
      toast.success('Form version created', {
        description: `Version #${version.version_number} created for "${formForNewVersion.name}".`,
      });
      setFormForNewVersion(null);
      setCopyFromCurrent(true);

      // Navigate to the new version
      if (version.id) {
        navigate(`/form-version-builder/${version.id}`);
      }
    } catch (err) {
      setFormForNewVersion(null);
      setCopyFromCurrent(true);
      toast.error('Failed to create form version', {
        description:
          err instanceof Error ? err.message : 'An unexpected error occurred',
      });
    }
  };

  const isAnyCategoryMutation = isAssigning || isUnassigning;

  return (
    <>
      {/* Header Section */}
      <Card className="mb-6">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-2xl font-bold">Forms Management</CardTitle>
          <div className="flex gap-2">
            {/* Categories Drawer button */}
            <Button
              variant="outline"
              onClick={() => setIsCategoriesDrawerOpen(true)}
            >
              <FolderTree className="mr-2 h-4 w-4" />
              Categories
            </Button>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create Form
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Create Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <form onSubmit={handleCreateSubmit}>
            <DialogHeader>
              <DialogTitle>Create New Form</DialogTitle>
              <DialogDescription>
                Create a new form with initial version, stage, and section.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="create-name">Form Name</Label>
                <Input
                  id="create-name"
                  value={createFormData.name}
                  onChange={(e) =>
                    setCreateFormData({
                      ...createFormData,
                      name: e.target.value,
                    })
                  }
                  placeholder="Enter form name"
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="create-category">Category</Label>
                <Select
                  value={
                    createFormData.category_id
                      ? String(createFormData.category_id)
                      : 'no'
                  }
                  onValueChange={(val) =>
                    setCreateFormData({
                      ...createFormData,
                      category_id: val === 'no' ? undefined : parseInt(val, 10),
                    })
                  }
                  disabled={isCategoriesLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="no">No category</SelectItem>
                    {categories.map((cat: Category) => (
                      <SelectItem key={cat.id} value={String(cat.id)}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
                {isCreating && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Create
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Error Display */}
      {error && (
        <Card className="mb-4 border-red-200 bg-red-50">
          <CardContent className="p-4 text-red-800">{error}</CardContent>
        </Card>
      )}

      {/* Table Section */}
      <Card>
        <CardContent className="p-6">
          {isLoading && forms.length === 0 ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : forms.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              No forms found. Create your first form to get started.
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {forms.map((form) => (
                    <TableRow key={form.id}>
                      <TableCell>{form.id}</TableCell>
                      <TableCell className="font-medium">{form.name}</TableCell>
                      <TableCell>
                        {form.category?.name || (
                          <Badge variant="outline">No category</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          {/* Edit form */}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openUpdateDialog(form)}
                            disabled={isUpdating}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>

                          {/* Assign / Change category */}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openAssignDialog(form)}
                            disabled={
                              isAnyCategoryMutation || isCategoriesLoading
                            }
                            className="gap-1"
                          >
                            <Link2 className="h-4 w-4" />
                            {form.category_id ? 'Change' : 'Assign'}
                          </Button>

                          {/* Unassign category */}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleUnassign(form)}
                            disabled={
                              !form.category_id || isAnyCategoryMutation
                            }
                            className="gap-1 text-orange-600 hover:text-orange-700"
                          >
                            <Link2Off className="h-4 w-4" />
                            Unassign
                          </Button>

                          {/* Archive / Restore */}
                          {form.is_archived ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setFormToRestore(form)}
                              disabled={isRestoring}
                              className="text-green-600 hover:text-green-700"
                            >
                              <ArchiveRestore className="h-4 w-4" />
                            </Button>
                          ) : (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setFormToArchive(form)}
                              disabled={isArchiving}
                              className="text-orange-600 hover:text-orange-700"
                            >
                              <Archive className="h-4 w-4" />
                            </Button>
                          )}

                          {/* New Version */}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setFormForNewVersion(form);
                              setCopyFromCurrent(true);
                            }}
                            className="gap-1 text-blue-600 hover:text-blue-700"
                          >
                            <PlusCircle className="h-4 w-4" />
                            New Version
                          </Button>

                          {/* Show All Versions */}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              navigate(`/list-form-versions/${form.id}`)
                            }
                            className="gap-1 text-purple-600 hover:text-purple-700"
                          >
                            <List className="h-4 w-4" />
                            Versions
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination Controls */}
              {pagination && (
                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      Rows per page:
                    </span>
                    <Select
                      value={String(queryParams.per_page)}
                      onValueChange={handlePerPageChange}
                    >
                      <SelectTrigger className="w-20">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="5">5</SelectItem>
                        <SelectItem value="10">10</SelectItem>
                        <SelectItem value="20">20</SelectItem>
                        <SelectItem value="50">50</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="text-sm text-muted-foreground">
                      Page {pagination.current_page} of {pagination.last_page} (
                      {pagination.total} total)
                    </span>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          handlePageChange(pagination.current_page - 1)
                        }
                        disabled={pagination.current_page === 1 || isLoading}
                      >
                        Previous
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          handlePageChange(pagination.current_page + 1)
                        }
                        disabled={
                          pagination.current_page === pagination.last_page ||
                          isLoading
                        }
                      >
                        Next
                      </Button>
                    </div>
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
          <form onSubmit={handleUpdateSubmit}>
            <DialogHeader>
              <DialogTitle>Update Form</DialogTitle>
              <DialogDescription>
                Update the name and category of the selected form.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="update-name">Form Name</Label>
                <Input
                  id="update-name"
                  value={updateFormData.name}
                  onChange={(e) =>
                    setUpdateFormData({
                      ...updateFormData,
                      name: e.target.value,
                    })
                  }
                  placeholder="Enter form name"
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="update-category">Category</Label>
                <Select
                  value={
                    updateFormData.category_id
                      ? String(updateFormData.category_id)
                      : 'no'
                  }
                  onValueChange={(val) =>
                    setUpdateFormData({
                      ...updateFormData,
                      category_id: val === 'no' ? null : parseInt(val, 10),
                    })
                  }
                  disabled={isCategoriesLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="no">No category</SelectItem>
                    {categories.map((cat: Category) => (
                      <SelectItem key={cat.id} value={String(cat.id)}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
                {isUpdating && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Update
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* New Version Dialog with Copy Option */}
      <Dialog
        open={!!formForNewVersion}
        onOpenChange={(open) => {
          if (!open) {
            setFormForNewVersion(null);
            setCopyFromCurrent(true);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Form Version</DialogTitle>
            <DialogDescription>
              Create a new version for "{formForNewVersion?.name}".
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="copy-from-current"
                checked={copyFromCurrent}
                onCheckedChange={(checked) =>
                  setCopyFromCurrent(checked as boolean)
                }
              />
              <Label
                htmlFor="copy-from-current"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Copy from current version
              </Label>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              {copyFromCurrent
                ? 'The new version will be a copy of the current version.'
                : 'The new version will start empty.'}
            </p>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setFormForNewVersion(null);
                setCopyFromCurrent(true);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateVersionSubmit}
              disabled={createVersionLoading}
            >
              {createVersionLoading && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Create Version
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Archive Confirmation Dialog */}
      <AlertDialog
        open={!!formToArchive}
        onOpenChange={(open) => !open && setFormToArchive(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Archive Form</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to archive "{formToArchive?.name}"? This
              will archive all versions of the form.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleArchiveConfirm}>
              {isArchiving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Archive
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Restore Confirmation Dialog */}
      <AlertDialog
        open={!!formToRestore}
        onOpenChange={(open) => !open && setFormToRestore(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Restore Form</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to restore "{formToRestore?.name}"? The
              latest version will be set as published.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleRestoreConfirm}>
              {isRestoring && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Restore
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Assign / Change Category Dialog */}
      <Dialog
        open={!!assignDialogForm}
        onOpenChange={(open) => !open && closeAssignDialog()}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {assignDialogForm?.category_id
                ? 'Change Category'
                : 'Assign Category'}
            </DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="assign-category">Category</Label>
              <Select
                value={selectedCategoryIdForAssign}
                onValueChange={(val) => setSelectedCategoryIdForAssign(val)}
                disabled={isCategoriesLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat: Category) => (
                    <SelectItem key={cat.id} value={String(cat.id)}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={closeAssignDialog}>
              Cancel
            </Button>
            <Button onClick={handleAssignConfirm} disabled={isAssigning}>
              {isAssigning && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Categories Drawer */}
      <CategoriesDrawer
        open={isCategoriesDrawerOpen}
        onOpenChange={() => setIsCategoriesDrawerOpen(false)}
      />
    </>
  );
};

export default FormsListPage;
