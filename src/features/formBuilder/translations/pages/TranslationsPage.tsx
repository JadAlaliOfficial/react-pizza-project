import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ManageLayout } from '@/components/layouts/ManageLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  RefreshCw,
  Globe2,
  FileText,
  Save,
  Download,
  CheckCircle2,
  AlertCircle,
  Languages,
  ChevronRight,
} from 'lucide-react';
import { useTranslationsWorkflow } from '@/features/formBuilder/translations/hooks/useTranslations';
import {
  useListForms,
  useGetForm,
} from '@/features/formBuilder/forms/hooks/useForms';
import type { 
  FieldTranslation,
  LocalizableField 
} from '@/features/formBuilder/translations/types';

const TranslationsPage: React.FC = () => {
  const {
    forms = [],
    isLoading: formsLoading,
    error: formsError,
    refetch: refetchForms,
  } = useListForms();

  const [selectedLanguageId, setSelectedLanguageId] = useState<number | null>(null);
  const [selectedFormId, setSelectedFormId] = useState<number | null>(null);
  const [selectedFormVersionId, setSelectedFormVersionId] = useState<number | null>(null);

  const {
    form: selectedForm,
    isLoading: formDetailsLoading,
    error: formDetailsError,
  } = useGetForm(selectedFormId, !!selectedFormId);

  const { languages, localizableData, save, errorManagement } =
    useTranslationsWorkflow(selectedFormVersionId, selectedLanguageId);

  // Local state for translated values
  const [translatedFormName, setTranslatedFormName] = useState('');
  const [fieldTranslations, setFieldTranslations] = useState<Record<number, FieldTranslation>>({});

  const versions = useMemo(() => {
    if (!selectedForm || !selectedForm.form_versions) {
      return [];
    }
    return selectedForm.form_versions;
  }, [selectedForm]);

  useEffect(() => {
    setSelectedFormVersionId(null);
  }, [selectedFormId]);

  // Populate translated values from nested structure
  useEffect(() => {
    if (localizableData.data) {
      // Set translated form name
      setTranslatedFormName(localizableData.data.form_name.translated || '');

      // Initialize field translations from the nested structure
      const initial: Record<number, FieldTranslation> = {};
      localizableData.data.fields.forEach((field: LocalizableField) => {
        initial[field.field_id] = {
          field_id: field.field_id,
          label: field.translated.label || '',
          helper_text: field.translated.helper_text || '',
          default_value: field.translated.default_value || '',
          place_holder: field.translated.place_holder || '',
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
  }, []);

  const handleFormVersionChange = useCallback((value: string) => {
    setSelectedFormVersionId(parseInt(value, 10));
  }, []);

  const handleFieldChange = useCallback(
    (fieldId: number, key: keyof FieldTranslation, value: string) => {
      setFieldTranslations((prev) => ({
        ...prev,
        [fieldId]: {
          ...prev[fieldId],
          [key]: value,
        },
      }));
    },
    []
  );

  const canFetch = useMemo(
    () => !!selectedLanguageId && !!selectedFormVersionId,
    [selectedLanguageId, selectedFormVersionId]
  );

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
      form_name: translatedFormName,
      field_translations: Object.values(fieldTranslations),
    };

    await save.save(payload);
  }, [
    selectedFormVersionId,
    selectedLanguageId,
    translatedFormName,
    fieldTranslations,
    save,
  ]);

  const totalFields = useMemo(
    () => localizableData.data?.fields.length ?? 0,
    [localizableData.data]
  );

  const translationProgress = useMemo(() => {
    if (!localizableData.data) return 0;
    const total = localizableData.data.fields.length;
    if (total === 0) return 0;

    const translated = Object.values(fieldTranslations).filter(
      (ft) => ft.label || ft.helper_text || ft.default_value || ft.place_holder
    ).length;

    return Math.round((translated / total) * 100);
  }, [fieldTranslations, localizableData.data]);

  const selectedLanguage = useMemo(
    () => languages.languages.find((lang) => lang.id === selectedLanguageId),
    [languages.languages, selectedLanguageId]
  );

  return (
    <ManageLayout
      title="Form Translations"
      subtitle="Translate your forms into multiple languages"
      mainButtons={
        <div className="flex gap-2">
          <Button
            onClick={() => languages.refetch()}
            variant="outline"
            size="sm"
            disabled={languages.isLoading}
            className="gap-2"
          >
            <Globe2
              className={languages.isLoading ? 'h-4 w-4 animate-spin' : 'h-4 w-4'}
            />
            Refresh Languages
          </Button>
          <Button
            onClick={() => refetchForms()}
            variant="outline"
            size="sm"
            disabled={formsLoading}
            className="gap-2"
          >
            <RefreshCw className={formsLoading ? 'h-4 w-4 animate-spin' : 'h-4 w-4'} />
            Refresh Forms
          </Button>
        </div>
      }
      backButton={{ show: false }}
    >
      {/* Error Display */}
      {(errorManagement.errors.languages ||
        errorManagement.errors.localizableData ||
        errorManagement.errors.save) && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {errorManagement.errors.languages?.message ||
              errorManagement.errors.localizableData?.message ||
              errorManagement.errors.save?.message}
          </AlertDescription>
        </Alert>
      )}

      {formsError && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {typeof formsError === 'string' ? formsError : 'Failed to load forms'}
          </AlertDescription>
        </Alert>
      )}

      {formDetailsError && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {typeof formDetailsError === 'string'
              ? formDetailsError
              : 'Failed to load form details'}
          </AlertDescription>
        </Alert>
      )}

      {/* Success Message */}
      {save.lastSaveSuccess && (
        <Alert className="mb-6 border-green-200 bg-green-50 text-green-800">
          <CheckCircle2 className="h-4 w-4" />
          <AlertDescription>Translations saved successfully!</AlertDescription>
        </Alert>
      )}

      {/* Selection Card */}
      <Card className="mb-6 border-border bg-card shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Languages className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">Translation Configuration</CardTitle>
            </div>
            {selectedLanguage && (
              <Badge variant="secondary" className="gap-1">
                <Globe2 className="h-3 w-3" />
                {selectedLanguage.name}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {/* Language Selection */}
            <div className="space-y-2">
              <Label htmlFor="language-select" className="text-sm font-medium">
                Target Language
              </Label>
              <Select
                value={selectedLanguageId?.toString() ?? undefined}
                onValueChange={handleLanguageChange}
              >
                <SelectTrigger id="language-select" className="w-full">
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  {languages.languages.map((lang) => (
                    <SelectItem key={lang.id} value={lang.id.toString()}>
                      <div className="flex items-center gap-2">
                        <Globe2 className="h-4 w-4" />
                        <span>{lang.name}</span>
                        <Badge variant="outline" className="text-xs">
                          {lang.code}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Form Selection */}
            <div className="space-y-2">
              <Label htmlFor="form-select" className="text-sm font-medium">
                Form
              </Label>
              <Select
                value={selectedFormId?.toString() ?? undefined}
                onValueChange={handleFormChange}
              >
                <SelectTrigger id="form-select" className="w-full">
                  <SelectValue placeholder="Select form" />
                </SelectTrigger>
                <SelectContent>
                  {forms.map((f) => (
                    <SelectItem key={f.id} value={f.id.toString()}>
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        {f.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Form Version Selection */}
            <div className="space-y-2">
              <Label htmlFor="version-select" className="text-sm font-medium">
                Form Version
              </Label>
              <Select
                value={selectedFormVersionId?.toString() ?? undefined}
                onValueChange={handleFormVersionChange}
                disabled={
                  !selectedFormId || formDetailsLoading || versions.length === 0
                }
              >
                <SelectTrigger id="version-select" className="w-full">
                  <SelectValue
                    placeholder={
                      formDetailsLoading
                        ? 'Loading versions...'
                        : versions.length === 0
                          ? 'No versions available'
                          : 'Select version'
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {versions.map((v) => (
                    <SelectItem key={v.id} value={v.id.toString()}>
                      <div className="flex items-center gap-2">
                        <span className="font-mono">v{v.version_number}</span>
                        <ChevronRight className="h-3 w-3" />
                        <Badge
                          variant={v.status === 'published' ? 'default' : 'secondary'}
                        >
                          {v.status}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="mt-6 flex gap-3">
            <Button
              onClick={handleRefreshData}
              variant="secondary"
              disabled={!canFetch || localizableData.isLoading}
              className="gap-2"
            >
              <Download
                className={
                  localizableData.isLoading ? 'h-4 w-4 animate-spin' : 'h-4 w-4'
                }
              />
              Load Translatable Data
            </Button>
            <Button
              onClick={handleSave}
              disabled={!canFetch || save.isSaving || !localizableData.data}
              className="gap-2"
            >
              {save.isSaving && <RefreshCw className="h-4 w-4 animate-spin" />}
              {!save.isSaving && <Save className="h-4 w-4" />}
              Save Translations
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Loading State */}
      {localizableData.isLoading && (
        <Card className="border-border bg-card">
          <CardContent className="flex items-center justify-center py-16">
            <div className="flex flex-col items-center gap-3 text-muted-foreground">
              <RefreshCw className="h-8 w-8 animate-spin" />
              <p className="text-sm">Loading translatable data...</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Translation Form */}
      {!localizableData.isLoading && localizableData.data && (
        <div className="space-y-6">
          {/* Progress Indicator */}
          <Card className="border-border bg-card shadow-sm">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Translation Progress</p>
                  <p className="text-xs text-muted-foreground">
                    {totalFields} field{totalFields !== 1 ? 's' : ''} to translate
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-2 w-48 overflow-hidden rounded-full bg-secondary">
                    <div
                      className="h-full bg-primary transition-all duration-500"
                      style={{ width: `${translationProgress}%` }}
                    />
                  </div>
                  <span className="text-sm font-semibold">{translationProgress}%</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Form Name Translation */}
          <Card className="border-border bg-card shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">Form Name Translation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="form-name" className="text-sm font-medium">
                  Translated Form Name
                </Label>
                <Input
                  id="form-name"
                  value={translatedFormName}
                  onChange={(e) => setTranslatedFormName(e.target.value)}
                  placeholder="Enter translated form name"
                  className="w-full"
                />
              </div>
              {localizableData.data.form_name.original && (
                <div className="rounded-md bg-muted/50 p-3">
                  <p className="text-xs font-medium text-muted-foreground">Original:</p>
                  <p className="text-sm">{localizableData.data.form_name.original}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Field Translations */}
          <Card className="border-border bg-card shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">Field Translations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {localizableData.data.fields.map((field: LocalizableField, index: number) => (
                  <div key={field.field_id} className="space-y-4">
                    {index > 0 && <Separator />}

                    {/* Field Header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="font-mono">
                          ID: {field.field_id}
                        </Badge>
                        {field.original.label && (
                          <span className="text-sm font-medium text-muted-foreground">
                            {field.original.label}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Translation Fields Grid */}
                    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                      {/* Label Translation */}
                      <div className="space-y-2">
                        <Label className="text-xs font-medium uppercase text-muted-foreground">
                          Label
                        </Label>
                        <Input
                          value={fieldTranslations[field.field_id]?.label ?? ''}
                          onChange={(e) =>
                            handleFieldChange(field.field_id, 'label', e.target.value)
                          }
                          placeholder="Translated label"
                          className="w-full"
                        />
                        {field.original.label && (
                          <p className="text-xs text-muted-foreground">
                            Original:{' '}
                            <span className="font-medium">{field.original.label}</span>
                          </p>
                        )}
                      </div>

                      {/* Helper Text Translation */}
                      <div className="space-y-2">
                        <Label className="text-xs font-medium uppercase text-muted-foreground">
                          Helper Text
                        </Label>
                        <Input
                          value={fieldTranslations[field.field_id]?.helper_text ?? ''}
                          onChange={(e) =>
                            handleFieldChange(
                              field.field_id,
                              'helper_text',
                              e.target.value
                            )
                          }
                          placeholder="Translated helper text"
                          className="w-full"
                        />
                        {field.original.helper_text && (
                          <p className="text-xs text-muted-foreground">
                            Original:{' '}
                            <span className="font-medium">
                              {field.original.helper_text}
                            </span>
                          </p>
                        )}
                      </div>

                      {/* Placeholder Translation */}
                      <div className="space-y-2">
                        <Label className="text-xs font-medium uppercase text-muted-foreground">
                          Placeholder
                        </Label>
                        <Input
                          value={fieldTranslations[field.field_id]?.place_holder ?? ''}
                          onChange={(e) =>
                            handleFieldChange(
                              field.field_id,
                              'place_holder',
                              e.target.value
                            )
                          }
                          placeholder="Translated placeholder"
                          className="w-full"
                        />
                        {field.original.placeholder && (
                          <p className="text-xs text-muted-foreground">
                            Original:{' '}
                            <span className="font-medium">
                              {field.original.placeholder}
                            </span>
                          </p>
                        )}
                      </div>

                      {/* Default Value Translation */}
                      <div className="space-y-2">
                        <Label className="text-xs font-medium uppercase text-muted-foreground">
                          Default Value
                        </Label>
                        <Input
                          value={fieldTranslations[field.field_id]?.default_value ?? ''}
                          onChange={(e) =>
                            handleFieldChange(
                              field.field_id,
                              'default_value',
                              e.target.value
                            )
                          }
                          placeholder="Translated default value"
                          className="w-full"
                        />
                        {field.original.default_value && (
                          <p className="text-xs text-muted-foreground">
                            Original:{' '}
                            <span className="font-medium">
                              {field.original.default_value}
                            </span>
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </ManageLayout>
  );
};

export default TranslationsPage;
