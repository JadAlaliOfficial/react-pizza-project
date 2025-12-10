// src/features/formVersion/components/preview/ImageUploadPreview.tsx

/**
 * Image Upload Preview Component
 *
 * Displays a preview of how the Image Upload field will appear in the form
 * Shows image upload area with preview functionality
 */

import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Image as ImageIcon, Upload } from "lucide-react";
import type { Field } from "@/features/formBuilder/formVersions/types";

type ImageUploadPreviewProps = {
  field: Field;
};

export function ImageUploadPreview({ field }: ImageUploadPreviewProps) {
  const allowedTypes = field.placeholder || "jpg,jpeg,png,gif,webp";
  const typeArray = allowedTypes.split(",").map((t) => t.trim().toUpperCase());

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <ImageIcon className="h-3 w-3 text-pink-500" />
        <Label className="text-sm font-medium">
          {field.label}
          {/* You can add a required indicator based on field rules */}
        </Label>
        <Badge variant="secondary" className="text-[10px]">
          Image Upload
        </Badge>
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
            <p className="text-xs text-muted-foreground">
              Accepted formats: {typeArray.join(", ")}
            </p>
          </div>
        </div>
      </div>

      {field.helper_text && (
        <p className="text-xs text-muted-foreground">{field.helper_text}</p>
      )}

      <p className="text-[10px] text-pink-600 italic">
        ✓ Image upload with preview. Stored in images/ directory. JSON metadata
        includes dimensions. Supports base64 encoding.
      </p>
    </div>
  );
}