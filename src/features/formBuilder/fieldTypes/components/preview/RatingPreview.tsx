// src/features/formVersion/components/preview/RatingPreview.tsx

/**
 * Rating Preview Component
 *
 * Displays a preview of how the Rating field will appear in the form
 * Shows interactive star rating with hover effects (5-star fixed scale)
 */

import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Star } from "lucide-react";
import type { Field } from "@/features/formBuilder/formVersions/types";

type RatingPreviewProps = {
  field: Field;
};

export function RatingPreview({ field }: RatingPreviewProps) {
  const defaultRating = Math.max(
    0,
    Math.min(5, parseInt(field.default_value || "0"))
  ); // Clamp to 0-5 like backend
  const [hoveredStar, setHoveredStar] = useState<number | null>(null);
  const maxStars = 5; // Fixed in backend

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Star className="h-3 w-3 text-amber-500 fill-amber-500" />
        <Label className="text-sm font-medium">
          {field.label}
          {/* You can add a required indicator based on field rules */}
        </Label>
      </div>

      {/* Star Rating Display */}
      <div className="space-y-2">
        <div className="flex items-center gap-1">
          {Array.from({ length: maxStars }).map((_, i) => {
            const starNumber = i + 1;
            const isFilled =
              hoveredStar !== null
                ? starNumber <= hoveredStar
                : starNumber <= defaultRating;

            return (
              <button
                key={i}
                onMouseEnter={() => setHoveredStar(starNumber)}
                onMouseLeave={() => setHoveredStar(null)}
                className="transition-transform hover:scale-110 disabled:cursor-not-allowed"
                disabled
              >
                <Star
                  className={`h-8 w-8 transition-colors ${
                    isFilled
                      ? "text-amber-500 fill-amber-500"
                      : "text-gray-300 fill-gray-100"
                  }`}
                />
              </button>
            );
          })}
          {/* Rating Display */}
          <span className="ml-2 text-sm text-muted-foreground">
            {hoveredStar || defaultRating || 0} / {maxStars}
          </span>
        </div>
      </div>

      {field.helper_text && (
        <p className="text-xs text-muted-foreground">{field.helper_text}</p>
      )}
    </div>
  );
}
