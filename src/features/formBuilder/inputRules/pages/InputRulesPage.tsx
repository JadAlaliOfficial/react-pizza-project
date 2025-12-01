import React, { useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/table';
import { RefreshCw, ListChecks } from 'lucide-react';
import { ManageLayout } from '@/components/layouts/ManageLayout';
import { useInputRules } from '@/features/formBuilder/inputRules/hooks/useInputRules';
import type { InputRule } from '@/features/formBuilder/inputRules/types';
import { RequiredRule } from '@/features/formBuilder/inputRules/components/RequiredRule';
import { MinRule } from '@/features/formBuilder/inputRules/components/MinRule';
import { MaxRule } from '@/features/formBuilder/inputRules/components/MaxRule';
import { BetweenRule } from '@/features/formBuilder/inputRules/components/BetweenRule';
import { EmailRule } from '@/features/formBuilder/inputRules/components/EmailRule';
import { UrlRule } from '@/features/formBuilder/inputRules/components/UrlRule';
import { RegexRule } from '@/features/formBuilder/inputRules/components/RegexRule';
import { NumericRule } from '@/features/formBuilder/inputRules/components/NumericRule';
import { AlphaRule } from '@/features/formBuilder/inputRules/components/AlphaRule';
import { AlphaNumericRule } from '@/features/formBuilder/inputRules/components/AlphaNumericRule';
import { DateRule } from '@/features/formBuilder/inputRules/components/DateRule';
import { AfterDateRule } from '@/features/formBuilder/inputRules/components/AfterDateRule';
import { BeforeDateRule } from '@/features/formBuilder/inputRules/components/BeforeDateRule';
import { MimesRule } from '@/features/formBuilder/inputRules/components/MimesRule';
import { InRule } from '@/features/formBuilder/inputRules/components/InRule';
import { IntegerRule } from '@/features/formBuilder/inputRules/components/IntegerRule';
import { AlphaDashRule } from '@/features/formBuilder/inputRules/components/AlphaDashRule';
import { NotInRule } from '@/features/formBuilder/inputRules/components/NotInRule';
import { DateFormatRule } from '@/features/formBuilder/inputRules/components/DateFormatRule';
import { BeforeOrEqualRule } from '@/features/formBuilder/inputRules/components/BeforeOrEqualRule';
import { AfterOrEqualRule } from '@/features/formBuilder/inputRules/components/AfterOrEqualRule';
import { MimeTypesRule } from '@/features/formBuilder/inputRules/components/MimeTypesRule';
import { SizeRule } from '@/features/formBuilder/inputRules/components/SizeRule';
import { MaxFileSizeRule } from '@/features/formBuilder/inputRules/components/MaxFileSizeRule';
import { MinFileSizeRule } from '@/features/formBuilder/inputRules/components/MinFileSizeRule';
import { DimensionsRule } from '@/features/formBuilder/inputRules/components/DimensionsRule';
import { ConfirmedRule } from '@/features/formBuilder/inputRules/components/ConfirmedRule';
import { SameRule } from '@/features/formBuilder/inputRules/components/SameRule';
import { DifferentRule } from '@/features/formBuilder/inputRules/components/DifferentRule';
import { UniqueRule } from '@/features/formBuilder/inputRules/components/UniqueRule';
import { StartsWithRule } from '@/features/formBuilder/inputRules/components/StartsWithRule';
import { JSONRule } from '@/features/formBuilder/inputRules/components/JSONRule';
import { EndsWithRule } from '@/features/formBuilder/inputRules/components/EndsWithRule';
import { LatitudeRule } from '@/features/formBuilder/inputRules/components/LatitudeRule';
import { LongitudeRule } from '@/features/formBuilder/inputRules/components/LongitudeRule';

const InputRulesPage: React.FC = () => {
  const { items, loading, error, refetch } = useInputRules();
  console.log(items);

  const count = useMemo(() => items.length, [items]);

  const handleRefresh = async () => {
    await refetch();
  };

  return (
    <ManageLayout
      title="Input Rules"
      subtitle="Manage and view available input validation rules"
      mainButtons={
        <Button
          onClick={handleRefresh}
          variant="outline"
          disabled={loading}
          className="gap-2"
        >
          <RefreshCw className={loading ? 'h-4 w-4 animate-spin' : 'h-4 w-4'} />
          Refresh
        </Button>
      }
      backButton={{ show: false }}
    >
      <Card className="bg-card border-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ListChecks className="h-5 w-5" />
              <CardTitle className="text-lg sm:text-xl">
                Available Input Rules
              </CardTitle>
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

          {loading ? (
            <div className="flex items-center justify-center py-16 text-muted-foreground">
              <RefreshCw className="h-5 w-5 mr-2 animate-spin" /> Loading input
              rules...
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[80px]">ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead className="hidden sm:table-cell">
                      Description
                    </TableHead>
                    <TableHead className="hidden sm:table-cell">
                      Public
                    </TableHead>
                    <TableHead className="hidden md:table-cell">
                      Field Types
                    </TableHead>
                    <TableHead className="hidden lg:table-cell">
                      Created
                    </TableHead>
                    <TableHead className="hidden lg:table-cell">
                      Updated
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((rule: InputRule) => (
                    <TableRow key={rule.id}>
                      <TableCell className="font-mono text-xs">
                        {rule.id}
                      </TableCell>
                      <TableCell className="font-medium">{rule.name}</TableCell>
                      <TableCell className="hidden sm:table-cell text-xs text-muted-foreground">
                        {rule.description}
                      </TableCell>
                      <TableCell className="hidden sm:table-cell text-xs">
                        {rule.is_public ? 'Yes' : 'No'}
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-xs text-muted-foreground">
                        {rule.field_types?.length ?? 0}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-xs text-muted-foreground">
                        {new Date(rule.created_at).toLocaleString()}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-xs text-muted-foreground">
                        {new Date(rule.updated_at).toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}
                  {items.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={7}
                        className="text-center text-muted-foreground"
                      >
                        No input rules found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
      <div>
        <RequiredRule />
      </div>
      <div>
        <MinRule />
      </div>
      <div>
        <MaxRule />
      </div>
      <div>
        <BetweenRule />
      </div>
      <div>
        <EmailRule />
      </div>
      <div>
        <UrlRule />
      </div>
      <div>
        <RegexRule />
      </div>
      <div>
        <NumericRule />
      </div>
      <div>
        <AlphaRule />
      </div>
      <div>
        <AlphaNumericRule />
      </div>
      <div>
        <DateRule />
      </div>
      <div>
        <AfterDateRule />
      </div>
      <div>
        <BeforeDateRule />
      </div>
      <div>
        <MimesRule />
      </div>
      <div>
        <InRule />
      </div>
      <div>
        <IntegerRule />
      </div>
      <div>
        <AlphaDashRule />
      </div>
      <div>
        <NotInRule />
      </div>
      <div>
        <DateFormatRule />
      </div>
      <div>
        <BeforeOrEqualRule />
      </div>
      <div>
        <AfterOrEqualRule />
      </div>
      <div>
        <MimeTypesRule />
      </div>
      <div>
        <SizeRule />
      </div>
      <div>
        <MaxFileSizeRule />
      </div>
      <div>
        <MinFileSizeRule />
      </div>
      <div>
        <DimensionsRule />
      </div>
      <div>
        <ConfirmedRule />
      </div>
      <div>
        <SameRule />
      </div>
      <div>
        <DifferentRule />
      </div>
      <div>
        <UniqueRule />
      </div>
      <div>
        <StartsWithRule />
      </div>
      <div>
        <JSONRule />
      </div>
      <div>
        <EndsWithRule />
      </div>
      <div>
        <LatitudeRule />
      </div>
      <div>
        <LongitudeRule />
      </div>
    </ManageLayout>
  );
};

export default InputRulesPage;
