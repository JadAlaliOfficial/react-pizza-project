
/**
 * Hourly Sales Domain Types
 * TypeScript interfaces for daily hourly sales data structure
 * 
 * This domain handles:
 * - Hourly sales breakdown by channel (Website, Mobile, Phone, etc.)
 * - Order counts per hour
 * - Sales channel performance metrics
 * - Time-based sales analysis data
 */

import type { StoreId, ApiDate } from './common';

// =============================================================================
// CORE HOURLY SALES TYPES
// =============================================================================

/**
 * HNR metrics for a single hour
 * Matches the "HNR" object inside each hour in the API response
 */
export interface HourlyHnrMetrics {
  /** Total HNR transactions */
  Transactions: number;
  /** HNR transactions with CC */
  Transactions_with_CC: number;
  /** HNR promise broken percentage */
  Promise_Broken_Percent: number;
  /** HNR promise met percentage */
  Promise_Met_Percent: number;
  /** HNR promise met transactions */
  Promise_Met_Transactions: number;
}

/**
 * Sales data for a single hour
 * Contains breakdown by sales channel and order metrics
 * Empty objects in API response represent hours with no sales
 */
export interface HourlySalesData {
  /** Total sales amount for the hour */
  Total_Sales?: number;
  /** Sales from phone orders */
  Phone_Sales?: number;
  /** Sales from call center agents */
  Call_Center_Agent?: number;
  /** Sales from drive-thru channel */
  Drive_Thru?: number;
  /** Sales from website orders */
  Website?: number;
  /** Sales from mobile app orders */
  Mobile?: number;
  /** Total number of orders for the hour */
  Order_Count?: number;
  /** HNR metrics for this hour (if present) */
  HNR?: HourlyHnrMetrics;
}

/**
 * Complete daily hourly sales structure
 * Contains metadata and 24-hour array of sales data
 */
export interface DailyHourlySales {
  /** Store identifier for this sales data */
  franchise_store: StoreId;
  /** Business date for this sales data */
  business_date: ApiDate;
  /** Array of 24 hourly sales objects (0-23 hours) */
  hours: HourlySalesData[];
}

// =============================================================================
// PROCESSED DATA TYPES
// =============================================================================

/**
 * Sales channel enumeration for type safety
 * Maps to the channel fields in HourlySalesData
 */
export const SalesChannel = {
  TOTAL_SALES: 'Total_Sales',
  PHONE_SALES: 'Phone_Sales',
  CALL_CENTER: 'Call_Center_Agent',
  DRIVE_THRU: 'Drive_Thru',
  WEBSITE: 'Website',
  MOBILE: 'Mobile'
} as const;

export type SalesChannel = typeof SalesChannel[keyof typeof SalesChannel];

/**
 * Processed hourly sales data with calculated fields
 * Enhanced version of HourlySalesData with business logic applied
 */
export interface ProcessedHourlySales extends HourlySalesData {
  /** Hour index (0-23) */
  hour: number;
  /** Whether this hour has any sales activity */
  hasActivity: boolean;
  /** Average order value for the hour */
  averageOrderValue: number;
  /** Digital sales percentage (Website + Mobile) */
  digitalSalesPercentage: number;
  /** Primary sales channel for the hour */
  primaryChannel: SalesChannel | null;
}

/**
 * Daily sales summary with aggregated metrics
 * Business-level insights derived from hourly data
 */
export interface DailySalesSummary {
  /** Store identifier */
  storeId: StoreId;
  /** Business date */
  date: ApiDate;
  /** Total daily sales across all channels */
  totalDailySales: number;
  /** Total daily order count */
  totalOrderCount: number;
  /** Average order value for the day */
  averageOrderValue: number;
  /** Peak sales hour (0-23) */
  peakSalesHour: number;
  /** Peak sales amount */
  peakSalesAmount: number;
  /** Hours with sales activity */
  activeHours: number;
  /** Digital sales percentage for the day */
  digitalSalesPercentage: number;
  /** Sales by channel breakdown */
  channelBreakdown: ChannelSalesBreakdown;
}

/**
 * Sales breakdown by channel
 * Aggregated channel performance for the day
 */
export interface ChannelSalesBreakdown {
  /** Phone sales total and percentage */
  phone: ChannelMetrics;
  /** Call center sales total and percentage */
  callCenter: ChannelMetrics;
  /** Drive-thru sales total and percentage */
  driveThru: ChannelMetrics;
  /** Website sales total and percentage */
  website: ChannelMetrics;
  /** Mobile sales total and percentage */
  mobile: ChannelMetrics;
}

/**
 * Metrics for a specific sales channel
 * Contains both absolute and relative performance data
 */
export interface ChannelMetrics {
  /** Total sales amount for the channel */
  amount: number;
  /** Percentage of total daily sales */
  percentage: number;
  /** Number of orders from this channel */
  orderCount: number;
  /** Average order value for this channel */
  averageOrderValue: number;
}

// =============================================================================
// ANALYSIS TYPES
// =============================================================================

/**
 * Time period for sales analysis
 * Used for filtering and grouping hourly data
 */
export interface SalesTimePeriod {
  /** Start hour (0-23) */
  startHour: number;
  /** End hour (0-23) */
  endHour: number;
  /** Display label for the period */
  label: string;
}

