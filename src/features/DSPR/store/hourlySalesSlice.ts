/**
 * Hourly Sales Domain Slice
 * Redux slice for managing hourly sales data and business logic
 * 
 * This slice:
 * - Listens to API coordinator success actions
 * - Extracts and processes hourly sales data
 * - Performs business calculations and analysis
 * - Manages domain-specific state and caching
 * - Provides selectors for UI components
 */

import { createSlice, createSelector, type PayloadAction } from '@reduxjs/toolkit';
import { fetchDsprData, refreshDsprData } from './coordinatorSlice';
import {
  type DailyHourlySales,
  type HourlySalesData,
  type ProcessedHourlySales,
  type DailySalesSummary,
  type HourlySalesFilter,
  HourlySalesSort,
  type PeriodSalesMetrics,
  type SalesTrendData,
  type HourlySalesValidation,
  BusinessTimePeriods,
  SalesChannel,
  hasHourlyActivity,
  defaultHourlySalesConfig,
  type HourlySalesConfig
} from '../types/hourlySales';
import { ApiStatus } from '../types/common';

// =============================================================================
// STATE INTERFACE
// =============================================================================

/**
 * State interface for hourly sales domain
 */
export interface HourlySalesState {
  /** Raw hourly sales data from API */
  rawData: DailyHourlySales | null;
  /** Processed hourly sales with calculations */
  processedData: ProcessedHourlySales[] | null;
  /** Daily summary metrics */
  summary: DailySalesSummary | null;
  /** Period-based analysis */
  periodAnalysis: PeriodSalesMetrics[] | null;
  /** Trend analysis data */
  trends: SalesTrendData[] | null;
  /** Data validation results */
  validation: HourlySalesValidation | null;
  /** Current filter settings */
  currentFilter: HourlySalesFilter | null;
  /** Current sort configuration */
  currentSort: HourlySalesSort;
  /** Processing status */
  status: ApiStatus;
  /** Processing errors */
  error: string | null;
  /** Last processing timestamp */
  lastProcessed: number | null;
  /** Analysis configuration */
  config: HourlySalesConfig;
}

// =============================================================================
// INITIAL STATE
// =============================================================================

/**
 * Initial state for hourly sales domain
 */
const initialState: HourlySalesState = {
  rawData: null,
  processedData: null,
  summary: null,
  periodAnalysis: null,
  trends: null,
  validation: null,
  currentFilter: null,
  currentSort: 'hour_asc' as HourlySalesSort,
  status: ApiStatus.IDLE,
  error: null,
  lastProcessed: null,
  config: defaultHourlySalesConfig
};

// =============================================================================
// SLICE DEFINITION
// =============================================================================

/**
 * Hourly Sales Domain Slice
 * Manages hourly sales data processing and analysis
 */
