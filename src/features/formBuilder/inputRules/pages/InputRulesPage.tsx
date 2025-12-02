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
// import { RequiredRule } from '@/features/formBuilder/inputRules/components/RequiredRuleNew';
// import { MinRuleNew } from '@/features/formBuilder/inputRules/components/MinRuleNew';
// import { MaxRuleNew } from '@/features/formBuilder/inputRules/components/MaxRuleNew';
// import { BetweenRuleNew } from '@/features/formBuilder/inputRules/components/BetweenRuleNew';
// import { EmailRule } from '@/features/formBuilder/inputRules/components/EmailRuleNew';
// import { UrlRule } from '@/features/formBuilder/inputRules/components/UrlRuleNew';
// import { RegexRule } from '@/features/formBuilder/inputRules/components/RegexRuleNew';
// import { NumericRuleNew } from '@/features/formBuilder/inputRules/components/NumericRuleNew';
// import { AlphaRule } from '@/features/formBuilder/inputRules/components/AlphaRuleNew';
// import { AlphaNumericRule } from '@/features/formBuilder/inputRules/components/AlphaNumericRuleNew';
// import { DateRuleNew } from '@/features/formBuilder/inputRules/components/DateRuleNew';
// import { AfterDateRule } from '@/features/formBuilder/inputRules/components/AfterDateRuleNew';
// import { BeforeDateRuleNew } from '@/features/formBuilder/inputRules/components/BeforeDateRuleNew';
// import { MimesRuleNew } from '@/features/formBuilder/inputRules/components/MimesRuleNew';
// import { InRule } from '@/features/formBuilder/inputRules/components/InRuleNew';
// import { IntegerRuleNew } from '@/features/formBuilder/inputRules/components/IntegerRuleNew';
// import { AlphaDashRule } from '@/features/formBuilder/inputRules/components/AlphaDashRuleNew';
// import { NotInRule } from '@/features/formBuilder/inputRules/components/NotInRuleNew';
// import { DateFormatRuleNew } from '@/features/formBuilder/inputRules/components/DateFormatRuleNew';
// import { BeforeOrEqualRuleNew } from '@/features/formBuilder/inputRules/components/BeforeOrEqualRuleNew';
// import { AfterOrEqualRule } from '@/features/formBuilder/inputRules/components/AfterOrEqualRuleNew';
// import { MimeTypesRuleNew } from '@/features/formBuilder/inputRules/components/MimetypesRuleNew';
// import { SizeRuleNew } from '@/features/formBuilder/inputRules/components/SizeRuleNew';
// import { MaxFileSizeRuleNew } from '@/features/formBuilder/inputRules/components/MaxFileSizeRuleNew';
// import { MinFileSizeRuleNew } from '@/features/formBuilder/inputRules/components/MinFileSizeRuleNew';
// import { DimensionsRuleNew } from '@/features/formBuilder/inputRules/components/DimensionsRuleNew';
// import { ConfirmedRule } from '@/features/formBuilder/inputRules/components/ConfirmedRuleNew';
// import { SameRule } from '@/features/formBuilder/inputRules/components/SameRuleNew';
// import { DifferentRule } from '@/features/formBuilder/inputRules/components/DifferentRuleNew';
// import { UniqueRule } from '@/features/formBuilder/inputRules/components/UniqueRuleNew';
// import { StartsWithRule } from '@/features/formBuilder/inputRules/components/StartsWithRuleNew';
// import { JSONRule } from '@/features/formBuilder/inputRules/components/JSONRuleNew';
// import { EndsWithRule } from '@/features/formBuilder/inputRules/components/EndsWithRuleNew';
// import { LatitudeRule } from '@/features/formBuilder/inputRules/components/LatitudeRuleNew';
// import { LongitudeRule } from '@/features/formBuilder/inputRules/components/LongitudeRuleNew';

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
      {/* <div>
        <RequiredRuleNew id={id} />
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
      </div> */}
    </ManageLayout>
  );
};

export default InputRulesPage;
