/**
 * ============================================================================
 * USE DAILY DSPR BY DATE HOOK
 * ============================================================================
 * Domain: Daily DSPR By Date (Daily Breakdown with Week Comparison)
 * 
 * Responsibility:
 * - React hook for consuming daily by date DSPR Redux state
 * - Provides simple interface for accessing daily breakdown with comparisons
 * - Exposes timeline metrics for chart visualization
 * - Provides week pattern analysis and day-of-week insights
 * - Handles configuration methods for filtering and sorting
 * - Automatic data derivation from central DSPR API
 * 
 * Related Files:
 * - State: state/dsprDailyByDateSlice.ts (Redux slice)
 * - Types: types/dspr.dailyByDate.ts (daily by date types)
 * - Central API: state/dsprApiSlice.ts (data source)
 * 
 * Usage:
 * ```
 * function TimelineDashboard() {
 *   const {
 *     entries,
 *     timeline,
 *     weekPattern,
 *     bestDay,
 *     worstDay,
 *     averages,
 *     hasData,
 *     setFilter,
 *     setSort,
 *   } = useDailyDsprByDate();
 * 
 *   if (!hasData) return <NoData />;
 * 
 *   return (
 *     <div>
 *       <TimelineChart timeline={timeline} />
 *       <DayOfWeekAnalysis pattern={weekPattern} />
 *       <DailyComparison entries={entries} />
 *     </div>
 *   );
 * }
 * ```
 */

import { useCallback, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  selectRawDailyByDate,
  selectProcessedDailyByDate,
  selectDailyEntries,
  selectDailyComparisons,
  selectTimelineMetrics,
  selectBestDay,
  selectWorstDay,
  selectDailyAverages,
  selectWeekPattern,
  selectDayOfWeekBreakdown,
  selectStrongestDay,
  selectWeakestDay,
  selectDailyByDateConfig,
  selectDailyByDateFilter,
  selectDailyByDateSort,
  selectLastProcessedTime,
  selectDailyByDateStore,
  selectDailyByDateWeek,
  selectHasDailyByDate,
  selectDayCount,
  selectAvgDailySales,
  selectSalesVariability,
  selectWeekendWeekdayRatio,
  selectImprovedDaysMemo as selectImprovedDays,
  selectDeclinedDaysMemo as selectDeclinedDays,
  selectComparisonForDate,
  selectEntryForDate,
  selectAllDatesMemo as selectAllDates,
  selectIsFilterActive,
  selectDaysByTrendMemo as selectDaysByTrend,
  setFilter as setFilterAction,
  clearFilter as clearFilterAction,
  setSort as setSortAction,
  setComparisonThresholds as setComparisonThresholdsAction,
  resetConfig as resetConfigAction,
  clearDailyByDateData as clearDataAction,
} from '../store/dsprDailyByDateSlice';
import {
  type DailyDSPRByDate,
  type DailyDSPRByDateEntry,
  type ProcessedDailyByDate,
  type DayComparison,
  type TimelineMetrics,
  type DailyAverages,
  type WeekPatternAnalysis,
  type DayOfWeekAnalysis,
  ComparisonTrend,
  type DailyByDateConfig,
  type DailyByDateFilter,
  DailyByDateSort,
  type ComparisonThresholds,
} from '../types/dspr.dailyByDate';
import type { StoreId, WeekNumber, ApiDate } from '../types/dspr.common';

// ============================================================================
// HOOK RETURN TYPE
// ============================================================================

/**
 * Return type for useDailyDsprByDate hook
 */
export interface UseDailyDsprByDateReturn {
  // ========================================================================
  // DATA
  // ========================================================================
  
  /** Raw daily by date data from API */
  raw: DailyDSPRByDate | null;
  
  /** Processed daily by date with comparisons */
  processed: ProcessedDailyByDate | null;
  
  /** Array of daily entries (current + prev week) */
  entries: DailyDSPRByDateEntry[];
  
  /** Map of dates to comparisons */
  comparisons: Record<ApiDate, DayComparison>;
  
  /** Timeline metrics for visualization */
  timeline: TimelineMetrics | null;
  
  /** Best performing day */
  bestDay: DailyDSPRByDateEntry | null;
  
  /** Worst performing day */
  worstDay: DailyDSPRByDateEntry | null;
  
  /** Daily averages across all days */
  averages: DailyAverages | null;
  
  /** Week pattern analysis */
  weekPattern: WeekPatternAnalysis | null;
  
