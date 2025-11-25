/**
 * ============================================================================
 * USE WEEKLY PREVIOUS DSPR HOOK
 * ============================================================================
 * Domain: Weekly DSPR (Previous Week Aggregate)
 * 
 * Responsibility:
 * - React hook for consuming weekly previous DSPR Redux state
 * - Provides simple interface for accessing previous week baseline metrics
 * - Exposes week-over-week comparison with current week
 * - Provides multi-metric trend analysis with insights
 * - Handles configuration methods for comparison thresholds
 * - Automatic data derivation from central DSPR API
 * 
 * Related Files:
 * - State: state/dsprWeeklyPrevSlice.ts (Redux slice)
 * - Types: types/dspr.weeklyPrev.ts (weekly previous types)
 * - Central API: state/dsprApiSlice.ts (data source)
 * 
 * Usage:
 * ```
 * function ComparisonDashboard() {
 *   const {
 *     processed,
 *     comparison,
 *     trendAnalysis,
 *     hasData,
 *     hasComparison,
 *     overallTrend,
 *     improvedCount,
 *     declinedCount,
 *   } = useWeeklyPrevDspr();
 * 
 *   if (!hasData) return <NoData />;
 * 
 *   return (
 *     <div>
 *       <PreviousWeekSummary data={processed} />
 *       {hasComparison && (
 *         <>
 *           <ComparisonChart comparison={comparison} />
 *           <TrendInsights trends={trendAnalysis} />
 *         </>
 *       )}
 *     </div>
 *   );
 * }
 * ```
 */

import { useCallback, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  selectRawPrevWeekDspr,
  selectRawCurrentWeekDspr,
  selectProcessedPrevWeekDspr,
  selectWeekOverWeekComparison,
  selectTrendAnalysis,
  selectPrevWeekFinancial,
  selectPrevWeekOperational,
  selectPrevWeekQuality,
  selectPrevWeekSalesChannels,
  selectPrevWeekCostControl,
  selectPrevWeekGrade,
  selectPrevWeekConfig,
  selectLastProcessedTime,
  selectPrevWeekStore,
  selectPrevWeekNumber,
  selectPrevWeekStartDate,
  selectPrevWeekEndDate,
  selectHasPrevWeekDspr,
  selectHasComparison,
  selectPrevWeekTotalSales,
  selectPrevWeekLaborPercent,
  selectPrevWeekWastePercent,
  selectPrevWeekDigitalPercent,
  selectPrevWeekCustomerService,
  selectOverallTrend,
  selectImprovedCount,
  selectDeclinedCount,
  selectIsActionRecommended,
  setComparisonThresholds as setComparisonThresholdsAction,
  setOperatingDays as setOperatingDaysAction,
  resetConfig as resetConfigAction,
  clearWeeklyPrevData as clearDataAction,
} from '../store/dsprWeeklyPrevSlice';
import {
  type PrevWeekDSPRData,
  type ProcessedPrevWeekDSPR,
  type PrevWeekFinancialSummary,
  type PrevWeekOperationalSummary,
  type PrevWeekQualitySummary,
  type PrevWeekSalesChannelSummary,
  type PrevWeekCostControlSummary,
  type WeekOverWeekComparison,
  type MultiMetricTrendAnalysis,
  type MetricComparison,
  type TrendAnalysis,
  ComparisonDirection,
  PerformanceGrade,
  type PrevWeekDSPRConfig,
  type ComparisonThresholds,
} from '../types/dspr.weeklyPrev';
import type { StoreId, ApiDate, WeekNumber } from '../types/dspr.common';

// ============================================================================
// HOOK RETURN TYPE
// ============================================================================

/**
 * Return type for useWeeklyPrevDspr hook
 */
export interface UseWeeklyPrevDsprReturn {
  // ========================================================================
  // DATA
  // ========================================================================
  
  /** Raw previous week DSPR data from API */
  raw: PrevWeekDSPRData | null;
  
  /** Raw current week DSPR data (for comparison) */
  rawCurrent: PrevWeekDSPRData | null;
  
  /** Processed previous week DSPR with summaries */
  processed: ProcessedPrevWeekDSPR | null;
  
  /** Week-over-week comparison */
  comparison: WeekOverWeekComparison | null;
  
  /** Multi-metric trend analysis */
  trendAnalysis: MultiMetricTrendAnalysis | null;
  
  /** Previous week financial summary */
  financial: PrevWeekFinancialSummary | null;
  
