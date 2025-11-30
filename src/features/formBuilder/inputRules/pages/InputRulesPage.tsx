import React, { useMemo, useState, useCallback } from 'react';
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
import { FileRule } from '@/features/formBuilder/inputRules/components/FileRule';
import { ImageRule } from '@/features/formBuilder/inputRules/components/ImageRule';
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

const InputRulesPage: React.FC = () => {
  const { items, loading, error, refetch } = useInputRules();
  console.log(items);

  const count = useMemo(() => items.length, [items]);

  const handleRefresh = async () => {
    await refetch();
  };

  const [requiredEnabled, setRequiredEnabled] = useState(false);
  const handleRequiredEnabledChange = useCallback((enabled: boolean) => {
    setRequiredEnabled(!!enabled);
  }, []);
  const [minEnabled, setMinEnabled] = useState(false);
  const [minValue, setMinValue] = useState<number | undefined>(undefined);
  const handleMinEnabledChange = useCallback((enabled: boolean) => {
    setMinEnabled(!!enabled);
  }, []);
  const handleMinValueChange = useCallback((value: number | undefined) => {
    setMinValue(value);
  }, []);
  const [maxEnabled, setMaxEnabled] = useState(false);
  const [maxValue, setMaxValue] = useState<number | undefined>(undefined);
  const handleMaxEnabledChange = useCallback((enabled: boolean) => {
    setMaxEnabled(!!enabled);
  }, []);
  const handleMaxValueChange = useCallback((value: number | undefined) => {
    setMaxValue(value);
  }, []);
  const [betweenEnabled, setBetweenEnabled] = useState(false);
  const [betweenMin, setBetweenMin] = useState<number | undefined>(undefined);
  const [betweenMax, setBetweenMax] = useState<number | undefined>(undefined);
  const handleBetweenEnabledChange = useCallback((enabled: boolean) => {
    setBetweenEnabled(!!enabled);
  }, []);
  const handleBetweenMinChange = useCallback((min: number | undefined) => {
    setBetweenMin(min);
  }, []);
  const handleBetweenMaxChange = useCallback((max: number | undefined) => {
    setBetweenMax(max);
  }, []);
  const [emailEnabled, setEmailEnabled] = useState(false);
  const handleEmailEnabledChange = useCallback((enabled: boolean) => {
    setEmailEnabled(!!enabled);
  }, []);
  const [urlEnabled, setUrlEnabled] = useState(false);
  const handleUrlEnabledChange = useCallback((enabled: boolean) => {
    setUrlEnabled(!!enabled);
  }, []);
  const [regexEnabled, setRegexEnabled] = useState(false);
  const [regexPattern, setRegexPattern] = useState<string | undefined>(
    undefined,
  );
  const handleRegexEnabledChange = useCallback((enabled: boolean) => {
    setRegexEnabled(!!enabled);
  }, []);
  const handleRegexPatternChange = useCallback(
    (pattern: string | undefined) => {
      setRegexPattern(pattern);
    },
    [],
  );
  const [numericEnabled, setNumericEnabled] = useState(false);
  const handleNumericEnabledChange = useCallback((enabled: boolean) => {
    setNumericEnabled(!!enabled);
  }, []);
  const [alphaEnabled, setAlphaEnabled] = useState(false);
  const handleAlphaEnabledChange = useCallback((enabled: boolean) => {
    setAlphaEnabled(!!enabled);
  }, []);
  const [alphaNumericEnabled, setAlphaNumericEnabled] = useState(false);
  const handleAlphaNumericEnabledChange = useCallback((enabled: boolean) => {
    setAlphaNumericEnabled(!!enabled);
  }, []);
  const [dateEnabled, setDateEnabled] = useState(false);
  const handleDateEnabledChange = useCallback((enabled: boolean) => {
    setDateEnabled(!!enabled);
  }, []);
  const [afterDateValue, setAfterDateValue] = useState<string | undefined>(
    undefined,
  );
  const handleAfterDateValueChange = useCallback(
    (value: string | undefined) => {
      setAfterDateValue(value);
    },
    [],
  );
  const [afterDateEnabled, setAfterDateEnabled] = useState(false);
  const handleAfterDateEnabledChange = useCallback((enabled: boolean) => {
    setAfterDateEnabled(!!enabled);
  }, []);
  const [beforeDateValue, setBeforeDateValue] = useState<string | undefined>(
    undefined,
  );
  const handleBeforeDateValueChange = useCallback(
    (value: string | undefined) => {
      setBeforeDateValue(value);
    },
    [],
  );
  const [beforeDateEnabled, setBeforeDateEnabled] = useState(false);
  const handleBeforeDateEnabledChange = useCallback((enabled: boolean) => {
    setBeforeDateEnabled(!!enabled);
  }, []);

  const [fileEnabled, setFileEnabled] = useState(false);
  const [fileTypes, setFileTypes] = useState<string[] | undefined>(undefined);
  const [fileSize, setFileSize] = useState<number | undefined>(undefined);
  const [fileMaxSize, setFileMaxSize] = useState<number | undefined>(undefined);
  const [fileMinSize, setFileMinSize] = useState<number | undefined>(undefined);
  const handleFileEnabledChange = useCallback((enabled: boolean) => {
    setFileEnabled(!!enabled);
  }, []);
  const handleFilePropsChange = useCallback(
    (props: {
      types?: string[];
      size?: number;
      maxSize?: number;
      minSize?: number;
    }) => {
      setFileTypes(props.types);
      setFileSize(props.size);
      setFileMaxSize(props.maxSize);
      setFileMinSize(props.minSize);
    },
    [],
  );

  const [imageEnabled, setImageEnabled] = useState(false);
  const [imageMinWidth, setImageMinWidth] = useState<number | undefined>(
    undefined,
  );
  const [imageMaxWidth, setImageMaxWidth] = useState<number | undefined>(
    undefined,
  );
  const [imageMinHeight, setImageMinHeight] = useState<number | undefined>(
    undefined,
  );
  const [imageMaxHeight, setImageMaxHeight] = useState<number | undefined>(
    undefined,
  );
  const [imageWidth, setImageWidth] = useState<number | undefined>(undefined);
  const [imageHeight, setImageHeight] = useState<number | undefined>(undefined);
  const handleImageEnabledChange = useCallback((enabled: boolean) => {
    setImageEnabled(!!enabled);
  }, []);
  const handleImagePropsChange = useCallback(
    (props: {
      minWidth?: number;
      maxWidth?: number;
      minHeight?: number;
      maxHeight?: number;
      width?: number;
      height?: number;
    }) => {
      setImageMinWidth(props.minWidth);
      setImageMaxWidth(props.maxWidth);
      setImageMinHeight(props.minHeight);
      setImageMaxHeight(props.maxHeight);
      setImageWidth(props.width);
      setImageHeight(props.height);
    },
    [],
  );
  const [mimesEnabled, setMimesEnabled] = useState(false);
  const [mimesTypes, setMimesTypes] = useState<string[] | undefined>(undefined);
  const handleMimesEnabledChange = useCallback((enabled: boolean) => {
    setMimesEnabled(!!enabled);
  }, []);
  const handleMimesTypesChange = useCallback((types: string[] | undefined) => {
    setMimesTypes(types);
  }, []);
  const [inEnabled, setInEnabled] = useState(false);
  const [inValues, setInValues] = useState<string[] | undefined>(undefined);
  const handleInEnabledChange = useCallback((enabled: boolean) => {
    setInEnabled(!!enabled);
  }, []);
  const handleInValuesChange = useCallback((values: string[] | undefined) => {
    setInValues(values);
  }, []);
  const [integerEnabled, setIntegerEnabled] = useState(false);
  const handleIntegerEnabledChange = useCallback((enabled: boolean) => {
    setIntegerEnabled(!!enabled);
  }, []);
  const [alphaDashEnabled, setAlphaDashEnabled] = useState(false);
  const handleAlphaDashEnabledChange = useCallback((enabled: boolean) => {
    setAlphaDashEnabled(!!enabled);
  }, []);
  const [notInEnabled, setNotInEnabled] = useState(false);
  const handleNotInEnabledChange = useCallback((enabled: boolean) => {
    setNotInEnabled(!!enabled);
  }, []);
  const [notInValues, setNotInValues] = useState<string[] | undefined>(
    undefined,
  );
  const handleNotInValuesChange = useCallback(
    (values: string[] | undefined) => {
      setNotInValues(values);
    },
    [],
  );
  const [dateFormatEnabled, setDateFormatEnabled] = useState(false);
  const handleDateFormatEnabledChange = useCallback((enabled: boolean) => {
    setDateFormatEnabled(!!enabled);
  }, []);
  const [dateFormatValue, setDateFormatValue] = useState<string | undefined>(
    undefined,
  );
  const handleDateFormatValueChange = useCallback(
    (value: string | undefined) => {
      setDateFormatValue(value);
    },
    [],
  );
  const [beforeOrEqualEnabled, setBeforeOrEqualEnabled] = useState(false);
  const handleBeforeOrEqualEnabledChange = useCallback((enabled: boolean) => {
    setBeforeOrEqualEnabled(!!enabled);
  }, []);
  const [beforeOrEqualValue, setBeforeOrEqualValue] = useState<
    string | undefined
  >(undefined);
  const handleBeforeOrEqualValueChange = useCallback(
    (value: string | undefined) => {
      setBeforeOrEqualValue(value);
    },
    [],
  );
  const [afterOrEqualEnabled, setAfterOrEqualEnabled] = useState(false);
  const handleAfterOrEqualEnabledChange = useCallback((enabled: boolean) => {
    setAfterOrEqualEnabled(!!enabled);
  }, []);
  const [afterOrEqualValue, setAfterOrEqualValue] = useState<
    string | undefined
  >(undefined);
  const handleAfterOrEqualValueChange = useCallback(
    (value: string | undefined) => {
      setAfterOrEqualValue(value);
    },
    [],
  );
  const [mimeTypesEnabled, setMimeTypesEnabled] = useState(false);
  const handleMimeTypesEnabledChange = useCallback((enabled: boolean) => {
    setMimeTypesEnabled(!!enabled);
  }, []);
  const [mimeTypesTypes, setMimeTypesTypes] = useState<string[] | undefined>(
    undefined,
  );
  const handleMimeTypesTypesChange = useCallback(
    (types: string[] | undefined) => {
      setMimeTypesTypes(types);
    },
    [],
  );
  const [sizeEnabled, setSizeEnabled] = useState(false);
  const handleSizeEnabledChange = useCallback((enabled: boolean) => {
    setSizeEnabled(!!enabled);
  }, []);
  const [sizeValue, setSizeValue] = useState<number | undefined>(undefined);
  const handleSizeValueChange = useCallback((value: number | undefined) => {
    setSizeValue(value);
  }, []);
  const [maxFileSizeEnabled, setMaxFileSizeEnabled] = useState(false);
  const handleMaxFileSizeEnabledChange = useCallback((enabled: boolean) => {
    setMaxFileSizeEnabled(!!enabled);
  }, []);
  const [maxFileSizeValue, setMaxFileSizeValue] = useState<number | undefined>(
    undefined,
  );
  const handleMaxFileSizeValueChange = useCallback(
    (value: number | undefined) => {
      setMaxFileSizeValue(value);
    },
    [],
  );
  const [minFileSizeEnabled, setMinFileSizeEnabled] = useState(false);
  const handleMinFileSizeEnabledChange = useCallback((enabled: boolean) => {
    setMinFileSizeEnabled(!!enabled);
  }, []);
  const [minFileSizeValue, setMinFileSizeValue] = useState<number | undefined>(
    undefined,
  );
  const handleMinFileSizeValueChange = useCallback(
    (value: number | undefined) => {
      setMinFileSizeValue(value);
    },
    [],
  );
  const [dimensionsEnabled, setDimensionsEnabled] = useState(false);
  const [dimensionsWidth, setDimensionsWidth] = useState<number | undefined>(
    undefined,
  );
  const [dimensionsHeight, setDimensionsHeight] = useState<number | undefined>(
    undefined,
  );
  const [dimensionsMinWidth, setDimensionsMinWidth] = useState<
    number | undefined
  >(undefined);
  const [dimensionsMaxWidth, setDimensionsMaxWidth] = useState<
    number | undefined
  >(undefined);
  const [dimensionsMinHeight, setDimensionsMinHeight] = useState<
    number | undefined
  >(undefined);
  const [dimensionsMaxHeight, setDimensionsMaxHeight] = useState<
    number | undefined
  >(undefined);
  const handleDimensionsEnabledChange = useCallback((enabled: boolean) => {
    setDimensionsEnabled(!!enabled);
  }, []);
  const handleDimensionsPropsChange = useCallback(
    (props: {
      width?: number;
      height?: number;
      minwidth?: number;
      maxwidth?: number;
      minheight?: number;
      maxheight?: number;
    }) => {
      setDimensionsWidth(props.width);
      setDimensionsHeight(props.height);
      setDimensionsMinWidth(props.minwidth);
      setDimensionsMaxWidth(props.maxwidth);
      setDimensionsMinHeight(props.minheight);
      setDimensionsMaxHeight(props.maxheight);
    },
    [],
  );

  const [confirmedEnabled, setConfirmedEnabled] = useState(false);
  const handleConfirmedEnabledChange = useCallback((enabled: boolean) => {
    setConfirmedEnabled(!!enabled);
  }, []);
  const [sameEnabled, setSameEnabled] = useState(false);
  const handleSameEnabledChange = useCallback((enabled: boolean) => {
    setSameEnabled(!!enabled);
  }, []);
  const [sameValue, setSameValue] = useState<string | undefined>(undefined);
  const handleSameValueChange = useCallback((value: string | undefined) => {
    setSameValue(value);
  }, []);
  const [differentEnabled, setDifferentEnabled] = useState(false);
  const handleDifferentEnabledChange = useCallback((enabled: boolean) => {
    setDifferentEnabled(!!enabled);
  }, []);
  const [differentValue, setDifferentValue] = useState<string | undefined>(
    undefined,
  );
  const handleDifferentValueChange = useCallback(
    (value: string | undefined) => {
      setDifferentValue(value);
    },
    [],
  );
  const [uniqueEnabled, setUniqueEnabled] = useState(false);
  const handleUniqueEnabledChange = useCallback((enabled: boolean) => {
    setUniqueEnabled(!!enabled);
  }, []);
  const [startsWithEnabled, setStartsWithEnabled] = useState(false);
  const handleStartsWithEnabledChange = useCallback((enabled: boolean) => {
    setStartsWithEnabled(!!enabled);
  }, []);
  const [startsWithValue, setStartsWithValue] = useState<string | undefined>(
    undefined,
  );
  const handleStartsWithValueChange = useCallback(
    (value: string | undefined) => {
      setStartsWithValue(value);
    },
    [],
  );
  const [jsonEnabled, setJsonEnabled] = useState(false);
  const handleJsonEnabledChange = useCallback((enabled: boolean) => {
    setJsonEnabled(!!enabled);
  }, []);

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
        <RequiredRule
          enabled={requiredEnabled}
          onEnabledChange={handleRequiredEnabledChange}
        />
      </div>
      <div>
        <MinRule
          enabled={minEnabled}
          value={minValue}
          onEnabledChange={handleMinEnabledChange}
          onValueChange={handleMinValueChange}
        />
      </div>
      <div>
        <MaxRule
          enabled={maxEnabled}
          value={maxValue}
          onEnabledChange={handleMaxEnabledChange}
          onValueChange={handleMaxValueChange}
        />
      </div>
      <div>
        <BetweenRule
          enabled={betweenEnabled}
          min={betweenMin}
          max={betweenMax}
          onEnabledChange={handleBetweenEnabledChange}
          onMinChange={handleBetweenMinChange}
          onMaxChange={handleBetweenMaxChange}
        />
      </div>
      <div>
        <EmailRule
          enabled={emailEnabled}
          onEnabledChange={handleEmailEnabledChange}
        />
      </div>
      <div>
        <UrlRule
          enabled={urlEnabled}
          onEnabledChange={handleUrlEnabledChange}
        />
      </div>
      <div>
        <RegexRule
          enabled={regexEnabled}
          pattern={regexPattern}
          onEnabledChange={handleRegexEnabledChange}
          onPatternChange={handleRegexPatternChange}
        />
      </div>
      <div>
        <NumericRule
          enabled={numericEnabled}
          onEnabledChange={handleNumericEnabledChange}
        />
      </div>
      <div>
        <AlphaRule
          enabled={alphaEnabled}
          onEnabledChange={handleAlphaEnabledChange}
        />
      </div>
      <div>
        <AlphaNumericRule
          enabled={alphaNumericEnabled}
          onEnabledChange={handleAlphaNumericEnabledChange}
        />
      </div>
      <div>
        <DateRule
          enabled={dateEnabled}
          onEnabledChange={handleDateEnabledChange}
        />
      </div>
      <div>
        <AfterDateRule
          enabled={afterDateEnabled}
          date={afterDateValue}
          onEnabledChange={handleAfterDateEnabledChange}
          onDateChange={handleAfterDateValueChange}
        />
      </div>
      <div>
        <BeforeDateRule
          enabled={beforeDateEnabled}
          date={beforeDateValue}
          onEnabledChange={handleBeforeDateEnabledChange}
          onDateChange={handleBeforeDateValueChange}
        />
      </div>
      <div>
        <FileRule
          enabled={fileEnabled}
          types={fileTypes}
          size={fileSize}
          maxSize={fileMaxSize}
          minSize={fileMinSize}
          onEnabledChange={handleFileEnabledChange}
          onPropsChange={handleFilePropsChange}
        />
      </div>
      <div>
        <ImageRule
          enabled={imageEnabled}
          minWidth={imageMinWidth}
          maxWidth={imageMaxWidth}
          minHeight={imageMinHeight}
          maxHeight={imageMaxHeight}
          width={imageWidth}
          height={imageHeight}
          onEnabledChange={handleImageEnabledChange}
          onPropsChange={handleImagePropsChange}
        />
      </div>
      <div>
        <MimesRule
          enabled={mimesEnabled}
          types={mimesTypes}
          onEnabledChange={handleMimesEnabledChange}
          onTypesChange={handleMimesTypesChange}
        />
      </div>
      <div>
        <InRule
          enabled={inEnabled}
          values={inValues}
          onEnabledChange={handleInEnabledChange}
          onValuesChange={handleInValuesChange}
        />
      </div>
      <div>
        <IntegerRule
          enabled={integerEnabled}
          onEnabledChange={handleIntegerEnabledChange}
        />
      </div>
      <div>
        <AlphaDashRule
          enabled={alphaDashEnabled}
          onEnabledChange={handleAlphaDashEnabledChange}
        />
      </div>
      <div>
        <NotInRule
          enabled={notInEnabled}
          values={notInValues}
          onEnabledChange={handleNotInEnabledChange}
          onValuesChange={handleNotInValuesChange}
        />
      </div>
      <div>
        <DateFormatRule
          enabled={dateFormatEnabled}
          format={dateFormatValue}
          onEnabledChange={handleDateFormatEnabledChange}
          onFormatChange={handleDateFormatValueChange}
        />
      </div>
      <div>
        <BeforeOrEqualRule
          enabled={beforeOrEqualEnabled}
          date={beforeOrEqualValue}
          onEnabledChange={handleBeforeOrEqualEnabledChange}
          onDateChange={handleBeforeOrEqualValueChange}
        />
      </div>
      <div>
        <AfterOrEqualRule
          enabled={afterOrEqualEnabled}
          date={afterOrEqualValue}
          onEnabledChange={handleAfterOrEqualEnabledChange}
          onDateChange={handleAfterOrEqualValueChange}
        />
      </div>
      <div>
        <MimeTypesRule
          enabled={mimeTypesEnabled}
          types={mimeTypesTypes}
          onEnabledChange={handleMimeTypesEnabledChange}
          onTypesChange={handleMimeTypesTypesChange}
        />
      </div>
      <div>
        <SizeRule
          enabled={sizeEnabled}
          size={sizeValue}
          onEnabledChange={handleSizeEnabledChange}
          onSizeChange={handleSizeValueChange}
        />
      </div>
      <div>
        <MaxFileSizeRule
          enabled={maxFileSizeEnabled}
          maxsize={maxFileSizeValue}
          onEnabledChange={handleMaxFileSizeEnabledChange}
          onMaxSizeChange={handleMaxFileSizeValueChange}
        />
      </div>
      <div>
        <MinFileSizeRule
          enabled={minFileSizeEnabled}
          minsize={minFileSizeValue}
          onEnabledChange={handleMinFileSizeEnabledChange}
          onMinSizeChange={handleMinFileSizeValueChange}
        />
      </div>
      <div>
        <DimensionsRule
          enabled={dimensionsEnabled}
          width={dimensionsWidth}
          height={dimensionsHeight}
          minwidth={dimensionsMinWidth}
          maxwidth={dimensionsMaxWidth}
          minheight={dimensionsMinHeight}
          maxheight={dimensionsMaxHeight}
          onEnabledChange={handleDimensionsEnabledChange}
          onDimensionsChange={handleDimensionsPropsChange}
        />
      </div>
      <div>
        <ConfirmedRule
          enabled={confirmedEnabled}
          onEnabledChange={handleConfirmedEnabledChange}
        />
      </div>
      <div>
        <SameRule
          enabled={sameEnabled}
          field={sameValue}
          onEnabledChange={handleSameEnabledChange}
          onFieldChange={handleSameValueChange}
        />
      </div>
      <div>
        <DifferentRule
          enabled={differentEnabled}
          field={differentValue}
          onEnabledChange={handleDifferentEnabledChange}
          onFieldChange={handleDifferentValueChange}
        />
      </div>
      <div>
        <UniqueRule
          enabled={uniqueEnabled}
          onEnabledChange={handleUniqueEnabledChange}
        />
      </div>
      <div>
        <StartsWithRule
          enabled={startsWithEnabled}
          values={startsWithValue}
          onEnabledChange={handleStartsWithEnabledChange}
          onValuesChange={handleStartsWithValueChange}
        />
      </div>
      <div>
        <JSONRule
          enabled={jsonEnabled}
          onEnabledChange={handleJsonEnabledChange}
        />
      </div>
    </ManageLayout>
  );
};

export default InputRulesPage;
