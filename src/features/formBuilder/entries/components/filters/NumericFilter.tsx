// components/filters/NumericFilter.tsx
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
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface NumericFilterProps {
  fieldId: number;
  fieldLabel: string;
  fieldTypeName: string; // 'Number Input' | 'Rating' | 'Slider' | 'Currency Input' | 'Percentage Input'
  onFilterChange: (fieldId: number, filterData: NumericFilterData | null) => void;
  initialFilter?: NumericFilterData;
}

export interface NumericFilterData {
  type: 'equals' | 'greaterthan' | 'lessthan' | 'greaterorequal' | 'lessorequal' | 'between';
  value?: number;
  min?: number;
  max?: number;
}

const NumericFilter: React.FC<NumericFilterProps> = ({
  fieldId,
  fieldLabel,
  fieldTypeName,
  onFilterChange,
  initialFilter,
}) => {
  const [operation, setOperation] = useState<NumericFilterData['type']>(
    initialFilter?.type || 'equals'
  );
  const [value, setValue] = useState<string>(
    initialFilter?.value?.toString() || ''
  );
  const [minValue, setMinValue] = useState<string>(
    initialFilter?.min?.toString() || ''
  );
  const [maxValue, setMaxValue] = useState<string>(
    initialFilter?.max?.toString() || ''
  );

  // Determine input properties based on field type
  const getInputProps = () => {
    switch (fieldTypeName) {
      case 'Currency Input':
        return {
          prefix: '$',
          placeholder: '0.00',
          step: '0.01',
          min: '0',
        };
      case 'Percentage Input':
        return {
          suffix: '%',
          placeholder: '0',
          step: '1',
          min: '0',
          max: '100',
        };
      case 'Rating':
        return {
          placeholder: '0',
          step: '1',
          min: '0',
          max: '5',
        };
      case 'Slider':
      case 'Number Input':
      default:
        return {
          placeholder: '0',
          step: 'any',
        };
    }
  };

  const inputProps = getInputProps();

  // Build filter data based on current state
  const buildFilterData = (): NumericFilterData | null => {
    if (operation === 'between') {
      const min = parseFloat(minValue);
      const max = parseFloat(maxValue);
      
      if (isNaN(min) || isNaN(max)) {
        return null;
      }

      return {
        type: operation,
        min,
        max,
      };
    } else {
      const numValue = parseFloat(value);
      
      if (isNaN(numValue)) {
        return null;
      }

      return {
        type: operation,
        value: numValue,
      };
    }
  };

  // Update filter when values change
  useEffect(() => {
    const filterData = buildFilterData();
    onFilterChange(fieldId, filterData);
  }, [operation, value, minValue, maxValue, fieldId]);

  const handleClear = () => {
    setOperation('equals');
    setValue('');
    setMinValue('');
    setMaxValue('');
    onFilterChange(fieldId, null);
  };

  const hasValue = operation === 'between' 
    ? (minValue !== '' || maxValue !== '') 
    : value !== '';

  return (
    <div className="space-y-3 p-4 border border-gray-200 rounded-lg bg-white">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium text-gray-700">
          {fieldLabel}
        </Label>
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

      {/* Operation Selector */}
      <div className="space-y-1.5">
        <Label htmlFor={`operation-${fieldId}`} className="text-xs text-gray-600">
          Operation
        </Label>
        <Select value={operation} onValueChange={(val) => setOperation(val as NumericFilterData['type'])}>
          <SelectTrigger id={`operation-${fieldId}`} className="w-full">
            <SelectValue placeholder="Select operation" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="equals">Equals (=)</SelectItem>
            <SelectItem value="greaterthan">Greater Than (&gt;)</SelectItem>
            <SelectItem value="lessthan">Less Than (&lt;)</SelectItem>
            <SelectItem value="greaterorequal">Greater or Equal (≥)</SelectItem>
            <SelectItem value="lessorequal">Less or Equal (≤)</SelectItem>
            <SelectItem value="between">Between</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Value Input(s) */}
      {operation === 'between' ? (
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor={`min-${fieldId}`} className="text-xs text-gray-600">
              Min
            </Label>
            <div className="relative">
              {inputProps.prefix && (
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
                  {inputProps.prefix}
                </span>
              )}
              <Input
                id={`min-${fieldId}`}
                type="number"
                value={minValue}
                onChange={(e) => setMinValue(e.target.value)}
                placeholder={inputProps.placeholder}
                step={inputProps.step}
                min={inputProps.min}
                max={inputProps.max}
                className={inputProps.prefix ? 'pl-7' : ''}
              />
              {inputProps.suffix && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
                  {inputProps.suffix}
                </span>
              )}
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor={`max-${fieldId}`} className="text-xs text-gray-600">
              Max
            </Label>
            <div className="relative">
              {inputProps.prefix && (
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
                  {inputProps.prefix}
                </span>
              )}
              <Input
                id={`max-${fieldId}`}
                type="number"
                value={maxValue}
                onChange={(e) => setMaxValue(e.target.value)}
                placeholder={inputProps.placeholder}
                step={inputProps.step}
                min={inputProps.min}
                max={inputProps.max}
                className={inputProps.prefix ? 'pl-7' : ''}
              />
              {inputProps.suffix && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
                  {inputProps.suffix}
                </span>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-1.5">
          <Label htmlFor={`value-${fieldId}`} className="text-xs text-gray-600">
            Value
          </Label>
          <div className="relative">
            {inputProps.prefix && (
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
                {inputProps.prefix}
              </span>
            )}
            <Input
              id={`value-${fieldId}`}
              type="number"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={inputProps.placeholder}
              step={inputProps.step}
              min={inputProps.min}
              max={inputProps.max}
              className={inputProps.prefix ? 'pl-7' : ''}
            />
            {inputProps.suffix && (
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
                {inputProps.suffix}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Field type indicator */}
      <p className="text-xs text-gray-400 italic">{fieldTypeName}</p>
    </div>
  );
};

export default NumericFilter;
