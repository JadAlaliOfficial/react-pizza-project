/**
 * DSPR (Daily Store Performance Report) Domain Types
 * TypeScript interfaces for DSPR operational metrics and performance data
 * 
 * This domain handles:
 * - Labor efficiency and cost metrics
 * - Waste tracking and management
 * - Sales performance across channels
 * - Operational KPIs and customer service metrics
 * - Both daily and weekly aggregated data
 */

import type { StoreId, ApiDate } from './common';

// =============================================================================
// CORE DSPR TYPES
// =============================================================================

/**
 * Daily DSPR operational data
 * Core performance metrics for daily store operations
 */
export interface DailyDSPRData {
  /** Labor cost as percentage of sales */
  labor: number;
  /** Waste amount tracked through gateway system */
  waste_gateway: number;
  /** Over/short cash variance (negative = short, positive = over) */
  over_short: number;
  /** Number of refunded orders */
  Refunded_order_Qty: number;
  /** Total cash sales amount */
  Total_Cash_Sales: number;
  /** Total sales across all channels */
  Total_Sales: number;
  /** Waste amount tracked through Alta system */
  Waste_Alta: number;
  /** Number of modified orders */
  Modified_Order_Qty: number;
  /** Total tips collected */
  Total_TIPS: number;
  /** Total customer count for the day */
  Customer_count: number;
  /** DoorDash sales amount */
  DoorDash_Sales: number;
  /** UberEats sales amount */
  UberEats_Sales: number;
  /** GrubHub sales amount */
  GrubHub_Sales: number;
  /** Phone order sales */
  Phone: number;
  /** Call center agent sales */
  Call_Center_Agent: number;
  /** Website sales */
  Website: number;
  /** Mobile app sales */
  Mobile: number;
  /** Digital sales as percentage of total sales */
  Digital_Sales_Percent: number;
  /** Total portal eligible transactions */
  Total_Portal_Eligible_Transactions: number;
  /** Percentage of orders put into portal system */
  Put_into_Portal_Percent: number;
  /** Percentage of portal orders completed on time */
  In_Portal_on_Time_Percent: number;
  /** Drive-thru sales amount */
  Drive_Thru_Sales: number;
  /** Upselling metrics (nullable) */
  Upselling: number | null;
  /** Cash sales vs deposit difference */
  Cash_Sales_Vs_Deposite_Difference: number;
  /** Average ticket value */
  Avrage_ticket: number;

  /** HNR: total HNR transactions */
  HNR_Transactions: number;
  /** HNR: transactions with CC */
  HNR_Transactions_with_CC: number;
  /** HNR: promise broken percentage */
  HNR_Promise_Broken_Percent: number;
  /** HNR: promise met percentage */
  HNR_Promise_Met_Percent: number;
  /** HNR: promise met transactions */
  HNR_Promise_Met_Transactions: number;

  /** Customer count as percentage of target */
  Customer_count_percent: number;
  /** Customer service score */
  Customer_Service: number;
}

export interface HNRMetrics {
  totalTransactions: number;
  promiseMetTransactions: number;
  promiseMetPercent: number;
}

/**
 * Weekly DSPR aggregated data
 * Weekly summary of operational performance metrics
 */
export interface WeeklyDSPRData {
  /** Weekly labor cost percentage */
  labor: number;
  /** Weekly waste gateway total */
  waste_gateway: number;
  /** Weekly over/short total */
  over_short: number;
  /** Weekly refunded orders total */
  Refunded_order_Qty: number;
  /** Weekly cash sales total */
  Total_Cash_Sales: number;
  /** Weekly total sales */
  Total_Sales: number;
  /** Weekly Alta waste total */
  Waste_Alta: number;
  /** Weekly modified orders total */
  Modified_Order_Qty: number;
  /** Weekly tips total */
  Total_TIPS: number;
  /** Weekly customer count */
  Customer_count: number;
  /** Weekly DoorDash sales */
  DoorDash_Sales: number;
  /** Weekly UberEats sales */
  UberEats_Sales: number;
  /** Weekly GrubHub sales */
  GrubHub_Sales: number;
  /** Weekly phone sales */
  Phone: number;
  /** Weekly call center sales */
  Call_Center_Agent: number;
  /** Weekly website sales */
  Website: number;
  /** Weekly mobile sales */
  Mobile: number;
  /** Weekly digital sales percentage */
  Digital_Sales_Percent: number;
  /** Weekly portal eligible transactions */
  Total_Portal_Eligible_Transactions: number;
  /** Weekly portal utilization percentage */
  Put_into_Portal_Percent: number;
  /** Weekly portal on-time percentage */
  In_Portal_on_Time_Percent: number;
  /** Weekly drive-thru sales */
  Drive_Thru_Sales: number;
  /** Weekly upselling metrics */
  Upselling: number | null;
  /** Weekly cash variance */
  Cash_Sales_Vs_Deposite_Difference: number;
  /** Weekly average ticket */
  Avrage_ticket: number;
  /** Weekly customer count percentage */
  Customer_count_percent: number;
  /** Weekly customer service average */
  Customer_Service: number;
}

