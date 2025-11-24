/**
 * DSPR Metrics Domain Slice
 * Redux slice for managing DSPR operational metrics and performance analysis
 * 
 * This slice:
 * - Listens to API coordinator success actions
 * - Extracts and processes both daily and weekly DSPR data
 * - Performs operational analysis and cost control calculations
 * - Generates operational alerts and performance insights
 * - Manages labor, waste, sales, and service metrics
 */

import { createSlice, createSelector, type PayloadAction } from '@reduxjs/toolkit';
import { fetchDsprData, refreshDsprData } from './coordinatorSlice';
import {
  type DailyDSPRData,
  type WeeklyDSPRData,
  type DailyDSPRByDate,
  type DailyDSPRByDateEntry,
  type DailyDSPRDayWithPrevWeek,
  type ProcessedDSPRData,
  type OperationalAlert,
  type DSPRAnalysisConfig,
  SalesChannelType,
  PerformanceLevel,
  PerformanceGrade,
  OperationalGrade,
  QualityGrade,
  CostControlGrade,
  AlertCategory,
  AlertSeverity,
  AlertPriority,
  AlertImpact,
  TrendDirection,
  TrendSignificance,
  defaultDSPRConfig,
  isWithinAcceptableRange,
  calculateVariance,
  determineTrendDirection
} from '../types/DSPRDailyWeekly';
import { ApiStatus } from '../types/common';
import type { HNRMetrics } from '../types/DSPRDailyWeekly';

// =============================================================================
// STATE INTERFACE
// =============================================================================

/**
 * State interface for DSPR metrics domain
 *
 * Breaking change note:
 * The DSPR API daily payload may now be returned as a date-keyed map
 * (DailyDSPRByDate) with optional PrevWeek comparison instead of a single
 * DailyDSPRData object. To maintain backward compatibility, this slice:
 * - Continues to expose `dailyRawData` for the selected business date
 * - Adds `dailyByDate` to store the entire date map when provided
 * - Adds `dailyPrevWeekRawData` with the selected date's PrevWeek if available
 * Existing consumers using `dailyRawData` require no changes. New consumers
 * can use `dailyByDate` for broader access.
 */
export interface DSPRMetricsState {
  /** Raw daily DSPR data from API */
  dailyRawData: DailyDSPRData | null;
  /** Raw daily DSPR data mapped by date (new API structure) */
  dailyByDate: DailyDSPRByDate | null;
  /** Previous week metrics for the selected date (if provided) */
  dailyPrevWeekRawData: DailyDSPRData | null;
  /** Raw weekly DSPR data from API */
  weeklyRawData: WeeklyDSPRData | null;
  /** Processed DSPR data with analysis */
  processedData: ProcessedDSPRData | null;
  /** Analysis configuration */
  config: DSPRAnalysisConfig;
  /** Generated operational alerts */
  alerts: OperationalAlert[];
  /** Processing status */
  status: ApiStatus;
  /** Processing errors */
  error: string | null;
  /** Last processing timestamp */
  lastProcessed: number | null;
  /** Alert generation timestamp */
  lastAlertGeneration: number | null;
  /** Performance benchmarks */
  benchmarks: PerformanceBenchmarks | null;
}

/**
 * Performance benchmarks for comparison
 */
interface PerformanceBenchmarks {
  /** Historical performance averages */
  historical: {
    laborCost: number;
    wastePercentage: number;
    customerService: number;
    digitalSalesPercent: number;
  };
  /** Industry benchmarks */
  industry: {
    laborCost: number;
    wastePercentage: number;
    customerService: number;
    digitalSalesPercent: number;
  };
  /** Target benchmarks */
  targets: {
    laborCost: number;
    wastePercentage: number;
    customerService: number;
    digitalSalesPercent: number;
  };
}

// =============================================================================
// INITIAL STATE
// =============================================================================

/**
 * Initial benchmarks (these would typically come from configuration or API)
 */
const initialBenchmarks: PerformanceBenchmarks = {
  historical: {
    laborCost: 0.32,
    wastePercentage: 0.035,
    customerService: 0.92,
    digitalSalesPercent: 0.60
  },
  industry: {
    laborCost: 0.30,
    wastePercentage: 0.03,
    customerService: 0.95,
    digitalSalesPercent: 0.65
  },
  targets: {
    laborCost: 0.28,
    wastePercentage: 0.025,
    customerService: 0.97,
    digitalSalesPercent: 0.70
  }
};

/**
 * Initial state for DSPR metrics domain
 */
const initialState: DSPRMetricsState = {
  dailyRawData: null,
  dailyByDate: null,
  dailyPrevWeekRawData: null,
  weeklyRawData: null,
  processedData: null,
  config: defaultDSPRConfig,
  alerts: [],
  status: ApiStatus.IDLE,
  error: null,
  lastProcessed: null,
  lastAlertGeneration: null,
  benchmarks: initialBenchmarks
};

// =============================================================================
// SLICE DEFINITION
// =============================================================================

/**
 * DSPR Metrics Domain Slice
 * Manages DSPR operational data processing and analysis
 */
