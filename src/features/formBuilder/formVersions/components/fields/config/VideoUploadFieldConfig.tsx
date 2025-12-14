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

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trash2, Video as VideoIcon } from 'lucide-react';
import type { FieldConfigComponentProps } from '../fieldComponentRegistry';
import { useFormVersionBuilder } from '../../../hooks/useFormVersionBuilder';
import type { VisibilityCondition } from '../../shared/VisibilityConditionsBuilder';
import {
  VisibilityConditionsBuilder,
  parseVisibilityConditions,
  serializeVisibilityConditions,
} from '../../shared/VisibilityConditionsBuilder';

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
  const { stages } = useFormVersionBuilder();
  const [visibilityEditorOpen, setVisibilityEditorOpen] = useState(false);
  const [builderValue, setBuilderValue] = useState<VisibilityCondition>(null);

  useEffect(() => {
    const raw =
      field.visibility_conditions ?? field.visibility_condition ?? null;
    setBuilderValue(parseVisibilityConditions(raw));
  }, [field.visibility_conditions, field.visibility_condition]);

  return (
    <>
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
              Visibility Conditions
            </label>
            <div className="flex items-center justify-between rounded border p-2">
              <div className="text-[11px] text-muted-foreground">
                {field.visibility_conditions
                  ? 'Conditions configured'
                  : 'No conditions'}
              </div>
              <Button
                variant="outline"
                size="sm"
                type="button"
                onClick={() => setVisibilityEditorOpen(true)}
              >
                Edit Conditions
              </Button>
            </div>
          </div>
        </div>
      </Card>
      {visibilityEditorOpen && (
        <VisibilityConditionsBuilder
          value={builderValue}
          onChange={(condition) => {
            setBuilderValue(condition);
            const serialized = serializeVisibilityConditions(condition);
            onFieldChange({ visibility_conditions: serialized });
          }}
          stages={stages}
          excludeFieldId={field.id}
          open={visibilityEditorOpen}
          onClose={() => setVisibilityEditorOpen(false)}
        />
      )}
    </>
  );
};
