/**
 * ============================================================================
 * DSPR DAILY BY DATE SLICE
 * ============================================================================
 * Domain: Daily DSPR By Date (Daily Breakdown with Week Comparison)
 *
 * Responsibility:
 * - Derives daily-by-date DSPR data from central DSPR API response
 * - Processes raw daily breakdown into date-keyed entries
 * - Creates day-over-day and week-over-week comparisons
 * - Generates timeline metrics for visualization
 * - Analyzes week patterns and day-of-week performance
 * - Identifies best/worst performing days
 * - Manages filtering and sorting configuration
 * - Provides selectors for timeline and comparison views
 *
 * Data Flow:
 * 1. Central dsprApiSlice fetches full DsprApiResponse
 * 2. This slice listens to fetchDsprData.fulfilled
 * 3. Extracts reports.weekly.DailyDSPRByDate
 * 4. Parses into array of entries (current + prev week comparison)
 * 5. Creates comparisons, timeline metrics, and pattern analysis
 * 6. Components consume via useDailyDsprByDate hook
 *
 * Related Files:
 * - Source: state/dsprApiSlice.ts (central API state)
 * - Types: types/dspr.dailyByDate.ts (daily by date types)
 * - Hook: hooks/useDailyDsprByDate.ts (React hook)
 *
 * State Shape:
 * - raw: DailyDSPRByDate | null (from API)
 * - processed: ProcessedDailyByDate | null (enriched data)
 * - weekPattern: WeekPatternAnalysis | null (day-of-week analysis)
 * - config: DailyByDateConfig (filter, sort, thresholds)
 * - lastProcessed: string | null (timestamp)
 */

import { createSlice, createSelector, type PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '@/store';
import { fetchDsprData } from './dsprApiSlice';
import type { StoreId, WeekNumber, ApiDate } from '../types/dspr.common';
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
  defaultDailyByDateConfig,
  parseDailyByDate,
  createDayComparison,
  createTimelineMetrics,
  calculateDailyAverages,
  findBestDay,
  findWorstDay,
  filterDailyByDate,
  sortDailyByDate,
  createWeekPatternAnalysis,
  toApiDate,
} from '../types/dspr.dailyByDate';

// ============================================================================
// STATE TYPES
// ============================================================================

/**
 * Daily by date DSPR slice state
 */
interface DailyByDateState {
  /** Raw daily by date data from API */
  raw: DailyDSPRByDate | null;

  /** Processed daily by date with comparisons */
  processed: ProcessedDailyByDate | null;

  /** Week pattern analysis */
  weekPattern: WeekPatternAnalysis | null;

  /** Configuration */
  config: DailyByDateConfig;

  /** Timestamp when data was last processed */
  lastProcessed: string | null;
}

// ============================================================================
// INITIAL STATE
// ============================================================================

const initialState: DailyByDateState = {
  raw: null,
  processed: null,
  weekPattern: null,
  config: defaultDailyByDateConfig,
  lastProcessed: null,
};

// ============================================================================
// PROCESSING FUNCTIONS
// ============================================================================

/**
 * Processes raw daily by date data into enriched format
 */
function processDailyByDate(
  raw: DailyDSPRByDate,
  store: StoreId,
  week: WeekNumber,
  config: DailyByDateConfig,
): ProcessedDailyByDate {
  // Parse into array of entries
  let entries = parseDailyByDate(raw);

  // Apply filter
  if (Object.keys(config.filter).length > 0) {
    entries = filterDailyByDate(entries, config.filter);
  }

  // Apply sort
  entries = sortDailyByDate(entries, config.sort);

  // Create comparisons
  const comparisons: Record<ApiDate, DayComparison> = {};
  entries.forEach((entry) => {
    const comparison = createDayComparison(entry, config.comparisonThresholds);
    comparisons[entry.date] = comparison;
  });

  // Create timeline metrics
  const timeline = createTimelineMetrics(entries);

  // Find best and worst days
  const bestDay = findBestDay(entries);
  const worstDay = findWorstDay(entries);

  // Calculate averages
  const averages = calculateDailyAverages(entries);

  if (!bestDay || !worstDay) {
    throw new Error('No valid days found in daily by date data');
  }

  return {
    store,
    week,
    entries,
    comparisons,
    timeline,
    bestDay,
    worstDay,
    averages,
    processedAt: new Date().toISOString(),
  };
}

// ============================================================================
// SLICE
// ============================================================================