export const dsprMetricsSlice = createSlice({
  name: 'dsprMetricsSlice',
  initialState,
  reducers: {
    /**
     * Reset DSPR metrics state
     */
    resetDSPRMetricsState: (state) => {
      Object.assign(state, initialState);
      console.log('[DSPR Metrics] State reset');
    },

    /**
     * Clear processing errors
     */
    clearDSPRMetricsError: (state) => {
      state.error = null;
      if (state.status === ApiStatus.FAILED) {
        state.status = ApiStatus.IDLE;
      }
    },

    /**
     * Update analysis configuration
     */
    updateDSPRMetricsConfig: (state, action: PayloadAction<Partial<DSPRAnalysisConfig>>) => {
      state.config = { ...state.config, ...action.payload };
      console.log('[DSPR Metrics] Configuration updated', action.payload);
      
      // Trigger reprocessing if data exists
      if (state.dailyRawData) {
        state.status = ApiStatus.LOADING;
      }
    },

    /**
     * Update performance benchmarks
     */
    updateBenchmarks: (state, action: PayloadAction<Partial<PerformanceBenchmarks>>) => {
      if (state.benchmarks) {
        state.benchmarks = { ...state.benchmarks, ...action.payload };
        console.log('[DSPR Metrics] Benchmarks updated', action.payload);
        
        // Trigger reprocessing to reflect new benchmarks
        if (state.dailyRawData) {
          state.status = ApiStatus.LOADING;
        }
      }
    },

    /**
     * Dismiss specific alert
     */
    dismissOperationalAlert: (state, action: PayloadAction<number>) => {
      const alertIndex = action.payload;
      if (alertIndex >= 0 && alertIndex < state.alerts.length) {
        state.alerts.splice(alertIndex, 1);
        console.log('[DSPR Metrics] Alert dismissed', { alertIndex });
      }
    },

    /**
     * Clear all operational alerts
     */
    clearAllOperationalAlerts: (state) => {
      state.alerts = [];
      console.log('[DSPR Metrics] All alerts cleared');
    },

    /**
     * Manually trigger data reprocessing
     */
    reprocessDSPRMetricsData: (state) => {
      if (state.dailyRawData) {
        state.status = ApiStatus.LOADING;
        state.error = null;
        console.log('[DSPR Metrics] Manual reprocessing triggered');
      }
    }
  },
  extraReducers: (builder) => {
    // Listen to API coordinator success actions
    builder
      .addCase(fetchDsprData.fulfilled, (state, action) => {
        try {
          state.status = ApiStatus.LOADING;
          state.error = null;
          
          const response = action.payload;
          const dailySource = response.reports?.daily?.dailyDSPRData as DailyDSPRData | DailyDSPRByDate | undefined;
          const weeklyData = response.reports?.weekly?.DSPRData as WeeklyDSPRData | undefined;
          const dailyByDateFromWeekly = response.reports?.weekly?.DailyDSPRByDate as DailyDSPRByDate | undefined;
          
          // New API shape integration: dailyDSPRData may be a map keyed by date
          // Backward compatibility: still supports single DailyDSPRData object
          let selectedDaily: DailyDSPRData | null = null;
          let prevWeekForSelected: DailyDSPRData | null = null;
          let dailyByDate: DailyDSPRByDate | null = null;

          if (dailySource) {
            const isSingleDaily = typeof (dailySource as any).Total_Sales === 'number';
            if (isSingleDaily) {
              selectedDaily = dailySource as DailyDSPRData;
            } else {
              dailyByDate = dailySource as DailyDSPRByDate;
            }
          }

          if (!dailyByDate && dailyByDateFromWeekly) {
            dailyByDate = dailyByDateFromWeekly;
          }

          if (!selectedDaily && dailyByDate) {
            const reqDate = response['Filtering Values']?.date;
            const entry: DailyDSPRByDateEntry | undefined = reqDate ? dailyByDate[reqDate] : undefined;
            if (entry && typeof entry !== 'string') {
              selectedDaily = entry as DailyDSPRDayWithPrevWeek;
              prevWeekForSelected = (entry as DailyDSPRDayWithPrevWeek).PrevWeek ?? null;
            } else {
              selectedDaily = null;
            }
          }

          if (selectedDaily && dailyByDate && !prevWeekForSelected) {
            const reqDate = response['Filtering Values']?.date;
            const entry: DailyDSPRByDateEntry | undefined = reqDate ? dailyByDate[reqDate] : undefined;
            if (entry && typeof entry !== 'string') {
              prevWeekForSelected = (entry as DailyDSPRDayWithPrevWeek).PrevWeek ?? null;
            }
          }
          
          if (selectedDaily) {
            console.log('[DSPR Metrics] Processing new data from API', {
              hasDaily: !!selectedDaily,
              hasWeekly: !!weeklyData,
              storeId: response['Filtering Values']?.store,
              totalSales: selectedDaily.Total_Sales,
              laborCost: selectedDaily.labor
            });
            
            // Store raw data
            state.dailyRawData = selectedDaily;
            state.dailyByDate = dailyByDate;
            state.dailyPrevWeekRawData = prevWeekForSelected;
            state.weeklyRawData = weeklyData || null;
            
            // Process the data
            const processingResult = processDSPRMetricsData(
              selectedDaily,
              weeklyData || null,
              response['Filtering Values']?.store || 'unknown',
              response['Filtering Values']?.date || 'unknown',
              state.config,
              state.benchmarks
            );
            
            state.processedData = processingResult.processedData;
            state.alerts = processingResult.alerts;
            state.lastProcessed = Date.now();
            state.lastAlertGeneration = Date.now();
            state.status = ApiStatus.SUCCEEDED;
            
            console.log('[DSPR Metrics] Data processing completed', {
              alertCount: state.alerts.length,
              overallGrade: state.processedData?.overallGrade,
              criticalAlerts: state.alerts.filter(a => a.severity === AlertSeverity.CRITICAL).length,
              financialGrade: state.processedData?.daily.financial.performanceGrade,
              operationalScore: state.processedData?.daily.operational.efficiencyScore
            });
            
          } else {
            state.status = ApiStatus.FAILED;
            state.error = 'DSPR metrics data not found in API response';
            console.warn('[DSPR Metrics] No DSPR metrics data found in API response');
          }
          
        } catch (error) {
          state.status = ApiStatus.FAILED;
          state.error = error instanceof Error ? error.message : 'Failed to process DSPR metrics data';
          console.error('[DSPR Metrics] Processing error:', error);
        }
      })
      .addCase(refreshDsprData.fulfilled, (state, action) => {
        // Handle refresh the same way as initial fetch
        try {
          state.status = ApiStatus.LOADING;
          state.error = null;
          
          const response = action.payload;
          const dailySource = response.reports?.daily?.dailyDSPRData as DailyDSPRData | DailyDSPRByDate | undefined;
          const weeklyData = response.reports?.weekly?.DSPRData as WeeklyDSPRData | undefined;
          const dailyByDateFromWeekly = response.reports?.weekly?.DailyDSPRByDate as DailyDSPRByDate | undefined;
          
          let selectedDaily: DailyDSPRData | null = null;
          let prevWeekForSelected: DailyDSPRData | null = null;
          let dailyByDate: DailyDSPRByDate | null = null;
          
          if (dailySource) {
            const isSingleDaily = typeof (dailySource as any).Total_Sales === 'number';
            if (isSingleDaily) {
              selectedDaily = dailySource as DailyDSPRData;
            } else {
              dailyByDate = dailySource as DailyDSPRByDate;
            }
          }

          if (!dailyByDate && dailyByDateFromWeekly) {
            dailyByDate = dailyByDateFromWeekly;
          }

          if (!selectedDaily && dailyByDate) {
            const reqDate = response['Filtering Values']?.date;
            const entry: DailyDSPRByDateEntry | undefined = reqDate ? dailyByDate[reqDate] : undefined;
            if (entry && typeof entry !== 'string') {
              selectedDaily = entry as DailyDSPRDayWithPrevWeek;
              prevWeekForSelected = (entry as DailyDSPRDayWithPrevWeek).PrevWeek ?? null;
            } else {
              selectedDaily = null;
            }
          }

          if (selectedDaily && dailyByDate && !prevWeekForSelected) {
            const reqDate = response['Filtering Values']?.date;
            const entry: DailyDSPRByDateEntry | undefined = reqDate ? dailyByDate[reqDate] : undefined;
            if (entry && typeof entry !== 'string') {
              prevWeekForSelected = (entry as DailyDSPRDayWithPrevWeek).PrevWeek ?? null;
            }
          }
          
          if (selectedDaily) {
            console.log('[DSPR Metrics] Processing refreshed data');
            
            state.dailyRawData = selectedDaily;
            state.dailyByDate = dailyByDate;
            state.dailyPrevWeekRawData = prevWeekForSelected;
            state.weeklyRawData = weeklyData || null;
            
            const processingResult = processDSPRMetricsData(
              selectedDaily,
              weeklyData || null,
              response['Filtering Values']?.store || 'unknown',
              response['Filtering Values']?.date || 'unknown',
              state.config,
              state.benchmarks
            );
            
            state.processedData = processingResult.processedData;
            state.alerts = processingResult.alerts;
            state.lastProcessed = Date.now();
            state.lastAlertGeneration = Date.now();
            state.status = ApiStatus.SUCCEEDED;
            
            console.log('[DSPR Metrics] Refresh processing completed');
            
          } else {
            state.status = ApiStatus.FAILED;
            state.error = 'DSPR metrics data not found in refreshed response';
          }
          
        } catch (error) {
          state.status = ApiStatus.FAILED;
          state.error = error instanceof Error ? error.message : 'Failed to process refreshed DSPR metrics data';
          console.error('[DSPR Metrics] Refresh processing error:', error);
        }
      })
      .addCase(fetchDsprData.pending, (state) => {
        state.status = ApiStatus.LOADING;
        state.error = null;
      })
      .addCase(fetchDsprData.rejected, (state, _action) => {
        state.status = ApiStatus.FAILED;
        state.error = 'Failed to fetch DSPR data';
        state.dailyRawData = null;
        state.weeklyRawData = null;
        state.processedData = null;
        state.alerts = [];
      });
  }
});

