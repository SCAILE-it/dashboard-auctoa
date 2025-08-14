// Google Search Console KPI definitions and enhanced metrics

import { TrendingUp, MousePointer, Eye, Target } from "lucide-react";

export interface EnhancedKPI {
  id: string;
  title: string;
  description: string;
  icon: any;
  value: string;
  trend: {
    value: string;
    isPositive: boolean;
    isNeutral: boolean;
  };
  category: 'visibility' | 'engagement' | 'performance' | 'conversion';
}

export const enhancedGSCKPIs: EnhancedKPI[] = [
  {
    id: 'total-clicks',
    title: 'Total Clicks',
    description: 'Users who clicked through to your website from search results',
    icon: MousePointer,
    value: '0',
    trend: { value: '0%', isPositive: false, isNeutral: true },
    category: 'engagement'
  },
  {
    id: 'total-impressions',
    title: 'Search Impressions',
    description: 'How often your website appeared in search results',
    icon: Eye,
    value: '0',
    trend: { value: '0%', isPositive: false, isNeutral: true },
    category: 'visibility'
  },
  {
    id: 'click-through-rate',
    title: 'Click-Through Rate',
    description: 'Percentage of impressions that resulted in clicks',
    icon: Target,
    value: '0%',
    trend: { value: '0%', isPositive: false, isNeutral: true },
    category: 'performance'
  },
  {
    id: 'average-position',
    title: 'Average Position',
    description: 'Average ranking position in search results',
    icon: TrendingUp,
    value: '0',
    trend: { value: '0%', isPositive: false, isNeutral: true },
    category: 'performance'
  }
];