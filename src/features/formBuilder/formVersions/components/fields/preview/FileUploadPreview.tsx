// src/features/formVersion/components/fields/preview/FileUploadPreview.tsx

/**
 * File Upload Preview Component
 *
 * Displays a preview of how the File Upload field will appear in the form
 * Shows file upload area with accepted formats
 */

import React from 'react';
import { Label } from '@/components/ui/label';
import { Upload } from 'lucide-react';
import type { FieldPreviewComponentProps } from '../fieldComponentRegistry';

// ============================================================================
// Component
// ============================================================================

/**
 * FileUploadPreview Component
 *
 * Preview component for File Upload field type
 * Features:
 * - Label with upload icon and badge
 * - Disabled drag-and-drop style area
 * - Accepted formats list
 * - Rules indicator
 */
export const FileUploadPreview: React.FC<FieldPreviewComponentProps> = ({
  field,
}) => {
  console.debug('[FileUploadPreview] Rendering for field:', field.id);
  const isRequired = field.rules?.some(
    (rule) => rule.input_rule_id !== null && rule.input_rule_id !== undefined,
  );

  return (
    <div className="space-y-2">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Upload className="h-3.5 w-3.5 text-violet-500" />
        <Label className="text-sm font-medium flex-1">
          {field.label}
          {isRequired && <span className="text-destructive ml-1">*</span>}
        </Label>
      </div>

      {/* Upload Area Preview */}
      <div className="border-2 border-dashed border-violet-300 rounded-md p-6 bg-violet-50/30 text-center">
        <div className="flex flex-col items-center justify-center gap-2">
          <Upload className="h-8 w-8 text-violet-400" />
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">
              Drag and drop file here, or click to browse
            </p>
          </div>
        </div>
      </div>

      {/* Helper text */}
      {field.helper_text && (
        <p className="text-xs text-muted-foreground">{field.helper_text}</p>
      )}
    </div>
  );
};