// =============================================================================
// ACTIONS EXPORT
// =============================================================================

export const {
  resetDSPRMetricsState,
  clearDSPRMetricsError,
  updateDSPRMetricsConfig,
  updateBenchmarks,
  dismissOperationalAlert,
  clearAllOperationalAlerts,
  reprocessDSPRMetricsData
} = dsprMetricsSlice.actions;

// =============================================================================
// DATA PROCESSING FUNCTIONS
// =============================================================================

/**
 * Process raw DSPR metrics data into analyzed format
 * @param dailyData - Raw daily DSPR data from API
 * @param weeklyData - Raw weekly DSPR data from API (optional)
 * @param storeId - Store identifier
 * @param date - Business date
 * @param config - Analysis configuration
 * @param benchmarks - Performance benchmarks
 * @returns Processed data with analysis
 */
function processDSPRMetricsData(
  dailyData: DailyDSPRData,
  weeklyData: WeeklyDSPRData | null,
  storeId: string,
  date: string,
  config: DSPRAnalysisConfig,
  benchmarks: PerformanceBenchmarks | null
) {
  console.log('[DSPR Metrics] Starting data processing', { 
    storeId, 
    date, 
    hasWeekly: !!weeklyData 
  });

  // Process daily metrics
  const dailyMetrics = processDailyMetrics(dailyData, config, benchmarks);

  // Process weekly metrics if available
  const weeklyMetrics = weeklyData 
    ? processWeeklyMetrics(weeklyData, dailyData, config, benchmarks)
    : undefined;

  // Generate alerts
  const alerts = generateOperationalAlerts(dailyData, weeklyData, dailyMetrics, config);

  // Calculate overall grade
  const overallGrade = calculateOverallGrade(dailyMetrics, config);

  // Create processed data structure
  const processedData: ProcessedDSPRData = {
    storeId,
    date,
    daily: dailyMetrics,
    weekly: weeklyMetrics,
    alerts,
    overallGrade
  };

  return {
    processedData,
    alerts
  };
}

