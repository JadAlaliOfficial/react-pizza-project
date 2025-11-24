import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useDSPRMetrics } from '@/features/DSPR/hooks/useDSPRDailyWeekly';
import { BarChart } from '@mui/x-charts/BarChart';
import { useIsMobile } from '@/hooks/use-mobile';

// Displays daily total sales as a responsive bar chart.
// Utilizes DSPR data hooks for metrics and adjusts width via ResizeObserver.
// Shows current day values with optional previous week comparison per date.
interface TotalSalesBarChartOnPageProps {
  title?: string;
  className?: string;
}

const TotalSalesBarChartOnPage: React.FC<TotalSalesBarChartOnPageProps> = ({ title = 'Total Sales by Date', className }) => {
  // Source of DSPR metrics and loading/error state
  const { isLoading, error, buildMetricSeriesFromDailyMap } = useDSPRMetrics();
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

  // Build chart series from DSPR daily map, preserving label order by date
  const seriesData = useMemo(() => {
    const points = buildMetricSeriesFromDailyMap('Total_Sales');
    const sorted = [...points].sort((a, b) => a.date.localeCompare(b.date));
    const labels = sorted.map(p => p.date);
    // Keep nulls to detect absence of values, convert to numbers for chart
    const currentValues = sorted.map(p => (p.value == null ? null : Number(p.value)));
    const prevValues = sorted.map(p => (p.prevWeekValue == null ? null : Number(p.prevWeekValue)));
    const currentValuesNum = currentValues.map(v => v ?? 0);
    const prevValuesNum = prevValues.map(v => v ?? 0);
    const hasPrev = prevValues.some(v => v !== null);
    return { labels, currentValuesNum, prevValuesNum, hasPrev, hasCurrent: currentValues.some(v => v !== null) };
  }, [buildMetricSeriesFromDailyMap]);

  // True when neither current nor previous week values exist
  const empty = useMemo(() => !seriesData.hasCurrent && !seriesData.hasPrev, [seriesData]);

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-base sm:text-lg">{title}</CardTitle>
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
              {error}
            </div>
          ) : empty ? (
            // No data state
            <div className="text-muted-foreground text-sm p-4">No sales data available.</div>
          ) : (
            // Bar chart with current vs previous week series per date
            <BarChart
              width={width}
              height={isMobile ? 260 : 360}
              xAxis={[{ data: seriesData.labels, scaleType: 'band' }]}
              series={[
                { data: seriesData.currentValuesNum, label: 'Current', color: 'var(--chart-1)' },
                ...(seriesData.hasPrev ? [{ data: seriesData.prevValuesNum, label: 'Prev Week', color: 'var(--chart-2)' }] : [])
              ]}
              // Add generous margins for axis labels and legend spacing
              margin={{ top: 20, right: 20, bottom: 40, left: 50 }}
            />
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default TotalSalesBarChartOnPage;