/**
 * Predefined business time periods
 * Common time ranges for sales analysis
 */
export const BusinessTimePeriods: Record<string, SalesTimePeriod> = {
  MORNING: { startHour: 6, endHour: 11, label: 'Morning (6AM-11AM)' },
  LUNCH: { startHour: 11, endHour: 14, label: 'Lunch (11AM-2PM)' },
  AFTERNOON: { startHour: 14, endHour: 17, label: 'Afternoon (2PM-5PM)' },
  DINNER: { startHour: 17, endHour: 21, label: 'Dinner (5PM-9PM)' },
  LATE_NIGHT: { startHour: 21, endHour: 23, label: 'Late Night (9PM-11PM)' },
  OVERNIGHT: { startHour: 0, endHour: 6, label: 'Overnight (12AM-6AM)' }
};

/**
 * Sales performance metrics for a time period
 * Aggregated data for business period analysis
 */
export interface PeriodSalesMetrics {
  /** Time period information */
  period: SalesTimePeriod;
  /** Total sales for the period */
  totalSales: number;
  /** Total orders for the period */
  totalOrders: number;
  /** Average order value */
  averageOrderValue: number;
  /** Percentage of daily sales */
  percentageOfDaily: number;
  /** Most active hour in the period */
  peakHour: number;
  /** Sales per active hour */
  salesPerHour: number;
}

/**
 * Trend analysis data for hourly sales
 * Used for identifying patterns and anomalies
 */
export interface SalesTrendData {
  /** Hour index (0-23) */
  hour: number;
  /** Current period sales */
  currentSales: number;
  /** Percentage change from average */
  percentageChange: number;
  /** Trend direction */
  trend: 'up' | 'down' | 'stable';
  /** Whether this hour is above daily average */
  aboveAverage: boolean;
}

// =============================================================================
// FILTERING AND SORTING TYPES
// =============================================================================

/**
 * Sort options for hourly sales data
 * Defines how to order hourly sales records
 */
export const HourlySalesSort = {
  HOUR_ASC: 'hour_asc',
  HOUR_DESC: 'hour_desc',
  SALES_ASC: 'sales_asc',
  SALES_DESC: 'sales_desc',
  ORDERS_ASC: 'orders_asc',
  ORDERS_DESC: 'orders_desc'
} as const;

export type HourlySalesSort = typeof HourlySalesSort[keyof typeof HourlySalesSort];

/**
 * Filter criteria for hourly sales analysis
 * Used to focus on specific aspects of sales data
 */
export interface HourlySalesFilter {
  /** Minimum sales threshold */
  minSales?: number;
  /** Maximum sales threshold */
  maxSales?: number;
  /** Minimum order count */
  minOrders?: number;
  /** Maximum order count */
  maxOrders?: number;
  /** Specific hours to include (0-23) */
  includeHours?: number[];
  /** Hours to exclude (0-23) */
  excludeHours?: number[];
  /** Only show hours with activity */
  activeOnly?: boolean;
  /** Specific channels to analyze */
  channels?: SalesChannel[];
}

// =============================================================================
// VALIDATION AND UTILITY TYPES
// =============================================================================

/**
 * Validation result for hourly sales data
 * Used to ensure data integrity and completeness
 */
export interface HourlySalesValidation {
  /** Whether the data is valid */
  isValid: boolean;
  /** Array of validation errors */
  errors: string[];
  /** Array of validation warnings */
  warnings: string[];
  /** Data completeness percentage (0-100) */
  completeness: number;
}

/**
 * Configuration for hourly sales calculations
 * Customizable parameters for business logic
 */
export interface HourlySalesConfig {
  /** Minimum sales amount to consider active */
  minimumSalesThreshold: number;
  /** Hours to exclude from calculations */
  excludedHours: number[];
  /** Whether to include zero-value hours in averages */
  includeZeroHours: boolean;
  /** Decimal places for monetary calculations */
  currencyPrecision: number;
  /** Decimal places for percentage calculations */
  percentagePrecision: number;
}

/**
 * Default configuration for hourly sales processing
 */
export const defaultHourlySalesConfig: HourlySalesConfig = {
  minimumSalesThreshold: 0.01,
  excludedHours: [],
  includeZeroHours: false,
  currencyPrecision: 2,
  percentagePrecision: 2
};

// =============================================================================
/** TYPE GUARDS */
// =============================================================================

/**
 * Type guard to check if an hour has sales activity
 * @param hourData - Hour data to check
 * @returns True if hour has meaningful sales data
 */
export const hasHourlyActivity = (hourData: HourlySalesData): boolean => {
  return !!(hourData.Total_Sales && hourData.Total_Sales > 0);
};

/**
 * Type guard to check if sales channel is valid
 * @param channel - Channel to validate
 * @returns True if channel is a valid SalesChannel
 */
export const isValidSalesChannel = (channel: string): channel is SalesChannel => {
  return Object.values(SalesChannel).includes(channel as SalesChannel);
};

/**
 * Type guard to check if hour index is valid
 * @param hour - Hour to validate
 * @returns True if hour is between 0-23
 */
export const isValidHour = (hour: number): boolean => {
  return Number.isInteger(hour) && hour >= 0 && hour <= 23;
};