  /** Day-of-week breakdown */
  dayOfWeekBreakdown: DayOfWeekAnalysis[];
  
  /** Strongest day of week */
  strongestDay: DayOfWeekAnalysis | null;
  
  /** Weakest day of week */
  weakestDay: DayOfWeekAnalysis | null;
  
  // ========================================================================
  // METRICS
  // ========================================================================
  
  /** Number of days in breakdown */
  dayCount: number;
  
  /** Average daily sales */
  avgDailySales: number;
  
  /** Sales variability (consistency score) */
  salesVariability: number;
  
  /** Weekend vs weekday ratio */
  weekendWeekdayRatio: number;
  
  /** Days with improvement over prev week */
  improvedDays: DailyDSPRByDateEntry[];
  
  /** Days with decline vs prev week */
  declinedDays: DailyDSPRByDateEntry[];
  
  /** All dates in timeline */
  allDates: ApiDate[];
  
  /** Count of days by trend */
  daysByTrend: Record<ComparisonTrend, number>;
  
  // ========================================================================
  // STATE
  // ========================================================================
  
  /** Whether daily by date data exists */
  hasData: boolean;
  
  /** Store ID */
  store: StoreId | null;
  
  /** Week number */
  week: WeekNumber | null;
  
  /** Last processed timestamp */
  lastProcessed: string | null;
  
  /** Whether filter is active */
  isFilterActive: boolean;
  
  // ========================================================================
  // CONFIGURATION
  // ========================================================================
  
  /** Current configuration */
  config: DailyByDateConfig;
  
  /** Current filter */
  filter: DailyByDateFilter;
  
  /** Current sort */
  sort: DailyByDateSort;
  
  // ========================================================================
  // ACTIONS
  // ========================================================================
  
  /**
   * Sets filter options
   * @param filter - Partial filter to apply
   */
  setFilter: (filter: Partial<DailyByDateFilter>) => void;
  
  /**
   * Clears all filters
   */
  clearFilter: () => void;
  
  /**
   * Sets sort order
   * @param sort - Sort option
   */
  setSort: (sort: DailyByDateSort) => void;
  
  /**
   * Updates comparison thresholds
   * @param thresholds - Partial thresholds to update
   */
  setComparisonThresholds: (thresholds: Partial<ComparisonThresholds>) => void;
  
  /**
   * Resets configuration to defaults
   */
  resetConfig: () => void;
  
  /**
   * Clears all daily by date data
   */
  clearData: () => void;
  
  // ========================================================================
  // HELPERS
  // ========================================================================
  
  /**
   * Gets comparison for specific date
   * @param date - Date to get comparison for
   */
  getComparisonForDate: (date: ApiDate) => DayComparison | null;
  
  /**
   * Gets entry for specific date
   * @param date - Date to get entry for
   */
  getEntryForDate: (date: ApiDate) => DailyDSPRByDateEntry | null;
}

// ============================================================================
// HOOK
// ============================================================================

/**
 * Custom hook for accessing and managing daily by date DSPR data
 * 
 * Provides a simple interface for consuming daily breakdown with
 * week-over-week comparisons, timeline metrics, and week pattern analysis.
 * Data is automatically derived from the central DSPR API response.
 * 
 * @returns Object with data, metrics, state, and action methods
 * 
 * @example
 * ```
 * function Dashboard() {
 *   const {
 *     entries,
 *     timeline,
 *     weekPattern,
 *     bestDay,
 *     hasData,
 *     setFilter,
 *   } = useDailyDsprByDate();
 * 
 *   if (!hasData) return <NoData />;
 * 
 *   return (
 *     <div>
 *       <SalesTimeline data={timeline} />
 *       <DayOfWeekChart pattern={weekPattern} />
 *       <BestWorstDays best={bestDay} />
 *       <DailyGrid entries={entries} />
 *     </div>
 *   );
 * }
 * ```
 */
