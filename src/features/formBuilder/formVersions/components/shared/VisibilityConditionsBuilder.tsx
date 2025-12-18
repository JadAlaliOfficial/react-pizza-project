// src/features/formVersion/components/shared/VisibilityConditionsBuilder.tsx

/**
 * Visibility Conditions Builder Component
 * 
 * Provides a UI builder for creating complex visibility conditions
 * based on field values with support for operators and logic groups.
 * 
 * Supports all backend operators: filled, empty, equals, notequals,
 * greaterthan, lessthan, greaterorequal, lessorequal, contains, 
 * notcontains, startswith, endswith, in, notin
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Plus, Trash2, AlertCircle, Info } from 'lucide-react';
import type { UiStage, FieldIdLike } from '../../types/formVersion.ui-types';
import type { VisibilityConditions } from '../../types';

// ============================================================================
// Types
// ============================================================================

/**
 * Visibility condition operator types supported by backend
 */
export type ConditionOperator =
  | 'filled'
  | 'empty'
  | 'equals'
  | 'notequals'
  | 'greaterthan'
  | 'lessthan'
  | 'greaterorequal'
  | 'lessorequal'
  | 'contains'
  | 'notcontains'
  | 'startswith'
  | 'endswith'
  | 'in'
  | 'notin';

/**
 * Simple condition structure
 */
export interface SimpleCondition {
  fieldid: FieldIdLike;
  operator: ConditionOperator;
  value?: string | number | string[];
}

/**
 * Complex condition with AND/OR logic
 */
export interface ComplexCondition {
  logic: 'and' | 'or';
  conditions: SimpleCondition[];
}

/**
 * Union type for any condition
 */
export type VisibilityCondition = SimpleCondition | ComplexCondition | null;

/**
 * Field option for dropdown
 */
interface FieldOption {
  fieldId: FieldIdLike;
  stageName: string;
  sectionName: string;
  fieldLabel: string;
  fieldType: number | string;
}

// ============================================================================
// Constants
// ============================================================================

/**
 * Operators that don't require a value
 */
const NO_VALUE_OPERATORS: ConditionOperator[] = ['filled', 'empty'];

/**
 * Operators that require array values
 */
const ARRAY_OPERATORS: ConditionOperator[] = ['in', 'notin'];

/**
 * Operator display labels
 */
const OPERATOR_LABELS: Record<ConditionOperator, string> = {
  filled: 'Has Value',
  empty: 'Is Empty',
  equals: 'Equals',
  notequals: 'Not Equals',
  greaterthan: 'Greater Than',
  lessthan: 'Less Than',
  greaterorequal: 'Greater or Equal',
  lessorequal: 'Less or Equal',
  contains: 'Contains',
  notcontains: 'Does Not Contain',
  startswith: 'Starts With',
  endswith: 'Ends With',
  in: 'In List',
  notin: 'Not In List',
};

// ============================================================================
// Serialization & Evaluation Helpers
// ============================================================================

/**
 * Operator mapping between UI and API formats
 */
const UI_TO_API_OPERATOR: Record<ConditionOperator, string> = {
  filled: 'filled',
  empty: 'empty',
  equals: 'equals',
  notequals: 'not_equals',
  greaterthan: 'greater_than',
  lessthan: 'less_than',
  greaterorequal: 'greater_or_equal',
  lessorequal: 'less_or_equal',
  contains: 'contains',
  notcontains: 'not_contains',
  startswith: 'starts_with',
  endswith: 'ends_with',
  in: 'in',
  notin: 'not_in',
};

const API_TO_UI_OPERATOR: Record<string, ConditionOperator> = {
  filled: 'filled',
  empty: 'empty',
  equals: 'equals',
  not_equals: 'notequals',
  greater_than: 'greaterthan',
  less_than: 'lessthan',
  greater_or_equal: 'greaterorequal',
  less_or_equal: 'lessorequal',
  contains: 'contains',
  not_contains: 'notcontains',
  starts_with: 'startswith',
  ends_with: 'endswith',
  in: 'in',
  not_in: 'notin',
};

