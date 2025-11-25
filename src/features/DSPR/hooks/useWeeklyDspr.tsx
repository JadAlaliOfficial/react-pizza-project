/**
 * ============================================================================
 * USE WEEKLY DSPR HOOK
 * ============================================================================
 * Domain: Weekly DSPR (Current Week Aggregate)
 * 
 * Responsibility:
 * - React hook for consuming weekly DSPR Redux state
 * - Provides simple interface for accessing weekly aggregate metrics
 * - Exposes week-over-week comparison data
 * - Handles configuration methods for thresholds and filters
 * - Provides trend analysis and projections
 * - Automatic data derivation from central DSPR API
 * 
 * Related Files:
 * - State: state/dsprWeeklySlice.ts (Redux slice)
 * - Types: types/dspr.weeklyCurrent.ts (weekly current types)
 * - Central API: state/dsprApiSlice.ts (data source)
 * 
 * Usage:
 * ```
 * function WeeklyDashboard() {
 *   const {
 *     processed,
 *     financial,
 *     operational,
 *     trends,
 *     comparison,
 *     grade,
 *     weekProgress,
 *     hasData,
 *     setPerformanceThresholds,
 *   } = useWeeklyDspr();
 * 
 *   if (!hasData) return <NoData />;
 * 
 *   return (
 *     <div>
 *       <WeekProgressBar progress={weekProgress} />
 *       <PerformanceBadge grade={grade} />
 *       <WeeklySummary data={processed} />
 *       <WeekOverWeekComparison comparison={comparison} />
 *     </div>
 *   );
 * }
 * ```
 */

import { useCallback, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  selectRawWeeklyDspr,
  selectRawPreviousWeekDspr,
  selectProcessedWeeklyDspr,
  selectWeeklyComparison,
  selectWeeklyFinancial,
  selectWeeklyOperational,
  selectWeeklyQuality,
  selectWeeklySalesChannels,
  selectWeeklyCostControl,
  selectWeeklyTrends,
  selectWeeklyGrade,
  selectWeekProgress,
  selectWeeklyConfig,
  selectWeeklyFilter,
  selectLastProcessedTime,
  selectWeeklyStore,
  selectWeekNumber,
  selectWeekStartDate,
  selectWeekEndDate,
  selectHasWeeklyDspr,
  selectHasPreviousWeek,
  selectWeeklyTotalSales,
  selectDailyAverageSales,
  selectWeeklyLaborPercent,
  selectWeeklyWastePercent,
  selectWeeklyDigitalPercent,
  selectWeeklyCustomerService,
  selectProjectedWeekTotal,
  selectAnnualRunRate,
  selectOverallTrend,
  selectSalesWoWChange,
  selectCustomersWoWChange,
  selectCostEfficiencyScore,
  setPerformanceThresholds as setPerformanceThresholdsAction,
  setFilter as setFilterAction,
  clearFilter as clearFilterAction,
  setOperatingDays as setOperatingDaysAction,
  resetConfig as resetConfigAction,
  clearWeeklyData as clearDataAction,
} from '../store/dsprWeeklySlice';
import {
  type WeeklyDSPRData,
  type ProcessedWeeklyDSPR,
  type WeeklyFinancialSummary,
  type WeeklyOperationalSummary,
  type WeeklyQualitySummary,
  type WeeklySalesChannelSummary,
  type WeeklyCostControlSummary,
  type WeeklyTrends,
  type WeeklyComparison,
  type WeekOverWeekChange,
  PerformanceGrade,
  GrowthIndicator,
  type WeeklyDSPRConfig,
  type WeeklyPerformanceThresholds,
  type WeeklyDSPRFilter,
} from '../types/dspr.weeklyCurrent';
import type { StoreId, ApiDate, WeekNumber } from '../types/dspr.common';

// ============================================================================
// HOOK RETURN TYPE
// ============================================================================

/**
 * Return type for useWeeklyDspr hook
 */
export interface UseWeeklyDsprReturn {
  // ========================================================================
  // DATA
  // ========================================================================
  
  /** Raw current week DSPR data from API */
  raw: WeeklyDSPRData | null;
  
  /** Raw previous week DSPR data (for comparison) */
  rawPrevious: WeeklyDSPRData | null;
  
  /** Processed weekly DSPR with summaries */
  processed: ProcessedWeeklyDSPR | null;
  
  /** Week-over-week comparison */
  comparison: WeeklyComparison | null;
  
