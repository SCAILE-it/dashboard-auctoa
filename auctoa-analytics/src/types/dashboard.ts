import { LucideIcon } from "lucide-react";

export interface KPIData {
  id: string;
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: string | number;
    isPositive: boolean;
    isNeutral?: boolean;
  };
  source?: 'gsc' | 'ga4' | 'chatbot' | 'ads';
  loading?: boolean;
}

export interface DashboardMetrics {
  // Google Search Console
  totalClicks: number;
  totalImpressions: number;
  avgCTR: number;
  avgPosition: number;
  
  // Google Analytics 4
  totalUsers: number;
  totalSessions: number;
  bounceRate: number;
  avgSessionDuration: string;
  
  // Chatbot Analytics
  totalConversations: number;
  conversionRate: number;
  avgSatisfaction: number;
  
  // Computed metrics
  totalConversions: number;
}

export interface TrendData {
  period: 'day' | 'week' | 'month' | 'quarter';
  current: number;
  previous: number;
  change: number;
  changePercent: number;
}

export interface ChartDataPoint {
  date: string;
  value: number;
  label?: string;
}