/**
 * Previous week weekly DSPR data (same shape as WeeklyDSPRData)
 * Mirrors the API "PrevWeekDSPRData" block
 */
export type PrevWeekDSPRData = WeeklyDSPRData;

/**
 * Raw weekly DSPR report payload from the API
 * - DSPRData: current week aggregate
 * - PrevWeekDSPRData: previous week aggregate (same shape)
 * - DailyDSPRByDate: per-day metrics with optional PrevWeek comparisons
 */
export interface WeeklyDSPRReport {
  /** Current week aggregated metrics */
  DSPRData: WeeklyDSPRData;

  /** Previous week aggregated metrics for comparison */
  PrevWeekDSPRData?: PrevWeekDSPRData;

  /** Map of business date -> DSPR metrics (+ optional PrevWeek) */
  DailyDSPRByDate: DailyDSPRByDate;
}

/**
 * Daily DSPR data with optional previous week comparison
 * Used in the Weekly DailyDSPRByDate map:
 * - Key: date string (YYYY-MM-DD)
 * - Value: current day metrics plus optional PrevWeek
 */
export interface DailyDSPRDayWithPrevWeek extends DailyDSPRData {
  /** Previous week's metrics for the same weekday, if available */
  PrevWeek?: DailyDSPRData;
}

/**
 * Entry type for a single date in DailyDSPRByDate:
 * - Either a full metrics object (with optional PrevWeek)
 * - Or a status string like "No Final Summary data available."
 */
export type DailyDSPRByDateEntry =
  | DailyDSPRDayWithPrevWeek
  | 'No Final Summary data available.';

/**
 * Map of business date -> DSPR metrics (+ optional PrevWeek comparison)
 */
export type DailyDSPRByDate = Record<ApiDate, DailyDSPRByDateEntry>;

// =============================================================================
// PROCESSED DATA TYPES
// =============================================================================

/**
 * Processed DSPR data with calculated insights
 * Enhanced operational metrics with business intelligence
 */
export interface ProcessedDSPRData {
  /** Store identifier */
  storeId: StoreId;
  /** Business date */
  date: ApiDate;
  /** Processed daily metrics */
  daily: ProcessedDailyMetrics;
  /** Processed weekly metrics (if available) */
  weekly?: ProcessedWeeklyMetrics;
  /** Performance alerts and recommendations */
  alerts: OperationalAlert[];
  /** Overall operational grade */
  overallGrade: OperationalGrade;
}

/**
 * Processed daily operational metrics
 */
export interface ProcessedDailyMetrics {
  /** Financial performance metrics */
  financial: FinancialMetrics;
  /** Operational efficiency metrics */
  operational: OperationalMetrics;
  /** Sales channel performance */
  salesChannels: SalesChannelMetrics;
  /** Quality and service metrics */
  quality: QualityMetrics;
  /** Waste and cost control */
  costControl: CostControlMetrics;
}

/**
 * Processed weekly operational metrics
 */
export interface ProcessedWeeklyMetrics {
  /** Weekly financial summary */
  financial: FinancialMetrics;
  /** Weekly operational summary */
  operational: OperationalMetrics;
  /** Weekly sales channel summary */
  salesChannels: SalesChannelMetrics;
  /** Weekly quality summary */
  quality: QualityMetrics;
  /** Weekly cost control summary */
  costControl: CostControlMetrics;
  /** Week-over-week trends */
  trends: WeeklyTrends;
}

/**
 * Financial performance metrics
 */
export interface FinancialMetrics {
  /** Total sales amount */
  totalSales: number;
  /** Cash sales amount */
  cashSales: number;
  /** Digital sales amount */
  digitalSales: number;
  /** Average transaction value */
  averageTicket: number;
  /** Tips collected */
  tips: number;
  /** Cash variance (over/short) */
  cashVariance: number;
  /** Labor cost percentage */
  laborCostPercentage: number;
  /** Revenue per customer */
  revenuePerCustomer: number;
  /** Financial performance grade */
  performanceGrade: PerformanceGrade;
}