  /** Weekly financial summary */
  financial: WeeklyFinancialSummary | null;
  
  /** Weekly operational summary */
  operational: WeeklyOperationalSummary | null;
  
  /** Weekly quality summary */
  quality: WeeklyQualitySummary | null;
  
  /** Weekly sales channel summary */
  salesChannels: WeeklySalesChannelSummary | null;
  
  /** Weekly cost control summary */
  costControl: WeeklyCostControlSummary | null;
  
  /** Weekly trends and insights */
  trends: WeeklyTrends | null;
  
  // ========================================================================
  // METRICS
  // ========================================================================
  
  /** Performance grade */
  grade: PerformanceGrade | null;
  
  /** Week progress (0-1) */
  weekProgress: number;
  
  /** Total weekly sales ($) */
  totalSales: number;
  
  /** Daily average sales ($) */
  dailyAverageSales: number;
  
  /** Weekly labor percentage (0-1) */
  laborPercent: number;
  
  /** Weekly waste percentage (0-1) */
  wastePercent: number;
  
  /** Weekly digital sales percentage (0-1) */
  digitalPercent: number;
  
  /** Weekly customer service score (0-1) */
  customerService: number;
  
  /** Projected week-end total ($, if week incomplete) */
  projectedWeekTotal: number | undefined;
  
  /** Annual run rate ($) */
  annualRunRate: number;
  
  /** Overall weekly trend */
  overallTrend: GrowthIndicator | null;
  
  /** Cost efficiency score (0-100) */
  costEfficiencyScore: number;
  
  // ========================================================================
  // WEEK-OVER-WEEK CHANGES
  // ========================================================================
  
  /** Sales week-over-week change */
  salesWoWChange: WeekOverWeekChange | null;
  
  /** Customer count week-over-week change */
  customersWoWChange: WeekOverWeekChange | null;
  
  // ========================================================================
  // STATE
  // ========================================================================
  
  /** Whether weekly DSPR data exists */
  hasData: boolean;
  
  /** Whether previous week data exists */
  hasPreviousWeek: boolean;
  
  /** Store ID */
  store: StoreId | null;
  
  /** Week number (1-52) */
  week: WeekNumber | null;
  
  /** Week start date */
  weekStartDate: ApiDate | null;
  
  /** Week end date */
  weekEndDate: ApiDate | null;
  
  /** Last processed timestamp */
  lastProcessed: string | null;
  
  // ========================================================================
  // CONFIGURATION
  // ========================================================================
  
  /** Current configuration */
  config: WeeklyDSPRConfig;
  
  /** Current filter */
  filter: WeeklyDSPRFilter;
  
  // ========================================================================
  // ACTIONS
  // ========================================================================
  
  /**
   * Updates performance thresholds
   * @param thresholds - Partial thresholds to update
   */
  setPerformanceThresholds: (thresholds: Partial<WeeklyPerformanceThresholds>) => void;
  
  /**
   * Sets filter options
   * @param filter - Partial filter to apply
   */
  setFilter: (filter: Partial<WeeklyDSPRFilter>) => void;
  
  /**
   * Clears all filters
   */
  clearFilter: () => void;
  
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
   * Clears all weekly DSPR data
   */
  clearData: () => void;
}

// ============================================================================
// HOOK
// ============================================================================

/**
 * Custom hook for accessing and managing weekly DSPR data
 * 
 * Provides a simple interface for consuming weekly store performance
 * report metrics, week-over-week comparisons, trends, and configuration.
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
 *     trends,
 *     grade,
 *     weekProgress,
 *     hasData,
 *     hasPreviousWeek,
 *   } = useWeeklyDspr();
 * 
 *   if (!hasData) return <NoData />;
 * 
 *   return (
 *     <div>
 *       <WeekHeader 
 *         week={processed.week}
 *         progress={weekProgress}
 *         grade={grade}
 *       />
 *       <FinancialSummary data={processed.financial} />
 *       {hasPreviousWeek && (
 *         <WeekOverWeekChart comparison={comparison} />
 *       )}
 *       <TrendAnalysis trends={trends} />
 *     </div>
 *   );
 * }
 * ```
 */
