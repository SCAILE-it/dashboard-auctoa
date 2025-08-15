"use client";

import { useState } from "react";
import { BarChart3, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

import { DashboardSection } from "@/components/dashboard";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { GA4Charts } from "@/components/charts/GA4Charts";
import { AnalyticsKPIs } from "@/components/analytics/AnalyticsKPIs";
import { enhancedGA4KPIs } from "@/lib/ga4-data";
import { useGA4Data } from "@/lib/hooks/useGA4Data";
import { useOverviewData } from "@/lib/hooks/useOverviewData";
import { useAnalyticsState } from "@/lib/hooks/useAnalyticsState";
import { ExportChartDataButton } from "@/components/ui/export-button";
import { exportTimeSeriesToCSV } from "@/lib/csv-export";

export default function AnalyticsPage() {
  const [manualLoading, setManualLoading] = useState(false);
  
  const { dateRange, setDateRange } = useAnalyticsState();
  
  const { data: ga4Data, loading: dataLoading, error, refetch } = useGA4Data(dateRange);
  
  const { data: overviewData, loading: overviewLoading, refetch: refetchOverview } = useOverviewData(dateRange);

  const handleRefresh = () => {
    setManualLoading(true);
    Promise.all([refetch(), refetchOverview()]).finally(() => {
      setTimeout(() => setManualLoading(false), 500);
    });
  };

  // Export functions
  const handleExportChartData = async () => {
    if (!overviewData?.series?.traffic) {
      throw new Error('No GA4 chart data available for export');
    }
    
    exportTimeSeriesToCSV(
      overviewData.series.traffic,
      'GA4 Website Traffic',
      {
        from: dateRange.from.toISOString().split('T')[0],
        to: dateRange.to.toISOString().split('T')[0]
      },
      { filename: 'ga4_traffic_data' }
    );
  };

  // Map overview data to KPI format for display (or use defaults)
  const mappedKPIs = ga4Data && ga4Data.metrics ? enhancedGA4KPIs.map(kpi => {
    const metrics = ga4Data.metrics;
    
    switch (kpi.id) {
      case 'total-users':
        return {
          ...kpi,
          value: metrics.totalUsers.current.toLocaleString(),
          trend: {
            value: metrics.totalUsers.trend,
            isPositive: metrics.totalUsers.trend.startsWith('+'),
            isNeutral: metrics.totalUsers.trend === '0%'
          }
        };
      case 'total-sessions':
        return {
          ...kpi,
          value: metrics.totalSessions.current.toLocaleString(),
          trend: {
            value: metrics.totalSessions.trend,
            isPositive: metrics.totalSessions.trend.startsWith('+'),
            isNeutral: metrics.totalSessions.trend === '0%'
          }
        };
      case 'total-pageviews':
        return {
          ...kpi,
          value: metrics.totalPageviews.current.toLocaleString(),
          trend: {
            value: metrics.totalPageviews.trend,
            isPositive: metrics.totalPageviews.trend.startsWith('+'),
            isNeutral: metrics.totalPageviews.trend === '0%'
          }
        };
      case 'avg-session-duration':
        const duration = metrics.avgSessionDuration.current;
        const minutes = Math.floor(duration / 60);
        const seconds = Math.floor(duration % 60);
        return {
          ...kpi,
          value: `${minutes}m ${seconds}s`,
          trend: {
            value: metrics.avgSessionDuration.trend,
            isPositive: metrics.avgSessionDuration.trend.startsWith('+'),
            isNeutral: metrics.avgSessionDuration.trend === '0%'
          }
        };
      case 'bounce-rate':
        return {
          ...kpi,
          value: `${(metrics.bounceRate.current * 100).toFixed(1)}%`,
          trend: {
            value: metrics.bounceRate.trend,
            // For bounce rate, negative trend is positive (lower bounce rate is better)
            isPositive: metrics.bounceRate.trend.startsWith('-'),
            isNeutral: metrics.bounceRate.trend === '0%'
          }
        };
      default:
        return kpi;
    }
  }).slice(0, 4) : enhancedGA4KPIs.slice(0, 4); // Show only top 4 KPIs

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Website Analytics</h1>
              <p className="text-muted-foreground">
                Traffic performance and user engagement insights
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <DateRangePicker
              value={dateRange}
              onChange={(range) => range && setDateRange(range)}
            />
            <ExportChartDataButton
              onExport={handleExportChartData}
              disabled={!overviewData?.series?.traffic || overviewLoading}
              className="text-sm"
            />
            <Button 
              onClick={handleRefresh}
              disabled={overviewLoading || manualLoading}
              size="sm"
              variant="outline"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${(overviewLoading || manualLoading) ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>
      </div>

      {/* KPIs Section */}
      <AnalyticsKPIs 
        kpis={mappedKPIs}
        loading={dataLoading || overviewLoading || manualLoading}
        title="Website Performance Metrics"
        description="Essential insights from your website traffic and user behavior"
      />

      {/* Analytics Insights Section */}
      <div className="rounded-lg border bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-6">
        <h3 className="text-lg font-semibold mb-4">Traffic Insights</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Top Pages */}
          <div>
            <h4 className="font-medium text-sm text-muted-foreground mb-3">Top Pages</h4>
            <div className="space-y-2">
              {ga4Data?.insights.topPages.slice(0, 3).map((page, index) => (
                <div key={index} className="flex justify-between items-center text-sm">
                  <span className="font-medium truncate flex-1">{page.path}</span>
                  <span className="text-muted-foreground ml-2">{page.pageviews.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
          
          {/* Top Sources */}
          <div>
            <h4 className="font-medium text-sm text-muted-foreground mb-3">Top Sources</h4>
            <div className="space-y-2">
              {ga4Data?.insights.topSources.slice(0, 3).map((source, index) => (
                <div key={index} className="flex justify-between items-center text-sm">
                  <span className="font-medium capitalize">{source.source}</span>
                  <span className="text-muted-foreground">{source.sessions.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Summary Stats */}
          <div>
            <h4 className="font-medium text-sm text-muted-foreground mb-3">Summary</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Total Pages:</span>
                <span className="font-medium">{ga4Data?.insights.totalPages || 0}</span>
              </div>
              <div className="flex justify-between">
                <span>Traffic Sources:</span>
                <span className="font-medium">{ga4Data?.insights.totalSources || 0}</span>
              </div>
              <div className="flex justify-between">
                <span>Data Source:</span>
                <span className="font-medium">
                  {ga4Data?.insights.isUsingRealData ? 'Live GA4' : 'Mock Data'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <DashboardSection
        title="Analytics"
        description="Visual insights and traffic performance metrics"
        icon={BarChart3}
      >
        <GA4Charts
          data={overviewData || {
            series: { 
              ga: [],
              search: [],
              chatbot: [],
              funnel: []
            },
            kpis: {},
            top: { pages: [], sources: [] },
            __mock: true
          }}
          loading={!overviewData || overviewLoading || manualLoading}
        />
      </DashboardSection>

      {error && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
          <p className="text-destructive text-sm">{error}</p>
        </div>
      )}
    </div>
  );
}