/**
 * Operational efficiency metrics
 */
export interface OperationalMetrics {
  /** Total customer count */
  customerCount: number;
  /** Customer count vs target percentage */
  customerCountPercentage: number;
  /** Portal utilization rate */
  portalUtilization: number;
  /** Portal on-time performance */
  portalOnTimePercentage: number;
  /** Order modification rate */
  modificationRate: number;
  /** Refund rate */
  refundRate: number;
  /** Operational efficiency score */
  efficiencyScore: number;
}

/**
 * Sales channel performance metrics
 */
export interface SalesChannelMetrics {
  /** In-store/traditional channels */
  traditional: ChannelPerformance;
  /** Digital channels (website + mobile) */
  digital: ChannelPerformance;
  /** Third-party delivery platforms */
  delivery: ChannelPerformance;
  /** Phone and call center */
  phone: ChannelPerformance;
  /** Best performing channel */
  topChannel: SalesChannelType;
  /** Digital adoption rate */
  digitalAdoptionRate: number;
}

/**
 * Performance metrics for a specific sales channel
 */
export interface ChannelPerformance {
  /** Channel identifier */
  channel: SalesChannelType;
  /** Sales amount */
  sales: number;
  /** Percentage of total sales */
  percentage: number;
  /** Order count */
  orders: number;
  /** Average order value */
  averageOrderValue: number;
  /** Performance trend */
  trend: TrendDirection;
  /** Performance level */
  performanceLevel: PerformanceLevel;
}

/**
 * Quality and service metrics
 */
export interface QualityMetrics {
  /** Customer service score */
  customerServiceScore: number;
  /** Order accuracy (calculated from modifications/refunds) */
  orderAccuracy: number;
  /** Service consistency score */
  serviceConsistency: number;
  /** Quality grade */
  qualityGrade: QualityGrade;
}

/**
 * Cost control and waste metrics
 */
export interface CostControlMetrics {
  /** Total waste amount (gateway + alta) */
  totalWaste: number;
  /** Waste as percentage of sales */
  wastePercentage: number;
  /** Labor efficiency score */
  laborEfficiency: number;
  /** Cost control grade */
  costControlGrade: CostControlGrade;
}

// =============================================================================
// ENUM-LIKE TYPES
// =============================================================================

/**
 * Sales channel types for categorization
 */
export const SalesChannelType = {
  TRADITIONAL: 'traditional',
  DIGITAL: 'digital',
  DELIVERY: 'delivery',
  PHONE: 'phone',
  DRIVE_THRU: 'drive_thru'
} as const;

export type SalesChannelType = typeof SalesChannelType[keyof typeof SalesChannelType];

/**
 * Performance level classifications
 */
export const PerformanceLevel = {
  EXCELLENT: 'excellent',
  GOOD: 'good',
  AVERAGE: 'average',
  BELOW_AVERAGE: 'below_average',
  POOR: 'poor'
} as const;

export type PerformanceLevel = typeof PerformanceLevel[keyof typeof PerformanceLevel];

/**
 * Performance grade scale
 */
export const PerformanceGrade = {
  A_PLUS: 'A+',
  A: 'A',
  B_PLUS: 'B+',
  B: 'B',
  C_PLUS: 'C+',
  C: 'C',
  D_PLUS: 'D+',
  D: 'D',
  F: 'F'
} as const;

export type PerformanceGrade = typeof PerformanceGrade[keyof typeof PerformanceGrade];

/**
 * Operational performance grade
 */
export const OperationalGrade = {
  OUTSTANDING: 'Outstanding',
  EXCEEDS_EXPECTATIONS: 'Exceeds Expectations',
  MEETS_EXPECTATIONS: 'Meets Expectations',
  BELOW_EXPECTATIONS: 'Below Expectations',
  NEEDS_IMPROVEMENT: 'Needs Improvement'
} as const;

export type OperationalGrade = typeof OperationalGrade[keyof typeof OperationalGrade];

/**
 * Quality grade classifications
 */
export const QualityGrade = {
  PREMIUM: 'Premium',
  HIGH: 'High',
  STANDARD: 'Standard',
  BELOW_STANDARD: 'Below Standard',
  CRITICAL: 'Critical'
} as const;

