// src/features/formVersion/components/preview/LocationPickerPreview.tsx

/**
 * Location Picker Preview Component
 *
 * Displays a preview of how the Location Picker field will appear in the form
 * Shows interactive map with marker, search, and location details
 */

import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Search, Navigation, Crosshair } from "lucide-react";
import type { Field } from "@/features/formBuilder/formVersions/types";

type LocationPickerPreviewProps = {
  field: Field;
};

export function LocationPickerPreview({ field }: LocationPickerPreviewProps) {
  const [location, ] = useState({
    lat: 40.7128,
    lng: -74.006,
    address: "New York, NY, USA",
  });
  const [isSelected, ] = useState(false);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <MapPin className="h-3 w-3 text-emerald-500" />
        <Label className="text-sm font-medium">
          {field.label}
          {/* You can add a required indicator based on field rules */}
        </Label>
        <Badge variant="secondary" className="text-[10px]">
          Location
        </Badge>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={
            field.placeholder || "Search for a location or address..."
          }
          disabled
          className="pl-10 pr-10 h-11 border-emerald-200 focus:border-emerald-500"
        />
        <Button
          variant="ghost"
          size="icon"
          disabled
          className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
        >
          <Navigation className="h-4 w-4 text-emerald-600" />
        </Button>
      </div>

      {/* Map Container */}
      <div className="relative w-full h-64 border-2 border-emerald-200 rounded-lg bg-emerald-50 overflow-hidden">
        {/* Simulated map background with grid */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              "linear-gradient(rgba(16, 185, 129, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(16, 185, 129, 0.1) 1px, transparent 1px)",
            backgroundSize: "20px 20px",
          }}
        />

        {/* Map Controls */}
        <div className="absolute top-3 right-3 flex flex-col gap-1">
          <Button
            variant="secondary"
            size="icon"
            disabled
            className="h-8 w-8 bg-white shadow-md"
          >
            <span className="text-lg font-bold">+</span>
          </Button>
          <Button
            variant="secondary"
            size="icon"
            disabled
            className="h-8 w-8 bg-white shadow-md"
          >
            <span className="text-lg font-bold">−</span>
          </Button>
          <Button
            variant="secondary"
            size="icon"
            disabled
            className="h-8 w-8 bg-white shadow-md mt-1"
          >
            <Crosshair className="h-4 w-4" />
          </Button>
        </div>

        {/* Center Marker */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-full">
          <MapPin className="h-10 w-10 text-red-500 drop-shadow-2xl" />
        </div>

        {/* Map Type Toggle */}
        <div className="absolute bottom-3 left-3">
          <div className="bg-white rounded shadow-md flex">
            <button
              className="px-3 py-1 text-xs font-medium border-r bg-emerald-100 text-emerald-700"
              disabled
            >
              Road
            </button>
            <button
              className="px-3 py-1 text-xs font-medium text-muted-foreground"
              disabled
            >
              Satellite
            </button>
          </div>
        </div>

        {/* Placeholder text when no location */}
        {!isSelected && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center text-muted-foreground bg-white/80 p-4 rounded-lg">
              <MapPin className="h-8 w-8 mx-auto mb-2 text-emerald-500" />
              <p className="text-xs font-medium">Click on map to select</p>
              <p className="text-[10px]">or use the search bar above</p>
            </div>
          </div>
        )}
      </div>

      {/* Location Details */}
      <div className="p-3 border border-emerald-200 rounded-md bg-emerald-50/50">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">
              Selected Location:
            </span>
            {isSelected ? (
              <Badge className="bg-emerald-500">Selected ✓</Badge>
            ) : (
              <Badge variant="outline" className="text-muted-foreground">
                Not selected
              </Badge>
            )}
          </div>

          <div className="space-y-1 text-xs">
            <div className="flex items-start gap-2">
              <MapPin className="h-3 w-3 text-emerald-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="font-medium text-emerald-900">
                  {location.address}
                </p>
                <p className="text-[10px] text-muted-foreground font-mono">
                  Lat: {location.lat.toFixed(6)}, Lng: {location.lng.toFixed(6)}
                </p>
              </div>
            </div>
          </div>

          <Button
            variant="link"
            size="sm"
            disabled
            className="h-auto p-0 text-[10px] text-emerald-600"
          >
            View in Google Maps →
          </Button>
        </div>
      </div>

      {field.helper_text && (
        <p className="text-xs text-muted-foreground">{field.helper_text}</p>
      )}

      <p className="text-[10px] text-emerald-600 italic">
        🗺️ Interactive map with location picker. Stored as JSON with lat/lng.
        Filter by radius or bounding box.
      </p>
    </div>
  );
}