export const hourlySalesSlice = createSlice({
  name: 'hourlySales',
  initialState,
  reducers: {
    /**
     * Reset hourly sales state
     */
    resetHourlySalesState: (state) => {
      Object.assign(state, initialState);
      console.log('[Hourly Sales] State reset');
    },

    /**
     * Clear processing errors
     */
    clearHourlySalesError: (state) => {
      state.error = null;
      if (state.status === ApiStatus.FAILED) {
        state.status = ApiStatus.IDLE;
      }
    },

    /**
     * Update filter configuration
     */
    setHourlySalesFilter: (state, action: PayloadAction<HourlySalesFilter | null>) => {
      state.currentFilter = action.payload;
      console.log('[Hourly Sales] Filter updated', action.payload);
      
      // Reprocess data with new filter if data exists
      if (state.rawData) {
        state.status = ApiStatus.LOADING;
        // Processing will be handled by the selector
      }
    },

    /**
     * Update sort configuration
     */
    setHourlySalesSort: (state, action: PayloadAction<HourlySalesSort>) => {
      state.currentSort = action.payload;
      console.log('[Hourly Sales] Sort updated', action.payload);
    },

    /**
     * Update analysis configuration
     */
    updateHourlySalesConfig: (state, action: PayloadAction<Partial<HourlySalesConfig>>) => {
      state.config = { ...state.config, ...action.payload } as HourlySalesConfig;
      console.log('[Hourly Sales] Configuration updated', action.payload);
      
      // Trigger reprocessing if data exists
      if (state.rawData) {
        state.status = ApiStatus.LOADING;
      }
    },

    /**
     * Manually trigger data reprocessing
     */
    reprocessHourlySalesData: (state) => {
      if (state.rawData) {
        state.status = ApiStatus.LOADING;
        state.error = null;
        console.log('[Hourly Sales] Manual reprocessing triggered');
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
          const hourlySalesData = response.reports?.daily?.dailyHourlySales as DailyHourlySales | undefined;
          
          if (hourlySalesData) {
            console.log('[Hourly Sales] Processing new data from API', {
              store: hourlySalesData.franchise_store,
              date: hourlySalesData.business_date,
              hourCount: hourlySalesData.hours.length
            });
            
            // Store raw data
            state.rawData = hourlySalesData;
            
            // Process the data
            const processingResult = processHourlySalesData(hourlySalesData, state.config);
            
            state.processedData = processingResult.processedData;
            state.summary = processingResult.summary;
            state.periodAnalysis = processingResult.periodAnalysis;
            state.trends = processingResult.trends;
            state.validation = processingResult.validation;
            state.lastProcessed = Date.now();
            state.status = ApiStatus.SUCCEEDED;
            
            console.log('[Hourly Sales] Data processing completed', {
              processedHours: state.processedData?.length || 0,
              totalSales: state.summary?.totalDailySales || 0,
              activeHours: state.summary?.activeHours || 0,
              validationScore: state.validation?.completeness || 0
            });
            
          } else {
            state.status = ApiStatus.FAILED;
            state.error = 'Hourly sales data not found in API response';
            console.warn('[Hourly Sales] No hourly sales data found in API response');
          }
          
        } catch (error) {
          state.status = ApiStatus.FAILED;
          state.error = error instanceof Error ? error.message : 'Failed to process hourly sales data';
          console.error('[Hourly Sales] Processing error:', error);
        }
      })
      .addCase(refreshDsprData.fulfilled, (state, action) => {
        // Handle refresh the same way as initial fetch
        try {
          state.status = ApiStatus.LOADING;
          state.error = null;
          
          const response = action.payload;
          const hourlySalesData = response.reports?.daily?.dailyHourlySales as DailyHourlySales | undefined;
          
          if (hourlySalesData) {
            console.log('[Hourly Sales] Processing refreshed data', {
              store: hourlySalesData.franchise_store,
              date: hourlySalesData.business_date
            });
            
            state.rawData = hourlySalesData;
            
            const processingResult = processHourlySalesData(hourlySalesData, state.config);
            
            state.processedData = processingResult.processedData;
            state.summary = processingResult.summary;
            state.periodAnalysis = processingResult.periodAnalysis;
            state.trends = processingResult.trends;
            state.validation = processingResult.validation;
            state.lastProcessed = Date.now();
            state.status = ApiStatus.SUCCEEDED;
            
            console.log('[Hourly Sales] Refresh processing completed');
            
          } else {
            state.status = ApiStatus.FAILED;
            state.error = 'Hourly sales data not found in refreshed response';
          }
          
        } catch (error) {
          state.status = ApiStatus.FAILED;
          state.error = error instanceof Error ? error.message : 'Failed to process refreshed hourly sales data';
          console.error('[Hourly Sales] Refresh processing error:', error);
        }
      })
      .addCase(fetchDsprData.pending, (state) => {
        state.status = ApiStatus.LOADING;
        state.error = null;
      })
      .addCase(fetchDsprData.rejected, (state, _action) => {
        state.status = ApiStatus.FAILED;
        state.error = 'Failed to fetch DSPR data';
        state.rawData = null;
        state.processedData = null;
        state.summary = null;
        state.periodAnalysis = null;
        state.trends = null;
        state.validation = null;
      });
  }
});

// =============================================================================
// ACTIONS EXPORT
// =============================================================================

export const {
  resetHourlySalesState,
  clearHourlySalesError,
  setHourlySalesFilter,
  setHourlySalesSort,
  updateHourlySalesConfig,
  reprocessHourlySalesData
} = hourlySalesSlice.actions;

// =============================================================================
// DATA PROCESSING FUNCTIONS
// =============================================================================

/**
 * Process raw hourly sales data into analyzed format
 * @param rawData - Raw hourly sales data from API
 * @param config - Processing configuration
 * @returns Processed data with analysis
 */
function processHourlySalesData(
  rawData: DailyHourlySales,
  config: HourlySalesConfig
) {
  console.log('[Hourly Sales] Starting data processing', {
    store: rawData.franchise_store,
    date: rawData.business_date,
    hourCount: rawData.hours.length
  });

  // Process individual hours
  const processedData = rawData.hours.map((hourData, index) => 
    processHourData(hourData, index, config)
  );

  // Generate summary
  const summary = generateDailySummary(rawData, processedData, config);

  // Analyze business periods
  const periodAnalysis = analyzePeriods(processedData);

  // Generate trends
  const trends = generateTrendAnalysis(processedData);

  // Validate data
  const validation = validateHourlySalesData(rawData, processedData);

  return {
    processedData,
    summary,
    periodAnalysis,
    trends,
    validation
  };
}

