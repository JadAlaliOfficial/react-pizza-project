import React, { useMemo, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { RefreshCw, ListFilter, TestTube } from 'lucide-react';
import { ManageLayout } from '@/components/layouts/ManageLayout';
import { useFieldTypeFilters } from '@/features/formBuilder/fieldTypeFilters/hooks/useFieldTypeFilters';
import type { FieldTypeFilter } from '@/features/formBuilder/fieldTypeFilters/types';

// Import all filter components
// import NumericFilter, { type NumericFilterData } from '@/features/formBuilder/entries/components/filters/NumericFilter';
// import EmailAndUrlFilter, { type EmailUrlFilterData } from '@/features/formBuilder/entries/components/filters/EmailAndUrlFilter';
// import FilesFilter, { type FilesFilterData } from '@/features/formBuilder/entries/components/filters/FilesFilter'; 
// import BooleanFilter, { type BooleanFilterData } from '@/features/formBuilder/entries/components/filters/BooleanFilter';
// import PhoneFilter, { type PhoneFilterData } from '@/features/formBuilder/entries/components/filters/PhoneFilter';
// import AddressFilter, { type AddressFilterData } from '@/features/formBuilder/entries/components/filters/AddressFilter';
// import DateFilter, { type DateFilterData } from '@/features/formBuilder/entries/components/filters/DateFilter';
// import TimeFilter, { type TimeFilterData } from '@/features/formBuilder/entries/components/filters/TimeFilter';
// import DateTimeFilter, { type DateTimeFilterData } from '@/features/formBuilder/entries/components/filters/DateTimeFilter';
import TextFilter, { type TextFilterData } from '@/features/formBuilder/entries/components/filters/TextFilter';
import RadioDropdownFilter, { type RadioDropdownFilterData } from '@/features/formBuilder/entries/components/filters/RadioDropdownFilter';
import MultiSelectFilter, { type MultiSelectFilterData } from '@/features/formBuilder/entries/components/filters/MultiSelectFilter';

const FieldTypeFiltersPage: React.FC = () => {
  const { items, loading, error, refetch } = useFieldTypeFilters();
  const [showFilterDemo, setShowFilterDemo] = useState(false);
  
  // State for each filter type
  const [textFilterValues, setTextFilterValues] = useState<Record<number, TextFilterData | null>>({});
  const [radioDropdownFilterValues, setRadioDropdownFilterValues] = useState<Record<number, RadioDropdownFilterData | null>>({});
  const [multiSelectFilterValues, setMultiSelectFilterValues] = useState<Record<number, MultiSelectFilterData | null>>({});

  const isLoading = loading;
  const count = useMemo(() => items.length, [items]);

  const handleRefresh = async () => {
    await refetch();
  };

  // Handler functions
  const handleTextFilterChange = (fieldId: number, filterData: TextFilterData | null) => {
    setTextFilterValues(prev => ({ ...prev, [fieldId]: filterData }));
    console.log(`Text Filter changed for field ${fieldId}:`, filterData);
  };

  const handleRadioDropdownFilterChange = (fieldId: number, filterData: RadioDropdownFilterData | null) => {
    setRadioDropdownFilterValues(prev => ({ ...prev, [fieldId]: filterData }));
    console.log(`Radio/Dropdown Filter changed for field ${fieldId}:`, filterData);
  };

  const handleMultiSelectFilterChange = (fieldId: number, filterData: MultiSelectFilterData | null) => {
    setMultiSelectFilterValues(prev => ({ ...prev, [fieldId]: filterData }));
    console.log(`Multi-Select Filter changed for field ${fieldId}:`, filterData);
  };

  // Mock field data with options
  const mockTextFields = [
    { id: 801, label: 'Full Name', fieldTypeName: 'Text Input' },
    { id: 802, label: 'Company Name', fieldTypeName: 'Text Input' },
  ];

  const mockRadioDropdownFields = [
    { 
      id: 901, 
      label: 'Preferred Contact Method', 
      fieldTypeName: 'Radio Button' as const,
      options: ['Email', 'Phone', 'SMS', 'WhatsApp']
    },
    { 
      id: 902, 
      label: 'Country', 
      fieldTypeName: 'Dropdown Select' as const,
      options: ['USA', 'Canada', 'UK', 'Australia', 'Germany', 'France']
    },
  ];

  const mockMultiSelectFields = [
    { 
      id: 1001, 
      label: 'Skills', 
      fieldTypeName: 'Multi-Select',
      options: ['JavaScript', 'TypeScript', 'React', 'Node.js', 'Python', 'Java', 'Go']
    },
    { 
      id: 1002, 
      label: 'Interests', 
      fieldTypeName: 'Multi-Select',
      options: ['Technology', 'Sports', 'Music', 'Travel', 'Cooking', 'Reading', 'Gaming']
    },
  ];

  // Combine all filter values for display
  const allFilterValues = {
    text: textFilterValues,
    radioDropdown: radioDropdownFilterValues,
    multiSelect: multiSelectFilterValues,
  };

  return (
    <ManageLayout
      title="Field Type Filters"
      subtitle="View configured filters for each form field type"
      mainButtons={
        <div className="flex gap-2">
          <Button 
            onClick={() => setShowFilterDemo(!showFilterDemo)} 
            variant={showFilterDemo ? "default" : "outline"}
            className="gap-2"
          >
            <TestTube className="h-4 w-4" />
            {showFilterDemo ? 'Hide Demo' : 'Show Demo'}
          </Button>
          <Button onClick={handleRefresh} variant="outline" disabled={isLoading} className="gap-2">
            <RefreshCw className={isLoading ? 'h-4 w-4 animate-spin' : 'h-4 w-4'} />
            Refresh
          </Button>
        </div>
      }
      backButton={{ show: false }}
    >
      {/* Filter Demo Section */}
      {showFilterDemo && (
        <div className="space-y-6 mb-6">
          {/* Text & Choice-based Filters */}
          <Card className="bg-card border-border">
            <CardHeader>
              <div className="flex items-center gap-2">
                <TestTube className="h-5 w-5 text-amber-600" />
                <CardTitle className="text-lg sm:text-xl">Text & Choice Filter Components</CardTitle>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Interactive demo for Text, Radio/Dropdown, and Multi-Select filters with various search operations.
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Text Filters Column */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-gray-700 border-b pb-2">Text Filters</h3>
                  {mockTextFields.map((field) => (
                    <TextFilter
                      key={field.id}
                      fieldId={field.id}
                      fieldLabel={field.label}
                      onFilterChange={handleTextFilterChange}
                      initialFilter={textFilterValues[field.id] || undefined}
                    />
                  ))}
                </div>

                {/* Radio/Dropdown Filters Column */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-gray-700 border-b pb-2">Radio & Dropdown Filters</h3>
                  {mockRadioDropdownFields.map((field) => (
                    <RadioDropdownFilter
                      key={field.id}
                      fieldId={field.id}
                      fieldLabel={field.label}
                      fieldTypeName={field.fieldTypeName}
                      options={field.options}
                      onFilterChange={handleRadioDropdownFilterChange}
                      initialFilter={radioDropdownFilterValues[field.id] || undefined}
                    />
                  ))}
                </div>

                {/* Multi-Select Filters Column */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-gray-700 border-b pb-2">Multi-Select Filters</h3>
                  {mockMultiSelectFields.map((field) => (
                    <MultiSelectFilter
                      key={field.id}
                      fieldId={field.id}
                      fieldLabel={field.label}
                      options={field.options}
                      onFilterChange={handleMultiSelectFilterChange}
                      initialFilter={multiSelectFilterValues[field.id] || undefined}
                    />
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Combined Filter State Display */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-sm font-semibold">Combined Filter State</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="text-xs overflow-x-auto bg-background p-4 rounded border max-h-96">
                {JSON.stringify(allFilterValues, null, 2)}
              </pre>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Original Table */}
      <Card className="bg-card border-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ListFilter className="h-5 w-5" />
              <CardTitle className="text-lg sm:text-xl">Available Field Type Filters</CardTitle>
            </div>
            <div className="text-sm text-muted-foreground">Total: {count}</div>
          </div>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="text-red-600 bg-red-50 border border-red-200 rounded p-3 mb-4 text-sm">
              {error}
            </div>
          )}

          {isLoading ? (
            <div className="flex items-center justify-center py-16 text-muted-foreground">
              <RefreshCw className="h-5 w-5 mr-2 animate-spin" /> Loading field type filters...
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[80px]">ID</TableHead>
                    <TableHead>Field Type</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="hidden sm:table-cell">Created</TableHead>
                    <TableHead className="hidden sm:table-cell">Updated</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((filter: FieldTypeFilter) => (
                    <TableRow key={filter.id}>
                      <TableCell className="font-mono text-xs">{filter.id}</TableCell>
                      <TableCell className="font-medium">{filter.field_type?.name}</TableCell>
                      <TableCell className="text-sm">{filter.filter_method_description}</TableCell>
                      <TableCell className="hidden sm:table-cell text-xs text-muted-foreground">
                        {new Date(filter.created_at).toLocaleString()}
                      </TableCell>
                      <TableCell className="hidden sm:table-cell text-xs text-muted-foreground">
                        {new Date(filter.updated_at).toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}
                  {items.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground">
                        No field type filters found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </ManageLayout>
  );
};

export default FieldTypeFiltersPage;