  /** Previous week operational summary */
  operational: PrevWeekOperationalSummary | null;
  
  /** Previous week quality summary */
  quality: PrevWeekQualitySummary | null;
  
  /** Previous week sales channel summary */
  salesChannels: PrevWeekSalesChannelSummary | null;
  
  /** Previous week cost control summary */
  costControl: PrevWeekCostControlSummary | null;
  
  // ========================================================================
  // METRICS
  // ========================================================================
  
  /** Previous week performance grade */
  grade: PerformanceGrade | null;
  
  /** Previous week total sales ($) */
  totalSales: number;
  
  /** Previous week labor percentage (0-1) */
  laborPercent: number;
  
  /** Previous week waste percentage (0-1) */
  wastePercent: number;
  
  /** Previous week digital sales percentage (0-1) */
  digitalPercent: number;
  
  /** Previous week customer service score (0-1) */
  customerService: number;
  
  /** Overall trend direction */
  overallTrend: ComparisonDirection | null;
  
  /** Number of improved metrics */
  improvedCount: number;
  
  /** Number of declined metrics */
  declinedCount: number;
  
  /** Whether action is recommended */
  isActionRecommended: boolean;
  
  // ========================================================================
  // STATE
  // ========================================================================
  
  /** Whether previous week DSPR data exists */
  hasData: boolean;
  
  /** Whether comparison data exists */
  hasComparison: boolean;
  
  /** Store ID */
  store: StoreId | null;
  
  /** Previous week number (1-52) */
  week: WeekNumber | null;
  
  /** Previous week start date */
  weekStartDate: ApiDate | null;
  
  /** Previous week end date */
  weekEndDate: ApiDate | null;
  
  /** Last processed timestamp */
  lastProcessed: string | null;
  
  // ========================================================================
  // CONFIGURATION
  // ========================================================================
  
  /** Current configuration */
  config: PrevWeekDSPRConfig;
  
  // ========================================================================
  // ACTIONS
  // ========================================================================
  
  /**
   * Updates comparison thresholds
   * @param thresholds - Partial thresholds to update
   */
  setComparisonThresholds: (thresholds: Partial<ComparisonThresholds>) => void;
  
  /**
   * Sets operating days per week
   * @param days - Number of operating days (typically 7)
   */
  setOperatingDays: (days: number) => void;
  
  /**
   * Resets configuration to defaults
   */
  resetConfig: () => void;
  
  /**
   * Clears all weekly previous DSPR data
   */
  clearData: () => void;
}

// ============================================================================
// HOOK
// ============================================================================

/**
 * Custom hook for accessing and managing weekly previous DSPR data
 * 
 * Provides a simple interface for consuming previous week store performance
 * report metrics, week-over-week comparisons, and multi-metric trend analysis.
 * Data is automatically derived from the central DSPR API response.
 * 
 * @returns Object with data, metrics, state, and action methods
 * 
 * @example
 * ```
 * function Dashboard() {
 *   const {
 *     processed,
 *     comparison,
 *     trendAnalysis,
 *     hasData,
 *     hasComparison,
 *     overallTrend,
 *   } = useWeeklyPrevDspr();
 * 
 *   if (!hasData) return <NoData />;
 * 
 *   return (
 *     <div>
 *       <PrevWeekHeader 
 *         week={processed.week}
 *         grade={processed.grade}
 *       />
 *       {hasComparison && (
 *         <>
 *           <TrendOverview trend={overallTrend} />
 *           <MetricComparisons comparison={comparison} />
 *           <TrendAnalysisPanel trends={trendAnalysis} />
 *         </>
 *       )}
 *     </div>
 *   );
 * }
 * ```
 */