/**
 * Recursively maps inbound JSON to internal condition types
 */
function mapIncomingCondition(
  obj: any
): SimpleCondition | ComplexCondition | null {
  if (!obj || typeof obj !== 'object') {
    return null;
  }

  // Unwrap show_when if present
  if ('show_when' in obj && obj.show_when) {
    return mapIncomingCondition(obj.show_when);
  }

  if ('logic' in obj && Array.isArray(obj.conditions)) {
    // Flatten any nested groups to simple conditions to keep UI stable
    const flattenToSimples = (node: any): SimpleCondition[] => {
      if (!node) return [];
      if ('logic' in node && Array.isArray(node.conditions)) {
        return node.conditions
          .map((c: any) => flattenToSimples(c))
          .flat();
      }
      const simple = mapIncomingCondition(node);
      return simple && !('logic' in simple) ? [simple] : [];
    };
    const mappedChildren = flattenToSimples(obj);
    return {
      logic: obj.logic === 'or' ? 'or' : 'and',
      conditions: mappedChildren,
    };
  }

  // Support both field_id (API) and fieldid (UI)
  const fieldid =
    obj.fieldid !== undefined
      ? obj.fieldid
      : obj.field_id !== undefined
      ? obj.field_id
      : undefined;

  if (fieldid === undefined || typeof obj.operator !== 'string') {
    return null;
  }

  const simple: SimpleCondition = {
    fieldid,
    operator:
      API_TO_UI_OPERATOR[String(obj.operator)] ??
      (obj.operator as ConditionOperator),
    value: obj.value,
  };
  return simple;
}

/**
 * Parses visibility JSON string to VisibilityCondition (backward compatible)
 */
export function parseVisibilityConditions(
  input: string | VisibilityConditions | null | undefined
): VisibilityCondition {
  if (input === undefined || input === null) {
    return null;
  }
  // If already an object, map directly
  if (typeof input === 'object') {
    const mapped = mapIncomingCondition(input);
    return mapped ?? null;
  }
  // Otherwise, treat as JSON string
  const str = String(input).trim();
  if (str === '') return null;
  try {
    const parsed = JSON.parse(str);
    const mapped = mapIncomingCondition(parsed);
    return mapped ?? null;
  } catch {
    return null;
  }
}

/**
 * Recursively serializes internal condition types to API JSON structure
 */
function serializeCondition(
  condition: SimpleCondition | ComplexCondition
): any {
  if ('logic' in condition) {
    return {
      logic: condition.logic,
      conditions: condition.conditions.map(serializeCondition),
    };
  }
  return {
    field_id: condition.fieldid,
    operator: UI_TO_API_OPERATOR[condition.operator] ?? condition.operator,
    value: condition.value ?? null,
  };
}

/**
 * Serializes VisibilityCondition to JSON string for API/new format
 */
export function serializeVisibilityConditions(
  condition: VisibilityCondition
): VisibilityConditions | null {
  if (!condition) return null;
  const payload =
    'logic' in condition
      ? serializeCondition(condition)
      : serializeCondition(condition as SimpleCondition);
  return { show_when: payload };
}

/**
 * Evaluates a condition against current form values
 * values: map of field_id -> current value
 */