/**
 * Process individual hour data
 */
function processHourData(
  hourData: HourlySalesData,
  hour: number,
  _config: HourlySalesConfig
): ProcessedHourlySales {
  const totalSales = hourData.Total_Sales || 0;
  const orderCount = hourData.Order_Count || 0;
  const websiteSales = hourData.Website || 0;
  const mobileSales = hourData.Mobile || 0;
  const digitalSales = websiteSales + mobileSales;

  return {
    ...hourData,
    hour,
    hasActivity: hasHourlyActivity(hourData),
    averageOrderValue: orderCount > 0 ? totalSales / orderCount : 0,
    digitalSalesPercentage: totalSales > 0 ? (digitalSales / totalSales) * 100 : 0,
    primaryChannel: determinePrimaryChannel(hourData)
  };
}

/**
 * Determine primary sales channel for an hour
 */
function determinePrimaryChannel(hourData: HourlySalesData): SalesChannel | null {
  const channels = [
    { channel: SalesChannel.WEBSITE, value: hourData.Website || 0 },
    { channel: SalesChannel.MOBILE, value: hourData.Mobile || 0 },
    { channel: SalesChannel.PHONE_SALES, value: hourData.Phone_Sales || 0 },
    { channel: SalesChannel.DRIVE_THRU, value: hourData.Drive_Thru || 0 },
    { channel: SalesChannel.CALL_CENTER, value: hourData.Call_Center_Agent || 0 }
  ];

  const maxChannel = channels.reduce((max, current) => 
    current.value > max.value ? current : max
  );

  return maxChannel.value > 0 ? maxChannel.channel : null;
}

/**
 * Generate daily sales summary
 */
function generateDailySummary(
  rawData: DailyHourlySales,
  processedData: ProcessedHourlySales[],
  _config: HourlySalesConfig
): DailySalesSummary {
  const activeHours = processedData.filter(hour => hour.hasActivity);
  const totalSales = processedData.reduce((sum, hour) => sum + (hour.Total_Sales || 0), 0);
  const totalOrders = processedData.reduce((sum, hour) => sum + (hour.Order_Count || 0), 0);
  
  // Find peak hour
  const peakHour = processedData.reduce((peak, current, index) => 
    (current.Total_Sales || 0) > (peak.sales || 0) 
      ? { hour: index, sales: current.Total_Sales || 0 }
      : peak
  , { hour: 0, sales: 0 });

  // Calculate channel breakdown
  const channelBreakdown = calculateChannelBreakdown(processedData, totalSales);

  // Calculate digital sales percentage
  const digitalSales = channelBreakdown.website.amount + channelBreakdown.mobile.amount;
  const digitalPercentage = totalSales > 0 ? (digitalSales / totalSales) * 100 : 0;

  return {
    storeId: rawData.franchise_store,
    date: rawData.business_date,
    totalDailySales: totalSales,
    totalOrderCount: totalOrders,
    averageOrderValue: totalOrders > 0 ? totalSales / totalOrders : 0,
    peakSalesHour: peakHour.hour,
    peakSalesAmount: peakHour.sales,
    activeHours: activeHours.length,
    digitalSalesPercentage: digitalPercentage,
    channelBreakdown
  };
}

/**
 * Calculate channel breakdown metrics
 */
