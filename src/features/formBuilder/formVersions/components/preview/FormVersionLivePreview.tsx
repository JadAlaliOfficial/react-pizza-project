// src/features/formVersion/components/preview/FormVersionLivePreview.tsx

/**
 * Live preview component for form version workflow
 * Renders a visual representation of stages and their flow
 * Architecture supports future expansion to show sections, fields, and transitions
 */

import React from 'react';
import { Card, CardContent } from '../../../../../components/ui/card';
import { Badge } from '../../../../../components/ui/badge';
import { Star, ArrowRight } from 'lucide-react';
import type { UiStage } from '../../types/formVersion.ui-types';
import { isFakeId } from '../../types/formVersion.ui-types';

// ============================================================================
// Component Props
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
 * Displays a read-only visual preview of the form workflow.
 * Shows stages in order with visual indicators for initial stage.
 * 
 * @param stages - Stages to preview
 */
export const FormVersionLivePreview: React.FC<FormVersionLivePreviewProps> = ({ stages }) => {
  console.debug('[FormVersionLivePreview] Rendering preview with', stages.length, 'stages');

  return (
    <div className="h-full flex flex-col bg-gray-50 p-6 overflow-y-auto">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Workflow Preview</h2>
        <p className="mt-1 text-sm text-gray-500">
          Visual representation of your form workflow
        </p>
      </div>

      {/* Empty state */}
      {stages.length === 0 && (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-200 flex items-center justify-center">
              <Star className="h-8 w-8 text-gray-400" />
            </div>
            <p className="text-sm font-medium text-gray-900">No stages defined</p>
            <p className="mt-1 text-sm text-gray-500">
              Add stages to see your workflow preview
            </p>
          </div>
        </div>
      )}

      {/* Stage flow */}
      {stages.length > 0 && (
        <div className="space-y-4">
          {stages.map((stage, index) => {
            const isNewStage = stage.id && isFakeId(stage.id);
            const isInitial = stage.is_initial;
            const sectionCount = stage.sections.length;
            const fieldCount = stage.sections.reduce(
              (sum, section) => sum + section.fields.length,
              0
            );

            return (
              <div key={stage.id}>
                {/* Stage card */}
                <Card
                  className={`${
                    isInitial ? 'border-blue-500 border-2' : 'border-gray-200'
                  } transition-all hover:shadow-md`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      {/* Stage number/icon */}
                      <div className="flex-shrink-0">
                        {isInitial ? (
                          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <Star className="h-5 w-5 text-blue-600 fill-blue-600" />
                          </div>
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                            <span className="text-sm font-semibold text-gray-700">
                              {index + 1}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Stage info */}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap mb-2">
                          <h3 className="font-medium text-gray-900">{stage.name}</h3>
                          {isInitial && (
                            <Badge variant="default" className="bg-blue-500">
                              Initial
                            </Badge>
                          )}
                          {isNewStage && (
                            <Badge variant="outline" className="text-orange-600 border-orange-600">
                              New
                            </Badge>
                          )}
                        </div>

                        {/* Stage stats */}
                        <div className="space-y-1 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{sectionCount}</span>
                            <span>section{sectionCount !== 1 ? 's' : ''}</span>
                            <span className="text-gray-400">•</span>
                            <span className="font-medium">{fieldCount}</span>
                            <span>field{fieldCount !== 1 ? 's' : ''}</span>
                          </div>

                          {stage.access_rule && (
                            <div className="text-xs text-gray-500">
                              Access:{' '}
                              {stage.access_rule.allow_authenticated_users
                                ? 'All authenticated users'
                                : 'Restricted'}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Arrow connector (except after last stage) */}
                {index < stages.length - 1 && (
                  <div className="flex justify-center mt-4">
                    <ArrowRight className="h-6 w-6 text-gray-400" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