export function evaluateVisibility(
  condition: VisibilityCondition,
  values: Record<string | number, any>
): boolean {
  if (!condition) return true;

  const evalSimple = (c: SimpleCondition): boolean => {
    const v = values[c.fieldid];
    switch (c.operator) {
      case 'filled':
        return v !== undefined && v !== null && String(v).trim() !== '';
      case 'empty':
        return v === undefined || v === null || String(v).trim() === '';
      case 'equals':
        return v == c.value; // eslint-disable-line eqeqeq
      case 'notequals':
        return v != c.value; // eslint-disable-line eqeqeq
      case 'greaterthan':
        return Number(v) > Number(c.value);
      case 'lessthan':
        return Number(v) < Number(c.value);
      case 'greaterorequal':
        return Number(v) >= Number(c.value);
      case 'lessorequal':
        return Number(v) <= Number(c.value);
      case 'contains':
        return Array.isArray(v)
          ? v.includes(c.value)
          : String(v).includes(String(c.value ?? ''));
      case 'notcontains':
        return Array.isArray(v)
          ? !v.includes(c.value)
          : !String(v).includes(String(c.value ?? ''));
      case 'startswith':
        return String(v).startsWith(String(c.value ?? ''));
      case 'endswith':
        return String(v).endsWith(String(c.value ?? ''));
      case 'in':
        return Array.isArray(c.value)
          ? c.value.map(String).includes(String(v))
          : false;
      case 'notin':
        return Array.isArray(c.value)
          ? !c.value.map(String).includes(String(v))
          : true;
      default:
        return false;
    }
  };

  if ('logic' in condition) {
    const results = condition.conditions.map((child) =>
      'logic' in child ? evaluateVisibility(child, values) : evalSimple(child)
    );
    return condition.logic === 'and'
      ? results.every(Boolean)
      : results.some(Boolean);
  }
  return evalSimple(condition);
}

// ============================================================================
// Component Props
// ============================================================================

interface VisibilityConditionsBuilderProps {
  /**
   * Current condition value (can be simple, complex, or null)
   */
  value: VisibilityCondition;
  
  /**
   * Callback when condition changes
   */
  onChange: (condition: VisibilityCondition) => void;
  
  /**
   * All stages to extract fields from
   */
  stages: UiStage[];
  
  /**
   * Optional: Whether dialog is open (controlled mode)
   */
  open?: boolean;
  
  /**
   * Optional: Callback to close dialog
   */
  onClose?: () => void;
  
  /**
   * Optional: Field ID to exclude from selection (e.g., current field)
   */
  excludeFieldId?: FieldIdLike;

  /**
   * Optional: Stage ID to exclude from selection (e.g., current stage)
   */
  excludeStageId?: string | number;

  /**
   * Optional: Section ID to exclude from selection (e.g., current section)
   */
  excludeSectionId?: string | number;
}

// ============================================================================
// Component
// ============================================================================

/**
 * VisibilityConditionsBuilder Component
 * 
 * Visual builder for creating visibility conditions that control
 * when stages, sections, or fields are visible based on form field values.
 */