export function useDailyDsprByDate(): UseDailyDsprByDateReturn {
  const dispatch = useAppDispatch();
  
  // ========================================================================
  // SELECTORS
  // ========================================================================
  
  const raw = useAppSelector(selectRawDailyByDate);
  const processed = useAppSelector(selectProcessedDailyByDate);
  const entries = useAppSelector(selectDailyEntries);
  const comparisons = useAppSelector(selectDailyComparisons);
  const timeline = useAppSelector(selectTimelineMetrics);
  const bestDay = useAppSelector(selectBestDay);
  const worstDay = useAppSelector(selectWorstDay);
  const averages = useAppSelector(selectDailyAverages);
  const weekPattern = useAppSelector(selectWeekPattern);
  const dayOfWeekBreakdown = useAppSelector(selectDayOfWeekBreakdown);
  const strongestDay = useAppSelector(selectStrongestDay);
  const weakestDay = useAppSelector(selectWeakestDay);
  const config = useAppSelector(selectDailyByDateConfig);
  const filter = useAppSelector(selectDailyByDateFilter);
  const sort = useAppSelector(selectDailyByDateSort);
  const lastProcessed = useAppSelector(selectLastProcessedTime);
  const store = useAppSelector(selectDailyByDateStore);
  const week = useAppSelector(selectDailyByDateWeek);
  const hasData = useAppSelector(selectHasDailyByDate);
  const dayCount = useAppSelector(selectDayCount);
  const avgDailySales = useAppSelector(selectAvgDailySales);
  const salesVariability = useAppSelector(selectSalesVariability);
  const weekendWeekdayRatio = useAppSelector(selectWeekendWeekdayRatio);
  const improvedDays = useAppSelector(selectImprovedDays);
  const declinedDays = useAppSelector(selectDeclinedDays);
  const allDates = useAppSelector(selectAllDates);
  const isFilterActive = useAppSelector(selectIsFilterActive);
  const daysByTrend = useAppSelector(selectDaysByTrend);
  
  // ========================================================================
  // ACTIONS
  // ========================================================================
  
  /**
   * Sets filter options
   */
  const setFilter = useCallback(
    (filter: Partial<DailyByDateFilter>) => {
      dispatch(setFilterAction(filter));
      
      if (process.env.NODE_ENV === 'development') {
        console.log('[useDailyDsprByDate] Filter updated:', filter);
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
      console.log('[useDailyDsprByDate] Filter cleared');
    }
  }, [dispatch]);
  
  /**
   * Sets sort order
   */
  const setSort = useCallback(
    (sort: DailyByDateSort) => {
      dispatch(setSortAction(sort));
      
      if (process.env.NODE_ENV === 'development') {
        console.log('[useDailyDsprByDate] Sort updated:', sort);
      }
    },
    [dispatch]
  );
  
  /**
   * Updates comparison thresholds
   */
  const setComparisonThresholds = useCallback(
    (thresholds: Partial<ComparisonThresholds>) => {
      dispatch(setComparisonThresholdsAction(thresholds));
      
      if (process.env.NODE_ENV === 'development') {
        console.log('[useDailyDsprByDate] Comparison thresholds updated:', thresholds);
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
      console.log('[useDailyDsprByDate] Configuration reset to defaults');
    }
  }, [dispatch]);
  
  /**
   * Clears all daily by date data
   */
  const clearData = useCallback(() => {
    dispatch(clearDataAction());
    
    if (process.env.NODE_ENV === 'development') {
      console.log('[useDailyDsprByDate] Data cleared');
    }
  }, [dispatch]);
  
  // ========================================================================
  // HELPERS
  // ========================================================================
  
  /**
   * Gets comparison for specific date
   */
  const getComparisonForDate = useCallback(
    (date: ApiDate): DayComparison | null => {
      return comparisons[date] || null;
    },
    [comparisons]
  );
  
  /**
   * Gets entry for specific date
   */
  const getEntryForDate = useCallback(
    (date: ApiDate): DailyDSPRByDateEntry | null => {
      return entries.find(e => e.date === date) || null;
    },
    [entries]
  );
  
  // ========================================================================
  // RETURN
  // ========================================================================
  
  return {
    // Data
    raw,
    processed,
    entries,
    comparisons,
    timeline,
    bestDay,
    worstDay,
    averages,
    weekPattern,
    dayOfWeekBreakdown,
    strongestDay,
    weakestDay,
    
    // Metrics
    dayCount,
    avgDailySales,
    salesVariability,
    weekendWeekdayRatio,
    improvedDays,
    declinedDays,
    allDates,
    daysByTrend,
    
    // State
    hasData,
    store,
    week,
    lastProcessed,
    isFilterActive,
    
    // Configuration
    config,
    filter,
    sort,
    
    // Actions
    setFilter,
    clearFilter,
    setSort,
    setComparisonThresholds,
    resetConfig,
    clearData,
    
    // Helpers
    getComparisonForDate,
    getEntryForDate,
  };
}

// ============================================================================
// CONVENIENCE HOOKS
// ============================================================================

