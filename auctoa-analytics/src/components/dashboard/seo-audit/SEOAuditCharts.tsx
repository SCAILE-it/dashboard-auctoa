import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from "recharts";
import { SEOAuditComparison } from "@/types/seo-audit";
import { AlertTriangle, CheckCircle, Clock, ExternalLink } from "lucide-react";

interface SEOAuditChartsProps {
  data: SEOAuditComparison | null;
  loading?: boolean;
}

export function SEOAuditCharts({ data, loading = false }: SEOAuditChartsProps) {
  // Use CSS custom properties that automatically adapt to theme changes
  // This approach is more reliable than JavaScript theme detection
  
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

  if (!data || (!data.mobile && !data.desktop)) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">No SEO audit data available</p>
        </CardContent>
      </Card>
    );
  }

  // Prepare data for charts
  const scoresComparison = [
    {
      category: 'Performance',
      mobile: data.mobile?.scores.performance || 0,
      desktop: data.desktop?.scores.performance || 0
    },
    {
      category: 'SEO',
      mobile: data.mobile?.scores.seo || 0,
      desktop: data.desktop?.scores.seo || 0
    },
    {
      category: 'Accessibility',
      mobile: data.mobile?.scores.accessibility || 0,
      desktop: data.desktop?.scores.accessibility || 0
    },
    {
      category: 'Best Practices',
      mobile: data.mobile?.scores.bestPractices || 0,
      desktop: data.desktop?.scores.bestPractices || 0
    }
  ];

  const coreWebVitalsData = [
    {
      metric: 'LCP',
      mobile: data.mobile?.coreWebVitals.lcp.value || 0,
      desktop: data.desktop?.coreWebVitals.lcp.value || 0,
      threshold: data.mobile?.coreWebVitals.lcp.threshold.good || 2500,
      unit: 'ms'
    },
    {
      metric: 'INP',
      mobile: data.mobile?.coreWebVitals.inp.value || 0,
      desktop: data.desktop?.coreWebVitals.inp.value || 0,
      threshold: data.mobile?.coreWebVitals.inp.threshold.good || 200,
      unit: 'ms'
    },
    {
      metric: 'CLS',
      mobile: Math.round((data.mobile?.coreWebVitals.cls.value || 0) * 1000) / 1000,
      desktop: Math.round((data.desktop?.coreWebVitals.cls.value || 0) * 1000) / 1000,
      threshold: data.mobile?.coreWebVitals.cls.threshold.good || 0.1,
      unit: ''
    }
  ];

  const performanceMetricsData = [
    {
      metric: 'FCP',
      mobile: data.mobile?.performanceMetrics.fcp.value || 0,
      desktop: data.desktop?.performanceMetrics.fcp.value || 0,
      unit: 'ms'
    },
    {
      metric: 'Speed Index',
      mobile: data.mobile?.performanceMetrics.speedIndex.value || 0,
      desktop: data.desktop?.performanceMetrics.speedIndex.value || 0,
      unit: 'ms'
    },
    {
      metric: 'TBT',
      mobile: data.mobile?.performanceMetrics.tbt.value || 0,
      desktop: data.desktop?.performanceMetrics.tbt.value || 0,
      unit: 'ms'
    },
    {
      metric: 'TTI',
      mobile: data.mobile?.performanceMetrics.tti.value || 0,
      desktop: data.desktop?.performanceMetrics.tti.value || 0,
      unit: 'ms'
    }
  ];

  const CustomTooltip = ({ active, payload, label }: {
    active?: boolean;
    payload?: Array<{
      color: string;
      dataKey: string;
      value: number;
      payload?: { unit?: string };
    }>;
    label?: string;
  }) => {
    if (active && payload && payload.length) {
      return (
        <div
          style={{
            backgroundColor: 'hsl(var(--card))',
            border: '1px solid hsl(var(--border))',
            borderRadius: '8px',
            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
            padding: '16px',
            minWidth: '200px',
            color: 'hsl(var(--card-foreground))'
          }}
        >
          <p style={{
            fontWeight: '600',
            marginBottom: '8px',
            fontSize: '14px',
            color: 'hsl(var(--card-foreground))'
          }}>
            {label}
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {payload.map((entry, index: number) => (
              <div key={index} style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '12px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div
                    style={{
                      width: '12px',
                      height: '12px',
                      borderRadius: '2px',
                      backgroundColor: entry.color
                    }}
                  />
                  <span style={{
                    fontSize: '14px',
                    fontWeight: '500',
                    color: 'hsl(var(--card-foreground))'
                  }}>
                    {entry.dataKey === 'mobile' ? 'Mobile' : 'Desktop'}:
                  </span>
                </div>
                <span style={{
                  fontSize: '14px',
                  fontWeight: '700',
                  color: 'hsl(var(--card-foreground))'
                }}>
                  {entry.value}
                  {entry.payload?.unit ? entry.payload.unit : '/100'}
                </span>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  const CustomYAxisTick = ({ x, y, payload }: {
    x?: number;
    y?: number;
    payload?: { value: string | number };
  }) => {
    return (
      <g transform={`translate(${x},${y})`}>
        <text
          x={0}
          y={0}
          dy={16}
          textAnchor="end"
          fontSize="12"
          className="fill-slate-900 dark:fill-white"
          style={{
            stroke: 'none'
          }}
        >
          {payload?.value}
        </text>
      </g>
    );
  };

  const CustomXAxisTick = ({ x, y, payload }: {
    x?: number;
    y?: number;
    payload?: { value: string | number };
  }) => {
    return (
      <g transform={`translate(${x},${y})`}>
        <text
          x={0}
          y={0}
          dy={16}
          textAnchor="middle"
          fontSize="12"
          className="fill-slate-900 dark:fill-white"
          style={{
            stroke: 'none'
          }}
        >
          {payload?.value}
        </text>
      </g>
    );
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high':
        return 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-800';
      case 'medium':
        return 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800';
      case 'low':
        return 'bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-300 dark:border-green-800';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600';
    }
  };

  const getEffortIcon = (effort: string) => {
    switch (effort) {
      case 'low':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'medium':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'high':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Overall Scores Comparison */}
      <Card>
        <CardHeader>
          <CardTitle>Lighthouse Scores Comparison</CardTitle>
          <CardDescription>
            Mobile vs Desktop performance across all categories
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div 
            className="text-foreground" 
            style={{ 
              color: 'hsl(var(--foreground))',
              '--chart-text-color': 'hsl(var(--foreground))'
            } as React.CSSProperties & { '--chart-text-color': string }}
          >
            <ResponsiveContainer width="100%" height={300}>
            <BarChart data={scoresComparison} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
              <XAxis 
                dataKey="category" 
                tick={<CustomXAxisTick />}
                axisLine={{ stroke: 'hsl(var(--border))' }}
                tickLine={{ stroke: 'hsl(var(--foreground))' }}
              />
              <YAxis 
                domain={[0, 100]}
                tick={<CustomYAxisTick />}
                axisLine={{ stroke: 'hsl(var(--border))' }}
                tickLine={{ stroke: 'hsl(var(--foreground))' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                wrapperStyle={{
                  paddingTop: '16px',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: 'hsl(var(--foreground))'
                }}
              />
              <Bar 
                dataKey="mobile" 
                fill="#3b82f6" 
                name="Mobile" 
                radius={[4, 4, 0, 0]}
              />
              <Bar 
                dataKey="desktop" 
                fill="#10b981" 
                name="Desktop" 
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Core Web Vitals */}
        <Card>
          <CardHeader>
            <CardTitle>Core Web Vitals</CardTitle>
            <CardDescription>
              Key metrics that impact user experience and SEO
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div 
              className="text-foreground" 
              style={{ 
                color: 'hsl(var(--foreground))',
                '--chart-text-color': 'hsl(var(--foreground))'
              } as React.CSSProperties & { '--chart-text-color': string }}
            >
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={coreWebVitalsData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                <XAxis 
                  dataKey="metric" 
                  tick={<CustomXAxisTick />}
                  axisLine={{ stroke: 'hsl(var(--border))' }}
                  tickLine={{ stroke: 'hsl(var(--foreground))' }}
                />
                <YAxis 
                  tick={<CustomYAxisTick />}
                  axisLine={{ stroke: 'hsl(var(--border))' }}
                  tickLine={{ stroke: 'hsl(var(--foreground))' }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend 
                  wrapperStyle={{
                    paddingTop: '16px',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: 'hsl(var(--foreground))'
                  }}
                />
                <Bar 
                  dataKey="mobile" 
                  fill="#f59e0b" 
                  name="Mobile" 
                  radius={[4, 4, 0, 0]}
                />
                <Bar 
                  dataKey="desktop" 
                  fill="#8b5cf6" 
                  name="Desktop" 
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Performance Metrics */}
        <Card>
          <CardHeader>
            <CardTitle>Performance Metrics</CardTitle>
            <CardDescription>
              Detailed loading and interactivity measurements
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div 
              className="text-foreground" 
              style={{ 
                color: 'hsl(var(--foreground))',
                '--chart-text-color': 'hsl(var(--foreground))'
              } as React.CSSProperties & { '--chart-text-color': string }}
            >
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={performanceMetricsData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                <XAxis 
                  dataKey="metric" 
                  tick={<CustomXAxisTick />}
                  axisLine={{ stroke: 'hsl(var(--border))' }}
                  tickLine={{ stroke: 'hsl(var(--foreground))' }}
                />
                <YAxis 
                  tick={<CustomYAxisTick />}
                  axisLine={{ stroke: 'hsl(var(--border))' }}
                  tickLine={{ stroke: 'hsl(var(--foreground))' }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend 
                  wrapperStyle={{
                    paddingTop: '16px',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: 'hsl(var(--foreground))'
                  }}
                />
                <Bar 
                  dataKey="mobile" 
                  fill="#ef4444" 
                  name="Mobile" 
                  radius={[4, 4, 0, 0]}
                />
                <Bar 
                  dataKey="desktop" 
                  fill="#06b6d4" 
                  name="Desktop" 
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle>Optimization Recommendations</CardTitle>
          <CardDescription>
            Prioritized suggestions to improve your site&apos;s performance and SEO
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="mobile" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="mobile">Mobile</TabsTrigger>
              <TabsTrigger value="desktop">Desktop</TabsTrigger>
            </TabsList>
            
            <TabsContent value="mobile" className="space-y-3 mt-6">
              {(data.mobile?.recommendations || []).map((rec) => (
                <div key={rec.id} className="flex items-start space-x-4 p-5 border border-border rounded-lg bg-card hover:bg-accent/50 transition-colors">
                  <div className="flex-shrink-0 mt-1">
                    {getEffortIcon(rec.effort)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <h4 className="text-sm font-semibold text-card-foreground leading-tight">{rec.title}</h4>
                      <div className="flex items-center space-x-2 flex-shrink-0">
                        <Badge variant="outline" className={`text-xs font-medium ${getImpactColor(rec.impact)}`}>
                          {rec.impact} impact
                        </Badge>
                        {rec.savings && (
                          <Badge variant="secondary" className="text-xs font-medium bg-green-100 text-green-700 border-green-200 dark:bg-green-900 dark:text-green-300 dark:border-green-700">
                            Save {rec.savings}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{rec.description}</p>
                    {rec.learnMoreUrl && (
                      <a 
                        href={rec.learnMoreUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-xs text-primary hover:text-primary/80 hover:underline mt-3 font-medium"
                      >
                        Learn more <ExternalLink className="ml-1 h-3 w-3" />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </TabsContent>
            
            <TabsContent value="desktop" className="space-y-3 mt-6">
              {(data.desktop?.recommendations || []).map((rec) => (
                <div key={rec.id} className="flex items-start space-x-4 p-5 border border-border rounded-lg bg-card hover:bg-accent/50 transition-colors">
                  <div className="flex-shrink-0 mt-1">
                    {getEffortIcon(rec.effort)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <h4 className="text-sm font-semibold text-card-foreground leading-tight">{rec.title}</h4>
                      <div className="flex items-center space-x-2 flex-shrink-0">
                        <Badge variant="outline" className={`text-xs font-medium ${getImpactColor(rec.impact)}`}>
                          {rec.impact} impact
                        </Badge>
                        {rec.savings && (
                          <Badge variant="secondary" className="text-xs font-medium bg-green-100 text-green-700 border-green-200 dark:bg-green-900 dark:text-green-300 dark:border-green-700">
                            Save {rec.savings}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{rec.description}</p>
                    {rec.learnMoreUrl && (
                      <a 
                        href={rec.learnMoreUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-xs text-primary hover:text-primary/80 hover:underline mt-3 font-medium"
                      >
                        Learn more <ExternalLink className="ml-1 h-3 w-3" />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
