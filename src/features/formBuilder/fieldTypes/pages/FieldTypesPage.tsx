import React, { useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/table';
import { RefreshCw, ListChecks } from 'lucide-react';
import { ManageLayout } from '@/components/layouts/ManageLayout';
import { useFieldTypes } from '../hooks/useFieldTypes';
import type { FieldType } from '../types';
import { FieldTypeCombobox } from '../components/FieldTypeCombobox';
import { DynamicFieldBuilder } from '../components/NewFieldType';

const FieldTypesPage: React.FC = () => {
  const {
    fieldTypes,
    loading,
    error,
    isLoading,
    count,
    ensureLoaded,
    refetch,
  } = useFieldTypes({ autoFetch: true });
  console.log(fieldTypes);
  useEffect(() => {
    ensureLoaded();
  }, [ensureLoaded]);

  const handleRefresh = async () => {
    await refetch();
  };

  return (
    <ManageLayout
      title="Field Types"
      subtitle="Manage and view available form field types"
      mainButtons={
        <Button
          onClick={handleRefresh}
          variant="outline"
          disabled={isLoading}
          className="gap-2"
        >
          <RefreshCw
            className={isLoading ? 'h-4 w-4 animate-spin' : 'h-4 w-4'}
          />
          Refresh
        </Button>
      }
      backButton={{ show: false }}
    >
      <Card className="bg-card border-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ListChecks className="h-5 w-5" />
              <CardTitle className="text-lg sm:text-xl">
                Available Field Types
              </CardTitle>
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

          {loading === 'idle' || isLoading ? (
            <div className="flex items-center justify-center py-16 text-muted-foreground">
              <RefreshCw className="h-5 w-5 mr-2 animate-spin" /> Loading field
              types...
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[80px]">ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead className="hidden sm:table-cell">
                      Created
                    </TableHead>
                    <TableHead className="hidden sm:table-cell">
                      Updated
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {fieldTypes.map((type: FieldType) => (
                    <TableRow key={type.id}>
                      <TableCell className="font-mono text-xs">
                        {type.id}
                      </TableCell>
                      <TableCell className="font-medium">{type.name}</TableCell>
                      <TableCell className="hidden sm:table-cell text-xs text-muted-foreground">
                        {new Date(type.created_at).toLocaleString()}
                      </TableCell>
                      <TableCell className="hidden sm:table-cell text-xs text-muted-foreground">
                        {new Date(type.updated_at).toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}
                  {fieldTypes.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={4}
                        className="text-center text-muted-foreground"
                      >
                        No field types found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
      <div className="container mx-auto p-6">
        <h1 className="text-2xl font-bold mb-4">Field Type Selector</h1>
        <FieldTypeCombobox />
      </div>
      <div className="container mx-auto p-6">
        <h1 className="text-2xl font-bold mb-4">Field Type Selector</h1>
        <DynamicFieldBuilder />
      </div>
    </ManageLayout>
  );
};

export default FieldTypesPage;
