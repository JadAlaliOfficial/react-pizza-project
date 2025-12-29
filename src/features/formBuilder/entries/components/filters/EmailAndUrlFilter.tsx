// components/filters/EmailAndUrlFilter.tsx
import React, { useEffect, useState } from 'react';
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

export interface EmailUrlFilterData {
  // Match your backend examples
  type: 'contains' | 'equals' | 'notcontains' | 'startswith' | 'endswith';
  value: string;
}

type UiSearchType = EmailUrlFilterData['type'] | 'domain';

interface EmailAndUrlFilterProps {
  fieldId: number;
  fieldLabel: string;
  fieldTypeName: 'Email Input' | 'URL Input';
  onFilterChange: (
    fieldId: number,
    filterData: EmailUrlFilterData | null,
  ) => void;
  initialFilter?: EmailUrlFilterData;
}

const DEFAULT_TYPE: UiSearchType = 'contains';

const EmailAndUrlFilter: React.FC<EmailAndUrlFilterProps> = ({
  fieldId,
  fieldLabel,
  fieldTypeName,
  onFilterChange,
  initialFilter,
}) => {
  const isEmailField = fieldTypeName === 'Email Input';
  const FieldIcon = isEmailField ? Mail : Link2;

  const [searchType, setSearchType] = useState<UiSearchType>(DEFAULT_TYPE);
  const [searchValue, setSearchValue] = useState<string>('');

  // Sync UI state when parent resets/discards/loads saved filters
  useEffect(() => {
    const nextType: UiSearchType = (() => {
      if (!initialFilter) return DEFAULT_TYPE;

      // If email endswith "@domain.com", show it as "domain" in UI
      if (
        isEmailField &&
        initialFilter.type === 'endswith' &&
        typeof initialFilter.value === 'string' &&
        initialFilter.value.startsWith('@') &&
        initialFilter.value.length > 1
      ) {
        return 'domain';
      }

      return initialFilter.type;
    })();

    const nextValue = (() => {
      if (!initialFilter) return '';
      if (
        isEmailField &&
        initialFilter.type === 'endswith' &&
        initialFilter.value?.startsWith('@')
      ) {
        return initialFilter.value.slice(1); // store domain only in UI
      }
      return initialFilter.value ?? '';
    })();

    setSearchType(nextType);
    setSearchValue(nextValue);
  }, [initialFilter?.type, initialFilter?.value, isEmailField]);

  const normalizeDomainInput = (raw: string): string => {
    let v = raw.trim();

    // If user pastes full email, keep only domain
    if (isEmailField) {
      if (v.includes('@')) v = v.split('@').pop() || '';
      v = v.replace(/^@/, '');
      return v.trim();
    }

    // URL domain: remove protocol/www/path/query/hash
    v = v.replace(/^https?:\/\//, '');
    v = v.replace(/^www\./, '');
    v = v.split('/')[0];
    v = v.split('?')[0];
    v = v.split('#')[0];
    return v.trim();
  };

  const emit = (nextType: UiSearchType, nextValueRaw: string) => {
    const trimmed = nextValueRaw.trim();
    if (!trimmed) {
      onFilterChange(fieldId, null);
      return;
    }

    // UI-only "domain" maps to backend match types
    if (nextType === 'domain') {
      const domain = normalizeDomainInput(trimmed);
      if (!domain) {
        onFilterChange(fieldId, null);
        return;
      }

      // Email domain -> endswith "@domain.com" (matches your example)
      if (isEmailField) {
        onFilterChange(fieldId, { type: 'endswith', value: `@${domain}` });
        return;
      }

      // URL domain -> contains "domain.com" (works with typical URLs having paths)
      onFilterChange(fieldId, { type: 'contains', value: domain });
      return;
    }

    // For email endswith, if user types just "company.com", auto-prefix "@"
    if (isEmailField && nextType === 'endswith') {
      const v =
        trimmed.startsWith('@') || trimmed.includes('@')
          ? trimmed
          : `@${trimmed}`;
      onFilterChange(fieldId, { type: 'endswith', value: v });
      return;
    }

    onFilterChange(fieldId, { type: nextType, value: trimmed });
  };

  const handleClear = () => {
    setSearchType(DEFAULT_TYPE);
    setSearchValue('');
    onFilterChange(fieldId, null);
  };

  const hasValue = searchValue.trim() !== '';

  const getPlaceholder = (): string => {
    if (searchType === 'domain') {
      return 'example.com';
    }

    if (isEmailField) {
      return searchType === 'equals' ? 'user@example.com' : 'Search email...';
    }

    return searchType === 'equals' ? 'https://example.com' : 'Search URL...';
  };

  const getHelperText = (): string => {
    switch (searchType) {
      case 'contains':
        return isEmailField
          ? 'Find emails containing this text'
          : 'Find URLs containing this text';
      case 'equals':
        return isEmailField ? 'Find exact email match' : 'Find exact URL match';
      case 'notcontains':
        return isEmailField
          ? 'Exclude emails containing this text'
          : 'Exclude URLs containing this text';
      case 'startswith':
        return isEmailField
          ? 'Emails starting with this text'
          : 'URLs starting with this text';
      case 'endswith':
        return isEmailField
          ? 'Emails ending with this text'
          : 'URLs ending with this text';
      case 'domain':
        return isEmailField
          ? 'Filter by email domain (e.g., gmail.com)'
          : 'Filter by URL domain (e.g., google.com)';
      default:
        return '';
    }
  };

  const handleValueChange = (raw: string) => {
    // Keep UI nicer when domain mode is active
    const formatted = searchType === 'domain' ? normalizeDomainInput(raw) : raw;
    setSearchValue(formatted);
    emit(searchType, formatted);
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

      <div className="space-y-1.5">
        <Label
          htmlFor={`search-type-${fieldId}`}
          className="text-xs text-gray-600"
        >
          Search Type
        </Label>

        <Select
          value={searchType}
          onValueChange={(val) => {
            const next = val as UiSearchType;
            setSearchType(next);

            // If switching to domain, try to extract domain from current value for better UX
            if (next === 'domain') {
              const domain = normalizeDomainInput(searchValue);
              setSearchValue(domain);
              emit(next, domain);
              return;
            }

            emit(next, searchValue);
          }}
        >
          <SelectTrigger id={`search-type-${fieldId}`} className="w-full">
            <SelectValue placeholder="Select search type" />
          </SelectTrigger>

          <SelectContent>
            <SelectItem value="contains">Contains</SelectItem>
            <SelectItem value="exact">Exact</SelectItem>
            <SelectItem value="notcontains">Not Contains</SelectItem>
            <SelectItem value="startswith">Starts With</SelectItem> 
            <SelectItem value="domain">Domain</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label
          htmlFor={`search-value-${fieldId}`}
          className="text-xs text-gray-600"
        >
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

        <p className="text-xs text-gray-500 italic">{getHelperText()}</p>
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-gray-100">
        <p className="text-xs text-gray-400 italic">{fieldTypeName}</p>

        {searchType === 'domain' && hasValue && (
          <span className="text-xs px-2 py-0.5 bg-blue-50 text-blue-700 rounded">
            {isEmailField ? `@${searchValue}` : searchValue}
          </span>
        )}
      </div>
    </div>
  );
};

export default EmailAndUrlFilter;
