// src/features/formVersion/preview/FormVersionLivePreview.tsx

/**
 * Form Version Live Preview Component
 * Shows a live preview of the form version being built
 * UPDATED: Added transitions visualization
 */

import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ArrowRight, AlertCircle, CheckCircle } from 'lucide-react';
import { useFormVersionBuilder } from '../../hooks/useFormVersionBuilder';
import type { UiStage, UiStageTransition } from '../../types/formVersion.ui-types';
import { getFieldPreviewComponent } from '../fields/fieldComponentRegistry';

// ============================================================================
// Component
// ============================================================================

/**
 * FormVersionLivePreview Component
 * 
 * Displays a live preview of the form version structure.
 * Features:
 * - Stage list with sections and fields count
 * - Transition workflow visualization
 * - Highlights initial stage
 * - Shows completion transitions
 */
export const FormVersionLivePreview: React.FC = () => {
  const builder = useFormVersionBuilder();

  console.debug(
    '[FormVersionLivePreview] Rendering with',
    builder.stages.length,
    'stages and',
    builder.transitions.length,
    'transitions'
  );

  /**
   * Gets stage name by ID
   */
  const getStageName = (stageId: UiStage['id'] | null): string => {
    if (stageId === null) return 'Complete';
    const stage = builder.stages.find((s) => s.id === stageId);
    return stage?.name || `Stage ${stageId}`;
  };

  /**
   * Gets transitions from a stage
   */
  const getTransitionsFromStage = (stageId: UiStage['id']): UiStageTransition[] => {
    return builder.transitions.filter((t) => t.from_stage_id === stageId);
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900">Live Preview</h3>
        <p className="text-sm text-gray-500 mt-1">
          Preview of your form structure and workflow
        </p>
      </div>

      {/* Empty state */}
      {builder.stages.length === 0 && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            No stages defined. Start building your form by adding stages in the config panel.
          </AlertDescription>
        </Alert>
      )}

      {/* Stages Preview */}
      {builder.stages.length > 0 && (
        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3">Stages</h4>
            <div className="space-y-3">
              {builder.stages.map((stage) => {
                const sectionCount = stage.sections.length;
                const fieldCount = stage.sections.reduce(
                  (sum, sec) => sum + sec.fields.length,
                  0
                );
                const transitionsFromStage = getTransitionsFromStage(stage.id);

                return (
                  <Card key={stage.id} className="border-gray-200">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm flex items-center gap-2">
                        {stage.name}
                        {stage.is_initial && (
                          <Badge variant="default" className="text-[10px]">
                            Initial
                          </Badge>
                        )}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {/* Stats */}
                      <div className="flex gap-3 text-xs text-gray-600">
                        <span>{sectionCount} section{sectionCount !== 1 ? 's' : ''}</span>
                        <span>•</span>
                        <span>{fieldCount} field{fieldCount !== 1 ? 's' : ''}</span>
                      </div>

                      {/* Sections and fields */}
                      <div className="space-y-3 mt-3">
                        {stage.sections.map((section) => (
                          <div key={section.id} className="space-y-2">
                            <div className="flex items-center justify-between">
                              <p className="text-xs font-medium text-gray-700">
                                {section.name}
                              </p>
                              <span className="text-[10px] text-gray-500">
                                {section.fields.length} field{section.fields.length !== 1 ? 's' : ''}
                              </span>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-1 gap-2">
                              {section.fields.map((field) => {
                                const Preview = getFieldPreviewComponent(field.field_type_id);
                                return (
                                  <div key={field.id} className="border rounded p-2 bg-white">
                                    <Preview field={field} />
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Transitions from this stage */}
                      {transitionsFromStage.length > 0 && (
                        <div className="mt-3 space-y-1.5">
                          <p className="text-[10px] font-medium text-gray-500 uppercase tracking-wide">
                            Transitions
                          </p>
                          {transitionsFromStage.map((transition) => (
                            <div
                              key={transition.id}
                              className="flex items-center gap-2 text-xs bg-gray-50 rounded px-2 py-1.5"
                            >
                              <span className="font-medium text-gray-700">
                                {transition.label}
                              </span>
                              <ArrowRight className="h-3 w-3 text-gray-400" />
                              <span className="text-gray-600">
                                {getStageName(transition.to_stage_id)}
                              </span>
                              {transition.to_complete && (
                                <CheckCircle className="h-3 w-3 text-green-600 ml-auto" />
                              )}
                              {transition.actions.length > 0 && (
                                <Badge variant="outline" className="text-[9px] ml-auto">
                                  {transition.actions.length} action{transition.actions.length !== 1 ? 's' : ''}
                                </Badge>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Workflow Summary */}
      {builder.transitions.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-3">Workflow Summary</h4>
          <Card className="border-gray-200">
            <CardContent className="pt-4">
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Transitions:</span>
                  <span className="font-medium">{builder.transitions.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Completion Transitions:</span>
                  <span className="font-medium">
                    {builder.transitions.filter((t) => t.to_complete).length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Actions:</span>
                  <span className="font-medium">
                    {builder.transitions.reduce((sum, t) => sum + t.actions.length, 0)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Dirty indicator */}
      {builder.dirty && (
        <Alert className="bg-yellow-50 border-yellow-200">
          <AlertCircle className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-900 text-xs">
            You have unsaved changes. Remember to save your work.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};
