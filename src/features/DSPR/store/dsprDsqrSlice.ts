/**
 * ============================================================================
 * DSPR DSQR SLICE
 * ============================================================================
 * Domain: DSQR (Delivery Service Quality Rating)
 * 
 * Responsibility:
 * - Derives DSQR data from central DSPR API response
 * - Processes raw DSQR data into platform-specific metrics
 * - Calculates performance summaries across DoorDash, UberEats, GrubHub
 * - Generates performance alerts based on thresholds
 * - Manages filtering and configuration
 * - Provides selectors for accessing DSQR metrics and insights
 * 
 * Data Flow:
 * 1. Central dsprApiSlice fetches full DsprApiResponse
 * 2. This slice listens to fetchDsprData.fulfilled
 * 3. Extracts reports.daily.dailyDSQRData
 * 4. Processes into ProcessedDSQRData with platform breakdowns
 * 5. Components consume via useDsqr hook
 * 
 * Related Files:
 * - Source: state/dsprApiSlice.ts (central API state)
 * - Types: types/dspr.dsqr.ts (all DSQR types)
 * - Hook: hooks/useDsqr.ts (React hook)
 * 
 * State Shape:
 * - raw: DailyDSQRData | null (from API)
 * - processed: ProcessedDSQRData | null (enriched data)
 * - config: DSQRAnalysisConfig (thresholds and settings)
 * - filter: DSQRFilter (current filter settings)
 * - lastProcessed: string | null (timestamp)
 */

import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '@/store';
import { fetchDsprData } from './dsprApiSlice';
import type { StoreId, ApiDate } from '../types/dspr.common';
import {
  type DailyDSQRData,
  type DSQRScoreData,
  type DSQRTrackingData,
  type ProcessedDSQRData,
  type PlatformData,
  type PlatformMetrics,
  type PlatformKPI,
  type DSQRSummary,
  type PerformanceAlert,
  DeliveryPlatform,
  TrackingStatus,
  PerformanceLevel,
  PerformanceGrade,
  AlertSeverity,
  AlertPriority,
  MetricUnit,
  type DSQRFilter,
  type DSQRAnalysisConfig,
  type PerformanceThresholds,
  type AlertConfiguration,
  defaultDSQRConfig,
  isOnTrack,
} from '../types/dspr.dsqr';

// ============================================================================
// STATE TYPES
// ============================================================================

/**
 * DSQR slice state
 */
interface DSQRState {
  /** Raw DSQR data from API */
  raw: DailyDSQRData | null;
  
  /** Processed DSQR with platform metrics and alerts */
  processed: ProcessedDSQRData | null;
  
  /** Analysis configuration */
  config: DSQRAnalysisConfig;
  
  /** Current filter settings */
  filter: DSQRFilter;
  
  /** Timestamp when data was last processed */
  lastProcessed: string | null;
}

// ============================================================================
// INITIAL STATE
// ============================================================================

const initialState: DSQRState = {
  raw: null,
  processed: null,
  config: defaultDSQRConfig,
  filter: {},
  lastProcessed: null,
};

// ============================================================================
// PROCESSING FUNCTIONS
// ============================================================================

/**
 * Processes DoorDash metrics
 */
