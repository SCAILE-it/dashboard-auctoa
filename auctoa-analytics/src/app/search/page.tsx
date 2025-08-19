"use client";

import { useState } from "react";
import { Search, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

import { DashboardSection } from "@/components/dashboard";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { GSCCharts } from "@/components/charts/GSCCharts";
import { AnalyticsKPIs } from "@/components/analytics/AnalyticsKPIs";
import { enhancedGSCKPIs } from "@/lib/gsc-data";
import { useGSCData } from "@/lib/hooks/useGSCData";
import { useOverviewData } from "@/lib/hooks/useOverviewData";
import { useAnalyticsState } from "@/lib/hooks/useAnalyticsState";
import { ExportChartDataButton } from "@/components/ui/export-button";
import { exportTimeSeriesToCSV } from "@/lib/csv-export";

export default function SearchPage() {
  const [manualLoading, setManualLoading] = useState(false);
  
  // Analytics state management with URL persistence
  const { dateRange, setDateRange } = useAnalyticsState();
  
  // Fetch data with current date range
  const { data: gscData, loading: dataLoading, error, refetch } = useGSCData(dateRange);
  
  // Fetch overview data for charts
  const { data: overviewData, loading: overviewLoading, refetch: refetchOverview } = useOverviewData(dateRange);

  const handleRefresh = () => {
    setManualLoading(true);
    Promise.all([refetch(), refetchOverview()]).finally(() => setManualLoading(false));
  };

  const loading = dataLoading || manualLoading;

  // Export functions
  const handleExportChartData = async () => {
    if (!overviewData?.series?.search) {
      throw new Error('No GSC chart data available for export');
    }
    
    exportTimeSeriesToCSV(
      overviewData.series.search,
      'GSC Search Performance',
      {
        from: dateRange.from.toISOString().split('T')[0],
        to: dateRange.to.toISOString().split('T')[0]
      },
      { filename: 'gsc_search_data' }
    );
  };

  // Get enhanced GSC KPIs with real data mapping
  const searchKPIs = enhancedGSCKPIs.map(kpi => {
    if (!gscData?.metrics) return kpi;

    // Map real data to enhanced KPI structure
    switch (kpi.id) {
      case 'total-clicks':
        return {
          ...kpi,
          value: gscData.metrics.totalClicks.current.toLocaleString(),
          trend: {
            value: gscData.metrics.totalClicks.trend,
            isPositive: parseFloat(gscData.metrics.totalClicks.trend) >= 0,
            isNeutral: false
          }
        };
      case 'total-impressions':
        return {
          ...kpi,
          value: gscData.metrics.totalImpressions.current.toLocaleString(),
          trend: {
            value: gscData.metrics.totalImpressions.trend,
            isPositive: parseFloat(gscData.metrics.totalImpressions.trend) >= 0,
            isNeutral: false
          }
        };
      case 'click-through-rate':
        return {
          ...kpi,
          value: gscData.metrics.averageCTR.current,
          trend: {
            value: gscData.metrics.averageCTR.trend,
            isPositive: parseFloat(gscData.metrics.averageCTR.trend) >= 0,
            isNeutral: false
          }
        };
      case 'average-position':
        return {
          ...kpi,
          value: `#${gscData.metrics.averagePosition.current.toFixed(1)}`,
          trend: {
            value: gscData.metrics.averagePosition.trend,
            // For position, negative trend is positive (lower position = better)
            isPositive: parseFloat(gscData.metrics.averagePosition.trend) <= 0,
            isNeutral: false
          }
        };
      default:
        return kpi;
    }
  });

  return (
    <div className="space-y-8">
      {/* Page header with controls */}
      <div className="space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="min-w-0 flex-1">
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">Search Performance</h2>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">Google Search Console insights and rankings</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 flex-shrink-0">
            <ExportChartDataButton
              onExport={handleExportChartData}
              disabled={!overviewData?.series?.search || overviewLoading}
              className="text-sm flex-1 sm:flex-none"
            />
            <Button
              onClick={handleRefresh}
              variant="outline"
              size="sm"
              disabled={loading}
              className="flex-1 sm:flex-none"
            >
              <RefreshCw className={`h-4 w-4 sm:mr-2 ${loading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">{loading ? "Refreshing..." : "Refresh Data"}</span>
              <span className="sm:hidden">{loading ? "..." : "Refresh"}</span>
            </Button>
          </div>
        </div>

        {/* Date Controls - Simple & Clean */}
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

        {/* Error display */}
        {error && (
          <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg border border-red-200 dark:border-red-800">
            <strong>Error:</strong> {error}
          </div>
        )}
      </div>

      {/* KPIs Section */}
      <AnalyticsKPIs 
        kpis={searchKPIs}
        loading={loading}
      />

      {/* Charts Section */}
      <DashboardSection 
        title="Analytics" 
        description="Search performance metrics and trends"
        icon={Search}
      >
        {overviewData ? (
          <GSCCharts 
            data={overviewData} 
            loading={overviewLoading || manualLoading}
          />
        ) : (
          <div className="bg-card rounded-lg border p-12 flex items-center justify-center">
            <div className="text-center text-muted-foreground">
              <div className="w-16 h-16 bg-muted rounded-lg mx-auto mb-4 flex items-center justify-center">
                🔍
              </div>
              <h3 className="font-medium mb-2">Loading Search Analytics...</h3>
              <p className="text-sm">Fetching Google Search Console data</p>
            </div>
          </div>
        )}
      </DashboardSection>

      {/* Search Insights Section */}
      {gscData?.insights && (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-6 border border-green-200 dark:border-green-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Search Insights</h3>
            <span className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
              <div className="w-2 h-2 bg-green-600 dark:bg-green-400 rounded-full animate-pulse" />
              Live
            </span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Top Queries */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Top Search Queries</h4>
              <div className="space-y-2">
                {gscData.insights.topQueries.slice(0, 5).map((query, index) => (
                  <div key={query} className="flex items-center justify-between p-2 bg-white dark:bg-gray-800 rounded-lg border text-sm">
                    <span className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">#{index + 1}</span>
                      <span className="font-medium">{query}</span>
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Performance Overview</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-white dark:bg-gray-800 rounded-lg border">
                  <div className="text-lg font-bold text-gray-900 dark:text-white">{gscData.insights.totalQueries}</div>
                  <div className="text-xs text-gray-500">Total Queries</div>
                </div>
                <div className="text-center p-3 bg-white dark:bg-gray-800 rounded-lg border">
                  <div className="text-lg font-bold text-gray-900 dark:text-white">{gscData.insights.improvementOpportunities}</div>
                  <div className="text-xs text-gray-500">Opportunities</div>
                </div>
              </div>
              {gscData.insights.bestPerformingQuery && (
                <div className="p-3 bg-white dark:bg-gray-800 rounded-lg border">
                  <div className="text-xs text-gray-500 mb-1">Best Performing Query</div>
                  <div className="font-medium text-green-600">{gscData.insights.bestPerformingQuery}</div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}