const dsprDailyByDateSlice = createSlice({
  name: 'dsprDailyByDate',
  initialState,
  reducers: {
    /**
     * Updates filter settings
     */
    setFilter(state, action: PayloadAction<Partial<DailyByDateFilter>>) {
      const incoming = action.payload;

      state.config.filter = {
        ...state.config.filter,
        ...incoming,
        startDate: toApiDate(
          incoming.startDate ?? state.config.filter.startDate,
        ),
        endDate: toApiDate(incoming.endDate ?? state.config.filter.endDate),
      };

      // Re-process data with new filter
      if (state.raw && state.processed) {
        try {
          state.processed = processDailyByDate(
            state.raw,
            state.processed.store,
            state.processed.week,
            state.config,
          );

          // Re-calculate week pattern with filtered data
          state.weekPattern = createWeekPatternAnalysis(
            state.processed.entries,
          );
          state.lastProcessed = new Date().toISOString();
        } catch (error) {
          console.error('[Daily By Date] Re-processing error:', error);
        }
      }
    },

    /**
     * Clears filter
     */
    clearFilter(state) {
      state.config.filter = {};

      // Re-process data without filter
      if (state.raw && state.processed) {
        try {
          state.processed = processDailyByDate(
            state.raw,
            state.processed.store,
            state.processed.week,
            state.config,
          );

          state.weekPattern = createWeekPatternAnalysis(
            state.processed.entries,
          );
          state.lastProcessed = new Date().toISOString();
        } catch (error) {
          console.error('[Daily By Date] Re-processing error:', error);
        }
      }
    },

    /**
     * Updates sort order
     */
    setSort(state, action: PayloadAction<DailyByDateSort>) {
      state.config.sort = action.payload;

      // Re-process data with new sort
      if (state.raw && state.processed) {
        try {
          state.processed = processDailyByDate(
            state.raw,
            state.processed.store,
            state.processed.week,
            state.config,
          );
          state.lastProcessed = new Date().toISOString();
        } catch (error) {
          console.error('[Daily By Date] Re-processing error:', error);
        }
      }
    },

    /**
     * Updates comparison thresholds
     */
    setComparisonThresholds(
      state,
      action: PayloadAction<Partial<ComparisonThresholds>>,
    ) {
      state.config.comparisonThresholds = {
        ...state.config.comparisonThresholds,
        ...action.payload,
      };

      // Re-process data with new thresholds
      if (state.raw && state.processed) {
        try {
          state.processed = processDailyByDate(
            state.raw,
            state.processed.store,
            state.processed.week,
            state.config,
          );
          state.lastProcessed = new Date().toISOString();
        } catch (error) {
          console.error('[Daily By Date] Re-processing error:', error);
        }
      }
    },

    /**
     * Resets configuration to defaults
     */
    resetConfig(state) {
      state.config = defaultDailyByDateConfig;

      // Re-process if data exists
      if (state.raw && state.processed) {
        try {
          state.processed = processDailyByDate(
            state.raw,
            state.processed.store,
            state.processed.week,
            state.config,
          );

          state.weekPattern = createWeekPatternAnalysis(
            state.processed.entries,
          );
          state.lastProcessed = new Date().toISOString();
        } catch (error) {
          console.error('[Daily By Date] Re-processing error:', error);
        }
      }
    },

    /**
     * Clears all daily by date data
     */
    clearDailyByDateData(state) {
      state.raw = null;
      state.processed = null;
      state.weekPattern = null;
      state.lastProcessed = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // ========================================================================
      // LISTEN TO CENTRAL API FETCH
      // ========================================================================
      .addCase(fetchDsprData.fulfilled, (state, action) => {
  const dailyByDateData = action.payload.reports.weekly
    .DailyDSPRByDate as unknown as DailyDSPRByDate;

  const filteringValues =
    (action.payload as any).FilteringValues ??
    (action.payload as any)['Filtering Values'];

  if (!filteringValues) {
    console.error('[Daily By Date] Missing FilteringValues in API payload');
    return;
  }

        try {
          // Store raw data
          state.raw = dailyByDateData;

          // Process daily by date data
          state.processed = processDailyByDate(
    dailyByDateData,
    filteringValues.store,
    filteringValues.week,
    state.config,
  );

          // Create week pattern analysis
          state.weekPattern = createWeekPatternAnalysis(
            state.processed.entries,
          );

          // Update timestamp
          state.lastProcessed = new Date().toISOString();

          if (process.env.NODE_ENV === 'development') {
            console.log('[Daily By Date] Data processed:', {
              store: filteringValues.store,
              week: filteringValues.week,
              daysCount: state.processed.entries.length,
              bestDaySales: state.processed.bestDay.current.TotalSales,
              worstDaySales: state.processed.worstDay.current.TotalSales,
            });
          }
        } catch (error) {
          console.error('[Daily By Date] Processing error:', error);
        }
      })

      // Keep stale data on error
      .addCase(fetchDsprData.rejected, (_state) => {
        if (process.env.NODE_ENV === 'development') {
          console.log('[Daily By Date] Keeping stale data after API error');
        }
      });
  },
});

// ============================================================================
// ACTIONS
// ============================================================================

export const {
  setFilter,
  clearFilter,
  setSort,
  setComparisonThresholds,
  resetConfig,
  clearDailyByDateData,
} = dsprDailyByDateSlice.actions;

// ============================================================================
// SELECTORS
// ============================================================================
// Stable fallbacks to avoid new references
const EMPTY_ENTRIES: DailyDSPRByDateEntry[] = [];
const EMPTY_COMPARISONS: Record<ApiDate, DayComparison> = {};
const EMPTY_DAY_OF_WEEK: DayOfWeekAnalysis[] = [];
const EMPTY_DATES: ApiDate[] = [];

/**
 * Selects the entire daily by date state
 */
export const selectDailyByDateState = (state: RootState): DailyByDateState =>
  state.dsprDailyByDate;

/**
 * Selects raw daily by date data
 */
export const selectRawDailyByDate = (
  state: RootState,
): DailyDSPRByDate | null => state.dsprDailyByDate.raw;

/**
 * Selects processed daily by date data
 */
export const selectProcessedDailyByDate = (
  state: RootState,
): ProcessedDailyByDate | null => state.dsprDailyByDate.processed;

/**
 * Selects all date entries
 */
export const selectDailyEntries = (state: RootState): DailyDSPRByDateEntry[] =>
  state.dsprDailyByDate.processed?.entries ?? EMPTY_ENTRIES;

/**
 * Selects comparisons map
 */
export const selectDailyComparisons = (
  state: RootState,
): Record<ApiDate, DayComparison> =>
  state.dsprDailyByDate.processed?.comparisons ?? EMPTY_COMPARISONS;

/**
 * Selects timeline metrics
 */
export const selectTimelineMetrics = (
  state: RootState,
): TimelineMetrics | null => state.dsprDailyByDate.processed?.timeline || null;

/**
 * Selects best performing day
 */
export const selectBestDay = (state: RootState): DailyDSPRByDateEntry | null =>
  state.dsprDailyByDate.processed?.bestDay || null;

/**
 * Selects worst performing day
 */
export const selectWorstDay = (state: RootState): DailyDSPRByDateEntry | null =>
  state.dsprDailyByDate.processed?.worstDay || null;

/**
 * Selects daily averages
 */
export const selectDailyAverages = (state: RootState): DailyAverages | null =>
  state.dsprDailyByDate.processed?.averages || null;

/**
 * Selects week pattern analysis
 */
export const selectWeekPattern = (
  state: RootState,
): WeekPatternAnalysis | null => state.dsprDailyByDate.weekPattern;

/**
 * Selects day-of-week breakdown
 */
export const selectDayOfWeekBreakdown = (
  state: RootState,
): DayOfWeekAnalysis[] =>
  state.dsprDailyByDate.weekPattern?.dayOfWeekBreakdown ?? EMPTY_DAY_OF_WEEK;

/**
 * Selects strongest day of week
 */
export const selectStrongestDay = (
  state: RootState,
): DayOfWeekAnalysis | null =>
  state.dsprDailyByDate.weekPattern?.strongestDay || null;

/**
 * Selects weakest day of week
 */
export const selectWeakestDay = (state: RootState): DayOfWeekAnalysis | null =>
  state.dsprDailyByDate.weekPattern?.weakestDay || null;

/**
 * Selects current configuration
 */
export const selectDailyByDateConfig = (state: RootState): DailyByDateConfig =>
  state.dsprDailyByDate.config;

/**
 * Selects current filter
 */
export const selectDailyByDateFilter = (state: RootState): DailyByDateFilter =>
  state.dsprDailyByDate.config.filter;

/**
 * Selects current sort
 */
export const selectDailyByDateSort = (state: RootState): DailyByDateSort =>
  state.dsprDailyByDate.config.sort;

/**
 * Selects last processed timestamp
 */
export const selectLastProcessedTime = (state: RootState): string | null =>
  state.dsprDailyByDate.lastProcessed;

/**
 * Selects store ID
 */
export const selectDailyByDateStore = (state: RootState): StoreId | null =>
  state.dsprDailyByDate.processed?.store || null;

/**
 * Selects week number
 */
export const selectDailyByDateWeek = (state: RootState): WeekNumber | null =>
  state.dsprDailyByDate.processed?.week || null;

/**
 * Selects whether daily by date data exists
 */
export const selectHasDailyByDate = (state: RootState): boolean =>
  state.dsprDailyByDate.raw !== null;

/**
 * Selects number of days
 */
export const selectDayCount = (state: RootState): number =>
  state.dsprDailyByDate.processed?.entries.length || 0;

/**
 * Selects average daily sales
 */
export const selectAvgDailySales = (state: RootState): number =>
  state.dsprDailyByDate.processed?.averages.avgSales || 0;

/**
 * Selects sales variability (consistency)
 */
export const selectSalesVariability = (state: RootState): number =>
  state.dsprDailyByDate.processed?.averages.salesVariability || 0;

/**
 * Selects weekend vs weekday ratio
 */
export const selectWeekendWeekdayRatio = (state: RootState): number =>
  state.dsprDailyByDate.weekPattern?.weekendWeekdayRatio || 0;

/**
 * Selects entries with improvement
 */
export const selectImprovedDays = (
  state: RootState,
): DailyDSPRByDateEntry[] => {
  const entries = state.dsprDailyByDate.processed?.entries ?? EMPTY_ENTRIES;
  return entries.filter((e) => e.current.TotalSales > e.prevWeek.TotalSales);
};

/**
 * Selects entries with decline
 */
export const selectDeclinedDays = (
  state: RootState,
): DailyDSPRByDateEntry[] => {
  const entries = state.dsprDailyByDate.processed?.entries ?? EMPTY_ENTRIES;
  return entries.filter((e) => e.current.TotalSales < e.prevWeek.TotalSales);
};

/**
 * Selects comparison for specific date
 */
export const selectComparisonForDate =
  (date: ApiDate) =>
  (state: RootState): DayComparison | null => {
    const comps = state.dsprDailyByDate.processed?.comparisons;
    return comps ? comps[date] ?? null : null;
  };

/**
 * Selects entry for specific date
 */
export const selectEntryForDate =
  (date: ApiDate) =>
  (state: RootState): DailyDSPRByDateEntry | null => {
    const entries = state.dsprDailyByDate.processed?.entries || [];
    return entries.find((e) => e.date === date) || null;
  };

/**
 * Selects all dates in timeline
 */
export const selectAllDates = (state: RootState): ApiDate[] =>
  state.dsprDailyByDate.processed?.timeline.dates ?? EMPTY_DATES;

/**
 * Selects whether filter is active
 */
export const selectIsFilterActive = (state: RootState): boolean =>
  Object.keys(state.dsprDailyByDate.config.filter).length > 0;

/**
 * Selects count of days by trend
 */
export const selectDaysByTrend = (
  state: RootState,
): Record<ComparisonTrend, number> => {
  const comparisons = Array.from(
    Object.values(state.dsprDailyByDate.processed?.comparisons ?? EMPTY_COMPARISONS),
  );

  return {
    significantImprovement: comparisons.filter(
      (c) => c.trend === 'significantImprovement',
    ).length,
    improvement: comparisons.filter((c) => c.trend === 'improvement').length,
    stable: comparisons.filter((c) => c.trend === 'stable').length,
    decline: comparisons.filter((c) => c.trend === 'decline').length,
    significantDecline: comparisons.filter(
      (c) => c.trend === 'significantDecline',
    ).length,
  };
};

// Memoized derived selectors
export const selectImprovedDaysMemo = createSelector(
  selectDailyEntries,
  (entries) => entries.filter((e) => e.current.TotalSales > e.prevWeek.TotalSales),
);

export const selectDeclinedDaysMemo = createSelector(
  selectDailyEntries,
  (entries) => entries.filter((e) => e.current.TotalSales < e.prevWeek.TotalSales),
);

export const selectAllDatesMemo = createSelector(
  selectTimelineMetrics,
  (timeline) => timeline?.dates ?? EMPTY_DATES,
);

export const selectDaysByTrendMemo = createSelector(
  (state: RootState) => state.dsprDailyByDate.processed?.comparisons ?? EMPTY_COMPARISONS,
  (comparisons) => {
    const values = Object.values(comparisons);
    return {
      significantImprovement: values.filter((c) => c.trend === 'significantImprovement').length,
      improvement: values.filter((c) => c.trend === 'improvement').length,
      stable: values.filter((c) => c.trend === 'stable').length,
      decline: values.filter((c) => c.trend === 'decline').length,
      significantDecline: values.filter((c) => c.trend === 'significantDecline').length,
    } as Record<ComparisonTrend, number>;
  },
);

// ============================================================================
// REDUCER EXPORT
// ============================================================================

export default dsprDailyByDateSlice.reducer;

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type { DailyByDateState };
