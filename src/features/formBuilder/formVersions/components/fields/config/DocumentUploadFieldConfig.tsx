// src/features/formVersion/components/fields/config/DocumentUploadFieldConfig.tsx

/**
 * Document Upload Field Configuration Component
 *
 * Provides UI for configuring a Document Upload field:
 * - Label (main question)
 * - Allowed document types
 * - File size limits
 * - Helper text
 * - Visibility conditions
 */

import React from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trash2, FileText } from 'lucide-react';
import type { FieldConfigComponentProps } from '../fieldComponentRegistry';

// ============================================================================
// Component
// ============================================================================

/**
 * DocumentUploadFieldConfig Component
 *
 * Configuration UI for Document Upload field type
 * Features:
 * - Label, allowed document types, helper text
 * - Size hints
 * - Visibility conditions (JSON)
 * - Document storage and validation rule guidance
 */
export const DocumentUploadFieldConfig: React.FC<FieldConfigComponentProps> = ({
  field,
  fieldIndex,
  onFieldChange,
  onDelete,
}) => {
  console.debug('[DocumentUploadFieldConfig] Rendering for field:', field.id);

  return (
    <Card className="p-4 border-l-4 border-l-orange-500">
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-orange-500" />
            <Badge variant="outline" className="text-xs">
              Document Upload
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
            placeholder="e.g., Upload your financial report"
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
            placeholder="Additional information (e.g., 'Select appointment date and time')"
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