/**
 * Hook for checking if daily by date data is available
 * 
 * @returns Boolean indicating if data exists
 * 
 * @example
 * ```
 * const hasData = useHasDailyByDate();
 * if (!hasData) return <LoadingState />;
 * ```
 */
export function useHasDailyByDate(): boolean {
  return useAppSelector(selectHasDailyByDate);
}

/**
 * Hook for accessing only timeline metrics
 * 
 * @returns Timeline metrics or null
 * 
 * @example
 * ```
 * const timeline = useTimelineMetrics();
 * return <TimelineChart data={timeline} />;
 * ```
 */
export function useTimelineMetrics(): TimelineMetrics | null {
  return useAppSelector(selectTimelineMetrics);
}

/**
 * Hook for accessing only week pattern analysis
 * 
 * @returns Week pattern analysis or null
 * 
 * @example
 * ```
 * const pattern = useWeekPattern();
 * return <DayOfWeekChart pattern={pattern} />;
 * ```
 */
export function useWeekPattern(): WeekPatternAnalysis | null {
  return useAppSelector(selectWeekPattern);
}

/**
 * Hook for accessing best and worst days
 * 
 * @returns Object with best and worst days
 * 
 * @example
 * ```
 * const { bestDay, worstDay } = useBestWorstDays();
 * return <ComparisonCard best={bestDay} worst={worstDay} />;
 * ```
 */
export function useBestWorstDays() {
  const bestDay = useAppSelector(selectBestDay);
  const worstDay = useAppSelector(selectWorstDay);
  
  return useMemo(() => ({ bestDay, worstDay }), [bestDay, worstDay]);
}

/**
 * Hook for accessing daily averages
 * 
 * @returns Daily averages or null
 * 
 * @example
 * ```
 * const averages = useDailyAverages();
 * return <AveragesPanel data={averages} />;
 * ```
 */
export function useDailyAverages(): DailyAverages | null {
  return useAppSelector(selectDailyAverages);
}

/**
 * Hook for accessing entries for specific date range
 * 
 * @param startDate - Start date (inclusive)
 * @param endDate - End date (inclusive)
 * @returns Filtered entries
 * 
 * @example
 * ```
 * const weekEntries = useDateRangeEntries('2025-11-17', '2025-11-23');
 * return <WeekView entries={weekEntries} />;
 * ```
 */
export function useDateRangeEntries(startDate: ApiDate, endDate: ApiDate): DailyDSPRByDateEntry[] {
  const entries = useAppSelector(selectDailyEntries);
  
  return useMemo(() => {
    return entries.filter(e => e.date >= startDate && e.date <= endDate);
  }, [entries, startDate, endDate]);
}

/**
 * Hook for accessing entries for specific days of week
 * 
 * @param daysOfWeek - Array of day numbers (0-6, 0 = Sunday)
 * @returns Filtered entries
 * 
 * @example
 * ```
 * // Get weekend entries
 * const weekendEntries = useDaysOfWeekEntries();
 * return <WeekendAnalysis entries={weekendEntries} />;
 * ```
 */
export function useDaysOfWeekEntries(daysOfWeek: number[]): DailyDSPRByDateEntry[] {
  const entries = useAppSelector(selectDailyEntries);
  
  return useMemo(() => {
    return entries.filter(e => {
      const dayOfWeek = new Date(e.date).getDay();
      return daysOfWeek.includes(dayOfWeek);
    });
  }, [entries, daysOfWeek]);
}

/**
 * Hook for getting comparison for specific date
 * 
 * @param date - Date to get comparison for
 * @returns Day comparison or null
 * 
 * @example
 * ```
 * const comparison = useComparisonForDate('2025-11-20');
 * return <DayCard comparison={comparison} />;
 * ```
 */
export function useComparisonForDate(date: ApiDate): DayComparison | null {
  return useAppSelector(selectComparisonForDate(date));
}

/**
 * Hook for getting entry for specific date
 * 
 * @param date - Date to get entry for
 * @returns Entry or null
 * 
 * @example
 * ```
 * const entry = useEntryForDate('2025-11-20');
 * return <DayDetail entry={entry} />;
 * ```
 */
export function useEntryForDate(date: ApiDate): DailyDSPRByDateEntry | null {
  return useAppSelector(selectEntryForDate(date));
}

/**
 * Hook for getting entries sorted by improvement
 * 
 * @returns Entries sorted by sales change (descending)
 * 
 * @example
 * ```
 * const topImprovers = useTopImprovers();
 * return <TopPerformersCard days={topImprovers.slice(0, 3)} />;
 * ```
 */
