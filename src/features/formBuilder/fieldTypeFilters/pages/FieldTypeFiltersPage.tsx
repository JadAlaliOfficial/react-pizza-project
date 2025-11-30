import React, { useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { RefreshCw, ListFilter } from 'lucide-react';
import { ManageLayout } from '@/components/layouts/ManageLayout';
import { useFieldTypeFilters } from '@/features/formBuilder/fieldTypeFilters/hooks/useFieldTypeFilters';
import type { FieldTypeFilter } from '@/features/formBuilder/fieldTypeFilters/types';

const FieldTypeFiltersPage: React.FC = () => {
  const { items, loading, error, refetch } = useFieldTypeFilters();

  const isLoading = loading;
  const count = useMemo(() => items.length, [items]);

  const handleRefresh = async () => {
    await refetch();
  };

  return (
    <ManageLayout
      title="Field Type Filters"
      subtitle="View configured filters for each form field type"
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
              <ListFilter className="h-5 w-5" />
              <CardTitle className="text-lg sm:text-xl">Available Field Type Filters</CardTitle>
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

          {isLoading ? (
            <div className="flex items-center justify-center py-16 text-muted-foreground">
              <RefreshCw className="h-5 w-5 mr-2 animate-spin" /> Loading field type filters...
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[80px]">ID</TableHead>
                    <TableHead>Field Type</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="hidden sm:table-cell">Created</TableHead>
                    <TableHead className="hidden sm:table-cell">Updated</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((filter: FieldTypeFilter) => (
                    <TableRow key={filter.id}>
                      <TableCell className="font-mono text-xs">{filter.id}</TableCell>
                      <TableCell className="font-medium">{filter.field_type?.name}</TableCell>
                      <TableCell className="text-sm">{filter.filter_method_description}</TableCell>
                      <TableCell className="hidden sm:table-cell text-xs text-muted-foreground">{new Date(filter.created_at).toLocaleString()}</TableCell>
                      <TableCell className="hidden sm:table-cell text-xs text-muted-foreground">{new Date(filter.updated_at).toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                  {items.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground">
                        No field type filters found.
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

export default FieldTypeFiltersPage;

