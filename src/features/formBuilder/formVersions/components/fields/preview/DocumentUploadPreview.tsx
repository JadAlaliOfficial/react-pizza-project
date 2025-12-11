// src/features/formVersion/components/fields/preview/DocumentUploadPreview.tsx

/**
 * Document Upload Preview Component
 *
 * Displays a preview of how the Document Upload field will appear in the form
 * Shows document upload area with type-specific icons
 */

import React from 'react';
import { Label } from '@/components/ui/label';
import {
  FileText,
  Upload,
  File,
  FileSpreadsheet,
  FileImage,
} from 'lucide-react';
import type { FieldPreviewComponentProps } from '../fieldComponentRegistry';

// ============================================================================
// Component
// ============================================================================

/**
 * DocumentUploadPreview Component
 *
 * Preview component for Document Upload field type
 * Features:
 * - Label with document icon and badge
 * - Document type icon strip
 * - Accepted formats list
 * - Rules indicator
 */
export const DocumentUploadPreview: React.FC<FieldPreviewComponentProps> = ({
  field,
}) => {
  console.debug('[DocumentUploadPreview] Rendering for field:', field.id);

  const isRequired = field.rules?.some(
    (rule) => rule.input_rule_id !== null && rule.input_rule_id !== undefined
  );

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <FileText className="h-3.5 w-3.5 text-orange-500" />
        <Label className="text-sm font-medium flex-1">
          {field.label}
          {isRequired && <span className="text-destructive ml-1">*</span>}
        </Label>
      </div>

      {/* Upload Area with Document Icons */}
      <div className="border-2 border-dashed border-orange-300 rounded-md bg-orange-50/30">
        {/* Document Type Icons Preview */}
        <div className="p-6 flex items-center justify-center gap-4 border-b border-orange-200">
          <div className="text-center">
            <div className="w-12 h-16 bg-red-100 rounded border-2 border-red-300 flex items-center justify-center mb-1">
              <FileText className="h-6 w-6 text-red-600" />
            </div>
            <span className="text-[10px] text-muted-foreground font-medium">
              PDF
            </span>
          </div>
          <div className="text-center">
            <div className="w-12 h-16 bg-blue-100 rounded border-2 border-blue-300 flex items-center justify-center mb-1">
              <File className="h-6 w-6 text-blue-600" />
            </div>
            <span className="text-[10px] text-muted-foreground font-medium">
              Word
            </span>
          </div>
          <div className="text-center">
            <div className="w-12 h-16 bg-green-100 rounded border-2 border-green-300 flex items-center justify-center mb-1">
              <FileSpreadsheet className="h-6 w-6 text-green-600" />
            </div>
            <span className="text-[10px] text-muted-foreground font-medium">
              Excel
            </span>
          </div>
          <div className="text-center">
            <div className="w-12 h-16 bg-orange-100 rounded border-2 border-orange-300 flex items-center justify-center mb-1">
              <FileImage className="h-6 w-6 text-orange-600" />
            </div>
            <span className="text-[10px] text-muted-foreground font-medium">
              PPT
            </span>
          </div>
        </div>

        {/* Upload Button Area */}
        <div className="p-4 text-center">
          <div className="flex flex-col items-center gap-2">
            <Upload className="h-6 w-6 text-orange-400" />
            <p className="text-sm text-muted-foreground">
              Drag and drop document here, or click to browse
            </p>
          </div>
        </div>
      </div>

      {field.helper_text && (
        <p className="text-xs text-muted-foreground">{field.helper_text}</p>
      )}
    </div>
  );
};
