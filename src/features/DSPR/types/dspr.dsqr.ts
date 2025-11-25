/**
 * DSQR (Delivery Service Quality Rating) Domain Types
 * TypeScript interfaces for DSQR performance metrics and ratings data
 * 
 * This domain handles:
 * - DoorDash (DD) performance metrics
 * - UberEats (UE) quality indicators
 * - GrubHub (GH) rating systems
 * - Performance tracking and optimization scores
 */

import type { StoreId, ApiDate } from './dspr.common';

// =============================================================================
// CORE DSQR TYPES
// =============================================================================

/**
 * Complete daily DSQR data structure
 * Contains performance scores and tracking indicators for all platforms
 */
export interface DailyDSQRData {
  /** Performance scores across all delivery platforms */
  score: DSQRScoreData;
  /** On-track indicators for performance metrics */
  is_on_track: DSQRTrackingData;
}

/**
 * DSQR score data containing all platform metrics
 * Raw performance values from delivery platforms
 */
export interface DSQRScoreData {
  // DoorDash Metrics
  /** DoorDash Most Loved Restaurant status (0.0 = not achieved) */
  DD_Most_Loved_Restaurant: number;
  /** DoorDash optimization score level */
  DD_Optimization_Score: OptimizationScore;
  /** DoorDash average customer rating (1-5 scale) */
  DD_Ratings_Average_Rating: number;
  /** DoorDash sales lost due to cancellations (monetary value) */
  DD_Cancellations_Sales_Lost: number;
  /** DoorDash error charges for missing/incorrect items (monetary value) */
  DD_Missing_or_Incorrect_Error_Charges: number;
  /** DoorDash avoidable wait time in minutes and seconds */
  DD_Avoidable_Wait_M_Sec: number;
  /** DoorDash total dasher wait time in minutes and seconds */
  DD_Total_Dasher_Wait_M_Sec: number;
  /** DoorDash number one top missing/incorrect item count */
  DD_number_1_Top_Missing_or_Incorrect_Item: number;
  /** DoorDash downtime in hours and minutes */
  DD_Downtime_H_MM: number;
  /** DoorDash review response rate (0-1 scale) */
  DD_Reviews_Responded: number;

  // UberEats Metrics
  /** UberEats customer review average (1-5 scale) */
  UE_Customer_reviews_overview: number;
  /** UberEats cost of refunds (monetary value) */
  UE_Cost_of_Refunds: number;
  /** UberEats unfulfilled order rate (0-1 scale) */
  UE_Unfulfilled_order_rate: number;
  /** UberEats time unavailable during open hours */
  UE_Time_unavailable_during_open_hours_hh_mm: number;
  /** UberEats top inaccurate item count */
  UE_Top_inaccurate_item: number;
  /** UberEats review response rate (0-1 scale) */
  UE_Reviews_Responded: number;

  // GrubHub Metrics
  /** GrubHub overall rating (1-5 scale) */
  GH_Rating: number;
  /** GrubHub food quality rating (0-1 scale) */
  GH_Food_was_good: number;
  /** GrubHub delivery timeliness rating (0-1 scale) */
  GH_Delivery_was_on_time: number;
  /** GrubHub order accuracy rating (0-1 scale) */
  GH_Order_was_accurate: number;
}

/**
 * DSQR tracking data for performance indicators
 * Shows whether metrics are on track (OT), not applicable (NA), or off track
 */
export interface DSQRTrackingData {
  // DoorDash Tracking
  /** DoorDash ratings on track status */
  DD_NAOT_Ratings_Average_Rating: TrackingStatus;
  /** DoorDash cancellations on track status */
  DD_NAOT_Cancellations_Sales_Lost: TrackingStatus;
  /** DoorDash missing/incorrect items on track status */
  DD_NAOT_Missing_or_Incorrect_Error_Charges: TrackingStatus;
  /** DoorDash avoidable wait on track status */
  DD_NAOT_Avoidable_Wait_M_Sec: TrackingStatus;
  /** DoorDash total wait on track status */
  DD_NAOT_Total_Dasher_Wait_M_Sec: TrackingStatus;
  /** DoorDash downtime on track status */
  DD_NAOT_Downtime_H_MM: TrackingStatus;

  // UberEats Tracking
  /** UberEats reviews on track status */
  UE_NAOT_Customer_reviews_overview: TrackingStatus;
  /** UberEats refunds on track status */
  UE_NAOT_Cost_of_Refunds: TrackingStatus;
  /** UberEats unfulfilled orders on track status */
  UE_NAOT_Unfulfilled_order_rate: TrackingStatus;
  /** UberEats availability on track status */
  UE_NAOT_Time_unavailable_during_open_hours_hh_mm: TrackingStatus;

  // GrubHub Tracking
  /** GrubHub rating on track status */
  GH_NAOT_Rating: TrackingStatus;
  /** GrubHub food quality on track status */
  GH_NAOT_Food_was_good: TrackingStatus;
  /** GrubHub delivery timeliness on track status */
  GH_NAOT_Delivery_was_on_time: TrackingStatus;
  /** GrubHub accuracy on track status */
  GH_NAOT_Order_was_accurate: TrackingStatus;
}