export function useWeeklyPrevDspr(): UseWeeklyPrevDsprReturn {
  const dispatch = useAppDispatch();
  
  // ========================================================================
  // SELECTORS
  // ========================================================================
  
  const raw = useAppSelector(selectRawPrevWeekDspr);
  const rawCurrent = useAppSelector(selectRawCurrentWeekDspr);
  const processed = useAppSelector(selectProcessedPrevWeekDspr);
  const comparison = useAppSelector(selectWeekOverWeekComparison);
  const trendAnalysis = useAppSelector(selectTrendAnalysis);
  const financial = useAppSelector(selectPrevWeekFinancial);
  const operational = useAppSelector(selectPrevWeekOperational);
  const quality = useAppSelector(selectPrevWeekQuality);
  const salesChannels = useAppSelector(selectPrevWeekSalesChannels);
  const costControl = useAppSelector(selectPrevWeekCostControl);
  const grade = useAppSelector(selectPrevWeekGrade);
  const config = useAppSelector(selectPrevWeekConfig);
  const lastProcessed = useAppSelector(selectLastProcessedTime);
  const store = useAppSelector(selectPrevWeekStore);
  const week = useAppSelector(selectPrevWeekNumber);
  const weekStartDate = useAppSelector(selectPrevWeekStartDate);
  const weekEndDate = useAppSelector(selectPrevWeekEndDate);
  const hasData = useAppSelector(selectHasPrevWeekDspr);
  const hasComparison = useAppSelector(selectHasComparison);
  const totalSales = useAppSelector(selectPrevWeekTotalSales);
  const laborPercent = useAppSelector(selectPrevWeekLaborPercent);
  const wastePercent = useAppSelector(selectPrevWeekWastePercent);
  const digitalPercent = useAppSelector(selectPrevWeekDigitalPercent);
  const customerService = useAppSelector(selectPrevWeekCustomerService);
  const overallTrend = useAppSelector(selectOverallTrend);
  const improvedCount = useAppSelector(selectImprovedCount);
  const declinedCount = useAppSelector(selectDeclinedCount);
  const isActionRecommended = useAppSelector(selectIsActionRecommended);
  
  // ========================================================================
  // ACTIONS
  // ========================================================================
  
  /**
   * Updates comparison thresholds
   */
  const setComparisonThresholds = useCallback(
    (thresholds: Partial<ComparisonThresholds>) => {
      dispatch(setComparisonThresholdsAction(thresholds));
      
      if (process.env.NODE_ENV === 'development') {
        console.log('[useWeeklyPrevDspr] Comparison thresholds updated:', thresholds);
      }
    },
    [dispatch]
  );
  
  /**
   * Sets operating days per week
   */
  const setOperatingDays = useCallback(
    (days: number) => {
      dispatch(setOperatingDaysAction(days));
      
      if (process.env.NODE_ENV === 'development') {
        console.log('[useWeeklyPrevDspr] Operating days updated:', days);
      }
    },
    [dispatch]
  );
  
  /**
   * Resets configuration to defaults
   */
  const resetConfig = useCallback(() => {
    dispatch(resetConfigAction());
    
    if (process.env.NODE_ENV === 'development') {
      console.log('[useWeeklyPrevDspr] Configuration reset to defaults');
    }
  }, [dispatch]);
  
  /**
   * Clears all weekly previous DSPR data
   */
  const clearData = useCallback(() => {
    dispatch(clearDataAction());
    
    if (process.env.NODE_ENV === 'development') {
      console.log('[useWeeklyPrevDspr] Data cleared');
    }
  }, [dispatch]);
  
  // ========================================================================
  // RETURN
  // ========================================================================
  
  return {
    // Data
    raw,
    rawCurrent,
    processed,
    comparison,
    trendAnalysis,
    financial,
    operational,
    quality,
    salesChannels,
    costControl,
    
    // Metrics
    grade,
    totalSales,
    laborPercent,
    wastePercent,
    digitalPercent,
    customerService,
    overallTrend,
    improvedCount,
    declinedCount,
    isActionRecommended,
    
    // State
    hasData,
    hasComparison,
    store,
    week,
    weekStartDate,
    weekEndDate,
    lastProcessed,
    
    // Configuration
    config,
    
    // Actions
    setComparisonThresholds,
    setOperatingDays,
    resetConfig,
    clearData,
  };
}

// ============================================================================
// CONVENIENCE HOOKS
// ============================================================================

/**
 * Hook for checking if previous week DSPR data is available
 * 
 * @returns Boolean indicating if data exists
 * 
 * @example
 * ```
 * const hasData = useHasPrevWeekDspr();
 * if (!hasData) return <LoadingState />;
 * ```
 */
export function useHasPrevWeekDspr(): boolean {
  return useAppSelector(selectHasPrevWeekDspr);
}

/**
 * Hook for checking if comparison data is available
 * 
 * @returns Boolean indicating if comparison exists
 * 
 * @example
 * ```
 * const hasComparison = useHasComparison();
 * if (hasComparison) return <ComparisonView />;
 * ```
 */
export function useHasComparison(): boolean {
  return useAppSelector(selectHasComparison);
}