export function useTopImprovers(): DailyDSPRByDateEntry[] {
  const entries = useAppSelector(selectDailyEntries);
  
  return useMemo(() => {
    return [...entries].sort((a, b) => {
      const changeA = a.current.TotalSales - a.prevWeek.TotalSales;
      const changeB = b.current.TotalSales - b.prevWeek.TotalSales;
      return changeB - changeA;
    });
  }, [entries]);
}

/**
 * Hook for checking if specific day improved
 * 
 * @param date - Date to check
 * @returns Boolean indicating if day improved
 * 
 * @example
 * ```
 * const improved = useIsDayImproved('2025-11-20');
 * return <StatusBadge improved={improved} />;
 * ```
 */
export function useIsDayImproved(date: ApiDate): boolean {
  const comparison = useComparisonForDate(date);
  return (comparison?.salesChange ?? 0) > 0;
}


/**
 * Hook for getting improvement percentage
 * 
 * @returns Percentage of days with improvement
 * 
 * @example
 * ```
 * const improvementRate = useImprovementRate();
 * return <Text>Improvement Rate: {improvementRate.toFixed(1)}%</Text>;
 * ```
 */
export function useImprovementRate(): number {
  const improvedDays = useAppSelector(selectImprovedDays);
  const dayCount = useAppSelector(selectDayCount);
  
  return useMemo(() => {
    if (dayCount === 0) return 0;
    return (improvedDays.length / dayCount) * 100;
  }, [improvedDays.length, dayCount]);
}

/**
 * Hook for getting weekday vs weekend comparison
 * 
 * @returns Object with weekday and weekend metrics
 * 
 * @example
 * ```
 * const { weekdayAvg, weekendAvg, ratio } = useWeekdayWeekendComparison();
 * return <ComparisonCard weekday={weekdayAvg} weekend={weekendAvg} />;
 * ```
 */
export function useWeekdayWeekendComparison() {
  const weekPattern = useAppSelector(selectWeekPattern);
  
  return useMemo(() => {
    if (!weekPattern) {
      return {
        weekdayAvg: 0,
        weekendAvg: 0,
        ratio: 0,
      };
    }
    
    return {
      weekdayAvg: weekPattern.weekdayAvgSales,
      weekendAvg: weekPattern.weekendAvgSales,
      ratio: weekPattern.weekendWeekdayRatio,
    };
  }, [weekPattern]);
}

/**
 * Hook for getting trend summary text
 * 
 * @returns Formatted trend summary
 * 
 * @example
 * ```
 * const summary = useTrendSummaryText();
 * return <Text>{summary}</Text>; // "3 days improved, 2 declined"
 * ```
 */
export function useTrendSummaryText(): string {
  const daysByTrend = useAppSelector(selectDaysByTrend);
  
  return useMemo(() => {
    const improved = daysByTrend.significantImprovement + daysByTrend.improvement;
    const declined = daysByTrend.decline + daysByTrend.significantDecline;
    const stable = daysByTrend.stable;
    
    const parts: string[] = [];
    if (improved > 0) {
      parts.push(`${improved} day${improved !== 1 ? 's' : ''} improved`);
    }
    if (declined > 0) {
      parts.push(`${declined} declined`);
    }
    if (stable > 0) {
      parts.push(`${stable} stable`);
    }
    
    return parts.join(', ') || 'No trend data';
  }, [daysByTrend]);
}

/**
 * Hook for checking if sales are consistent
 * 
 * @param threshold - Variability threshold (default: 0.15)
 * @returns Boolean indicating if sales are consistent
 * 
 * @example
 * ```
 * const isConsistent = useIsSalesConsistent();
 * return <ConsistencyBadge consistent={isConsistent} />;
 * ```
 */
export function useIsSalesConsistent(threshold: number = 0.15): boolean {
  const salesVariability = useAppSelector(selectSalesVariability);
  return salesVariability <= threshold;
}

/**
 * Hook for getting strongest/weakest day info
 * 
 * @returns Object with strongest and weakest day info
 * 
 * @example
 * ```
 * const { strongest, weakest } = useStrongestWeakestDay();
 * return <DayRanking strongest={strongest} weakest={weakest} />;
 * ```
 */
export function useStrongestWeakestDay() {
  const strongestDay = useAppSelector(selectStrongestDay);
  const weakestDay = useAppSelector(selectWeakestDay);
  
  return useMemo(
    () => ({ strongest: strongestDay, weakest: weakestDay }),
    [strongestDay, weakestDay]
  );
}
