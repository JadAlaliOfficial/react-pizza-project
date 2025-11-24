/**
 * DSPR Metrics Custom Hook
 * Domain-specific hook for managing DSPR operational metrics and performance analysis
 * 
 * This hook:
 * - Provides access to processed DSPR operational data
 * - Manages financial, operational, quality, and cost control metrics
 * - Offers comprehensive business intelligence and analysis
 * - Handles alert management and performance monitoring
 * - Integrates with the main DSPR API coordination
 */

import { useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../../../store';
import {
  resetDSPRMetricsState,
  clearDSPRMetricsError,
  updateDSPRMetricsConfig,
  updateBenchmarks,
  dismissOperationalAlert,
  clearAllOperationalAlerts,
  reprocessDSPRMetricsData,
  selectDSPRMetricsState,
  selectRawDailyDSPRData,
  selectRawWeeklyDSPRData,
  selectProcessedDSPRData,
  selectOperationalAlerts,
  selectCriticalOperationalAlerts,
  selectFinancialMetrics,
  selectOperationalMetrics,
  selectSalesChannelMetrics,
  selectQualityMetrics,
  selectCostControlMetrics,
  selectWeeklyTrends,
  selectOverallGrade,
  selectDSPRMetricsLoading,
  selectDSPRMetricsError,
  selectPerformanceBenchmarks,
  selectHNRMetrics
} from '../store/dSPRSlice';
import {
  type DSPRAnalysisConfig,
  type OperationalAlert,
  PerformanceGrade,
  AlertCategory,
  AlertSeverity,
  AlertPriority,
  SalesChannelType,
  TrendDirection,
  type DailyDSPRByDate,
  type DailyDSPRDayWithPrevWeek,
  type DailyDSPRData,
  type HNRMetrics
} from '../types/DSPRDailyWeekly';
import type { ApiDate } from '../types/common';
import { useDsprApi } from '../hooks/useCoordinator';

// =============================================================================
// HOOK INTERFACE
// =============================================================================

/**
 * Configuration options for the DSPR metrics hook
 */
export interface UseDSPRMetricsOptions {
  /** Whether to automatically process alerts when data changes */
  autoProcessAlerts?: boolean;
  /** Whether to enable detailed logging */
  enableLogging?: boolean;
  /** Custom configuration overrides */
  configOverrides?: Partial<DSPRAnalysisConfig>;
  /** Focus areas for analysis */
  focusAreas?: AlertCategory[];
  /** Performance benchmark overrides */
  benchmarkOverrides?: Partial<PerformanceBenchmarks>;
}

/**
 * Performance benchmarks structure
 */
export interface PerformanceBenchmarks {
  historical: {
    laborCost: number;
    wastePercentage: number;
    customerService: number;
    digitalSalesPercent: number;
  };
  industry: {
    laborCost: number;
    wastePercentage: number;
    customerService: number;
    digitalSalesPercent: number;
  };
  targets: {
    laborCost: number;
    wastePercentage: number;
    customerService: number;
    digitalSalesPercent: number;
  };
}

/**
 * Return type of the useDSPRMetrics hook
 */
export interface UseDSPRMetricsReturn {
  // Data and State
  /** Raw daily DSPR data from API */
  dailyRawData: ReturnType<typeof selectRawDailyDSPRData>;
  /** Raw weekly DSPR data from API */
  weeklyRawData: ReturnType<typeof selectRawWeeklyDSPRData>;
  /** Processed DSPR data with analysis */
  processedData: ReturnType<typeof selectProcessedDSPRData>;
  /** Financial performance metrics */
  financialMetrics: ReturnType<typeof selectFinancialMetrics>;
  /** Operational efficiency metrics */
  operationalMetrics: ReturnType<typeof selectOperationalMetrics>;
  /** Sales channel performance */
  salesChannelMetrics: ReturnType<typeof selectSalesChannelMetrics>;
  /** Quality and service metrics */
  qualityMetrics: ReturnType<typeof selectQualityMetrics>;
  /** Cost control metrics */
  costControlMetrics: ReturnType<typeof selectCostControlMetrics>;
  hnrMetrics: HNRMetrics | null;
  /** Weekly trends analysis */
  weeklyTrends: ReturnType<typeof selectWeeklyTrends>;
  /** Overall operational grade */
  overallGrade: ReturnType<typeof selectOverallGrade>;
  /** Operational alerts */
  alerts: ReturnType<typeof selectOperationalAlerts>;
  /** Critical alerts only */
  criticalAlerts: ReturnType<typeof selectCriticalOperationalAlerts>;
  /** Performance benchmarks */
  benchmarks: ReturnType<typeof selectPerformanceBenchmarks>;
  /** Current loading state */
  isLoading: boolean;
  /** Current error state */
  error: string | null;

  // Current Settings
  /** Current analysis configuration */
  currentConfig: DSPRAnalysisConfig;

  // Actions
  /** Update analysis configuration */
  updateConfig: (config: Partial<DSPRAnalysisConfig>) => void;
  /** Update performance benchmarks */
  updatePerformanceBenchmarks: (benchmarks: Partial<PerformanceBenchmarks>) => void;
  /** Dismiss specific alert */
  dismissAlert: (alertIndex: number) => void;
  /** Clear all alerts */
  clearAllAlerts: () => void;
  /** Manually reprocess data */
  reprocessData: () => void;
  /** Reset DSPR metrics state */
  resetState: () => void;
  /** Clear current error */
  clearError: () => void;

  // Financial Analysis Functions
  /** Get financial performance summary */
  getFinancialSummary: () => FinancialSummary | null;
  /** Calculate profit margins */
  calculateProfitMargins: () => ProfitMargins | null;
  /** Analyze revenue streams */
  analyzeRevenueStreams: () => RevenueAnalysis | null;
  /** Get cost breakdown */
  getCostBreakdown: () => CostBreakdown | null;

  // Operational Analysis Functions
  /** Get operational efficiency score */
  getEfficiencyScore: () => EfficiencyScore | null;
  /** Analyze customer flow */
  analyzeCustomerFlow: () => CustomerFlowAnalysis | null;
  /** Calculate throughput metrics */
  calculateThroughput: () => ThroughputMetrics | null;
  /** Get service quality assessment */
  getServiceQuality: () => ServiceQualityAssessment | null;

  // Sales Channel Analysis Functions
  /** Get channel performance ranking */
  getChannelRanking: () => ChannelRanking[];
  /** Analyze digital adoption */
  analyzeDigitalAdoption: () => DigitalAdoptionAnalysis | null;
  /** Calculate channel efficiency */
  calculateChannelEfficiency: () => ChannelEfficiencyMetrics | null;
  /** Get cross-channel insights */
  getCrossChannelInsights: () => CrossChannelInsights | null;

  // Cost Control Analysis Functions
  /** Get waste analysis */
  getWasteAnalysis: () => WasteAnalysis | null;
  /** Analyze labor efficiency */
  analyzeLaborEfficiency: () => LaborEfficiencyAnalysis | null;
  /** Calculate cost savings opportunities */
  getCostSavingsOpportunities: () => CostSavingsOpportunity[];
  /** Get expense optimization recommendations */
  getExpenseOptimization: () => ExpenseOptimization | null;

  // Trend Analysis Functions
  /** Get performance trends */
  getPerformanceTrends: () => PerformanceTrendAnalysis | null;
  /** Compare with benchmarks */
  compareBenchmarks: () => BenchmarkComparison | null;
  /** Calculate improvement trajectory */
  getImprovementTrajectory: () => ImprovementTrajectory | null;
  /** Predict future performance */
  predictPerformance: () => PerformancePrediction | null;

  // Alert Management Functions
  /** Get alerts by category */
  getAlertsByCategory: (category: AlertCategory) => OperationalAlert[];
  /** Get alert impact analysis */
  getAlertImpactAnalysis: () => AlertImpactAnalysis;
  /** Get recommended actions */
  getRecommendedActions: () => RecommendedAction[];
  /** Calculate alert priority score */
  calculateAlertPriority: (alert: OperationalAlert) => number;

  // Utilities
  /** Check if data is available and valid */
  hasValidData: () => boolean;
  /** Get data completeness score */
  getDataCompleteness: () => DataCompletenessScore;
  /** Export metrics data */
  exportData: (format: DSPRMetricsExportFormat, options?: ExportOptions) => DSPRMetricsExportResult;
  /** Generate performance report */
  generateReport: (type: ReportType) => PerformanceReport;

  // New Format Utilities
  /** Get list of available dates in the new daily map */
  getAvailableDailyDates: () => ApiDate[];
  /** Get a normalized daily entry for a specific date from the map */
  getDailyEntryForDate: (date: ApiDate) => FrontendDailyEntry | null;
  /** Build a metric series across the daily map (optionally includes PrevWeek) */
  buildMetricSeriesFromDailyMap: (metric: keyof DailyDSPRData) => MetricSeriesPoint[];
  /** Get current vs previous week comparison for a specific date */
  getPrevWeekComparisonForDate: (date: ApiDate) => PrevWeekComparison | null;
}

// =============================================================================
// ANALYSIS INTERFACES
// =============================================================================

/**
 * Financial performance summary
 */
export interface FinancialSummary {
  totalRevenue: number;
  revenueGrowth: number;
  profitMargin: number;
  averageTicket: number;
  ticketGrowth: number;
  cashFlow: number;
  digitalRevenue: number;
  digitalPercentage: number;
  performanceGrade: PerformanceGrade;
  keyInsights: string[];
}

/**
 * Profit margin analysis
 */
export interface ProfitMargins {
  gross: number;
  net: number;
  operating: number;
  laborCostImpact: number;
  wasteImpact: number;
  benchmarkComparison: {
    vs_industry: number;
    vs_target: number;
  };
}

/**
 * Revenue stream analysis
 */
export interface RevenueAnalysis {
  byChannel: Record<SalesChannelType, {
    amount: number;
    percentage: number;
    growth: number;
  }>;
  byTimeOfDay: Array<{
    period: string;
    amount: number;
    percentage: number;
  }>;
  diversification: number;
  stability: number;
}

/**
 * Cost breakdown analysis
 */
export interface CostBreakdown {
  labor: { amount: number; percentage: number };
  waste: { amount: number; percentage: number };
  overhead: { amount: number; percentage: number };
  variable: { amount: number; percentage: number };
  fixed: { amount: number; percentage: number };
  total: number;
  efficiency: number;
}

/**
 * Operational efficiency score
 */
export interface EfficiencyScore {
  overall: number;
  components: {
    speed: number;
    accuracy: number;
    consistency: number;
    utilization: number;
  };
  benchmark: number;
  improvement: number;
  grade: string;
}

/**
 * Customer flow analysis
 */
export interface CustomerFlowAnalysis {
  peakHours: number[];
  averageWaitTime: number;
  throughputRate: number;
  capacity: number;
  utilization: number;
  bottlenecks: string[];
  recommendations: string[];
}

/**
 * Throughput metrics
 */
export interface ThroughputMetrics {
  ordersPerHour: number;
  customersPerHour: number;
  salesPerHour: number;
  efficiency: number;
  capacity: number;
  utilization: number;
}

/**
 * Service quality assessment
 */
export interface ServiceQualityAssessment {
  customerSatisfaction: number;
  orderAccuracy: number;
  serviceSpeed: number;
  consistency: number;
  overallScore: number;
  improvements: string[];
}

/**
 * Channel ranking information
 */
export interface ChannelRanking {
  channel: SalesChannelType;
  rank: number;
  score: number;
  revenue: number;
  growth: number;
  efficiency: number;
  strengths: string[];
  opportunities: string[];
}

/**
 * Digital adoption analysis
 */
export interface DigitalAdoptionAnalysis {
  currentRate: number;
  targetRate: number;
  growth: number;
  barriers: string[];
  opportunities: string[];
  roi: number;
  timeline: string;
}

/**
 * Channel efficiency metrics
 */
export interface ChannelEfficiencyMetrics {
  byChannel: Record<SalesChannelType, {
    efficiency: number;
    cost: number;
    revenue: number;
    roi: number;
  }>;
  overall: number;
  bestPerforming: SalesChannelType;
  leastEfficient: SalesChannelType;
}

/**
 * Cross-channel insights
 */
export interface CrossChannelInsights {
  synergies: Array<{
    channels: SalesChannelType[];
    impact: string;
    opportunity: number;
  }>;
  conflicts: Array<{
    channels: SalesChannelType[];
    issue: string;
    resolution: string;
  }>;
  optimization: string[];
}

/**
 * Normalized daily entry for frontend consumption (new format)
 */
export interface FrontendDailyEntry {
  /** Business date */
  date: ApiDate;
  /** Current day metrics (null if status-only) */
  current: DailyDSPRData | null;
  /** Previous week metrics (if available) */
  prevWeek?: DailyDSPRData | null;
  /** Optional status message if entry is not metrics */
  status?: string;
}

/**
 * Metric series point across dates
 */
export interface MetricSeriesPoint {
  /** Business date */
  date: ApiDate;
  /** Current day value for the metric */
  value: number | null;
  /** Previous week value for the metric (if available) */
  prevWeekValue?: number | null;
}

/**
 * Previous week comparison for key fields
 */
export interface PrevWeekComparison {
  /** Business date */
  date: ApiDate;
  /** Current metrics snapshot */
  current: {
    Total_Sales: number;
    labor: number;
    Customer_count: number;
    waste_total: number;
    Digital_Sales_Percent: number;
  } | null;
  /** Previous week metrics snapshot */
  prevWeek: {
    Total_Sales: number;
    labor: number;
    Customer_count: number;
    waste_total: number;
    Digital_Sales_Percent: number;
  } | null;
}

/**
 * Waste analysis
 */
export interface WasteAnalysis {
  totalWaste: number;
  wastePercentage: number;
  wasteByCategory: Record<string, number>;
  trend: TrendDirection;
  causes: string[];
  reductionOpportunities: Array<{
    category: string;
    potential: number;
    effort: string;
  }>;
}

/**
 * Labor efficiency analysis
 */
export interface LaborEfficiencyAnalysis {
  currentEfficiency: number;
  targetEfficiency: number;
  gap: number;
  costPerHour: number;
  productivityScore: number;
  optimizationAreas: string[];
  recommendations: string[];
}

/**
 * Cost savings opportunity
 */
export interface CostSavingsOpportunity {
  category: AlertCategory;
  description: string;
  potential: number;
  effort: 'Low' | 'Medium' | 'High';
  timeline: string;
  impact: 'Low' | 'Medium' | 'High';
  requirements: string[];
}

/**
 * Expense optimization
 */
export interface ExpenseOptimization {
  totalSavings: number;
  byCategory: Record<AlertCategory, number>;
  quickWins: string[];
  longTermInitiatives: string[];
  roi: number;
}

/**
 * Performance trend analysis
 */
export interface PerformanceTrendAnalysis {
  overall: TrendDirection;
  byMetric: Record<string, {
    trend: TrendDirection;
    change: number;
    significance: string;
  }>;
  forecast: Array<{
    period: string;
    prediction: number;
    confidence: number;
  }>;
}

/**
 * Benchmark comparison
 */
export interface BenchmarkComparison {
  vsIndustry: Record<string, {
    current: number;
    benchmark: number;
    gap: number;
    status: 'above' | 'below' | 'at';
  }>;
  vsTargets: Record<string, {
    current: number;
    target: number;
    gap: number;
    onTrack: boolean;
  }>;
  overallScore: number;
}

/**
 * Improvement trajectory
 */
export interface ImprovementTrajectory {
  current: number;
  target: number;
  trajectory: Array<{
    milestone: string;
    timeline: string;
    value: number;
  }>;
  feasibility: 'High' | 'Medium' | 'Low';
  requirements: string[];
}

/**
 * Performance prediction
 */
export interface PerformancePrediction {
  nextPeriod: {
    prediction: number;
    confidence: number;
    factors: string[];
  };
  longTerm: {
    trend: TrendDirection;
    projection: number;
    scenarios: Array<{
      name: string;
      probability: number;
      outcome: number;
    }>;
  };
}

/**
 * Alert impact analysis
 */
export interface AlertImpactAnalysis {
  totalImpact: number;
  byCategory: Record<AlertCategory, number>;
  urgentCount: number;
  averageResolutionTime: number;
  resourceRequirements: string[];
}

/**
 * Recommended action
 */
export interface RecommendedAction {
  title: string;
  description: string;
  category: AlertCategory;
  priority: AlertPriority;
  effort: 'Low' | 'Medium' | 'High';
  impact: 'Low' | 'Medium' | 'High';
  timeline: string;
  requirements: string[];
  expectedOutcome: string;
  successMetrics: string[];
}

/**
 * Data completeness score
 */
export interface DataCompletenessScore {
  overall: number;
  byCategory: Record<string, number>;
  missingFields: string[];
  quality: 'Excellent' | 'Good' | 'Fair' | 'Poor';
  recommendations: string[];
}

/**
 * Export formats
 */
export type DSPRMetricsExportFormat = 'comprehensive' | 'executive' | 'operational' | 'financial' | 'alerts';

/**
 * Export options
 */
export interface ExportOptions {
  includeCharts?: boolean;
  includeRecommendations?: boolean;
  timeRange?: 'daily' | 'weekly' | 'both';
  format?: 'json' | 'csv' | 'excel';
}

/**
 * Export result
 */
export interface DSPRMetricsExportResult {
  format: DSPRMetricsExportFormat;
  data: object | string;
  filename: string;
  metadata: {
    exportDate: string;
    timeRange: string;
    recordCount: number;
  };
}

/**
 * Report types
 */
export type ReportType = 'daily' | 'weekly' | 'performance' | 'executive' | 'operational';

/**
 * Performance report
 */
export interface PerformanceReport {
  type: ReportType;
  summary: string;
  keyMetrics: Record<string, number>;
  insights: string[];
  recommendations: string[];
  charts: Array<{
    title: string;
    type: string;
    data: object;
  }>;
  generatedAt: string;
}

// =============================================================================
// HOOK IMPLEMENTATION
// =============================================================================

/**
 * DSPR Metrics domain hook
 * Provides comprehensive access to DSPR operational metrics and business intelligence
 * 
 * @param options - Configuration options for the hook
 * @returns Object containing data, actions, and analysis functions
 */
export const useDSPRMetrics = (options: UseDSPRMetricsOptions = {}): UseDSPRMetricsReturn => {
  const {
    enableLogging = process.env.NODE_ENV === 'development',
    configOverrides,
    benchmarkOverrides
  } = options;

  const dispatch = useDispatch<AppDispatch>();

  // Get DSPR API state for coordination
  const { isLoading: dsprLoading } = useDsprApi();

  // Selectors
  const dsprMetricsState = useSelector((state: RootState) => selectDSPRMetricsState(state));
  const dailyRawData = useSelector((state: RootState) => selectRawDailyDSPRData(state));
  const weeklyRawData = useSelector((state: RootState) => selectRawWeeklyDSPRData(state));
  const processedData = useSelector((state: RootState) => selectProcessedDSPRData(state));
  const financialMetrics = useSelector((state: RootState) => selectFinancialMetrics(state));
  const operationalMetrics = useSelector((state: RootState) => selectOperationalMetrics(state));
  const salesChannelMetrics = useSelector((state: RootState) => selectSalesChannelMetrics(state));
  const qualityMetrics = useSelector((state: RootState) => selectQualityMetrics(state));
  const costControlMetrics = useSelector((state: RootState) => selectCostControlMetrics(state));
  const hnrMetrics = useSelector((state: RootState) => selectHNRMetrics(state));
  const weeklyTrends = useSelector((state: RootState) => selectWeeklyTrends(state));
  const overallGrade = useSelector((state: RootState) => selectOverallGrade(state));
  const alerts = useSelector((state: RootState) => selectOperationalAlerts(state));
  const criticalAlerts = useSelector((state: RootState) => selectCriticalOperationalAlerts(state));
  const benchmarks = useSelector((state: RootState) => selectPerformanceBenchmarks(state));
  const isLoading = useSelector((state: RootState) => selectDSPRMetricsLoading(state));
  const error = useSelector((state: RootState) => selectDSPRMetricsError(state));

  // Apply configuration overrides and benchmarks
  useMemo(() => {
    if (configOverrides) {
      dispatch(updateDSPRMetricsConfig(configOverrides));
      if (enableLogging) {
        console.log('[useDSPRMetrics] Configuration overrides applied', configOverrides);
      }
    }

    if (benchmarkOverrides) {
      dispatch(updateBenchmarks(benchmarkOverrides));
      if (enableLogging) {
        console.log('[useDSPRMetrics] Benchmark overrides applied', benchmarkOverrides);
      }
    }
  }, [configOverrides, benchmarkOverrides, dispatch, enableLogging]);

  // Actions
  const updateConfig = useCallback((config: Partial<DSPRAnalysisConfig>) => {
    dispatch(updateDSPRMetricsConfig(config));
    if (enableLogging) {
      console.log('[useDSPRMetrics] Configuration updated', config);
    }
  }, [dispatch, enableLogging]);

  const updatePerformanceBenchmarks = useCallback((newBenchmarks: Partial<PerformanceBenchmarks>) => {
    dispatch(updateBenchmarks(newBenchmarks));
    if (enableLogging) {
      console.log('[useDSPRMetrics] Benchmarks updated', newBenchmarks);
    }
  }, [dispatch, enableLogging]);

  const dismissAlert = useCallback((alertIndex: number) => {
    dispatch(dismissOperationalAlert(alertIndex));
    if (enableLogging) {
      console.log('[useDSPRMetrics] Alert dismissed', { alertIndex });
    }
  }, [dispatch, enableLogging]);

  const clearAllAlerts = useCallback(() => {
    dispatch(clearAllOperationalAlerts());
    if (enableLogging) {
      console.log('[useDSPRMetrics] All alerts cleared');
    }
  }, [dispatch, enableLogging]);

  const reprocessData = useCallback(() => {
    dispatch(reprocessDSPRMetricsData());
    if (enableLogging) {
      console.log('[useDSPRMetrics] Data reprocessing triggered');
    }
  }, [dispatch, enableLogging]);

  const resetState = useCallback(() => {
    dispatch(resetDSPRMetricsState());
    if (enableLogging) {
      console.log('[useDSPRMetrics] State reset');
    }
  }, [dispatch, enableLogging]);

  const clearError = useCallback(() => {
    dispatch(clearDSPRMetricsError());
    if (enableLogging) {
      console.log('[useDSPRMetrics] Error cleared');
    }
  }, [dispatch, enableLogging]);

  // Financial Analysis Functions
  const getFinancialSummary = useCallback((): FinancialSummary | null => {
    if (!financialMetrics || !dailyRawData) return null;

    const revenueGrowth = weeklyTrends?.salesTrend.percentageChange || 0;
    const ticketGrowth = 0; // Would need historical data
    const keyInsights = [];

    if (financialMetrics.digitalSales > financialMetrics.totalSales * 0.5) {
      keyInsights.push('Digital sales exceed 50% of total revenue');
    }
    if (financialMetrics.laborCostPercentage > 0.35) {
      keyInsights.push('Labor costs above recommended threshold');
    }

    return {
      totalRevenue: financialMetrics.totalSales,
      revenueGrowth,
      profitMargin: (financialMetrics.totalSales - (financialMetrics.totalSales * financialMetrics.laborCostPercentage)) / financialMetrics.totalSales * 100,
      averageTicket: financialMetrics.averageTicket,
      ticketGrowth,
      cashFlow: financialMetrics.cashSales + financialMetrics.cashVariance,
      digitalRevenue: financialMetrics.digitalSales,
      digitalPercentage: (financialMetrics.digitalSales / financialMetrics.totalSales) * 100,
      performanceGrade: financialMetrics.performanceGrade,
      keyInsights
    };
  }, [financialMetrics, dailyRawData, weeklyTrends]);

  const calculateProfitMargins = useCallback((): ProfitMargins | null => {
    if (!financialMetrics || !costControlMetrics) return null;

    const totalCosts = (financialMetrics.totalSales * financialMetrics.laborCostPercentage) + costControlMetrics.totalWaste;
    const gross = ((financialMetrics.totalSales - totalCosts) / financialMetrics.totalSales) * 100;
    const net = gross - 10; // Assuming 10% overhead
    const operating = net - 5; // Assuming 5% other expenses

    return {
      gross,
      net,
      operating,
      laborCostImpact: financialMetrics.laborCostPercentage * 100,
      wasteImpact: costControlMetrics.wastePercentage * 100,
      benchmarkComparison: {
        vs_industry: net - 15, // Industry average assumed at 15%
        vs_target: net - 20    // Target assumed at 20%
      }
    };
  }, [financialMetrics, costControlMetrics]);

  const analyzeRevenueStreams = useCallback((): RevenueAnalysis | null => {
    if (!salesChannelMetrics || !financialMetrics) return null;

    const byChannel = {
      [SalesChannelType.TRADITIONAL]: {
        amount: salesChannelMetrics.traditional.sales,
        percentage: salesChannelMetrics.traditional.percentage,
        growth: 0 // Would need historical data
      },
      [SalesChannelType.DIGITAL]: {
        amount: salesChannelMetrics.digital.sales,
        percentage: salesChannelMetrics.digital.percentage,
        growth: 0
      },
      [SalesChannelType.DELIVERY]: {
        amount: salesChannelMetrics.delivery.sales,
        percentage: salesChannelMetrics.delivery.percentage,
        growth: 0
      },
      [SalesChannelType.PHONE]: {
        amount: salesChannelMetrics.phone.sales,
        percentage: salesChannelMetrics.phone.percentage,
        growth: 0
      },
      [SalesChannelType.DRIVE_THRU]: {
        amount: 0, // Not directly available
        percentage: 0,
        growth: 0
      }
    };

    // Calculate diversification (how evenly distributed revenue is)
    const percentages = Object.values(byChannel).map(c => c.percentage);
    const diversification = 100 - (Math.max(...percentages) - Math.min(...percentages));

    return {
      byChannel,
      byTimeOfDay: [], // Would need hourly data integration
      diversification,
      stability: 75 // Placeholder - would need historical analysis
    };
  }, [salesChannelMetrics, financialMetrics]);

  const getCostBreakdown = useCallback((): CostBreakdown | null => {
    if (!financialMetrics || !costControlMetrics) return null;

    const laborCost = financialMetrics.totalSales * financialMetrics.laborCostPercentage;
    const wasteCost = costControlMetrics.totalWaste;
    const total = laborCost + wasteCost;
    const overhead = financialMetrics.totalSales * 0.15; // Estimated
    const variable = laborCost + wasteCost;
    const fixed = overhead;

    return {
      labor: { amount: laborCost, percentage: (laborCost / financialMetrics.totalSales) * 100 },
      waste: { amount: wasteCost, percentage: costControlMetrics.wastePercentage * 100 },
      overhead: { amount: overhead, percentage: 15 },
      variable: { amount: variable, percentage: (variable / financialMetrics.totalSales) * 100 },
      fixed: { amount: fixed, percentage: 15 },
      total: total + overhead,
      efficiency: costControlMetrics.laborEfficiency
    };
  }, [financialMetrics, costControlMetrics]);

  // Operational Analysis Functions
  const getEfficiencyScore = useCallback((): EfficiencyScore | null => {
    if (!operationalMetrics) return null;

    const components = {
      speed: operationalMetrics.portalOnTimePercentage * 100,
      accuracy: (1 - operationalMetrics.refundRate) * 100,
      consistency: operationalMetrics.portalUtilization * 100,
      utilization: operationalMetrics.customerCountPercentage * 100
    };

    const overall = Object.values(components).reduce((sum, val) => sum + val, 0) / 4;

    return {
      overall,
      components,
      benchmark: 85, // Industry benchmark
      improvement: overall - 85,
      grade: overall >= 90 ? 'A' : overall >= 80 ? 'B' : overall >= 70 ? 'C' : 'D'
    };
  }, [operationalMetrics]);

  const analyzeCustomerFlow = useCallback((): CustomerFlowAnalysis | null => {
    if (!operationalMetrics || !dailyRawData) return null;

    return {
      peakHours: [12, 18, 19], // Typical lunch and dinner
      averageWaitTime: 5, // Estimated from portal metrics
      throughputRate: operationalMetrics.customerCount / 12, // Assuming 12 hour operation
      capacity: operationalMetrics.customerCount / operationalMetrics.customerCountPercentage,
      utilization: operationalMetrics.customerCountPercentage,
      bottlenecks: operationalMetrics.portalOnTimePercentage < 0.9 ? ['Order preparation timing'] : [],
      recommendations: [
        'Optimize staff scheduling for peak hours',
        'Implement queue management system'
      ]
    };
  }, [operationalMetrics, dailyRawData]);

  const calculateThroughput = useCallback((): ThroughputMetrics | null => {
    if (!operationalMetrics || !financialMetrics) return null;

    const operatingHours = 12; // Assumed
    return {
      ordersPerHour: operationalMetrics.customerCount / operatingHours,
      customersPerHour: operationalMetrics.customerCount / operatingHours,
      salesPerHour: financialMetrics.totalSales / operatingHours,
      efficiency: operationalMetrics.efficiencyScore,
      capacity: operationalMetrics.customerCount / operationalMetrics.customerCountPercentage,
      utilization: operationalMetrics.customerCountPercentage
    };
  }, [operationalMetrics, financialMetrics]);

  const getServiceQuality = useCallback((): ServiceQualityAssessment | null => {
    if (!qualityMetrics) return null;

    const overallScore = (
      qualityMetrics.customerServiceScore * 0.4 +
      qualityMetrics.orderAccuracy * 0.3 +
      qualityMetrics.serviceConsistency * 0.3
    ) * 100;

    const improvements = [];
    if (qualityMetrics.customerServiceScore < 0.9) improvements.push('Enhance customer service training');
    if (qualityMetrics.orderAccuracy < 0.95) improvements.push('Implement order verification process');
    if (qualityMetrics.serviceConsistency < 0.9) improvements.push('Standardize service procedures');

    return {
      customerSatisfaction: qualityMetrics.customerServiceScore * 100,
      orderAccuracy: qualityMetrics.orderAccuracy * 100,
      serviceSpeed: qualityMetrics.serviceConsistency * 100, // Using as proxy
      consistency: qualityMetrics.serviceConsistency * 100,
      overallScore,
      improvements
    };
  }, [qualityMetrics]);

  // Sales Channel Analysis Functions
  const getChannelRanking = useCallback((): ChannelRanking[] => {
    if (!salesChannelMetrics) return [];

    const channels = [
      {
        channel: SalesChannelType.TRADITIONAL,
        metrics: salesChannelMetrics.traditional
      },
      {
        channel: SalesChannelType.DIGITAL,
        metrics: salesChannelMetrics.digital
      },
      {
        channel: SalesChannelType.DELIVERY,
        metrics: salesChannelMetrics.delivery
      },
      {
        channel: SalesChannelType.PHONE,
        metrics: salesChannelMetrics.phone
      }
    ];

    return channels
      .map(({ channel, metrics }) => ({
        channel,
        rank: 0, // Will be set after sorting
        score: metrics.percentage + (metrics.averageOrderValue / 50), // Composite score
        revenue: metrics.sales,
        growth: 0, // Would need historical data
        efficiency: metrics.averageOrderValue,
        strengths: metrics.percentage > 20 ? ['Strong market share'] : [],
        opportunities: metrics.percentage < 10 ? ['Growth potential'] : []
      }))
      .sort((a, b) => b.score - a.score)
      .map((item, index) => ({ ...item, rank: index + 1 }));
  }, [salesChannelMetrics]);

  const analyzeDigitalAdoption = useCallback((): DigitalAdoptionAnalysis | null => {
    if (!salesChannelMetrics) return null;

    const currentRate = salesChannelMetrics.digitalAdoptionRate * 100;
    const targetRate = 70; // Industry target

    return {
      currentRate,
      targetRate,
      growth: weeklyTrends?.digitalTrend.percentageChange || 0,
      barriers: currentRate < 50 ? ['Limited awareness', 'User experience issues'] : [],
      opportunities: ['Mobile app optimization', 'Digital marketing campaigns'],
      roi: 1.5, // Estimated ROI of digital initiatives
      timeline: '3-6 months'
    };
  }, [salesChannelMetrics, weeklyTrends]);

  const calculateChannelEfficiency = useCallback((): ChannelEfficiencyMetrics | null => {
    if (!salesChannelMetrics) return null;

    const channels = {
      [SalesChannelType.TRADITIONAL]: salesChannelMetrics.traditional,
      [SalesChannelType.DIGITAL]: salesChannelMetrics.digital,
      [SalesChannelType.DELIVERY]: salesChannelMetrics.delivery,
      [SalesChannelType.PHONE]: salesChannelMetrics.phone,
      [SalesChannelType.DRIVE_THRU]: { sales: 0, percentage: 0, orders: 0, averageOrderValue: 0, trend: TrendDirection.STABLE, performanceLevel: 'average' as const }
    };

    const byChannel = Object.entries(channels).reduce((acc, [channel, metrics]) => {
      acc[channel as SalesChannelType] = {
        efficiency: metrics.averageOrderValue / 20, // Normalized efficiency score
        cost: metrics.sales * 0.05, // Estimated processing cost
        revenue: metrics.sales,
        roi: metrics.sales / (metrics.sales * 0.05)
      };
      return acc;
    }, {} as Record<SalesChannelType, any>);

    const efficiencies = Object.values(byChannel).map(c => c.efficiency);
    const overall = efficiencies.reduce((sum, eff) => sum + eff, 0) / efficiencies.length;
    
    const sortedChannels = Object.entries(byChannel).sort(([,a], [,b]) => b.efficiency - a.efficiency);
    const bestPerforming = sortedChannels[0][0] as SalesChannelType;
    const leastEfficient = sortedChannels[sortedChannels.length - 1][0] as SalesChannelType;

    return {
      byChannel,
      overall,
      bestPerforming,
      leastEfficient
    };
  }, [salesChannelMetrics]);

  const getCrossChannelInsights = useCallback((): CrossChannelInsights | null => {
    if (!salesChannelMetrics) return null;

    return {
      synergies: [
        {
          channels: [SalesChannelType.DIGITAL, SalesChannelType.DELIVERY],
          impact: 'Digital ordering enhances delivery efficiency',
          opportunity: 15
        }
      ],
      conflicts: [
        {
          channels: [SalesChannelType.TRADITIONAL, SalesChannelType.DIGITAL],
          issue: 'Resource allocation between channels',
          resolution: 'Implement unified order management'
        }
      ],
      optimization: [
        'Integrate channel data for unified customer experience',
        'Optimize staff allocation based on channel demand'
      ]
    };
  }, [salesChannelMetrics]);

  // Utility and Export Functions
  const hasValidData = useCallback((): boolean => {
    return !!(processedData && financialMetrics && operationalMetrics);
  }, [processedData, financialMetrics, operationalMetrics]);

  const getDataCompleteness = useCallback((): DataCompletenessScore => {
    const categories = {
      financial: financialMetrics ? 100 : 0,
      operational: operationalMetrics ? 100 : 0,
      quality: qualityMetrics ? 100 : 0,
      costControl: costControlMetrics ? 100 : 0,
      salesChannel: salesChannelMetrics ? 100 : 0
    };

    const overall = Object.values(categories).reduce((sum, score) => sum + score, 0) / Object.keys(categories).length;
    const missingFields = Object.entries(categories).filter(([, score]) => score === 0).map(([key]) => key);

    let quality: DataCompletenessScore['quality'] = 'Poor';
    if (overall >= 90) quality = 'Excellent';
    else if (overall >= 75) quality = 'Good';
    else if (overall >= 60) quality = 'Fair';

    return {
      overall,
      byCategory: categories,
      missingFields,
      quality,
      recommendations: missingFields.map(field => `Ensure ${field} data is properly captured`)
    };
  }, [financialMetrics, operationalMetrics, qualityMetrics, costControlMetrics, salesChannelMetrics]);

  const exportData = useCallback((
    format: DSPRMetricsExportFormat, 
    options: ExportOptions = {}
  ): DSPRMetricsExportResult => {
    if (!processedData) {
      throw new Error('No data available for export');
    }

    const exportDate = new Date().toISOString();
    const timeRange = options.timeRange || 'daily';
    
    let data: object | string;
    let filename: string;

    switch (format) {
      case 'comprehensive':
        data = {
          summary: processedData,
          financial: financialMetrics,
          operational: operationalMetrics,
          salesChannels: salesChannelMetrics,
          quality: qualityMetrics,
          costControl: costControlMetrics,
          trends: weeklyTrends,
          alerts
        };
        filename = `dspr-comprehensive-${exportDate.split('T')[0]}.json`;
        break;

      case 'executive':
        data = {
          overallGrade,
          keySummary: getFinancialSummary(),
          alerts: criticalAlerts,
          recommendations: getRecommendedActions().slice(0, 5)
        };
        filename = `dspr-executive-${exportDate.split('T')[0]}.json`;
        break;

      case 'operational':
        data = {
          efficiency: getEfficiencyScore(),
          throughput: calculateThroughput(),
          customerFlow: analyzeCustomerFlow(),
          serviceQuality: getServiceQuality()
        };
        filename = `dspr-operational-${exportDate.split('T')[0]}.json`;
        break;

      case 'financial':
        data = {
          summary: getFinancialSummary(),
          margins: calculateProfitMargins(),
          revenueAnalysis: analyzeRevenueStreams(),
          costBreakdown: getCostBreakdown()
        };
        filename = `dspr-financial-${exportDate.split('T')[0]}.json`;
        break;

      case 'alerts':
        data = {
          alerts,
          criticalAlerts,
          impact: getAlertImpactAnalysis(),
          recommendations: getRecommendedActions()
        };
        filename = `dspr-alerts-${exportDate.split('T')[0]}.json`;
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
        timeRange,
        recordCount: Array.isArray(data) ? data.length : 1
      }
    };
  }, [processedData, financialMetrics, operationalMetrics, salesChannelMetrics, qualityMetrics, costControlMetrics, weeklyTrends, alerts, criticalAlerts, overallGrade]);

  /**
   * Get list of available dates in the new daily map
   * @returns Array of valid business dates present in `dailyByDate`
   */
  const getAvailableDailyDates = useCallback((): ApiDate[] => {
    const map = (dsprMetricsState as unknown as { dailyByDate?: DailyDSPRByDate }).dailyByDate;
    if (!map) return [];
    const dates = Object.keys(map).filter((d) => typeof map[d as ApiDate] !== 'string') as ApiDate[];
    return dates;
  }, [dsprMetricsState]);

  /**
   * Get a normalized daily entry for a specific date from the map
   * @param date - Business date to retrieve
   * @returns Frontend-friendly entry with current and optional PrevWeek
   */
  const getDailyEntryForDate = useCallback((date: ApiDate): FrontendDailyEntry | null => {
    const map = (dsprMetricsState as unknown as { dailyByDate?: DailyDSPRByDate }).dailyByDate;
    if (!map) return null;
    const raw = map[date];
    if (!raw) return null;
    if (typeof raw === 'string') {
      return { date, current: null, prevWeek: null, status: raw };
    }
    const entry = raw as DailyDSPRDayWithPrevWeek;
    return {
      date,
      current: entry,
      prevWeek: entry.PrevWeek ?? null
    };
  }, [dsprMetricsState]);

  /**
   * Build a metric series across the daily map (optionally includes PrevWeek)
   * @param metric - Key of `DailyDSPRData` to extract across dates
   * @returns Array of metric points `{ date, value, prevWeekValue }`
   */
  const buildMetricSeriesFromDailyMap = useCallback((metric: keyof DailyDSPRData): MetricSeriesPoint[] => {
    const map = (dsprMetricsState as unknown as { dailyByDate?: DailyDSPRByDate }).dailyByDate;
    if (!map) return [];
    const dates = Object.keys(map) as ApiDate[];
    const result = dates.map((date) => {
      const raw = map[date];
      if (!raw || typeof raw === 'string') {
        return { date, value: null };
      }
      const entry = raw as DailyDSPRDayWithPrevWeek;
      const currentVal = (entry[metric] as unknown as number) ?? null;
      const prevVal = entry.PrevWeek ? ((entry.PrevWeek[metric] as unknown as number) ?? null) : undefined;
      return { date, value: currentVal, prevWeekValue: prevVal };
    });
    return result;
  }, [dsprMetricsState]);

  /**
   * Get current vs previous week comparison for a specific date
   * @param date - Business date to compare
   * @returns Snapshot comparison or null if unavailable
   */
  const getPrevWeekComparisonForDate = useCallback((date: ApiDate): PrevWeekComparison | null => {
    const normalized = getDailyEntryForDate(date);
    if (!normalized || (!normalized.current && !normalized.prevWeek)) return null;

    const snapshot = (src: DailyDSPRData | null) => (src ? {
      Total_Sales: src.Total_Sales,
      labor: src.labor,
      Customer_count: src.Customer_count,
      waste_total: (src.waste_gateway || 0) + (src.Waste_Alta || 0),
      Digital_Sales_Percent: src.Digital_Sales_Percent
    } : null);

    return {
      date,
      current: snapshot(normalized.current),
      prevWeek: snapshot(normalized.prevWeek ?? null)
    };
  }, [getDailyEntryForDate]);

  // Additional implementation stubs for remaining functions
  const getWasteAnalysis = useCallback((): WasteAnalysis | null => {
    if (!costControlMetrics || !dailyRawData) return null;
    
    return {
      totalWaste: costControlMetrics.totalWaste,
      wastePercentage: costControlMetrics.wastePercentage * 100,
      wasteByCategory: {
        'Food Waste': costControlMetrics.totalWaste * 0.7,
        'Packaging': costControlMetrics.totalWaste * 0.2,
        'Other': costControlMetrics.totalWaste * 0.1
      },
      trend: weeklyTrends?.wasteTrend.direction || TrendDirection.STABLE,
      causes: ['Overproduction', 'Quality issues', 'Portion inconsistency'],
      reductionOpportunities: [
        { category: 'Food Waste', potential: 30, effort: 'Medium' },
        { category: 'Packaging', potential: 15, effort: 'Low' }
      ]
    };
  }, [costControlMetrics, dailyRawData, weeklyTrends]);

  const analyzeLaborEfficiency = useCallback((): LaborEfficiencyAnalysis | null => {
    if (!costControlMetrics || !financialMetrics) return null;

    return {
      currentEfficiency: costControlMetrics.laborEfficiency,
      targetEfficiency: 85,
      gap: 85 - costControlMetrics.laborEfficiency,
      costPerHour: (financialMetrics.totalSales * financialMetrics.laborCostPercentage) / 8, // Assuming 8-hour shift
      productivityScore: costControlMetrics.laborEfficiency,
      optimizationAreas: ['Schedule optimization', 'Cross-training', 'Process automation'],
      recommendations: ['Implement flexible scheduling', 'Provide efficiency training']
    };
  }, [costControlMetrics, financialMetrics]);

  const getCostSavingsOpportunities = useCallback((): CostSavingsOpportunity[] => {
    const opportunities: CostSavingsOpportunity[] = [];

    if (costControlMetrics?.laborEfficiency && costControlMetrics.laborEfficiency < 80) {
      opportunities.push({
        category: AlertCategory.COST_CONTROL,
        description: 'Optimize labor scheduling and efficiency',
        potential: financialMetrics ? financialMetrics.totalSales * 0.05 : 0,
        effort: 'Medium',
        timeline: '2-3 months',
        impact: 'High',
        requirements: ['Schedule analysis', 'Staff training']
      });
    }

    if (costControlMetrics?.wastePercentage && costControlMetrics.wastePercentage > 0.03) {
      opportunities.push({
        category: AlertCategory.COST_CONTROL,
        description: 'Reduce food waste through better inventory management',
        potential: costControlMetrics.totalWaste * 0.3,
        effort: 'Low',
        timeline: '1 month',
        impact: 'Medium',
        requirements: ['Inventory tracking system', 'Staff training']
      });
    }

    return opportunities;
  }, [costControlMetrics, financialMetrics]);

  const getExpenseOptimization = useCallback((): ExpenseOptimization | null => {
    const opportunities = getCostSavingsOpportunities();
    const totalSavings = opportunities.reduce((sum, opp) => sum + opp.potential, 0);

    return {
      totalSavings,
      byCategory: opportunities.reduce((acc, opp) => {
        acc[opp.category] = (acc[opp.category] || 0) + opp.potential;
        return acc;
      }, {} as Record<AlertCategory, number>),
      quickWins: opportunities.filter(opp => opp.effort === 'Low').map(opp => opp.description),
      longTermInitiatives: opportunities.filter(opp => opp.effort === 'High').map(opp => opp.description),
      roi: totalSavings > 0 ? (totalSavings / (financialMetrics?.totalSales || 1)) * 100 : 0
    };
  }, [getCostSavingsOpportunities, financialMetrics]);

  const getPerformanceTrends = useCallback((): PerformanceTrendAnalysis | null => {
    if (!weeklyTrends) return null;

    const byMetric = {
      sales: {
        trend: weeklyTrends.salesTrend.direction,
        change: weeklyTrends.salesTrend.percentageChange,
        significance: weeklyTrends.salesTrend.significance
      },
      labor: {
        trend: weeklyTrends.laborTrend.direction,
        change: weeklyTrends.laborTrend.percentageChange,
        significance: weeklyTrends.laborTrend.significance
      },
      customers: {
        trend: weeklyTrends.customerTrend.direction,
        change: weeklyTrends.customerTrend.percentageChange,
        significance: weeklyTrends.customerTrend.significance
      }
    };

    return {
      overall: weeklyTrends.salesTrend.direction,
      byMetric,
      forecast: [
        { period: 'Next Week', prediction: financialMetrics?.totalSales || 0, confidence: 75 },
        { period: 'Next Month', prediction: (financialMetrics?.totalSales || 0) * 1.05, confidence: 60 }
      ]
    };
  }, [weeklyTrends, financialMetrics]);

  const compareBenchmarks = useCallback((): BenchmarkComparison | null => {
    if (!benchmarks || !financialMetrics || !operationalMetrics) return null;

    const vsIndustry = {
      'Labor Cost': {
        current: financialMetrics.laborCostPercentage * 100,
        benchmark: benchmarks.industry.laborCost * 100,
        gap: (financialMetrics.laborCostPercentage - benchmarks.industry.laborCost) * 100,
        status: financialMetrics.laborCostPercentage <= benchmarks.industry.laborCost ? 'at' as const : 'above' as const
      },
      'Customer Service': {
        current: (qualityMetrics?.customerServiceScore || 0) * 100,
        benchmark: benchmarks.industry.customerService * 100,
        gap: ((qualityMetrics?.customerServiceScore || 0) - benchmarks.industry.customerService) * 100,
        status: (qualityMetrics?.customerServiceScore || 0) >= benchmarks.industry.customerService ? 'above' as const : 'below' as const
      }
    };

    const vsTargets = {
      'Labor Cost': {
        current: financialMetrics.laborCostPercentage * 100,
        target: benchmarks.targets.laborCost * 100,
        gap: (financialMetrics.laborCostPercentage - benchmarks.targets.laborCost) * 100,
        onTrack: financialMetrics.laborCostPercentage <= benchmarks.targets.laborCost
      }
    };

    const overallScore = Object.values(vsIndustry).reduce((sum, metric) => {
      return sum + (metric.status === 'above' ? 100 : metric.status === 'at' ? 90 : 70);
    }, 0) / Object.keys(vsIndustry).length;

    return {
      vsIndustry,
      vsTargets,
      overallScore
    };
  }, [benchmarks, financialMetrics, operationalMetrics, qualityMetrics]);

  const getImprovementTrajectory = useCallback((): ImprovementTrajectory | null => {
    if (!overallGrade || !financialMetrics) return null;

    const current = financialMetrics.totalSales;
    const target = current * 1.15; // 15% improvement target

    return {
      current,
      target,
      trajectory: [
        { milestone: '30 days', timeline: '1 month', value: current * 1.03 },
        { milestone: '90 days', timeline: '3 months', value: current * 1.08 },
        { milestone: '180 days', timeline: '6 months', value: target }
      ],
      feasibility: 'Medium',
      requirements: ['Staff training', 'Process optimization', 'Technology upgrades']
    };
  }, [overallGrade, financialMetrics]);

  const predictPerformance = useCallback((): PerformancePrediction | null => {
    if (!weeklyTrends || !financialMetrics) return null;

    const trendMultiplier = weeklyTrends.salesTrend.direction === TrendDirection.UP ? 1.05 : 
                          weeklyTrends.salesTrend.direction === TrendDirection.DOWN ? 0.95 : 1.0;

    return {
      nextPeriod: {
        prediction: financialMetrics.totalSales * trendMultiplier,
        confidence: 75,
        factors: ['Current trend direction', 'Seasonal patterns', 'Operational changes']
      },
      longTerm: {
        trend: weeklyTrends.salesTrend.direction,
        projection: financialMetrics.totalSales * Math.pow(trendMultiplier, 12), // 12 periods
        scenarios: [
          { name: 'Optimistic', probability: 25, outcome: financialMetrics.totalSales * 1.2 },
          { name: 'Expected', probability: 50, outcome: financialMetrics.totalSales * 1.1 },
          { name: 'Conservative', probability: 25, outcome: financialMetrics.totalSales * 1.05 }
        ]
      }
    };
  }, [weeklyTrends, financialMetrics]);

  const getAlertsByCategory = useCallback((category: AlertCategory): OperationalAlert[] => {
    return alerts.filter(alert => alert.category === category);
  }, [alerts]);

  const getAlertImpactAnalysis = useCallback((): AlertImpactAnalysis => {
    const byCategory = alerts.reduce((acc, alert) => {
      acc[alert.category] = (acc[alert.category] || 0) + Math.abs(alert.variance);
      return acc;
    }, {} as Record<AlertCategory, number>);

    const totalImpact = Object.values(byCategory).reduce((sum, impact) => sum + impact, 0);
    const urgentCount = alerts.filter(alert => alert.priority === AlertPriority.URGENT).length;

    return {
      totalImpact,
      byCategory,
      urgentCount,
      averageResolutionTime: 24, // hours - estimated
      resourceRequirements: ['Management attention', 'Staff time', 'Process changes']
    };
  }, [alerts]);

  const getRecommendedActions = useCallback((): RecommendedAction[] => {
    const actions: RecommendedAction[] = [];

    // Generate actions based on critical alerts
    criticalAlerts.forEach(alert => {
      actions.push({
        title: `Address ${alert.title}`,
        description: alert.message,
        category: alert.category,
        priority: alert.priority,
        effort: 'Medium',
        impact: alert.impact === 'severe' ? 'High' : 'Medium',
        timeline: '1-2 weeks',
        requirements: alert.recommendations.slice(0, 2),
        expectedOutcome: `Improve ${alert.metric} performance`,
        successMetrics: [`${alert.metric} within target range`]
      });
    });

    // Add general optimization recommendations
    if (costControlMetrics?.laborEfficiency && costControlMetrics.laborEfficiency < 80) {
      actions.push({
        title: 'Optimize Labor Efficiency',
        description: 'Implement scheduling optimization and staff training programs',
        category: AlertCategory.COST_CONTROL,
        priority: AlertPriority.MEDIUM,
        effort: 'Medium',
        impact: 'High',
        timeline: '4-6 weeks',
        requirements: ['Schedule analysis', 'Training materials', 'Performance tracking'],
        expectedOutcome: 'Improved labor productivity and reduced costs',
        successMetrics: ['Labor efficiency > 85%', 'Cost reduction of 5-8%']
      });
    }

    return actions.slice(0, 10); // Limit to top 10 recommendations
  }, [criticalAlerts, costControlMetrics]);

  const calculateAlertPriority = useCallback((alert: OperationalAlert): number => {
    let score = 0;
    
    // Base score by severity
    switch (alert.severity) {
      case AlertSeverity.CRITICAL: score += 40; break;
      case AlertSeverity.ERROR: score += 30; break;
      case AlertSeverity.WARNING: score += 20; break;
      case AlertSeverity.INFO: score += 10; break;
    }
    
    // Add variance impact
    score += Math.min(Math.abs(alert.variance), 30);
    
    // Add category weight
    if (alert.category === AlertCategory.FINANCIAL) score += 15;
    else if (alert.category === AlertCategory.OPERATIONAL) score += 10;
    
    return Math.min(score, 100);
  }, []);

  const generateReport = useCallback((type: ReportType): PerformanceReport => {
    const generatedAt = new Date().toISOString();
    
    switch (type) {
      case 'executive':
        return {
          type,
          summary: `Overall performance grade: ${overallGrade}. ${criticalAlerts.length} critical issues require attention.`,
          keyMetrics: {
            'Total Sales': financialMetrics?.totalSales || 0,
            'Labor Cost %': (financialMetrics?.laborCostPercentage || 0) * 100,
            'Customer Service': (qualityMetrics?.customerServiceScore || 0) * 100,
            'Digital Sales %': salesChannelMetrics?.digitalAdoptionRate ? salesChannelMetrics.digitalAdoptionRate * 100 : 0
          },
          insights: [
            `Digital adoption at ${salesChannelMetrics?.digitalAdoptionRate ? (salesChannelMetrics.digitalAdoptionRate * 100).toFixed(1) : 0}%`,
            `${criticalAlerts.length} critical operational issues identified`
          ],
          recommendations: getRecommendedActions().slice(0, 3).map(action => action.title),
          charts: [],
          generatedAt
        };
        
      case 'operational':
        return {
          type,
          summary: `Operational efficiency at ${getEfficiencyScore()?.overall.toFixed(1) || 0}%. Key areas for improvement identified.`,
          keyMetrics: {
            'Efficiency Score': getEfficiencyScore()?.overall || 0,
            'Customer Count': operationalMetrics?.customerCount || 0,
            'Portal Utilization': (operationalMetrics?.portalUtilization || 0) * 100,
            'On-time Performance': (operationalMetrics?.portalOnTimePercentage || 0) * 100
          },
          insights: [
            `Portal utilization at ${((operationalMetrics?.portalUtilization || 0) * 100).toFixed(1)}%`,
            `Customer count performance at ${((operationalMetrics?.customerCountPercentage || 0) * 100).toFixed(1)}%`
          ],
          recommendations: [
            'Optimize staff scheduling for peak hours',
            'Improve order preparation timing',
            'Enhance portal system efficiency'
          ],
          charts: [],
          generatedAt
        };
        
      default:
        return {
          type,
          summary: 'Performance report generated successfully.',
          keyMetrics: {},
          insights: [],
          recommendations: [],
          charts: [],
          generatedAt
        };
    }
  }, [overallGrade, criticalAlerts, financialMetrics, qualityMetrics, salesChannelMetrics, operationalMetrics, getEfficiencyScore, getRecommendedActions]);

  return {
    // Data and State
    dailyRawData,
    weeklyRawData,
    processedData,
    financialMetrics,
    operationalMetrics,
    salesChannelMetrics,
    qualityMetrics,
    costControlMetrics,
    weeklyTrends,
    overallGrade,
    alerts,
    criticalAlerts,
    benchmarks,
    hnrMetrics,
    isLoading: isLoading || dsprLoading,
    error,

    // Current Settings
    currentConfig: dsprMetricsState.config,

    // Actions
    updateConfig,
    updatePerformanceBenchmarks,
    dismissAlert,
    clearAllAlerts,
    reprocessData,
    resetState,
    clearError,

    // Financial Analysis Functions
    getFinancialSummary,
    calculateProfitMargins,
    analyzeRevenueStreams,
    getCostBreakdown,

    // Operational Analysis Functions
    getEfficiencyScore,
    analyzeCustomerFlow,
    calculateThroughput,
    getServiceQuality,

    // Sales Channel Analysis Functions
    getChannelRanking,
    analyzeDigitalAdoption,
    calculateChannelEfficiency,
    getCrossChannelInsights,

    // Cost Control Analysis Functions
    getWasteAnalysis,
    analyzeLaborEfficiency,
    getCostSavingsOpportunities,
    getExpenseOptimization,

    // Trend Analysis Functions
    getPerformanceTrends,
    compareBenchmarks,
    getImprovementTrajectory,
    predictPerformance,

    // Alert Management Functions
    getAlertsByCategory,
    getAlertImpactAnalysis,
    getRecommendedActions,
    calculateAlertPriority,

    // Utilities
    hasValidData,
    getDataCompleteness,
    exportData,
    generateReport,

    // New Format Utilities
    getAvailableDailyDates,
    getDailyEntryForDate,
    buildMetricSeriesFromDailyMap,
    getPrevWeekComparisonForDate
  };
};

