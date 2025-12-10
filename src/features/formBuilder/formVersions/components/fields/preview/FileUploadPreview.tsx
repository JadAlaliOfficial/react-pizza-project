// src/features/formVersion/components/fields/preview/FileUploadPreview.tsx

/**
 * File Upload Preview Component
 *
 * Displays a preview of how the File Upload field will appear in the form
 * Shows file upload area with accepted formats
 */

import React from 'react';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
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

  const allowedTypes = field.placeholder || 'pdf,doc,docx,txt';
  const typeArray = allowedTypes
    .split(',')
    .map((t) => t.trim())
    .filter((t) => t.length > 0);

  const hasRules = field.rules && field.rules.length > 0;
  const isRequired = field.rules?.some(
    (rule) => rule.input_rule_id !== null && rule.input_rule_id !== undefined
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
        <Badge variant="secondary" className="text-[10px] h-4 px-1.5">
          File Upload
        </Badge>
        {hasRules && (
          <span className="text-[10px] text-muted-foreground font-normal">
            ({field.rules.length} rule{field.rules.length !== 1 ? 's' : ''})
          </span>
        )}
      </div>

      {/* Upload Area Preview */}
      <div className="border-2 border-dashed border-violet-300 rounded-md p-6 bg-violet-50/30 text-center">
        <div className="flex flex-col items-center justify-center gap-2">
          <Upload className="h-8 w-8 text-violet-400" />
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">
              Drag and drop file here, or click to browse
            </p>
            <p className="text-xs text-muted-foreground">
              Accepted formats:{' '}
              {typeArray.length === 0
                ? 'Any'
                : typeArray.map((type, index) => (
                    <span key={index}>
                      {index > 0 && ', '}
                      <strong className="text-violet-600">
                        {type.toUpperCase()}
                      </strong>
                    </span>
                  ))}
            </p>
          </div>
        </div>
      </div>

      {/* Helper text */}
      {field.helper_text && (
        <p className="text-xs text-muted-foreground">{field.helper_text}</p>
      )}

      {/* File-upload-specific hint */}
      <p className="text-[10px] text-violet-600 italic">
        ✓ File upload with drag-and-drop. Stored as JSON with metadata (path, name, size, type). Secure server-side validation.
      </p>
    </div>
  );
};
