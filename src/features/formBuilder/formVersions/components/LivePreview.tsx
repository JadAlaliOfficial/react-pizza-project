// src/features/formVersion/components/LivePreview.tsx

/**
 * Live Preview Component
 *
 * Displays a visual representation of the form structure with field previews
 * Supports all 27 field types with dedicated preview components
 */

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronRight, Loader2, Eye } from "lucide-react";
import type { Stage } from "@/features/formBuilder/formVersions/types";
import { useFieldTypes } from "@/features/formBuilder/fieldTypes/hooks/useFieldTypes";

// Import all preview components
import { TextInputPreview } from "./TextInputPreview";
import { TextAreaPreview } from "./TextAreaPreview";
import { NumberInputPreview } from "./NumberInputPreview";
import { EmailInputPreview } from "./EmailInputPreview";
import { PhoneInputPreview } from "./PhoneInputPreview";
import { UrlInputPreview } from "./UrlInputPreview";
import { PasswordInputPreview } from "./PasswordInputPreview";
import { SingleSelectDropdownPreview } from "./SingleSelectDropdownPreview";
import { MultiSelectDropdownPreview } from "./MultiSelectDropdownPreview";
import { RadioButtonGroupPreview } from "./RadioButtonGroupPreview";
import { CheckboxGroupPreview } from "./CheckboxGroupPreview";
import { SingleCheckboxPreview } from "./SingleCheckboxPreview";
import { DatePickerPreview } from "./DatePickerPreview";
import { TimePickerPreview } from "./TimePickerPreview";
import { DateTimePickerPreview } from "./DateTimePickerPreview";
import { DateRangePickerPreview } from "./DateRangePickerPreview";
import { FileUploadPreview } from "./FileUploadPreview";
import { ImageUploadPreview } from "./ImageUploadPreview";
import { RichTextEditorPreview } from "./RichTextEditorPreview";
import { SliderPreview } from "./SliderPreview";
import { RatingPreview } from "./RatingPreview";
import { ColorPickerPreview } from "./ColorPickerPreview";
import { CurrencyInputPreview } from "./CurrencyInputPreview";
import { PercentageInputPreview } from "./PercentageInputPreview";
import { SignaturePadPreview } from "./SignaturePadPreview";
import { LocationPickerPreview } from "./LocationPickerPreview";
import { AddressInputPreview } from "./AddressInputPreview";

type LivePreviewProps = {
  stages: Stage[];
  isLoading: boolean;
};

