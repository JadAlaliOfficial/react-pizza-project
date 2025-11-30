import React, { useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { RefreshCw, ListChecks } from 'lucide-react';
import { ManageLayout } from '@/components/layouts/ManageLayout';
import { useActions } from '@/features/formBuilder/actions/hooks/useActions';
import type { Action } from '@/features/formBuilder/actions/types';

const ActionsPage: React.FC = () => {
  const { actions, status, error, refetch } = useActions({ autoFetch: true });
  const isLoading = status === 'loading';
  const count = useMemo(() => actions.length, [actions]);

  const handleRefresh = async () => {
    await refetch(true);
  };

  return (
    <ManageLayout
      title="Actions"
      subtitle="Manage and view available actions"
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
              <ListChecks className="h-5 w-5" />
              <CardTitle className="text-lg sm:text-xl">Available Actions</CardTitle>
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
              <RefreshCw className="h-5 w-5 mr-2 animate-spin" /> Loading actions...
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[80px]">ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead className="hidden sm:table-cell">Public</TableHead>
                    <TableHead className="hidden md:table-cell">Props Parsed</TableHead>
                    <TableHead className="hidden lg:table-cell">Created</TableHead>
                    <TableHead className="hidden lg:table-cell">Updated</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {actions.map((item: Action) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-mono text-xs">{item.id}</TableCell>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell className="hidden sm:table-cell text-xs">{item.is_public ? 'Yes' : 'No'}</TableCell>
                      <TableCell className="hidden md:table-cell text-xs">{item.parsed_props ? 'Yes' : 'No'}</TableCell>
                      <TableCell className="hidden lg:table-cell text-xs text-muted-foreground">{new Date(item.created_at).toLocaleString()}</TableCell>
                      <TableCell className="hidden lg:table-cell text-xs text-muted-foreground">{new Date(item.updated_at).toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                  {actions.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground">
                        No actions found.
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

export default ActionsPage;

