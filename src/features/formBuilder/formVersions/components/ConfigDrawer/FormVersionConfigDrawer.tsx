// src/features/formVersion/components/ConfigDrawer/FormVersionConfigDrawer.tsx

/**
 * Main configuration drawer for Form Version Builder
 * Provides tabbed interface for editing stages, sections, fields, and transitions
 * Now includes Sections tab for section management
 */

import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { StageConfigTab } from '../stages/StageConfigTab';
import { SectionConfigTab } from '../sections/SectionConfigTab';
import { useFormVersionBuilder } from '../../hooks/useFormVersionBuilder';

// ============================================================================
// Component
// ============================================================================

/**
 * FormVersionConfigDrawer Component
 * 
 * Renders a tabbed configuration panel for form version editing.
 * Supports Stages and Sections tabs with easy expansion for more tabs.
 */
export const FormVersionConfigDrawer: React.FC = () => {
  const builder = useFormVersionBuilder();

  console.debug(
    '[FormVersionConfigDrawer] Rendering with',
    builder.stages.length,
    'stages'
  );

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
        <TabsList className="mx-6 mt-4 grid w-full grid-cols-2 gap-2">
          <TabsTrigger value="stages" className="data-[state=active]:bg-blue-50">
            Stages
          </TabsTrigger>
          <TabsTrigger value="sections" className="data-[state=active]:bg-blue-50">
            Sections
          </TabsTrigger>
          {/* Future tabs */}
          {/* <TabsTrigger value="fields">Fields</TabsTrigger> */}
          {/* <TabsTrigger value="transitions">Transitions</TabsTrigger> */}
        </TabsList>

        {/* Stages Tab Content */}
        <TabsContent value="stages" className="flex-1 overflow-y-auto px-6 py-4 mt-0">
          <StageConfigTab
            stages={builder.stages}
            onChange={builder.setStages}
          />
        </TabsContent>

        {/* Sections Tab Content */}
        <TabsContent value="sections" className="flex-1 overflow-y-auto px-6 py-4 mt-0">
          <SectionConfigTab />
        </TabsContent>

        {/* Future tab contents */}
        {/* <TabsContent value="fields">...</TabsContent> */}
      </Tabs>
    </div>
  );
};