function calculateChannelBreakdown(
  processedData: ProcessedHourlySales[],
  totalSales: number
) {
  const channels = {
    phone: { amount: 0, orderCount: 0 },
    callCenter: { amount: 0, orderCount: 0 },
    driveThru: { amount: 0, orderCount: 0 },
    website: { amount: 0, orderCount: 0 },
    mobile: { amount: 0, orderCount: 0 }
  };

  processedData.forEach(hour => {
    channels.phone.amount += hour.Phone_Sales || 0;
    channels.callCenter.amount += hour.Call_Center_Agent || 0;
    channels.driveThru.amount += hour.Drive_Thru || 0;
    channels.website.amount += hour.Website || 0;
    channels.mobile.amount += hour.Mobile || 0;
    
    // Count orders based on primary channel
    if (hour.primaryChannel) {
      const orderCount = hour.Order_Count || 0;
      switch (hour.primaryChannel) {
        case SalesChannel.PHONE_SALES:
          channels.phone.orderCount += orderCount;
          break;
        case SalesChannel.CALL_CENTER:
          channels.callCenter.orderCount += orderCount;
          break;
        case SalesChannel.DRIVE_THRU:
          channels.driveThru.orderCount += orderCount;
          break;
        case SalesChannel.WEBSITE:
          channels.website.orderCount += orderCount;
          break;
        case SalesChannel.MOBILE:
          channels.mobile.orderCount += orderCount;
          break;
      }
    }
  });

  return {
    phone: {
      amount: channels.phone.amount,
      percentage: totalSales > 0 ? (channels.phone.amount / totalSales) * 100 : 0,
      orderCount: channels.phone.orderCount,
      averageOrderValue: channels.phone.orderCount > 0 ? channels.phone.amount / channels.phone.orderCount : 0
    },
    callCenter: {
      amount: channels.callCenter.amount,
      percentage: totalSales > 0 ? (channels.callCenter.amount / totalSales) * 100 : 0,
      orderCount: channels.callCenter.orderCount,
      averageOrderValue: channels.callCenter.orderCount > 0 ? channels.callCenter.amount / channels.callCenter.orderCount : 0
    },
    driveThru: {
      amount: channels.driveThru.amount,
      percentage: totalSales > 0 ? (channels.driveThru.amount / totalSales) * 100 : 0,
      orderCount: channels.driveThru.orderCount,
      averageOrderValue: channels.driveThru.orderCount > 0 ? channels.driveThru.amount / channels.driveThru.orderCount : 0
    },
    website: {
      amount: channels.website.amount,
      percentage: totalSales > 0 ? (channels.website.amount / totalSales) * 100 : 0,
      orderCount: channels.website.orderCount,
      averageOrderValue: channels.website.orderCount > 0 ? channels.website.amount / channels.website.orderCount : 0
    },
    mobile: {
      amount: channels.mobile.amount,
      percentage: totalSales > 0 ? (channels.mobile.amount / totalSales) * 100 : 0,
      orderCount: channels.mobile.orderCount,
      averageOrderValue: channels.mobile.orderCount > 0 ? channels.mobile.amount / channels.mobile.orderCount : 0
    }
  };
}

/**
 * Analyze sales by business periods
 */
function analyzePeriods(processedData: ProcessedHourlySales[]): PeriodSalesMetrics[] {
  return Object.values(BusinessTimePeriods).map(period => {
    const periodHours = processedData.filter(hour => 
      hour.hour >= period.startHour && hour.hour <= period.endHour
    );
    
    const totalSales = periodHours.reduce((sum, hour) => sum + (hour.Total_Sales || 0), 0);
    const totalOrders = periodHours.reduce((sum, hour) => sum + (hour.Order_Count || 0), 0);
    const activeHours = periodHours.filter(hour => hour.hasActivity);
    
    const peakHour = periodHours.reduce((peak, current) => 
      (current.Total_Sales || 0) > (peak.Total_Sales || 0) ? current : peak
    );

    return {
      period,
      totalSales,
      totalOrders,
      averageOrderValue: totalOrders > 0 ? totalSales / totalOrders : 0,
      percentageOfDaily: 0, // Will be calculated in selector
      peakHour: peakHour.hour,
      salesPerHour: activeHours.length > 0 ? totalSales / activeHours.length : 0
    };
  });
}

/**
 * Generate trend analysis
 */
function generateTrendAnalysis(processedData: ProcessedHourlySales[]): SalesTrendData[] {
  const dailyAverage = processedData.reduce((sum, hour) => sum + (hour.Total_Sales || 0), 0) / 24;
  
  return processedData.map((hour, index) => {
    const currentSales = hour.Total_Sales || 0;
    const percentageChange = dailyAverage > 0 ? ((currentSales - dailyAverage) / dailyAverage) * 100 : 0;
    
    let trend: 'up' | 'down' | 'stable' = 'stable';
    if (percentageChange > 10) trend = 'up';
    else if (percentageChange < -10) trend = 'down';
    
    return {
      hour: index,
      currentSales,
      percentageChange,
      trend,
      aboveAverage: currentSales > dailyAverage
    };
  });
}

/**
 * Validate hourly sales data
 */
