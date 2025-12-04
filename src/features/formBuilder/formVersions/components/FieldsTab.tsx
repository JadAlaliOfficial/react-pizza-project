// src/features/formVersion/components/FieldsTab.tsx

/**
 * Fields Tab Component
 *
 * Handles field-level configuration for a selected section within a stage
 */

import { useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2, Layers, Box } from "lucide-react";
import type { Stage, Field } from "@/features/formBuilder/formVersions/types";
import { useFieldTypes } from "@/features/formBuilder/fieldTypes/hooks/useFieldTypes";
import { TextInputFieldConfig } from "./TextInputFieldConfig";

type FieldsTabProps = {
  stages: Stage[];
  selectedStageIndex: number;
  onStageSelect: (index: number) => void;
  selectedSectionIndex: number;
  onSectionSelect: (index: number) => void;
  onStagesChange: (stages: Stage[]) => void;
};

export function FieldsTab({
  stages,
  selectedStageIndex,
  onStageSelect,
  selectedSectionIndex,
  onSectionSelect,
  onStagesChange,
}: FieldsTabProps) {
  const { fieldTypes, isLoading: fieldTypesLoading, ensureLoaded } = useFieldTypes();

  // Load field types on mount
  useEffect(() => {
    ensureLoaded();
  }, [ensureLoaded]);

  const currentStage = stages[selectedStageIndex];
  const currentSection = currentStage?.sections?.[selectedSectionIndex];

  const handleAddField = (fieldTypeId: number) => {
    if (!currentStage || !currentSection) return;

    const fieldType = fieldTypes.find((ft) => ft.id === fieldTypeId);
    if (!fieldType) return;

    const next = [...stages];
    const sections = [...(currentStage.sections || [])];
    const fields = [...(currentSection.fields || [])];

    const newField: Field = {
      field_type_id: fieldTypeId,
      label: `New ${fieldType.name}`,
      placeholder: null,
      helper_text: null,
      default_value: null,
      visibility_condition: null,
      visibility_conditions: null,
      rules: [],
    };

    fields.push(newField);
    sections[selectedSectionIndex] = { ...currentSection, fields };
    next[selectedStageIndex] = { ...currentStage, sections };
    onStagesChange(next);
  };

  const handleDeleteField = (fieldIndex: number) => {
    if (!currentStage || !currentSection) return;

    const next = [...stages];
    const sections = [...(currentStage.sections || [])];
    const fields = [...(currentSection.fields || [])];
    fields.splice(fieldIndex, 1);

    sections[selectedSectionIndex] = { ...currentSection, fields };
    next[selectedStageIndex] = { ...currentStage, sections };
    onStagesChange(next);
  };

  const handleFieldChange = (fieldIndex: number, updatedField: Partial<Field>) => {
    if (!currentStage || !currentSection) return;

    const next = [...stages];
    const sections = [...(currentStage.sections || [])];
    const fields = [...(currentSection.fields || [])];
    
    fields[fieldIndex] = {
      ...fields[fieldIndex],
      ...updatedField,
    };

    sections[selectedSectionIndex] = { ...currentSection, fields };
    next[selectedStageIndex] = { ...currentStage, sections };
    onStagesChange(next);
  };

  if (stages.length === 0) {
    return (
      <Card className="p-6 text-center text-muted-foreground">
        <p className="text-sm">No stages available. Please add a stage first.</p>
      </Card>
    );
  }

  if (!currentStage?.sections || currentStage.sections.length === 0) {
    return (
      <Card className="p-6 text-center text-muted-foreground">
        <p className="text-sm">
          No sections in this stage. Please add a section first.
        </p>
      </Card>
    );
  }

  // Get Text Input field type (ID = 1 based on seeder)
  const textInputType = fieldTypes.find((ft) => ft.name === "Text Input");

  return (
    <div className="space-y-4">
      {/* Stage Selector */}
      <Card className="p-4 bg-muted/40">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
            <Layers className="h-4 w-4" />
            <span>Stage:</span>
          </div>
          <Select
            value={String(selectedStageIndex)}
            onValueChange={(val) => onStageSelect(Number(val))}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {stages.map((stage, index) => (
                <SelectItem key={stage.id ?? index} value={String(index)}>
                  <div className="flex items-center gap-2">
                    <span>{stage.name}</span>
                    {stage.is_initial && (
                      <Badge variant="outline" className="text-[10px] ml-2">
                        Initial
                      </Badge>
                    )}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Section Selector */}
      <Card className="p-4 bg-muted/40">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
            <Box className="h-4 w-4" />
            <span>Section:</span>
          </div>
          <Select
            value={String(selectedSectionIndex)}
            onValueChange={(val) => onSectionSelect(Number(val))}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {currentStage.sections.map((section, index) => (
                <SelectItem key={section.id ?? index} value={String(index)}>
                  {section.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Fields List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium">Fields</h3>
            <p className="text-xs text-muted-foreground mt-1">
              Configure fields for {currentSection?.name || "this section"}
            </p>
          </div>
          {textInputType && (
            <Button
              size="sm"
              onClick={() => handleAddField(textInputType.id)}
              disabled={fieldTypesLoading}
            >
              <Plus className="mr-1.5 h-4 w-4" />
              Add Text Input
            </Button>
          )}
        </div>

        {!currentSection?.fields || currentSection.fields.length === 0 ? (
          <Card className="p-6 text-center text-muted-foreground">
            <p className="text-sm mb-3">No fields in this section yet.</p>
            {textInputType && (
              <Button
                size="sm"
                onClick={() => handleAddField(textInputType.id)}
                disabled={fieldTypesLoading}
              >
                <Plus className="mr-1.5 h-4 w-4" />
                Add First Field
              </Button>
            )}
          </Card>
        ) : (
          <div className="space-y-3">
            {currentSection.fields.map((field, fieldIndex) => {
              const fieldType = fieldTypes.find(
                (ft) => ft.id === field.field_type_id
              );

              // For now, only render TextInput fields
              if (fieldType?.name === "Text Input") {
                return (
                  <TextInputFieldConfig
                    key={(field as any).id ?? `field-${fieldIndex}`}
                    field={field}
                    fieldIndex={fieldIndex}
                    onFieldChange={(updated) => handleFieldChange(fieldIndex, updated)}
                    onDelete={() => handleDeleteField(fieldIndex)}
                  />
                );
              }

              // Placeholder for other field types
              return (
                <Card key={(field as any).id ?? `field-${fieldIndex}`} className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Badge variant="secondary" className="text-xs mb-2">
                        {fieldType?.name || "Unknown Type"}
                      </Badge>
                      <p className="text-sm">{field.label}</p>
                      <p className="text-xs text-muted-foreground">
                        Configuration UI not yet implemented
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteField(fieldIndex)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
