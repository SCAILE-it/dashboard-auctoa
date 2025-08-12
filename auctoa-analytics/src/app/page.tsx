"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  BarChart3,
  LineChart,
  MessageSquare,
  Activity
} from "lucide-react";

// Import our dashboard components
import { 
  KPICard, 
  DashboardSection, 
  KPIGrid
} from "@/components/dashboard";
import { sampleKPIData } from "@/lib/sample-data";

export default function DashboardOverview() {
  const [loading, setLoading] = useState(false);

  const simulateLoading = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 2000);
  };

  // Split KPIs by source for organized display
  const analyticsKPIs = sampleKPIData.filter(kpi => kpi.source === 'ga4');
  const searchKPIs = sampleKPIData.filter(kpi => kpi.source === 'gsc');
  const chatbotKPIs = sampleKPIData.filter(kpi => kpi.source === 'chatbot');

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div className="flex justify-between items-center">
        <div>
                     <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Analytics Overview</h2>
           <p className="text-gray-600 dark:text-gray-400">Your complete business performance at a glance</p>
        </div>
        <Button
          onClick={simulateLoading}
          variant="outline"
          disabled={loading}
        >
          {loading ? "Refreshing..." : "Refresh Data"}
        </Button>
      </div>

      {/* Analytics Overview */}
      <DashboardSection 
        title="Website Analytics" 
        description="Google Analytics 4 performance metrics"
        icon={BarChart3}
      >
        <KPIGrid columns={4}>
          {analyticsKPIs.map((kpi) => (
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

      {/* Search Console */}
      <DashboardSection 
        title="Search Performance" 
        description="Google Search Console insights"
        icon={LineChart}
      >
        <KPIGrid columns={2}>
          {searchKPIs.map((kpi) => (
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

      {/* Chatbot Analytics */}
      <DashboardSection 
        title="Chatbot Performance" 
        description="AI conversation analytics and lead generation"
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
    </div>
  );
}