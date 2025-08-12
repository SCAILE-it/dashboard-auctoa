"use client";

import { useState } from "react";
import { MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { KPICard, DashboardSection, KPIGrid } from "@/components/dashboard";
import { enhancedChatbotKPIs } from "@/lib/auctoa-data";
import { useAuctoaData } from "@/lib/hooks/useAuctoaData";


export default function ChatbotPage() {
  const { data: auctoaData, loading: dataLoading, error, refetch } = useAuctoaData();
  const [manualLoading, setManualLoading] = useState(false);

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
            value: `${auctoaData.metrics.totalConversations.trend}%`,
            isPositive: parseFloat(auctoaData.metrics.totalConversations.trend) >= 0,
            isNeutral: false
          }
        };
      case 'avg-messages-per-session':
        return {
          ...kpi,
          value: auctoaData.metrics.avgMessagesPerSession.current,
          trend: {
            value: `${auctoaData.metrics.avgMessagesPerSession.trend}%`,
            isPositive: parseFloat(auctoaData.metrics.avgMessagesPerSession.trend) >= 0,
            isNeutral: false
          }
        };
      case 'user-engagement':
        return {
          ...kpi,
          value: `${auctoaData.metrics.userEngagement.current}%`,
          trend: {
            value: `${auctoaData.metrics.userEngagement.trend}%`,
            isPositive: parseFloat(auctoaData.metrics.userEngagement.trend) >= 0,
            isNeutral: false
          }
        };
      case 'chat-to-form-conversion':
        return {
          ...kpi,
          value: `${auctoaData.metrics.chatToFormConversion.current}%`,
          trend: {
            value: `${auctoaData.metrics.chatToFormConversion.trend}%`,
            isPositive: parseFloat(auctoaData.metrics.chatToFormConversion.trend) >= 0,
            isNeutral: false
          }
        };
      case 'property-requests':
        return {
          ...kpi,
          value: auctoaData.metrics.propertyRequests.current.toString(),
          trend: {
            value: `${auctoaData.metrics.propertyRequests.trend}%`,
            isPositive: parseFloat(auctoaData.metrics.propertyRequests.trend) >= 0,
            isNeutral: false
          }
        };
      case 'completion-rate':
        return {
          ...kpi,
          value: `${auctoaData.metrics.propertyCompletionRate.current}%`,
          trend: {
            value: `${auctoaData.metrics.propertyCompletionRate.trend}%`,
            isPositive: parseFloat(auctoaData.metrics.propertyCompletionRate.trend) >= 0,
            isNeutral: false
          }
        };
      case 'active-cities':
        return {
          ...kpi,
          value: auctoaData.metrics.activeCities.current.toString(),
          trend: {
            value: `${auctoaData.metrics.activeCities.trend}%`,
            isPositive: parseFloat(auctoaData.metrics.activeCities.trend) >= 0,
            isNeutral: false
          }
        };
      case 'weekly-activity':
        return {
          ...kpi,
          value: `${auctoaData.metrics.weeklyActivity.current}%`,
          trend: {
            value: `${auctoaData.metrics.weeklyActivity.trend}%`,
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
      {/* Page header with refresh button */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Chatbot Analytics</h2>
          <p className="text-gray-600 dark:text-gray-400">AI conversation metrics and lead generation performance</p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={handleRefresh}
            variant="outline"
            disabled={loading}
          >
            {loading ? "Refreshing..." : "Refresh Data"}
          </Button>
          {error && (
            <div className="text-sm text-red-600 dark:text-red-400 flex items-center">
              Error: {error}
            </div>
          )}
        </div>
      </div>

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