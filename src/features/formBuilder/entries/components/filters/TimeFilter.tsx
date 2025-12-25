// components/filters/TimeFilter.tsx
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
import { X, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TimeFilterProps {
  fieldId: number;
  fieldLabel: string;
  onFilterChange: (fieldId: number, filterData: TimeFilterData | null) => void;
  initialFilter?: TimeFilterData;
}

export interface TimeFilterData {
  type: 'equals' | 'before' | 'after' | 'between';
  time?: string;
  starttime?: string;
  endtime?: string;
}

const TimeFilter: React.FC<TimeFilterProps> = ({
  fieldId,
  fieldLabel,
  onFilterChange,
  initialFilter,
}) => {
  const [rangeType, setRangeType] = useState<TimeFilterData['type']>(
    initialFilter?.type || 'equals'
  );
  const [singleTime, setSingleTime] = useState<string>(
    initialFilter?.time || ''
  );
  const [startTime, setStartTime] = useState<string>(
    initialFilter?.starttime || ''
  );
  const [endTime, setEndTime] = useState<string>(
    initialFilter?.endtime || ''
  );

  // Build filter data based on current state
  const buildFilterData = (): TimeFilterData | null => {
    if (rangeType === 'between') {
      if (!startTime || !endTime) {
        return null;
      }
      return {
        type: rangeType,
        starttime: startTime,
        endtime: endTime,
      };
    } else {
      if (!singleTime) {
        return null;
      }
      return {
        type: rangeType,
        time: singleTime,
      };
    }
  };

  // Update filter when values change
  useEffect(() => {
    const filterData = buildFilterData();
    onFilterChange(fieldId, filterData);
  }, [rangeType, singleTime, startTime, endTime, fieldId]);

  const handleClear = () => {
    setRangeType('equals');
    setSingleTime('');
    setStartTime('');
    setEndTime('');
    onFilterChange(fieldId, null);
  };

  const hasValue = rangeType === 'between' 
    ? (startTime !== '' || endTime !== '') 
    : singleTime !== '';

  // Get current time in HH:MM format
  const getCurrentTime = () => {
    const now = new Date();
    return now.toTimeString().slice(0, 5);
  };

  return (
    <div className="space-y-3 p-4 border border-gray-200 rounded-lg bg-white">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-gray-500" />
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
          onValueChange={(val) => setRangeType(val as TimeFilterData['type'])}
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

      {/* Time Input(s) */}
      {rangeType === 'between' ? (
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor={`start-time-${fieldId}`} className="text-xs text-gray-600">
              Start Time
            </Label>
            <Input
              id={`start-time-${fieldId}`}
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              max={endTime || undefined}
              className="w-full"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor={`end-time-${fieldId}`} className="text-xs text-gray-600">
              End Time
            </Label>
            <Input
              id={`end-time-${fieldId}`}
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              min={startTime || undefined}
              className="w-full"
            />
          </div>
        </div>
      ) : (
        <div className="space-y-1.5">
          <Label htmlFor={`time-${fieldId}`} className="text-xs text-gray-600">
            Time
          </Label>
          <Input
            id={`time-${fieldId}`}
            type="time"
            value={singleTime}
            onChange={(e) => setSingleTime(e.target.value)}
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
              setStartTime(getCurrentTime());
            } else {
              setSingleTime(getCurrentTime());
            }
          }}
          className="text-xs"
        >
          Now
        </Button>
      </div>

      {/* Field Type Indicator */}
      <div className="flex items-center justify-between pt-2 border-t border-gray-100">
        <p className="text-xs text-gray-400 italic">Time Input</p>
        {hasValue && (
          <span className="text-xs px-2 py-0.5 bg-purple-50 text-purple-700 rounded font-mono">
            {rangeType === 'between' ? `${startTime} - ${endTime}` : singleTime}
          </span>
        )}
      </div>
    </div>
  );
};

export default TimeFilter;
