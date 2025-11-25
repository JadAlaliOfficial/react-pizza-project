import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { ChannelList } from '@/features/dashboard/components/channelSales/ChannelList';
import { useDailyDspr } from '@/features/DSPR/hooks/useDailyDspr';
import { useWeeklyDspr } from '@/features/DSPR/hooks/useWeeklyDspr';
import { useDsprApi } from '@/features/DSPR/hooks/useDsprApi';
import { useIsMobile } from '@/hooks/use-mobile';
import type { ChannelDataProps } from '@/features/dashboard/types/channelSales';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from 'recharts';

interface ChannelSalesDashboardProps {
  title?: string;
  channels?: ChannelDataProps[];
  className?: string;
}

// Define the pie chart data type
interface PieChartData {
  name: string;
  value: number;
  fill: string;
}

// Color mapping for different sales channels
const CHANNEL_COLORS = {
  DoorDash: '#E4572E', // warm orange-red
  UberEats: '#2E933C', // fresh green
  GrubHub: '#D81B60', // magenta-pink
  Phone: '#1E88E5', // clear blue
  Call_Center: '#00897B', // teal
  Website: '#F9A825', // golden yellow
  Mobile: '#8E24AA', // purple
  Drive_Thru: '#6D4C41', // earthy brown
} as const;

