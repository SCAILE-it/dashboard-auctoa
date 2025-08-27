'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, ExternalLink, AlertCircle } from "lucide-react";
import { PosthogKPIs } from "@/components/dashboard/posthog/PosthogKPIs";
import { PosthogCharts } from "@/components/dashboard/posthog/PosthogCharts";
import { ExportChartDataButton } from "@/components/ui/export-button";
import { exportTimeSeriesToCSV } from "@/lib/csv-export";
import { PosthogData, PosthogApiResponse } from "@/types/posthog";

export default function PosthogPage() {
  const [data, setData] = useState<PosthogData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<string | null>(null);
  const [isEnabled, setIsEnabled] = useState(false);

  useEffect(() => {
    // Check if PostHog is enabled
    const enabled = process.env.NEXT_PUBLIC_ENABLE_POSTHOG === 'true';
    setIsEnabled(enabled);
    
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/posthog');
      const result: PosthogApiResponse = await response.json();

      if (result.success && result.data) {
        setData(result.data);
        setLastRefresh(result.lastRefresh || new Date().toISOString());
      } else {
        setError(result.error || 'Failed to fetch PostHog data');
      }
    } catch (err) {
      console.error('PostHog fetch error:', err);
      setError('Network error while fetching PostHog data');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchData();
  };

  const handleExportChartData = () => {
    if (!data?.timeSeries) return;

    const csvData = data.timeSeries.map(point => ({
      Date: point.date,
      'Daily Active Users': point.dau,
      'Weekly Active Users': point.wau,
      'Monthly Active Users': point.mau,
      'Sessions': point.sessions,
      'Retention Rate': `${(point.retention_rate * 100).toFixed(1)}%`
    }));

    exportTimeSeriesToCSV(csvData, 'posthog-analytics-data');
  };

  if (!isEnabled) {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">PostHog Analytics</h2>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-muted-foreground" />
              <span>PostHog Integration</span>
            </CardTitle>
            <CardDescription>
              PostHog analytics is not currently enabled for this dashboard.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm text-muted-foreground space-y-2">
              <p>To enable PostHog analytics, you need to:</p>
              <ol className="list-decimal list-inside space-y-1 ml-4">
                <li>Set up a PostHog account and get your project credentials</li>
                <li>Add the required environment variables to your deployment</li>
                <li>Enable the feature flag in your environment</li>
              </ol>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" asChild>
                <a 
                  href="https://posthog.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2"
                >
                  <ExternalLink className="h-4 w-4" />
                  <span>Visit PostHog</span>
                </a>
              </Button>
              <Badge variant="secondary">Coming Soon</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">PostHog Analytics</h2>
          <p className="text-muted-foreground">
            User behavior analytics and product insights
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <ExportChartDataButton
            onExport={handleExportChartData}
            disabled={!data?.timeSeries || loading}
            className="text-sm"
          />
          <Button
            onClick={handleRefresh}
            variant="outline"
            size="sm"
            disabled={loading}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            {loading ? "Refreshing..." : "Refresh Data"}
          </Button>
        </div>
      </div>

      {error && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2 text-destructive">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm">{error}</span>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-6">
        {/* Key Performance Indicators */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Key Performance Metrics</h3>
          <PosthogKPIs kpis={data?.kpis || []} loading={loading} />
        </div>

        {/* Analytics Insights */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Analytics Insights</h3>
            {lastRefresh && (
              <p className="text-sm text-muted-foreground">
                Last updated: {new Date(lastRefresh).toLocaleString()}
              </p>
            )}
          </div>
          <PosthogCharts data={data} loading={loading} />
        </div>

        {/* Additional Information */}
        {data && (
          <Card>
            <CardHeader>
              <CardTitle>About PostHog Analytics</CardTitle>
              <CardDescription>
                Understanding your user behavior and product performance
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <h4 className="font-medium mb-2">Active Users</h4>
                  <p className="text-sm text-muted-foreground">
                    Track daily, weekly, and monthly active users to understand your product&apos;s growth and engagement patterns.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">User Retention</h4>
                  <p className="text-sm text-muted-foreground">
                    Monitor how well you retain users over time, indicating product stickiness and user satisfaction.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Conversion Funnel</h4>
                  <p className="text-sm text-muted-foreground">
                    Analyze user journey from first visit to key actions, identifying optimization opportunities.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">User Cohorts</h4>
                  <p className="text-sm text-muted-foreground">
                    Segment users into meaningful groups to understand different behavior patterns and retention rates.
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2 pt-4 border-t">
                <Button variant="outline" size="sm" asChild>
                  <a 
                    href="https://posthog.com/docs" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center space-x-2"
                  >
                    <ExternalLink className="h-4 w-4" />
                    <span>PostHog Documentation</span>
                  </a>
                </Button>
                <Badge variant="outline">Real-time Data</Badge>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
