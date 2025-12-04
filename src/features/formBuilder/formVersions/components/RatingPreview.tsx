// src/features/formVersion/components/preview/RatingPreview.tsx

/**
 * Rating Preview Component
 *
 * Displays a preview of how the Rating field will appear in the form
 * Shows interactive star rating with hover effects
 */

import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Star } from "lucide-react";
import type { Field } from "@/features/formBuilder/formVersions/types";

type RatingPreviewProps = {
  field: Field;
};

export function RatingPreview({ field }: RatingPreviewProps) {
  const defaultRating = parseInt(field.default_value || "0");
  const [hoveredStar, setHoveredStar] = useState<number | null>(null);
  const maxStars = 5; // Default, can be configured via validation rules

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Star className="h-3 w-3 text-amber-500 fill-amber-500" />
        <Label className="text-sm font-medium">
          {field.label}
          {/* You can add a required indicator based on field rules */}
        </Label>
        <Badge variant="secondary" className="text-[10px]">
          Rating
        </Badge>
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

        {/* Rating Labels */}
        <div className="flex justify-between text-[10px] text-muted-foreground">
          <span>Poor</span>
          <span>Fair</span>
          <span>Good</span>
          <span>Very Good</span>
          <span>Excellent</span>
        </div>
      </div>

      {field.placeholder && (
        <p className="text-xs text-muted-foreground italic">
          {field.placeholder}
        </p>
      )}

      {field.helper_text && (
        <p className="text-xs text-muted-foreground">{field.helper_text}</p>
      )}

      <p className="text-[10px] text-amber-600 italic">
        ⭐ Interactive star rating. Values stored as integers (0-5). Filter by
        equals, greater than, less than, or range.
      </p>
    </div>
  );
}
