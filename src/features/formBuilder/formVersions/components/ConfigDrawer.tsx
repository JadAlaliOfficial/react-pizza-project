// src/features/formVersion/components/ConfigDrawer.tsx

/**
 * Config Drawer Component
 *
 * Contains tabs for:
 * - Stages configuration
 * - Sections configuration
 * - Fields configuration (supports all 27 field types)
 */

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2 } from "lucide-react";
import type { Stage } from "@/features/formBuilder/formVersions/types";

import { StagesTab } from "./StagesTab";
import { SectionsTab } from "./SectionsTab";
import { FieldsTab } from "./FieldsTab";

type ConfigDrawerProps = {
  stages: Stage[];
  onStagesChange: (stages: Stage[]) => void;
  isLoading: boolean;
};

export function ConfigDrawer({
  stages,
  onStagesChange,
  isLoading,
}: ConfigDrawerProps) {
  const [activeTab, setActiveTab] = useState<string>("stages");
  const [selectedStageIndex, setSelectedStageIndex] = useState<number>(0);
  const [selectedSectionIndex, setSelectedSectionIndex] = useState<number>(0);

  // Calculate total counts for tab labels
  const totalStages = stages.length;
  const totalSections = stages.reduce(
    (acc, stage) => acc + (stage.sections?.length || 0),
    0
  );
  const totalFields = stages.reduce(
    (acc, stage) =>
      acc +
      (stage.sections?.reduce(
        (sAcc, section) => sAcc + (section.fields?.length || 0),
        0
      ) || 0),
    0
  );

  return (
    <Card className="flex flex-col h-[calc(100vh-220px)]">
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="flex flex-col h-full"
      >
        <div className="border-b px-4 pt-4">
          <TabsList className="w-full grid grid-cols-3">
            <TabsTrigger value="stages" className="relative">
              Stages
              {totalStages > 0 && (
                <span className="ml-1.5 text-[10px] bg-primary/20 text-primary px-1.5 py-0.5 rounded-full">
                  {totalStages}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="sections" className="relative">
              Sections
              {totalSections > 0 && (
                <span className="ml-1.5 text-[10px] bg-primary/20 text-primary px-1.5 py-0.5 rounded-full">
                  {totalSections}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="fields" className="relative">
              Fields
              {totalFields > 0 && (
                <span className="ml-1.5 text-[10px] bg-primary/20 text-primary px-1.5 py-0.5 rounded-full">
                  {totalFields}
                </span>
              )}
            </TabsTrigger>
          </TabsList>
          
          {/* Info bar showing 27 supported field types */}
          {activeTab === "fields" && (
            <div className="py-2 text-center">
              <p className="text-[10px] text-muted-foreground">
                ✨ 27 field types supported with full preview
              </p>
            </div>
          )}
        </div>

        <ScrollArea className="flex-1">
          {isLoading && stages.length === 0 ? (
            <div className="flex items-center justify-center py-12 text-muted-foreground">
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Loading configuration...
            </div>
          ) : (
            <>
              <TabsContent value="stages" className="m-0 p-4">
                <StagesTab
                  stages={stages}
                  onStagesChange={onStagesChange}
                  selectedStageIndex={selectedStageIndex}
                  onStageSelect={setSelectedStageIndex}
                />
              </TabsContent>

              <TabsContent value="sections" className="m-0 p-4">
                <SectionsTab
                  stages={stages}
                  selectedStageIndex={selectedStageIndex}
                  onStageSelect={setSelectedStageIndex}
                  selectedSectionIndex={selectedSectionIndex}
                  onSectionSelect={setSelectedSectionIndex}
                  onStagesChange={onStagesChange}
                />
              </TabsContent>

              <TabsContent value="fields" className="m-0 p-4">
                <FieldsTab
                  stages={stages}
                  selectedStageIndex={selectedStageIndex}
                  onStageSelect={setSelectedStageIndex}
                  selectedSectionIndex={selectedSectionIndex}
                  onSectionSelect={setSelectedSectionIndex}
                  onStagesChange={onStagesChange}
                />
              </TabsContent>
            </>
          )}
        </ScrollArea>
      </Tabs>
    </Card>
  );
}
