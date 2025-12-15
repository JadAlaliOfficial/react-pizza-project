// src/features/categories/components/CategoriesDrawer.tsx
import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerClose,
} from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, Plus, Pencil, Trash2, Check, X } from 'lucide-react';

import {
  useListCategories,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
} from '../../categories/hooks/useCategories';
import type { Category, CreateCategoryDto, UpdateCategoryDto, Id } from '../../categories/types';

type CategoriesDrawerProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export const CategoriesDrawer: React.FC<CategoriesDrawerProps> = ({ open, onOpenChange }) => {
  const { categories, isLoading, error, refetch, clearError } = useListCategories(open);
  const {
    create,
    isLoading: isCreating,
    error: createError,
    clearError: clearCreateError,
  } = useCreateCategory();
  const {
    update,
    isLoading: isUpdating,
    error: updateError,
    clearError: clearUpdateError,
  } = useUpdateCategory();
  const {
    remove,
    isLoading: isDeleting,
    error: deleteError,
    clearError: clearDeleteError,
  } = useDeleteCategory();

  // Local UI state for creating and editing
  const [newCategoryName, setNewCategoryName] = useState('');
  const [editingId, setEditingId] = useState<Id | null>(null);
  const [editingName, setEditingName] = useState('');

  // Surface hook errors as toasts
  useEffect(() => {
    if (error) {
      toast.error('Failed to load categories', { description: error });
      clearError();
    }
  }, [error, clearError]);

  useEffect(() => {
    if (createError) {
      toast.error('Failed to create category', { description: createError });
      clearCreateError();
    }
  }, [createError, clearCreateError]);

  useEffect(() => {
    if (updateError) {
      toast.error('Failed to update category', { description: updateError });
      clearUpdateError();
    }
  }, [updateError, clearUpdateError]);

  useEffect(() => {
    if (deleteError) {
      toast.error('Failed to delete category', { description: deleteError });
      clearDeleteError();
    }
  }, [deleteError, clearDeleteError]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;

    const payload: CreateCategoryDto = { name: newCategoryName.trim() };
    try {
      const category = await create(payload);
      toast.success('Category created', {
        description: `"${category.name}" has been added.`,
      });
      setNewCategoryName('');
      refetch();
    } catch (err) {
      // Error already handled via hook & toast
    }
  };

  const startEditing = (category: Category) => {
    setEditingId(category.id);
    setEditingName(category.name);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditingName('');
  };

  const handleUpdate = async (categoryId: Id) => {
    if (!editingName.trim()) return;

    const payload: UpdateCategoryDto = { name: editingName.trim() };
    try {
      const updated = await update(categoryId, payload);
      toast.success('Category updated', {
        description: `"${updated.name}" has been updated.`,
      });
      cancelEditing();
      refetch();
    } catch (err) {
      // Error already handled via hook & toast
    }
  };

  const handleDelete = async (category: Category) => {
    try {
      const msg = await remove(category.id);
      toast.success('Category deleted', {
        description: msg || `"${category.name}" has been deleted. Forms in it are now uncategorized.`,
      });
      if (editingId === category.id) {
        cancelEditing();
      }
      refetch();
    } catch (err) {
      // Error already handled via hook & toast
    }
  };

  const isBusy = isCreating || isUpdating || isDeleting;

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-w-md ml-auto h-full flex flex-col">
        <DrawerHeader className="border-b">
          <DrawerTitle>Manage Categories</DrawerTitle>
          <DrawerDescription>
            Create, rename, or delete categories. Deleting a category keeps its forms but removes the category.
          </DrawerDescription>
        </DrawerHeader>

        {/* Create section */}
        <div className="p-4 border-b">
          <form onSubmit={handleCreate} className="space-y-2">
            <Label htmlFor="new-category-name">Create new category</Label>
            <div className="flex gap-2">
              <Input
                id="new-category-name"
                placeholder="Category name"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                disabled={isCreating}
              />
              <Button type="submit" disabled={isCreating || !newCategoryName.trim()}>
                {isCreating ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-1" />
                    Add
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>

        {/* List section */}
        <ScrollArea className="flex-1 p-4">
          {isLoading && categories.length === 0 ? (
            <div className="flex items-center justify-center py-8 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin mr-2" />
              <span>Loading categories...</span>
            </div>
          ) : categories.length === 0 ? (
            <p className="text-sm text-muted-foreground italic">
              No categories yet. Create your first category above.
            </p>
          ) : (
            <div className="space-y-3">
              {categories.map((category) => {
                const isEditing = editingId === category.id;
                return (
                  <div
                    key={category.id}
                    className="flex items-center gap-2 rounded-md border px-3 py-2"
                  >
                    <div className="flex-1">
                      {isEditing ? (
                        <Input
                          value={editingName}
                          onChange={(e) => setEditingName(e.target.value)}
                          autoFocus
                          disabled={isUpdating}
                        />
                      ) : (
                        <div>
                          <p className="font-medium text-sm">{category.name}</p>
                          <p className="text-xs text-muted-foreground">ID: {category.id}</p>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      {isEditing ? (
                        <>
                          <Button
                            size="icon"
                            variant="outline"
                            onClick={() => handleUpdate(category.id)}
                            disabled={isUpdating || !editingName.trim()}
                          >
                            {isUpdating ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Check className="h-4 w-4 text-green-600" />
                            )}
                          </Button>
                          <Button
                            size="icon"
                            variant="outline"
                            onClick={cancelEditing}
                            disabled={isUpdating}
                          >
                            <X className="h-4 w-4 text-red-500" />
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button
                            size="icon"
                            variant="outline"
                            onClick={() => startEditing(category)}
                            disabled={isBusy}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="outline"
                            onClick={() => handleDelete(category)}
                            disabled={isBusy}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>

        <div className="p-4 border-t flex justify-end">
          <DrawerClose asChild>
            <Button variant="outline">Close</Button>
          </DrawerClose>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default CategoriesDrawer;
