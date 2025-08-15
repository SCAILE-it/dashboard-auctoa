"use client";

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ComposedChart, Line } from "recharts";
import { format } from "date-fns";
import type { UnifiedOverview } from "@/lib/overview";

interface GA4ChartsProps {
  data: UnifiedOverview;
  loading: boolean;
}

export function GA4Charts({ data, loading }: GA4ChartsProps) {
  if (loading) {
    return (
      <Card className="animate-pulse">
        <CardHeader>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
          <div className="h-3 bg-gray-100 dark:bg-gray-600 rounded w-1/2"></div>
        </CardHeader>
        <CardContent>
          <div className="h-96 bg-gray-50 dark:bg-gray-800 rounded"></div>
        </CardContent>
      </Card>
    );
  }

  const gaSeries = data?.series?.traffic || [];

  console.log('GA4Charts Debug:', { 
    dataExists: !!data, 
    seriesExists: !!data?.series, 
    trafficExists: !!data?.series?.traffic,
    gaLength: gaSeries.length,
    sampleData: gaSeries.slice(0, 2)
  });

  if (!gaSeries || gaSeries.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-purple-500"></div>
            Website Traffic Trends
          </CardTitle>
          <CardDescription>
            Daily users, sessions, and pageviews from Google Analytics.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-muted/50 rounded-lg p-12 flex items-center justify-center">
            <div className="text-center text-muted-foreground">
              <div className="w-16 h-16 bg-muted rounded-lg mx-auto mb-4 flex items-center justify-center">
                📊
              </div>
              <h3 className="font-medium mb-2">No Analytics Data Available</h3>
              <p className="text-sm">Adjust your date range or check data sources.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const CustomTooltip = ({ active, payload, label }: {
    active?: boolean;
    payload?: Array<{
      name: string;
      value: number;
      color: string;
    }>;
    label?: string;
  }) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-lg border bg-background p-3 shadow-lg border-border">
          <div className="text-sm font-bold text-foreground mb-2">{format(new Date(label || ''), "MMM dd, yyyy")}</div>
          {payload.map((entry, index: number) => (
            <div key={`item-${index}`} className="flex items-center justify-between gap-3 text-sm py-1">
              <span className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }}></div>
                <span className="text-foreground font-medium">{entry.name}:</span>
              </span>
              <span className="font-bold text-foreground">
                {entry.value.toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-purple-500"></div>
            Website Traffic Activity
          </div>
          <div className="text-sm text-muted-foreground">
            {gaSeries.length > 0 && `${gaSeries.length} days of data`}
            {data && '__mock' in data && (data as { __mock: boolean }).__mock && (
              <span className="ml-2 px-2 py-1 bg-amber-100 dark:bg-amber-900/20 text-amber-800 dark:text-amber-300 text-xs rounded-full">
                Mock Data
              </span>
            )}
          </div>
        </CardTitle>
        <CardDescription>
          Daily traffic metrics showing user engagement and website performance
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-foreground">
          <ResponsiveContainer width="100%" height={350}>
            <ComposedChart
              data={gaSeries}
              margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
            >
            <defs>
              <linearGradient id="gaColorUsers" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#a855f7" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#a855f7" stopOpacity={0.1}/>
              </linearGradient>
              <linearGradient id="gaColorSessions" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.1}/>
              </linearGradient>
              <linearGradient id="gaColorPageviews" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.1}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
            <XAxis
              dataKey="ts"
              tickFormatter={(value) => format(new Date(value), "MMM dd")}
              minTickGap={30}
              tick={{ fill: 'currentColor', fontSize: 12, fontWeight: 500 }}
              axisLine={{ stroke: 'hsl(var(--border))' }}
              tickLine={{ stroke: 'hsl(var(--border))' }}
            />
            <YAxis
              yAxisId="left"
              tick={{ fill: 'currentColor', fontSize: 12, fontWeight: 500 }}
              axisLine={{ stroke: 'hsl(var(--border))' }}
              tickLine={{ stroke: 'hsl(var(--border))' }}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              tick={{ fill: 'currentColor', fontSize: 12, fontWeight: 500 }}
              axisLine={{ stroke: 'hsl(var(--border))' }}
              tickLine={{ stroke: 'hsl(var(--border))' }}
            />
            <Tooltip content={<CustomTooltip />} />
            
            {/* Users - Purple Area */}
            <Area
              yAxisId="left"
              type="monotone"
              dataKey="users"
              name="Users"
              stroke="#a855f7"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#gaColorUsers)"
            />
            
            {/* Sessions - Cyan Area */}
            <Area
              yAxisId="left"
              type="monotone"
              dataKey="sessions"
              name="Sessions"
              stroke="#06b6d4"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#gaColorSessions)"
            />
            
            {/* Pageviews - Amber Line */}
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="pageviews"
              name="Pageviews"
              stroke="#f59e0b"
              strokeWidth={3}
              dot={{ fill: '#f59e0b', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, fill: '#f59e0b', strokeWidth: 2 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}