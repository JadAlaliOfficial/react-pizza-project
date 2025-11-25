/**
 * ============================================================================
 * DSPR DAILY SLICE
 * ============================================================================
 * Domain: Daily DSPR (Daily Store Performance Report)
 * 
 * Responsibility:
 * - Derives daily DSPR data from central DSPR API response
 * - Processes raw daily data into comprehensive operational metrics
 * - Calculates financial, operational, quality, and cost control summaries
 * - Generates performance alerts based on targets and thresholds
 * - Analyzes sales channel performance
 * - Manages configuration and filtering
 * - Provides selectors for accessing processed daily metrics
 * 
 * Data Flow:
 * 1. Central dsprApiSlice fetches full DsprApiResponse
 * 2. This slice listens to fetchDsprData.fulfilled
 * 3. Extracts reports.daily.dailyDSPRData
 * 4. Processes into ProcessedDSPRData with categorized summaries
 * 5. Components consume via useDailyDspr hook
 * 
 * Related Files:
 * - Source: state/dsprApiSlice.ts (central API state)
 * - Types: types/dspr.daily.ts (all daily DSPR types)
 * - Hook: hooks/useDailyDspr.ts (React hook)
 * 
 * State Shape:
 * - raw: DailyDSPRData | null (from API)
 * - processed: ProcessedDSPRData | null (enriched data)
 * - config: DSPRAnalysisConfig (targets and settings)
 * - lastProcessed: string | null (timestamp)
 */

