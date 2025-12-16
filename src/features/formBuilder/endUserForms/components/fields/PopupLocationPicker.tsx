import * as React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  MapPin,
  Copy,
  ExternalLink,
  Trash2,
  Navigation,
  Loader,
} from 'lucide-react';

import type {
  LocationPickerProps,
  LocationCoords,
  LocationValue,
} from './types/locationPickerField.types';

import {
  getDefaultLocationPickerValue,
  getUserCurrentLocation,
  formatCoordinates,
  getOpenStreetMapUrl,
  isValidCoordinates,
} from './validation/locationPickerValidation';

type PickerMessage = {
  type: 'LOCATION_PICKER_RESULT';
  lat: number;
  lng: number;
  source: string;
};

function parseCoordsText(text: string): LocationCoords | null {
  const parts = text.split(',').map((p) => Number(p.trim()));
  if (parts.length !== 2) return null;
  const [lat, lng] = parts;
  if (!isValidCoordinates(lat, lng)) return null;
  return { lat, lng };
}

export const PopupLocationPicker = React.forwardRef<
  HTMLDivElement,
  LocationPickerProps
>(
  (
    {
      field,
      value,
      onChange,
      error,
      disabled = false,
      className,
      defaultLocation = { lat: 40.7128, lng: -74.006 }, // NYC
    },
    ref,
  ) => {
    const [location, setLocation] = React.useState<LocationValue | null>(() => {
      if (value) return value;
      return getDefaultLocationPickerValue(field);
    });

    const [input, setInput] = React.useState('');
    const [isLoadingGeolocation, setIsLoadingGeolocation] =
      React.useState(false);

    // token to make sure we only accept messages from the popup we opened
    const sourceToken = React.useMemo(
      () => (crypto.randomUUID?.() ?? String(Date.now())) + '_' + field.field_id,
      [field.field_id],
    );

    const isRequired =
      field.rules?.some((rule) => rule.rule_name === 'required') ?? false;

    // keep local state in sync with external value changes
    React.useEffect(() => {
      if (value !== undefined) setLocation(value ?? null);
    }, [value]);

    // receive postMessage from popup
    React.useEffect(() => {
      const handler = (event: MessageEvent) => {
        // only accept messages from same origin
        if (event.origin !== window.location.origin) return;

        const data = event.data as Partial<PickerMessage> | undefined;
        if (!data || data.type !== 'LOCATION_PICKER_RESULT') return;
        if (data.source !== sourceToken) return;

        const lat = Number(data.lat);
        const lng = Number(data.lng);
        if (!isValidCoordinates(lat, lng)) return;

        const newLocation: LocationValue = {
          lat,
          lng,
          address: `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
        };

        setLocation(newLocation);
        onChange(newLocation);
      };

      window.addEventListener('message', handler);
      return () => window.removeEventListener('message', handler);
    }, [onChange, sourceToken]);

    const openPopup = React.useCallback(() => {
      if (disabled) return;

      const center = location ?? defaultLocation;

      const url = new URL('/location-picker.html', window.location.origin);
      url.searchParams.set('lat', String(center.lat));
      url.searchParams.set('lng', String(center.lng));
      url.searchParams.set('zoom', '13');
      url.searchParams.set('source', sourceToken);

      const w = 520;
      const h = 640;
      const left = window.screenX + Math.max(0, (window.outerWidth - w) / 2);
      const top = window.screenY + Math.max(0, (window.outerHeight - h) / 2);

      const popup = window.open(
        url.toString(),
        'locationPickerPopup',
        `width=${w},height=${h},left=${left},top=${top},resizable=yes,scrollbars=no`,
      );

      if (!popup) {
        alert('Popup blocked. Please allow popups for this site.');
      }
    }, [disabled, location, defaultLocation, sourceToken]);

    const applyFromInput = React.useCallback(() => {
      const coords = parseCoordsText(input);
      if (!coords) return;

      const newLocation: LocationValue = {
        ...coords,
        address: `${coords.lat.toFixed(6)}, ${coords.lng.toFixed(6)}`,
      };

      setLocation(newLocation);
      onChange(newLocation);
      setInput('');
    }, [input, onChange]);

    const handleGetCurrentLocation = async () => {
      setIsLoadingGeolocation(true);
      try {
        const coords = await getUserCurrentLocation();
        if (!coords) {
          alert('Unable to get your location. Please enable location access.');
          return;
        }

        const newLocation: LocationValue = {
          ...coords,
          address: `${coords.lat.toFixed(6)}, ${coords.lng.toFixed(6)}`,
        };

        setLocation(newLocation);
        onChange(newLocation);
      } finally {
        setIsLoadingGeolocation(false);
      }
    };

    const handleCopyCoordinates = () => {
      if (!location) return;
      navigator.clipboard.writeText(formatCoordinates(location.lat, location.lng));
    };

    const handleOpenExternal = () => {
      if (!location) return;
      window.open(getOpenStreetMapUrl(location.lat, location.lng), '_blank');
    };

    const handleRemove = () => {
      setLocation(null);
      onChange(null as any); // keep compat with your current form usage
    };

    return (
      <div ref={ref} className={cn('space-y-3', className)}>
        {/* Label */}
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium flex items-center gap-2">
            <MapPin className="h-4 w-4 text-emerald-500" />
            {field.label}
            {isRequired && <span className="text-destructive ml-1">*</span>}
          </Label>

          {location && <Badge className="bg-emerald-500">Selected ✓</Badge>}
        </div>

        {/* Actions row */}
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            onClick={openPopup}
            disabled={disabled}
            className="h-9"
          >
            <MapPin className="h-4 w-4 mr-2" />
            Pick on map
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={handleGetCurrentLocation}
            disabled={disabled || isLoadingGeolocation}
            className="h-9"
            title="Get current location"
          >
            {isLoadingGeolocation ? (
              <Loader className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Navigation className="h-4 w-4 mr-2" />
            )}
            Current location
          </Button>

          {location && (
            <Button
              type="button"
              variant="ghost"
              onClick={handleRemove}
              disabled={disabled}
              className="h-9"
              title="Remove location"
            >
              <Trash2 className="h-4 w-4 text-destructive mr-2" />
              Remove
            </Button>
          )}
        </div>

        {/* Manual coords input */}
        <div className="flex gap-2">
          <Input
            placeholder="Enter coordinates (e.g., 40.7128, -74.006)"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                applyFromInput();
              }
            }}
            disabled={disabled}
            className="border-emerald-200 focus:border-emerald-500"
          />
          <Button
            type="button"
            variant="outline"
            onClick={applyFromInput}
            disabled={disabled || !parseCoordsText(input)}
            className="h-9"
          >
            Apply
          </Button>
        </div>

        {/* Location details */}
        {location && (
          <div className="p-3 border border-emerald-200 rounded-md bg-emerald-50/50 space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 space-y-1">
                <p className="text-xs font-medium text-muted-foreground">
                  Selected Location
                </p>
                <div className="flex items-center gap-2">
                  <MapPin className="h-3 w-3 text-emerald-600 shrink-0" />
                  <div className="flex-1">
                    <p className="font-mono text-sm font-medium text-emerald-900">
                      {formatCoordinates(location.lat, location.lng)}
                    </p>
                    {location.address && (
                      <p className="text-xs text-muted-foreground">
                        {location.address}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleCopyCoordinates}
                disabled={disabled}
                className="text-xs h-8"
              >
                <Copy className="h-3 w-3 mr-1" />
                Copy
              </Button>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleOpenExternal}
                disabled={disabled}
                className="text-xs h-8"
              >
                <ExternalLink className="h-3 w-3 mr-1" />
                View Map
              </Button>
            </div>
          </div>
        )}

        {/* Helper / Error */}
        {field.helper_text && !error && (
          <p className="text-xs text-muted-foreground">{field.helper_text}</p>
        )}

        {error && (
          <p className="text-xs text-destructive font-medium" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  },
);

PopupLocationPicker.displayName = 'PopupLocationPicker';
export default PopupLocationPicker;