export type QualityGrade = typeof QualityGrade[keyof typeof QualityGrade];

/**
 * Cost control grade classifications
 */
export const CostControlGrade = {
  OPTIMAL: 'Optimal',
  EFFICIENT: 'Efficient',
  ACCEPTABLE: 'Acceptable',
  CONCERNING: 'Concerning',
  CRITICAL: 'Critical'
} as const;

export type CostControlGrade = typeof CostControlGrade[keyof typeof CostControlGrade];

/**
 * Trend direction indicators
 */
export const TrendDirection = {
  STRONG_UP: 'strong_up',
  UP: 'up',
  STABLE: 'stable',
  DOWN: 'down',
  STRONG_DOWN: 'strong_down'
} as const;

export type TrendDirection = typeof TrendDirection[keyof typeof TrendDirection];

// =============================================================================
// ALERT AND ANALYSIS TYPES
// =============================================================================

/**
 * Operational alert for metrics requiring attention
 */
export interface OperationalAlert {
  /** Alert severity */
  severity: AlertSeverity;
  /** Category of the alert */
  category: AlertCategory;
  /** Metric that triggered the alert */
  metric: string;
  /** Alert title */
  title: string;
  /** Detailed message */
  message: string;
  /** Current value */
  currentValue: number;
  /** Target or threshold value */
  targetValue: number;
  /** Variance from target */
  variance: number;
  /** Recommended actions */
  recommendations: string[];
  /** Priority level */
  priority: AlertPriority;
  /** Impact assessment */
  impact: AlertImpact;
}

/**
 * Alert severity levels
 */
export const AlertSeverity = {
  INFO: 'info',
  WARNING: 'warning',
  ERROR: 'error',
  CRITICAL: 'critical'
} as const;

export type AlertSeverity = typeof AlertSeverity[keyof typeof AlertSeverity];

/**
 * Alert categories for organization
 */
export const AlertCategory = {
  FINANCIAL: 'financial',
  OPERATIONAL: 'operational',
  QUALITY: 'quality',
  COST_CONTROL: 'cost_control',
  SALES: 'sales'
} as const;

export type AlertCategory = typeof AlertCategory[keyof typeof AlertCategory];

/**
 * Alert priority levels
 */
export const AlertPriority = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  URGENT: 'urgent'
} as const;

export type AlertPriority = typeof AlertPriority[keyof typeof AlertPriority];

/**
 * Alert impact assessment
 */
export const AlertImpact = {
  MINIMAL: 'minimal',
  LOW: 'low',
  MODERATE: 'moderate',
  HIGH: 'high',
  SEVERE: 'severe'
} as const;

export type AlertImpact = typeof AlertImpact[keyof typeof AlertImpact];

/**
 * Weekly trends analysis
 */
export interface WeeklyTrends {
  /** Sales trend */
  salesTrend: TrendAnalysis;
  /** Labor cost trend */
  laborTrend: TrendAnalysis;
  /** Customer count trend */
  customerTrend: TrendAnalysis;
  /** Waste trend */
  wasteTrend: TrendAnalysis;
  /** Digital adoption trend */
  digitalTrend: TrendAnalysis;
}

/**
 * Trend analysis data
 */
export interface TrendAnalysis {
  /** Metric name */
  metric: string;
  /** Current period value */
  current: number;
  /** Previous period value */
  previous: number;
  /** Percentage change */
  percentageChange: number;
  /** Trend direction */
  direction: TrendDirection;
  /** Trend significance */
  significance: TrendSignificance;
}

/**
 * Trend significance levels
 */
export const TrendSignificance = {
  HIGHLY_SIGNIFICANT: 'highly_significant',
  SIGNIFICANT: 'significant',
  MODERATE: 'moderate',
  MINOR: 'minor',
  NEGLIGIBLE: 'negligible'
} as const;

export type TrendSignificance = typeof TrendSignificance[keyof typeof TrendSignificance];

// =============================================================================
// CONFIGURATION AND TARGETS
// =============================================================================

/**
 * DSPR analysis configuration
 */
export interface DSPRAnalysisConfig {
  /** Performance targets and thresholds */
  targets: PerformanceTargets;
  /** Alert generation settings */
  alertSettings: AlertSettings;
  /** Grade calculation weights */
  gradeWeights: GradeWeights;
  /** Cost control thresholds */
  costThresholds: CostThresholds;
}

/**
 * Performance targets for various metrics
 */
