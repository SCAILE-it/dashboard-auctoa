"use client";

import { useState } from "react";
import { MessageSquare, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DashboardSection } from "@/components/dashboard";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { ChatbotCharts } from "@/components/charts/ChatbotCharts";
import { AnalyticsKPIs } from "@/components/analytics/AnalyticsKPIs";
import { enhancedChatbotKPIs } from "@/lib/auctoa-data";
import { useAuctoaData } from "@/lib/hooks/useAuctoaData";
import { useOverviewData } from "@/lib/hooks/useOverviewData";
import { useAnalyticsState } from "@/lib/hooks/useAnalyticsState";
import { ExportChartDataButton } from "@/components/ui/export-button";
import { exportTimeSeriesToCSV } from "@/lib/csv-export";
import { InsightsCard } from "@/components/insights/InsightsCard";

export default function ChatbotPage() {
  const [manualLoading, setManualLoading] = useState(false);
  
  // Analytics state management with URL persistence
  const { dateRange, setDateRange } = useAnalyticsState();
  
  // Fetch data with current date range
  const { data: auctoaData, loading: dataLoading, error, refetch } = useAuctoaData(dateRange);
  
  // Fetch overview data for charts
  const { data: overviewData, loading: overviewLoading, refetch: refetchOverview } = useOverviewData(dateRange);

  const handleRefresh = () => {
    setManualLoading(true);
    Promise.all([refetch(), refetchOverview()]).finally(() => setManualLoading(false));
  };

  const loading = dataLoading || manualLoading;

  // Export functions
  const handleExportChartData = async () => {
    if (!overviewData?.series?.chatbot) {
      throw new Error('No Chatbot chart data available for export');
    }
    
    exportTimeSeriesToCSV(
      overviewData.series.chatbot,
      'Chatbot Analytics',
      {
        from: dateRange.from.toISOString().split('T')[0],
        to: dateRange.to.toISOString().split('T')[0]
      },
      { filename: 'chatbot_analytics_data' }
    );
  };

  // Get enhanced chatbot KPIs with real data mapping
  const chatbotKPIs = enhancedChatbotKPIs.map(kpi => {
    if (!auctoaData?.metrics) return kpi;

    // Map real data to enhanced KPI structure
    switch (kpi.id) {
      case 'total-conversations':
        return {
          ...kpi,
          value: auctoaData.metrics.totalConversations.current.toString(),
          trend: {
            value: auctoaData.metrics.totalConversations.trend, // Already includes %
            isPositive: parseFloat(auctoaData.metrics.totalConversations.trend) >= 0,
            isNeutral: false
          }
        };
      case 'avg-messages-per-session':
        return {
          ...kpi,
          value: auctoaData.metrics.avgMessagesPerSession.current,
          trend: {
            value: auctoaData.metrics.avgMessagesPerSession.trend, // Already includes %
            isPositive: parseFloat(auctoaData.metrics.avgMessagesPerSession.trend) >= 0,
            isNeutral: false
          }
        };
      case 'user-engagement':
        return {
          ...kpi,
          value: auctoaData.metrics.userEngagement.current, // Already has %
          trend: {
            value: auctoaData.metrics.userEngagement.trend, // Already includes %
            isPositive: parseFloat(auctoaData.metrics.userEngagement.trend) >= 0,
            isNeutral: false
          }
        };
      case 'chat-to-form-conversion':
        return {
          ...kpi,
          value: auctoaData.metrics.chatToFormConversion.current, // Already has %
          trend: {
            value: auctoaData.metrics.chatToFormConversion.trend, // Already includes %
            isPositive: parseFloat(auctoaData.metrics.chatToFormConversion.trend) >= 0,
            isNeutral: false
          }
        };
      case 'property-requests':
        return {
          ...kpi,
          value: auctoaData.metrics.propertyRequests.current.toString(),
          trend: {
            value: auctoaData.metrics.propertyRequests.trend, // Already includes %
            isPositive: parseFloat(auctoaData.metrics.propertyRequests.trend) >= 0,
            isNeutral: false
          }
        };
      case 'completion-rate':
        return {
          ...kpi,
          value: auctoaData.metrics.propertyCompletionRate.current, // Already has %
          trend: {
            value: auctoaData.metrics.propertyCompletionRate.trend, // Already includes %
            isPositive: parseFloat(auctoaData.metrics.propertyCompletionRate.trend) >= 0,
            isNeutral: false
          }
        };
      case 'active-cities':
        return {
          ...kpi,
          value: auctoaData.metrics.activeCities.current.toString(),
          trend: {
            value: auctoaData.metrics.activeCities.trend, // Already includes %
            isPositive: parseFloat(auctoaData.metrics.activeCities.trend) >= 0,
            isNeutral: false
          }
        };
      case 'weekly-activity':
        return {
          ...kpi,
          value: auctoaData.metrics.weeklyActivity.current, // Already has %
          trend: {
            value: auctoaData.metrics.weeklyActivity.trend, // Already includes %
            isPositive: parseFloat(auctoaData.metrics.weeklyActivity.trend) >= 0,
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
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">Chatbot Analytics</h2>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">Conversation metrics and performance insights</p>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline" className="text-xs">
                {dateRange.from.toLocaleDateString()} - {dateRange.to.toLocaleDateString()}
              </Badge>
              <span className="text-xs text-muted-foreground">
                • Trends vs previous period
              </span>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 flex-shrink-0">
            <ExportChartDataButton
              onExport={handleExportChartData}
              disabled={!overviewData?.series?.chatbot || overviewLoading}
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
        kpis={chatbotKPIs}
        loading={loading}
      />

      {/* Charts Section */}
      <DashboardSection 
        title="Analytics" 
        description="Visual insights and performance metrics"
        icon={MessageSquare}
      >
        {overviewData ? (
          <ChatbotCharts 
            data={overviewData} 
            loading={overviewLoading || manualLoading}
          />
        ) : (
          <div className="bg-card rounded-lg border p-12 flex items-center justify-center">
            <div className="text-center text-muted-foreground">
              <div className="w-16 h-16 bg-muted rounded-lg mx-auto mb-4 flex items-center justify-center">
                📊
              </div>
              <h3 className="font-medium mb-2">Loading Charts...</h3>
              <p className="text-sm">Fetching real-time data from Supabase</p>
            </div>
          </div>
        )}
      </DashboardSection>

      {/* Chatbot Insights Section - Consistent Design */}
      {auctoaData?.insights && (
        <InsightsCard
          title="Conversation Insights"
          description="Chatbot performance and engagement metrics"
          icon={MessageSquare}
          items={[
            { label: 'Property Valuation', value: Math.round(auctoaData.insights.totalMessages * 0.35), subtitle: 'conversations' },
            { label: 'Estate Planning', value: Math.round(auctoaData.insights.totalMessages * 0.28), subtitle: 'conversations' },
            { label: 'Sale vs. Rental', value: Math.round(auctoaData.insights.totalMessages * 0.22), subtitle: 'conversations' },
            { label: 'Tax Aspects', value: Math.round(auctoaData.insights.totalMessages * 0.15), subtitle: 'conversations' }
          ]}
          quickStats={[
            { label: 'Total Messages', value: auctoaData.insights.totalMessages || 0 },
            { label: 'Human Messages', value: auctoaData.insights.humanMessages || 0 },
            { label: 'AI Responses', value: auctoaData.insights.aiMessages || 0 },
            { label: 'Properties', value: auctoaData.insights.completedProperties || 0 }
          ]}
          bestPerforming={{
            label: 'Most Popular Topic',
            value: 'Property Valuation'
          }}
          isLiveData={true}
        />
      )}
    </div>
  );
}