export function useWeeklyDspr(): UseWeeklyDsprReturn {
  const dispatch = useAppDispatch();
  
  // ========================================================================
  // SELECTORS
  // ========================================================================
  
  const raw = useAppSelector(selectRawWeeklyDspr);
  const rawPrevious = useAppSelector(selectRawPreviousWeekDspr);
  const processed = useAppSelector(selectProcessedWeeklyDspr);
  const comparison = useAppSelector(selectWeeklyComparison);
  const financial = useAppSelector(selectWeeklyFinancial);
  const operational = useAppSelector(selectWeeklyOperational);
  const quality = useAppSelector(selectWeeklyQuality);
  const salesChannels = useAppSelector(selectWeeklySalesChannels);
  const costControl = useAppSelector(selectWeeklyCostControl);
  const trends = useAppSelector(selectWeeklyTrends);
  const grade = useAppSelector(selectWeeklyGrade);
  const weekProgress = useAppSelector(selectWeekProgress);
  const config = useAppSelector(selectWeeklyConfig);
  const filter = useAppSelector(selectWeeklyFilter);
  const lastProcessed = useAppSelector(selectLastProcessedTime);
  const store = useAppSelector(selectWeeklyStore);
  const week = useAppSelector(selectWeekNumber);
  const weekStartDate = useAppSelector(selectWeekStartDate);
  const weekEndDate = useAppSelector(selectWeekEndDate);
  const hasData = useAppSelector(selectHasWeeklyDspr);
  const hasPreviousWeek = useAppSelector(selectHasPreviousWeek);
  const totalSales = useAppSelector(selectWeeklyTotalSales);
  const dailyAverageSales = useAppSelector(selectDailyAverageSales);
  const laborPercent = useAppSelector(selectWeeklyLaborPercent);
  const wastePercent = useAppSelector(selectWeeklyWastePercent);
  const digitalPercent = useAppSelector(selectWeeklyDigitalPercent);
  const customerService = useAppSelector(selectWeeklyCustomerService);
  const projectedWeekTotal = useAppSelector(selectProjectedWeekTotal);
  const annualRunRate = useAppSelector(selectAnnualRunRate);
  const overallTrend = useAppSelector(selectOverallTrend);
  const salesWoWChange = useAppSelector(selectSalesWoWChange);
  const customersWoWChange = useAppSelector(selectCustomersWoWChange);
  const costEfficiencyScore = useAppSelector(selectCostEfficiencyScore);
  
  // ========================================================================
  // ACTIONS
  // ========================================================================
  
  /**
   * Updates performance thresholds
   */
  const setPerformanceThresholds = useCallback(
    (thresholds: Partial<WeeklyPerformanceThresholds>) => {
      dispatch(setPerformanceThresholdsAction(thresholds));
      
      if (process.env.NODE_ENV === 'development') {
        console.log('[useWeeklyDspr] Performance thresholds updated:', thresholds);
      }
    },
    [dispatch]
  );
  
  /**
   * Sets filter options
   */
  const setFilter = useCallback(
    (filter: Partial<WeeklyDSPRFilter>) => {
      dispatch(setFilterAction(filter));
      
      if (process.env.NODE_ENV === 'development') {
        console.log('[useWeeklyDspr] Filter updated:', filter);
      }
    },
    [dispatch]
  );
  
  /**
   * Clears all filters
   */
  const clearFilter = useCallback(() => {
    dispatch(clearFilterAction());
    
    if (process.env.NODE_ENV === 'development') {
      console.log('[useWeeklyDspr] Filter cleared');
    }
  }, [dispatch]);
  
  /**
   * Sets operating days per week
   */
  const setOperatingDays = useCallback(
    (days: number) => {
      dispatch(setOperatingDaysAction(days));
      
      if (process.env.NODE_ENV === 'development') {
        console.log('[useWeeklyDspr] Operating days updated:', days);
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
      console.log('[useWeeklyDspr] Configuration reset to defaults');
    }
  }, [dispatch]);
  
  /**
   * Clears all weekly DSPR data
   */
  const clearData = useCallback(() => {
    dispatch(clearDataAction());
    
    if (process.env.NODE_ENV === 'development') {
      console.log('[useWeeklyDspr] Data cleared');
    }
  }, [dispatch]);
  
  // ========================================================================
  // RETURN
  // ========================================================================
  
  return {
    // Data
    raw,
    rawPrevious,
    processed,
    comparison,
    financial,
    operational,
    quality,
    salesChannels,
    costControl,
    trends,
    
    // Metrics
    grade,
    weekProgress,
    totalSales,
    dailyAverageSales,
    laborPercent,
    wastePercent,
    digitalPercent,
    customerService,
    projectedWeekTotal,
    annualRunRate,
    overallTrend,
    costEfficiencyScore,
    
    // Week-over-week changes
    salesWoWChange,
    customersWoWChange,
    
    // State
    hasData,
    hasPreviousWeek,
    store,
    week,
    weekStartDate,
    weekEndDate,
    lastProcessed,
    
    // Configuration
    config,
    filter,
    
    // Actions
    setPerformanceThresholds,
    setFilter,
    clearFilter,
    setOperatingDays,
    resetConfig,
    clearData,
  };
}

