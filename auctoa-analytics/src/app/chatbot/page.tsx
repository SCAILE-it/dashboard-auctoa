"use client";

import { useState } from "react";
import { MessageSquare, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { KPICard, DashboardSection, KPIGrid } from "@/components/dashboard";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { enhancedChatbotKPIs } from "@/lib/auctoa-data";
import { useAuctoaData } from "@/lib/hooks/useAuctoaData";
import { useAnalyticsState } from "@/lib/hooks/useAnalyticsState";


export default function ChatbotPage() {
  const [manualLoading, setManualLoading] = useState(false);
  
  // Analytics state management with URL persistence
  const { dateRange, setDateRange } = useAnalyticsState();
  
  // Fetch data with current date range
  const { data: auctoaData, loading: dataLoading, error, refetch } = useAuctoaData(dateRange);

  const handleRefresh = () => {
    setManualLoading(true);
    refetch().finally(() => setManualLoading(false));
  };

  const loading = dataLoading || manualLoading;

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
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Chatbot Analytics</h2>
            <p className="text-gray-600 dark:text-gray-400">AI conversation metrics and lead generation performance</p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={handleRefresh}
              variant="outline"
              size="sm"
              disabled={loading}
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              {loading ? "Refreshing..." : "Refresh Data"}
            </Button>
          </div>
        </div>

        {/* Date Controls - Simple & Clean */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 bg-card rounded-lg border shadow-sm">
          <DateRangePicker
            value={dateRange}
            onChange={(range) => range && setDateRange(range)}
          />
          
          {/* Summary info */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground sm:ml-auto">
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
      <DashboardSection 
        title="Conversation Metrics" 
        description="Chatbot engagement and conversion tracking"
        icon={MessageSquare}
      >
        <KPIGrid columns={4}>
          {chatbotKPIs.map((kpi) => (
            <KPICard 
              key={kpi.id}
              title={kpi.title}
              value={kpi.value}
              icon={kpi.icon}
              trend={kpi.trend}
              loading={loading}
            />
          ))}
        </KPIGrid>
      </DashboardSection>

      {/* Charts Section - Visual Analytics */}
      <DashboardSection 
        title="Conversation Trends" 
        description="Visual overview of chatbot performance over time"
        icon={MessageSquare}
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Main Conversation Chart */}
          <div className="lg:col-span-2">
            <div className="bg-card rounded-lg border p-6 h-[400px] flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <div className="w-16 h-16 bg-muted rounded-lg mx-auto mb-3 flex items-center justify-center">
                  📊
                </div>
                <h3 className="font-medium mb-1">Conversation Volume Chart</h3>
                <p className="text-sm">Coming next: Time series visualization of daily/weekly conversations</p>
              </div>
            </div>
          </div>
          
          {/* Response Time Chart */}
          <div className="bg-card rounded-lg border p-6 h-[300px] flex items-center justify-center">
            <div className="text-center text-muted-foreground">
              <div className="w-12 h-12 bg-muted rounded-lg mx-auto mb-2 flex items-center justify-center">
                ⏱️
              </div>
              <h3 className="font-medium mb-1">Response Time</h3>
              <p className="text-sm">Average response time trends</p>
            </div>
          </div>
          
          {/* Conversion Funnel Chart */}
          <div className="bg-card rounded-lg border p-6 h-[300px] flex items-center justify-center">
            <div className="text-center text-muted-foreground">
              <div className="w-12 h-12 bg-muted rounded-lg mx-auto mb-2 flex items-center justify-center">
                🔄
              </div>
              <h3 className="font-medium mb-1">Conversion Funnel</h3>
              <p className="text-sm">Lead generation funnel</p>
            </div>
          </div>
        </div>
      </DashboardSection>

      {/* Real-time Data Status */}
      <DashboardSection 
        title="Live Chatbot Data" 
        description="Real-time conversation data from Auctoa's Supabase database"
        icon={MessageSquare}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Connection Status */}
          <div className="bg-white dark:bg-gray-900 rounded-lg border p-6">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Database Status</h3>
            {auctoaData ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Connection</span>
                  <span className="text-sm text-green-600 dark:text-green-400">🟢 Connected</span>
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  <p>Total Messages: <strong>{auctoaData.insights?.totalMessages || 0}</strong></p>
                  <p>Human Messages: <strong>{auctoaData.insights?.humanMessages || 0}</strong></p>
                  <p>AI Responses: <strong>{auctoaData.insights?.aiMessages || 0}</strong></p>
                  <p className="text-xs mt-2">Last updated: {new Date(auctoaData.lastUpdated).toLocaleString()}</p>
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-500">
                {loading ? 'Connecting to Supabase...' : 'Unable to connect to database'}
              </div>
            )}
          </div>

          {/* Geographic Insights */}
          <div className="bg-white dark:bg-gray-900 rounded-lg border p-6">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Geographic Activity</h3>
            {auctoaData?.insights ? (
              <div className="space-y-3">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  <p className="font-medium mb-2">Top German Cities:</p>
                  {auctoaData.insights.topCities.length > 0 ? (
                    <ul className="space-y-1">
                      {auctoaData.insights.topCities.map((city, index) => (
                        <li key={city} className="flex items-center justify-between">
                          <span>#{index + 1} {city}</span>
                          <span className="text-xs text-green-600">🏠</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-500 text-xs">No city data available</p>
                  )}
                </div>
                <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-xs text-gray-500">
                    Completed Properties: <strong>{auctoaData.insights.completedProperties}</strong>
                  </p>
                  <p className="text-xs text-gray-500">
                    In Progress: <strong>{auctoaData.insights.inProgressProperties}</strong>
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-500">
                {loading ? 'Loading insights...' : 'No geographic data available'}
              </div>
            )}
          </div>
        </div>
      </DashboardSection>
    </div>
  );
}