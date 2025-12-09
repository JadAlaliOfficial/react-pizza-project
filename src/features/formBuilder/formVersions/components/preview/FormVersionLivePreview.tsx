// src/features/formVersion/components/preview/FormVersionLivePreview.tsx

/**
 * Form Version Live Preview Component
 * Shows real-time preview of form as it's being built
 * Extended to display fields within sections using preview registry
 */

import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Layers, Box } from 'lucide-react';
import type { UiStage } from '../../types/formVersion.ui-types';
import { getFieldPreviewComponent } from '../fields/fieldComponentRegistry';

// ============================================================================
// Props
// ============================================================================

interface FormVersionLivePreviewProps {
  stages: UiStage[];
}

// ============================================================================
// Component
// ============================================================================

/**
 * FormVersionLivePreview Component
 * 
 * Renders a live preview of the form version structure
 * Shows stages → sections → fields hierarchy
 * Uses fieldPreviewRegistry for dynamic field rendering
 * 
 * Features:
 * - Stage cards with sections
 * - Section cards with fields
 * - Dynamic field preview components
 * - Visual indicators for initial stage
 * - Empty states
 */
export const FormVersionLivePreview: React.FC<FormVersionLivePreviewProps> = ({
  stages,
}) => {
  console.debug('[FormVersionLivePreview] Rendering', stages.length, 'stages');

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="px-6 py-4 bg-white border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Live Preview</h2>
        <p className="mt-1 text-sm text-gray-500">
          See how your form will appear to users
        </p>
      </div>

      {/* Preview Content */}
      <ScrollArea className="flex-1">
        <div className="p-6 space-y-6">
          {stages.length === 0 ? (
            // Empty state
            <Card className="p-8 text-center border-dashed">
              <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-sm font-medium text-gray-900 mb-2">
                No stages defined
              </h3>
              <p className="text-sm text-gray-500">
                Add stages in the Stages tab to start building your form
              </p>
            </Card>
          ) : (
            // Render stages
            stages.map((stage, stageIndex) => (
              <Card key={stage.id} className="overflow-hidden">
                {/* Stage Header */}
                <div className="bg-blue-50 px-4 py-3 border-b border-blue-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-semibold text-gray-900">
                        {stage.name}
                      </h3>
                      {stage.is_initial && (
                        <Badge variant="default" className="text-xs">
                          Initial
                        </Badge>
                      )}
                    </div>
                    <span className="text-xs text-gray-500">
                      Stage {stageIndex + 1}
                    </span>
                  </div>
                </div>

                {/* Stage Sections */}
                <div className="p-4 space-y-4">
                  {stage.sections.length === 0 ? (
                    // Empty sections state
                    <div className="text-center py-6 text-gray-500">
                      <Layers className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                      <p className="text-sm">No sections in this stage</p>
                      <p className="text-xs text-gray-400 mt-1">
                        Add sections in the Sections tab
                      </p>
                    </div>
                  ) : (
                    // Render sections
                    stage.sections
                      .sort((a, b) => (a.order || 0) - (b.order || 0))
                      .map((section, sectionIndex) => (
                        <div
                          key={section.id}
                          className="border border-gray-200 rounded-lg overflow-hidden"
                        >
                          {/* Section Header */}
                          <div className="bg-gray-100 px-3 py-2 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                              <h4 className="text-sm font-medium text-gray-900">
                                {section.name}
                              </h4>
                              <span className="text-xs text-gray-500">
                                Section {sectionIndex + 1}
                              </span>
                            </div>
                          </div>

                          {/* Section Fields */}
                          <div className="p-3 space-y-3 bg-white">
                            {section.fields.length === 0 ? (
                              // Empty fields state
                              <div className="text-center py-4 text-gray-500">
                                <Box className="h-6 w-6 mx-auto mb-2 text-gray-400" />
                                <p className="text-xs">No fields in this section</p>
                                <p className="text-xs text-gray-400 mt-1">
                                  Add fields in the Fields tab
                                </p>
                              </div>
                            ) : (
                              // Render fields using preview registry
                              section.fields.map((field) => {
                                // Get preview component for this field type
                                const FieldPreviewComponent = getFieldPreviewComponent(
                                  field.field_type_id
                                );

                                return (
                                  <div key={field.id}>
                                    <FieldPreviewComponent field={field} />
                                  </div>
                                );
                              })
                            )}
                          </div>
                        </div>
                      ))
                  )}
                </div>
              </Card>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
};
