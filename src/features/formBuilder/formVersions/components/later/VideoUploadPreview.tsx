// src/features/formVersion/components/preview/VideoUploadPreview.tsx

/**
 * Video Upload Preview Component
 *
 * Displays a preview of how the Video Upload field will appear in the form
 * Shows video upload area with player preview placeholder
 */

import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Video, Upload, Play } from "lucide-react";
import type { Field } from "@/features/formBuilder/formVersions/types";

type VideoUploadPreviewProps = {
  field: Field;
};

export function VideoUploadPreview({ field }: VideoUploadPreviewProps) {
  const allowedTypes = field.placeholder || "mp4,mov,avi,webm";
  const typeArray = allowedTypes.split(",").map((t) => t.trim().toUpperCase());

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Video className="h-3 w-3 text-purple-500" />
        <Label className="text-sm font-medium">
          {field.label}
          {/* You can add a required indicator based on field rules */}
        </Label>
        <Badge variant="secondary" className="text-[10px]">
          Video Upload
        </Badge>
      </div>

      {/* Upload Area with Video Player Preview */}
      <div className="border-2 border-dashed border-purple-300 rounded-md bg-purple-50/30">
        {/* Video Player Placeholder */}
        <div className="aspect-video bg-gradient-to-br from-purple-900 to-indigo-900 rounded-t-md flex items-center justify-center relative">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <Play className="h-16 w-16 text-white/40 mx-auto mb-2" />
              <p className="text-white/60 text-sm font-medium">Video Preview</p>
            </div>
          </div>
          {/* Fake Video Controls */}
          <div className="absolute bottom-0 left-0 right-0 bg-black/50 p-2 flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
              <Play className="h-4 w-4 text-white" />
            </div>
            <div className="flex-1 h-1 bg-white/20 rounded-full">
              <div className="w-0 h-full bg-purple-400 rounded-full"></div>
            </div>
            <span className="text-white text-xs">0:00 / 0:00</span>
          </div>
        </div>

        {/* Upload Button Area */}
        <div className="p-4 text-center border-t border-purple-200">
          <div className="flex flex-col items-center gap-2">
            <Upload className="h-6 w-6 text-purple-400" />
            <p className="text-sm text-muted-foreground">
              Drag and drop video here, or click to browse
            </p>
            <p className="text-xs text-muted-foreground">
              Accepted formats: {typeArray.join(", ")}
            </p>
            {/* Upload Progress Bar (placeholder) */}
            <div className="w-full max-w-xs mt-2">
              <div className="h-2 bg-purple-100 rounded-full overflow-hidden">
                <div className="w-0 h-full bg-purple-500 rounded-full transition-all"></div>
              </div>
              <p className="text-[10px] text-muted-foreground mt-1 text-center">
                Upload progress will appear here
              </p>
            </div>
          </div>
        </div>
      </div>

      {field.helper_text && (
        <p className="text-xs text-muted-foreground">{field.helper_text}</p>
      )}

      <p className="text-[10px] text-purple-600 italic">
        ✓ Video upload with player preview. Stored in videos/ directory. Large
        file support with progress tracking. JSON metadata includes duration.
      </p>
    </div>
  );
}