export const VisibilityConditionsBuilder: React.FC<VisibilityConditionsBuilderProps> = ({
  value,
  onChange,
  stages,
  open = true,
  onClose,
  excludeFieldId,
  excludeStageId,
  excludeSectionId,
}) => {
  // ========================================================================
  // State
  // ========================================================================
  
  const [isComplex, setIsComplex] = useState<boolean>(
    !!value && 'logic' in value
  );
  
  const [logic, setLogic] = useState<'and' | 'or'>('and');
  const [conditions, setConditions] = useState<SimpleCondition[]>([]);

  // ========================================================================
  // Extract all fields from stages
  // ========================================================================
  
  const allFields = useMemo<FieldOption[]>(() => {
    const fields: FieldOption[] = [];
    
    stages.forEach((stage) => {
      // Exclude specified stage if provided
      if (excludeStageId && stage.id === excludeStageId) {
        return;
      }

      stage.sections.forEach((section) => {
        // Exclude specified section if provided
        if (excludeSectionId && section.id === excludeSectionId) {
          return;
        }

        section.fields.forEach((field) => {
          // Exclude specified field if provided
          if (excludeFieldId && field.id === excludeFieldId) {
            return;
          }
          
          fields.push({
            fieldId: field.id,
            stageName: stage.name,
            sectionName: section.name,
            fieldLabel: field.label,
            fieldType: field.field_type_id || 'Unknown',
          });
        });
      });
    });
    
    return fields;
  }, [stages, excludeFieldId, excludeStageId, excludeSectionId]);

  // ========================================================================
  // Initialize state from value
  // ========================================================================
  
  useEffect(() => {
    if (!value) {
      setIsComplex(false);
      setConditions([]);
      setLogic('and');
      return;
    }

    if ('logic' in value) {
      // Complex condition
      setIsComplex(true);
      setLogic(value.logic);
      setConditions(value.conditions);
    } else {
      // Simple condition
      setIsComplex(false);
      setConditions([value]);
    }
  }, [value]);

  // ========================================================================
  // Handlers
  // ========================================================================

  /**
   * Adds a new empty condition
   */
  const handleAddCondition = (): void => {
    const newCondition: SimpleCondition = {
      fieldid: allFields[0]?.fieldId || '',
      operator: 'filled',
      value: undefined,
    };
    
    setConditions([...conditions, newCondition]);
  };

  /**
   * Removes a condition by index
   */
  const handleRemoveCondition = (index: number): void => {
    setConditions(conditions.filter((_, i) => i !== index));
  };

  /**
   * Updates a specific condition
   */
  const handleUpdateCondition = (
    index: number,
    updates: Partial<SimpleCondition>
  ): void => {
    const updated = [...conditions];
    updated[index] = { ...updated[index], ...updates };
    
    // Clear value if operator doesn't need it
    if (updates.operator && NO_VALUE_OPERATORS.includes(updates.operator)) {
      updated[index].value = undefined;
    }
    
    setConditions(updated);
  };

  /**
   * Toggles between simple and complex mode
   */
  const handleToggleComplexity = (): void => {
    if (isComplex) {
      // Complex to simple: keep first condition only
      setIsComplex(false);
      if (conditions.length > 1) {
        setConditions([conditions[0]]);
      }
    } else {
      // Simple to complex: keep existing condition
      setIsComplex(true);
    }
  };

  /**
   * Saves and closes
   */
  const handleSave = (): void => {
    if (conditions.length === 0) {
      onChange(null);
    } else if (isComplex) {
      onChange({
        logic,
        conditions,
      });
    } else {
      onChange(conditions[0]);
    }
    
    onClose?.();
  };

  /**
   * Clears all conditions
   */
  const handleClear = (): void => {
    setConditions([]);
    setIsComplex(false);
    onChange(null);
  };

  // ========================================================================
  // Render helpers
  // ========================================================================

  /**
   * Renders value input based on operator
   */
  const renderValueInput = (condition: SimpleCondition, index: number) => {
    const operator = condition.operator;
    
    // No value needed
    if (NO_VALUE_OPERATORS.includes(operator)) {
      return (
        <div className="text-sm text-muted-foreground italic">
          No value required
        </div>
      );
    }

    // Array operators
    if (ARRAY_OPERATORS.includes(operator)) {
      return (
        <Input
          type="text"
          value={Array.isArray(condition.value) ? condition.value.join(', ') : ''}
          onChange={(e) => {
            const arrayValue = e.target.value
              .split(',')
              .map((v) => v.trim())
              .filter((v) => v);
            handleUpdateCondition(index, { value: arrayValue });
          }}
          placeholder="Enter comma-separated values"
        />
      );
    }

    // Numeric operators
    if (['greaterthan', 'lessthan', 'greaterorequal', 'lessorequal'].includes(operator)) {
      return (
        <Input
          type="number"
          value={condition.value as number || ''}
          onChange={(e) =>
            handleUpdateCondition(index, {
              value: parseFloat(e.target.value) || 0,
            })
          }
          placeholder="Enter number"
        />
      );
    }

    // Text operators (default)
    return (
      <Input
        type="text"
        value={condition.value as string || ''}
        onChange={(e) => handleUpdateCondition(index, { value: e.target.value })}
        placeholder="Enter value"
      />
    );
  };

  /**
   * Renders field selection dropdown
   */
  const renderFieldSelect = (condition: SimpleCondition, index: number) => {
    const selectedField = allFields.find((f) => f.fieldId === condition.fieldid);
    
    return (
      <Select
        value={String(condition.fieldid)}
        onValueChange={(value) => {
          // Parse back to number if it was numeric
          const parsedValue = isNaN(Number(value)) ? value : Number(value);
          handleUpdateCondition(index, { fieldid: parsedValue });
        }}
      >
        <SelectTrigger className="w-full">
          <SelectValue>
            {selectedField ? (
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  {selectedField.stageName}
                </Badge>
                <span className="text-sm">
                  {selectedField.sectionName} › {selectedField.fieldLabel}
                </span>
              </div>
            ) : (
              'Select field'
            )}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {allFields.map((field) => (
            <SelectItem key={String(field.fieldId)} value={String(field.fieldId)}>
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {field.stageName}
                  </Badge>
                  <Badge variant="secondary" className="text-xs">
                    {field.fieldType}
                  </Badge>
                </div>
                <div className="text-sm">
                  {field.sectionName} › {field.fieldLabel}
                </div>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  };

  // ========================================================================
  // Render
  // ========================================================================

  return (
    <Dialog open={open} onOpenChange={() => onClose?.()}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Visibility Conditions</DialogTitle>
          <DialogDescription>
            Define when this element should be visible based on field values
          </DialogDescription>
        </DialogHeader>

        {/* Info Alert */}
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            Conditions control visibility based on form field values. Fields must have values
            submitted before conditions can evaluate.
          </AlertDescription>
        </Alert>

        {/* No fields warning */}
        {allFields.length === 0 && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              No fields available. Add fields to stages and sections first.
            </AlertDescription>
          </Alert>
        )}

        {/* Complexity toggle */}
        {conditions.length > 0 && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Label>Condition Type:</Label>
              <Badge variant={isComplex ? 'default' : 'secondary'}>
                {isComplex ? 'Multiple (AND/OR)' : 'Single'}
              </Badge>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleToggleComplexity}
              disabled={conditions.length === 0}
            >
              {isComplex ? 'Use Simple Mode' : 'Use Complex Mode'}
            </Button>
          </div>
        )}

        {/* Logic selector for complex mode */}
        {isComplex && conditions.length > 1 && (
          <div className="flex items-center gap-2">
            <Label>Logic:</Label>
            <Select value={logic} onValueChange={(value: 'and' | 'or') => setLogic(value)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="and">AND (All must match)</SelectItem>
                <SelectItem value="or">OR (Any can match)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Conditions list */}
        <div className="space-y-4">
          {conditions.map((condition, index) => (
            <div key={index} className="border rounded-lg p-4 space-y-3">
              {/* Condition header */}
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">
                  Condition {index + 1}
                  {isComplex && index > 0 && (
                    <Badge variant="outline" className="ml-2">
                      {logic.toUpperCase()}
                    </Badge>
                  )}
                </Label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveCondition(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              {/* Field selection */}
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Field</Label>
                {renderFieldSelect(condition, index)}
              </div>

              {/* Operator selection */}
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Operator</Label>
                <Select
                  value={condition.operator}
                  onValueChange={(value: ConditionOperator) =>
                    handleUpdateCondition(index, { operator: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(OPERATOR_LABELS).map(([op, label]) => (
                      <SelectItem key={op} value={op}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Value input */}
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Value</Label>
                {renderValueInput(condition, index)}
              </div>
            </div>
          ))}
        </div>

        {/* Add condition button */}
        {allFields.length > 0 && (!isComplex || conditions.length === 0 || isComplex) && (
          <Button
            variant="outline"
            onClick={handleAddCondition}
            className="w-full"
            disabled={allFields.length === 0}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add {conditions.length > 0 && isComplex ? 'Another ' : ''}Condition
          </Button>
        )}

        {/* Footer */}
        <DialogFooter className="flex items-center justify-between">
          <Button variant="ghost" onClick={handleClear} disabled={conditions.length === 0}>
            Clear All
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onClose?.()}>
              Cancel
            </Button>
            <Button onClick={handleSave}>Save Conditions</Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
