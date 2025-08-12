import { 
  Users, 
  Eye, 
  MessageSquare, 
  Target,
  MousePointer,
  TrendingUp,
  Clock,
  BarChart3
} from "lucide-react";
import { KPIData, DashboardMetrics } from "@/types/dashboard";

export const sampleKPIData: KPIData[] = [
  {
    id: "total-visits",
    title: "Total Visits",
    value: "12,345",
    icon: Users,
    trend: {
      value: 12,
      isPositive: true
    },
    source: "ga4"
  },
  {
    id: "bounce-rate", 
    title: "Bounce Rate",
    value: "23.4%",
    icon: Eye,
    trend: {
      value: -5,
      isPositive: false
    },
    source: "ga4"
  },
  {
    id: "avg-session",
    title: "Avg. Session",
    value: "2m 45s", 
    icon: Clock,
    trend: {
      value: "+3%",
      isPositive: true
    },
    source: "ga4"
  },
  {
    id: "conversions",
    title: "Conversions",
    value: "456",
    icon: Target,
    trend: {
      value: 18,
      isPositive: true
    },
    source: "chatbot"
  },
  {
    id: "click-through-rate",
    title: "CTR (GSC)",
    value: "3.8%",
    icon: MousePointer,
    trend: {
      value: "+0.5%",
      isPositive: true
    },
    source: "gsc"
  },
  {
    id: "search-impressions",
    title: "Search Impressions",
    value: "45.2K",
    icon: BarChart3,
    trend: {
      value: "+8%",
      isPositive: true
    },
    source: "gsc"
  },
  {
    id: "chatbot-conversations",
    title: "Chat Conversations",
    value: "1,234",
    icon: MessageSquare,
    trend: {
      value: "+15%",
      isPositive: true
    },
    source: "chatbot"
  },
  {
    id: "lead-conversion",
    title: "Lead Conversion",
    value: "8.7%",
    icon: TrendingUp,
    trend: {
      value: "+2.1%",
      isPositive: true
    },
    source: "chatbot"
  }
];

export const sampleMetrics: DashboardMetrics = {
  // Google Search Console
  totalClicks: 12345,
  totalImpressions: 452000,
  avgCTR: 3.8,
  avgPosition: 12.4,
  
  // Google Analytics 4
  totalUsers: 8950,
  totalSessions: 12345,
  bounceRate: 23.4,
  avgSessionDuration: "2m 45s",
  
  // Chatbot Analytics  
  totalConversations: 1234,
  conversionRate: 8.7,
  avgSatisfaction: 4.2,
  
  // Computed metrics
  totalConversions: 456
};