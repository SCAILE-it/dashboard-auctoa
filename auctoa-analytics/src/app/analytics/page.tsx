"use client";

import { useState } from "react";
import { BarChart3, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { InsightsCard } from "@/components/insights/InsightsCard";

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
    <div className="space-y-6 lg:space-y-8">
      {/* Header */}
      <div className="flex flex-col space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold">Website Analytics</h1>
              <p className="text-sm sm:text-base text-muted-foreground">
                Traffic performance and user engagement insights
              </p>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className="text-xs">
                  {dateRange.from.toLocaleDateString()} - {dateRange.to.toLocaleDateString()}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  • Trends vs same period prior
                </span>
              </div>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 flex-shrink-0">
            <ExportChartDataButton
              onExport={handleExportChartData}
              disabled={!overviewData?.series?.traffic || overviewLoading}
              className="text-sm flex-1 sm:flex-none"
            />
            <Button 
              onClick={handleRefresh}
              disabled={overviewLoading || manualLoading}
              size="sm"
              variant="outline"
              className="flex-1 sm:flex-none"
            >
              <RefreshCw className={`w-4 h-4 sm:mr-2 ${(overviewLoading || manualLoading) ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </Button>
          </div>
        </div>

        {/* Date Controls - GSC Style */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-3 sm:p-4 bg-card rounded-lg border shadow-sm">
          <div className="flex-shrink-0">
            <DateRangePicker
              value={dateRange}
              onChange={(range) => range && setDateRange(range)}
            />
          </div>
          
          {/* Summary info */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-muted-foreground sm:ml-auto">
            <span>
              {Math.ceil((dateRange.to.getTime() - dateRange.from.getTime()) / (1000 * 60 * 60 * 24))} days selected
            </span>
            <span className="text-green-600 dark:text-green-400 flex items-center gap-1">
              <div className="w-2 h-2 bg-green-600 dark:bg-green-400 rounded-full" />
              Live data
            </span>
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

      {/* Traffic Insights Section - At the End */}
      {ga4Data?.insights && (
        <InsightsCard
          title="Traffic Insights"
          description="Performance breakdown and top content"
          icon={BarChart3}
          items={[
            ...(ga4Data.insights.topPages || []).map(page => ({
              label: page.path === '/' ? 'Homepage' : page.path,
              value: page.pageviews,
              subtitle: 'page'
            }))
          ]}
          quickStats={[
            { label: 'Total Pages', value: ga4Data.insights.totalPages || 0 },
            { label: 'Traffic Sources', value: ga4Data.insights.totalSources || 0 }
          ]}
          bestPerforming={
            ga4Data.insights.topPages?.[0] ? {
              label: 'Best Performing Page',
              value: ga4Data.insights.topPages[0].path === '/' ? 'Homepage' : ga4Data.insights.topPages[0].path
            } : undefined
          }
          isLiveData={ga4Data.insights.isUsingRealData}
        />
      )}

      {error && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
          <p className="text-destructive text-sm">{error}</p>
        </div>
      )}
    </div>
  );
}