// src/features/formVersion/components/SectionsTab.tsx

/**
 * Sections Tab Component
 *
 * Handles section-level configuration for a selected stage
 */

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2, Layers } from "lucide-react";
import type {
  Stage,
  Section,
} from "@/features/formBuilder/formVersions/types";

type SectionsTabProps = {
  stages: Stage[];
  selectedStageIndex: number;
  onStageSelect: (index: number) => void;
  selectedSectionIndex: number;
  onSectionSelect: (index: number) => void;
  onStagesChange: (stages: Stage[]) => void;
};

export function SectionsTab({
  stages,
  selectedStageIndex,
  onStageSelect,
  selectedSectionIndex,
  onSectionSelect,
  onStagesChange,
}: SectionsTabProps) {
  const currentStage = stages[selectedStageIndex];

  const handleAddSection = () => {
    if (!currentStage) return;

    const next = [...stages];
    const sections = [...(currentStage.sections || [])];
    const newSection: Section = {
      name: "New Section",
      order: sections.length + 1,
      visibility_conditions: null,
      fields: [],
    };
    sections.push(newSection);
    next[selectedStageIndex] = { ...currentStage, sections };
    onStagesChange(next);
    onSectionSelect(sections.length - 1);
  };

  const handleDeleteSection = (sectionIndex: number) => {
    if (!currentStage) return;

    const next = [...stages];
    const sections = [...(currentStage.sections || [])];
    sections.splice(sectionIndex, 1);

    const reordered = sections.map((sec, idx) => ({
      ...sec,
      order: idx + 1,
    }));

    next[selectedStageIndex] = { ...currentStage, sections: reordered };
    onStagesChange(next);
    
    if (selectedSectionIndex >= reordered.length) {
      onSectionSelect(Math.max(0, reordered.length - 1));
    }
  };

  const handleSectionNameChange = (sectionIndex: number, value: string) => {
    if (!currentStage) return;

    const next = [...stages];
    const sections = [...(currentStage.sections || [])];
    sections[sectionIndex] = { ...sections[sectionIndex], name: value };
    next[selectedStageIndex] = { ...currentStage, sections };
    onStagesChange(next);
  };

  const handleSectionOrderChange = (sectionIndex: number, value: string) => {
    if (!currentStage) return;

    const numericOrder = Number(value) || undefined;
    const next = [...stages];
    const sections = [...(currentStage.sections || [])];
    sections[sectionIndex] = { ...sections[sectionIndex], order: numericOrder };
    next[selectedStageIndex] = { ...currentStage, sections };
    onStagesChange(next);
  };

  const handleSectionVisibilityChange = (
    sectionIndex: number,
    value: string
  ) => {
    if (!currentStage) return;

    const next = [...stages];
    const sections = [...(currentStage.sections || [])];
    sections[sectionIndex] = {
      ...sections[sectionIndex],
      visibility_conditions: value || null,
    };
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

  return (
    <div className="space-y-4">
      {/* Stage Selector */}
      <Card className="p-4 bg-muted/40">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
            <Layers className="h-4 w-4" />
            <span>Editing Sections for Stage:</span>
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

      {/* Sections List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium">Sections</h3>
            <p className="text-xs text-muted-foreground mt-1">
              Configure sections for {currentStage?.name || "this stage"}
            </p>
          </div>
          <Button size="sm" onClick={handleAddSection}>
            <Plus className="mr-1.5 h-4 w-4" />
            Add Section
          </Button>
        </div>

        {!currentStage?.sections || currentStage.sections.length === 0 ? (
          <Card className="p-6 text-center text-muted-foreground">
            <p className="text-sm mb-3">No sections in this stage yet.</p>
            <Button size="sm" onClick={handleAddSection}>
              <Plus className="mr-1.5 h-4 w-4" />
              Add First Section
            </Button>
          </Card>
        ) : (
          currentStage.sections.map((section, sectionIndex) => (
            <Card
              key={section.id ?? `section-${sectionIndex}`}
              className={`p-4 cursor-pointer transition-all ${
                selectedSectionIndex === sectionIndex
                  ? "border-primary shadow-md"
                  : "hover:border-muted-foreground/50"
              }`}
              onClick={() => onSectionSelect(sectionIndex)}
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="text-xs font-medium text-muted-foreground mb-2">
                      Section {sectionIndex + 1}
                    </div>
                    <Input
                      value={section.name}
                      onChange={(e) =>
                        handleSectionNameChange(sectionIndex, e.target.value)
                      }
                      onClick={(e) => e.stopPropagation()}
                      placeholder="Section name"
                      className="h-9"
                    />
                  </div>

                  <Button
                    variant="ghost"
                    size="icon"
                    type="button"
                    className="text-destructive hover:text-destructive"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteSection(sectionIndex);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                {selectedSectionIndex === sectionIndex && (
                  <div className="space-y-3 pt-2 border-t">
                    <div className="grid gap-3 md:grid-cols-2">
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-muted-foreground">
                          Order
                        </label>
                        <Input
                          type="number"
                          value={section.order ?? sectionIndex + 1}
                          onChange={(e) =>
                            handleSectionOrderChange(sectionIndex, e.target.value)
                          }
                          onClick={(e) => e.stopPropagation()}
                          className="h-9 text-xs"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-muted-foreground">
                          Fields Count
                        </label>
                        <div className="h-9 px-3 flex items-center text-xs text-muted-foreground bg-muted rounded-md">
                          {section.fields?.length || 0} field(s)
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-muted-foreground">
                        Visibility Conditions
                      </label>
                      <Textarea
                        value={
                          section.visibility_conditions ??
                          section.visibility_condition ??
                          ""
                        }
                        onChange={(e) =>
                          handleSectionVisibilityChange(sectionIndex, e.target.value)
                        }
                        onClick={(e) => e.stopPropagation()}
                        placeholder="e.g. user.department == 'HR'"
                        className="min-h-[60px] text-xs"
                      />
                    </div>
                  </div>
                )}
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
