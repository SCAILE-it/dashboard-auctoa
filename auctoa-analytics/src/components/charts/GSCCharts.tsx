import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { UnifiedOverview } from '@/types/analytics';

interface GSCChartsProps {
  data: UnifiedOverview;
  loading?: boolean;
}

export function GSCCharts({ data, loading }: GSCChartsProps) {
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-card rounded-lg border p-12 flex items-center justify-center">
          <div className="text-center text-muted-foreground">
            <div className="w-16 h-16 bg-muted rounded-lg mx-auto mb-4 flex items-center justify-center animate-pulse">
              📊
            </div>
            <h3 className="font-medium mb-2">Loading Search Data...</h3>
            <p className="text-sm">Fetching Google Search Console metrics</p>
          </div>
        </div>
      </div>
    );
  }

  const searchSeries = data.series?.search || [];
  
  if (searchSeries.length === 0) {
    return (
      <div className="space-y-6">
        <div className="bg-card rounded-lg border p-12 flex items-center justify-center">
          <div className="text-center text-muted-foreground">
            <div className="w-16 h-16 bg-muted rounded-lg mx-auto mb-4 flex items-center justify-center">
              🔍
            </div>
            <h3 className="font-medium mb-2">No Search Data Available</h3>
            <p className="text-sm">No search performance data found for the selected date range</p>
          </div>
        </div>
      </div>
    );
  }

  // Calculate some basic stats for the summary
  const totalClicks = searchSeries.reduce((sum, point) => sum + (point.clicks || 0), 0);
  const totalImpressions = searchSeries.reduce((sum, point) => sum + (point.impressions || 0), 0);
  const avgPosition = searchSeries.length > 0 
    ? searchSeries.reduce((sum, point) => sum + (point.avgPosition || 0), 0) / searchSeries.length
    : 0;

  return (
    <div className="space-y-6">
      {/* Search Performance Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              Search Performance
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {searchSeries.length > 0 && `${searchSeries.length} days of data`}
            </div>
          </CardTitle>
          <CardDescription>
            Clicks, impressions, and average search position over time
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={searchSeries}>
                <defs>
                  <linearGradient id="clicksGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0.0}/>
                  </linearGradient>
                  <linearGradient id="impressionsGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="ts" 
                  className="text-xs fill-muted-foreground"
                  tickFormatter={(value) => {
                    const date = new Date(value);
                    return `${date.getMonth() + 1}/${date.getDate()}`;
                  }}
                />
                <YAxis className="text-xs fill-muted-foreground" />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                  formatter={(value: number, name: string) => {
                    if (name === 'clicks') return [value, 'Clicks'];
                    if (name === 'impressions') return [value, 'Impressions'];
                    if (name === 'avgPosition') return [value?.toFixed(1), 'Avg Position'];
                    return [value, name];
                  }}
                  labelFormatter={(value) => {
                    const date = new Date(value);
                    return date.toLocaleDateString();
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="impressions"
                  stroke="#3b82f6"
                  fill="url(#impressionsGradient)"
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="clicks"
                  stroke="#22c55e"
                  fill="url(#clicksGradient)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Position Tracking Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-orange-500"></div>
            Average Search Position
          </CardTitle>
          <CardDescription>
            Your website's average ranking position in search results (lower is better)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={searchSeries}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="ts" 
                  className="text-xs fill-muted-foreground"
                  tickFormatter={(value) => {
                    const date = new Date(value);
                    return `${date.getMonth() + 1}/${date.getDate()}`;
                  }}
                />
                <YAxis 
                  className="text-xs fill-muted-foreground"
                  domain={['dataMin - 1', 'dataMax + 1']}
                  tickFormatter={(value) => `#${value.toFixed(0)}`}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                  formatter={(value: number) => [`#${value?.toFixed(1)}`, 'Position']}
                  labelFormatter={(value) => {
                    const date = new Date(value);
                    return date.toLocaleDateString();
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="avgPosition"
                  stroke="#f97316"
                  strokeWidth={3}
                  dot={{ fill: '#f97316', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Summary</CardTitle>
          <CardDescription>Key metrics for the selected period</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{totalClicks.toLocaleString()}</div>
              <div className="text-sm text-muted-foreground">Total Clicks</div>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{totalImpressions.toLocaleString()}</div>
              <div className="text-sm text-muted-foreground">Total Impressions</div>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {totalImpressions > 0 ? ((totalClicks / totalImpressions) * 100).toFixed(1) : '0'}%
              </div>
              <div className="text-sm text-muted-foreground">Click-Through Rate</div>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">#{avgPosition.toFixed(1)}</div>
              <div className="text-sm text-muted-foreground">Avg Position</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}