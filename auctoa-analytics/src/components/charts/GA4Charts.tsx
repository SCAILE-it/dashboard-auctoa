"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, ComposedChart } from "recharts";
import { format } from "date-fns";
import { UnifiedOverview, GASeriesPoint } from "@/types/analytics";
import { Loader2 } from "lucide-react";

interface GA4ChartsProps {
  data: UnifiedOverview;
  loading: boolean;
}

export function GA4Charts({ data, loading }: GA4ChartsProps) {
  const gaSeries = data.series.ga || [];

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-3 text-muted-foreground">Loading Analytics Charts...</span>
      </div>
    );
  }

  if (!gaSeries || gaSeries.length === 0) {
    return (
      <div className="bg-card rounded-lg border p-12 flex items-center justify-center">
        <div className="text-center text-muted-foreground">
          <div className="w-16 h-16 bg-muted rounded-lg mx-auto mb-4 flex items-center justify-center">
            📊
          </div>
          <h3 className="font-medium mb-2">No Analytics Data Available</h3>
          <p className="text-sm">Adjust your date range or check data sources.</p>
        </div>
      </div>
    );
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-lg border bg-background p-2 shadow-sm">
          <div className="text-sm font-bold">{format(new Date(label), "MMM dd, yyyy")}</div>
          {payload.map((entry: any, index: number) => (
            <div key={`item-${index}`} className="flex items-center justify-between gap-2 text-sm">
              <span style={{ color: entry.color }}>{entry.name}:</span>
              <span className="font-medium">
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
    <div className="space-y-6">
      {/* Users and Sessions Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              Website Traffic Trends
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {gaSeries.length > 0 && `${gaSeries.length} days of data`}
              {data.__mock && (
                <span className="ml-2 px-2 py-1 bg-amber-100 dark:bg-amber-900/20 text-amber-800 dark:text-amber-300 text-xs rounded-full">
                  Mock Data
                </span>
              )}
            </div>
          </CardTitle>
          <CardDescription>
            Daily users, sessions, and pageviews from Google Analytics.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart
              data={gaSeries}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorSessions" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#82ca9d" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis
                dataKey="ts"
                tickFormatter={(value) => format(new Date(value), "MMM dd")}
                minTickGap={30}
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                axisLine={{ stroke: 'hsl(var(--border))' }}
                tickLine={{ stroke: 'hsl(var(--border))' }}
              />
              <YAxis
                yAxisId="left"
                stroke="#8884d8"
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                axisLine={{ stroke: 'hsl(var(--border))' }}
                tickLine={{ stroke: 'hsl(var(--border))' }}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                stroke="#82ca9d"
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                axisLine={{ stroke: 'hsl(var(--border))' }}
                tickLine={{ stroke: 'hsl(var(--border))' }}
              />
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <Tooltip content={<CustomTooltip />} />
              <Area
                yAxisId="left"
                type="monotone"
                dataKey="users"
                name="Users"
                stroke="#8884d8"
                fillOpacity={1}
                fill="url(#colorUsers)"
              />
              <Area
                yAxisId="right"
                type="monotone"
                dataKey="sessions"
                name="Sessions"
                stroke="#82ca9d"
                fillOpacity={1}
                fill="url(#colorSessions)"
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="pageviews"
                name="Pageviews"
                stroke="#ffc658"
                dot={false}
                strokeWidth={2}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}