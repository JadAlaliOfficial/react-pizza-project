// components/filters/BooleanFilter.tsx
import React, { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { X, CheckSquare, ToggleRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface BooleanFilterProps {
  fieldId: number;
  fieldLabel: string;
  fieldTypeName: 'Checkbox' | 'Toggle Switch';
  onFilterChange: (fieldId: number, filterData: BooleanFilterData | null) => void;
  initialFilter?: BooleanFilterData;
}

export interface BooleanFilterData {
  checked?: boolean;
  state?: string;
}

const BooleanFilter: React.FC<BooleanFilterProps> = ({
  fieldId,
  fieldLabel,
  fieldTypeName,
  onFilterChange,
  initialFilter,
}) => {
  const [filterValue, setFilterValue] = useState<'all' | 'true' | 'false'>(() => {
    if (!initialFilter) return 'all';
    
    if (fieldTypeName === 'Checkbox') {
      return initialFilter.checked === true ? 'true' : initialFilter.checked === false ? 'false' : 'all';
    } else {
      return initialFilter.state === 'on' ? 'true' : initialFilter.state === 'off' ? 'false' : 'all';
    }
  });

  const isCheckbox = fieldTypeName === 'Checkbox';
  const FieldIcon = isCheckbox ? CheckSquare : ToggleRight;

  // Build filter data based on current state
  const buildFilterData = (): BooleanFilterData | null => {
    if (filterValue === 'all') {
      return null;
    }

    if (isCheckbox) {
      return {
        checked: filterValue === 'true',
      };
    } else {
      return {
        state: filterValue === 'true' ? 'on' : 'off',
      };
    }
  };

  // Update filter when value changes
  useEffect(() => {
    const filterData = buildFilterData();
    onFilterChange(fieldId, filterData);
  }, [filterValue, fieldId]);

  const handleClear = () => {
    setFilterValue('all');
    onFilterChange(fieldId, null);
  };

  const hasValue = filterValue !== 'all';

  // Get description text based on selection
  const getDescriptionText = (): string => {
    if (filterValue === 'all') return 'Show all entries';
    
    const action = filterValue === 'true' ? 'checked' : 'unchecked';
    return isCheckbox 
      ? `Show ${action} entries` 
      : `Show entries where toggle is ${filterValue === 'true' ? 'ON' : 'OFF'}`;
  };

  return (
    <div className={cn(
      "space-y-3 p-4 rounded-lg border bg-white transition-all duration-200",
      hasValue ? "border-indigo-200" : "border-gray-200"
    )}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={cn(
            "p-1.5 rounded",
            hasValue ? "bg-indigo-50" : "bg-gray-100"
          )}>
            <FieldIcon className={cn(
              "h-4 w-4",
              hasValue ? "text-indigo-600" : "text-gray-500"
            )} />
          </div>
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

      {/* Boolean Filter Selector */}
      <div className="space-y-1.5">
        <Label htmlFor={`boolean-${fieldId}`} className="text-xs text-gray-600">
          Filter Value
        </Label>
        <Select 
          value={filterValue} 
          onValueChange={(val) => setFilterValue(val as 'all' | 'true' | 'false')}
        >
          <SelectTrigger id={`boolean-${fieldId}`} className="w-full">
            <SelectValue placeholder="Select filter" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Entries</SelectItem>
            <SelectItem value="true">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-green-500" />
                {isCheckbox ? 'Checked' : 'ON'}
              </div>
            </SelectItem>
            <SelectItem value="false">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-gray-400" />
                {isCheckbox ? 'Unchecked' : 'OFF'}
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
        <p className="text-xs text-gray-500 italic">
          {getDescriptionText()}
        </p>
      </div>

      {/* Field Type Badge */}
      <div className="flex items-center justify-between pt-2 border-t border-gray-100">
        <p className="text-xs text-gray-400 italic">{fieldTypeName}</p>
        {hasValue && (
          <span className={cn(
            "text-xs px-2 py-0.5 rounded font-medium",
            filterValue === 'true' ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-700"
          )}>
            {filterValue === 'true' 
              ? (isCheckbox ? '✓ Checked' : 'ON') 
              : (isCheckbox ? '✗ Unchecked' : 'OFF')}
          </span>
        )}
      </div>
    </div>
  );
};

export default BooleanFilter;
