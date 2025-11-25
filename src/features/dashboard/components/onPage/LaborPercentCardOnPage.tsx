import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useDailyDspr } from '@/features/DSPR/hooks/useDailyDspr';
import { useWeeklyDspr } from '@/features/DSPR/hooks/useWeeklyDspr';
import { useDailyDsprByDate } from '@/features/DSPR/hooks/useDailyDsprByDate';
import { useDsprApi } from '@/features/DSPR/hooks/useDsprApi';
import type { ApiDate } from '@/features/DSPR/types/dspr.common';
import { UsersIcon } from '@heroicons/react/24/outline';

export interface LaborPercentCardOnPageProps {
  title?: string;
  Icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  iconColorClass?: string;
  iconBgClass?: string;
  className?: string;
  hover?: boolean;
}

const formatPercent = (value: number | null | undefined) => {
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

export const LaborPercentCardOnPage: React.FC<LaborPercentCardOnPageProps> = ({
  title = 'Labor Percentage',
  Icon = UsersIcon,
  iconColorClass = 'text-primary',
  iconBgClass = 'bg-primary-50 dark:bg-primary-900',
  className,
  hover = true,
}) => {
  const { financial } = useDailyDspr();
  const { operational: weeklyOperational } = useWeeklyDspr();
  const { getEntryForDate } = useDailyDsprByDate();
  const { currentDate, isLoading, error } = useDsprApi();

  const weeklyLabor = weeklyOperational?.laborPercent ?? null;
  const dailyLabor = financial?.laborCostPercentage ?? null;
  const selectedDate = currentDate as ApiDate | undefined;
  const prevWeekLabor = selectedDate
    ? (getEntryForDate(selectedDate)?.prevWeek?.labor ?? null)
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
              <span className="text-primary-500 text-lg font-semibold">Daily</span>
              <span className="text-card-foreground text-lg md:text-xl font-semibold">
                {formatPercent(dailyLabor)}
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
          <div className="text-sm text-red-600">{error?.message}</div>
        ) : (
          <div className="flex flex-col gap-2 mt-6">
            <div className="w-full overflow-x-auto">
              <div className="grid grid-cols-2 gap-x-6 sm:gap-x-8 md:gap-x-10 w-full">
                <span className="text-primary-500 text-xs text-start">
                  Weekly
                </span>
                <span className="text-chart-4 text-xs text-end">Prev Week</span>
              </div>
            </div>
            <div className="w-full overflow-x-auto">
              <div className="grid grid-cols-2 gap-x-6 sm:gap-x-8 md:gap-x-10 w-full">
                <span className="text-muted-foreground text-base font-medium text-start">
                  {formatPercent(weeklyLabor)}
                </span>
                <span className="text-muted-foreground text-base font-medium text-end">
                  {formatPercent(prevWeekLabor)}
                </span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default LaborPercentCardOnPage;