/**
 * Hook for accessing only week-over-week comparison
 * 
 * @returns Week-over-week comparison or null
 * 
 * @example
 * ```
 * const comparison = useWoWComparison();
 * return <ComparisonChart data={comparison} />;
 * ```
 */
export function useWoWComparison(): WeekOverWeekComparison | null {
  return useAppSelector(selectWeekOverWeekComparison);
}

/**
 * Hook for accessing only trend analysis
 * 
 * @returns Multi-metric trend analysis or null
 * 
 * @example
 * ```
 * const trends = useTrendAnalysis();
 * return <TrendDashboard trends={trends} />;
 * ```
 */
export function useTrendAnalysis(): MultiMetricTrendAnalysis | null {
  return useAppSelector(selectTrendAnalysis);
}

/**
 * Hook for accessing specific metric comparison
 * 
 * @param metric - Metric name to get comparison for
 * @returns Metric comparison or null
 * 
 * @example
 * ```
 * const salesComparison = useMetricComparison('sales');
 * return <MetricCard comparison={salesComparison} />;
 * ```
 */
export function useMetricComparison(metric: string): MetricComparison | null {
  const comparison = useAppSelector(selectWeekOverWeekComparison);
  
  return useMemo(() => {
    if (!comparison) return null;
    
    switch (metric) {
      case 'sales':
        return comparison.sales;
      case 'customerCount':
        return comparison.customerCount;
      case 'averageTicket':
        return comparison.averageTicket;
      case 'laborPercent':
        return comparison.laborPercent;
      case 'wastePercent':
        return comparison.wastePercent;
      case 'digitalPercent':
        return comparison.digitalPercent;
      case 'customerService':
        return comparison.customerService;
      case 'portalOnTime':
        return comparison.portalOnTime;
      default:
        return null;
    }
  }, [comparison, metric]);
}

/**
 * Hook for accessing specific trend analysis
 * 
 * @param category - Trend category to get analysis for
 * @returns Trend analysis or null
 * 
 * @example
 * ```
 * const salesTrend = useSpecificTrend('sales');
 * return <TrendCard trend={salesTrend} />;
 * ```
 */
export function useSpecificTrend(category: string): TrendAnalysis | null {
  const trendAnalysis = useAppSelector(selectTrendAnalysis);
  
  return useMemo(() => {
    if (!trendAnalysis) return null;
    
    switch (category) {
      case 'sales':
        return trendAnalysis.sales;
      case 'customer':
        return trendAnalysis.customer;
      case 'operationalEfficiency':
        return trendAnalysis.operationalEfficiency;
      case 'quality':
        return trendAnalysis.quality;
      case 'digitalAdoption':
        return trendAnalysis.digitalAdoption;
      case 'overallHealth':
        return trendAnalysis.overallHealth;
      default:
        return null;
    }
  }, [trendAnalysis, category]);
}

/**
 * Hook for getting all improved metrics
 * 
 * @returns Array of improved metric comparisons
 * 
 * @example
 * ```
 * const improved = useImprovedMetrics();
 * return <MetricList metrics={improved} variant="success" />;
 * ```
 */
export function useImprovedMetrics(): MetricComparison[] {
  const comparison = useAppSelector(selectWeekOverWeekComparison);
  
  return useMemo(() => {
    if (!comparison) return [];
    
    const allMetrics = [
      comparison.sales,
      comparison.customerCount,
      comparison.averageTicket,
      comparison.laborPercent,
      comparison.wastePercent,
      comparison.digitalPercent,
      comparison.customerService,
      comparison.portalOnTime,
    ];
    
    return allMetrics.filter(m => m.isImprovement);
  }, [comparison]);
}

/**
 * Hook for getting all declined metrics
 * 
 * @returns Array of declined metric comparisons
 * 
 * @example
 * ```
 * const declined = useDeclinedMetrics();
 * return <MetricList metrics={declined} variant="danger" />;
 * ```
 */
export function useDeclinedMetrics(): MetricComparison[] {
  const comparison = useAppSelector(selectWeekOverWeekComparison);
  
  return useMemo(() => {
    if (!comparison) return [];
    
    const allMetrics = [
      comparison.sales,
      comparison.customerCount,
      comparison.averageTicket,
      comparison.laborPercent,
      comparison.wastePercent,
      comparison.digitalPercent,
      comparison.customerService,
      comparison.portalOnTime,
    ];
    
    return allMetrics.filter(m => !m.isImprovement && m.direction !== 'unchanged');
  }, [comparison]);
}

