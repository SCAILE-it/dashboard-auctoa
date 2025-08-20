"use client";

import { useState } from "react";
import { BarChart3, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

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
                  • Trends vs previous period
                </span>
              </div>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
            <DateRangePicker
              value={dateRange}
              onChange={(range) => range && setDateRange(range)}
            />
            <div className="flex gap-2">
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
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm">
        <div className="p-6 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Traffic Insights</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Performance breakdown and top content</p>
            </div>
            <div className="flex items-center text-xs text-emerald-600 dark:text-emerald-400">
              <div className="w-2 h-2 bg-emerald-500 rounded-full mr-2 animate-pulse"></div>
              {ga4Data?.insights.isUsingRealData ? 'Live Data' : 'Demo Mode'}
            </div>
          </div>
        </div>
        
        <div className="p-4 sm:p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {/* Top Pages */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-gray-900 dark:text-white text-sm">Top Pages</h4>
                <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full">
                  {ga4Data?.insights.totalPages || 0} total
                </span>
              </div>
              <div className="space-y-3">
                {ga4Data?.insights.topPages.slice(0, 3).map((page, index) => (
                  <div key={index} className="group hover:bg-gray-50 dark:hover:bg-gray-800 p-3 rounded-lg transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3 min-w-0 flex-1">
                        <div className="flex items-center justify-center w-6 h-6 text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 rounded-full flex-shrink-0">
                          {index + 1}
                        </div>
                        <span className="font-medium text-gray-900 dark:text-white truncate text-sm" title={page.path}>
                          {page.path === '/' ? 'Homepage' : page.path}
                        </span>
                      </div>
                      <div className="text-right ml-4 flex-shrink-0">
                        <div className="text-sm font-semibold text-gray-900 dark:text-white">
                          {page.pageviews.toLocaleString()}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">views</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Top Sources */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-gray-900 dark:text-white text-sm">Top Sources</h4>
                <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full">
                  {ga4Data?.insights.totalSources || 0} sources
                </span>
              </div>
              <div className="space-y-3">
                {ga4Data?.insights.topSources.slice(0, 3).map((source, index) => (
                  <div key={index} className="group hover:bg-gray-50 dark:hover:bg-gray-800 p-3 rounded-lg transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3 min-w-0 flex-1">
                        <div className="flex items-center justify-center w-6 h-6 text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 rounded-full flex-shrink-0">
                          {index + 1}
                        </div>
                        <span className="font-medium text-gray-900 dark:text-white capitalize text-sm">
                          {source.source}
                        </span>
                      </div>
                      <div className="text-right ml-4 flex-shrink-0">
                        <div className="text-sm font-semibold text-gray-900 dark:text-white">
                          {source.sessions.toLocaleString()}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">sessions</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Summary Stats */}
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900 dark:text-white text-sm">Quick Summary</h4>
              <div className="space-y-4">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-blue-900 dark:text-blue-100">Total Pages</span>
                    <span className="text-lg font-bold text-blue-900 dark:text-blue-100">{ga4Data?.insights.totalPages || 0}</span>
                  </div>
                </div>
                <div className="bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 p-4 rounded-lg border border-emerald-200 dark:border-emerald-800">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-emerald-900 dark:text-emerald-100">Traffic Sources</span>
                    <span className="text-lg font-bold text-emerald-900 dark:text-emerald-100">{ga4Data?.insights.totalSources || 0}</span>
                  </div>
                </div>
                <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 p-4 rounded-lg border border-amber-200 dark:border-amber-800">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-amber-900 dark:text-amber-100">Data Source</span>
                    <span className="text-sm font-semibold text-amber-900 dark:text-amber-100">
                      {ga4Data?.insights.isUsingRealData ? 'Live GA4' : 'Demo'}
                    </span>
                  </div>
                </div>
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