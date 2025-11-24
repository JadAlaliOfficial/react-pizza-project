import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useDSPRMetrics } from '@/features/DSPR/hooks/useDSPRDailyWeekly';
import type { ApiDate } from '@/features/DSPR/types/common';
import { CurrencyDollarIcon } from '@heroicons/react/24/outline';

/**
 * Props for SalesDataCardOnPage component
 * @property {string} [title] Optional card title. Defaults to "Total Sales".
 * @property {React.ComponentType<React.SVGProps<SVGSVGElement>>} [Icon] Optional icon component. Defaults to CurrencyDollarIcon.
 * @property {string} [iconColorClass] Tailwind classes for icon color. Defaults to `text-primary`.
 * @property {string} [iconBgClass] Tailwind classes for icon background. Defaults to `bg-primary-50`.
 * @property {string} [className] Optional additional classes applied to the Card root.
 * @property {boolean} [hover] Enable hover elevation effect. Defaults to true.
 */
export interface SalesDataCardOnPageProps {
  title?: string;
  Icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  iconColorClass?: string;
  iconBgClass?: string;
  className?: string;
  hover?: boolean;
}

const formatCurrency = (value: number | null | undefined) => {
  if (value === null || value === undefined || Number.isNaN(value)) return '—';
  try {
    return new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);
  } catch {
    return `${value}`;
  }
};

export const SalesDataCardOnPage: React.FC<SalesDataCardOnPageProps> = ({
  title = 'Total Sales',
  Icon = CurrencyDollarIcon,
  iconColorClass = 'text-primary',
  iconBgClass = 'bg-primary-50 dark:bg-primary-900',
  className,
  hover = true,
}) => {
  const {
    financialMetrics,
    processedData,
    isLoading,
    error,
    getPrevWeekComparisonForDate,
  } = useDSPRMetrics();

  const weeklyTotal = processedData?.weekly?.financial?.totalSales ?? null;
  const dailyTotal = financialMetrics?.totalSales ?? null;
  const selectedDate = processedData?.date as ApiDate | undefined;
  const prevWeekTotal = selectedDate
    ? getPrevWeekComparisonForDate(selectedDate)?.prevWeek?.Total_Sales ?? null
    : null;

  return (
    <Card
      className={cn(
        'relative overflow-hidden p-6 w-full',
        'shadow-lg border-0 border-b-2  border-primary-400',
        hover ? 'transition-all hover:border-b-4' : '',
        className,
      )}
    >
      <div className="flex w-full items-center justify-between">
        <div className="relative flex items-center justify-between w-full gap-2">
          <div className={cn('rounded-md p-2', iconBgClass)}>
            <Icon className={cn('h-6 w-6', iconColorClass)} aria-hidden="true" />
          </div>
          <div className="text-primary-500 text-sm md:text-base font-medium">
            {title}
          </div>
        </div>
      </div>

      <CardContent className="p-0">
        {isLoading ? (
          <div className="animate-pulse space-y-3">
            <div className="h-5 w-32 bg-primary-50 rounded" />
            <div className="h-8 w-48 bg-primary-50 rounded" />
            <div className="h-6 w-44 bg-primary-50 rounded" />
            <div className="h-6 w-56 bg-primary-50 rounded" />
          </div>
        ) : error ? (
          <div className="text-sm text-red-600">
            {error}
          </div>
        ) : (
          <div className="flex flex-col gap-4 mt-4">
            <div className="w-full overflow-x-auto">
              <div className="grid grid-cols-3 gap-x-6 sm:gap-x-8 md:gap-x-10 w-full">
                <span className="text-primary-500 text-xs text-start">Weekly</span>
                <span className="text-primary-500 text-base font-semibold text-center">Daily</span>
                <span className="text-primary-500 text-xs text-end">Prev Week</span>
              </div>
            </div>
            <div className="w-full overflow-x-auto">
              <div className="grid grid-cols-3 gap-x-6 sm:gap-x-8 md:gap-x-10 w-full">
                <span className="text-muted-foreground text-base font-medium text-start">
                  {formatCurrency(weeklyTotal)}
                </span>
                <span className="text-card-foreground text-lg md:text-xl font-semibold text-center">
                  {formatCurrency(dailyTotal)}
                </span>
                <span className="text-muted-foreground text-base font-medium text-end">
                  {formatCurrency(prevWeekTotal)}
                </span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SalesDataCardOnPage;