/**
 * Process daily DSPR metrics
 */
function processDailyMetrics(
  dailyData: DailyDSPRData,
  config: DSPRAnalysisConfig,
  benchmarks: PerformanceBenchmarks | null
) {
  // Financial metrics
  const financial = processFinancialMetrics(dailyData, config, benchmarks);
  
  // Operational metrics
  const operational = processOperationalMetrics(dailyData, config, benchmarks);
  
  // Sales channel metrics
  const salesChannels = processSalesChannelMetrics(dailyData, config);
  
  // Quality metrics
  const quality = processQualityMetrics(dailyData, config, benchmarks);
  
  // Cost control metrics
  const costControl = processCostControlMetrics(dailyData, config, benchmarks);

  return {
    financial,
    operational,
    salesChannels,
    quality,
    costControl
  };
}

/**
 * Process financial performance metrics
 */
function processFinancialMetrics(
  dailyData: DailyDSPRData,
  config: DSPRAnalysisConfig,
  benchmarks: PerformanceBenchmarks | null
) {
  const totalSales = dailyData.Total_Sales;
  const cashSales = dailyData.Total_Cash_Sales;
  const digitalSales = totalSales * dailyData.Digital_Sales_Percent;
  const customerCount = dailyData.Customer_count;
  
  const financial = {
    totalSales,
    cashSales,
    digitalSales,
    averageTicket: dailyData.Avrage_ticket,
    tips: dailyData.Total_TIPS,
    cashVariance: dailyData.over_short,
    laborCostPercentage: dailyData.labor,
    revenuePerCustomer: customerCount > 0 ? totalSales / customerCount : 0,
    performanceGrade: calculateFinancialGrade(dailyData, config, benchmarks)
  };

  return financial;
}

/**
 * Process operational efficiency metrics
 */
function processOperationalMetrics(
  dailyData: DailyDSPRData,
  config: DSPRAnalysisConfig,
  benchmarks: PerformanceBenchmarks | null
) {
  const totalOrders = dailyData.Customer_count; // Assuming customer count represents orders
  const modificationRate = totalOrders > 0 ? dailyData.Modified_Order_Qty / totalOrders : 0;
  const refundRate = totalOrders > 0 ? dailyData.Refunded_order_Qty / totalOrders : 0;

  const operational = {
    customerCount: dailyData.Customer_count,
    customerCountPercentage: dailyData.Customer_count_percent,
    portalUtilization: dailyData.Put_into_Portal_Percent,
    portalOnTimePercentage: dailyData.In_Portal_on_Time_Percent,
    modificationRate,
    refundRate,
    efficiencyScore: calculateOperationalEfficiency(dailyData, config, benchmarks)
  };

  return operational;
}

/**
 * Process sales channel performance metrics
 */
