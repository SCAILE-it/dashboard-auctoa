import { BarChart3 } from "lucide-react";
import { KPICard, DashboardSection, KPIGrid } from "@/components/dashboard";
import { sampleKPIData } from "@/lib/sample-data";

export default function AnalyticsPage() {
  const analyticsKPIs = sampleKPIData.filter(kpi => kpi.source === 'ga4');

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-gray-900">Website Analytics</h2>
        <p className="text-gray-600">Detailed Google Analytics 4 performance metrics</p>
      </div>

      <DashboardSection 
        title="Traffic & Engagement" 
        description="User behavior and website performance"
        icon={BarChart3}
      >
        <KPIGrid columns={2}>
          {analyticsKPIs.map((kpi) => (
            <KPICard 
              key={kpi.id}
              title={kpi.title}
              value={kpi.value}
              icon={kpi.icon}
              trend={kpi.trend}
            />
          ))}
        </KPIGrid>
      </DashboardSection>

      {/* Placeholder for charts */}
      <div className="bg-white rounded-lg border p-8 text-center">
        <p className="text-gray-500">Charts and detailed analytics will be added here</p>
        <p className="text-sm text-gray-400 mt-2">Connect to Supabase data next</p>
      </div>
    </div>
  );
}