// src/features/formVersion/components/fields/LocationPickerFieldConfig.tsx

/**
 * Location Picker Field Configuration Component
 *
 * Provides UI for configuring a Location Picker field:
 * - Label (main question)
 * - Default location (lat/lng)
 * - Map provider selection
 * - Zoom level
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Trash2, MapPin, Info } from "lucide-react";
import type { Field } from "@/features/formBuilder/formVersions/types";

type LocationPickerFieldConfigProps = {
  field: Field;
  fieldIndex: number;
  onFieldChange: (updatedField: Partial<Field>) => void;
  onDelete: () => void;
};

export function LocationPickerFieldConfig({
  field,
  fieldIndex,
  onFieldChange,
  onDelete,
}: LocationPickerFieldConfigProps) {
  const [defaultLat, setDefaultLat] = useState("40.7128");
  const [defaultLng, setDefaultLng] = useState("-74.0060");
  const [defaultAddress, setDefaultAddress] = useState("New York, NY, USA");
  const [zoomLevel, setZoomLevel] = useState("13");
  const [mapProvider, setMapProvider] = useState("google");

  const handleDefaultLocationChange = () => {
    const locationData = JSON.stringify({
      lat: parseFloat(defaultLat),
      lng: parseFloat(defaultLng),
      address: defaultAddress,
    });
    onFieldChange({ default_value: locationData });
  };

  return (
    <Card className="p-4 border-l-4 border-l-emerald-500">
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-emerald-500" />
            <Badge variant="outline" className="text-xs">
              Location Picker
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
        <Alert className="bg-emerald-50 border-emerald-200">
          <Info className="h-4 w-4 text-emerald-600" />
          <AlertDescription className="text-xs text-emerald-900">
            Interactive map picker for selecting geographic locations. Stored as
            JSON with lat/lng coordinates and address. Supports geocoding and
            reverse geocoding.
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
            placeholder="e.g., Select your location"
            className="h-9"
            maxLength={255}
          />
        </div>

        {/* Map Provider */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">
            Map Provider
          </label>
          <Select value={mapProvider} onValueChange={setMapProvider}>
            <SelectTrigger className="h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="google">Google Maps</SelectItem>
              <SelectItem value="leaflet">Leaflet (OpenStreetMap)</SelectItem>
              <SelectItem value="mapbox">Mapbox</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Default Location */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">
            Default Location
          </label>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] text-muted-foreground">
                Latitude
              </label>
              <Input
                type="number"
                value={defaultLat}
                onChange={(e) => setDefaultLat(e.target.value)}
                onBlur={handleDefaultLocationChange}
                placeholder="40.7128"
                className="h-9 text-xs"
                step="0.000001"
                min="-90"
                max="90"
              />
            </div>
            <div>
              <label className="text-[10px] text-muted-foreground">
                Longitude
              </label>
              <Input
                type="number"
                value={defaultLng}
                onChange={(e) => setDefaultLng(e.target.value)}
                onBlur={handleDefaultLocationChange}
                placeholder="-74.0060"
                className="h-9 text-xs"
                step="0.000001"
                min="-180"
                max="180"
              />
            </div>
          </div>
          <Input
            value={defaultAddress}
            onChange={(e) => setDefaultAddress(e.target.value)}
            onBlur={handleDefaultLocationChange}
            placeholder="New York, NY, USA"
            className="h-9 text-xs"
          />
          <p className="text-[10px] text-muted-foreground">
            💡 Default map center. User can select any location.
          </p>
        </div>

        {/* Zoom Level */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">
            Default Zoom Level
          </label>
          <div className="flex items-center gap-2">
            <Input
              type="number"
              value={zoomLevel}
              onChange={(e) => setZoomLevel(e.target.value)}
              className="h-9 w-20"
              min="1"
              max="20"
            />
            <span className="text-xs text-muted-foreground">
              (1 = World, 13 = City, 20 = Building)
            </span>
          </div>
        </div>

        {/* Map Preview */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">
            Map Preview
          </label>
          <div className="relative w-full h-48 border-2 border-emerald-200 rounded-md bg-emerald-50 overflow-hidden">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <MapPin className="h-12 w-12 mx-auto mb-2 text-emerald-500" />
                <p className="text-xs font-medium">Interactive Map</p>
                <p className="text-[10px]">
                  Lat: {defaultLat}, Lng: {defaultLng}
                </p>
                <p className="text-[10px] text-emerald-600 mt-1">
                  {defaultAddress}
                </p>
              </div>
            </div>
            {/* Central marker indicator */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
              <MapPin className="h-8 w-8 text-red-500 drop-shadow-lg" />
            </div>
          </div>
        </div>

        {/* Placeholder */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">
            Placeholder Text
          </label>
          <Input
            value={field.placeholder ?? ""}
            onChange={(e) =>
              onFieldChange({ placeholder: e.target.value || null })
            }
            placeholder="e.g., Click on the map to select location"
            className="h-9"
            maxLength={255}
          />
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
            placeholder="Additional information (e.g., 'Use the search bar or click on the map')"
            className="min-h-[60px] text-xs"
          />
        </div>

        {/* Location Picker Details */}
        <div className="p-3 border rounded-md bg-muted/30">
          <p className="text-[10px] font-medium text-muted-foreground mb-2">
            🗺️ Location Picker Details:
          </p>
          <div className="space-y-1 text-[10px] text-muted-foreground">
            <div>
              • <strong>Storage:</strong> JSON with lat, lng, address
            </div>
            <div>
              • <strong>Format:</strong>{" "}
              {`{"lat": 40.7128, "lng": -74.0060, "address": "..."}`}
            </div>
            <div>
              • <strong>Features:</strong> Search, current location, drag marker
            </div>
            <div>
              • <strong>Geocoding:</strong> Address ↔ Coordinates conversion
            </div>
          </div>
        </div>

        {/* Common Features */}
        <div className="p-3 border rounded-md bg-muted/30">
          <p className="text-[10px] font-medium text-muted-foreground mb-2">
            ✨ Map Features:
          </p>
          <div className="grid grid-cols-2 gap-1 text-[10px] text-muted-foreground">
            <div>• Click to select</div>
            <div>• Drag marker</div>
            <div>• Address search</div>
            <div>• Current location</div>
            <div>• Zoom controls</div>
            <div>• Map types</div>
            <div>• Geocoding</div>
            <div>• Touch-friendly</div>
          </div>
        </div>

        {/* Common Use Cases */}
        <div className="p-3 border rounded-md bg-muted/30">
          <p className="text-[10px] font-medium text-muted-foreground mb-2">
            📍 Common Use Cases:
          </p>
          <div className="space-y-1 text-[10px] text-muted-foreground">
            <div>
              • <strong>Business:</strong> Store locations, branch offices
            </div>
            <div>
              • <strong>Delivery:</strong> Addresses, pickup/drop-off points
            </div>
            <div>
              • <strong>Events:</strong> Venues, meeting points
            </div>
            <div>
              • <strong>Services:</strong> Service areas, property locations
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
          <div className="grid grid-cols-1 gap-1">
            <span className="text-[10px] text-muted-foreground">
              • required
            </span>
            <span className="text-[10px] text-muted-foreground">
              • latitude (-90 to 90)
            </span>
            <span className="text-[10px] text-muted-foreground">
              • longitude (-180 to 180)
            </span>
          </div>
          <p className="text-[10px] text-emerald-700 mt-2 font-medium">
            💡 Use "required" rule to ensure location is selected. Lat/lng
            validation ensures valid coordinates.
          </p>
        </div>

        {/* Example Validation Configuration */}
        <Alert className="bg-amber-50 border-amber-200">
          <Info className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-xs text-amber-900">
            <strong>Filtering:</strong> Supports radius search (within X
            km/miles) and bounding box search for geographic queries. Perfect
            for "find nearby" features.
          </AlertDescription>
        </Alert>
      </div>
    </Card>
  );
}
