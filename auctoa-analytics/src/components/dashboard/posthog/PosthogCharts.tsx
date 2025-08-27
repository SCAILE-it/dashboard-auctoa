import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  ComposedChart,
  Line,
  LineChart
} from "recharts";
import { PosthogData } from "@/types/posthog";

interface PosthogChartsProps {
  data: PosthogData | null;
  loading?: boolean;
}

export function PosthogCharts({ data, loading = false }: PosthogChartsProps) {
  if (loading) {
    return (
      <div className="grid gap-6 md:grid-cols-2">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-5 bg-muted rounded w-32"></div>
              <div className="h-4 bg-muted rounded w-48"></div>
            </CardHeader>
            <CardContent>
              <div className="h-64 bg-muted rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No PostHog data available</p>
      </div>
    );
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border rounded-lg p-3 shadow-lg">
          <p className="font-medium">{`Date: ${label}`}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }}>
              {`${entry.name}: ${entry.value?.toLocaleString()}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const RetentionTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border rounded-lg p-3 shadow-lg">
          <p className="font-medium">{`Date: ${label}`}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }}>
              {`${entry.name}: ${(entry.value * 100).toFixed(1)}%`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Active Users Trend */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Active Users Trend
            <Badge variant="outline">Last 30 days</Badge>
          </CardTitle>
          <CardDescription>
            Daily, Weekly, and Monthly Active Users over time
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={data.timeSeries}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="date" 
                  className="text-xs fill-muted-foreground"
                  tick={{ fill: 'currentColor', fontSize: 12, fontWeight: 500 }}
                  axisLine={{ stroke: 'hsl(var(--border))' }}
                  tickLine={{ stroke: 'hsl(var(--border))' }}
                />
                <YAxis 
                  className="text-xs fill-muted-foreground"
                  tick={{ fill: 'currentColor', fontSize: 12, fontWeight: 500 }}
                  axisLine={{ stroke: 'hsl(var(--border))' }}
                  tickLine={{ stroke: 'hsl(var(--border))' }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="mau"
                  stackId="1"
                  stroke="hsl(var(--primary))"
                  fill="hsl(var(--primary))"
                  fillOpacity={0.1}
                  name="MAU"
                />
                <Area
                  type="monotone"
                  dataKey="wau"
                  stackId="2"
                  stroke="hsl(var(--chart-2))"
                  fill="hsl(var(--chart-2))"
                  fillOpacity={0.3}
                  name="WAU"
                />
                <Line
                  type="monotone"
                  dataKey="dau"
                  stroke="hsl(var(--chart-1))"
                  strokeWidth={2}
                  dot={{ fill: 'hsl(var(--chart-1))', strokeWidth: 2, r: 4 }}
                  name="DAU"
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {/* User Retention */}
        <Card>
          <CardHeader>
            <CardTitle>User Retention</CardTitle>
            <CardDescription>
              Daily retention rate showing user stickiness
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.timeSeries}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis 
                    dataKey="date" 
                    className="text-xs fill-muted-foreground"
                    tick={{ fill: 'currentColor', fontSize: 12, fontWeight: 500 }}
                    axisLine={{ stroke: 'hsl(var(--border))' }}
                    tickLine={{ stroke: 'hsl(var(--border))' }}
                  />
                  <YAxis 
                    className="text-xs fill-muted-foreground"
                    tick={{ fill: 'currentColor', fontSize: 12, fontWeight: 500 }}
                    axisLine={{ stroke: 'hsl(var(--border))' }}
                    tickLine={{ stroke: 'hsl(var(--border))' }}
                    domain={[0, 1]}
                    tickFormatter={(value) => `${(value * 100).toFixed(0)}%`}
                  />
                  <Tooltip content={<RetentionTooltip />} />
                  <Line
                    type="monotone"
                    dataKey="retention_rate"
                    stroke="hsl(var(--chart-3))"
                    strokeWidth={2}
                    dot={{ fill: 'hsl(var(--chart-3))', strokeWidth: 2, r: 3 }}
                    name="Retention Rate"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Conversion Funnel */}
        <Card>
          <CardHeader>
            <CardTitle>Conversion Funnel</CardTitle>
            <CardDescription>
              User journey from first visit to activation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.funnelSteps} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis 
                    type="number"
                    className="text-xs fill-muted-foreground"
                    tick={{ fill: 'currentColor', fontSize: 12, fontWeight: 500 }}
                    axisLine={{ stroke: 'hsl(var(--border))' }}
                    tickLine={{ stroke: 'hsl(var(--border))' }}
                  />
                  <YAxis 
                    type="category"
                    dataKey="name"
                    className="text-xs fill-muted-foreground"
                    tick={{ fill: 'currentColor', fontSize: 12, fontWeight: 500 }}
                    axisLine={{ stroke: 'hsl(var(--border))' }}
                    tickLine={{ stroke: 'hsl(var(--border))' }}
                    width={80}
                  />
                  <Tooltip 
                    formatter={(value: any, name: string) => [
                      value.toLocaleString(),
                      name === 'count' ? 'Users' : name
                    ]}
                  />
                  <Bar
                    dataKey="count"
                    fill="hsl(var(--chart-4))"
                    radius={[0, 4, 4, 0]}
                    name="Users"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* User Cohorts */}
      <Card>
        <CardHeader>
          <CardTitle>User Cohorts</CardTitle>
          <CardDescription>
            Different user segments and their retention rates
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.cohorts.map((cohort) => (
              <div key={cohort.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <h4 className="font-medium">{cohort.name}</h4>
                  <p className="text-sm text-muted-foreground">
                    {cohort.size.toLocaleString()} users
                  </p>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className="text-sm font-medium">
                      {(cohort.retention_rate * 100).toFixed(1)}%
                    </p>
                    <p className="text-xs text-muted-foreground">Retention</p>
                  </div>
                  <div className="w-24 bg-muted rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all duration-300"
                      style={{ width: `${cohort.retention_rate * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