export function LivePreview({ stages, isLoading }: LivePreviewProps) {
  const [expandedStages, setExpandedStages] = useState<Set<number>>(
    new Set([0])
  );

  const { fieldTypes, ensureLoaded } = useFieldTypes();

  useEffect(() => {
    ensureLoaded();
  }, [ensureLoaded]);

  const toggleStage = (index: number) => {
    const next = new Set(expandedStages);
    if (next.has(index)) {
      next.delete(index);
    } else {
      next.add(index);
    }
    setExpandedStages(next);
  };

  const getFieldTypeName = (fieldTypeId: number): string => {
    return fieldTypes.find((ft) => ft.id === fieldTypeId)?.name ?? "Unknown";
  };

  // Render field preview based on field type
  const renderFieldPreview = (field: any, fieldIndex: number) => {
    const fieldTypeName = getFieldTypeName(field.field_type_id);
    const key = field.id ?? `field-${fieldIndex}`;

    switch (fieldTypeName) {
      case "Text Input":
        return <TextInputPreview key={key} field={field} />;
      
      case "Text Area":
        return <TextAreaPreview key={key} field={field} />;
      
      case "Number Input":
        return <NumberInputPreview key={key} field={field} />;
      
      case "Email Input":
        return <EmailInputPreview key={key} field={field} />;
      
      case "Phone Number Input":
        return <PhoneInputPreview key={key} field={field} />;
      
      case "URL Input":
        return <UrlInputPreview key={key} field={field} />;
      
      case "Password Input":
        return <PasswordInputPreview key={key} field={field} />;
      
      case "Single Select Dropdown":
        return <SingleSelectDropdownPreview key={key} field={field} />;
      
      case "Multi-Select Dropdown":
        return <MultiSelectDropdownPreview key={key} field={field} />;
      
      case "Radio Button Group":
        return <RadioButtonGroupPreview key={key} field={field} />;
      
      case "Checkbox Group":
        return <CheckboxGroupPreview key={key} field={field} />;
      
      case "Single Checkbox":
        return <SingleCheckboxPreview key={key} field={field} />;
      
      case "Date Picker":
        return <DatePickerPreview key={key} field={field} />;
      
      case "Time Picker":
        return <TimePickerPreview key={key} field={field} />;
      
      case "Date-Time Picker":
        return <DateTimePickerPreview key={key} field={field} />;
      
      case "Date Range Picker":
        return <DateRangePickerPreview key={key} field={field} />;
      
      case "File Upload":
        return <FileUploadPreview key={key} field={field} />;
      
      case "Image Upload":
        return <ImageUploadPreview key={key} field={field} />;
      
      case "Rich Text Editor":
        return <RichTextEditorPreview key={key} field={field} />;
      
      case "Slider":
        return <SliderPreview key={key} field={field} />;
      
      case "Rating":
        return <RatingPreview key={key} field={field} />;
      
      case "Color Picker":
        return <ColorPickerPreview key={key} field={field} />;
      
      case "Currency Input":
        return <CurrencyInputPreview key={key} field={field} />;
      
      case "Percentage Input":
        return <PercentageInputPreview key={key} field={field} />;
      
      case "Signature Pad":
        return <SignaturePadPreview key={key} field={field} />;
      
      case "Location Picker":
        return <LocationPickerPreview key={key} field={field} />;
      
      case "Address Input":
        return <AddressInputPreview key={key} field={field} />;
      
      default:
        // Fallback for any unknown field types
        return (
          <div key={key} className="p-3 bg-background border rounded">
            <Badge variant="secondary" className="text-xs mb-2">
              {fieldTypeName}
            </Badge>
            <p className="text-sm font-medium">{field.label}</p>
            <p className="text-xs text-muted-foreground">
              Preview not yet implemented for this field type
            </p>
          </div>
        );
    }
  };

  return (
    <Card className="flex flex-col h-[calc(100vh-220px)]">
      <div className="p-4 border-b">
        <div className="flex items-center gap-2">
          <Eye className="h-4 w-4 text-muted-foreground" />
          <h2 className="text-sm font-medium">Live Preview</h2>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          Visual representation of your form structure (27 field types supported)
        </p>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-3">
          {isLoading && stages.length === 0 ? (
            <div className="flex items-center justify-center py-12 text-muted-foreground">
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Loading preview...
            </div>
          ) : stages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <p className="text-sm">No stages to preview</p>
              <p className="text-xs mt-1">Add a stage to get started</p>
            </div>
          ) : (
            stages.map((stage, stageIndex) => (
              <Card
                key={stage.id ?? `preview-stage-${stageIndex}`}
                className="overflow-hidden"
              >
                <div
                  className="p-4 bg-muted/30 cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => toggleStage(stageIndex)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        type="button"
                      >
                        {expandedStages.has(stageIndex) ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </Button>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-medium">{stage.name}</h3>
                          {stage.is_initial && (
                            <Badge variant="secondary" className="text-xs">
                              Initial
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {stage.sections?.length || 0} section(s)
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {expandedStages.has(stageIndex) && (
                  <div className="p-4 space-y-3 border-t">
                    {!stage.sections || stage.sections.length === 0 ? (
                      <p className="text-xs text-muted-foreground text-center py-4">
                        No sections in this stage
                      </p>
                    ) : (
                      stage.sections
                        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
                        .map((section, sectionIndex) => (
                          <Card
                            key={section.id ?? `preview-section-${sectionIndex}`}
                            className="border-dashed"
                          >
                            <div className="p-4">
                              <div className="flex items-start justify-between mb-3">
                                <div>
                                  <h4 className="text-sm font-medium">
                                    {section.name}
                                  </h4>
                                  <p className="text-xs text-muted-foreground">
                                    Order: {section.order ?? sectionIndex + 1}
                                  </p>
                                </div>
                                <Badge variant="outline" className="text-xs">
                                  {section.fields?.length || 0} field(s)
                                </Badge>
                              </div>

                              {section.visibility_conditions && (
                                <div className="mb-3 p-2 bg-muted/50 rounded text-xs">
                                  <span className="font-medium text-muted-foreground">
                                    Visibility:
                                  </span>{" "}
                                  de className="text-[10px]">
                                    {section.visibility_conditions}
                                  </code>
                                </div>
                              )}

                              {/* Field Previews */}
                              {section.fields && section.fields.length > 0 && (
                                <div className="space-y-4 pt-3 border-t">
                                  <p className="text-xs font-medium text-muted-foreground">
                                    Fields:
                                  </p>
                                  {section.fields.map((field, fieldIndex) =>
                                    renderFieldPreview(field, fieldIndex)
                                  )}
                                </div>
                              )}
                            </div>
                          </Card>
                        ))
                    )}
                  </div>
                )}
              </Card>
            ))
          )}
        </div>
      </ScrollArea>
    </Card>
  );
}
