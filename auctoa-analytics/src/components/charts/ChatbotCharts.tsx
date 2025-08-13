"use client";

import React from 'react';
import {
  AreaChart,
  Area,
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Conversation Insights</h3>
          <p className="text-sm text-gray-600 dark:text-gray-300">Visual trends and user journey analysis</p>
        </div>
        <Badge variant="outline" className="text-blue-600 border-blue-200 dark:text-blue-400 dark:border-blue-800">
          Live Data
        </Badge>
      </div>

      {/* Single Comprehensive Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              Activity & Performance Overview
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {chatbotSeries.length > 0 && `${chatbotSeries.length} days of data`}
            </div>
          </CardTitle>
          <CardDescription>
            Daily conversation volume and user engagement patterns
          </CardDescription>
        </CardHeader>
        <CardContent>
          {chatbotSeries.length === 0 ? (
            <div className="h-96 flex items-center justify-center">
              <div className="text-center text-gray-500 dark:text-gray-400">
                <div className="text-6xl mb-4">📈</div>
                <h3 className="text-lg font-medium mb-2">No Data Available</h3>
                <p className="text-sm">Try selecting a different date range or check your data connection</p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Main Chart */}
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chatbotSeries} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                    <defs>
                      <linearGradient id="conversationsGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.4}/>
                        <stop offset="100%" stopColor="#3B82F6" stopOpacity={0.02}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.6} />
                    <XAxis 
                      dataKey="ts" 
                      tick={{ fontSize: 12, fill: '#6b7280' }}
                      tickFormatter={(value) => format(parseISO(value), 'MMM dd')}
                      height={60}
                      angle={-45}
                      textAnchor="end"
                    />
                    <YAxis 
                      tick={{ fontSize: 12, fill: '#6b7280' }}
                      label={{ value: 'Conversations', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle' } }}
                    />
                    <Tooltip 
                      content={({ active, payload, label }) => {
                        if (active && payload && payload.length && label) {
                          const data = payload[0].payload;
                          return (
                            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl p-4 min-w-[200px]">
                              <p className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                                {format(parseISO(label.toString()), 'EEEE, MMM dd, yyyy')}
                              </p>
                              <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-blue-500"/>
                                    <span className="text-sm text-gray-600 dark:text-gray-300">Conversations</span>
                                  </div>
                                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                                    {data.conversations}
                                  </span>
                                </div>
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-emerald-500"/>
                                    <span className="text-sm text-gray-600 dark:text-gray-300">Completion Rate</span>
                                  </div>
                                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                                    {(data.completionRate * 100).toFixed(1)}%
                                  </span>
                                </div>
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-amber-500"/>
                                    <span className="text-sm text-gray-600 dark:text-gray-300">Avg Response</span>
                                  </div>
                                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                                    {data.avgResponseTimeSec}s
                                  </span>
                                </div>
                              </div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="conversations"
                      stroke="#3B82F6"
                      fill="url(#conversationsGradient)"
                      strokeWidth={3}
                      dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6, stroke: '#3B82F6', strokeWidth: 2, fill: '#fff' }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Quick Stats Row */}
              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{funnelData.s1}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Total Conversations</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{funnelData.s2}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Form Submissions</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{funnelData.s4}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Completed</div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Data Source Badge */}
      <div className="flex justify-center">
        <Badge variant="secondary" className="text-xs dark:bg-gray-800 dark:text-gray-300">
          📊 Powered by real Supabase data from your chatbot conversations
        </Badge>
      </div>
    </div>
  );
}