function processSalesChannelMetrics(
  dailyData: DailyDSPRData,
  _config: DSPRAnalysisConfig
) {
  const totalSales = dailyData.Total_Sales;
  
  // Traditional channels (cash, phone)
  const traditionalSales = dailyData.Total_Cash_Sales + dailyData.Phone;
  const traditional = createChannelPerformance(
    SalesChannelType.TRADITIONAL,
    traditionalSales,
    totalSales,
    dailyData.Customer_count * 0.3 // Estimated distribution
  );

  // Digital channels (website, mobile)
  const digitalSales = dailyData.Website + dailyData.Mobile;
  const digital = createChannelPerformance(
    SalesChannelType.DIGITAL,
    digitalSales,
    totalSales,
    dailyData.Customer_count * 0.4 // Estimated distribution
  );

  // Delivery channels (third-party)
  const deliverySales = dailyData.DoorDash_Sales + dailyData.UberEats_Sales + dailyData.GrubHub_Sales;
  const delivery = createChannelPerformance(
    SalesChannelType.DELIVERY,
    deliverySales,
    totalSales,
    dailyData.Customer_count * 0.25 // Estimated distribution
  );

  // Phone channels
  const phoneSales = dailyData.Phone + dailyData.Call_Center_Agent;
  const phone = createChannelPerformance(
    SalesChannelType.PHONE,
    phoneSales,
    totalSales,
    dailyData.Customer_count * 0.05 // Estimated distribution
  );

  // Determine top channel
  const channels = [traditional, digital, delivery, phone];
  const topChannel = channels.reduce((max, current) => 
    current.sales > max.sales ? current : max
  ).channel;

  return {
    traditional,
    digital,
    delivery,
    phone,
    topChannel,
    digitalAdoptionRate: dailyData.Digital_Sales_Percent
  };
}

/**
 * Create channel performance object
 */
function createChannelPerformance(
  channel: SalesChannelType,
  sales: number,
  totalSales: number,
  estimatedOrders: number
) {
  return {
    channel,
    sales,
    percentage: totalSales > 0 ? (sales / totalSales) * 100 : 0,
    orders: Math.round(estimatedOrders),
    averageOrderValue: estimatedOrders > 0 ? sales / estimatedOrders : 0,
    trend: TrendDirection.STABLE, // Would need historical data for actual trend
    performanceLevel: PerformanceLevel.AVERAGE // Would need benchmarks for actual level
  };
}

/**
 * Process quality and service metrics
 */
function processQualityMetrics(
  dailyData: DailyDSPRData,
  config: DSPRAnalysisConfig,
  benchmarks: PerformanceBenchmarks | null
) {
  const totalOrders = dailyData.Customer_count;
  const modificationRate = totalOrders > 0 ? dailyData.Modified_Order_Qty / totalOrders : 0;
  const refundRate = totalOrders > 0 ? dailyData.Refunded_order_Qty / totalOrders : 0;
  
  // Calculate order accuracy (1 - modification rate - refund rate)
  const orderAccuracy = Math.max(0, 1 - modificationRate - refundRate);
  
  const quality = {
    customerServiceScore: dailyData.Customer_Service,
    orderAccuracy,
    serviceConsistency: dailyData.In_Portal_on_Time_Percent, // Using portal on-time as service consistency proxy
    qualityGrade: calculateQualityGrade(dailyData, config, benchmarks)
  };

  return quality;
}

/**
 * Process cost control and waste metrics
 */
function processCostControlMetrics(
  dailyData: DailyDSPRData,
  config: DSPRAnalysisConfig,
  benchmarks: PerformanceBenchmarks | null
) {
  const totalWaste = dailyData.waste_gateway + dailyData.Waste_Alta;
  const wastePercentage = dailyData.Total_Sales > 0 ? totalWaste / dailyData.Total_Sales : 0;
  
  const costControl = {
    totalWaste,
    wastePercentage,
    laborEfficiency: calculateLaborEfficiency(dailyData, config, benchmarks),
    costControlGrade: calculateCostControlGrade(dailyData, config, benchmarks)
  };

  return costControl;
}

/**
 * Process weekly DSPR metrics with trends
 */
function processWeeklyMetrics(
  weeklyData: WeeklyDSPRData,
  dailyData: DailyDSPRData,
  config: DSPRAnalysisConfig,
  benchmarks: PerformanceBenchmarks | null
) {
  // Process weekly data similar to daily but with trend analysis
  const weeklyProcessed = processDailyMetrics(weeklyData as any, config, benchmarks);
  
  // Calculate weekly trends by comparing daily vs weekly averages
  const trends = calculateWeeklyTrends(dailyData, weeklyData);
  
  return {
    ...weeklyProcessed,
    trends
  };
}

/**
 * Calculate weekly trends analysis
 */
function calculateWeeklyTrends(dailyData: DailyDSPRData, weeklyData: WeeklyDSPRData) {
  // Assume weekly data represents 7-day averages
  const dailyAvgSales = weeklyData.Total_Sales / 7;
  const dailyAvgLabor = weeklyData.labor;
  const dailyAvgCustomers = weeklyData.Customer_count / 7;
  const dailyAvgWaste = (weeklyData.waste_gateway + weeklyData.Waste_Alta) / 7;
  const dailyAvgDigital = weeklyData.Digital_Sales_Percent;

  return {
    salesTrend: createTrendAnalysis('sales', dailyData.Total_Sales, dailyAvgSales),
    laborTrend: createTrendAnalysis('labor', dailyData.labor, dailyAvgLabor),
    customerTrend: createTrendAnalysis('customers', dailyData.Customer_count, dailyAvgCustomers),
    wasteTrend: createTrendAnalysis('waste', dailyData.waste_gateway + dailyData.Waste_Alta, dailyAvgWaste),
    digitalTrend: createTrendAnalysis('digital', dailyData.Digital_Sales_Percent, dailyAvgDigital)
  };
}

