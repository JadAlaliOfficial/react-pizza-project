import React, { useEffect, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ManageLayout } from '@/components/layouts/ManageLayout';
import { RefreshCw, Languages as LanguagesIcon, CheckCircle, Circle } from 'lucide-react';
import { useLanguages } from '@/features/formBuilder/languages/hooks/useLanguages';

const LanguagesPage: React.FC = () => {
  const { languages, isLoading, isIdle, isError, error, defaultLanguage, refetch, clearError } = useLanguages({ fetchOnMount: true });

  useEffect(() => {
    clearError();
  }, [clearError]);

  const handleRefresh = useCallback(async () => {
    await refetch();
  }, [refetch]);

  const total = useMemo(() => languages?.length ?? 0, [languages]);

  return (
    <ManageLayout
      title="Languages"
      subtitle="Manage and view available form languages"
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
              <LanguagesIcon className="h-5 w-5" />
              <CardTitle className="text-lg sm:text-xl">Available Languages</CardTitle>
            </div>
            <div className="text-sm text-muted-foreground">Total: {total}</div>
          </div>
        </CardHeader>
        <CardContent>
          {isError && error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>
                {error.message} {error.status ? `(HTTP ${error.status})` : ''}
              </AlertDescription>
            </Alert>
          )}

          {isIdle || isLoading ? (
            <div className="flex items-center justify-center py-16 text-muted-foreground">
              <RefreshCw className="h-5 w-5 mr-2 animate-spin" /> Loading languages...
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[80px]">ID</TableHead>
                    <TableHead>Code</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Default</TableHead>
                    <TableHead className="text-right">Created</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {languages?.map((lang) => (
                    <TableRow key={lang.id}>
                      <TableCell className="font-mono text-xs">{lang.id}</TableCell>
                      <TableCell className="font-mono">{lang.code}</TableCell>
                      <TableCell>{lang.name}</TableCell>
                      <TableCell>
                        {lang.is_default ? (
                          <div className="flex items-center gap-1 text-green-600">
                            <CheckCircle className="h-4 w-4" /> Default
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Circle className="h-4 w-4" />
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {new Date(lang.created_at).toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {defaultLanguage && (
            <div className="mt-4 text-sm text-muted-foreground">
              Default language: <span className="font-medium">{defaultLanguage.name} ({defaultLanguage.code})</span>
            </div>
          )}
        </CardContent>
      </Card>
    </ManageLayout>
  );
};

export default LanguagesPage;

