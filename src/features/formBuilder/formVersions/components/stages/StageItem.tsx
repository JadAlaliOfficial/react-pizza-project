// src/features/formVersion/components/stages/StageItem.tsx

/**
 * Individual stage item component
 * Renders a single stage as a card with quick edit controls
 */

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Pencil, Trash2, Star } from 'lucide-react';
import type { UiStage } from '../../types/formVersion.ui-types';
import { isFakeId } from '../../types/formVersion.ui-types';

// ============================================================================
// Component Props
// ============================================================================

interface StageItemProps {
  stage: UiStage;
  onChange: (stage: UiStage) => void;
  onDelete: () => void;
  onEdit: () => void;
}

// ============================================================================
// Component
// ============================================================================

/**
 * StageItem Component
 * 
 * Displays a single stage with inline editing capabilities.
 * Shows stage status, name editing, and quick actions.
 * 
 * @param stage - Stage to render
 * @param onChange - Callback when stage is modified
 * @param onDelete - Callback when delete is requested
 * @param onEdit - Callback when detailed edit is requested
 */
export const StageItem: React.FC<StageItemProps> = ({
  stage,
  onChange,
  onDelete,
  onEdit,
}) => {
  console.debug('[StageItem] Rendering stage:', stage.id);

  /**
   * Handles stage name change
   */
  const handleNameChange = (name: string): void => {
    console.debug('[StageItem] Updating stage name:', stage.id, '->', name);
    onChange({ ...stage, name });
  };

  /**
   * Handles is_initial toggle
   */
  const handleInitialToggle = (is_initial: boolean): void => {
    console.debug('[StageItem] Toggling is_initial:', stage.id, '->', is_initial);
    onChange({ ...stage, is_initial });
  };

  const isNewStage = stage.id && isFakeId(stage.id);

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          {/* Stage icon/indicator */}
          <div className="flex-shrink-0 mt-1">
            {stage.is_initial ? (
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                <Star className="h-4 w-4 text-blue-600 fill-blue-600" />
              </div>
            ) : (
              <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                <span className="text-xs font-medium text-gray-600">S</span>
              </div>
            )}
          </div>

          {/* Stage content */}
          <div className="flex-1 space-y-3">
            {/* Name and badges */}
            <div className="flex items-center gap-2 flex-wrap">
              <Input
                value={stage.name}
                onChange={(e) => handleNameChange(e.target.value)}
                className="max-w-xs font-medium"
                placeholder="Stage name"
              />
              {stage.is_initial && (
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

            {/* Meta info */}
            <div className="flex items-center gap-4 text-xs text-gray-500">
              <span>{stage.sections.length} section(s)</span>
              {stage.access_rule && (
                <span>
                  Access: {stage.access_rule.allow_authenticated_users ? 'Authenticated' : 'Custom'}
                </span>
              )}
            </div>

            {/* Controls */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Switch
                  id={`initial-${stage.id}`}
                  checked={stage.is_initial}
                  onCheckedChange={handleInitialToggle}
                />
                <Label htmlFor={`initial-${stage.id}`} className="text-sm cursor-pointer">
                  Initial stage
                </Label>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex-shrink-0 flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={onEdit}
              className="h-8 w-8 p-0"
              title="Edit details"
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onDelete}
              className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
              title="Delete stage"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
