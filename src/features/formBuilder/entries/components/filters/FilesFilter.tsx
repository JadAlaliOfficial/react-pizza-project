// components/filters/FilesFilter.tsx
import React, { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { X, FileUp, Image, Video, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface FilesFilterProps {
  fieldId: number;
  fieldLabel: string;
  fieldTypeName: 'File Upload' | 'Image Upload' | 'Video Upload' | 'Document Upload';
  onFilterChange: (fieldId: number, filterData: FilesFilterData | null) => void;
  initialFilter?: FilesFilterData;
}

export interface FilesFilterData {
  hasfile: boolean;
}

const FilesFilter: React.FC<FilesFilterProps> = ({
  fieldId,
  fieldLabel,
  fieldTypeName,
  onFilterChange,
  initialFilter,
}) => {
  const [hasAttachment, setHasAttachment] = useState<'all' | 'yes' | 'no'>(
    initialFilter?.hasfile === true ? 'yes' : initialFilter?.hasfile === false ? 'no' : 'all'
  );

  // Get icon and color based on field type
  const getFieldTypeConfig = () => {
    switch (fieldTypeName) {
      case 'Image Upload':
        return {
          icon: Image,
          color: 'text-purple-600',
          bgColor: 'bg-purple-50',
          borderColor: 'border-purple-200',
          label: 'Image',
        };
      case 'Video Upload':
        return {
          icon: Video,
          color: 'text-blue-600',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          label: 'Video',
        };
      case 'Document Upload':
        return {
          icon: FileText,
          color: 'text-orange-600',
          bgColor: 'bg-orange-50',
          borderColor: 'border-orange-200',
          label: 'Document',
        };
      case 'File Upload':
      default:
        return {
          icon: FileUp,
          color: 'text-gray-600',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
          label: 'File',
        };
    }
  };

  const config = getFieldTypeConfig();
  const FieldIcon = config.icon;

  // Build filter data based on current state
  const buildFilterData = (): FilesFilterData | null => {
    if (hasAttachment === 'all') {
      return null;
    }

    return {
      hasfile: hasAttachment === 'yes',
    };
  };

  // Update filter when value changes
  useEffect(() => {
    const filterData = buildFilterData();
    onFilterChange(fieldId, filterData);
  }, [hasAttachment, fieldId]);

  const handleClear = () => {
    setHasAttachment('all');
    onFilterChange(fieldId, null);
  };

  const hasValue = hasAttachment !== 'all';

  // Get description text based on selection
  const getDescriptionText = (): string => {
    switch (hasAttachment) {
      case 'yes':
        return `Show entries with ${config.label.toLowerCase()} attachments`;
      case 'no':
        return `Show entries without ${config.label.toLowerCase()} attachments`;
      default:
        return 'Show all entries';
    }
  };

  return (
    <div className={cn(
      "space-y-3 p-4 rounded-lg border",
      hasValue ? config.borderColor : "border-gray-200",
      "bg-white transition-all duration-200"
    )}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={cn(
            "p-1.5 rounded",
            hasValue ? config.bgColor : "bg-gray-100"
          )}>
            <FieldIcon className={cn(
              "h-4 w-4",
              hasValue ? config.color : "text-gray-500"
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

      {/* Attachment Filter Selector */}
      <div className="space-y-1.5">
        <Label htmlFor={`attachment-${fieldId}`} className="text-xs text-gray-600">
          Attachment Status
        </Label>
        <Select 
          value={hasAttachment} 
          onValueChange={(val) => setHasAttachment(val as 'all' | 'yes' | 'no')}
        >
          <SelectTrigger id={`attachment-${fieldId}`} className="w-full">
            <SelectValue placeholder="Select filter" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Entries</SelectItem>
            <SelectItem value="yes">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-green-500" />
                Has Attachment
              </div>
            </SelectItem>
            <SelectItem value="no">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-red-500" />
                No Attachment
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
            config.bgColor,
            config.color
          )}>
            {hasAttachment === 'yes' ? 'With Files' : 'Without Files'}
          </span>
        )}
      </div>
    </div>
  );
};

export default FilesFilter;
