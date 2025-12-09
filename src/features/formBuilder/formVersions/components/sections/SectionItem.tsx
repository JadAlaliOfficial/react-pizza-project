// src/features/formVersion/components/sections/SectionItem.tsx

/**
 * Individual section item component
 * Renders a single section as a card with quick edit controls
 */

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Pencil, Trash2, ChevronUp, ChevronDown, Layers } from 'lucide-react';
import type { UiSection } from '../../types/formVersion.ui-types';
import { isFakeId } from '../../types/formVersion.ui-types';

// ============================================================================
// Component Props
// ============================================================================

interface SectionItemProps {
  section: UiSection;
  index: number;
  total: number;
  onChange: (section: UiSection) => void;
  onDelete: () => void;
  onEdit: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
}

// ============================================================================
// Component
// ============================================================================

/**
 * SectionItem Component
 * 
 * Displays a single section with inline editing capabilities.
 * Shows section status, name editing, and quick actions including reordering.
 * 
 * @param section - Section to render
 * @param index - Position in list (0-based)
 * @param total - Total number of sections
 * @param onChange - Callback when section is modified
 * @param onDelete - Callback when delete is requested
 * @param onEdit - Callback when detailed edit is requested
 * @param onMoveUp - Callback to move section up
 * @param onMoveDown - Callback to move section down
 */
export const SectionItem: React.FC<SectionItemProps> = ({
  section,
  index,
  total,
  onChange,
  onDelete,
  onEdit,
  onMoveUp,
  onMoveDown,
}) => {
  console.debug('[SectionItem] Rendering section:', section.id);

  /**
   * Handles section name change
   */
  const handleNameChange = (name: string): void => {
    console.debug('[SectionItem] Updating section name:', section.id, '->', name);
    onChange({ ...section, name });
  };

  const isNewSection = section.id && isFakeId(section.id);
  const canMoveUp = index > 0;
  const canMoveDown = index < total - 1;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-3">
        <div className="flex items-start gap-3">
          {/* Section icon/indicator */}
          <div className="flex-shrink-0 mt-1">
            <div className="w-8 h-8 rounded bg-purple-100 flex items-center justify-center">
              <Layers className="h-4 w-4 text-purple-600" />
            </div>
          </div>

          {/* Section content */}
          <div className="flex-1 space-y-2">
            {/* Name and badges */}
            <div className="flex items-center gap-2 flex-wrap">
              <Input
                value={section.name}
                onChange={(e) => handleNameChange(e.target.value)}
                className="max-w-xs font-medium h-8 text-sm"
                placeholder="Section name"
              />
              <Badge variant="outline" className="text-xs">
                Order: {section.order}
              </Badge>
              {isNewSection && (
                <Badge variant="outline" className="text-xs text-orange-600 border-orange-600">
                  New
                </Badge>
              )}
            </div>

            {/* Meta info */}
            <div className="flex items-center gap-4 text-xs text-gray-500">
              <span>{section.fields.length} field(s)</span>
              {section.visibility_conditions && (
                <span className="text-blue-600">Has visibility rules</span>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex-shrink-0 flex gap-1">
            {/* Move up */}
            <Button
              variant="ghost"
              size="sm"
              onClick={onMoveUp}
              disabled={!canMoveUp}
              className="h-7 w-7 p-0"
              title="Move up"
            >
              <ChevronUp className="h-4 w-4" />
            </Button>

            {/* Move down */}
            <Button
              variant="ghost"
              size="sm"
              onClick={onMoveDown}
              disabled={!canMoveDown}
              className="h-7 w-7 p-0"
              title="Move down"
            >
              <ChevronDown className="h-4 w-4" />
            </Button>

            {/* Edit */}
            <Button
              variant="ghost"
              size="sm"
              onClick={onEdit}
              className="h-7 w-7 p-0"
              title="Edit details"
            >
              <Pencil className="h-4 w-4" />
            </Button>

            {/* Delete */}
            <Button
              variant="ghost"
              size="sm"
              onClick={onDelete}
              className="h-7 w-7 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
              title="Delete section"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
