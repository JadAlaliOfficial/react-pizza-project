// src/features/formVersion/components/fields/VideoUploadFieldConfig.tsx

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

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Trash2, Video, Info } from "lucide-react";
import type { Field } from "@/features/formBuilder/formVersions/types";

type VideoUploadFieldConfigProps = {
  field: Field;
  fieldIndex: number;
  onFieldChange: (updatedField: Partial<Field>) => void;
  onDelete: () => void;
};

export function VideoUploadFieldConfig({
  field,
  fieldIndex,
  onFieldChange,
  onDelete,
}: VideoUploadFieldConfigProps) {
  const [allowedTypes, setAllowedTypes] = useState(
    field.placeholder || "mp4,mov,avi,webm"
  );
  const [maxSizeMB, setMaxSizeMB] = useState("100");

  return (
    <Card className="p-4 border-l-4 border-l-purple-500">
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <Video className="h-4 w-4 text-purple-500" />
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

        {/* Info Alert */}
        <Alert className="bg-purple-50 border-purple-200">
          <Info className="h-4 w-4 text-purple-600" />
          <AlertDescription className="text-xs text-purple-900">
            Video upload field with player preview and progress tracking. Videos
            stored in public/videos/ directory. Metadata includes path, size,
            format, and duration.
          </AlertDescription>
        </Alert>

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

        {/* Allowed Video Types */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">
            Allowed Video Types (Extensions)
          </label>
          <Input
            value={allowedTypes}
            onChange={(e) => {
              setAllowedTypes(e.target.value);
              onFieldChange({ placeholder: e.target.value });
            }}
            placeholder="e.g., mp4,mov,avi,webm,mkv,flv"
            className="h-9"
          />
          <p className="text-[10px] text-muted-foreground">
            💡 Comma-separated list of video extensions. Used for validation via
            "mimes" rule.
          </p>
        </div>

        {/* Video Size Limit */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">
            Maximum Video Size (MB)
          </label>
          <Input
            type="number"
            value={maxSizeMB}
            onChange={(e) => setMaxSizeMB(e.target.value)}
            placeholder="100"
            className="h-9"
            min="1"
            max="500"
          />
          <p className="text-[10px] text-muted-foreground">
            💡 Videos are typically larger. Use "maxfilesize" rule with value in
            KB (e.g., 100MB = 102400KB)
          </p>
        </div>

        {/* Helper Text */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">
            Helper Text
          </label>
          <Textarea
            value={field.helper_text ?? ""}
            onChange={(e) =>
              onFieldChange({ helper_text: e.target.value || null })
            }
            placeholder="Additional information (e.g., 'Accepted: MP4, MOV. Max size: 100MB. Max duration: 5 minutes')"
            className="min-h-[60px] text-xs"
          />
        </div>

        {/* Video Storage Information */}
        <div className="p-3 border rounded-md bg-muted/30">
          <p className="text-[10px] font-medium text-muted-foreground mb-2">
            🎬 Video Storage Details:
          </p>
          <div className="space-y-1 text-[10px] text-muted-foreground">
            <div>
              • <strong>Directory:</strong> public/videos/
            </div>
            <div>
              • <strong>Storage Format:</strong> JSON with metadata
            </div>
            <div>
              • <strong>Metadata:</strong> path, originalname, mimetype, size,
              extension, duration (optional)
            </div>
            <div>
              • <strong>Preview:</strong> Video player with playback controls
            </div>
            <div>
              • <strong>Upload:</strong> Progress indicator for large files
            </div>
          </div>
        </div>

        {/* Common Use Cases */}
        <div className="p-3 border rounded-md bg-muted/30">
          <p className="text-[10px] font-medium text-muted-foreground mb-2">
            🎥 Common Use Cases:
          </p>
          <div className="space-y-1 text-[10px] text-muted-foreground">
            <div>
              • <strong>Presentations:</strong> Pitch videos, project demos
            </div>
            <div>
              • <strong>Tutorials:</strong> How-to guides, training videos
            </div>
            <div>
              • <strong>Testimonials:</strong> Customer reviews, feedback
            </div>
            <div>
              • <strong>Recordings:</strong> Meetings, interviews, sessions
            </div>
            <div>
              • <strong>Submissions:</strong> Video assignments, applications
            </div>
          </div>
        </div>

        {/* Visibility Conditions */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">
            Visibility Conditions (JSON)
          </label>
          <Textarea
            value={
              field.visibility_conditions ?? field.visibility_condition ?? ""
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

        {/* Available Validation Rules Info */}
        <div className="pt-2 border-t">
          <p className="text-[10px] font-medium text-muted-foreground mb-1">
            📋 Available Validation Rules:
          </p>
          <div className="grid grid-cols-2 gap-1">
            <span className="text-[10px] text-muted-foreground">
              • required (must upload)
            </span>
            <span className="text-[10px] text-muted-foreground">
              • mimes (video types)
            </span>
            <span className="text-[10px] text-muted-foreground">
              • mimetypes
            </span>
            <span className="text-[10px] text-muted-foreground">• size</span>
            <span className="text-[10px] text-muted-foreground">
              • maxfilesize (KB)
            </span>
            <span className="text-[10px] text-muted-foreground">
              • minfilesize (KB)
            </span>
          </div>
          <p className="text-[10px] text-purple-700 mt-2 font-medium">
            ⚠️ Stored in videos/ directory. Large file sizes supported. Progress
            tracking recommended.
          </p>
        </div>

        {/* Example Validation Configuration */}
        <Alert className="bg-amber-50 border-amber-200">
          <Info className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-xs text-amber-900">
            <strong>Example Validation:</strong> Add "mimes" rule with props:{" "}
            <code className="bg-amber-100 px-1 rounded">
              {`{ "types": ["mp4", "mov", "webm"] }`}
            </code>{" "}
            and "maxfilesize" rule with props:{" "}
            <code className="bg-amber-100 px-1 rounded">
              {`{ "maxsize": 102400 }`}
            </code>{" "}
            (100MB). Consider upload time for large videos.
          </AlertDescription>
        </Alert>

        {/* Performance Note */}
        <Alert className="bg-blue-50 border-blue-200">
          <Info className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-xs text-blue-900">
            <strong>Performance Tip:</strong> For large videos, consider
            implementing chunked uploads, compression, or transcoding. Display
            upload progress to improve user experience.
          </AlertDescription>
        </Alert>
      </div>
    </Card>
  );
}