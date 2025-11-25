import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useDailyDsprByDate } from '@/features/DSPR/hooks/useDailyDsprByDate';
import { useDsprApi } from '@/features/DSPR/hooks/useDsprApi';
import { BarChart } from '@mui/x-charts/BarChart';
import { useIsMobile } from '@/hooks/use-mobile';
import { format, parseISO } from 'date-fns';

// Displays daily total sales as a responsive bar chart.
// Utilizes DSPR data hooks for metrics and adjusts width via ResizeObserver.
// Shows current day values with optional previous week comparison per date.
interface TotalSalesBarChartOnPageProps {
  title?: string;
  className?: string;
}

const TotalSalesBarChartOnPage: React.FC<TotalSalesBarChartOnPageProps> = ({ title = 'Total Sales by Date', className }) => {
  // Source of DSPR metrics and loading/error state
  const { timeline } = useDailyDsprByDate();
  const { isLoading, error, filteringValues, currentDate } = useDsprApi();
//   console.log(buildMetricSeriesFromDailyMap);
  const isMobile = useIsMobile();
  // Track chart container width to render an appropriately sized chart
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [width, setWidth] = useState<number>(800);

  // Observe container size changes to keep chart width in sync with layout
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const obs = new ResizeObserver((entries: ResizeObserverEntry[]) => {
      const w = entries[0]?.contentRect?.width || 800;
      // Clamp to a reasonable minimum for narrow screens
      setWidth(Math.max(320, Math.floor(w)));
    });
    obs.observe(el);
    return () => {
      obs.disconnect();
    };
  }, []);

  useEffect(() => {
  }, [isLoading, error]);

  // Build chart series from timeline metrics
  const seriesData = useMemo(() => {
    if (!timeline) {
      return { labels: [], currentValuesNum: [], prevValuesNum: [], hasPrev: false, hasCurrent: false };
    }
    const labels = timeline.dates;
    const currentValuesNum = (timeline.sales || []).map(v => Number(v || 0));
    const prevValuesNum = (timeline.prevWeekSales || []).map(v => Number(v || 0));
    const hasPrev = prevValuesNum.some(v => v !== 0);
    const hasCurrent = currentValuesNum.some(v => v !== 0);
    return { labels, currentValuesNum, prevValuesNum, hasPrev, hasCurrent };
  }, [timeline]);

  // True when neither current nor previous week values exist
  const empty = useMemo(() => !seriesData.hasCurrent && !seriesData.hasPrev, [seriesData]);

  const parseDateString = (value: string) => {
    try {
      const d = parseISO(value);
      if (!isNaN(d.getTime())) return d;
    } catch {}
    const parts = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (parts) {
      const [, y, m, d] = parts;
      return new Date(Number(y), Number(m) - 1, Number(d));
    }
    const fallback = new Date(value);
    return isNaN(fallback.getTime()) ? new Date() : fallback;
  };

  const formatTickLabel = (value: string) => {
    const d = parseDateString(value);
    const top = format(d, 'EEE');
    const bottom = format(d, 'd MMM');
    return `${top}\n${bottom}`;
  };

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base sm:text-lg">{title}</CardTitle>
        {(filteringValues?.date || currentDate) && (
          <span className="text-xs sm:text-sm text-muted-foreground">
            {filteringValues?.date || currentDate}
          </span>
        )}
      </CardHeader>
      <CardContent>
        <div ref={containerRef} className="w-full">
          {/* Loading state */}
          {isLoading ? (
            <div className="flex items-center justify-center h-48">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
            </div>
          ) : error ? (
            // Error message from data hook
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center text-red-700">
              {error?.message}
            </div>
          ) : empty ? (
            // No data state
            <div className="text-muted-foreground text-sm p-4">No sales data available.</div>
          ) : (
            // Bar chart with current vs previous week series per date
            <BarChart
              width={width}
              height={isMobile ? 260 : 360}
              xAxis={[{ data: seriesData.labels, scaleType: 'band', valueFormatter: (v: string) => formatTickLabel(v) }]}
              series={[
                { data: seriesData.currentValuesNum, label: 'Current', color: 'var(--chart-1)' },
                ...(seriesData.hasPrev ? [{ data: seriesData.prevValuesNum, label: 'Prev Week', color: 'var(--chart-2)' }] : [])
              ]}
              // Add generous margins for axis labels and legend spacing
              margin={{ top: 20, right: 20, bottom: 50, left: 50 }}
            />
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default TotalSalesBarChartOnPage;