export const ChannelSalesDashboard: React.FC<ChannelSalesDashboardProps> = ({
  title = 'Channel Sales',
  channels: externalChannels,
  className,
}) => {
  const { raw: dailyRawData } = useDailyDspr();
  const { raw: weeklyRawData } = useWeeklyDspr();
  const { isLoading, error } = useDsprApi();
  const isMobile = useIsMobile();

  // Transform DSPR data into ChannelDataProps format
  const transformedChannels = useMemo((): ChannelDataProps[] => {
    if (!dailyRawData) {
      return [];
    }

    const channels: ChannelDataProps[] = [];

    // DoorDash
    if (dailyRawData.DoorDash_Sales !== undefined) {
      const dailyValue = dailyRawData.DoorDash_Sales || 0;
      const weeklyValue = weeklyRawData?.DoorDashSales || 0;
      channels.push({
        id: 'doordash',
        name: 'DoorDash',
        daily: `$${dailyValue.toFixed(2)}`,
        weekly: `$${weeklyValue.toFixed(2)}`,
      });
    }

    // UberEats
    if (dailyRawData.UberEats_Sales !== undefined) {
      const dailyValue = dailyRawData.UberEats_Sales || 0;
      const weeklyValue = weeklyRawData?.UberEatsSales || 0;
      channels.push({
        id: 'ubereats',
        name: 'UberEats',
        daily: `$${dailyValue.toFixed(2)}`,
        weekly: `$${weeklyValue.toFixed(2)}`,
      });
    }

    // GrubHub
    if (dailyRawData.GrubHub_Sales !== undefined) {
      const dailyValue = dailyRawData.GrubHub_Sales || 0;
      const weeklyValue = weeklyRawData?.GrubHubSales || 0;
      channels.push({
        id: 'grubhub',
        name: 'GrubHub',
        daily: `$${dailyValue.toFixed(2)}`,
        weekly: `$${weeklyValue.toFixed(2)}`,
      });
    }

    // Phone
    if (dailyRawData.Phone !== undefined) {
      const dailyValue = dailyRawData.Phone || 0;
      const weeklyValue = weeklyRawData?.Phone || 0;
      channels.push({
        id: 'phone',
        name: 'Phone',
        daily: `$${dailyValue.toFixed(2)}`,
        weekly: `$${weeklyValue.toFixed(2)}`,
      });
    }

    // Call Center
    if (dailyRawData.Call_Center_Agent !== undefined) {
      const dailyValue = dailyRawData.Call_Center_Agent || 0;
      const weeklyValue = weeklyRawData?.CallCenterAgent || 0;
      channels.push({
        id: 'call_center',
        name: 'Call Center',
        daily: `$${dailyValue.toFixed(2)}`,
        weekly: `$${weeklyValue.toFixed(2)}`,
      });
    }

    // Website
    if (dailyRawData.Website !== undefined) {
      const dailyValue = dailyRawData.Website || 0;
      const weeklyValue = weeklyRawData?.Website || 0;
      channels.push({
        id: 'website',
        name: 'Website',
        daily: `$${dailyValue.toFixed(2)}`,
        weekly: `$${weeklyValue.toFixed(2)}`,
      });
    }

    // Mobile
    if (dailyRawData.Mobile !== undefined) {
      const dailyValue = dailyRawData.Mobile || 0;
      const weeklyValue = weeklyRawData?.Mobile || 0;
      channels.push({
        id: 'mobile',
        name: 'Mobile',
        daily: `$${dailyValue.toFixed(2)}`,
        weekly: `$${weeklyValue.toFixed(2)}`,
      });
    }

    // Drive Thru (only if available)
    // Drive Thru
    if (dailyRawData.Drive_Thru_Sales !== undefined) {
      const dailyValue = dailyRawData.Drive_Thru_Sales || 0;
      const weeklyValue = weeklyRawData?.DriveThruSales || 0;
      channels.push({
        id: 'drive_thru',
        name: 'Drive Thru',
        daily: `$${dailyValue.toFixed(2)}`,
        weekly: `$${weeklyValue.toFixed(2)}`,
      });
    }

    return channels;
  }, [dailyRawData, weeklyRawData]);

  const channels = externalChannels || transformedChannels;

  // Transform DSPR data into pie chart format
  const pieData = useMemo((): PieChartData[] => {
    if (!dailyRawData) {
      return [];
    }

    const salesChannels: PieChartData[] = [
      {
        name: 'DoorDash',
        value: dailyRawData.DoorDash_Sales || 0,
        fill: CHANNEL_COLORS.DoorDash,
      },
      {
        name: 'UberEats',
        value: dailyRawData.UberEats_Sales || 0,
        fill: CHANNEL_COLORS.UberEats,
      },
      {
        name: 'GrubHub',
        value: dailyRawData.GrubHub_Sales || 0,
        fill: CHANNEL_COLORS.GrubHub,
      },
      {
        name: 'Phone',
        value: dailyRawData.Phone || 0,
        fill: CHANNEL_COLORS.Phone,
      },
      {
        name: 'Call Center',
        value: dailyRawData.Call_Center_Agent || 0,
        fill: CHANNEL_COLORS.Call_Center,
      },
      {
        name: 'Website',
        value: dailyRawData.Website || 0,
        fill: CHANNEL_COLORS.Website,
      },
      {
        name: 'Mobile',
        value: dailyRawData.Mobile || 0,
        fill: CHANNEL_COLORS.Mobile,
      },
    ];

    // Only include Drive_Thru if it exists in the data (indicates store offers drive-thru)
    if (dailyRawData.Drive_Thru_Sales !== undefined) {
      salesChannels.push({
        name: 'Drive Thru',
        value: dailyRawData.Drive_Thru_Sales || 0,
        fill: CHANNEL_COLORS.Drive_Thru,
      });
    }

    // Filter out channels with zero sales for cleaner visualization
    return salesChannels.filter((channel) => channel.value > 0);
  }, [dailyRawData]);

  // Custom label function
  const renderCustomizedLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
  }: any) => {
    // Only show label if percentage is 10% or above
    if (percent < 0.1) {
      return null;
    }

    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
        fontSize={12}
        fontWeight="bold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  // Custom tooltip to show sales amounts
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="bg-white p-3 border border-gray-300 rounded shadow-lg">
          <p className="font-semibold text-black">{data.name}</p>
          <p className="text-blue-600">
            Sales: ${data.value?.toLocaleString() || 0}
          </p>
          <p className="text-gray-600">
            {(
              (data.value /
                pieData.reduce((sum, item) => sum + item.value, 0)) *
              100
            ).toFixed(1)}
            %
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div
      className={cn(
        'w-full grid grid-cols-1 gap-8 p-2 overflow-hidden',
        isMobile ? 'grid-cols-1' : 'grid-cols-2',
      )}
    >
      {/* Channel Sales Card */}
      <Card
        className={cn(
          'shadow-realistic-lg flex-shrink-0 overflow-hidden',
          // Responsive sizing
          isMobile ? 'w-full' : 'w-full',
          className,
        )}
      >
        <CardHeader
          className={cn(
            'bg-channel-header text-channel-header-foreground rounded-t-lg',
            // Responsive padding
            isMobile ? 'p-3' : 'p-6',
          )}
        >
          <CardTitle
            className={cn(
              'font-bold text-center',
              // Responsive text size
              isMobile ? 'text-base' : 'text-lg md:text-xl',
            )}
          >
            {title}
          </CardTitle>
        </CardHeader>

        <CardContent className="p-0">
          {/* Channel List */}
          {isLoading ? (
            <div className="flex items-center justify-center h-48">
              <div className="text-gray-500">Loading channel sales data...</div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-48">
              <div className="text-red-500">Error loading channel sales data</div>
            </div>
          ) : channels.length === 0 ? (
            <div className="flex items-center justify-center h-48">
              <div className="text-gray-500">No channel sales data available</div>
            </div>
          ) : (
            <ChannelList
              channels={channels}
            />
          )}
        </CardContent>
      </Card>

      {/* Pie Chart Card */}
      <Card
        className={cn(
          'shadow-realistic-lg flex-1 overflow-hidden',
          isMobile ? 'w-full' : 'w-full',
        )}
      >
        <CardHeader
          className={cn(
            'bg-channel-header text-channel-header-foreground rounded-t-lg',
            isMobile ? 'p-3' : 'p-6',
          )}
        >
          <CardTitle
            className={cn(
              'font-bold text-center',
              isMobile ? 'text-base' : 'text-lg md:text-xl',
            )}
          >
            Sales Distribution
          </CardTitle>
        </CardHeader>

        <CardContent
          className={cn('p-4 overflow-hidden', isMobile ? 'h-64' : 'h-96 ')}
        >
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-gray-500">Loading sales data...</div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-red-500">Error loading sales data</div>
            </div>
          ) : pieData.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-gray-500">No sales data available</div>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={renderCustomizedLabel}
                  outerRadius={isMobile ? 60 : 90}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
