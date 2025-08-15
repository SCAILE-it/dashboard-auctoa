"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Search,
  TrendingUp,
  MousePointer,
  RefreshCw,
  Database,
  Globe,
  Bot
} from "lucide-react";

// Import our dashboard components
import { 
  DashboardSection
} from "@/components/dashboard";
import { useOverviewData } from "@/lib/hooks/useOverviewData";
import { useAnalyticsState } from "@/lib/hooks/useAnalyticsState";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { ExportOverviewButton } from "@/components/ui/export-button";
import { exportOverviewToCSV } from "@/lib/csv-export";


export default function DashboardOverview() {
  const [manualLoading, setManualLoading] = useState(false);
  const { dateRange, setDateRange } = useAnalyticsState();
  
  const { data: overviewData, loading: dataLoading, error, refetch } = useOverviewData(dateRange);

  const handleRefresh = () => {
    setManualLoading(true);
    refetch().finally(() => {
      setTimeout(() => setManualLoading(false), 500);
    });
  };

  const loading = dataLoading || manualLoading;

    // Export functions
  const handleExportOverview = async () => {
    if (!overviewData) {
      throw new Error('No overview data available for export');
    }
    
    // Transform overview data to match export function expectations
    const exportData = {
      kpis: Object.entries(overviewData.kpis).map(([key, value]) => ({
        id: key,
        title: key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()),
        value: value.current,
        trend: value.trend ? parseFloat(value.trend.replace('%', '')) : 0,
        source: value.source
      })),
      series: {
        chatbot: overviewData.series.chatbot,
        search: overviewData.series.search,
        traffic: overviewData.series.traffic
      }
    };
    
    exportOverviewToCSV(
      exportData,
      {
        from: dateRange.from.toISOString().split('T')[0],
        to: dateRange.to.toISOString().split('T')[0]
      },
      { filename: 'complete_analytics_overview' }
    );
  };

  // Extract key metrics from unified overview data
  const getKPIValue = (key: string) => {
    if (!overviewData?.kpis) return { current: 0, trend: '0%' };
    const kpis = overviewData.kpis as Record<string, { current: number; trend: string }>;
    return kpis[key] || { current: 0, trend: '0%' };
  };

  const formatTrend = (trend: string) => ({
    value: trend,
    isPositive: trend.startsWith('+'),
    isNeutral: trend === '0%'
  });

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div>
          <h2 className="text-3xl font-bold">Analytics Overview</h2>
          <p className="text-muted-foreground">Your complete business performance at a glance</p>
        </div>
        <div className="flex items-center gap-3">
          <DateRangePicker
            value={dateRange}
            onChange={(range) => range && setDateRange(range)}
          />
          <ExportOverviewButton
            onExport={handleExportOverview}
            disabled={loading || !overviewData}
            className="text-sm"
          />
          <Button
            onClick={handleRefresh}
            variant="outline"
            disabled={loading}
            size="sm"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            {loading ? "Refreshing..." : "Refresh"}
          </Button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
          <p className="text-destructive text-sm font-medium">⚠️ {error}</p>
        </div>
      )}

      {/* Unified Key Metrics */}
      <DashboardSection 
        title="Business Performance Overview" 
        description="Key metrics consolidated from all data sources"
        icon={TrendingUp}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Website Traffic */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-purple-500" />
                <Badge variant="secondary" className="text-xs">GA4</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? "..." : getKPIValue('totalUsers').current.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                <span className={`inline-flex items-center ${formatTrend(getKPIValue('totalUsers').trend).isPositive ? 'text-green-600' : formatTrend(getKPIValue('totalUsers').trend).isNeutral ? 'text-gray-500' : 'text-red-600'}`}>
                  {formatTrend(getKPIValue('totalUsers').trend).value} from last period
                </span>
              </p>
            </CardContent>
          </Card>

          {/* Search Performance */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Search Clicks</CardTitle>
              <div className="flex items-center gap-2">
                <Search className="h-4 w-4 text-blue-500" />
                <Badge variant="secondary" className="text-xs">GSC</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? "..." : getKPIValue('totalClicks').current.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                <span className={`inline-flex items-center ${formatTrend(getKPIValue('totalClicks').trend).isPositive ? 'text-green-600' : formatTrend(getKPIValue('totalClicks').trend).isNeutral ? 'text-gray-500' : 'text-red-600'}`}>
                  {formatTrend(getKPIValue('totalClicks').trend).value} from last period
                </span>
              </p>
            </CardContent>
          </Card>

          {/* Chatbot Conversations */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">AI Conversations</CardTitle>
              <div className="flex items-center gap-2">
                <Bot className="h-4 w-4 text-green-500" />
                <Badge variant="secondary" className="text-xs">Chatbot</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? "..." : getKPIValue('totalConversations').current.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                <span className={`inline-flex items-center ${formatTrend(getKPIValue('totalConversations').trend).isPositive ? 'text-green-600' : formatTrend(getKPIValue('totalConversations').trend).isNeutral ? 'text-gray-500' : 'text-red-600'}`}>
                  {formatTrend(getKPIValue('totalConversations').trend).value} from last period
                </span>
              </p>
            </CardContent>
          </Card>

          {/* Conversion Rate */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Lead Conversion</CardTitle>
              <div className="flex items-center gap-2">
                <MousePointer className="h-4 w-4 text-orange-500" />
                <Badge variant="secondary" className="text-xs">Combined</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? "..." : `${(getKPIValue('conversionRate').current * 100).toFixed(1)}%`}
              </div>
              <p className="text-xs text-muted-foreground">
                <span className={`inline-flex items-center ${formatTrend(getKPIValue('conversionRate').trend).isPositive ? 'text-green-600' : formatTrend(getKPIValue('conversionRate').trend).isNeutral ? 'text-gray-500' : 'text-red-600'}`}>
                  {formatTrend(getKPIValue('conversionRate').trend).value} from last period
                </span>
              </p>
            </CardContent>
          </Card>
        </div>
      </DashboardSection>

      {/* Data Sources Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Website Analytics Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-purple-500" />
              Website Analytics
              <Badge variant="outline" className="ml-auto">GA4</Badge>
            </CardTitle>
            <CardDescription>Traffic and user engagement metrics</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm">Sessions</span>
              <span className="font-medium">{loading ? "..." : getKPIValue('totalSessions').current.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Pageviews</span>
              <span className="font-medium">{loading ? "..." : getKPIValue('totalPageviews').current.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Avg. Session Duration</span>
              <span className="font-medium">
                {loading ? "..." : `${Math.floor(getKPIValue('avgSessionDuration').current / 60)}m ${Math.floor(getKPIValue('avgSessionDuration').current % 60)}s`}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Search Console Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5 text-blue-500" />
              Search Performance
              <Badge variant="outline" className="ml-auto">GSC</Badge>
            </CardTitle>
            <CardDescription>Google search visibility and traffic</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm">Total Impressions</span>
              <span className="font-medium">{loading ? "..." : getKPIValue('totalImpressions').current.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Click-through Rate</span>
              <span className="font-medium">
                {loading ? "..." : `${(getKPIValue('clickThroughRate').current * 100).toFixed(1)}%`}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Average Position</span>
              <span className="font-medium">{loading ? "..." : getKPIValue('avgPosition').current.toFixed(1)}</span>
            </div>
          </CardContent>
        </Card>

        {/* Chatbot Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bot className="h-5 w-5 text-green-500" />
              AI Assistant
              <Badge variant="outline" className="ml-auto">Supabase</Badge>
            </CardTitle>
            <CardDescription>Chatbot engagement and conversions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm">Total Messages</span>
              <span className="font-medium">{loading ? "..." : getKPIValue('totalMessages').current.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Completion Rate</span>
              <span className="font-medium">
                {loading ? "..." : `${(getKPIValue('completionRate').current * 100).toFixed(1)}%`}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Property Requests</span>
              <span className="font-medium">{loading ? "..." : getKPIValue('propertyRequests').current.toLocaleString()}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Data Connection Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Data Sources Status
          </CardTitle>
          <CardDescription>Real-time connection status for all integrated data sources</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-3">
                <Globe className="h-5 w-5 text-purple-500" />
                <div>
                  <p className="font-medium">Google Analytics 4</p>
                  <p className="text-sm text-muted-foreground">Live API connection</p>
                </div>
              </div>
              <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300">
                🟢 Connected
              </Badge>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-3">
                <Search className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="font-medium">Search Console</p>
                  <p className="text-sm text-muted-foreground">Supabase database</p>
                </div>
              </div>
              <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300">
                🟢 Connected
              </Badge>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-3">
                <Bot className="h-5 w-5 text-green-500" />
                <div>
                  <p className="font-medium">AI Chatbot</p>
                  <p className="text-sm text-muted-foreground">Supabase database</p>
                </div>
              </div>
              <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300">
                🟢 Connected
              </Badge>
            </div>
          </div>
          
          {overviewData && (
            <div className="mt-4 pt-4 border-t">
              <p className="text-sm text-muted-foreground">
                Data range: <strong>{overviewData.range.from}</strong> to <strong>{overviewData.range.to}</strong>
                {overviewData.sourcesNote && (
                  <span className="block mt-1">{overviewData.sourcesNote}</span>
                )}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}