function validateHourlySalesData(
  rawData: DailyHourlySales,
  processedData: ProcessedHourlySales[]
): HourlySalesValidation {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Check data completeness
  if (rawData.hours.length !== 24) {
    errors.push(`Expected 24 hours of data, got ${rawData.hours.length}`);
  }
  
  // Check for missing data
  const activeHours = processedData.filter(hour => hour.hasActivity);
  if (activeHours.length === 0) {
    errors.push('No active sales hours found');
  }
  
  // Check for anomalies
  const totalSales = processedData.reduce((sum, hour) => sum + (hour.Total_Sales || 0), 0);
  if (totalSales === 0) {
    warnings.push('Total daily sales is zero');
  }
  
  // Calculate completeness
  const nonEmptyHours = processedData.filter(hour => 
    Object.keys(hour).some(key => key !== 'hour' && key !== 'hasActivity' && hour[key as keyof typeof hour] !== 0)
  );
  const completeness = (nonEmptyHours.length / 24) * 100;
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    completeness
  };
}

// =============================================================================
// SELECTORS
// =============================================================================

/**
 * Select complete hourly sales state
 */
export const selectHourlySalesState = (state: { hourlySales: HourlySalesState }) => 
  state.hourlySales;

/**
 * Select raw hourly sales data
 */
export const selectRawHourlySalesData = (state: { hourlySales: HourlySalesState }) => 
  state.hourlySales.rawData;

/**
 * Select processed hourly sales data with filtering and sorting
 */
export const selectProcessedHourlySalesData = createSelector(
  [
    (state: { hourlySales: HourlySalesState }) => state.hourlySales.processedData,
    (state: { hourlySales: HourlySalesState }) => state.hourlySales.currentFilter,
    (state: { hourlySales: HourlySalesState }) => state.hourlySales.currentSort
  ],
  (processedData, filter, sort) => {
    if (!processedData) return null;
    
    let filteredData = [...processedData];
    
    // Apply filter
    if (filter) {
      filteredData = applyHourlySalesFilter(filteredData, filter);
    }
    
    // Apply sort
    filteredData = applySorting(filteredData, sort);
    
    return filteredData;
  }
);

/**
 * Select daily sales summary
 */
export const selectDailySalesSummary = (state: { hourlySales: HourlySalesState }) => 
  state.hourlySales.summary;

/**
 * Select period analysis
 */
export const selectPeriodAnalysis = (state: { hourlySales: HourlySalesState }) => 
  state.hourlySales.periodAnalysis;

/**
 * Select trend analysis
 */
export const selectSalesTrends = (state: { hourlySales: HourlySalesState }) => 
  state.hourlySales.trends;

/**
 * Select validation results
 */
export const selectHourlySalesValidation = (state: { hourlySales: HourlySalesState }) => 
  state.hourlySales.validation;

/**
 * Select hourly sales loading state
 */
export const selectHourlySalesLoading = (state: { hourlySales: HourlySalesState }) => 
  state.hourlySales.status === ApiStatus.LOADING;

/**
 * Select hourly sales error
 */
export const selectHourlySalesError = (state: { hourlySales: HourlySalesState }) => 
  state.hourlySales.error;

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Apply filter to hourly sales data
 */
function applyHourlySalesFilter(
  data: ProcessedHourlySales[],
  filter: HourlySalesFilter
): ProcessedHourlySales[] {
  return data.filter(hour => {
    if (filter.minSales !== undefined && (hour.Total_Sales || 0) < filter.minSales) return false;
    if (filter.maxSales !== undefined && (hour.Total_Sales || 0) > filter.maxSales) return false;
    if (filter.minOrders !== undefined && (hour.Order_Count || 0) < filter.minOrders) return false;
    if (filter.maxOrders !== undefined && (hour.Order_Count || 0) > filter.maxOrders) return false;
    if (filter.includeHours && !filter.includeHours.includes(hour.hour)) return false;
    if (filter.excludeHours && filter.excludeHours.includes(hour.hour)) return false;
    if (filter.activeOnly && !hour.hasActivity) return false;
    
    return true;
  });
}

/**
 * Apply sorting to hourly sales data
 */
function applySorting(
  data: ProcessedHourlySales[],
  sort: HourlySalesSort
): ProcessedHourlySales[] {
  return [...data].sort((a, b) => {
    switch (sort) {
      case 'hour_asc':
        return a.hour - b.hour;
      case 'hour_desc':
        return b.hour - a.hour;
      case 'sales_asc':
        return (a.Total_Sales || 0) - (b.Total_Sales || 0);
      case 'sales_desc':
        return (b.Total_Sales || 0) - (a.Total_Sales || 0);
      case 'orders_asc':
        return (a.Order_Count || 0) - (b.Order_Count || 0);
      case 'orders_desc':
        return (b.Order_Count || 0) - (a.Order_Count || 0);
      default:
        return 0;
    }
  });
}

// =============================================================================
// SLICE EXPORT
// =============================================================================

export default hourlySalesSlice.reducer;
