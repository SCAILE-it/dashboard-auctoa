import { MessageSquare } from "lucide-react";
import { KPICard, DashboardSection, KPIGrid } from "@/components/dashboard";
import { sampleKPIData } from "@/lib/sample-data";

export default function ChatbotPage() {
  const chatbotKPIs = sampleKPIData.filter(kpi => kpi.source === 'chatbot');

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-gray-900">Chatbot Analytics</h2>
        <p className="text-gray-600">AI conversation metrics and lead generation performance</p>
      </div>

      <DashboardSection 
        title="Conversation Metrics" 
        description="Chatbot engagement and conversion tracking"
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
            />
          ))}
        </KPIGrid>
      </DashboardSection>

      {/* Placeholder for conversation analytics */}
      <div className="bg-white rounded-lg border p-8 text-center">
        <p className="text-gray-500">Conversation flows, lead quality analysis, and response times will be shown here</p>
        <p className="text-sm text-gray-400 mt-2">Connect to chatbot data from Supabase</p>
      </div>
    </div>
  );
}