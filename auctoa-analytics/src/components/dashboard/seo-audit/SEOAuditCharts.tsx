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
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
  LineChart,
  Line
} from "recharts";
import { SEOAuditComparison, SEOAuditRecommendation } from "@/types/seo-audit";
import { AlertTriangle, CheckCircle, Clock, ExternalLink } from "lucide-react";

interface SEOAuditChartsProps {
  data: SEOAuditComparison | null;
  loading?: boolean;
}

export function SEOAuditCharts({ data, loading = false }: SEOAuditChartsProps) {
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
      mobile: data.mobile.scores.performance,
      desktop: data.desktop.scores.performance
    },
    {
      category: 'SEO',
      mobile: data.mobile.scores.seo,
      desktop: data.desktop.scores.seo
    },
    {
      category: 'Accessibility',
      mobile: data.mobile.scores.accessibility,
      desktop: data.desktop.scores.accessibility
    },
    {
      category: 'Best Practices',
      mobile: data.mobile.scores.bestPractices,
      desktop: data.desktop.scores.bestPractices
    }
  ];

  const coreWebVitalsData = [
    {
      metric: 'LCP',
      mobile: data.mobile.coreWebVitals.lcp.value,
      desktop: data.desktop.coreWebVitals.lcp.value,
      threshold: data.mobile.coreWebVitals.lcp.threshold.good,
      unit: 'ms'
    },
    {
      metric: 'INP',
      mobile: data.mobile.coreWebVitals.inp.value,
      desktop: data.desktop.coreWebVitals.inp.value,
      threshold: data.mobile.coreWebVitals.inp.threshold.good,
      unit: 'ms'
    },
    {
      metric: 'CLS',
      mobile: Math.round(data.mobile.coreWebVitals.cls.value * 1000) / 1000,
      desktop: Math.round(data.desktop.coreWebVitals.cls.value * 1000) / 1000,
      threshold: data.mobile.coreWebVitals.cls.threshold.good,
      unit: ''
    }
  ];

  const performanceMetricsData = [
    {
      metric: 'FCP',
      mobile: data.mobile.performanceMetrics.fcp.value,
      desktop: data.desktop.performanceMetrics.fcp.value,
      unit: 'ms'
    },
    {
      metric: 'Speed Index',
      mobile: data.mobile.performanceMetrics.speedIndex.value,
      desktop: data.desktop.performanceMetrics.speedIndex.value,
      unit: 'ms'
    },
    {
      metric: 'TBT',
      mobile: data.mobile.performanceMetrics.tbt.value,
      desktop: data.desktop.performanceMetrics.tbt.value,
      unit: 'ms'
    },
    {
      metric: 'TTI',
      mobile: data.mobile.performanceMetrics.tti.value,
      desktop: data.desktop.performanceMetrics.tti.value,
      unit: 'ms'
    }
  ];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border rounded-lg shadow-lg p-3">
          <p className="font-medium">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.dataKey}: {entry.value}
              {entry.payload?.unit && entry.payload.unit}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'medium':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'low':
        return 'bg-green-50 text-green-700 border-green-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
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
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={scoresComparison} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="category" 
                tick={{ fill: 'currentColor', fontSize: 12 }}
                axisLine={{ stroke: 'hsl(var(--border))' }}
              />
              <YAxis 
                domain={[0, 100]}
                tick={{ fill: 'currentColor', fontSize: 12 }}
                axisLine={{ stroke: 'hsl(var(--border))' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar dataKey="mobile" fill="hsl(var(--primary))" name="Mobile" radius={[2, 2, 0, 0]} />
              <Bar dataKey="desktop" fill="hsl(var(--secondary))" name="Desktop" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
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
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={coreWebVitalsData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="metric" 
                  tick={{ fill: 'currentColor', fontSize: 12 }}
                  axisLine={{ stroke: 'hsl(var(--border))' }}
                />
                <YAxis 
                  tick={{ fill: 'currentColor', fontSize: 12 }}
                  axisLine={{ stroke: 'hsl(var(--border))' }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar dataKey="mobile" fill="#ef4444" name="Mobile" radius={[2, 2, 0, 0]} />
                <Bar dataKey="desktop" fill="#22c55e" name="Desktop" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
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
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={performanceMetricsData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="metric" 
                  tick={{ fill: 'currentColor', fontSize: 12 }}
                  axisLine={{ stroke: 'hsl(var(--border))' }}
                />
                <YAxis 
                  tick={{ fill: 'currentColor', fontSize: 12 }}
                  axisLine={{ stroke: 'hsl(var(--border))' }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar dataKey="mobile" fill="hsl(var(--primary))" name="Mobile" radius={[2, 2, 0, 0]} />
                <Bar dataKey="desktop" fill="hsl(var(--secondary))" name="Desktop" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
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
            
            <TabsContent value="mobile" className="space-y-4 mt-4">
              {data.mobile.recommendations.map((rec) => (
                <div key={rec.id} className="flex items-start space-x-4 p-4 border rounded-lg">
                  <div className="flex-shrink-0">
                    {getEffortIcon(rec.effort)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium text-foreground">{rec.title}</h4>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className={`text-xs ${getImpactColor(rec.impact)}`}>
                          {rec.impact} impact
                        </Badge>
                        {rec.savings && (
                          <Badge variant="secondary" className="text-xs">
                            Save {rec.savings}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{rec.description}</p>
                    {rec.learnMoreUrl && (
                      <a 
                        href={rec.learnMoreUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-xs text-primary hover:underline mt-2"
                      >
                        Learn more <ExternalLink className="ml-1 h-3 w-3" />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </TabsContent>
            
            <TabsContent value="desktop" className="space-y-4 mt-4">
              {data.desktop.recommendations.map((rec) => (
                <div key={rec.id} className="flex items-start space-x-4 p-4 border rounded-lg">
                  <div className="flex-shrink-0">
                    {getEffortIcon(rec.effort)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium text-foreground">{rec.title}</h4>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className={`text-xs ${getImpactColor(rec.impact)}`}>
                          {rec.impact} impact
                        </Badge>
                        {rec.savings && (
                          <Badge variant="secondary" className="text-xs">
                            Save {rec.savings}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{rec.description}</p>
                    {rec.learnMoreUrl && (
                      <a 
                        href={rec.learnMoreUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-xs text-primary hover:underline mt-2"
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
