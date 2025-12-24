import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  RefreshCw,
  Globe2,
  Save,
  Download,
  CheckCircle2,
  AlertCircle,
  Languages,
  FileText,
  Layers,
  LayoutGrid,
  ArrowRightLeft,
} from 'lucide-react';
import { useTranslationsWorkflow } from '@/features/formBuilder/translations/hooks/useTranslations';
import { useGetForm } from '@/features/formBuilder/forms/hooks/useForms';
import type {
  FieldTranslation,
  StageTranslation,
  SectionTranslation,
  TransitionTranslation,
  LocalizableField,
  LocalizableStage,
  LocalizableSection,
  LocalizableTransition,
} from '@/features/formBuilder/translations/types';

const TranslationsPage: React.FC = () => {
  const { formId, versionId } = useParams<{
    formId: string;
    versionId: string;
  }>();
  const parsedFormId = formId ? parseInt(formId, 10) : null;
  const parsedFormVersionId = versionId ? parseInt(versionId, 10) : null;

  const [selectedLanguageId, setSelectedLanguageId] = useState<number | null>(
    null,
  );

  const { error: formDetailsError } = useGetForm(parsedFormId, !!parsedFormId);

  const { languages, localizableData, save, errorManagement } =
    useTranslationsWorkflow(parsedFormVersionId, selectedLanguageId);

  // Local state for translated values
  const [translatedFormName, setTranslatedFormName] = useState('');
  const [stageTranslations, setStageTranslations] = useState<
    Record<number, StageTranslation>
  >({});
  const [sectionTranslations, setSectionTranslations] = useState<
    Record<number, SectionTranslation>
  >({});
  const [transitionTranslations, setTransitionTranslations] = useState<
    Record<number, TransitionTranslation>
  >({});
  const [fieldTranslations, setFieldTranslations] = useState<
    Record<number, FieldTranslation>
  >({});

  // Populate translated values from nested structure
  useEffect(() => {
    if (localizableData.data) {
      // Set translated form name
      setTranslatedFormName(localizableData.data.form_name.translated || '');

      // Initialize stage translations
      const initialStages: Record<number, StageTranslation> = {};
      localizableData.data.stages.forEach((stage: LocalizableStage) => {
        initialStages[stage.stage_id] = {
          stage_id: stage.stage_id,
          name: stage.translated.name || '',
        };
      });
      setStageTranslations(initialStages);

      // Initialize section translations
      const initialSections: Record<number, SectionTranslation> = {};
      localizableData.data.sections.forEach((section: LocalizableSection) => {
        initialSections[section.section_id] = {
          section_id: section.section_id,
          name: section.translated.name || '',
        };
      });
      setSectionTranslations(initialSections);

      // Initialize transition translations
      const initialTransitions: Record<number, TransitionTranslation> = {};
      localizableData.data.transitions.forEach(
        (transition: LocalizableTransition) => {
          initialTransitions[transition.stage_transition_id] = {
            stage_transition_id: transition.stage_transition_id,
            label: transition.translated.label || '',
          };
        },
      );
      setTransitionTranslations(initialTransitions);

      // Initialize field translations
      const initialFields: Record<number, FieldTranslation> = {};
      localizableData.data.fields.forEach((field: LocalizableField) => {
        initialFields[field.field_id] = {
          field_id: field.field_id,
          label: field.translated.label || '',
          helper_text: field.translated.helper_text || '',
          default_value: field.translated.default_value || '',
          place_holder: field.translated.place_holder || '',
        };
      });
      setFieldTranslations(initialFields);
    }
  }, [localizableData.data]);

  const handleLanguageChange = useCallback((value: string) => {
    setSelectedLanguageId(parseInt(value, 10));
  }, []);

  const handleStageChange = useCallback((stageId: number, name: string) => {
    setStageTranslations((prev) => ({
      ...prev,
      [stageId]: {
        ...prev[stageId],
        name,
      },
    }));
  }, []);

  const handleSectionChange = useCallback((sectionId: number, name: string) => {
    setSectionTranslations((prev) => ({
      ...prev,
      [sectionId]: {
        ...prev[sectionId],
        name,
      },
    }));
  }, []);

  const handleTransitionChange = useCallback(
    (transitionId: number, label: string) => {
      setTransitionTranslations((prev) => ({
        ...prev,
        [transitionId]: {
          ...prev[transitionId],
          label,
        },
      }));
    },
    [],
  );

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
    [],
  );

  const canFetch = useMemo(
    () => !!selectedLanguageId && !!parsedFormVersionId,
    [selectedLanguageId, parsedFormVersionId],
  );

  const handleRefreshData = useCallback(() => {
    if (canFetch) {
      localizableData.refetch();
    }
  }, [canFetch, localizableData]);

  const handleSave = useCallback(async () => {
    if (!parsedFormVersionId || !selectedLanguageId) return;

    const payload = {
      form_version_id: parsedFormVersionId,
      language_id: selectedLanguageId,
      form_name: translatedFormName,
      stage_translations: Object.values(stageTranslations),
      section_translations: Object.values(sectionTranslations),
      transition_translations: Object.values(transitionTranslations),
      field_translations: Object.values(fieldTranslations),
    };

    await save.save(payload);
  }, [
    parsedFormVersionId,
    selectedLanguageId,
    translatedFormName,
    stageTranslations,
    sectionTranslations,
    transitionTranslations,
    fieldTranslations,
    save,
  ]);

  const totalItems = useMemo(() => {
    if (!localizableData.data) return 0;
    return (
      1 + // form name
      localizableData.data.stages.length +
      localizableData.data.sections.length +
      localizableData.data.transitions.length +
      localizableData.data.fields.length
    );
  }, [localizableData.data]);

  const translationProgress = useMemo(() => {
    if (!localizableData.data) return 0;

    let translatedCount = 0;

    // Check form name
    if (
      translatedFormName &&
      translatedFormName !== localizableData.data.form_name.original
    ) {
      translatedCount++;
    }

    // Check stages
    translatedCount += Object.values(stageTranslations).filter(
      (st) => st.name.trim() !== '',
    ).length;

    // Check sections
    translatedCount += Object.values(sectionTranslations).filter(
      (sec) => sec.name.trim() !== '',
    ).length;

    // Check transitions
    translatedCount += Object.values(transitionTranslations).filter(
      (tr) => tr.label.trim() !== '',
    ).length;

    // Check fields
    translatedCount += Object.values(fieldTranslations).filter(
      (ft) => ft.label || ft.helper_text || ft.default_value || ft.place_holder,
    ).length;

    return totalItems > 0
      ? Math.round((translatedCount / totalItems) * 100)
      : 0;
  }, [
    translatedFormName,
    stageTranslations,
    sectionTranslations,
    transitionTranslations,
    fieldTranslations,
    localizableData.data,
    totalItems,
  ]);

  const selectedLanguage = useMemo(
    () => languages.languages.find((lang) => lang.id === selectedLanguageId),
    [languages.languages, selectedLanguageId],
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
              className={
                languages.isLoading ? 'h-4 w-4 animate-spin' : 'h-4 w-4'
              }
            />
            Refresh Languages
          </Button>
        </div>
      }
      backButton={{
        show: true,
        to: parsedFormId ? `/list-form-versions/${parsedFormId}` : '/forms',
        text: 'Back to Versions',
      }}
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
              <CardTitle className="text-lg">
                Translation Configuration
              </CardTitle>
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
          <div className="max-w-md">
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
                    {totalItems} item{totalItems !== 1 ? 's' : ''} to translate
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-2 w-48 overflow-hidden rounded-full bg-secondary">
                    <div
                      className="h-full bg-primary transition-all duration-500"
                      style={{ width: `${translationProgress}%` }}
                    />
                  </div>
                  <span className="text-sm font-semibold">
                    {translationProgress}%
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Form Name Translation */}
          <Card className="border-border bg-card shadow-sm">
            <CardHeader>
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                <CardTitle className="text-base">
                  Form Name Translation
                </CardTitle>
              </div>
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
                  <p className="text-xs font-medium text-muted-foreground">
                    Original:
                  </p>
                  <p className="text-sm">
                    {localizableData.data.form_name.original}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Tabbed Translation Sections */}
          <Card className="border-border bg-card shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">Translatable Content</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="stages" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="stages" className="gap-2">
                    <Layers className="h-4 w-4" />
                    Stages ({localizableData.data.stages.length})
                  </TabsTrigger>
                  <TabsTrigger value="sections" className="gap-2">
                    <LayoutGrid className="h-4 w-4" />
                    Sections ({localizableData.data.sections.length})
                  </TabsTrigger>
                  <TabsTrigger value="transitions" className="gap-2">
                    <ArrowRightLeft className="h-4 w-4" />
                    Transitions ({localizableData.data.transitions.length})
                  </TabsTrigger>
                  <TabsTrigger value="fields" className="gap-2">
                    <FileText className="h-4 w-4" />
                    Fields ({localizableData.data.fields.length})
                  </TabsTrigger>
                </TabsList>

                {/* Stages Tab */}
                <TabsContent value="stages" className="space-y-4 mt-6">
                  {localizableData.data.stages.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-8">
                      No stages to translate
                    </p>
                  ) : (
                    localizableData.data.stages.map(
                      (stage: LocalizableStage, index: number) => (
                        <div key={stage.stage_id} className="space-y-3">
                          {index > 0 && <Separator />}
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="font-mono">
                              ID: {stage.stage_id}
                            </Badge>
                            {stage.original.name && (
                              <span className="text-sm font-medium text-muted-foreground">
                                {stage.original.name}
                              </span>
                            )}
                          </div>
                          <div className="space-y-2">
                            <Label className="text-xs font-medium uppercase text-muted-foreground">
                              Stage Name
                            </Label>
                            <Input
                              value={
                                stageTranslations[stage.stage_id]?.name ?? ''
                              }
                              onChange={(e) =>
                                handleStageChange(
                                  stage.stage_id,
                                  e.target.value,
                                )
                              }
                              placeholder="Translated stage name"
                              className="w-full"
                            />
                            {stage.original.name && (
                              <p className="text-xs text-muted-foreground">
                                Original:{' '}
                                <span className="font-medium">
                                  {stage.original.name}
                                </span>
                              </p>
                            )}
                          </div>
                        </div>
                      ),
                    )
                  )}
                </TabsContent>

                {/* Sections Tab */}
                <TabsContent value="sections" className="space-y-4 mt-6">
                  {localizableData.data.sections.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-8">
                      No sections to translate
                    </p>
                  ) : (
                    localizableData.data.sections.map(
                      (section: LocalizableSection, index: number) => (
                        <div key={section.section_id} className="space-y-3">
                          {index > 0 && <Separator />}
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="font-mono">
                              ID: {section.section_id}
                            </Badge>
                            <Badge variant="secondary" className="text-xs">
                              Stage: {section.stage_id}
                            </Badge>
                            {section.original.name && (
                              <span className="text-sm font-medium text-muted-foreground">
                                {section.original.name}
                              </span>
                            )}
                          </div>
                          <div className="space-y-2">
                            <Label className="text-xs font-medium uppercase text-muted-foreground">
                              Section Name
                            </Label>
                            <Input
                              value={
                                sectionTranslations[section.section_id]?.name ??
                                ''
                              }
                              onChange={(e) =>
                                handleSectionChange(
                                  section.section_id,
                                  e.target.value,
                                )
                              }
                              placeholder="Translated section name"
                              className="w-full"
                            />
                            {section.original.name && (
                              <p className="text-xs text-muted-foreground">
                                Original:{' '}
                                <span className="font-medium">
                                  {section.original.name}
                                </span>
                              </p>
                            )}
                          </div>
                        </div>
                      ),
                    )
                  )}
                </TabsContent>

                {/* Transitions Tab */}
                <TabsContent value="transitions" className="space-y-4 mt-6">
                  {localizableData.data.transitions.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-8">
                      No transitions to translate
                    </p>
                  ) : (
                    localizableData.data.transitions.map(
                      (transition: LocalizableTransition, index: number) => (
                        <div
                          key={transition.stage_transition_id}
                          className="space-y-3"
                        >
                          {index > 0 && <Separator />}
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="font-mono">
                              ID: {transition.stage_transition_id}
                            </Badge>
                            {transition.original.label && (
                              <span className="text-sm font-medium text-muted-foreground">
                                {transition.original.label}
                              </span>
                            )}
                          </div>
                          <div className="space-y-2">
                            <Label className="text-xs font-medium uppercase text-muted-foreground">
                              Transition Label
                            </Label>
                            <Input
                              value={
                                transitionTranslations[
                                  transition.stage_transition_id
                                ]?.label ?? ''
                              }
                              onChange={(e) =>
                                handleTransitionChange(
                                  transition.stage_transition_id,
                                  e.target.value,
                                )
                              }
                              placeholder="Translated transition label"
                              className="w-full"
                            />
                            {transition.original.label && (
                              <p className="text-xs text-muted-foreground">
                                Original:{' '}
                                <span className="font-medium">
                                  {transition.original.label}
                                </span>
                              </p>
                            )}
                          </div>
                        </div>
                      ),
                    )
                  )}
                </TabsContent>

                {/* Fields Tab */}
                <TabsContent value="fields" className="space-y-6 mt-6">
                  {localizableData.data.fields.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-8">
                      No fields to translate
                    </p>
                  ) : (
                    localizableData.data.fields.map(
                      (field: LocalizableField, index: number) => (
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
                                value={
                                  fieldTranslations[field.field_id]?.label ?? ''
                                }
                                onChange={(e) =>
                                  handleFieldChange(
                                    field.field_id,
                                    'label',
                                    e.target.value,
                                  )
                                }
                                placeholder="Translated label"
                                className="w-full"
                              />
                              {field.original.label && (
                                <p className="text-xs text-muted-foreground">
                                  Original:{' '}
                                  <span className="font-medium">
                                    {field.original.label}
                                  </span>
                                </p>
                              )}
                            </div>

                            {/* Helper Text Translation */}
                            <div className="space-y-2">
                              <Label className="text-xs font-medium uppercase text-muted-foreground">
                                Helper Text
                              </Label>
                              <Input
                                value={
                                  fieldTranslations[field.field_id]
                                    ?.helper_text ?? ''
                                }
                                onChange={(e) =>
                                  handleFieldChange(
                                    field.field_id,
                                    'helper_text',
                                    e.target.value,
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
                                value={
                                  fieldTranslations[field.field_id]
                                    ?.place_holder ?? ''
                                }
                                onChange={(e) =>
                                  handleFieldChange(
                                    field.field_id,
                                    'place_holder',
                                    e.target.value,
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
                                value={
                                  fieldTranslations[field.field_id]
                                    ?.default_value ?? ''
                                }
                                onChange={(e) =>
                                  handleFieldChange(
                                    field.field_id,
                                    'default_value',
                                    e.target.value,
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
                      ),
                    )
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      )}
    </ManageLayout>
  );
};

export default TranslationsPage;
