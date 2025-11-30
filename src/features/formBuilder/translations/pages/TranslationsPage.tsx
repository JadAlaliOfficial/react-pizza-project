import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ManageLayout } from '@/components/layouts/ManageLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { RefreshCw, Globe2, FileText } from 'lucide-react';
import { useTranslationsWorkflow } from '@/features/formBuilder/translations/hooks/useTranslations';
import { useListForms } from '@/features/formBuilder/forms/hooks/useForms';
import type { FieldTranslation } from '@/features/formBuilder/translations/types';

const TranslationsPage: React.FC = () => {
  const { forms, isLoading: formsLoading, error: formsError, refetch: refetchForms } = useListForms();

  const [selectedLanguageId, setSelectedLanguageId] = useState<number | null>(null);
  const [selectedFormId, setSelectedFormId] = useState<number | null>(null);
  const [selectedFormVersionId, setSelectedFormVersionId] = useState<number | null>(null);

  const { languages, localizableData, save, errorManagement } = useTranslationsWorkflow(
    selectedFormVersionId,
    selectedLanguageId
  );

  const [formName, setFormName] = useState<string>('');
  const [fieldTranslations, setFieldTranslations] = useState<Record<number, FieldTranslation>>({});

  const versions = useMemo(() => {
    const form = forms.find((f) => f.id === selectedFormId);
    return form ? form.form_versions : [];
  }, [forms, selectedFormId]);

  useEffect(() => {
    if (localizableData.data) {
      setFormName(localizableData.data.form_name || '');
      const initial: Record<number, FieldTranslation> = {};
      localizableData.data.fields.forEach((f) => {
        initial[f.field_id] = {
          field_id: f.field_id,
          label: f.label || '',
          helper_text: f.helper_text || '',
          default_value: f.default_value || '',
        };
      });
      setFieldTranslations(initial);
    }
  }, [localizableData.data]);

  const handleLanguageChange = useCallback((value: string) => {
    setSelectedLanguageId(parseInt(value, 10));
  }, []);

  const handleFormChange = useCallback((value: string) => {
    const id = parseInt(value, 10);
    setSelectedFormId(id);
    setSelectedFormVersionId(null);
  }, []);

  const handleFormVersionChange = useCallback((value: string) => {
    setSelectedFormVersionId(parseInt(value, 10));
  }, []);

  const handleFieldChange = useCallback((fieldId: number, key: keyof FieldTranslation, value: string) => {
    setFieldTranslations((prev) => ({
      ...prev,
      [fieldId]: {
        ...prev[fieldId],
        [key]: value,
      },
    }));
  }, []);

  const canFetch = useMemo(() => !!selectedLanguageId && !!selectedFormVersionId, [selectedLanguageId, selectedFormVersionId]);

  const handleRefreshData = useCallback(() => {
    if (canFetch) {
      localizableData.refetch();
    }
  }, [canFetch, localizableData]);

  const handleSave = useCallback(async () => {
    if (!selectedFormVersionId || !selectedLanguageId) return;
    const payload = {
      form_version_id: selectedFormVersionId,
      language_id: selectedLanguageId,
      form_name: formName,
      field_translations: Object.values(fieldTranslations),
    };
    await save.save(payload);
  }, [selectedFormVersionId, selectedLanguageId, formName, fieldTranslations, save]);

  const totalFields = useMemo(() => localizableData.data?.fields.length ?? 0, [localizableData.data]);

  return (
    <ManageLayout
      title="Translations"
      subtitle="Translate form versions into selected languages"
      mainButtons={
        <div className="flex gap-2">
          <Button onClick={() => languages.refetch()} variant="outline" disabled={languages.isLoading} className="gap-2">
            <Globe2 className={languages.isLoading ? 'h-4 w-4 animate-spin' : 'h-4 w-4'} />
            Refresh Languages
          </Button>
          <Button onClick={() => refetchForms()} variant="outline" disabled={formsLoading} className="gap-2">
            <RefreshCw className={formsLoading ? 'h-4 w-4 animate-spin' : 'h-4 w-4'} />
            Refresh Forms
          </Button>
        </div>
      }
      backButton={{ show: false }}
    >
      <Card className="bg-card border-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              <CardTitle className="text-lg sm:text-xl">Translation Setup</CardTitle>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {(errorManagement.errors.languages || errorManagement.errors.localizableData || errorManagement.errors.save) && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>
                {errorManagement.errors.languages?.message || errorManagement.errors.localizableData?.message || errorManagement.errors.save?.message}
              </AlertDescription>
            </Alert>
          )}

          {formsError && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{typeof formsError === 'string' ? formsError : 'Failed to load forms'}</AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Language</Label>
              <Select value={selectedLanguageId?.toString() ?? undefined} onValueChange={handleLanguageChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  {languages.languages.map((lang) => (
                    <SelectItem key={lang.id} value={lang.id.toString()}>
                      {lang.name} ({lang.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Form</Label>
              <Select value={selectedFormId?.toString() ?? undefined} onValueChange={handleFormChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select form" />
                </SelectTrigger>
                <SelectContent>
                  {forms.map((f) => (
                    <SelectItem key={f.id} value={f.id.toString()}>
                      {f.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Form Version</Label>
              <Select value={selectedFormVersionId?.toString() ?? undefined} onValueChange={handleFormVersionChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select version" />
                </SelectTrigger>
                <SelectContent>
                  {versions.map((v) => (
                    <SelectItem key={v.id} value={v.id.toString()}>
                      v{v.version_number} • {v.status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="mt-6 flex gap-2">
            <Button onClick={handleRefreshData} variant="outline" disabled={!canFetch || localizableData.isLoading} className="gap-2">
              <RefreshCw className={localizableData.isLoading ? 'h-4 w-4 animate-spin' : 'h-4 w-4'} />
              Load Translatable Data
            </Button>
            <Button onClick={handleSave} disabled={!canFetch || save.isSaving} className="gap-2">
              {save.isSaving && <RefreshCw className="h-4 w-4 animate-spin" />}
              Save Translations
            </Button>
          </div>

          {localizableData.isLoading && (
            <div className="flex items-center justify-center py-16 text-muted-foreground">
              <RefreshCw className="h-5 w-5 mr-2 animate-spin" /> Loading data...
            </div>
          )}

          {!localizableData.isLoading && localizableData.data && (
            <div className="mt-6 space-y-6">
              <div className="grid gap-2 max-w-xl">
                <Label>Form Name</Label>
                <Input value={formName} onChange={(e) => setFormName(e.target.value)} placeholder="Translated form name" />
              </div>

              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[80px]">Field ID</TableHead>
                      <TableHead>Label</TableHead>
                      <TableHead>Helper Text</TableHead>
                      <TableHead>Default Value</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {localizableData.data.fields.map((f) => (
                      <TableRow key={f.field_id}>
                        <TableCell className="font-mono text-xs">{f.field_id}</TableCell>
                        <TableCell>
                          <Input
                            value={fieldTranslations[f.field_id]?.label ?? ''}
                            onChange={(e) => handleFieldChange(f.field_id, 'label', e.target.value)}
                            placeholder="Label"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            value={fieldTranslations[f.field_id]?.helper_text ?? ''}
                            onChange={(e) => handleFieldChange(f.field_id, 'helper_text', e.target.value)}
                            placeholder="Helper text"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            value={fieldTranslations[f.field_id]?.default_value ?? ''}
                            onChange={(e) => handleFieldChange(f.field_id, 'default_value', e.target.value)}
                            placeholder="Default value"
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="text-sm text-muted-foreground">Total fields: {totalFields}</div>
            </div>
          )}
        </CardContent>
      </Card>
    </ManageLayout>
  );
};

export default TranslationsPage;

