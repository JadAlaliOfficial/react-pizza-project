// components/filters/DateTimeFilter.tsx
import React, { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { X, CalendarClock } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DateTimeFilterProps {
  fieldId: number;
  fieldLabel: string;
  onFilterChange: (fieldId: number, filterData: DateTimeFilterData | null) => void;
  initialFilter?: DateTimeFilterData;
}

export interface DateTimeFilterData {
  type: 'equals' | 'before' | 'after' | 'between';
  datetime?: string;
  startdatetime?: string;
  enddatetime?: string;
}

const DateTimeFilter: React.FC<DateTimeFilterProps> = ({
  fieldId,
  fieldLabel,
  onFilterChange,
  initialFilter,
}) => {
  const [rangeType, setRangeType] = useState<DateTimeFilterData['type']>(
    initialFilter?.type || 'equals'
  );
  const [singleDateTime, setSingleDateTime] = useState<string>(
    initialFilter?.datetime || ''
  );
  const [startDateTime, setStartDateTime] = useState<string>(
    initialFilter?.startdatetime || ''
  );
  const [endDateTime, setEndDateTime] = useState<string>(
    initialFilter?.enddatetime || ''
  );

  // Build filter data based on current state
  const buildFilterData = (): DateTimeFilterData | null => {
    if (rangeType === 'between') {
      if (!startDateTime || !endDateTime) {
        return null;
      }
      return {
        type: rangeType,
        startdatetime: startDateTime,
        enddatetime: endDateTime,
      };
    } else {
      if (!singleDateTime) {
        return null;
      }
      return {
        type: rangeType,
        datetime: singleDateTime,
      };
    }
  };

  // Update filter when values change
  useEffect(() => {
    const filterData = buildFilterData();
    onFilterChange(fieldId, filterData);
  }, [rangeType, singleDateTime, startDateTime, endDateTime, fieldId]);

  const handleClear = () => {
    setRangeType('equals');
    setSingleDateTime('');
    setStartDateTime('');
    setEndDateTime('');
    onFilterChange(fieldId, null);
  };

  const hasValue = rangeType === 'between' 
    ? (startDateTime !== '' || endDateTime !== '') 
    : singleDateTime !== '';

  // Get current datetime in YYYY-MM-DDTHH:MM format
  const getCurrentDateTime = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  // Format datetime for display
  const formatDateTime = (datetime: string): string => {
    if (!datetime) return '';
    try {
      const date = new Date(datetime);
      return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return datetime;
    }
  };

  return (
    <div className="space-y-3 p-4 border border-gray-200 rounded-lg bg-white">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CalendarClock className="h-4 w-4 text-gray-500" />
          <Label className="text-sm font-medium text-gray-700">
            {fieldLabel}
          </Label>
        </div>
        {hasValue && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleClear}
            className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Range Type Selector */}
      <div className="space-y-1.5">
        <Label htmlFor={`range-type-${fieldId}`} className="text-xs text-gray-600">
          Filter Type
        </Label>
        <Select 
          value={rangeType} 
          onValueChange={(val) => setRangeType(val as DateTimeFilterData['type'])}
        >
          <SelectTrigger id={`range-type-${fieldId}`} className="w-full">
            <SelectValue placeholder="Select filter type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="equals">Equals (=)</SelectItem>
            <SelectItem value="before">Before (&lt;)</SelectItem>
            <SelectItem value="after">After (&gt;)</SelectItem>
            <SelectItem value="between">Between</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* DateTime Input(s) */}
      {rangeType === 'between' ? (
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor={`start-datetime-${fieldId}`} className="text-xs text-gray-600">
              Start Date & Time
            </Label>
            <Input
              id={`start-datetime-${fieldId}`}
              type="datetime-local"
              value={startDateTime}
              onChange={(e) => setStartDateTime(e.target.value)}
              max={endDateTime || undefined}
              className="w-full"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor={`end-datetime-${fieldId}`} className="text-xs text-gray-600">
              End Date & Time
            </Label>
            <Input
              id={`end-datetime-${fieldId}`}
              type="datetime-local"
              value={endDateTime}
              onChange={(e) => setEndDateTime(e.target.value)}
              min={startDateTime || undefined}
              className="w-full"
            />
          </div>
        </div>
      ) : (
        <div className="space-y-1.5">
          <Label htmlFor={`datetime-${fieldId}`} className="text-xs text-gray-600">
            Date & Time
          </Label>
          <Input
            id={`datetime-${fieldId}`}
            type="datetime-local"
            value={singleDateTime}
            onChange={(e) => setSingleDateTime(e.target.value)}
            className="w-full"
          />
        </div>
      )}

      {/* Quick Actions */}
      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => {
            if (rangeType === 'between') {
              setStartDateTime(getCurrentDateTime());
            } else {
              setSingleDateTime(getCurrentDateTime());
            }
          }}
          className="text-xs"
        >
          Now
        </Button>
      </div>

      {/* Field Type Indicator */}
      <div className="flex items-center justify-between pt-2 border-t border-gray-100">
        <p className="text-xs text-gray-400 italic">DateTime Input</p>
        {hasValue && (
          <span className="text-xs px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded">
            {rangeType === 'between' 
              ? `${formatDateTime(startDateTime)} - ${formatDateTime(endDateTime)}` 
              : formatDateTime(singleDateTime)}
          </span>
        )}
      </div>
    </div>
  );
};

export default DateTimeFilter;
