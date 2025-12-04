// src/features/formVersion/components/LivePreview.tsx

/**
 * Live Preview Component
 *
 * Displays a visual representation of the form structure:
 * - Shows stages as expandable cards
 * - Sections are displayed as containers
 * - Fields are acknowledged but not rendered in detail yet
 */

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronRight, Loader2, Eye } from "lucide-react";
import type { Stage } from "@/features/formBuilder/formVersions/types";

type LivePreviewProps = {
  stages: Stage[];
  isLoading: boolean;
};

export function LivePreview({ stages, isLoading }: LivePreviewProps) {
  const [expandedStages, setExpandedStages] = useState<Set<number>>(
    new Set([0])
  );

  const toggleStage = (index: number) => {
    const next = new Set(expandedStages);
    if (next.has(index)) {
      next.delete(index);
    } else {
      next.add(index);
    }
    setExpandedStages(next);
  };

  return (
    <Card className="flex flex-col h-[calc(100vh-220px)]">
      <div className="p-4 border-b">
        <div className="flex items-center gap-2">
          <Eye className="h-4 w-4 text-muted-foreground" />
          <h2 className="text-sm font-medium">Live Preview</h2>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          Visual representation of your form structure
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
                            key={
                              section.id ?? `preview-section-${sectionIndex}`
                            }
                            className="border-dashed"
                          >
                            <div className="p-3">
                              <div className="flex items-start justify-between mb-2">
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
                                <div className="mt-2 p-2 bg-muted/50 rounded text-xs">
                                  <span className="font-medium text-muted-foreground">
                                    Visibility:
                                  </span>{" "}
                                  <code className="text-[10px]">
                                    {section.visibility_conditions}
                                  </code>
                                </div>
                              )}

                              {/* Placeholder for fields - future enhancement */}
                              {section.fields && section.fields.length > 0 && (
                                <div className="mt-3 pt-3 border-t space-y-2">
                                  <p className="text-xs font-medium text-muted-foreground">
                                    Fields (preserved, not editable yet):
                                  </p>
                                  <div className="space-y-1.5">
                                    {section.fields.map((field, fieldIndex) => (
                                      <div
                                        key={
                                          (field as any).id ??
                                          `field-${fieldIndex}`
                                        }
                                        className="p-2 bg-background border rounded text-xs"
                                      >
                                        <span className="font-medium">
                                          {(field as any).label ||
                                            (field as any).name ||
                                            "Unnamed Field"}
                                        </span>
                                        <span className="text-muted-foreground ml-2">
                                          ({(field as any).type || "unknown"})
                                        </span>
                                      </div>
                                    ))}
                                  </div>
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