// =============================================================================
// ENUM-LIKE TYPES
// =============================================================================

/**
 * Optimization score levels from delivery platforms
 */
export const OptimizationScore = {
  HIGH: 'High',
  MEDIUM: 'Medium',
  LOW: 'Low'
} as const;

export type OptimizationScore = typeof OptimizationScore[keyof typeof OptimizationScore];

/**
 * Tracking status indicators for performance metrics
 */
export const TrackingStatus = {
  ON_TRACK: 'OT',
  NOT_APPLICABLE: 'NA',
  OFF_TRACK: 'OFF'
} as const;

export type TrackingStatus = typeof TrackingStatus[keyof typeof TrackingStatus];

/**
 * Delivery platform identifiers
 */
export const DeliveryPlatform = {
  DOORDASH: 'DoorDash',
  UBEREATS: 'UberEats', 
  GRUBHUB: 'GrubHub'
} as const;

export type DeliveryPlatform = typeof DeliveryPlatform[keyof typeof DeliveryPlatform];

// =============================================================================
// PROCESSED DATA TYPES
// =============================================================================

/**
 * Processed DSQR data with calculated insights
 * Enhanced version with business logic and trend analysis
 */
export interface ProcessedDSQRData {
  /** Store identifier */
  storeId: StoreId;
  /** Business date */
  date: ApiDate;
  /** Platform-specific processed data */
  platforms: PlatformData;
  /** Overall performance summary */
  overallSummary: DSQRSummary;
  /** Performance alerts and recommendations */
  alerts: PerformanceAlert[];
}

/**
 * Platform-specific DSQR data organization
 */
export interface PlatformData {
  /** DoorDash metrics and status */
  doorDash: PlatformMetrics;
  /** UberEats metrics and status */
  uberEats: PlatformMetrics;
  /** GrubHub metrics and status */
  grubHub: PlatformMetrics;
}

/**
 * Metrics for a specific delivery platform
 */
export interface PlatformMetrics {
  /** Platform identifier */
  platform: DeliveryPlatform;
  /** Overall platform rating/score */
  overallRating: number;
  /** Key performance indicators */
  kpis: PlatformKPI[];
  /** Number of metrics on track */
  onTrackCount: number;
  /** Total number of applicable metrics */
  totalApplicableMetrics: number;
  /** Performance percentage (on track / total applicable) */
  performancePercentage: number;
  /** Performance level assessment */
  performanceLevel: PerformanceLevel;
}

/**
 * Key Performance Indicator for platform metrics
 */
export interface PlatformKPI {
  /** KPI name/identifier */
  name: string;
  /** Display label */
  label: string;
  /** Current value */
  value: number | string;
  /** Tracking status */
  status: TrackingStatus;
  /** Unit of measurement */
  unit: MetricUnit;
  /** Whether this is a critical metric */
  isCritical: boolean;
  /** Target value or range */
  target?: number | string;
  /** Trend direction compared to historical data */
  trend?: TrendDirection;
}

/**
 * Overall DSQR performance summary
 */
export interface DSQRSummary {
  /** Average rating across all platforms */
  averageRating: number;
  /** Total metrics on track across all platforms */
  totalOnTrack: number;
  /** Total applicable metrics across all platforms */
  totalApplicable: number;
  /** Overall performance percentage */
  overallPerformance: number;
  /** Best performing platform */
  bestPlatform: DeliveryPlatform;
  /** Platform needing most attention */
  attentionRequired: DeliveryPlatform;
  /** Overall performance grade */
  performanceGrade: PerformanceGrade;
}

// =============================================================================
// ANALYSIS AND ALERT TYPES
// =============================================================================

/**
 * Performance alert for metrics requiring attention
 */
export interface PerformanceAlert {
  /** Alert severity level */
  severity: AlertSeverity;
  /** Platform associated with alert */
  platform: DeliveryPlatform;
  /** Metric that triggered the alert */
  metric: string;
  /** Alert message */
  message: string;
  /** Current value */
  currentValue: number | string;
  /** Target or threshold value */
  targetValue?: number | string;
  /** Recommended actions */
  recommendations: string[];
  /** Alert priority for action */
  priority: AlertPriority;
}

/**
 * Performance level categories
 */
export const PerformanceLevel = {
  EXCELLENT: 'Excellent',
  GOOD: 'Good', 
  FAIR: 'Fair',
  POOR: 'Poor',
  CRITICAL: 'Critical'
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
  D: 'D',
  F: 'F'
} as const;

export type PerformanceGrade = typeof PerformanceGrade[keyof typeof PerformanceGrade];

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
 * Metric units for proper display formatting
 */
export const MetricUnit = {
  RATING: 'rating',
  PERCENTAGE: 'percentage',
  CURRENCY: 'currency',
  TIME_MINUTES: 'minutes',
  TIME_HOURS: 'hours',
  COUNT: 'count',
  RATIO: 'ratio'
} as const;

