"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  BarChart3,
  MessageSquare,
  Activity
} from "lucide-react";

// Import our dashboard components
import { 
  KPICard, 
  DashboardSection, 
  KPIGrid
} from "@/components/dashboard";
import { auctoaKPIData } from "@/lib/auctoa-data";
import { useAuctoaData } from "@/lib/hooks/useAuctoaData";


export default function DashboardOverview() {
  const { data: auctoaData, loading: dataLoading, error, refetch } = useAuctoaData();
  const [manualLoading, setManualLoading] = useState(false);

  const handleRefresh = () => {
    setManualLoading(true);
    refetch().finally(() => setManualLoading(false));
  };

  const loading = dataLoading || manualLoading;

  // Split KPIs by source for organized display - using Auctoa data
  const chatbotKPIs = auctoaKPIData.filter(kpi => kpi.source === 'chatbot');
  const propertyKPIs = auctoaKPIData.filter(kpi => kpi.source === 'property');

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div className="flex justify-between items-center">
        <div>
                     <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Analytics Overview</h2>
           <p className="text-gray-600 dark:text-gray-400">Your complete business performance at a glance</p>
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

      {/* AI Chatbot Performance */}
      <DashboardSection 
        title="AI Assistant Performance" 
        description="Real estate chatbot conversations and lead generation"
        icon={MessageSquare}
      >
        <KPIGrid columns={3}>
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

      <Separator />

      {/* Property Assessment Performance */}
      <DashboardSection 
        title="Property Assessments" 
        description="Real estate valuations and inheritance planning analytics"
        icon={BarChart3}
      >
        <KPIGrid columns={3}>
          {propertyKPIs.map((kpi) => (
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

      <Separator />

      {/* Real-time Data Status */}
      <DashboardSection 
        title="Live Data Connection" 
        description="Real-time metrics from Auctoa's Supabase database"
        icon={Activity}
      >
        <div className="bg-white dark:bg-gray-900 rounded-lg border p-6">
          {auctoaData ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Database Status</span>
                <span className="text-sm text-green-600 dark:text-green-400">🟢 Connected</span>
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                <p>Total Conversations: <strong>{auctoaData.rawData.chatCount}</strong></p>
                <p>Form Responses: <strong>{auctoaData.rawData.formCount}</strong></p>
                <p>Property Requests: <strong>{auctoaData.rawData.propertyCount}</strong></p>
                <p className="text-xs mt-2">Last updated: {new Date(auctoaData.lastUpdated).toLocaleString()}</p>
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-500">
              {loading ? 'Connecting to Supabase...' : 'Unable to connect to database'}
            </div>
          )}
        </div>
      </DashboardSection>
    </div>
  );
}