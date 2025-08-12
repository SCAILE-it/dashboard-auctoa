import { Settings } from "lucide-react";
import { DashboardSection } from "@/components/dashboard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function SettingsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-gray-900">Settings</h2>
        <p className="text-gray-600">Configure your analytics dashboard and data sources</p>
      </div>

      <DashboardSection 
        title="Data Sources" 
        description="Configure API connections and data refresh settings"
        icon={Settings}
      >
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="supabase-url">Supabase URL</Label>
              <Input id="supabase-url" placeholder="https://your-project.supabase.co" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="supabase-key">Supabase API Key</Label>
              <Input id="supabase-key" type="password" placeholder="Your anon key" />
            </div>
          </div>
          <Button>Save Configuration</Button>
        </div>
      </DashboardSection>

      <DashboardSection 
        title="Refresh Settings" 
        description="Control how often data is updated"
        icon={Settings}
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">Data refresh intervals and notification preferences will be configured here</p>
          <Button variant="outline">Configure Refresh Schedule</Button>
        </div>
      </DashboardSection>
    </div>
  );
}