/**
 * Create trend analysis object
 */
function createTrendAnalysis(metric: string, current: number, previous: number) {
  const percentageChange = calculateVariance(current, previous);
  const direction = determineTrendDirection(percentageChange);
  
  let significance: TrendSignificance = TrendSignificance.NEGLIGIBLE;
  const absChange = Math.abs(percentageChange);
  
  if (absChange >= 20) significance = TrendSignificance.HIGHLY_SIGNIFICANT;
  else if (absChange >= 10) significance = TrendSignificance.SIGNIFICANT;
  else if (absChange >= 5) significance = TrendSignificance.MODERATE;
  else if (absChange >= 2) significance = TrendSignificance.MINOR;

  return {
    metric,
    current,
    previous,
    percentageChange,
    direction,
    significance
  };
}

/**
 * Calculate various performance grades and efficiency scores
 */
function calculateFinancialGrade(
  dailyData: DailyDSPRData,
  config: DSPRAnalysisConfig,
  _benchmarks: PerformanceBenchmarks | null
): PerformanceGrade {
  // Implementation would compare actual vs targets
  const laborTarget = config.targets.laborCostTarget;
  const laborVariance = Math.abs(dailyData.labor - laborTarget);
  
  if (laborVariance <= 0.02) return PerformanceGrade.A;
  if (laborVariance <= 0.05) return PerformanceGrade.B;
  if (laborVariance <= 0.08) return PerformanceGrade.C;
  return PerformanceGrade.D;
}

function calculateOperationalEfficiency(
  dailyData: DailyDSPRData,
  _config: DSPRAnalysisConfig,
  _benchmarks: PerformanceBenchmarks | null
): number {
  // Composite score based on multiple factors
  const portalScore = dailyData.Put_into_Portal_Percent * 30;
  const onTimeScore = dailyData.In_Portal_on_Time_Percent * 30;
  const customerServiceScore = dailyData.Customer_Service * 25;
  const customerCountScore = dailyData.Customer_count_percent * 15;
  
  return (portalScore + onTimeScore + customerServiceScore + customerCountScore);
}

function calculateQualityGrade(
  dailyData: DailyDSPRData,
  _config: DSPRAnalysisConfig,
  _benchmarks: PerformanceBenchmarks | null
): QualityGrade {
  const serviceScore = dailyData.Customer_Service;
  
  if (serviceScore >= 0.95) return QualityGrade.PREMIUM;
  if (serviceScore >= 0.90) return QualityGrade.HIGH;
  if (serviceScore >= 0.85) return QualityGrade.STANDARD;
  if (serviceScore >= 0.75) return QualityGrade.BELOW_STANDARD;
  return QualityGrade.CRITICAL;
}

function calculateLaborEfficiency(
  dailyData: DailyDSPRData,
  config: DSPRAnalysisConfig,
  _benchmarks: PerformanceBenchmarks | null
): number {
  const targetLabor = config.targets.laborCostTarget;
  const actualLabor = dailyData.labor;
  
  // Lower labor cost = higher efficiency
  return Math.max(0, (targetLabor / actualLabor) * 100);
}

function calculateCostControlGrade(
  dailyData: DailyDSPRData,
  config: DSPRAnalysisConfig,
  _benchmarks: PerformanceBenchmarks | null
): CostControlGrade {
  const laborTarget = config.targets.laborCostTarget;
  const wasteTarget = config.targets.wastePercentageTarget;
  const totalWaste = dailyData.waste_gateway + dailyData.Waste_Alta;
  const wastePercentage = dailyData.Total_Sales > 0 ? totalWaste / dailyData.Total_Sales : 0;
  
  const laborScore = isWithinAcceptableRange(dailyData.labor, laborTarget, 0.1) ? 1 : 0;
  const wasteScore = wastePercentage <= wasteTarget ? 1 : 0;
  const cashScore = Math.abs(dailyData.over_short) <= 5 ? 1 : 0;
  
  const totalScore = (laborScore + wasteScore + cashScore) / 3;
  
  if (totalScore >= 0.9) return CostControlGrade.OPTIMAL;
  if (totalScore >= 0.7) return CostControlGrade.EFFICIENT;
  if (totalScore >= 0.5) return CostControlGrade.ACCEPTABLE;
  if (totalScore >= 0.3) return CostControlGrade.CONCERNING;
  return CostControlGrade.CRITICAL;
}