function processDoorDashMetrics(
  score: DSQRScoreData,
  tracking: DSQRTrackingData
): PlatformMetrics {
  const kpis: PlatformKPI[] = [
    {
      name: 'DD_Ratings_Average_Rating',
      label: 'Average Rating',
      value: score.DD_Ratings_Average_Rating,
      status: tracking.DD_NAOT_Ratings_Average_Rating,
      unit: MetricUnit.RATING,
      isCritical: true,
      target: 4.5,
    },
    {
      name: 'DD_Most_Loved_Restaurant',
      label: 'Most Loved Restaurant',
      value: score.DD_Most_Loved_Restaurant === 1 ? 'Yes' : 'No',
      status: TrackingStatus.ON_TRACK, // Assuming always tracked
      unit: MetricUnit.COUNT,
      isCritical: false,
    },
    {
      name: 'DD_Optimization_Score',
      label: 'Optimization Score',
      value: score.DD_Optimization_Score,
      status: TrackingStatus.ON_TRACK, // Assuming always tracked
      unit: MetricUnit.RATING,
      isCritical: false,
    },
    {
      name: 'DD_Cancellations_Sales_Lost',
      label: 'Cancellations Sales Lost',
      value: score.DD_Cancellations_Sales_Lost,
      status: tracking.DD_NAOT_Cancellations_Sales_Lost,
      unit: MetricUnit.CURRENCY,
      isCritical: true,
    },
    {
      name: 'DD_Missing_or_Incorrect_Error_Charges',
      label: 'Error Charges',
      value: score.DD_Missing_or_Incorrect_Error_Charges,
      status: tracking.DD_NAOT_Missing_or_Incorrect_Error_Charges,
      unit: MetricUnit.CURRENCY,
      isCritical: true,
    },
    {
      name: 'DD_Avoidable_Wait_M_Sec',
      label: 'Avoidable Wait Time',
      value: score.DD_Avoidable_Wait_M_Sec,
      status: tracking.DD_NAOT_Avoidable_Wait_M_Sec,
      unit: MetricUnit.TIME_MINUTES,
      isCritical: true,
    },
    {
      name: 'DD_Total_Dasher_Wait_M_Sec',
      label: 'Total Dasher Wait',
      value: score.DD_Total_Dasher_Wait_M_Sec,
      status: tracking.DD_NAOT_Total_Dasher_Wait_M_Sec,
      unit: MetricUnit.TIME_MINUTES,
      isCritical: false,
    },
    {
      name: 'DD_Downtime_H_MM',
      label: 'Downtime',
      value: score.DD_Downtime_H_MM,
      status: tracking.DD_NAOT_Downtime_H_MM,
      unit: MetricUnit.TIME_HOURS,
      isCritical: true,
    },
    {
      name: 'DD_Reviews_Responded',
      label: 'Reviews Responded',
      value: score.DD_Reviews_Responded,
      status: TrackingStatus.ON_TRACK, // Assuming always tracked
      unit: MetricUnit.PERCENTAGE,
      isCritical: false,
    },
  ];
  
  const onTrackCount = kpis.filter(kpi => isOnTrack(kpi.status)).length;
  const totalApplicableMetrics = kpis.filter(kpi => kpi.status !== TrackingStatus.NOT_APPLICABLE).length;
  const performancePercentage = totalApplicableMetrics > 0 ? (onTrackCount / totalApplicableMetrics) * 100 : 0;
  
  return {
    platform: DeliveryPlatform.DOORDASH,
    overallRating: score.DD_Ratings_Average_Rating,
    kpis,
    onTrackCount,
    totalApplicableMetrics,
    performancePercentage,
    performanceLevel: calculatePerformanceLevel(performancePercentage),
  };
}

/**
 * Processes UberEats metrics
 */
function processUberEatsMetrics(
  score: DSQRScoreData,
  tracking: DSQRTrackingData
): PlatformMetrics {
  const kpis: PlatformKPI[] = [
    {
      name: 'UE_Customer_reviews_overview',
      label: 'Customer Reviews',
      value: score.UE_Customer_reviews_overview,
      status: tracking.UE_NAOT_Customer_reviews_overview,
      unit: MetricUnit.RATING,
      isCritical: true,
      target: 4.3,
    },
    {
      name: 'UE_Cost_of_Refunds',
      label: 'Cost of Refunds',
      value: score.UE_Cost_of_Refunds,
      status: tracking.UE_NAOT_Cost_of_Refunds,
      unit: MetricUnit.CURRENCY,
      isCritical: true,
    },
    {
      name: 'UE_Unfulfilled_order_rate',
      label: 'Unfulfilled Order Rate',
      value: score.UE_Unfulfilled_order_rate,
      status: tracking.UE_NAOT_Unfulfilled_order_rate,
      unit: MetricUnit.PERCENTAGE,
      isCritical: true,
    },
    {
      name: 'UE_Time_unavailable_during_open_hours_hh_mm',
      label: 'Time Unavailable',
      value: score.UE_Time_unavailable_during_open_hours_hh_mm,
      status: tracking.UE_NAOT_Time_unavailable_during_open_hours_hh_mm,
      unit: MetricUnit.TIME_HOURS,
      isCritical: true,
    },
    {
      name: 'UE_Top_inaccurate_item',
      label: 'Top Inaccurate Item',
      value: score.UE_Top_inaccurate_item,
      status: TrackingStatus.ON_TRACK, // Assuming always tracked
      unit: MetricUnit.COUNT,
      isCritical: false,
    },
    {
      name: 'UE_Reviews_Responded',
      label: 'Reviews Responded',
      value: score.UE_Reviews_Responded,
      status: TrackingStatus.ON_TRACK, // Assuming always tracked
      unit: MetricUnit.PERCENTAGE,
      isCritical: false,
    },
  ];
  
  const onTrackCount = kpis.filter(kpi => isOnTrack(kpi.status)).length;
  const totalApplicableMetrics = kpis.filter(kpi => kpi.status !== TrackingStatus.NOT_APPLICABLE).length;
  const performancePercentage = totalApplicableMetrics > 0 ? (onTrackCount / totalApplicableMetrics) * 100 : 0;
  
  return {
    platform: DeliveryPlatform.UBEREATS,
    overallRating: score.UE_Customer_reviews_overview,
    kpis,
    onTrackCount,
    totalApplicableMetrics,
    performancePercentage,
    performanceLevel: calculatePerformanceLevel(performancePercentage),
  };
}