export type MetricUnit = typeof MetricUnit[keyof typeof MetricUnit];

/**
 * Trend direction indicators
 */
export const TrendDirection = {
  UP: 'up',
  DOWN: 'down',
  STABLE: 'stable',
  VOLATILE: 'volatile'
} as const;

export type TrendDirection = typeof TrendDirection[keyof typeof TrendDirection];

// =============================================================================
// FILTERING AND CONFIGURATION TYPES
// =============================================================================

/**
 * Filter options for DSQR data analysis
 */
export interface DSQRFilter {
  /** Specific platforms to include */
  platforms?: DeliveryPlatform[];
  /** Minimum rating threshold */
  minRating?: number;
  /** Only show metrics that are off track */
  offTrackOnly?: boolean;
  /** Only show critical metrics */
  criticalOnly?: boolean;
  /** Specific tracking statuses to include */
  trackingStatuses?: TrackingStatus[];
  /** Performance levels to include */
  performanceLevels?: PerformanceLevel[];
}

/**
 * DSQR analysis configuration
 */
export interface DSQRAnalysisConfig {
  /** Thresholds for performance level classification */
  performanceThresholds: PerformanceThresholds;
  /** Critical metrics that require immediate attention */
  criticalMetrics: string[];
  /** Alert configuration settings */
  alertConfig: AlertConfiguration;
  /** Rating scale configurations */
  ratingScales: RatingScaleConfig;
}

/**
 * Performance threshold configuration
 */
export interface PerformanceThresholds {
  /** Minimum percentage for excellent performance */
  excellent: number;
  /** Minimum percentage for good performance */
  good: number;
  /** Minimum percentage for fair performance */
  fair: number;
  /** Minimum percentage for poor performance (below this is critical) */
  poor: number;
}

/**
 * Alert configuration settings
 */
export interface AlertConfiguration {
  /** Enable automatic alert generation */
  enableAlerts: boolean;
  /** Maximum number of alerts to generate */
  maxAlerts: number;
  /** Alert priorities to include */
  includePriorities: AlertPriority[];
  /** Platforms to monitor for alerts */
  monitoredPlatforms: DeliveryPlatform[];
}

/**
 * Rating scale configuration for different platforms
 */
export interface RatingScaleConfig {
  /** Rating scale configuration by platform */
  [key: string]: {
    /** Minimum possible rating */
    min: number;
    /** Maximum possible rating */
    max: number;
    /** Number of decimal places for display */
    precision: number;
  };
}

/**
 * Default DSQR analysis configuration
 */
export const defaultDSQRConfig: DSQRAnalysisConfig = {
  performanceThresholds: {
    excellent: 95,
    good: 85,
    fair: 70,
    poor: 50
  },
  criticalMetrics: [
    'DD_Ratings_Average_Rating',
    'UE_Customer_reviews_overview', 
    'GH_Rating'
  ],
  alertConfig: {
    enableAlerts: true,
    maxAlerts: 10,
    includePriorities: [AlertPriority.HIGH, AlertPriority.URGENT],
    monitoredPlatforms: [DeliveryPlatform.DOORDASH, DeliveryPlatform.UBEREATS, DeliveryPlatform.GRUBHUB]
  },
  ratingScales: {
    doordash: { min: 1, max: 5, precision: 2 },
    ubereats: { min: 1, max: 5, precision: 1 },
    grubhub: { min: 1, max: 5, precision: 2 }
  }
};

// =============================================================================
// TYPE GUARDS AND UTILITIES
// =============================================================================

/**
 * Type guard to check if optimization score is valid
 * @param score - Score to validate
 * @returns True if score is valid OptimizationScore
 */
export const isValidOptimizationScore = (score: string): score is OptimizationScore => {
  return Object.values(OptimizationScore).includes(score as OptimizationScore);
};

/**
 * Type guard to check if tracking status is valid
 * @param status - Status to validate
 * @returns True if status is valid TrackingStatus
 */
export const isValidTrackingStatus = (status: string): status is TrackingStatus => {
  return Object.values(TrackingStatus).includes(status as TrackingStatus);
};

/**
 * Type guard to check if platform is valid
 * @param platform - Platform to validate
 * @returns True if platform is valid DeliveryPlatform
 */
export const isValidDeliveryPlatform = (platform: string): platform is DeliveryPlatform => {
  return Object.values(DeliveryPlatform).includes(platform as DeliveryPlatform);
};

/**
 * Helper function to check if a metric is on track
 * @param status - Tracking status to check
 * @returns True if metric is on track
 */
export const isOnTrack = (status: TrackingStatus): boolean => {
  return status === TrackingStatus.ON_TRACK;
};

/**
 * Helper function to check if a rating is in valid range
 * @param rating - Rating to validate
 * @param min - Minimum valid rating
 * @param max - Maximum valid rating
 * @returns True if rating is in valid range
 */
export const isValidRating = (rating: number, min: number = 1, max: number = 5): boolean => {
  return typeof rating === 'number' && rating >= min && rating <= max;
};
