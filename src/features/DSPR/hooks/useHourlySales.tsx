/**
 * Hourly Sales Custom Hook
 * Domain-specific hook for managing hourly sales data and business logic
 * 
 * This hook:
 * - Provides access to processed hourly sales data
 * - Manages filtering, sorting, and analysis operations
 * - Offers business logic calculations and insights
 * - Handles domain-specific state management
 * - Integrates with the main DSPR API coordination
 */

import { useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../../../store';
import {
  resetHourlySalesState,
  clearHourlySalesError,
  setHourlySalesFilter,
  setHourlySalesSort,
  updateHourlySalesConfig,
  reprocessHourlySalesData,
  selectHourlySalesState,
  selectRawHourlySalesData,
  selectProcessedHourlySalesData,
  selectDailySalesSummary,
  selectPeriodAnalysis,
  selectSalesTrends,
  selectHourlySalesValidation,
  selectHourlySalesLoading,
  selectHourlySalesError
} from '../store/hourlySalesSlice';
import {
  type HourlySalesFilter,
  type HourlySalesSort,
  type ProcessedHourlySales,
  type SalesTimePeriod,
  BusinessTimePeriods,
  SalesChannel,
  defaultHourlySalesConfig,
  isValidHour,
} from '../types/hourlySales';
import { useDsprApi } from '../hooks/useCoordinator';

// =============================================================================
// HOOK INTERFACE
// =============================================================================

/**
 * Configuration options for the hourly sales hook
 */
export interface UseHourlySalesOptions {
  /** Whether to automatically process data when it becomes available */
  autoProcess?: boolean;
  /** Default filter to apply */
  defaultFilter?: HourlySalesFilter;
  /** Default sort order */
  defaultSort?: HourlySalesSort;
  /** Whether to enable detailed logging */
  enableLogging?: boolean;
  /** Custom configuration overrides */
  configOverrides?: Partial<typeof defaultHourlySalesConfig>;
}

/**
 * Return type of the useHourlySales hook
 */
export interface UseHourlySalesReturn {
  // Data and State
  /** Raw hourly sales data from API */
  rawData: ReturnType<typeof selectRawHourlySalesData>;
  /** Processed hourly sales data with filtering/sorting applied */
  processedData: ProcessedHourlySales[] | null;
  /** Daily sales summary metrics */
  summary: ReturnType<typeof selectDailySalesSummary>;
  /** Period-based analysis data */
  periodAnalysis: ReturnType<typeof selectPeriodAnalysis>;
  /** Sales trend analysis */
  trends: ReturnType<typeof selectSalesTrends>;
  /** Data validation results */
  validation: ReturnType<typeof selectHourlySalesValidation>;
  /** Current loading state */
  isLoading: boolean;
  /** Current error state */
  error: string | null;

  // Current Settings
  /** Current filter configuration */
  currentFilter: HourlySalesFilter | null;
  /** Current sort configuration */
  currentSort: HourlySalesSort;

  // Actions
  /** Update filter settings */
  setFilter: (filter: HourlySalesFilter | null) => void;
  /** Update sort settings */
  setSort: (sort: HourlySalesSort) => void;
  /** Update analysis configuration */
  updateConfig: (config: Partial<typeof defaultHourlySalesConfig>) => void;
  /** Manually reprocess data */
  reprocessData: () => void;
  /** Reset hourly sales state */
  resetState: () => void;
  /** Clear current error */
  clearError: () => void;

  // Business Logic Functions
  /** Get sales data for specific hour */
  getHourData: (hour: number) => ProcessedHourlySales | null;
  /** Get sales data for time period */
  getPeriodData: (period: SalesTimePeriod) => ProcessedHourlySales[];
  /** Get peak sales information */
  getPeakSalesInfo: () => PeakSalesInfo | null;
  /** Calculate period performance */
  calculatePeriodPerformance: (startHour: number, endHour: number) => PeriodPerformance;
  /** Get channel performance analysis */
  getChannelAnalysis: () => ChannelAnalysis | null;
  /** Find hours matching criteria */
  findHours: (criteria: HourCriteria) => ProcessedHourlySales[];

  // Utilities
  /** Check if data is available and valid */
  hasValidData: () => boolean;
  /** Get data quality score */
  getDataQuality: () => DataQuality;
  /** Export data in various formats */
  exportData: (format: ExportFormat) => ExportResult;
}

/**
 * Peak sales information
 */
export interface PeakSalesInfo {
  /** Hour with highest sales */
  peakHour: number;
  /** Peak sales amount */
  peakAmount: number;
  /** Peak order count */
  peakOrders: number;
  /** Time range description */
  timeDescription: string;
  /** Percentage of daily sales */
  percentageOfDaily: number;
}

/**
 * Period performance analysis
 */
export interface PeriodPerformance {
  /** Start and end hours */
  period: { startHour: number; endHour: number };
  /** Total sales for period */
  totalSales: number;
  /** Total orders for period */
  totalOrders: number;
  /** Average order value */
  averageOrderValue: number;
  /** Sales per hour */
  salesPerHour: number;
  /** Active hours in period */
  activeHours: number;
  /** Best performing hour */
  bestHour: number;
  /** Performance vs daily average */
  vsDaily: number;
}

/**
 * Channel performance analysis
 */
export interface ChannelAnalysis {
  /** Performance by channel */
  channels: Record<SalesChannel, ChannelPerformance>;
  /** Top performing channel */
  topChannel: SalesChannel;
  /** Digital vs traditional split */
  digitalVsTraditional: {
    digital: number;
    traditional: number;
    digitalPercentage: number;
  };
  /** Channel diversity score */
  diversityScore: number;
}

/**
 * Individual channel performance
 */
export interface ChannelPerformance {
  /** Total sales */
  sales: number;
  /** Order count */
  orders: number;
  /** Average order value */
  averageOrderValue: number;
  /** Percentage of total sales */
  percentage: number;
  /** Peak hour for this channel */
  peakHour: number;
}

/**
 * Hour search criteria
 */
export interface HourCriteria {
  /** Minimum sales threshold */
  minSales?: number;
  /** Maximum sales threshold */
  maxSales?: number;
  /** Specific channels to include */
  channels?: SalesChannel[];
  /** Only active hours */
  activeOnly?: boolean;
  /** Above daily average */
  aboveAverage?: boolean;
}

/**
 * Data quality assessment
 */
export interface DataQuality {
  /** Overall quality score (0-100) */
  overallScore: number;
  /** Completeness percentage */
  completeness: number;
  /** Data consistency score */
  consistency: number;
  /** Number of anomalies detected */
  anomalies: number;
  /** Quality issues found */
  issues: string[];
  /** Quality level description */
  level: 'Excellent' | 'Good' | 'Fair' | 'Poor' | 'Critical';
}

/**
 * Export formats
 */
export type ExportFormat = 'csv' | 'json' | 'summary' | 'chart-data';

/**
 * Export result
 */
export interface ExportResult {
  /** Export format used */
  format: ExportFormat;
  /** Exported data */
  data: string | object;
  /** Filename suggestion */
  filename: string;
  /** Export metadata */
  metadata: {
    exportDate: string;
    recordCount: number;
    dateRange: string;
  };
}

// =============================================================================
// HOOK IMPLEMENTATION
// =============================================================================

/**
 * Hourly Sales domain hook
 * Provides comprehensive access to hourly sales data and business logic
 * 
 * @param options - Configuration options for the hook
 * @returns Object containing data, actions, and business logic functions
 */
export const useHourlySales = (options: UseHourlySalesOptions = {}): UseHourlySalesReturn => {
  const {
    defaultFilter,
    defaultSort = 'hour_asc',
    enableLogging = process.env.NODE_ENV === 'development',
    configOverrides
  } = options;

  const dispatch = useDispatch<AppDispatch>();

  // Get DSPR API state for coordination
  const {  isLoading: dsprLoading } = useDsprApi();

  // Selectors
  const hourlySalesState = useSelector((state: RootState) => selectHourlySalesState(state));
  const rawData = useSelector((state: RootState) => selectRawHourlySalesData(state));
  const processedData = useSelector((state: RootState) => selectProcessedHourlySalesData(state));
  const summary = useSelector((state: RootState) => selectDailySalesSummary(state));
  const periodAnalysis = useSelector((state: RootState) => selectPeriodAnalysis(state));
  const trends = useSelector((state: RootState) => selectSalesTrends(state));
  const validation = useSelector((state: RootState) => selectHourlySalesValidation(state));
  const isLoading = useSelector((state: RootState) => selectHourlySalesLoading(state));
  const error = useSelector((state: RootState) => selectHourlySalesError(state));

  // Apply default filter and sort on mount
  useMemo(() => {
    if (defaultFilter && !hourlySalesState.currentFilter) {
      dispatch(setHourlySalesFilter(defaultFilter));
    }
    if (defaultSort !== hourlySalesState.currentSort) {
      dispatch(setHourlySalesSort(defaultSort));
    }
  }, [defaultFilter, defaultSort, hourlySalesState.currentFilter, hourlySalesState.currentSort, dispatch]);

  // Apply configuration overrides
  useMemo(() => {
    if (configOverrides) {
      dispatch(updateHourlySalesConfig(configOverrides));
      if (enableLogging) {
        console.log('[useHourlySales] Configuration overrides applied', configOverrides);
      }
    }
  }, [configOverrides, dispatch, enableLogging]);

  // Actions
  const setFilter = useCallback((filter: HourlySalesFilter | null) => {
    dispatch(setHourlySalesFilter(filter));
    if (enableLogging) {
      console.log('[useHourlySales] Filter updated', filter);
    }
  }, [dispatch, enableLogging]);

  const setSort = useCallback((sort: HourlySalesSort) => {
    dispatch(setHourlySalesSort(sort));
    if (enableLogging) {
      console.log('[useHourlySales] Sort updated', sort);
    }
  }, [dispatch, enableLogging]);

  const updateConfig = useCallback((config: Partial<typeof defaultHourlySalesConfig>) => {
    dispatch(updateHourlySalesConfig(config));
    if (enableLogging) {
      console.log('[useHourlySales] Configuration updated', config);
    }
  }, [dispatch, enableLogging]);

  const reprocessData = useCallback(() => {
    dispatch(reprocessHourlySalesData());
    if (enableLogging) {
      console.log('[useHourlySales] Data reprocessing triggered');
    }
  }, [dispatch, enableLogging]);

  const resetState = useCallback(() => {
    dispatch(resetHourlySalesState());
    if (enableLogging) {
      console.log('[useHourlySales] State reset');
    }
  }, [dispatch, enableLogging]);

  const clearError = useCallback(() => {
    dispatch(clearHourlySalesError());
    if (enableLogging) {
      console.log('[useHourlySales] Error cleared');
    }
  }, [dispatch, enableLogging]);

  // Business Logic Functions
  const getHourData = useCallback((hour: number): ProcessedHourlySales | null => {
    if (!processedData || !isValidHour(hour)) {
      return null;
    }
    return processedData.find(data => data.hour === hour) || null;
  }, [processedData]);

  const getPeriodData = useCallback((period: SalesTimePeriod): ProcessedHourlySales[] => {
    if (!processedData) {
      return [];
    }
    return processedData.filter(data => 
      data.hour >= period.startHour && data.hour <= period.endHour
    );
  }, [processedData]);

  const getPeakSalesInfo = useCallback((): PeakSalesInfo | null => {
    if (!processedData || !summary) {
      return null;
    }

    const peakHourData = getHourData(summary.peakSalesHour);
    if (!peakHourData) {
      return null;
    }

    const formatTime = (hour: number): string => {
      const period = hour >= 12 ? 'PM' : 'AM';
      const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
      return `${displayHour}:00 ${period}`;
    };

    return {
      peakHour: summary.peakSalesHour,
      peakAmount: summary.peakSalesAmount,
      peakOrders: peakHourData.Order_Count || 0,
      timeDescription: formatTime(summary.peakSalesHour),
      percentageOfDaily: summary.totalDailySales > 0 
        ? (summary.peakSalesAmount / summary.totalDailySales) * 100 
        : 0
    };
  }, [processedData, summary, getHourData]);

  const calculatePeriodPerformance = useCallback((
    startHour: number, 
    endHour: number
  ): PeriodPerformance => {
    const periodData = processedData?.filter(data => 
      data.hour >= startHour && data.hour <= endHour
    ) || [];

    const totalSales = periodData.reduce((sum, data) => sum + (data.Total_Sales || 0), 0);
    const totalOrders = periodData.reduce((sum, data) => sum + (data.Order_Count || 0), 0);
    const activeHours = periodData.filter(data => data.hasActivity).length;
    const hourCount = endHour - startHour + 1;

    const bestHourData = periodData.reduce((best, current) => 
      (current.Total_Sales || 0) > (best.Total_Sales || 0) ? current : best
    );

    const dailyAverage = summary ? summary.totalDailySales / 24 : 0;
    const periodAverage = totalSales / hourCount;

    return {
      period: { startHour, endHour },
      totalSales,
      totalOrders,
      averageOrderValue: totalOrders > 0 ? totalSales / totalOrders : 0,
      salesPerHour: hourCount > 0 ? totalSales / hourCount : 0,
      activeHours,
      bestHour: bestHourData.hour,
      vsDaily: dailyAverage > 0 ? ((periodAverage - dailyAverage) / dailyAverage) * 100 : 0
    };
  }, [processedData, summary]);

  const getChannelAnalysis = useCallback((): ChannelAnalysis | null => {
    if (!processedData || !summary) {
      return null;
    }

    // Build channel performance data
    const channels: Record<SalesChannel, ChannelPerformance> = {} as any;
    
    Object.values(SalesChannel).forEach(channel => {
      let totalSales = 0;
      let totalOrders = 0;
      let peakHour = 0;
      let peakAmount = 0;

      processedData.forEach(hourData => {
        let channelSales = 0;
        
        switch (channel) {
          case SalesChannel.WEBSITE:
            channelSales = hourData.Website || 0;
            break;
          case SalesChannel.MOBILE:
            channelSales = hourData.Mobile || 0;
            break;
          case SalesChannel.PHONE_SALES:
            channelSales = hourData.Phone_Sales || 0;
            break;
          case SalesChannel.DRIVE_THRU:
            channelSales = hourData.Drive_Thru || 0;
            break;
          case SalesChannel.CALL_CENTER:
            channelSales = hourData.Call_Center_Agent || 0;
            break;
        }

        totalSales += channelSales;
        if (hourData.primaryChannel === channel) {
          totalOrders += hourData.Order_Count || 0;
        }

        if (channelSales > peakAmount) {
          peakAmount = channelSales;
          peakHour = hourData.hour;
        }
      });

      channels[channel] = {
        sales: totalSales,
        orders: totalOrders,
        averageOrderValue: totalOrders > 0 ? totalSales / totalOrders : 0,
        percentage: summary.totalDailySales > 0 ? (totalSales / summary.totalDailySales) * 100 : 0,
        peakHour
      };
    });

    // Find top channel
    const topChannel = Object.entries(channels).reduce((top, [channel, performance]) => 
      performance.sales > top[1].sales ? [channel, performance] : top
    )[0] as SalesChannel;

    // Calculate digital vs traditional
    const digitalSales = channels[SalesChannel.WEBSITE].sales + channels[SalesChannel.MOBILE].sales;
    const traditionalSales = summary.totalDailySales - digitalSales;
    const digitalPercentage = summary.totalDailySales > 0 ? (digitalSales / summary.totalDailySales) * 100 : 0;

    // Calculate diversity score (how evenly distributed sales are across channels)
    const nonZeroChannels = Object.values(channels).filter(c => c.sales > 0);
    const diversityScore = nonZeroChannels.length > 1 
      ? Math.min(100, (nonZeroChannels.length / Object.keys(channels).length) * 100)
      : 0;

    return {
      channels,
      topChannel,
      digitalVsTraditional: {
        digital: digitalSales,
        traditional: traditionalSales,
        digitalPercentage
      },
      diversityScore
    };
  }, [processedData, summary]);

  const findHours = useCallback((criteria: HourCriteria): ProcessedHourlySales[] => {
    if (!processedData) {
      return [];
    }

    return processedData.filter(hourData => {
      // Check sales thresholds
      if (criteria.minSales !== undefined && (hourData.Total_Sales || 0) < criteria.minSales) {
        return false;
      }
      if (criteria.maxSales !== undefined && (hourData.Total_Sales || 0) > criteria.maxSales) {
        return false;
      }

      // Check activity filter
      if (criteria.activeOnly && !hourData.hasActivity) {
        return false;
      }

      // Check channels
      if (criteria.channels && criteria.channels.length > 0) {
        if (!hourData.primaryChannel || !criteria.channels.includes(hourData.primaryChannel)) {
          return false;
        }
      }

      // Check above average
      if (criteria.aboveAverage && summary) {
        const dailyAverage = summary.totalDailySales / 24;
        if ((hourData.Total_Sales || 0) <= dailyAverage) {
          return false;
        }
      }

      return true;
    });
  }, [processedData, summary]);

  // Utilities
  const hasValidData = useCallback((): boolean => {
    return !!(processedData && processedData.length > 0 && validation?.isValid);
  }, [processedData, validation]);

  const getDataQuality = useCallback((): DataQuality => {
    if (!validation || !processedData) {
      return {
        overallScore: 0,
        completeness: 0,
        consistency: 0,
        anomalies: 0,
        issues: ['No data available'],
        level: 'Critical'
      };
    }

    const completeness = validation.completeness;
    
    // Calculate consistency (variation in data patterns)
    const activeSales = processedData.filter(h => h.hasActivity).map(h => h.Total_Sales || 0);
    const avgSales = activeSales.reduce((sum, sales) => sum + sales, 0) / activeSales.length || 0;
    const variance = activeSales.reduce((sum, sales) => sum + Math.pow(sales - avgSales, 2), 0) / activeSales.length || 0;
    const consistency = avgSales > 0 ? Math.max(0, 100 - (Math.sqrt(variance) / avgSales * 100)) : 0;

    // Detect anomalies (hours with extremely high/low sales compared to neighbors)
    let anomalies = 0;
    for (let i = 1; i < processedData.length - 1; i++) {
      const current = processedData[i].Total_Sales || 0;
      const prev = processedData[i - 1].Total_Sales || 0;
      const next = processedData[i + 1].Total_Sales || 0;
      const avgNeighbor = (prev + next) / 2;
      
      if (avgNeighbor > 0 && Math.abs(current - avgNeighbor) / avgNeighbor > 3) {
        anomalies++;
      }
    }

    const overallScore = (completeness + consistency) / 2;
    
    let level: DataQuality['level'] = 'Critical';
    if (overallScore >= 90) level = 'Excellent';
    else if (overallScore >= 75) level = 'Good';
    else if (overallScore >= 60) level = 'Fair';
    else if (overallScore >= 40) level = 'Poor';

    return {
      overallScore,
      completeness,
      consistency,
      anomalies,
      issues: [...validation.errors, ...validation.warnings],
      level
    };
  }, [validation, processedData]);

  const exportData = useCallback((format: ExportFormat): ExportResult => {
    if (!processedData || !summary) {
      throw new Error('No data available for export');
    }

    const exportDate = new Date().toISOString();
    const dateRange = `${summary.date}`;
    
    let data: string | object;
    let filename: string;

    switch (format) {
      case 'csv':
        const csvHeaders = 'Hour,Total Sales,Order Count,Website,Mobile,Phone,Drive Thru,Has Activity,Average Order Value,Digital %';
        const csvRows = processedData.map(h => 
          `${h.hour},${h.Total_Sales || 0},${h.Order_Count || 0},${h.Website || 0},${h.Mobile || 0},${h.Phone_Sales || 0},${h.Drive_Thru || 0},${h.hasActivity},${h.averageOrderValue.toFixed(2)},${h.digitalSalesPercentage.toFixed(2)}`
        ).join('\n');
        data = `${csvHeaders}\n${csvRows}`;
        filename = `hourly-sales-${summary.storeId}-${summary.date}.csv`;
        break;

      case 'json':
        data = {
          summary,
          hourlyData: processedData,
          periodAnalysis,
          trends,
          validation
        };
        filename = `hourly-sales-${summary.storeId}-${summary.date}.json`;
        break;

      case 'summary':
        data = {
          store: summary.storeId,
          date: summary.date,
          totalSales: summary.totalDailySales,
          totalOrders: summary.totalOrderCount,
          averageOrderValue: summary.averageOrderValue,
          peakHour: summary.peakSalesHour,
          peakSales: summary.peakSalesAmount,
          activeHours: summary.activeHours,
          digitalPercentage: summary.digitalSalesPercentage
        };
        filename = `sales-summary-${summary.storeId}-${summary.date}.json`;
        break;

      case 'chart-data':
        data = {
          labels: processedData.map(h => `${h.hour}:00`),
          datasets: [
            {
              label: 'Total Sales',
              data: processedData.map(h => h.Total_Sales || 0)
            },
            {
              label: 'Order Count',
              data: processedData.map(h => h.Order_Count || 0)
            }
          ]
        };
        filename = `chart-data-${summary.storeId}-${summary.date}.json`;
        break;

      default:
        throw new Error(`Unsupported export format: ${format}`);
    }

    return {
      format,
      data,
      filename,
      metadata: {
        exportDate,
        recordCount: processedData.length,
        dateRange
      }
    };
  }, [processedData, summary, periodAnalysis, trends, validation]);

  return {
    // Data and State
    rawData,
    processedData,
    summary,
    periodAnalysis,
    trends,
    validation,
    isLoading: isLoading || dsprLoading,
    error,

    // Current Settings
    currentFilter: hourlySalesState.currentFilter,
    currentSort: hourlySalesState.currentSort,

    // Actions
    setFilter,
    setSort,
    updateConfig,
    reprocessData,
    resetState,
    clearError,

    // Business Logic Functions
    getHourData,
    getPeriodData,
    getPeakSalesInfo,
    calculatePeriodPerformance,
    getChannelAnalysis,
    findHours,

    // Utilities
    hasValidData,
    getDataQuality,
    exportData
  };
};

// =============================================================================
// CONVENIENCE HOOKS
// =============================================================================

/**
 * Simplified hook for basic hourly sales data
 */
export const useSimpleHourlySales = () => {
  const {
    processedData,
    summary,
    isLoading,
    error,
    hasValidData
  } = useHourlySales();

  return {
    data: processedData,
    summary,
    isLoading,
    error,
    hasData: hasValidData()
  };
};

/**
 * Hook for hourly sales business periods analysis
 */
export const useBusinessPeriods = () => {
  const { calculatePeriodPerformance, processedData } = useHourlySales();

  const periods = useMemo(() => {
    if (!processedData) return {};
    
    return Object.entries(BusinessTimePeriods).reduce((acc, [key, period]) => {
      acc[key] = calculatePeriodPerformance(period.startHour, period.endHour);
      return acc;
    }, {} as Record<string, PeriodPerformance>);
  }, [calculatePeriodPerformance, processedData]);

  return periods;
};

/**
 * Hook for peak sales analysis
 */
export const usePeakSales = () => {
  const { getPeakSalesInfo, findHours } = useHourlySales();

  const peakInfo = getPeakSalesInfo();
  const topHours = findHours({ 
    aboveAverage: true,
    activeOnly: true 
  }).sort((a, b) => (b.Total_Sales || 0) - (a.Total_Sales || 0)).slice(0, 5);

  return {
    peakInfo,
    topHours
  };
};

// =============================================================================
// HOOK EXPORTS
// =============================================================================

export default useHourlySales;
