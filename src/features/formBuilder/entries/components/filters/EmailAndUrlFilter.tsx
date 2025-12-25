// components/filters/EmailAndUrlFilter.tsx
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
import { X, Mail, Link2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmailAndUrlFilterProps {
  fieldId: number;
  fieldLabel: string;
  fieldTypeName: 'Email Input' | 'URL Input';
  onFilterChange: (fieldId: number, filterData: EmailUrlFilterData | null) => void;
  initialFilter?: EmailUrlFilterData;
}

export interface EmailUrlFilterData {
  type: 'contains' | 'equals' | 'domain';
  value: string;
}

const EmailAndUrlFilter: React.FC<EmailAndUrlFilterProps> = ({
  fieldId,
  fieldLabel,
  fieldTypeName,
  onFilterChange,
  initialFilter,
}) => {
  const [searchType, setSearchType] = useState<EmailUrlFilterData['type']>(
    initialFilter?.type || 'contains'
  );
  const [searchValue, setSearchValue] = useState<string>(
    initialFilter?.value || ''
  );

  const isEmailField = fieldTypeName === 'Email Input';

  // Get icon based on field type
  const FieldIcon = isEmailField ? Mail : Link2;

  // Get placeholder text based on field type and search type
  const getPlaceholder = (): string => {
    if (searchType === 'domain') {
      return isEmailField ? 'example.com' : 'example.com';
    }
    
    if (isEmailField) {
      return searchType === 'equals' 
        ? 'user@example.com' 
        : 'Search email...';
    }
    
    return searchType === 'equals' 
      ? 'https://example.com' 
      : 'Search URL...';
  };

  // Get helper text based on search type
  const getHelperText = (): string => {
    switch (searchType) {
      case 'contains':
        return isEmailField 
          ? 'Find emails containing this text'
          : 'Find URLs containing this text';
      case 'equals':
        return isEmailField
          ? 'Find exact email match'
          : 'Find exact URL match';
      case 'domain':
        return isEmailField
          ? 'Filter by email domain (e.g., gmail.com)'
          : 'Filter by URL domain (e.g., google.com)';
      default:
        return '';
    }
  };

  // Build filter data based on current state
  const buildFilterData = (): EmailUrlFilterData | null => {
    const trimmedValue = searchValue.trim();
    
    if (!trimmedValue) {
      return null;
    }

    return {
      type: searchType,
      value: trimmedValue,
    };
  };

  // Update filter when values change
  useEffect(() => {
    const filterData = buildFilterData();
    onFilterChange(fieldId, filterData);
  }, [searchType, searchValue, fieldId]);

  const handleClear = () => {
    setSearchType('contains');
    setSearchValue('');
    onFilterChange(fieldId, null);
  };

  const hasValue = searchValue.trim() !== '';

  // Format input value based on search type
  const handleValueChange = (newValue: string) => {
    let formatted = newValue;

    // For domain search, remove protocol and path
    if (searchType === 'domain') {
      formatted = newValue
        .replace(/^https?:\/\//, '') // Remove protocol
        .replace(/^www\./, '') // Remove www
        .replace(/\/.*$/, ''); // Remove path
    }

    setSearchValue(formatted);
  };

  return (
    <div className="space-y-3 p-4 border border-gray-200 rounded-lg bg-white">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FieldIcon className="h-4 w-4 text-gray-500" />
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

      {/* Search Type Selector */}
      <div className="space-y-1.5">
        <Label htmlFor={`search-type-${fieldId}`} className="text-xs text-gray-600">
          Search Type
        </Label>
        <Select 
          value={searchType} 
          onValueChange={(val) => {
            setSearchType(val as EmailUrlFilterData['type']);
            // Clear value when switching to domain type for better UX
            if (val === 'domain' && searchValue.includes('@')) {
              setSearchValue('');
            }
          }}
        >
          <SelectTrigger id={`search-type-${fieldId}`} className="w-full">
            <SelectValue placeholder="Select search type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="contains">Contains</SelectItem>
            <SelectItem value="equals">Equals</SelectItem>
            <SelectItem value="domain">Domain Filter</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Search Value Input */}
      <div className="space-y-1.5">
        <Label htmlFor={`search-value-${fieldId}`} className="text-xs text-gray-600">
          Search Value
        </Label>
        <Input
          id={`search-value-${fieldId}`}
          type="text"
          value={searchValue}
          onChange={(e) => handleValueChange(e.target.value)}
          placeholder={getPlaceholder()}
          className="w-full"
        />
        <p className="text-xs text-gray-500 italic">
          {getHelperText()}
        </p>
      </div>

      {/* Field Type Indicator */}
      <div className="flex items-center justify-between pt-2 border-t border-gray-100">
        <p className="text-xs text-gray-400 italic">{fieldTypeName}</p>
        {searchType === 'domain' && searchValue && (
          <span className="text-xs px-2 py-0.5 bg-blue-50 text-blue-700 rounded">
            @{searchValue}
          </span>
        )}
      </div>
    </div>
  );
};

export default EmailAndUrlFilter;
