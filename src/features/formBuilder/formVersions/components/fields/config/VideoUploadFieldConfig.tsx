// src/features/formVersion/components/fields/config/VideoUploadFieldConfig.tsx

/**
 * Video Upload Field Configuration Component
 *
 * Provides UI for configuring a Video Upload field:
 * - Label (main question)
 * - Allowed video types
 * - File size limits (typically larger)
 * - Helper text
 * - Visibility conditions
 */

import React from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trash2, Video as VideoIcon } from 'lucide-react';
import type { FieldConfigComponentProps } from '../fieldComponentRegistry';

// ============================================================================
// Component
// ============================================================================

/**
 * VideoUploadFieldConfig Component
 *
 * Configuration UI for Video Upload field type
 * Features:
 * - Label, allowed video types, helper text
 * - Size hints for large uploads
 * - Visibility conditions (JSON)
 * - Video storage and validation rule guidance
 */
export const VideoUploadFieldConfig: React.FC<FieldConfigComponentProps> = ({
  field,
  fieldIndex,
  onFieldChange,
  onDelete,
}) => {
  console.debug('[VideoUploadFieldConfig] Rendering for field:', field.id);

  return (
    <Card className="p-4 border-l-4 border-l-purple-500">
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <VideoIcon className="h-4 w-4 text-purple-500" />
            <Badge variant="outline" className="text-xs">
              Video Upload
            </Badge>
            <span className="text-xs text-muted-foreground">
              Field {fieldIndex + 1}
            </span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            type="button"
            onClick={onDelete}
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>

        {/* Label */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">
            Label <span className="text-destructive">*</span>
          </label>
          <Input
            value={field.label}
            onChange={(e) => onFieldChange({ label: e.target.value })}
            placeholder="e.g., Upload your presentation video"
            className="h-9"
            maxLength={255}
          />
        </div>

        {/* Helper Text */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">
            Helper Text
          </label>
          <Textarea
            value={field.helper_text ?? ''}
            onChange={(e) =>
              onFieldChange({ helper_text: e.target.value || null })
            }
            placeholder="Additional information (e.g., 'Accepted: MP4, MOV. Max size: 100MB. Max duration: 5 minutes')"
            className="min-h-[60px] text-xs"
          />
        </div>

        {/* Visibility Conditions */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">
            Visibility Conditions (JSON)
          </label>
          <Textarea
            value={
              field.visibility_conditions ?? field.visibility_condition ?? ''
            }
            onChange={(e) =>
              onFieldChange({
                visibility_conditions: e.target.value || null,
              })
            }
            placeholder='e.g., {"field_id": 5, "operator": "equals", "value": "yes"}'
            className="min-h-[60px] text-xs font-mono"
          />
        </div>
      </div>
    </Card>
  );
};