function calculateOverallGrade(dailyMetrics: any, config: DSPRAnalysisConfig): OperationalGrade {
  // Weighted calculation based on config
  const weights = config.gradeWeights;
  
  // Convert letter grades to numeric scores
  const gradeToScore = (grade: PerformanceGrade | QualityGrade | CostControlGrade): number => {
    switch (grade) {
      case PerformanceGrade.A:
      case PerformanceGrade.A_PLUS:
      case QualityGrade.PREMIUM:
      case CostControlGrade.OPTIMAL:
        return 4;
      case PerformanceGrade.B:
      case PerformanceGrade.B_PLUS:
      case QualityGrade.HIGH:
      case CostControlGrade.EFFICIENT:
        return 3;
      case PerformanceGrade.C:
      case PerformanceGrade.C_PLUS:
      case QualityGrade.STANDARD:
      case CostControlGrade.ACCEPTABLE:
        return 2;
      case PerformanceGrade.D:
      case PerformanceGrade.D_PLUS:
      case QualityGrade.BELOW_STANDARD:
      case CostControlGrade.CONCERNING:
        return 1;
      default:
        return 0;
    }
  };

  const financialScore = gradeToScore(dailyMetrics.financial.performanceGrade) * weights.financial;
  const operationalScore = (dailyMetrics.operational.efficiencyScore / 100 * 4) * weights.operational;
  const qualityScore = gradeToScore(dailyMetrics.quality.qualityGrade) * weights.quality;
  const costScore = gradeToScore(dailyMetrics.costControl.costControlGrade) * weights.costControl;
  
  const totalScore = financialScore + operationalScore + qualityScore + costScore;
  
  if (totalScore >= 3.5) return OperationalGrade.OUTSTANDING;
  if (totalScore >= 3.0) return OperationalGrade.EXCEEDS_EXPECTATIONS;
  if (totalScore >= 2.5) return OperationalGrade.MEETS_EXPECTATIONS;
  if (totalScore >= 2.0) return OperationalGrade.BELOW_EXPECTATIONS;
  return OperationalGrade.NEEDS_IMPROVEMENT;
}

/**
 * Generate operational alerts based on metrics
 */
function generateOperationalAlerts(
  dailyData: DailyDSPRData,
  _weeklyData: WeeklyDSPRData | null,
  _dailyMetrics: any,
  config: DSPRAnalysisConfig
): OperationalAlert[] {
  if (!config.alertSettings.enableAlerts) {
    return [];
  }

  const alerts: OperationalAlert[] = [];

  // Labor cost alert
  if (dailyData.labor > config.costThresholds.maxLaborPercentage) {
    alerts.push(createOperationalAlert(
      AlertCategory.COST_CONTROL,
      'Labor Cost Exceeded',
      'labor_cost',
      `Labor cost is ${(dailyData.labor * 100).toFixed(1)}%, above target of ${(config.targets.laborCostTarget * 100).toFixed(1)}%`,
      dailyData.labor,
      config.targets.laborCostTarget,
      [
        'Review staffing schedules for optimization',
        'Analyze peak hour coverage',
        'Consider cross-training staff for flexibility'
      ]
    ));
  }

  // Waste alert
  const totalWaste = dailyData.waste_gateway + dailyData.Waste_Alta;
  const wastePercentage = dailyData.Total_Sales > 0 ? totalWaste / dailyData.Total_Sales : 0;
  if (wastePercentage > config.costThresholds.maxWastePercentage) {
    alerts.push(createOperationalAlert(
      AlertCategory.COST_CONTROL,
      'Waste Percentage High',
      'waste_percentage',
      `Waste is ${(wastePercentage * 100).toFixed(2)}% of sales, above target of ${(config.targets.wastePercentageTarget * 100).toFixed(2)}%`,
      wastePercentage,
      config.targets.wastePercentageTarget,
      [
        'Review inventory management procedures',
        'Check food preparation processes',
        'Analyze waste tracking accuracy'
      ]
    ));
  }

  // Customer service alert
  if (dailyData.Customer_Service < config.targets.customerServiceTarget) {
    alerts.push(createOperationalAlert(
      AlertCategory.QUALITY,
      'Customer Service Below Target',
      'customer_service',
      `Customer service score is ${(dailyData.Customer_Service * 100).toFixed(1)}%, below target of ${(config.targets.customerServiceTarget * 100).toFixed(1)}%`,
      dailyData.Customer_Service,
      config.targets.customerServiceTarget,
      [
        'Review customer feedback for improvement areas',
        'Provide additional staff training',
        'Monitor service delivery processes'
      ]
    ));
  }

  // Cash variance alert
  const cashVariance = Math.abs(dailyData.over_short);
  if (cashVariance > Math.max(Math.abs(config.costThresholds.cashVarianceRange.max), Math.abs(config.costThresholds.cashVarianceRange.min))) {
    alerts.push(createOperationalAlert(
      AlertCategory.FINANCIAL,
      'Cash Variance Issue',
      'cash_variance',
      `Cash variance is $${cashVariance.toFixed(2)}, outside acceptable range`,
      dailyData.over_short,
      0,
      [
        'Review cash handling procedures',
        'Check register reconciliation process',
        'Audit cash management controls'
      ]
    ));
  }

  // Sort and limit alerts
  return alerts
    .filter(alert => config.alertSettings.monitoredCategories.includes(alert.category))
    .sort((a, b) => {
      const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    })
    .slice(0, config.alertSettings.maxAlertsPerAnalysis);
}

