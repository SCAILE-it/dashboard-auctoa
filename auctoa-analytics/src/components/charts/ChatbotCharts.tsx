"use client";

import React from 'react';
import {
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format, parseISO } from 'date-fns';
import type { UnifiedOverview } from '@/lib/overview';

interface ChatbotChartsProps {
  data: UnifiedOverview;
  loading?: boolean;
}

// Removed unused code

export function ChatbotCharts({ data, loading = false }: ChatbotChartsProps) {
  if (loading) {
    return (
      <Card className="animate-pulse">
        <CardHeader>
          <div className="h-4 bg-gray-200 rounded w-1/3"></div>
          <div className="h-3 bg-gray-100 rounded w-1/2"></div>
        </CardHeader>
        <CardContent>
          <div className="h-96 bg-gray-50 rounded"></div>
        </CardContent>
      </Card>
    );
  }

  const chatbotSeries = data.series.chatbot || [];
  const funnelSeries = data.series.funnel || [];
  
  // Calculate funnel totals from series data
  const funnelData = funnelSeries.length > 0 
    ? funnelSeries.reduce((acc: { s1: number; s2: number; s3: number; s4: number }, point: { s1: number; s2: number; s3: number; s4: number }) => ({
        s1: acc.s1 + point.s1,
        s2: acc.s2 + point.s2,
        s3: acc.s3 + point.s3,
        s4: acc.s4 + point.s4,
      }), { s1: 0, s2: 0, s3: 0, s4: 0 })
    : { s1: 0, s2: 0, s3: 0, s4: 0 };

  // Custom tooltip component matching other charts
  const CustomTooltip = ({ active, payload, label }: {
    active?: boolean;
    payload?: Array<{
      name: string;
      value: number;
      color: string;
      payload?: any;
    }>;
    label?: string;
  }) => {
    if (active && payload && payload.length && label) {
      return (
        <div className="rounded-lg border bg-background p-3 shadow-lg border-border">
          <div className="text-sm font-bold text-foreground mb-2">
            {format(parseISO(label.toString()), "MMM dd, yyyy")}
          </div>
          {payload.map((entry, index: number) => (
            <div key={`item-${index}`} className="flex items-center justify-between gap-3 text-sm py-1">
              <span className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }}></div>
                <span className="text-foreground font-medium">{entry.name}:</span>
              </span>
              <span className="font-bold text-foreground">
                {entry.name === 'Completion Rate' ? `${(entry.value * 100).toFixed(1)}%` : entry.value.toLocaleString()}
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
            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
            Conversation Activity
          </div>
          <div className="text-sm text-muted-foreground">
            {chatbotSeries.length > 0 && `${chatbotSeries.length} days of data`}
          </div>
        </CardTitle>
        <CardDescription>
          Daily conversation volume and engagement patterns
        </CardDescription>
      </CardHeader>
      <CardContent>
        {chatbotSeries.length === 0 ? (
          <div className="bg-muted/50 rounded-lg p-12 flex items-center justify-center">
            <div className="text-center text-muted-foreground">
              <div className="w-16 h-16 bg-muted rounded-lg mx-auto mb-4 flex items-center justify-center">
                💬
              </div>
              <h3 className="font-medium mb-2">No Conversation Data Available</h3>
              <p className="text-sm">Adjust your date range or check data sources.</p>
            </div>
          </div>
        ) : (
          <div className="text-foreground">
            <ResponsiveContainer width="100%" height={350}>
              <ComposedChart
                data={chatbotSeries}
                margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
              >
                <defs>
                  <linearGradient id="chatbotConversations" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
                  </linearGradient>
                  <linearGradient id="chatbotCompletions" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                <XAxis
                  dataKey="ts"
                  tickFormatter={(value) => format(parseISO(value), "MMM dd")}
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
                  domain={[0, 1]}
                  tickFormatter={(value) => `${(value * 100).toFixed(0)}%`}
                  tick={{ fill: 'currentColor', fontSize: 12, fontWeight: 500 }}
                  axisLine={{ stroke: 'hsl(var(--border))' }}
                  tickLine={{ stroke: 'hsl(var(--border))' }}
                />
                <Tooltip content={<CustomTooltip />} />
                
                {/* Conversations - Blue Area */}
                <Area
                  yAxisId="left"
                  type="monotone"
                  dataKey="conversations"
                  name="Conversations"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#chatbotConversations)"
                />
                
                {/* Completion Rate - Green Line */}
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="completionRate"
                  name="Completion Rate"
                  stroke="#10b981"
                  strokeWidth={3}
                  dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, fill: '#10b981', strokeWidth: 2 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}