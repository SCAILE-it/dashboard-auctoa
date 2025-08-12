"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Moon, 
  Sun, 
  Activity,
  BarChart3,
  LineChart,
  MessageSquare
} from "lucide-react";

// Import our new dashboard components
import { 
  KPICard, 
  DashboardSection, 
  KPIGrid
} from "@/components/dashboard";
import { sampleKPIData } from "@/lib/sample-data";

export default function DashboardDemo() {
  const [isDark, setIsDark] = useState(false);
  const [loading, setLoading] = useState(false);

  const toggleDarkMode = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle('dark');
  };

  const simulateLoading = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 2000);
  };

  // Split KPIs by source for organized display
  const analyticsKPIs = sampleKPIData.filter(kpi => kpi.source === 'ga4');
  const searchKPIs = sampleKPIData.filter(kpi => kpi.source === 'gsc');
  const chatbotKPIs = sampleKPIData.filter(kpi => kpi.source === 'chatbot');

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-150">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <header className="flex justify-between items-center mb-12">
          <div className="flex items-center gap-3">
            <Activity className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold text-primary">Auctoa Analytics Dashboard</h1>
            <Badge variant="secondary">v1.0.0</Badge>
          </div>
          <div className="flex items-center gap-3">
            <Button
              onClick={simulateLoading}
              variant="outline"
              size="sm"
              disabled={loading}
            >
              {loading ? "Loading..." : "Refresh Data"}
            </Button>
            <Button
              onClick={toggleDarkMode}
              variant="outline" 
              size="sm"
              className="flex items-center gap-2"
            >
              {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              {isDark ? 'Light' : 'Dark'} Mode
            </Button>
          </div>
        </header>

        {/* Analytics Overview */}
        <DashboardSection 
          title="Website Analytics" 
          description="Google Analytics 4 performance metrics"
          icon={BarChart3}
          className="mb-8"
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

        <Separator className="my-8" />

        {/* Search Console */}
        <DashboardSection 
          title="Search Performance" 
          description="Google Search Console insights"
          icon={LineChart}
          className="mb-8"
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

        <Separator className="my-8" />

        {/* Chatbot Analytics */}
        <DashboardSection 
          title="Chatbot Performance" 
          description="AI conversation analytics and lead generation"
          icon={MessageSquare}
          className="mb-8"
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

        <Separator className="my-8" />

        {/* All KPIs Combined */}
        <DashboardSection 
          title="Complete Overview" 
          description="All metrics from Google Search Console, Google Analytics, and Chatbot data"
          icon={Activity}
          headerAction={
            <Badge variant="outline">
              {sampleKPIData.length} KPIs
            </Badge>
          }
        >
          <KPIGrid columns={4}>
            {sampleKPIData.map((kpi) => (
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
    </div>
  );
}