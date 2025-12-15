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
import {
  Loader2,
  Plus,
  Edit,
  Archive,
  ArchiveRestore,
  RefreshCw,
  Link2,
  Link2Off,
  FolderTree,
  PlusCircle,
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
  const { forms, pagination, isLoading, error, refetch } = useListForms(queryParams);
  const { create, isLoading: isCreating } = useCreateForm();
  const { update, isLoading: isUpdating } = useUpdateForm();
  const { archive, isLoading: isArchiving } = useArchiveForm();
  const { restore, isLoading: isRestoring } = useRestoreForm();

  // Hooks for categories
  const {
    categories,
    isLoading: isCategoriesLoading,
  } = useListCategories(true);

  const {
    assign,
    isLoading: isAssigning,
  } = useAssignFormsToCategory();

  const {
    unassign,
    isLoading: isUnassigning,
  } = useUnassignFormsFromCategory();
  // Create version dialog state
  const [formForNewVersion, setFormForNewVersion] = useState<Form | null>(null);
  const { createFormVersion, loading: createVersionLoading } = useCreateFormVersion();

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
  const [selectedCategoryIdForAssign, setSelectedCategoryIdForAssign] = useState<string>('');

  // Form input states
  const [createFormData, setCreateFormData] = useState<CreateFormDto>({
    name: '',
    category_id: undefined,
  });
  const [updateFormData, setUpdateFormData] = useState<UpdateFormDto>({
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
        description: err instanceof Error ? err.message : 'An unexpected error occurred',
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
        description: err instanceof Error ? err.message : 'An unexpected error occurred',
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
          message || `"${formToArchive.name}" has been archived along with all its versions.`,
      });
      setFormToArchive(null);
      refetch();
    } catch (err) {
      toast.error('Failed to archive form', {
        description: err instanceof Error ? err.message : 'An unexpected error occurred',
      });
    }
  };

  const handleRestoreConfirm = async () => {
    if (!formToRestore) return;

    try {
      const message = await restore(formToRestore.id);
      toast.success('Form restored', {
        description:
          message || `"${formToRestore.name}" has been restored. Latest version set as published.`,
      });
      setFormToRestore(null);
      refetch();
    } catch (err) {
      toast.error('Failed to restore form', {
        description: err instanceof Error ? err.message : 'An unexpected error occurred',
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

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

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

  // Assign / change category
  const openAssignDialog = (form: Form) => {
    setAssignDialogForm(form);
    setSelectedCategoryIdForAssign(form.category_id ? String(form.category_id) : '');
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

  const isAnyCategoryMutation = isAssigning || isUnassigning;

  return (
    <>
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

              {/* Categories Drawer button */}
              <Button
                variant="outline"
                className="gap-2"
                onClick={() => setIsCategoriesDrawerOpen(true)}
              >
                <FolderTree className="h-4 w-4" />
                Categories
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
                            createFormData.category_id != null
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
                          <SelectTrigger id="create-category">
                            <SelectValue placeholder="Select category (optional)" />
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
                              <span className="text-muted-foreground italic">
                                No category
                              </span>
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
                              {/* Edit form */}
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openUpdateDialog(form)}
                                disabled={isUpdating}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>

                              {/* Assign / Change category */}
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openAssignDialog(form)}
                                disabled={isAnyCategoryMutation || isCategoriesLoading}
                                className="gap-1"
                              >
                                <Link2 className="h-4 w-4" />
                                {form.category_id ? 'Change' : 'Assign'}
                              </Button>

                              {/* Unassign category */}
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleUnassign(form)}
                                disabled={!form.category_id || isAnyCategoryMutation}
                                className="gap-1 text-orange-600 hover:text-orange-700"
                              >
                                <Link2Off className="h-4 w-4" />
                                Unassign
                              </Button>

                              {/* Archive / Restore */}
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
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setFormForNewVersion(form)}
                                className="gap-1 text-blue-600 hover:text-blue-700"
                              >
                                <PlusCircle className="h-4 w-4" />
                                New Version
                              </Button>
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
                      updateFormData.category_id != null
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
                    <SelectTrigger id="update-category">
                      <SelectValue placeholder="Select category (optional)" />
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
        <Dialog
          open={!!formForNewVersion}
          onOpenChange={(open) => !open && setFormForNewVersion(null)}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Form Version</DialogTitle>
              <DialogDescription>
                Create a new version for "{formForNewVersion?.name}". The backend will assign the next version number.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setFormForNewVersion(null)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                disabled={createVersionLoading || !formForNewVersion}
                onClick={async () => {
                  if (!formForNewVersion) return;
                  try {
                    const version = await createFormVersion(formForNewVersion.id);
                    toast.success('Form version created', {
                      description: `Version #${version.version_number} created for "${formForNewVersion.name}".`,
                    });
                    setFormForNewVersion(null);
                    navigate(`/form-version-builder/${version.id}`);
                  } catch (err) {
                    setFormForNewVersion(null);
                    toast.error('Failed to create form version', {
                      description: err instanceof Error ? err.message : 'An unexpected error occurred',
                    });
                  }
                }}
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
          onOpenChange={() => setFormToArchive(null)}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Archive Form</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to archive "{formToArchive?.name}"? This will
                archive all versions of the form.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleArchiveConfirm} disabled={isArchiving}>
                {isArchiving && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Archive
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Restore Confirmation Dialog */}
        <AlertDialog
          open={!!formToRestore}
          onOpenChange={() => setFormToRestore(null)}
        >
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
                {isRestoring && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
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
                {assignDialogForm?.category_id ? 'Change Category' : 'Assign Category'}
              </DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="assign-category-select">Category</Label>
                <Select
                  value={selectedCategoryIdForAssign}
                  onValueChange={(val) => setSelectedCategoryIdForAssign(val)}
                  disabled={isCategoriesLoading}
                >
                  <SelectTrigger id="assign-category-select">
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
              <Button type="button" variant="outline" onClick={closeAssignDialog}>
                Cancel
              </Button>
              <Button
                type="button"
                disabled={!selectedCategoryIdForAssign || isAssigning}
                onClick={handleAssignConfirm}
              >
                {isAssigning && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Save
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Categories Drawer */}
      <CategoriesDrawer
        open={isCategoriesDrawerOpen}
        onOpenChange={setIsCategoriesDrawerOpen}
      />
    </>
  );
};

export default FormsListPage;
