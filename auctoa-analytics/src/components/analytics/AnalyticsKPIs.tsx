"use client";

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LucideIcon, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface KPIData {
  id: string;
  title: string;
  value: string;
  icon: LucideIcon;
  trend?: {
    value: string;
    isPositive: boolean;
    isNeutral: boolean;
  };
}

interface AnalyticsKPIsProps {
  kpis: KPIData[];
  loading?: boolean;
}

function KPICard({ kpi, loading }: { kpi: KPIData; loading: boolean }) {
  const IconComponent = kpi.icon;
  
  if (loading) {
    return (
      <Card className="animate-pulse">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            <div className="h-8 w-8 bg-gray-200 rounded"></div>
          </div>
          <div className="space-y-2">
            <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-100 rounded w-1/3"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getTrendIcon = () => {
    if (!kpi.trend) return null;
    if (kpi.trend.isNeutral) return <Minus className="h-3 w-3" />;
    return kpi.trend.isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />;
  };

  const getTrendColor = () => {
    if (!kpi.trend) return 'text-gray-500';
    if (kpi.trend.isNeutral) return 'text-gray-500';
    return kpi.trend.isPositive ? 'text-green-600' : 'text-red-600';
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-300">{kpi.title}</h3>
          <div className="h-8 w-8 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
            <IconComponent className="h-4 w-4 text-gray-600 dark:text-gray-400" />
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {kpi.value}
          </div>
          
          {kpi.trend && (
            <div className={`flex items-center gap-1 text-sm ${getTrendColor()}`}>
              {getTrendIcon()}
              <span>{kpi.trend.value}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export function AnalyticsKPIs({ kpis, loading = false }: AnalyticsKPIsProps) {
  // Filter to show only the most important KPIs
  const mostImportantKPIs = [
    'total-conversations',
    'user-engagement', 
    'chat-to-form-conversion',
    'completion-rate'
  ];
  
  const keyKPIs = kpis.filter(kpi => mostImportantKPIs.includes(kpi.id));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Key Performance Metrics</h3>
          <p className="text-sm text-gray-600 dark:text-gray-300">Essential insights from your chatbot performance</p>
        </div>
        <Badge variant="outline" className="text-green-600 border-green-200 dark:text-green-400 dark:border-green-800">
          Live data
        </Badge>
      </div>

      {/* Key KPIs - Single Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {keyKPIs.map((kpi) => (
          <KPICard key={kpi.id} kpi={kpi} loading={loading} />
        ))}
      </div>
    </div>
  );
}