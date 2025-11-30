import React, { useMemo, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { RefreshCw, FolderTree, Plus } from 'lucide-react';
import { ManageLayout } from '@/components/layouts/ManageLayout';
import { useListCategories, useCreateCategory, useUpdateCategory, useDeleteCategory } from '@/features/formBuilder/catagories/hooks/useCatagories';
import type { Category, CreateCategoryDto } from '@/features/formBuilder/catagories/types';
import { Pencil, Trash2, Save, X } from 'lucide-react';

const CatagoriesPage: React.FC = () => {
  const { categories, isLoading, error, refetch } = useListCategories();
  const { create, isLoading: isCreating, error: createError, successMessage, clearError, clearSuccess } = useCreateCategory();
  const { update, isLoading: isUpdating, error: updateError, successMessage: updateSuccess, clearError: clearUpdateError, clearSuccess: clearUpdateSuccess } = useUpdateCategory();
  const { remove, isLoading: isDeleting, error: deleteError, successMessage: deleteSuccess, clearError: clearDeleteError, clearSuccess: clearDeleteSuccess } = useDeleteCategory();

  const count = useMemo(() => categories.length, [categories]);

  const [name, setName] = useState('');
  const [editing, setEditing] = useState<{ id: number; name: string } | null>(null);

  const handleRefresh = async () => {
    await refetch();
  };

  const handleCreate = async () => {
    if (!name.trim()) return;
    const payload: CreateCategoryDto = { name: name.trim() };
    try {
      await create(payload);
      setName('');
      await refetch();
    } catch (e) {
      // Errors are handled via slice state; keep silent here
    }
  };

  const handleStartEdit = (category: Category) => {
    setEditing({ id: category.id, name: category.name });
  };

  const handleCancelEdit = () => {
    setEditing(null);
  };

  const handleSaveEdit = async () => {
    if (!editing) return;
    const newName = editing.name.trim();
    if (!newName) return;
    try {
      await update(editing.id, { name: newName });
      setEditing(null);
      await refetch();
    } catch {}
  };

  const handleDelete = async (id: number, nameToDelete: string) => {
    const ok = window.confirm(`Delete category "${nameToDelete}"?`);
    if (!ok) return;
    try {
      await remove(id);
      await refetch();
    } catch {}
  };

  return (
    <ManageLayout
      title="Form Categories"
      subtitle="Group forms under named categories"
      mainButtons={
        <Button onClick={handleRefresh} variant="outline" disabled={isLoading} className="gap-2">
          <RefreshCw className={isLoading ? 'h-4 w-4 animate-spin' : 'h-4 w-4'} />
          Refresh
        </Button>
      }
      backButton={{ show: false }}
    >
      <Card className="bg-card border-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FolderTree className="h-5 w-5" />
              <CardTitle className="text-lg sm:text-xl">Categories</CardTitle>
            </div>
            <div className="text-sm text-muted-foreground">Total: {count}</div>
          </div>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="text-red-600 bg-red-50 border border-red-200 rounded p-3 mb-4 text-sm">
              {error}
            </div>
          )}

          {(createError || successMessage || updateError || updateSuccess || deleteError || deleteSuccess) && (
            <div className="mb-4 flex gap-2">
              {createError && (
                <div className="text-red-600 bg-red-50 border border-red-200 rounded p-2 text-xs" onClick={clearError}>
                  {createError}
                </div>
              )}
              {successMessage && (
                <div className="text-green-700 bg-green-50 border border-green-200 rounded p-2 text-xs" onClick={clearSuccess}>
                  {successMessage}
                </div>
              )}
              {updateError && (
                <div className="text-red-600 bg-red-50 border border-red-200 rounded p-2 text-xs" onClick={clearUpdateError}>
                  {updateError}
                </div>
              )}
              {updateSuccess && (
                <div className="text-green-700 bg-green-50 border border-green-200 rounded p-2 text-xs" onClick={clearUpdateSuccess}>
                  {updateSuccess}
                </div>
              )}
              {deleteError && (
                <div className="text-red-600 bg-red-50 border border-red-200 rounded p-2 text-xs" onClick={clearDeleteError}>
                  {deleteError}
                </div>
              )}
              {deleteSuccess && (
                <div className="text-green-700 bg-green-50 border border-green-200 rounded p-2 text-xs" onClick={clearDeleteSuccess}>
                  {deleteSuccess}
                </div>
              )}
            </div>
          )}

          <div className="mb-4 flex items-center gap-2">
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="New category name"
              className="w-64"
            />
            <Button onClick={handleCreate} disabled={isCreating || !name.trim()} className="gap-2">
              {isCreating ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              Create
            </Button>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-16 text-muted-foreground">
              <RefreshCw className="h-5 w-5 mr-2 animate-spin" /> Loading categories...
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[80px]">ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead className="hidden lg:table-cell">Created</TableHead>
                    <TableHead className="hidden lg:table-cell">Updated</TableHead>
                    <TableHead className="w-[140px] text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {categories.map((category: Category) => (
                    <TableRow key={category.id}>
                      <TableCell className="font-mono text-xs">{category.id}</TableCell>
                      <TableCell className="font-medium">
                        {editing?.id === category.id ? (
                          <Input
                            value={editing.name}
                            onChange={(e) => setEditing({ id: category.id, name: e.target.value })}
                            className="max-w-xs"
                          />
                        ) : (
                          category.name
                        )}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-xs text-muted-foreground">
                        {new Date(category.created_at).toLocaleString()}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-xs text-muted-foreground">
                        {new Date(category.updated_at).toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right">
                        {editing?.id === category.id ? (
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="icon" onClick={handleSaveEdit} disabled={isUpdating}>
                              <Save className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={handleCancelEdit} disabled={isUpdating}>
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="icon" onClick={() => handleStartEdit(category)} disabled={isUpdating}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(category.id, category.name)}
                              disabled={isDeleting}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                  {categories.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground">
                        No categories found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </ManageLayout>
  );
};

export default CatagoriesPage;
