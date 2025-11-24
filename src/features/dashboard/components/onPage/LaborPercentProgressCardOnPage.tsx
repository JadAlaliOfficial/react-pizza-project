import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { useDSPRMetrics } from '@/features/DSPR/hooks/useDSPRDailyWeekly';
import type { ApiDate } from '@/features/DSPR/types/common';
import { UsersIcon } from '@heroicons/react/24/outline';

export interface LaborPercentProgressCardOnPageProps {
  title?: string;
  Icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  iconColorClass?: string;
  iconBgClass?: string;
  className?: string;
  hover?: boolean;
}

const formatPercentText = (value: number | null | undefined) => {
  if (value === null || value === undefined || Number.isNaN(value)) return '—';
  try {
    return new Intl.NumberFormat(undefined, {
      style: 'percent',
      maximumFractionDigits: 1,
    }).format(value);
  } catch {
    return `${(value * 100).toFixed(1)}%`;
  }
};

const toProgressValue = (value: number | null | undefined) => {
  if (value === null || value === undefined || Number.isNaN(value)) return 0;
  const v = value * 100;
  if (Number.isNaN(v)) return 0;
  return Math.max(0, Math.min(100, v));
};

export const LaborPercentProgressCardOnPage: React.FC<
  LaborPercentProgressCardOnPageProps
> = ({
  title = 'Labor Percentage',
  Icon = UsersIcon,
  iconColorClass = 'text-dashboard-green-500',
  iconBgClass = 'bg-dashboard-green-50 dark:bg-dashboard-green-900',
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

  const weeklyLabor =
    processedData?.weekly?.financial?.laborCostPercentage ?? null;
  const dailyLabor = financialMetrics?.laborCostPercentage ?? null;
  const selectedDate = processedData?.date as ApiDate | undefined;
  const prevWeekLabor = selectedDate
    ? (getPrevWeekComparisonForDate(selectedDate)?.prevWeek?.labor ?? null)
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
        <div className="flex flex-col items-center gap-1">
          {isLoading ? (
            <div className="h-6 w-20 bg-primary-50 rounded animate-pulse" />
          ) : error ? null : (
            <>
              <span className="text-dashboard-green text-lg font-semibold">Daily</span>
              <span className="text-card-foreground text-lg md:text-xl font-semibold">
                {formatPercentText(dailyLabor)}
              </span>
            </>
          )}
        </div>
        <div className="relative flex flex-col items-center gap-2">
          <div className={cn('rounded-md p-2', iconBgClass)}>
            <Icon
              className={cn('h-6 w-6', iconColorClass)}
              aria-hidden="true"
            />
          </div>
          <div className="text-dashboard-green text-sm md:text-base font-medium">
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
          <div className="text-sm text-red-600">{error}</div>
        ) : (
          <div className="flex flex-col gap-3 mt-6">
            <div className="w-full">
              <div className="grid grid-cols-2 gap-x-6 sm:gap-x-8 md:gap-x-10 w-full">
                <span className="text-dashboard-green text-xs text-start">
                  Weekly
                </span>
                <span className="text-chart-4 text-xs text-end">Prev Week</span>
              </div>
            </div>

            <div className="w-full">
              <div className="grid grid-cols-2 gap-x-6 sm:gap-x-8 md:gap-x-10 w-full items-center">
                <div className="flex flex-col gap-1">
                  <span className="text-dashboard-green text-sm font-medium text-start">
                    {formatPercentText(weeklyLabor)}
                  </span>
                  <Progress
                    value={toProgressValue(weeklyLabor)}
                    className="h-3 md:h-4 bg-primary/30 ring-1 ring-primary/40"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-chart-4 text-sm font-medium text-end">
                    {formatPercentText(prevWeekLabor)}
                  </span>
                  <Progress
                    value={toProgressValue(prevWeekLabor)}
                    className="h-3 md:h-4 bg-primary/30 ring-1 ring-primary/40"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default LaborPercentProgressCardOnPage;