// =============================================================================
// CONVENIENCE HOOKS
// =============================================================================

/**
 * Simplified hook for basic DSPR metrics
 */
export const useSimpleDSPRMetrics = () => {
  const {
    overallGrade,
    financialMetrics,
    criticalAlerts,
    isLoading,
    error,
    hasValidData
  } = useDSPRMetrics();

  return {
    grade: overallGrade,
    totalSales: financialMetrics?.totalSales || 0,
    laborCost: financialMetrics ? financialMetrics.laborCostPercentage * 100 : 0,
    criticalIssues: criticalAlerts.length,
    isLoading,
    error,
    hasData: hasValidData()
  };
};

/**
 * Hook for financial analysis focus
 */
export const useFinancialAnalysis = () => {
  const {
    getFinancialSummary,
    calculateProfitMargins,
    analyzeRevenueStreams,
    getCostBreakdown
  } = useDSPRMetrics();

  return {
    summary: getFinancialSummary(),
    margins: calculateProfitMargins(),
    revenue: analyzeRevenueStreams(),
    costs: getCostBreakdown()
  };
};

/**
 * Hook for operational excellence focus
 */
export const useOperationalExcellence = () => {
  const {
    getEfficiencyScore,
    analyzeCustomerFlow,
    getServiceQuality,
    getRecommendedActions
  } = useDSPRMetrics();

  return {
    efficiency: getEfficiencyScore(),
    customerFlow: analyzeCustomerFlow(),
    serviceQuality: getServiceQuality(),
    recommendations: getRecommendedActions().filter(action => 
      action.category === AlertCategory.OPERATIONAL
    )
  };
};

// =============================================================================
// HOOK EXPORTS
// =============================================================================

export default useDSPRMetrics;
