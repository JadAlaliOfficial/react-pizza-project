import * as React from "react";
import { Check, ChevronsUpDown, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useFieldTypes } from "../hooks/useFieldTypes";
import { useInputRules } from "../../inputRules/hooks/useInputRules";

interface FieldType {
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
}

interface InputRule {
  id: number;
  name: string;
  description: string;
  is_public: boolean;
  field_types: Array<{
    id: number;
    name: string;
    created_at: string;
    updated_at: string;
    pivot?: any;
  }>;
  created_at: string;
  updated_at: string;
}

interface SelectedFieldTypeInfo {
  fieldType: FieldType;
  applicableRules: InputRule[];
}

export function FieldTypeCombobox() {
  const [open, setOpen] = React.useState(false);
  const [selectedFieldTypeId, setSelectedFieldTypeId] = React.useState<number | null>(null);
  const [selectedInfo, setSelectedInfo] = React.useState<SelectedFieldTypeInfo | null>(null);

  // Use your custom hooks
  const { fieldTypes, isLoading: fieldTypesLoading, error: fieldTypesError, ensureLoaded: loadFieldTypes } = useFieldTypes();
  const { items: inputRules, loading: inputRulesLoading, error: inputRulesError, refetch: loadInputRules } = useInputRules();

  // Load data on mount
  React.useEffect(() => {
    loadFieldTypes();
    loadInputRules();
  }, [loadFieldTypes, loadInputRules]);

  // Get applicable rules when a field type is selected
  React.useEffect(() => {
    if (selectedFieldTypeId && inputRules.length > 0) {
      const fieldType = fieldTypes.find(ft => ft.id === selectedFieldTypeId);
      
      if (fieldType) {
        // Filter rules that apply to this field type
        const applicableRules = inputRules.filter(rule => 
          rule.field_types.some(ft => ft.id === selectedFieldTypeId)
        );

        setSelectedInfo({
          fieldType,
          applicableRules,
        });
      }
    } else {
      setSelectedInfo(null);
    }
  }, [selectedFieldTypeId, fieldTypes, inputRules]);

  const selectedFieldType = fieldTypes.find(ft => ft.id === selectedFieldTypeId);

  if (fieldTypesLoading || inputRulesLoading) {
    return <div className="text-sm text-muted-foreground">Loading...</div>;
  }

  if (fieldTypesError || inputRulesError) {
    return (
      <div className="text-sm text-destructive">
        Error: {fieldTypesError || inputRulesError}
      </div>
    );
  }

  return (
    <div className="w-full space-y-4">
      {/* Combobox */}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
          >
            {selectedFieldType ? selectedFieldType.name : "Select field type..."}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <Command>
            <CommandInput placeholder="Search field types..." />
            <CommandList>
              <CommandEmpty>No field type found.</CommandEmpty>
              <CommandGroup>
                <ScrollArea className="h-[300px]">
                  {fieldTypes.map((fieldType) => (
                    <CommandItem
                      key={fieldType.id}
                      value={fieldType.name}
                      onSelect={() => {
                        setSelectedFieldTypeId(fieldType.id);
                        setOpen(false);
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          selectedFieldTypeId === fieldType.id ? "opacity-100" : "opacity-0"
                        )}
                      />
                      {fieldType.name}
                    </CommandItem>
                  ))}
                </ScrollArea>
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {/* Selected Field Type Information */}
      {selectedInfo && (
        <div className="space-y-4 rounded-lg border p-4">
          <div>
            <h3 className="text-lg font-semibold">{selectedInfo.fieldType.name}</h3>
            <p className="text-sm text-muted-foreground">
              ID: {selectedInfo.fieldType.id}
            </p>
          </div>

          {/* Applicable Input Rules */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Info className="h-4 w-4 text-muted-foreground" />
              <h4 className="text-sm font-medium">
                Applicable Input Rules ({selectedInfo.applicableRules.length})
              </h4>
            </div>

            {selectedInfo.applicableRules.length > 0 ? (
              <ScrollArea className="h-[400px] w-full rounded-md border">
                <div className="space-y-2 p-4">
                  {selectedInfo.applicableRules.map((rule) => (
                    <div
                      key={rule.id}
                      className="space-y-2 rounded-md border p-3 hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <Badge variant={rule.is_public ? "default" : "secondary"}>
                            {rule.name}
                          </Badge>
                          {!rule.is_public && (
                            <Badge variant="outline" className="text-xs">
                              Private
                            </Badge>
                          )}
                        </div>
                        <span className="text-xs text-muted-foreground">
                          ID: {rule.id}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {rule.description}
                      </p>
                      <div className="flex flex-wrap gap-1 pt-1">
                        <span className="text-xs text-muted-foreground">
                          Also applies to:
                        </span>
                        {rule.field_types
                          .filter(ft => ft.id !== selectedFieldTypeId)
                          .slice(0, 3)
                          .map((ft) => (
                            <Badge key={ft.id} variant="outline" className="text-xs">
                              {ft.name}
                            </Badge>
                          ))}
                        {rule.field_types.length > 4 && (
                          <Badge variant="outline" className="text-xs">
                            +{rule.field_types.length - 4} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            ) : (
              <div className="rounded-md border border-dashed p-8 text-center">
                <p className="text-sm text-muted-foreground">
                  No input rules available for this field type.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
