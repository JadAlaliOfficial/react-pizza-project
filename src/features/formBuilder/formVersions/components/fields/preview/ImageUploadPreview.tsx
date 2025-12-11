// src/features/formVersion/components/fields/preview/ImageUploadPreview.tsx

/**
 * Image Upload Preview Component
 *
 * Displays a preview of how the Image Upload field will appear in the form
 * Shows image upload area with preview functionality
 */

import React from 'react';
import { Label } from '@/components/ui/label';
import { Image as ImageIcon, Upload } from 'lucide-react';
import type { FieldPreviewComponentProps } from '../fieldComponentRegistry';

// ============================================================================
// Component
// ============================================================================

/**
 * ImageUploadPreview Component
 *
 * Preview component for Image Upload field type
 * Features:
 * - Label with image icon and badge
 * - Disabled image preview placeholder + upload area
 * - Accepted formats list
 * - Rules indicator
 */
export const ImageUploadPreview: React.FC<FieldPreviewComponentProps> = ({
  field,
}) => {
  console.debug('[ImageUploadPreview] Rendering for field:', field.id);

  const isRequired = field.rules?.some(
    (rule) => rule.input_rule_id !== null && rule.input_rule_id !== undefined,
  );

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <ImageIcon className="h-3.5 w-3.5 text-pink-500" />
        <Label className="text-sm font-medium flex-1">
          {field.label}
          {isRequired && <span className="text-destructive ml-1">*</span>}
        </Label>
      </div>

      {/* Upload Area Preview */}
      <div className="border-2 border-dashed border-pink-300 rounded-md bg-pink-50/30">
        {/* Image Preview Placeholder */}
        <div className="aspect-video bg-gradient-to-br from-pink-100 to-purple-100 rounded-t-md flex items-center justify-center">
          <ImageIcon className="h-16 w-16 text-pink-300" />
        </div>

        {/* Upload Button Area */}
        <div className="p-4 text-center border-t border-pink-200">
          <div className="flex flex-col items-center gap-2">
            <Upload className="h-6 w-6 text-pink-400" />
            <p className="text-sm text-muted-foreground">
              Drag and drop image here, or click to browse
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