// ============================================================================
// CONVENIENCE HOOKS
// ============================================================================

/**
 * Hook for checking if weekly DSPR data is available
 * 
 * @returns Boolean indicating if data exists
 * 
 * @example
 * ```
 * const hasData = useHasWeeklyDspr();
 * if (!hasData) return <LoadingState />;
 * ```
 */
export function useHasWeeklyDspr(): boolean {
  return useAppSelector(selectHasWeeklyDspr);
}

/**
 * Hook for accessing only weekly financial summary
 * 
 * @returns Weekly financial summary or null
 * 
 * @example
 * ```
 * const financial = useWeeklyFinancial();
 * return <FinancialDashboard data={financial} />;
 * ```
 */
export function useWeeklyFinancial(): WeeklyFinancialSummary | null {
  return useAppSelector(selectWeeklyFinancial);
}

/**
 * Hook for accessing only weekly operational summary
 * 
 * @returns Weekly operational summary or null
 * 
 * @example
 * ```
 * const operational = useWeeklyOperational();
 * return <OperationalDashboard data={operational} />;
 * ```
 */
export function useWeeklyOperational(): WeeklyOperationalSummary | null {
  return useAppSelector(selectWeeklyOperational);
}

/**
 * Hook for accessing only weekly quality summary
 * 
 * @returns Weekly quality summary or null
 * 
 * @example
 * ```
 * const quality = useWeeklyQuality();
 * return <QualityDashboard data={quality} />;
 * ```
 */
export function useWeeklyQuality(): WeeklyQualitySummary | null {
  return useAppSelector(selectWeeklyQuality);
}

/**
 * Hook for accessing only weekly sales channels
 * 
 * @returns Weekly sales channel summary or null
 * 
 * @example
 * ```
 * const channels = useWeeklySalesChannels();
 * return <ChannelBreakdown data={channels} />;
 * ```
 */
export function useWeeklySalesChannels(): WeeklySalesChannelSummary | null {
  return useAppSelector(selectWeeklySalesChannels);
}

/**
 * Hook for accessing only weekly cost control
 * 
 * @returns Weekly cost control summary or null
 * 
 * @example
 * ```
 * const costControl = useWeeklyCostControl();
 * return <CostControlDashboard data={costControl} />;
 * ```
 */
export function useWeeklyCostControl(): WeeklyCostControlSummary | null {
  return useAppSelector(selectWeeklyCostControl);
}

/**
 * Hook for accessing only weekly trends
 * 
 * @returns Weekly trends or null
 * 
 * @example
 * ```
 * const trends = useWeeklyTrends();
 * return <TrendAnalysis trends={trends} />;
 * ```
 */
export function useWeeklyTrends(): WeeklyTrends | null {
  return useAppSelector(selectWeeklyTrends);
}

/**
 * Hook for accessing week-over-week comparison
 * 
 * @returns Weekly comparison or null
 * 
 * @example
 * ```
 * const comparison = useWeekOverWeekComparison();
 * if (comparison) return <ComparisonChart data={comparison} />;
 * ```
 */
export function useWeekOverWeekComparison(): WeeklyComparison | null {
  return useAppSelector(selectWeeklyComparison);
}

/**
 * Hook for accessing weekly performance grade
 * 
 * @returns Performance grade or null
 * 
 * @example
 * ```
 * const grade = useWeeklyGrade();
 * return <GradeBadge grade={grade} />;
 * ```
 */
export function useWeeklyGrade(): PerformanceGrade | null {
  return useAppSelector(selectWeeklyGrade);
}

/**
 * Hook for checking if previous week data is available
 * 
 * @returns Boolean indicating if previous week exists
 * 
 * @example
 * ```
 * const hasPrevWeek = useHasPreviousWeek();
 * if (hasPrevWeek) return <ComparisonView />;
 * ```
 */