export interface PerformanceTargets {
  /** Labor cost percentage target */
  laborCostTarget: number;
  /** Customer service score target */
  customerServiceTarget: number;
  /** Digital sales percentage target */
  digitalSalesTarget: number;
  /** Portal utilization target */
  portalUtilizationTarget: number;
  /** Waste percentage target */
  wastePercentageTarget: number;
  /** Customer count percentage target */
  customerCountTarget: number;
}

/**
 * Alert generation settings
 */
export interface AlertSettings {
  /** Enable automatic alert generation */
  enableAlerts: boolean;
  /** Maximum alerts per analysis */
  maxAlertsPerAnalysis: number;
  /** Minimum variance threshold for alerts */
  minVarianceThreshold: number;
  /** Alert categories to monitor */
  monitoredCategories: AlertCategory[];
}

/**
 * Grade calculation weights
 */
export interface GradeWeights {
  /** Financial metrics weight */
  financial: number;
  /** Operational metrics weight */
  operational: number;
  /** Quality metrics weight */
  quality: number;
  /** Cost control weight */
  costControl: number;
}

/**
 * Cost control thresholds
 */
export interface CostThresholds {
  /** Maximum acceptable labor percentage */
  maxLaborPercentage: number;
  /** Maximum acceptable waste percentage */
  maxWastePercentage: number;
  /** Acceptable cash variance range */
  cashVarianceRange: { min: number; max: number };
}

/**
 * Default DSPR analysis configuration
 */
export const defaultDSPRConfig: DSPRAnalysisConfig = {
  targets: {
    laborCostTarget: 0.30,
    customerServiceTarget: 0.95,
    digitalSalesTarget: 0.65,
    portalUtilizationTarget: 0.95,
    wastePercentageTarget: 0.03,
    customerCountTarget: 1.0
  },
  alertSettings: {
    enableAlerts: true,
    maxAlertsPerAnalysis: 8,
    minVarianceThreshold: 0.05,
    monitoredCategories: [
      AlertCategory.FINANCIAL,
      AlertCategory.OPERATIONAL,
      AlertCategory.QUALITY,
      AlertCategory.COST_CONTROL
    ]
  },
  gradeWeights: {
    financial: 0.35,
    operational: 0.25,
    quality: 0.25,
    costControl: 0.15
  },
  costThresholds: {
    maxLaborPercentage: 0.35,
    maxWastePercentage: 0.05,
    cashVarianceRange: { min: -5.0, max: 5.0 }
  }
};

// =============================================================================
// TYPE GUARDS AND UTILITIES
// =============================================================================

/**
 * Type guard for sales channel type validation
 * @param channel - Channel to validate
 * @returns True if valid sales channel type
 */
export const isValidSalesChannelType = (channel: string): channel is SalesChannelType => {
  return Object.values(SalesChannelType).includes(channel as SalesChannelType);
};

/**
 * Type guard for performance level validation
 * @param level - Level to validate
 * @returns True if valid performance level
 */
export const isValidPerformanceLevel = (level: string): level is PerformanceLevel => {
  return Object.values(PerformanceLevel).includes(level as PerformanceLevel);
};

/**
 * Utility to check if a metric value is within acceptable range
 * @param value - Value to check
 * @param target - Target value
 * @param tolerance - Acceptable tolerance percentage
 * @returns True if value is within acceptable range
 */
export const isWithinAcceptableRange = (
  value: number, 
  target: number, 
  tolerance: number = 0.1
): boolean => {
  const minAcceptable = target * (1 - tolerance);
  const maxAcceptable = target * (1 + tolerance);
  return value >= minAcceptable && value <= maxAcceptable;
};

/**
 * Utility to calculate percentage variance from target
 * @param current - Current value
 * @param target - Target value
 * @returns Percentage variance (positive = above target, negative = below target)
 */
export const calculateVariance = (current: number, target: number): number => {
  if (target === 0) return 0;
  return ((current - target) / target) * 100;
};

/**
 * Utility to determine trend direction from percentage change
 * @param percentageChange - Percentage change value
 * @returns Trend direction classification
 */
export const determineTrendDirection = (percentageChange: number): TrendDirection => {
  if (percentageChange >= 10) return TrendDirection.STRONG_UP;
  if (percentageChange >= 2) return TrendDirection.UP;
  if (percentageChange <= -10) return TrendDirection.STRONG_DOWN;
  if (percentageChange <= -2) return TrendDirection.DOWN;
  return TrendDirection.STABLE;
};