import { createSlice, createSelector, type PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '@/store';
import { fetchDsprData } from './dsprApiSlice';
import type { StoreId, ApiDate } from '../types/dspr.common';
import {
  type DailyDSPRData,
  type ProcessedDSPRData,
  type ProcessedDailyMetrics,
  type FinancialMetrics,
  type OperationalMetrics,
  type SalesChannelMetrics,
  type QualityMetrics,
  type CostControlMetrics,
  type ChannelPerformance,
  type OperationalAlert,
  OperationalGrade,
  PerformanceGrade,
  QualityGrade,
  CostControlGrade,
  PerformanceLevel,
  SalesChannelType,
  TrendDirection,
  AlertSeverity,
  AlertCategory,
  AlertPriority,
  AlertImpact,
  type DSPRAnalysisConfig,
  type PerformanceTargets,
  type AlertSettings,
  type CostThresholds,
  defaultDSPRConfig,
  calculateVariance,
} from '../types/dspr.daily';

// ============================================================================
// STATE TYPES
// ============================================================================

/**
 * Daily DSPR slice state
 */
interface DailyDSPRState {
  /** Raw daily DSPR data from API */
  raw: DailyDSPRData | null;
  
  /** Processed daily DSPR with metrics and alerts */
  processed: ProcessedDSPRData | null;
  
  /** Analysis configuration */
  config: DSPRAnalysisConfig;
  
  /** Timestamp when data was last processed */
  lastProcessed: string | null;
}

// ============================================================================
// INITIAL STATE
// ============================================================================

const initialState: DailyDSPRState = {
  raw: null,
  processed: null,
  config: defaultDSPRConfig,
  lastProcessed: null,
};

// ============================================================================
// PROCESSING FUNCTIONS
// ============================================================================

/**
 * Processes financial metrics
 */
function processFinancialMetrics(
  data: DailyDSPRData,
  targets: PerformanceTargets
): FinancialMetrics {
  const digitalSales = data.Website + data.Mobile;
  const revenuePerCustomer = data.Customer_count > 0 ? data.Total_Sales / data.Customer_count : 0;
  
  // Calculate performance grade based on multiple factors
  let score = 100;
  
  // Labor efficiency
  if (data.labor > targets.laborCostTarget) {
    score -= 20;
  } else if (data.labor > targets.laborCostTarget * 0.9) {
    score -= 10;
  }
  
  // Cash variance
  if (Math.abs(data.over_short) > 10) {
    score -= 15;
  } else if (Math.abs(data.over_short) > 5) {
    score -= 8;
  }
  
  // Digital sales performance
  if (data.Digital_Sales_Percent < targets.digitalSalesTarget) {
    score -= 10;
  }
  
  const performanceGrade = calculatePerformanceGrade(score);
  
  return {
    totalSales: data.Total_Sales,
    cashSales: data.Total_Cash_Sales,
    digitalSales,
    averageTicket: data.Avrage_ticket,
    tips: data.Total_TIPS,
    cashVariance: data.over_short,
    laborCostPercentage: data.labor,
    revenuePerCustomer,
    performanceGrade,
  };
}

/**
 * Processes operational metrics
 */
function processOperationalMetrics(
  data: DailyDSPRData,
  targets: PerformanceTargets
): OperationalMetrics {
  const totalOrders = data.Refunded_order_Qty + data.Modified_Order_Qty + data.Customer_count;
  const modificationRate = totalOrders > 0 ? data.Modified_Order_Qty / totalOrders : 0;
  const refundRate = totalOrders > 0 ? data.Refunded_order_Qty / totalOrders : 0;
  
  // Calculate efficiency score
  let efficiencyScore = 100;
  
  if (data.Customer_count_percent < targets.customerCountTarget) {
    efficiencyScore -= 20;
  }
  
  if (data.Put_into_Portal_Percent < targets.portalUtilizationTarget) {
    efficiencyScore -= 15;
  }
  
  if (data.In_Portal_on_Time_Percent < 0.95) {
    efficiencyScore -= 15;
  }
  
  if (modificationRate > 0.05) {
    efficiencyScore -= 10;
  }
  
  if (refundRate > 0.03) {
    efficiencyScore -= 10;
  }
  
  return {
    customerCount: data.Customer_count,
    customerCountPercentage: data.Customer_count_percent,
    portalUtilization: data.Put_into_Portal_Percent,
    portalOnTimePercentage: data.In_Portal_on_Time_Percent,
    modificationRate,
    refundRate,
    efficiencyScore: Math.max(0, efficiencyScore),
  };
}

/**
 * Processes sales channel metrics
 */
function processSalesChannelMetrics(data: DailyDSPRData): SalesChannelMetrics {
  const digitalSales = data.Website + data.Mobile;
  const deliverySales = data.DoorDash_Sales + data.UberEats_Sales + data.GrubHub_Sales;
  const phoneSales = data.Phone + data.Call_Center_Agent;
  const traditionalSales = data.Total_Sales - digitalSales - deliverySales - phoneSales - data.Drive_Thru_Sales;
  
  const createChannelPerformance = (
    channel: SalesChannelType,
    sales: number
  ): ChannelPerformance => {
    const percentage = data.Total_Sales > 0 ? (sales / data.Total_Sales) * 100 : 0;
    const orders = Math.floor(data.Customer_count * (percentage / 100));
    const averageOrderValue = orders > 0 ? sales / orders : 0;
    
    return {
      channel,
      sales,
      percentage,
      orders,
      averageOrderValue,
      trend: TrendDirection.STABLE, // Would need historical data
      performanceLevel: percentage > 30 ? PerformanceLevel.EXCELLENT : 
                       percentage > 20 ? PerformanceLevel.GOOD :
                       percentage > 10 ? PerformanceLevel.AVERAGE :
                       PerformanceLevel.BELOW_AVERAGE,
    };
  };
  
  const channels = [
    createChannelPerformance(SalesChannelType.TRADITIONAL, traditionalSales),
    createChannelPerformance(SalesChannelType.DIGITAL, digitalSales),
    createChannelPerformance(SalesChannelType.DELIVERY, deliverySales),
    createChannelPerformance(SalesChannelType.PHONE, phoneSales),
  ];
  
  const topChannel = channels.reduce((max, channel) => 
    channel.sales > max.sales ? channel : max
  ).channel;
  
  return {
    traditional: channels.find(c => c.channel === SalesChannelType.TRADITIONAL)!,
    digital: channels.find(c => c.channel === SalesChannelType.DIGITAL)!,
    delivery: channels.find(c => c.channel === SalesChannelType.DELIVERY)!,
    phone: channels.find(c => c.channel === SalesChannelType.PHONE)!,
    topChannel,
    digitalAdoptionRate: data.Digital_Sales_Percent,
  };
}

/**
 * Processes quality metrics
 */
function processQualityMetrics(data: DailyDSPRData): QualityMetrics {
  const totalOrders = data.Customer_count;
  const problematicOrders = data.Refunded_order_Qty + data.Modified_Order_Qty;
  const orderAccuracy = totalOrders > 0 ? ((totalOrders - problematicOrders) / totalOrders) * 100 : 100;
  
  // Service consistency based on portal performance
  const serviceConsistency = (data.Put_into_Portal_Percent + data.In_Portal_on_Time_Percent) / 2 * 100;
  
  // Calculate quality grade
  const avgScore = (data.Customer_Service * 100 + orderAccuracy + serviceConsistency) / 3;
  
  const qualityGrade = avgScore >= 95 ? QualityGrade.PREMIUM :
                      avgScore >= 85 ? QualityGrade.HIGH :
                      avgScore >= 75 ? QualityGrade.STANDARD :
                      avgScore >= 60 ? QualityGrade.BELOW_STANDARD :
                      QualityGrade.CRITICAL;
  
  return {
    customerServiceScore: data.Customer_Service,
    orderAccuracy,
    serviceConsistency,
    qualityGrade,
  };
}

/**
 * Processes cost control metrics
 */
function processCostControlMetrics(
  data: DailyDSPRData,
  thresholds: CostThresholds
): CostControlMetrics {
  const totalWaste = data.waste_gateway + data.Waste_Alta;
  const wastePercentage = data.Total_Sales > 0 ? (totalWaste / data.Total_Sales) * 100 : 0;
  
  // Labor efficiency score
  let laborEfficiency = 100;
  if (data.labor > thresholds.maxLaborPercentage) {
    laborEfficiency -= 40;
  } else if (data.labor > thresholds.maxLaborPercentage * 0.9) {
    laborEfficiency -= 20;
  }
  
  // Cost control grade
  let grade: CostControlGrade;
  if (data.labor <= thresholds.maxLaborPercentage * 0.8 && wastePercentage <= thresholds.maxWastePercentage * 0.5) {
    grade = CostControlGrade.OPTIMAL;
  } else if (data.labor <= thresholds.maxLaborPercentage && wastePercentage <= thresholds.maxWastePercentage) {
    grade = CostControlGrade.EFFICIENT;
  } else if (data.labor <= thresholds.maxLaborPercentage * 1.1 && wastePercentage <= thresholds.maxWastePercentage * 1.2) {
    grade = CostControlGrade.ACCEPTABLE;
  } else if (data.labor <= thresholds.maxLaborPercentage * 1.3 || wastePercentage <= thresholds.maxWastePercentage * 1.5) {
    grade = CostControlGrade.CONCERNING;
  } else {
    grade = CostControlGrade.CRITICAL;
  }
  
  return {
    totalWaste,
    wastePercentage,
    laborEfficiency,
    costControlGrade: grade,
  };
}

/**
 * Calculates performance grade from score
 */
function calculatePerformanceGrade(score: number): PerformanceGrade {
  if (score >= 97) return PerformanceGrade.A_PLUS;
  if (score >= 93) return PerformanceGrade.A;
  if (score >= 90) return PerformanceGrade.B_PLUS;
  if (score >= 85) return PerformanceGrade.B;
  if (score >= 80) return PerformanceGrade.C_PLUS;
  if (score >= 70) return PerformanceGrade.C;
  if (score >= 60) return PerformanceGrade.D_PLUS;
  if (score >= 50) return PerformanceGrade.D;
  return PerformanceGrade.F;
}

/**
 * Calculates overall operational grade
 */
function calculateOverallGrade(
  financial: FinancialMetrics,
  operational: OperationalMetrics,
  quality: QualityMetrics,
  costControl: CostControlMetrics,
  weights: { financial: number; operational: number; quality: number; costControl: number }
): OperationalGrade {
  // Convert grades to numeric scores
  const financialScore = gradeToScore(financial.performanceGrade);
  const operationalScore = operational.efficiencyScore;
  const qualityScore = quality.customerServiceScore * 100;
  const costControlScore = costControl.laborEfficiency;
  
  const weightedScore =
    financialScore * weights.financial +
    operationalScore * weights.operational +
    qualityScore * weights.quality +
    costControlScore * weights.costControl;
  
  if (weightedScore >= 95) return OperationalGrade.OUTSTANDING;
  if (weightedScore >= 85) return OperationalGrade.EXCEEDS_EXPECTATIONS;
  if (weightedScore >= 70) return OperationalGrade.MEETS_EXPECTATIONS;
  if (weightedScore >= 55) return OperationalGrade.BELOW_EXPECTATIONS;
  return OperationalGrade.NEEDS_IMPROVEMENT;
}

/**
 * Converts performance grade to numeric score
 */
function gradeToScore(grade: PerformanceGrade): number {
  const gradeMap: Record<PerformanceGrade, number> = {
    'A+': 98, 'A': 95, 'B+': 88, 'B': 83, 'C+': 78, 'C': 73, 'D+': 65, 'D': 55, 'F': 40
  };
  return gradeMap[grade];
}

/**
 * Generates operational alerts
 */
function generateAlerts(
  data: DailyDSPRData,
  metrics: ProcessedDailyMetrics,
  config: DSPRAnalysisConfig
): OperationalAlert[] {
  if (!config.alertSettings.enableAlerts) return [];
  
  const alerts: OperationalAlert[] = [];
  const { targets } = config;
  const { minVarianceThreshold } = config.alertSettings;
  
  // Labor cost alert
  if (data.labor > targets.laborCostTarget) {
    const variance = calculateVariance(data.labor, targets.laborCostTarget);
    if (Math.abs(variance) >= minVarianceThreshold * 100) {
      alerts.push({
        severity: data.labor > targets.laborCostTarget * 1.2 ? AlertSeverity.CRITICAL : AlertSeverity.WARNING,
        category: AlertCategory.COST_CONTROL,
        metric: 'labor',
        title: 'Labor Cost Above Target',
        message: `Labor cost is ${variance.toFixed(1)}% above target`,
        currentValue: data.labor,
        targetValue: targets.laborCostTarget,
        variance,
        recommendations: [
          'Review staffing schedule for optimization',
          'Analyze peak hours and adjust accordingly',
          'Consider cross-training to improve flexibility',
        ],
        priority: variance > 20 ? AlertPriority.URGENT : AlertPriority.HIGH,
        impact: variance > 30 ? AlertImpact.SEVERE : variance > 15 ? AlertImpact.HIGH : AlertImpact.MODERATE,
      });
    }
  }
  
  // Waste alert
  const wastePercent = metrics.costControl.wastePercentage / 100;
  if (wastePercent > targets.wastePercentageTarget) {
    const variance = calculateVariance(wastePercent, targets.wastePercentageTarget);
    alerts.push({
      severity: wastePercent > targets.wastePercentageTarget * 1.5 ? AlertSeverity.ERROR : AlertSeverity.WARNING,
      category: AlertCategory.COST_CONTROL,
      metric: 'waste',
      title: 'Waste Above Target',
      message: `Waste is ${variance.toFixed(1)}% above target`,
      currentValue: wastePercent,
      targetValue: targets.wastePercentageTarget,
      variance,
      recommendations: [
        'Review inventory management practices',
        'Check for expired products',
        'Implement better portion control',
      ],
      priority: AlertPriority.HIGH,
      impact: AlertImpact.MODERATE,
    });
  }
  
  // Customer service alert
  if (data.Customer_Service < targets.customerServiceTarget) {
    const variance = calculateVariance(data.Customer_Service, targets.customerServiceTarget);
    alerts.push({
      severity: data.Customer_Service < targets.customerServiceTarget * 0.85 ? AlertSeverity.CRITICAL : AlertSeverity.WARNING,
      category: AlertCategory.QUALITY,
      metric: 'customerService',
      title: 'Customer Service Below Target',
      message: `Customer service score is ${Math.abs(variance).toFixed(1)}% below target`,
      currentValue: data.Customer_Service,
      targetValue: targets.customerServiceTarget,
      variance,
      recommendations: [
        'Review customer feedback and complaints',
        'Provide additional staff training',
        'Implement service recovery procedures',
      ],
      priority: AlertPriority.URGENT,
      impact: AlertImpact.HIGH,
    });
  }
  
  // Digital sales alert
  if (data.Digital_Sales_Percent < targets.digitalSalesTarget) {
    const variance = calculateVariance(data.Digital_Sales_Percent, targets.digitalSalesTarget);
    alerts.push({
      severity: AlertSeverity.INFO,
      category: AlertCategory.SALES,
      metric: 'digitalSales',
      title: 'Digital Sales Below Target',
      message: `Digital sales are ${Math.abs(variance).toFixed(1)}% below target`,
      currentValue: data.Digital_Sales_Percent,
      targetValue: targets.digitalSalesTarget,
      variance,
      recommendations: [
        'Promote online ordering channels',
        'Offer digital-exclusive deals',
        'Improve mobile app user experience',
      ],
      priority: AlertPriority.MEDIUM,
      impact: AlertImpact.LOW,
    });
  }
  
  // Portal utilization alert
  if (data.Put_into_Portal_Percent < targets.portalUtilizationTarget) {
    const variance = calculateVariance(data.Put_into_Portal_Percent, targets.portalUtilizationTarget);
    alerts.push({
      severity: AlertSeverity.WARNING,
      category: AlertCategory.OPERATIONAL,
      metric: 'portalUtilization',
      title: 'Portal Utilization Below Target',
      message: `Portal utilization is ${Math.abs(variance).toFixed(1)}% below target`,
      currentValue: data.Put_into_Portal_Percent,
      targetValue: targets.portalUtilizationTarget,
      variance,
      recommendations: [
        'Train staff on portal usage',
        'Review portal entry procedures',
        'Ensure all eligible orders are tracked',
      ],
      priority: AlertPriority.MEDIUM,
      impact: AlertImpact.MODERATE,
    });
  }
  
  // Sort by priority and limit
  return alerts
    .sort((a, b) => {
      const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    })
    .slice(0, config.alertSettings.maxAlertsPerAnalysis);
}

/**
 * Processes raw daily DSPR data into enriched format
 */
function processDailyDSPR(
  raw: DailyDSPRData,
  storeId: StoreId,
  date: ApiDate,
  config: DSPRAnalysisConfig
): ProcessedDSPRData {
  // Process each category
  const financial = processFinancialMetrics(raw, config.targets);
  const operational = processOperationalMetrics(raw, config.targets);
  const salesChannels = processSalesChannelMetrics(raw);
  const quality = processQualityMetrics(raw);
  const costControl = processCostControlMetrics(raw, config.costThresholds);
  
  const daily: ProcessedDailyMetrics = {
    financial,
    operational,
    salesChannels,
    quality,
    costControl,
  };
  
  // Calculate overall grade
  const overallGrade = calculateOverallGrade(
    financial,
    operational,
    quality,
    costControl,
    config.gradeWeights
  );
  
  // Generate alerts
  const alerts = generateAlerts(raw, daily, config);
  
  return {
    storeId,
    date,
    daily,
    alerts,
    overallGrade,
  };
}

// ============================================================================
// SLICE
// ============================================================================

const dsprDailySlice = createSlice({
  name: 'dsprDaily',
  initialState,
  reducers: {
    /**
     * Updates performance targets
     */
    setPerformanceTargets(state, action: PayloadAction<Partial<PerformanceTargets>>) {
      state.config.targets = {
        ...state.config.targets,
        ...action.payload,
      };
      
      // Re-process data with new targets
      if (state.raw && state.processed) {
        state.processed = processDailyDSPR(
          state.raw,
          state.processed.storeId,
          state.processed.date,
          state.config
        );
        state.lastProcessed = new Date().toISOString();
      }
    },
    
    /**
     * Updates alert settings
     */
    setAlertSettings(state, action: PayloadAction<Partial<AlertSettings>>) {
      state.config.alertSettings = {
        ...state.config.alertSettings,
        ...action.payload,
      };
      
      // Re-process to update alerts
      if (state.raw && state.processed) {
        state.processed = processDailyDSPR(
          state.raw,
          state.processed.storeId,
          state.processed.date,
          state.config
        );
        state.lastProcessed = new Date().toISOString();
      }
    },
    
    /**
     * Updates cost thresholds
     */
    setCostThresholds(state, action: PayloadAction<Partial<CostThresholds>>) {
      state.config.costThresholds = {
        ...state.config.costThresholds,
        ...action.payload,
      };
      
      // Re-process data with new thresholds
      if (state.raw && state.processed) {
        state.processed = processDailyDSPR(
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
      state.config.alertSettings.enableAlerts = action.payload;
      
      // Re-process to update alerts
      if (state.raw && state.processed) {
        state.processed = processDailyDSPR(
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
      state.config = defaultDSPRConfig;
      
      // Re-process if data exists
      if (state.raw && state.processed) {
        state.processed = processDailyDSPR(
          state.raw,
          state.processed.storeId,
          state.processed.date,
          state.config
        );
        state.lastProcessed = new Date().toISOString();
      }
    },
    
    /**
     * Clears all daily DSPR data
     */
    clearDailyData(state) {
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
        const dailyData = action.payload.reports?.daily?.dailyDSPRData as unknown as DailyDSPRData;
        const fv = (action.payload as any).FilteringValues ?? (action.payload as any)['Filtering Values'];
        const store = fv?.store ?? action.meta.arg.store;
        const date = fv?.date ?? action.meta.arg.date;
        
        if (!dailyData) {
          if (process.env.NODE_ENV === 'development') {
            console.warn('[Daily DSPR] No daily data in API response');
          }
          return;
        }
        
        try {
          // Store raw data
          state.raw = dailyData;
          
          // Process daily data
          state.processed = processDailyDSPR(
            dailyData,
            store,
            date,
            state.config
          );
          
          // Update timestamp
          state.lastProcessed = new Date().toISOString();
          
          if (process.env.NODE_ENV === 'development') {
            console.log('[Daily DSPR] Data processed:', {
              store,
              date,
              overallGrade: state.processed.overallGrade,
              alertCount: state.processed.alerts.length,
            });
          }
        } catch (error) {
          console.error('[Daily DSPR] Processing error:', error);
        }
      })
      
      // Keep stale data on error
      .addCase(fetchDsprData.rejected, (_state) => {
        if (process.env.NODE_ENV === 'development') {
          console.log('[Daily DSPR] Keeping stale data after API error');
        }
      });
  },
});

// ============================================================================
// ACTIONS
// ============================================================================

export const {
  setPerformanceTargets,
  setAlertSettings,
  setCostThresholds,
  toggleAlerts,
  resetConfig,
  clearDailyData,
} = dsprDailySlice.actions;

// ==========================================================================
// SELECTORS
// ==========================================================================
// Stable empty array to avoid new references in selectors
const EMPTY_ALERTS: OperationalAlert[] = [];

/**
 * Selects the entire daily DSPR state
 */
export const selectDailyDsprState = (state: RootState): DailyDSPRState => 
  state.dsprDaily;

/**
 * Selects raw daily DSPR data
 */
export const selectRawDailyDspr = (state: RootState): DailyDSPRData | null => 
  state.dsprDaily.raw;

/**
 * Selects processed daily DSPR data
 */
export const selectProcessedDailyDspr = (state: RootState): ProcessedDSPRData | null => 
  state.dsprDaily.processed;

/**
 * Selects daily metrics
 */
export const selectDailyMetrics = (state: RootState): ProcessedDailyMetrics | null => 
  state.dsprDaily.processed?.daily || null;

/**
 * Selects financial metrics
 */
export const selectFinancialMetrics = (state: RootState): FinancialMetrics | null => 
  state.dsprDaily.processed?.daily.financial || null;

/**
 * Selects operational metrics
 */
export const selectOperationalMetrics = (state: RootState): OperationalMetrics | null => 
  state.dsprDaily.processed?.daily.operational || null;

/**
 * Selects sales channel metrics
 */
export const selectSalesChannelMetrics = (state: RootState): SalesChannelMetrics | null => 
  state.dsprDaily.processed?.daily.salesChannels || null;

/**
 * Selects quality metrics
 */
export const selectQualityMetrics = (state: RootState): QualityMetrics | null => 
  state.dsprDaily.processed?.daily.quality || null;

/**
 * Selects cost control metrics
 */
export const selectCostControlMetrics = (state: RootState): CostControlMetrics | null => 
  state.dsprDaily.processed?.daily.costControl || null;

/**
 * Selects operational alerts
 */
export const selectDailyAlerts = (state: RootState): OperationalAlert[] => 
  state.dsprDaily.processed?.alerts ?? EMPTY_ALERTS;

/**
 * Selects critical alerts only
 */
export const selectCriticalDailyAlerts = createSelector(
  (state: RootState) => state.dsprDaily.processed?.alerts ?? EMPTY_ALERTS,
  (alerts) => alerts.filter(a => a.severity === AlertSeverity.CRITICAL)
);

/**
 * Selects urgent alerts only
 */
export const selectUrgentDailyAlerts = createSelector(
  (state: RootState) => state.dsprDaily.processed?.alerts ?? EMPTY_ALERTS,
  (alerts) => alerts.filter(a => a.priority === AlertPriority.URGENT)
);

/**
 * Selects overall operational grade
 */
export const selectOverallGrade = (state: RootState): OperationalGrade | null => 
  state.dsprDaily.processed?.overallGrade || null;

/**
 * Selects current configuration
 */
export const selectDailyDsprConfig = (state: RootState): DSPRAnalysisConfig => 
  state.dsprDaily.config;

/**
 * Selects last processed timestamp
 */
export const selectLastProcessedTime = (state: RootState): string | null => 
  state.dsprDaily.lastProcessed;

/**
 * Selects store ID
 */
export const selectDailyDsprStore = (state: RootState): StoreId | null => 
  state.dsprDaily.processed?.storeId || null;

/**
 * Selects business date
 */
export const selectDailyDsprDate = (state: RootState): ApiDate | null => 
  state.dsprDaily.processed?.date || null;

/**
 * Selects whether daily DSPR data exists
 */
export const selectHasDailyDspr = (state: RootState): boolean => 
  state.dsprDaily.raw !== null;

/**
 * Selects total sales
 */
export const selectTotalSales = (state: RootState): number => 
  state.dsprDaily.processed?.daily.financial.totalSales || 0;

/**
 * Selects labor cost percentage
 */
export const selectLaborCostPercentage = (state: RootState): number => 
  state.dsprDaily.processed?.daily.financial.laborCostPercentage || 0;

/**
 * Selects digital adoption rate
 */
export const selectDigitalAdoptionRate = (state: RootState): number => 
  state.dsprDaily.processed?.daily.salesChannels.digitalAdoptionRate || 0;

/**
 * Selects customer service score
 */
export const selectCustomerServiceScore = (state: RootState): number => 
  state.dsprDaily.processed?.daily.quality.customerServiceScore || 0;

/**
 * Selects waste percentage
 */
export const selectWastePercentage = (state: RootState): number => 
  state.dsprDaily.processed?.daily.costControl.wastePercentage || 0;

/**
 * Selects whether alerts are enabled
 */
export const selectAlertsEnabled = (state: RootState): boolean => 
  state.dsprDaily.config.alertSettings.enableAlerts;

/**
 * Selects alert count
 */
export const selectAlertCount = (state: RootState): number => 
  state.dsprDaily.processed?.alerts.length || 0;

/**
 * Selects whether there are critical alerts
 */
export const selectHasCriticalAlerts = (state: RootState): boolean => 
  (state.dsprDaily.processed?.alerts.some(a => a.severity === AlertSeverity.CRITICAL)) || false;

/**
 * Selects whether there are urgent alerts
 */
export const selectHasUrgentAlerts = (state: RootState): boolean => 
  (state.dsprDaily.processed?.alerts.some(a => a.priority === AlertPriority.URGENT)) || false;

/**
 * Selects top performing sales channel
 */
export const selectTopChannel = (state: RootState): SalesChannelType | null => 
  state.dsprDaily.processed?.daily.salesChannels.topChannel || null;

// ============================================================================
// REDUCER EXPORT
// ============================================================================

export default dsprDailySlice.reducer;

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type { DailyDSPRState };