/**
 * Processes GrubHub metrics
 */
function processGrubHubMetrics(
  score: DSQRScoreData,
  tracking: DSQRTrackingData
): PlatformMetrics {
  const kpis: PlatformKPI[] = [
    {
      name: 'GH_Rating',
      label: 'Overall Rating',
      value: score.GH_Rating,
      status: tracking.GH_NAOT_Rating,
      unit: MetricUnit.RATING,
      isCritical: true,
      target: 4.0,
    },
    {
      name: 'GH_Food_was_good',
      label: 'Food Quality',
      value: score.GH_Food_was_good,
      status: tracking.GH_NAOT_Food_was_good,
      unit: MetricUnit.PERCENTAGE,
      isCritical: false,
    },
    {
      name: 'GH_Delivery_was_on_time',
      label: 'Delivery Timeliness',
      value: score.GH_Delivery_was_on_time,
      status: tracking.GH_NAOT_Delivery_was_on_time,
      unit: MetricUnit.PERCENTAGE,
      isCritical: false,
    },
    {
      name: 'GH_Order_was_accurate',
      label: 'Order Accuracy',
      value: score.GH_Order_was_accurate,
      status: tracking.GH_NAOT_Order_was_accurate,
      unit: MetricUnit.PERCENTAGE,
      isCritical: false,
    },
  ];
  
  const onTrackCount = kpis.filter(kpi => isOnTrack(kpi.status)).length;
  const totalApplicableMetrics = kpis.filter(kpi => kpi.status !== TrackingStatus.NOT_APPLICABLE).length;
  const performancePercentage = totalApplicableMetrics > 0 ? (onTrackCount / totalApplicableMetrics) * 100 : 0;
  
  return {
    platform: DeliveryPlatform.GRUBHUB,
    overallRating: score.GH_Rating,
    kpis,
    onTrackCount,
    totalApplicableMetrics,
    performancePercentage,
    performanceLevel: calculatePerformanceLevel(performancePercentage),
  };
}

/**
 * Calculates performance level based on percentage
 */
function calculatePerformanceLevel(percentage: number): PerformanceLevel {
  if (percentage >= 95) return PerformanceLevel.EXCELLENT;
  if (percentage >= 85) return PerformanceLevel.GOOD;
  if (percentage >= 70) return PerformanceLevel.FAIR;
  if (percentage >= 50) return PerformanceLevel.POOR;
  return PerformanceLevel.CRITICAL;
}

/**
 * Calculates overall performance grade
 */
function calculatePerformanceGrade(percentage: number): PerformanceGrade {
  if (percentage >= 97) return PerformanceGrade.A_PLUS;
  if (percentage >= 93) return PerformanceGrade.A;
  if (percentage >= 90) return PerformanceGrade.B_PLUS;
  if (percentage >= 85) return PerformanceGrade.B;
  if (percentage >= 80) return PerformanceGrade.C_PLUS;
  if (percentage >= 70) return PerformanceGrade.C;
  if (percentage >= 60) return PerformanceGrade.D;
  return PerformanceGrade.F;
}

/**
 * Generates performance alerts
 */