export function useHasPreviousWeek(): boolean {
  return useAppSelector(selectHasPreviousWeek);
}

/**
 * Hook for accessing key weekly metrics only
 * 
 * @returns Object with key metrics
 * 
 * @example
 * ```
 * const metrics = useWeeklyKeyMetrics();
 * return <MetricsDashboard {...metrics} />;
 * ```
 */
export function useWeeklyKeyMetrics() {
  const totalSales = useAppSelector(selectWeeklyTotalSales);
  const dailyAverageSales = useAppSelector(selectDailyAverageSales);
  const laborPercent = useAppSelector(selectWeeklyLaborPercent);
  const wastePercent = useAppSelector(selectWeeklyWastePercent);
  const digitalPercent = useAppSelector(selectWeeklyDigitalPercent);
  const customerService = useAppSelector(selectWeeklyCustomerService);
  const grade = useAppSelector(selectWeeklyGrade);
  const weekProgress = useAppSelector(selectWeekProgress);
  
  return useMemo(
    () => ({
      totalSales,
      dailyAverageSales,
      laborPercent,
      wastePercent,
      digitalPercent,
      customerService,
      grade,
      weekProgress,
    }),
    [
      totalSales,
      dailyAverageSales,
      laborPercent,
      wastePercent,
      digitalPercent,
      customerService,
      grade,
      weekProgress,
    ]
  );
}

/**
 * Hook for checking if week is complete
 * 
 * @returns Boolean indicating if week is complete (progress >= 1)
 * 
 * @example
 * ```
 * const isComplete = useIsWeekComplete();
 * return <WeekStatus complete={isComplete} />;
 * ```
 */
export function useIsWeekComplete(): boolean {
  const weekProgress = useAppSelector(selectWeekProgress);
  return weekProgress >= 1;
}

/**
 * Hook for getting week-over-week change for specific metric
 * 
 * @param metric - Metric name to get change for
 * @returns Week-over-week change or null
 * 
 * @example
 * ```
 * const salesChange = useMetricWoWChange('sales');
 * return <ChangeIndicator change={salesChange} />;
 * ```
 */
export function useMetricWoWChange(metric: string): WeekOverWeekChange | null {
  const comparison = useAppSelector(selectWeeklyComparison);
  
  return useMemo(() => {
    if (!comparison) return null;
    
    switch (metric) {
      case 'sales':
        return comparison.sales;
      case 'customers':
        return comparison.customers;
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
      default:
        return null;
    }
  }, [comparison, metric]);
}

/**
 * Hook for getting formatted week progress percentage
 * 
 * @returns Week progress as percentage string
 * 
 * @example
 * ```
 * const progressText = useWeekProgressText();
 * return <Text>{progressText}</Text>; // "75%"
 * ```
 */
export function useWeekProgressText(): string {
  const weekProgress = useAppSelector(selectWeekProgress);
  return `${Math.round(weekProgress * 100)}%`;
}

/**
 * Hook for checking if metric is improving week-over-week
 * 
 * @param metric - Metric name to check
 * @param higherIsBetter - Whether higher values are better (default: true)
 * @returns Boolean indicating if metric is improving
 * 
 * @example
 * ```
 * const salesImproving = useIsMetricImproving('sales');
 * const wasteImproving = useIsMetricImproving('wastePercent', false);
 * ```
 */
export function useIsMetricImproving(metric: string, higherIsBetter: boolean = true): boolean {
  const change = useMetricWoWChange(metric);
  
  return useMemo(() => {
    if (!change) return false;
    
    if (higherIsBetter) {
      return change.change > 0;
    } else {
      return change.change < 0;
    }
  }, [change, higherIsBetter]);
}

/**
 * Hook for getting week date range as formatted string
 * 
 * @returns Week date range string
 * 
 * @example
 * ```
 * const dateRange = useWeekDateRange();
 * return <Text>{dateRange}</Text>; // "2025-11-17 to 2025-11-23"
 * ```
 */
export function useWeekDateRange(): string {
  const weekStartDate = useAppSelector(selectWeekStartDate);
  const weekEndDate = useAppSelector(selectWeekEndDate);
  
  return useMemo(() => {
    if (!weekStartDate || !weekEndDate) return '';
    return `${weekStartDate} to ${weekEndDate}`;
  }, [weekStartDate, weekEndDate]);
}