/**
 * Hook for checking if specific metric improved
 * 
 * @param metric - Metric name to check
 * @returns Boolean indicating if metric improved
 * 
 * @example
 * ```
 * const salesImproved = useIsMetricImproved('sales');
 * return <StatusBadge improved={salesImproved} />;
 * ```
 */
export function useIsMetricImproved(metric: string): boolean {
  const metricComparison = useMetricComparison(metric);
  return metricComparison?.isImprovement || false;
}

/**
 * Hook for checking if any trends require action
 * 
 * @returns Boolean indicating if action is recommended
 * 
 * @example
 * ```
 * const needsAction = useNeedsAction();
 * if (needsAction) return <ActionRequiredBanner />;
 * ```
 */
export function useNeedsAction(): boolean {
  return useAppSelector(selectIsActionRecommended);
}

/**
 * Hook for getting overall performance summary
 * 
 * @returns Object with performance summary
 * 
 * @example
 * ```
 * const summary = usePerformanceSummary();
 * return <SummaryCard {...summary} />;
 * ```
 */
export function usePerformanceSummary() {
  const overallTrend = useAppSelector(selectOverallTrend);
  const improvedCount = useAppSelector(selectImprovedCount);
  const declinedCount = useAppSelector(selectDeclinedCount);
  const isActionRecommended = useAppSelector(selectIsActionRecommended);
  const grade = useAppSelector(selectPrevWeekGrade);
  
  return useMemo(
    () => ({
      overallTrend,
      improvedCount,
      declinedCount,
      isActionRecommended,
      grade,
      totalMetrics: 8,
      improvementRate: improvedCount / 8,
    }),
    [overallTrend, improvedCount, declinedCount, isActionRecommended, grade]
  );
}

/**
 * Hook for getting comparison summary text
 * 
 * @returns Formatted summary text
 * 
 * @example
 * ```
 * const summary = useComparisonSummaryText();
 * return <Text>{summary}</Text>; // "5 metrics improved, 2 declined"
 * ```
 */
export function useComparisonSummaryText(): string {
  const improvedCount = useAppSelector(selectImprovedCount);
  const declinedCount = useAppSelector(selectDeclinedCount);
  
  return useMemo(() => {
    if (improvedCount === 0 && declinedCount === 0) {
      return 'No significant changes';
    }
    
    const parts: string[] = [];
    if (improvedCount > 0) {
      parts.push(`${improvedCount} metric${improvedCount !== 1 ? 's' : ''} improved`);
    }
    if (declinedCount > 0) {
      parts.push(`${declinedCount} declined`);
    }
    
    return parts.join(', ');
  }, [improvedCount, declinedCount]);
}

/**
 * Hook for getting trend severity summary
 * 
 * @returns Object with trend severity counts
 * 
 * @example
 * ```
 * const severity = useTrendSeverity();
 * return <SeverityIndicator {...severity} />;
 * ```
 */
export function useTrendSeverity() {
  const trendAnalysis = useAppSelector(selectTrendAnalysis);
  
  return useMemo(() => {
    if (!trendAnalysis) {
      return { strong: 0, moderate: 0, weak: 0 };
    }
    
    const trends = [
      trendAnalysis.sales,
      trendAnalysis.customer,
      trendAnalysis.operationalEfficiency,
      trendAnalysis.quality,
      trendAnalysis.digitalAdoption,
    ];
    
    return {
      strong: trends.filter(t => t.severity === 'strong').length,
      moderate: trends.filter(t => t.severity === 'moderate').length,
      weak: trends.filter(t => t.severity === 'weak').length,
    };
  }, [trendAnalysis]);
}

/**
 * Hook for getting previous week date range as formatted string
 * 
 * @returns Previous week date range string
 * 
 * @example
 * ```
 * const dateRange = usePrevWeekDateRange();
 * return <Text>{dateRange}</Text>; // "2025-11-10 to 2025-11-16"
 * ```
 */
export function usePrevWeekDateRange(): string {
  const weekStartDate = useAppSelector(selectPrevWeekStartDate);
  const weekEndDate = useAppSelector(selectPrevWeekEndDate);
  
  return useMemo(() => {
    if (!weekStartDate || !weekEndDate) return '';
    return `${weekStartDate} to ${weekEndDate}`;
  }, [weekStartDate, weekEndDate]);
}
