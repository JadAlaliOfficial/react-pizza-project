// src/features/formVersion/components/ConfigDrawer/FormVersionConfigDrawer.tsx

/**
 * Main configuration drawer for Form Version Builder
 * Provides tabbed interface for editing stages, sections, fields, and transitions
 * Currently implements Stages tab with architecture for future expansion
 */

import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { UiStage } from '../../types/formVersion.ui-types';
import { StageConfigTab } from '../stages/StageConfigTab';

// ============================================================================
// Component Props
// ============================================================================

interface FormVersionConfigDrawerProps {
  stages: UiStage[];
  onStagesChange: (stages: UiStage[]) => void;
}

// ============================================================================
// Component
// ============================================================================

/**
 * FormVersionConfigDrawer Component
 * 
 * Renders a tabbed configuration panel for form version editing.
 * Architecture supports easy addition of new tabs for sections, fields, and transitions.
 * 
 * @param stages - Current stages in UI format
 * @param onStagesChange - Callback when stages are modified
 */
export const FormVersionConfigDrawer: React.FC<FormVersionConfigDrawerProps> = ({
  stages,
  onStagesChange,
}) => {
  console.debug('[FormVersionConfigDrawer] Rendering with', stages.length, 'stages');

  return (
    <div className="h-full flex flex-col border-l border-gray-200 bg-white">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Configuration</h2>
        <p className="mt-1 text-sm text-gray-500">
          Configure your form version workflow
        </p>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="stages" className="flex-1 flex flex-col overflow-hidden">
        <TabsList className="mx-6 mt-4 grid w-full grid-cols-1 gap-2">
          <TabsTrigger value="stages" className="data-[state=active]:bg-blue-50">
            Stages
          </TabsTrigger>
          {/* Future tabs can be added here */}
          {/* <TabsTrigger value="sections">Sections</TabsTrigger> */}
          {/* <TabsTrigger value="fields">Fields</TabsTrigger> */}
          {/* <TabsTrigger value="transitions">Transitions</TabsTrigger> */}
        </TabsList>

        {/* Stages Tab Content */}
        <TabsContent value="stages" className="flex-1 overflow-y-auto px-6 py-4 mt-0">
          <StageConfigTab stages={stages} onChange={onStagesChange} />
        </TabsContent>

        {/* Future tab contents */}
        {/* <TabsContent value="sections">...</TabsContent> */}
      </Tabs>
    </div>
  );
};
