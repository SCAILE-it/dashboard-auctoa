"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LucideIcon } from "lucide-react";

interface InsightItem {
  label: string;
  value: string | number;
  subtitle?: string;
}

interface QuickStat {
  label: string;
  value: string | number;
}

interface InsightsCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  items: InsightItem[];
  quickStats?: QuickStat[];
  bestPerforming?: {
    label: string;
    value: string;
  };
  isLiveData?: boolean;
  className?: string;
}

export function InsightsCard({
  title,
  description,
  icon: Icon,
  items,
  quickStats = [],
  bestPerforming,
  isLiveData = true,
  className = ""
}: InsightsCardProps) {
  return (
    <Card className={`bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm ${className}`}>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Icon className="h-5 w-5 text-gray-700 dark:text-gray-300" />
            {title}
          </span>
          <Badge variant="outline" className="text-green-600 border-green-600">
            <div className="w-2 h-2 bg-green-600 rounded-full animate-pulse mr-1" />
            {isLiveData ? 'Live' : 'Demo'}
          </Badge>
        </CardTitle>
        <CardDescription className="text-gray-600 dark:text-gray-400">
          {description}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Items List */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              {items.length > 0 ? (
                items[0].subtitle ? items[0].subtitle.includes('page') ? 'Top Pages' : 
                items[0].subtitle.includes('source') ? 'Top Sources' : 
                items[0].subtitle.includes('query') ? 'Top Search Queries' :
                items[0].subtitle.includes('conversation') ? 'Top Conversation Topics' :
                items[0].subtitle.includes('city') ? 'Top Cities' :
                'Top Items'
                : 'Top Items'
              ) : 'Top Items'}
            </h4>
            <div className="space-y-2">
              {items.slice(0, 5).map((item, index) => (
                <div 
                  key={`${item.label}-${index}`} 
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-750 transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <span className="flex items-center justify-center w-6 h-6 bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs font-medium rounded">
                      {index + 1}
                    </span>
                    <span className="font-medium text-gray-900 dark:text-white text-sm">
                      {item.label}
                    </span>
                  </span>
                  {typeof item.value === 'number' && item.value > 0 && (
                    <span className="text-sm text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                      {item.value.toLocaleString()}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Performance Overview */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Performance Overview</h4>
            
            {quickStats.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                {quickStats.map((stat, index) => (
                  <div 
                    key={index} 
                    className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700"
                  >
                    <div className="text-xl font-bold text-gray-900 dark:text-white">
                      {typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {bestPerforming && (
              <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                <div className="text-xs text-green-700 dark:text-green-300 mb-1">
                  {bestPerforming.label}
                </div>
                <div className="font-medium text-green-800 dark:text-green-200">
                  {bestPerforming.value}
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
