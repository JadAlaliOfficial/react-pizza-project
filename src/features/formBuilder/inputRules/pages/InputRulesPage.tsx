import React, { useMemo } from 'react';
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
import { useInputRules } from '@/features/formBuilder/inputRules/hooks/useInputRules';
import type { InputRule } from '@/features/formBuilder/inputRules/types';
const InputRulesPage: React.FC = () => {
  const { items, loading, error, refetch } = useInputRules();
  console.log(items);

  const count = useMemo(() => items.length, [items]);

  const handleRefresh = async () => {
    await refetch();
  };

  return (
    <ManageLayout
      title="Input Rules"
      subtitle="Manage and view available input validation rules"
      mainButtons={
        <Button
          onClick={handleRefresh}
          variant="outline"
          disabled={loading}
          className="gap-2"
        >
          <RefreshCw className={loading ? 'h-4 w-4 animate-spin' : 'h-4 w-4'} />
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
                Available Input Rules
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

          {loading ? (
            <div className="flex items-center justify-center py-16 text-muted-foreground">
              <RefreshCw className="h-5 w-5 mr-2 animate-spin" /> Loading input
              rules...
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[80px]">ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead className="hidden sm:table-cell">
                      Description
                    </TableHead>
                    <TableHead className="hidden sm:table-cell">
                      Public
                    </TableHead>
                    <TableHead className="hidden md:table-cell">
                      Field Types
                    </TableHead>
                    <TableHead className="hidden lg:table-cell">
                      Created
                    </TableHead>
                    <TableHead className="hidden lg:table-cell">
                      Updated
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((rule: InputRule) => (
                    <TableRow key={rule.id}>
                      <TableCell className="font-mono text-xs">
                        {rule.id}
                      </TableCell>
                      <TableCell className="font-medium">{rule.name}</TableCell>
                      <TableCell className="hidden sm:table-cell text-xs text-muted-foreground">
                        {rule.description}
                      </TableCell>
                      <TableCell className="hidden sm:table-cell text-xs">
                        {rule.is_public ? 'Yes' : 'No'}
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-xs text-muted-foreground">
                        {rule.field_types?.length ?? 0}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-xs text-muted-foreground">
                        {new Date(rule.created_at).toLocaleString()}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-xs text-muted-foreground">
                        {new Date(rule.updated_at).toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}
                  {items.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={7}
                        className="text-center text-muted-foreground"
                      >
                        No input rules found.
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

export default InputRulesPage;