function generateAlerts(
  platforms: PlatformData,
  config: DSQRAnalysisConfig
): PerformanceAlert[] {
  if (!config.alertConfig.enableAlerts) return [];
  
  const alerts: PerformanceAlert[] = [];
  
  // Check each platform
  Object.values(platforms).forEach((platformMetrics: PlatformMetrics) => {
    platformMetrics.kpis.forEach((kpi) => {
      // Only alert on off-track critical metrics
      if (kpi.isCritical && !isOnTrack(kpi.status)) {
        let severity: AlertSeverity = AlertSeverity.WARNING;
        let priority: AlertPriority = AlertPriority.MEDIUM;
        
        // Determine severity based on metric type
        if (kpi.unit === MetricUnit.RATING && typeof kpi.value === 'number') {
          if (kpi.value < 4.0) {
            severity = AlertSeverity.CRITICAL;
            priority = AlertPriority.URGENT;
          } else if (kpi.value < 4.3) {
            severity = AlertSeverity.ERROR;
            priority = AlertPriority.HIGH;
          }
        }
        
        alerts.push({
          severity,
          platform: platformMetrics.platform,
          metric: kpi.name,
          message: `${kpi.label} is off track`,
          currentValue: kpi.value,
          targetValue: kpi.target,
          recommendations: generateRecommendations(kpi),
          priority,
        });
      }
    });
  });
  
  // Sort by priority and limit
  return alerts
    .sort((a, b) => {
      const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    })
    .slice(0, config.alertConfig.maxAlerts);
}

/**
 * Generates recommendations for a KPI
 */
function generateRecommendations(kpi: PlatformKPI): string[] {
  const recommendations: string[] = [];
  
  if (kpi.unit === MetricUnit.RATING) {
    recommendations.push('Review recent customer feedback');
    recommendations.push('Implement quality control measures');
  } else if (kpi.unit === MetricUnit.CURRENCY) {
    recommendations.push('Analyze root causes of charges');
    recommendations.push('Improve order accuracy processes');
  } else if (kpi.unit === MetricUnit.TIME_MINUTES || kpi.unit === MetricUnit.TIME_HOURS) {
    recommendations.push('Optimize kitchen workflow');
    recommendations.push('Review staffing levels');
  }
  
  return recommendations;
}

/**
 * Processes raw DSQR data into enriched format
 */
function processDSQRData(
  raw: DailyDSQRData,
  storeId: StoreId,
  date: ApiDate,
  config: DSQRAnalysisConfig
): ProcessedDSQRData {
  // Process each platform
  const doorDash = processDoorDashMetrics(raw.score, raw.is_on_track);
  const uberEats = processUberEatsMetrics(raw.score, raw.is_on_track);
  const grubHub = processGrubHubMetrics(raw.score, raw.is_on_track);
  
  const platforms: PlatformData = {
    doorDash,
    uberEats,
    grubHub,
  };
  
  // Calculate overall summary
  const allPlatforms = [doorDash, uberEats, grubHub];
  const averageRating = allPlatforms.reduce((sum, p) => sum + p.overallRating, 0) / allPlatforms.length;
  const totalOnTrack = allPlatforms.reduce((sum, p) => sum + p.onTrackCount, 0);
  const totalApplicable = allPlatforms.reduce((sum, p) => sum + p.totalApplicableMetrics, 0);
  const overallPerformance = totalApplicable > 0 ? (totalOnTrack / totalApplicable) * 100 : 0;
  
  // Find best and worst platforms
  const sortedByPerformance = [...allPlatforms].sort((a, b) => b.performancePercentage - a.performancePercentage);
  const bestPlatform = sortedByPerformance[0].platform;
  const attentionRequired = sortedByPerformance[sortedByPerformance.length - 1].platform;
  
  const overallSummary: DSQRSummary = {
    averageRating,
    totalOnTrack,
    totalApplicable,
    overallPerformance,
    bestPlatform,
    attentionRequired,
    performanceGrade: calculatePerformanceGrade(overallPerformance),
  };
  
  // Generate alerts
  const alerts = generateAlerts(platforms, config);
  
  return {
    storeId,
    date,
    platforms,
    overallSummary,
    alerts,
  };
}

// ============================================================================
// SLICE
// ============================================================================

