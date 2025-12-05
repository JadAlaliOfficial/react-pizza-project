// src/features/formVersion/components/FieldsTab.tsx

/**
 * Fields Tab Component
 *
 * Handles field-level configuration for a selected section within a stage
 * Supports all 27 field types with dedicated configuration components
 */

import { useEffect, useState } from "react";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Plus, Trash2, Layers, Box, ChevronDown } from "lucide-react";
import type { Stage, Field } from "@/features/formBuilder/formVersions/types";
import { useFieldTypes } from "@/features/formBuilder/fieldTypes/hooks/useFieldTypes";

// Import all field config components
import { TextInputFieldConfig } from "./TextInputFieldConfig";
import { TextAreaFieldConfig } from "../../fieldTypes/components/config/TextAreaFieldConfig";
import { NumberInputFieldConfig } from "../../fieldTypes/components/config/NumberInputFieldConfig";
import { EmailInputFieldConfig } from "../../fieldTypes/components/config/EmailInputFieldConfig";
import { UrlInputFieldConfig } from "../../fieldTypes/components/config/UrlInputFieldConfig";
import { PasswordInputFieldConfig } from "../../fieldTypes/components/config/PasswordInputFieldConfig";
import { DropdownSelectFieldConfig } from "./DropdownSelectFieldConfig";
import { RadioButtonFieldConfig } from "./RadioButtonFieldConfig";
import { CheckboxFieldConfig } from "./CheckboxFieldConfig";
import { DateInputFieldConfig } from "./DateInputFieldConfig";
import { TimeInputFieldConfig } from "./TimeInputFieldConfig";
import { DateTimeInputFieldConfig } from "./DateTimeInputFieldConfig";
import { FileUploadFieldConfig } from "./FileUploadFieldConfig";
import { ImageUploadFieldConfig } from "./ImageUploadFieldConfig";
import { SliderFieldConfig } from "../../fieldTypes/components/config/SliderFieldConfig";
import { RatingFieldConfig } from "../../fieldTypes/components/config/RatingFieldConfig";
import { ColorPickerFieldConfig } from "./ColorPickerFieldConfig";
import { CurrencyInputFieldConfig } from "../../fieldTypes/components/config/CurrencyInputFieldConfig";
import { PercentageInputFieldConfig } from "../../fieldTypes/components/config/PercentageInputFieldConfig";
import { SignaturePadFieldConfig } from "./SignaturePadFieldConfig";
import { LocationPickerFieldConfig } from "./LocationPickerFieldConfig";
import { AddressInputFieldConfig } from "./AddressInputFieldConfig";

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
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

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
    setIsDropdownOpen(false);
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

  // Render field config component based on field type
  const renderFieldConfig = (field: Field, fieldIndex: number) => {
    const fieldType = fieldTypes.find((ft) => ft.id === field.field_type_id);
    const key = (field as any).id ?? `field-${fieldIndex}`;
    const commonProps = {
      key,
      field,
      fieldIndex,
      onFieldChange: (updated: Partial<Field>) => handleFieldChange(fieldIndex, updated),
      onDelete: () => handleDeleteField(fieldIndex),
    };

    switch (fieldType?.name) {
      case "Text Input":
        return <TextInputFieldConfig {...commonProps} />;
      
      case "Text Area":
        return <TextAreaFieldConfig {...commonProps} />;
      
      case "Number Input":
        return <NumberInputFieldConfig {...commonProps} />;
      
      case "Email Input":
        return <EmailInputFieldConfig {...commonProps} />;
      
      case "Phone Number Input":
        return <NumberInputFieldConfig {...commonProps} />;
      
      case "URL Input":
        return <UrlInputFieldConfig {...commonProps} />;
      
      case "Password Input":
        return <PasswordInputFieldConfig {...commonProps} />;
      
      case "Single Select Dropdown":
        return <DropdownSelectFieldConfig {...commonProps} />;
      
      case "Radio Button Group":
        return <RadioButtonFieldConfig {...commonProps} />;
      
      case "Checkbox Group":
        return <CheckboxFieldConfig {...commonProps} />;
      
      case "Date Picker":
        return <DateInputFieldConfig {...commonProps} />;
      
      case "Time Picker":
        return <TimeInputFieldConfig {...commonProps} />;
      
      case "Date-Time Picker":
        return <DateTimeInputFieldConfig {...commonProps} />;
      
      case "File Upload":
        return <FileUploadFieldConfig {...commonProps} />;
      
      case "Image Upload":
        return <ImageUploadFieldConfig {...commonProps} />;
      
      case "Slider":
        return <SliderFieldConfig {...commonProps} />;
      
      case "Rating":
        return <RatingFieldConfig {...commonProps} />;
      
      case "Color Picker":
        return <ColorPickerFieldConfig {...commonProps} />;
      
      case "Currency Input":
        return <CurrencyInputFieldConfig {...commonProps} />;
      
      case "Percentage Input":
        return <PercentageInputFieldConfig {...commonProps} />;
      
      case "Signature Pad":
        return <SignaturePadFieldConfig {...commonProps} />;
      
      case "Location Picker":
        return <LocationPickerFieldConfig {...commonProps} />;
      
      case "Address Input":
        return <AddressInputFieldConfig {...commonProps} />;
      
      default:
        // Fallback for unknown field types
        return (
          <Card key={key} className="p-4">
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
    }
  };

  // Group field types by category for better UX
  const groupedFieldTypes = {
    "Text Inputs": fieldTypes.filter(ft => 
      ["Text Input", "Text Area", "Email Input", "Phone Number Input", "URL Input", "Password Input"].includes(ft.name)
    ),
    "Number Inputs": fieldTypes.filter(ft => 
      ["Number Input", "Currency Input", "Percentage Input", "Slider", "Rating"].includes(ft.name)
    ),
    "Selection": fieldTypes.filter(ft => 
      ["Single Select Dropdown", "Multi-Select Dropdown", "Radio Button Group", "Checkbox Group", "Single Checkbox"].includes(ft.name)
    ),
    "Date & Time": fieldTypes.filter(ft => 
      ["Date Picker", "Time Picker", "Date-Time Picker", "Date Range Picker"].includes(ft.name)
    ),
    "File & Media": fieldTypes.filter(ft => 
      ["File Upload", "Image Upload", "Rich Text Editor"].includes(ft.name)
    ),
    "Advanced": fieldTypes.filter(ft => 
      ["Color Picker", "Signature Pad", "Location Picker", "Address Input"].includes(ft.name)
    ),
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
          
          {/* Add Field Dropdown */}
          <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
            <DropdownMenuTrigger asChild>
              <Button size="sm" disabled={fieldTypesLoading}>
                <Plus className="mr-1.5 h-4 w-4" />
                Add Field
                <ChevronDown className="ml-1.5 h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 max-h-[400px] overflow-y-auto">
              <DropdownMenuLabel className="text-xs">
                Select Field Type ({fieldTypes.length} available)
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              
              {Object.entries(groupedFieldTypes).map(([category, types]) => (
                types.length > 0 && (
                  <div key={category}>
                    <DropdownMenuLabel className="text-[10px] text-muted-foreground px-2 py-1">
                      {category}
                    </DropdownMenuLabel>
                    {types.map((fieldType) => (
                      <DropdownMenuItem
                        key={fieldType.id}
                        onClick={() => handleAddField(fieldType.id)}
                        className="text-xs cursor-pointer"
                      >
                        {fieldType.name}
                      </DropdownMenuItem>
                    ))}
                    <DropdownMenuSeparator />
                  </div>
                )
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {!currentSection?.fields || currentSection.fields.length === 0 ? (
          <Card className="p-6 text-center text-muted-foreground">
            <p className="text-sm mb-3">No fields in this section yet.</p>
            <p className="text-xs mb-4">Click "Add Field" to get started</p>
            <Badge variant="outline" className="text-xs">
              27 field types available
            </Badge>
          </Card>
        ) : (
          <div className="space-y-3">
            {currentSection.fields.map((field, fieldIndex) =>
              renderFieldConfig(field, fieldIndex)
            )}
          </div>
        )}
      </div>
    </div>
  );
}
