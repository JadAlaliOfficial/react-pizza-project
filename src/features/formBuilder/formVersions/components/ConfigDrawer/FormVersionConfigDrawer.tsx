// src/features/formVersion/components/ConfigDrawer/FormVersionConfigDrawer.tsx

/**
 * Form Version Config Drawer Component
 * Provides tabbed interface for editing form version configuration
 * UPDATED: Converted from Sheet to inline panel for side-by-side layout
 */

import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Layers, Grid3x3, Type, ArrowRightLeft } from 'lucide-react';
import { StageConfigTab } from '../stages/StageConfigTab';
import { SectionConfigTab } from '../sections/SectionConfigTab';
import { FieldConfigTab } from '../fields/FieldConfigTab';
import { TransitionConfigTab } from '../transitions/TransitionConfigTab';
import { useFormVersionBuilder } from '../../hooks/useFormVersionBuilder';

// ============================================================================
// Component Props
// ============================================================================

interface FormVersionConfigDrawerProps {
  /**
   * Whether the drawer is open (kept for compatibility)
   */
  open: boolean;

  /**
   * Callback when drawer should close (kept for compatibility)
   */
  onClose: () => void;

  /**
   * Default tab to show when opened
   */
  defaultTab?: 'stages' | 'sections' | 'fields' | 'transitions';
}

// ============================================================================
// Component
// ============================================================================

/**
 * FormVersionConfigDrawer Component
 * 
 * Main configuration interface for form versions.
 * Features:
 * - Tabbed navigation (Stages, Sections, Fields, Transitions)
 * - Persistent tab selection
 * - Inline panel layout for side-by-side display
 * - Deep configuration for each entity type
 */
export const FormVersionConfigDrawer: React.FC<FormVersionConfigDrawerProps> = ({
  open,
  defaultTab = 'stages',
}) => {
  const [activeTab, setActiveTab] = useState(defaultTab);
  const builder = useFormVersionBuilder();

  console.debug('[FormVersionConfigDrawer] Rendering, open:', open, 'tab:', activeTab);

  // Don't render if not open (kept for compatibility)
  if (!open) {
    return null;
  }

  return (
    <div className="h-full flex flex-col p-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Configuration</h2>
        <p className="text-sm text-gray-500 mt-1">
          Configure stages, sections, fields, and transitions
        </p>
      </div>

      {/* Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as 'stages' | 'sections' | 'fields' | 'transitions')}
        className="flex-1 flex flex-col overflow-hidden"
      >
        <TabsList className="grid w-full grid-cols-4 mb-4">
          <TabsTrigger value="stages" className="text-xs gap-1.5">
            <Layers className="h-3.5 w-3.5" />
            Stages
          </TabsTrigger>
          <TabsTrigger value="sections" className="text-xs gap-1.5">
            <Grid3x3 className="h-3.5 w-3.5" />
            Sections
          </TabsTrigger>
          <TabsTrigger value="fields" className="text-xs gap-1.5">
            <Type className="h-3.5 w-3.5" />
            Fields
          </TabsTrigger>
          <TabsTrigger value="transitions" className="text-xs gap-1.5">
            <ArrowRightLeft className="h-3.5 w-3.5" />
            Transitions
          </TabsTrigger>
        </TabsList>

        <div className="flex-1 overflow-auto">
          <TabsContent value="stages" className="m-0 h-full">
            <StageConfigTab
              stages={builder.stages}
              onChange={(newStages) => builder.stageActions.setStages(newStages)}
            />
          </TabsContent>

          <TabsContent value="sections" className="m-0 h-full">
            <SectionConfigTab />
          </TabsContent>

          <TabsContent value="fields" className="m-0 h-full">
            <FieldConfigTab />
          </TabsContent>

          <TabsContent value="transitions" className="m-0 h-full">
            <TransitionConfigTab />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};
