// GA4-specific KPI definitions
import { KPIDefinition } from '@/types/analytics';
import { Users, MousePointerClick, Eye, Clock, TrendingDown } from 'lucide-react';

export const enhancedGA4KPIs: KPIDefinition[] = [
  {
    id: 'total-users',
    title: 'Total Users',
    description: 'Unique visitors to your website',
    icon: Users,
    value: '0',
    trend: { value: '0%', isPositive: true, isNeutral: true },
    source: 'Google Analytics 4'
  },
  {
    id: 'total-sessions',
    title: 'Total Sessions',
    description: 'Total number of user sessions',
    icon: MousePointerClick,
    value: '0',
    trend: { value: '0%', isPositive: true, isNeutral: true },
    source: 'Google Analytics 4'
  },
  {
    id: 'total-pageviews',
    title: 'Total Pageviews',
    description: 'Total number of page views',
    icon: Eye,
    value: '0',
    trend: { value: '0%', isPositive: true, isNeutral: true },
    source: 'Google Analytics 4'
  },
  {
    id: 'avg-session-duration',
    title: 'Avg. Session Duration',
    description: 'Average time users spend on your site',
    icon: Clock,
    value: '0m 0s',
    trend: { value: '0%', isPositive: true, isNeutral: true },
    source: 'Google Analytics 4'
  },
  {
    id: 'bounce-rate',
    title: 'Bounce Rate',
    description: 'Percentage of single-page sessions',
    icon: TrendingDown,
    value: '0%',
    trend: { value: '0%', isPositive: false, isNeutral: true }, // Lower bounce rate is better
    source: 'Google Analytics 4'
  },
];