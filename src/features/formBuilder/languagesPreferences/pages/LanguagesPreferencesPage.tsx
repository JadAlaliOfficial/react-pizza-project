import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { ManageLayout } from '@/components/layouts/ManageLayout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { RefreshCw, CheckCircle, Circle } from 'lucide-react';
import { useLanguage } from '@/features/formBuilder/languagesPreferences/hooks/useLanguagesPreferences';

const LanguagesPreferencesPage: React.FC = () => {
  const {
    languages,
    defaultLanguage,
    loading,
    error,
    hasLanguages,
    refreshLanguages,
    refreshDefaultLanguage,
    updateDefaultLanguage,
    clearError,
    getLanguageOptions,
  } = useLanguage();

  const [selectedId, setSelectedId] = useState<string | undefined>(undefined);

  useEffect(() => {
    clearError();
  }, [clearError]);

  useEffect(() => {
    if (defaultLanguage?.id) {
      setSelectedId(String(defaultLanguage.id));
    }
  }, [defaultLanguage]);

  const total = useMemo(() => languages.length, [languages]);

  const handleRefresh = useCallback(async () => {
    await refreshLanguages();
    await refreshDefaultLanguage();
  }, [refreshLanguages, refreshDefaultLanguage]);

  const handleSave = useCallback(async () => {
    if (!selectedId) return;
    await updateDefaultLanguage(Number(selectedId));
  }, [selectedId, updateDefaultLanguage]);

  return (
    <ManageLayout
      title="Languages Preferences"
      subtitle="Set your default language for form localization"
      mainButtons={
        <div className="flex gap-2">
          <Button onClick={handleRefresh} variant="outline" disabled={loading} className="gap-2">
            <RefreshCw className={loading ? 'h-4 w-4 animate-spin' : 'h-4 w-4'} />
            Refresh
          </Button>
          <Button onClick={handleSave} disabled={loading || !selectedId} className="gap-2">
            Save
          </Button>
        </div>
      }
      backButton={{ show: false }}
    >
      <Card className="bg-card border-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CardTitle className="text-lg sm:text-xl">Default Language</CardTitle>
            </div>
            <div className="text-sm text-muted-foreground">Total: {total}</div>
          </div>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex items-center gap-3 mb-4">
            <span className="text-sm">Select default language</span>
            <Select value={selectedId} onValueChange={setSelectedId} disabled={loading || !hasLanguages}>
              <SelectTrigger className="w-56">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {getLanguageOptions().map((opt) => (
                  <SelectItem key={opt.value} value={String(opt.value)}>
                    {opt.label} ({opt.code})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px]">ID</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Default</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {languages.map((lang) => (
                  <TableRow key={lang.id}>
                    <TableCell className="font-mono text-xs">{lang.id}</TableCell>
                    <TableCell className="font-mono">{lang.code}</TableCell>
                    <TableCell>{lang.name}</TableCell>
                    <TableCell>
                      {defaultLanguage?.id === lang.id ? (
                        <div className="flex items-center gap-1 text-green-600">
                          <CheckCircle className="h-4 w-4" /> Default
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Circle className="h-4 w-4" />
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </ManageLayout>
  );
};

export default LanguagesPreferencesPage;

