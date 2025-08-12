import { LineChart } from "lucide-react";
import { KPICard, DashboardSection, KPIGrid } from "@/components/dashboard";
import { sampleKPIData } from "@/lib/sample-data";

export default function SearchPage() {
  const searchKPIs = sampleKPIData.filter(kpi => kpi.source === 'gsc');

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-gray-900">Search Performance</h2>
        <p className="text-gray-600">Google Search Console insights and rankings</p>
      </div>

      <DashboardSection 
        title="Search Metrics" 
        description="Search visibility and click performance"
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
            />
          ))}
        </KPIGrid>
      </DashboardSection>

      {/* Placeholder for search analytics */}
      <div className="bg-white rounded-lg border p-8 text-center">
        <p className="text-gray-500">Search analytics charts and keyword rankings will be displayed here</p>
        <p className="text-sm text-gray-400 mt-2">Connect to Google Search Console data</p>
      </div>
    </div>
  );
}