const dsprDsqrSlice = createSlice({
  name: 'dsprDsqr',
  initialState,
  reducers: {
    /**
     * Updates filter settings
     */
    setFilter(state, action: PayloadAction<Partial<DSQRFilter>>) {
      state.filter = {
        ...state.filter,
        ...action.payload,
      };
    },
    
    /**
     * Clears filter
     */
    clearFilter(state) {
      state.filter = {};
    },
    
    /**
     * Updates performance thresholds
     */
    setPerformanceThresholds(state, action: PayloadAction<Partial<PerformanceThresholds>>) {
      state.config.performanceThresholds = {
        ...state.config.performanceThresholds,
        ...action.payload,
      };
      
      // Re-process data with new thresholds
      if (state.raw && state.processed) {
        state.processed = processDSQRData(
          state.raw,
          state.processed.storeId,
          state.processed.date,
          state.config
        );
        state.lastProcessed = new Date().toISOString();
      }
    },
    
    /**
     * Updates alert configuration
     */
    setAlertConfig(state, action: PayloadAction<Partial<AlertConfiguration>>) {
      state.config.alertConfig = {
        ...state.config.alertConfig,
        ...action.payload,
      };
      
      // Re-process to update alerts
      if (state.raw && state.processed) {
        state.processed = processDSQRData(
          state.raw,
          state.processed.storeId,
          state.processed.date,
          state.config
        );
        state.lastProcessed = new Date().toISOString();
      }
    },
    
    /**
     * Toggles alerts on/off
     */
    toggleAlerts(state, action: PayloadAction<boolean>) {
      state.config.alertConfig.enableAlerts = action.payload;
      
      // Re-process to update alerts
      if (state.raw && state.processed) {
        state.processed = processDSQRData(
          state.raw,
          state.processed.storeId,
          state.processed.date,
          state.config
        );
        state.lastProcessed = new Date().toISOString();
      }
    },
    
    /**
     * Resets configuration to defaults
     */
    resetConfig(state) {
      state.config = defaultDSQRConfig;
      
      // Re-process if data exists
      if (state.raw && state.processed) {
        state.processed = processDSQRData(
          state.raw,
          state.processed.storeId,
          state.processed.date,
          state.config
        );
        state.lastProcessed = new Date().toISOString();
      }
    },
    
    /**
     * Clears all DSQR data
     */
    clearDsqrData(state) {
      state.raw = null;
      state.processed = null;
      state.lastProcessed = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // ========================================================================
      // LISTEN TO CENTRAL API FETCH
      // ========================================================================
      .addCase(fetchDsprData.fulfilled, (state, action) => {
        const dsqrData = action.payload.reports?.daily?.dailyDSQRData as unknown as DailyDSQRData;
        const fv = (action.payload as any).FilteringValues ?? (action.payload as any)['Filtering Values'];
        const store = fv?.store ?? action.meta.arg.store;
        const date = fv?.date ?? action.meta.arg.date;
        
        if (!dsqrData) {
          if (process.env.NODE_ENV === 'development') {
            console.warn('[DSQR] No DSQR data in API response');
          }
          return;
        }
        
        try {
          // Store raw data
          state.raw = dsqrData;
          
          // Process DSQR data
          state.processed = processDSQRData(
            dsqrData,
            store,
            date,
            state.config
          );
          
          // Update timestamp
          state.lastProcessed = new Date().toISOString();
          
          if (process.env.NODE_ENV === 'development') {
            console.log('[DSQR] Data processed:', {
              store,
              date,
              overallPerformance: state.processed.overallSummary.overallPerformance,
              grade: state.processed.overallSummary.performanceGrade,
              alertCount: state.processed.alerts.length,
            });
          }
        } catch (error) {
          console.error('[DSQR] Processing error:', error);
        }
      })
      
      // Keep stale data on error
      .addCase(fetchDsprData.rejected, (_state) => {
        if (process.env.NODE_ENV === 'development') {
          console.log('[DSQR] Keeping stale data after API error');
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
  setPerformanceThresholds,
  setAlertConfig,
  toggleAlerts,
  resetConfig,
  clearDsqrData,
} = dsprDsqrSlice.actions;

// ============================================================================
// SELECTORS
// ============================================================================

/**
 * Selects the entire DSQR state
 */
export const selectDsqrState = (state: RootState): DSQRState => 
  state.dsprDsqr;

/**
 * Selects raw DSQR data
 */
export const selectRawDsqr = (state: RootState): DailyDSQRData | null => 
  state.dsprDsqr.raw;

/**
 * Selects processed DSQR data
 */
export const selectProcessedDsqr = (state: RootState): ProcessedDSQRData | null => 
  state.dsprDsqr.processed;

/**
 * Selects platform data
 */
export const selectPlatformData = (state: RootState): PlatformData | null => 
  state.dsprDsqr.processed?.platforms || null;

/**
 * Selects DoorDash metrics
 */
export const selectDoorDashMetrics = (state: RootState): PlatformMetrics | null => 
  state.dsprDsqr.processed?.platforms.doorDash || null;

/**
 * Selects UberEats metrics
 */
export const selectUberEatsMetrics = (state: RootState): PlatformMetrics | null => 
  state.dsprDsqr.processed?.platforms.uberEats || null;

/**
 * Selects GrubHub metrics
 */
export const selectGrubHubMetrics = (state: RootState): PlatformMetrics | null => 
  state.dsprDsqr.processed?.platforms.grubHub || null;

/**
 * Selects overall summary
 */
export const selectDsqrSummary = (state: RootState): DSQRSummary | null => 
  state.dsprDsqr.processed?.overallSummary || null;

/**
 * Selects performance alerts
 */
export const selectDsqrAlerts = (state: RootState): PerformanceAlert[] => 
  state.dsprDsqr.processed?.alerts || [];

/**
 * Selects critical alerts only
 */
export const selectCriticalDsqrAlerts = (state: RootState): PerformanceAlert[] => 
  state.dsprDsqr.processed?.alerts.filter(a => a.severity === AlertSeverity.CRITICAL) || [];

/**
 * Selects urgent alerts only
 */
export const selectUrgentDsqrAlerts = (state: RootState): PerformanceAlert[] => 
  state.dsprDsqr.processed?.alerts.filter(a => a.priority === AlertPriority.URGENT) || [];

/**
 * Selects current configuration
 */
export const selectDsqrConfig = (state: RootState): DSQRAnalysisConfig => 
  state.dsprDsqr.config;

/**
 * Selects current filter
 */
export const selectDsqrFilter = (state: RootState): DSQRFilter => 
  state.dsprDsqr.filter;

/**
 * Selects last processed timestamp
 */
export const selectLastProcessedTime = (state: RootState): string | null => 
  state.dsprDsqr.lastProcessed;

/**
 * Selects store ID
 */
export const selectDsqrStore = (state: RootState): StoreId | null => 
  state.dsprDsqr.processed?.storeId || null;

/**
 * Selects business date
 */
export const selectDsqrDate = (state: RootState): ApiDate | null => 
  state.dsprDsqr.processed?.date || null;

/**
 * Selects whether DSQR data exists
 */
export const selectHasDsqrData = (state: RootState): boolean => 
  state.dsprDsqr.raw !== null;

/**
 * Selects overall performance percentage
 */
export const selectOverallPerformance = (state: RootState): number => 
  state.dsprDsqr.processed?.overallSummary.overallPerformance || 0;

/**
 * Selects performance grade
 */
export const selectPerformanceGrade = (state: RootState): PerformanceGrade | null => 
  state.dsprDsqr.processed?.overallSummary.performanceGrade || null;

/**
 * Selects average rating across all platforms
 */
export const selectAverageRating = (state: RootState): number => 
  state.dsprDsqr.processed?.overallSummary.averageRating || 0;

/**
 * Selects best performing platform
 */
export const selectBestPlatform = (state: RootState): DeliveryPlatform | null => 
  state.dsprDsqr.processed?.overallSummary.bestPlatform || null;

/**
 * Selects platform needing attention
 */
export const selectAttentionRequiredPlatform = (state: RootState): DeliveryPlatform | null => 
  state.dsprDsqr.processed?.overallSummary.attentionRequired || null;

/**
 * Selects whether alerts are enabled
 */
export const selectAlertsEnabled = (state: RootState): boolean => 
  state.dsprDsqr.config.alertConfig.enableAlerts;

/**
 * Selects alert count
 */
export const selectAlertCount = (state: RootState): number => 
  state.dsprDsqr.processed?.alerts.length || 0;

/**
 * Selects whether there are critical alerts
 */
export const selectHasCriticalAlerts = (state: RootState): boolean => 
  (state.dsprDsqr.processed?.alerts.some(a => a.severity === AlertSeverity.CRITICAL)) || false;

/**
 * Selects whether there are urgent alerts
 */
export const selectHasUrgentAlerts = (state: RootState): boolean => 
  (state.dsprDsqr.processed?.alerts.some(a => a.priority === AlertPriority.URGENT)) || false;

/**
 * Selects total metrics on track
 */
export const selectTotalOnTrack = (state: RootState): number => 
  state.dsprDsqr.processed?.overallSummary.totalOnTrack || 0;

/**
 * Selects total applicable metrics
 */
export const selectTotalApplicable = (state: RootState): number => 
  state.dsprDsqr.processed?.overallSummary.totalApplicable || 0;

// ============================================================================
// REDUCER EXPORT
// ============================================================================

export default dsprDsqrSlice.reducer;

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type { DSQRState };