/**
 * Create operational alert
 */
function createOperationalAlert(
  category: AlertCategory,
  title: string,
  metric: string,
  message: string,
  currentValue: number,
  targetValue: number,
  recommendations: string[]
): OperationalAlert {
  const variance = calculateVariance(currentValue, targetValue);
  const absVariance = Math.abs(variance);
  
  let severity: AlertSeverity = AlertSeverity.INFO;
  let priority: AlertPriority = AlertPriority.LOW;
  let impact: AlertImpact = AlertImpact.MINIMAL;
  
  if (absVariance >= 30) {
    severity = AlertSeverity.CRITICAL;
    priority = AlertPriority.URGENT;
    impact = AlertImpact.SEVERE;
  } else if (absVariance >= 20) {
    severity = AlertSeverity.ERROR;
    priority = AlertPriority.HIGH;
    impact = AlertImpact.HIGH;
  } else if (absVariance >= 10) {
    severity = AlertSeverity.WARNING;
    priority = AlertPriority.MEDIUM;
    impact = AlertImpact.MODERATE;
  }

  return {
    severity,
    category,
    metric,
    title,
    message,
    currentValue,
    targetValue,
    variance,
    recommendations,
    priority,
    impact
  };
}

// =============================================================================
// SELECTORS
// =============================================================================

/**
 * Select complete DSPR metrics state
 */
export const selectDSPRMetricsState = (state: { dsprMetrics: DSPRMetricsState }) => 
  state.dsprMetrics;

/**
 * Select raw daily DSPR data
 */
export const selectRawDailyDSPRData = (state: { dsprMetrics: DSPRMetricsState }) => 
  state.dsprMetrics.dailyRawData;

/**
 * Select raw weekly DSPR data
 */
export const selectRawWeeklyDSPRData = (state: { dsprMetrics: DSPRMetricsState }) => 
  state.dsprMetrics.weeklyRawData;

/**
 * Select processed DSPR data
 */
export const selectProcessedDSPRData = (state: { dsprMetrics: DSPRMetricsState }) => 
  state.dsprMetrics.processedData;

/**
 * Select operational alerts
 */
export const selectOperationalAlerts = (state: { dsprMetrics: DSPRMetricsState }) => 
  state.dsprMetrics.alerts;

/**
 * Select critical operational alerts
 */
export const selectCriticalOperationalAlerts = createSelector(
  [selectOperationalAlerts],
  (alerts) => alerts.filter(alert => alert.severity === AlertSeverity.CRITICAL)
);

/**
 * Select financial metrics
 */
export const selectFinancialMetrics = (state: { dsprMetrics: DSPRMetricsState }) => 
  state.dsprMetrics.processedData?.daily.financial;

/**
 * Select operational metrics
 */
export const selectOperationalMetrics = (state: { dsprMetrics: DSPRMetricsState }) => 
  state.dsprMetrics.processedData?.daily.operational;

/**
 * Select sales channel metrics
 */
export const selectSalesChannelMetrics = (state: { dsprMetrics: DSPRMetricsState }) => 
  state.dsprMetrics.processedData?.daily.salesChannels;

/**
 * Select quality metrics
 */
export const selectQualityMetrics = (state: { dsprMetrics: DSPRMetricsState }) => 
  state.dsprMetrics.processedData?.daily.quality;

/**
 * Select cost control metrics
 */
export const selectCostControlMetrics = (state: { dsprMetrics: DSPRMetricsState }) => 
  state.dsprMetrics.processedData?.daily.costControl;

/**
 * Select weekly trends
 */
export const selectWeeklyTrends = (state: { dsprMetrics: DSPRMetricsState }) => 
  state.dsprMetrics.processedData?.weekly?.trends;

/**
 * Select overall operational grade
 */
export const selectOverallGrade = (state: { dsprMetrics: DSPRMetricsState }) => 
  state.dsprMetrics.processedData?.overallGrade;

/**
 * Select DSPR metrics loading state
 */
export const selectDSPRMetricsLoading = (state: { dsprMetrics: DSPRMetricsState }) => 
  state.dsprMetrics.status === ApiStatus.LOADING;

/**
 * Select DSPR metrics error
 */
export const selectDSPRMetricsError = (state: { dsprMetrics: DSPRMetricsState }) => 
  state.dsprMetrics.error;

/**
 * Select performance benchmarks
 */
export const selectPerformanceBenchmarks = (state: { dsprMetrics: DSPRMetricsState }) => 
  state.dsprMetrics.benchmarks;

export const selectHNRMetrics = (state: { dsprMetrics: DSPRMetricsState }): HNRMetrics | null => {
  const d = state.dsprMetrics.dailyRawData;
  if (!d) return null;
  return {
    totalTransactions: d.HNR_Transactions,
    promiseMetTransactions: d.HNR_Promise_Met_Transactions,
    promiseMetPercent: d.HNR_Promise_Met_Percent
  };
};

// =============================================================================
// SLICE EXPORT
// =============================================================================

export default dsprMetricsSlice.reducer;
