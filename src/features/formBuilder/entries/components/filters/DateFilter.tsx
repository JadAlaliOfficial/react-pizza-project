// components/filters/DateFilter.tsx
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
import { X, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DateFilterProps {
  fieldId: number;
  fieldLabel: string;
  onFilterChange: (fieldId: number, filterData: DateFilterData | null) => void;
  initialFilter?: DateFilterData;
}

export interface DateFilterData {
  type: 'equals' | 'before' | 'after' | 'beforeorequal' | 'afterorequal' | 'between';
  date?: string;
  startdate?: string;
  enddate?: string;
}

const DateFilter: React.FC<DateFilterProps> = ({
  fieldId,
  fieldLabel,
  onFilterChange,
  initialFilter,
}) => {
  const [rangeType, setRangeType] = useState<DateFilterData['type']>(
    initialFilter?.type || 'equals'
  );
  const [singleDate, setSingleDate] = useState<string>(
    initialFilter?.date || ''
  );
  const [startDate, setStartDate] = useState<string>(
    initialFilter?.startdate || ''
  );
  const [endDate, setEndDate] = useState<string>(
    initialFilter?.enddate || ''
  );

  // Build filter data based on current state
  const buildFilterData = (): DateFilterData | null => {
    if (rangeType === 'between') {
      if (!startDate || !endDate) {
        return null;
      }
      return {
        type: rangeType,
        startdate: startDate,
        enddate: endDate,
      };
    } else {
      if (!singleDate) {
        return null;
      }
      return {
        type: rangeType,
        date: singleDate,
      };
    }
  };

  // Update filter when values change
  useEffect(() => {
    const filterData = buildFilterData();
    onFilterChange(fieldId, filterData);
  }, [rangeType, singleDate, startDate, endDate, fieldId]);

  const handleClear = () => {
    setRangeType('equals');
    setSingleDate('');
    setStartDate('');
    setEndDate('');
    onFilterChange(fieldId, null);
  };

  const hasValue = rangeType === 'between' 
    ? (startDate !== '' || endDate !== '') 
    : singleDate !== '';

  // Get today's date in YYYY-MM-DD format
  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  return (
    <div className="space-y-3 p-4 border border-gray-200 rounded-lg bg-white">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-gray-500" />
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
          onValueChange={(val) => setRangeType(val as DateFilterData['type'])}
        >
          <SelectTrigger id={`range-type-${fieldId}`} className="w-full">
            <SelectValue placeholder="Select filter type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="equals">Equals (=)</SelectItem>
            <SelectItem value="before">Before (&lt;)</SelectItem>
            <SelectItem value="after">After (&gt;)</SelectItem>
            <SelectItem value="beforeorequal">Before or Equal (≤)</SelectItem>
            <SelectItem value="afterorequal">After or Equal (≥)</SelectItem>
            <SelectItem value="between">Between</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Date Input(s) */}
      {rangeType === 'between' ? (
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor={`start-date-${fieldId}`} className="text-xs text-gray-600">
              Start Date
            </Label>
            <Input
              id={`start-date-${fieldId}`}
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              max={endDate || undefined}
              className="w-full"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor={`end-date-${fieldId}`} className="text-xs text-gray-600">
              End Date
            </Label>
            <Input
              id={`end-date-${fieldId}`}
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              min={startDate || undefined}
              className="w-full"
            />
          </div>
        </div>
      ) : (
        <div className="space-y-1.5">
          <Label htmlFor={`date-${fieldId}`} className="text-xs text-gray-600">
            Date
          </Label>
          <Input
            id={`date-${fieldId}`}
            type="date"
            value={singleDate}
            onChange={(e) => setSingleDate(e.target.value)}
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
              setStartDate(getTodayDate());
            } else {
              setSingleDate(getTodayDate());
            }
          }}
          className="text-xs"
        >
          Today
        </Button>
      </div>

      {/* Field Type Indicator */}
      <div className="flex items-center justify-between pt-2 border-t border-gray-100">
        <p className="text-xs text-gray-400 italic">Date Input</p>
        {hasValue && (
          <span className="text-xs px-2 py-0.5 bg-blue-50 text-blue-700 rounded">
            {rangeType === 'between' ? `${startDate} - ${endDate}` : singleDate}
          </span>
        )}
      </div>
    </div>
  );
};

export default DateFilter;
