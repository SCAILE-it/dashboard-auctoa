'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RefreshCw, ExternalLink, AlertCircle, CheckCircle, Smartphone, Monitor, Globe } from "lucide-react";
import { SEOAuditKPIs } from "@/components/dashboard/seo-audit/SEOAuditKPIs";
import { SEOAuditCharts } from "@/components/dashboard/seo-audit/SEOAuditCharts";
import { ExportChartDataButton } from "@/components/ui/export-button";
import { exportTimeSeriesToCSV } from "@/lib/csv-export";
import { SEOAuditComparison, SEOAuditApiResponse } from "@/types/seo-audit";

export default function SEOAuditPage() {
  const [data, setData] = useState<SEOAuditComparison | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<string>('');
  const [testUrl, setTestUrl] = useState(process.env.NEXT_PUBLIC_SITE_URL || 'https://auctoa.de');
  const [isCustomUrl, setIsCustomUrl] = useState(false);

  const fetchData = async (url?: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const targetUrl = url || testUrl;
      const apiUrl = new URL('/api/seo-audit', window.location.origin);
      if (targetUrl !== process.env.NEXT_PUBLIC_SITE_URL) {
        apiUrl.searchParams.set('url', targetUrl);
      }

      console.log('🔍 [SEO Audit] Fetching data for:', targetUrl);
      
      const response = await fetch(apiUrl.toString());
      const result: SEOAuditApiResponse = await response.json();

      if (result.success && result.data) {
        setData(result.data);
        setLastRefresh(result.lastRefresh || new Date().toISOString());
      } else {
        throw new Error(result.error || 'Failed to fetch SEO audit data');
      }
    } catch (err) {
      console.error('SEO Audit fetch error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRefresh = () => {
    fetchData();
  };

  const handleUrlTest = () => {
    if (testUrl.trim()) {
      fetchData(testUrl.trim());
      setIsCustomUrl(testUrl.trim() !== process.env.NEXT_PUBLIC_SITE_URL);
    }
  };

  const handleExportData = () => {
    if (!data) return;

    // Prepare data for export
    const exportData = [
      {
        date: new Date().toISOString().split('T')[0],
        device: 'Mobile',
        performanceScore: data.mobile.scores.performance,
        seoScore: data.mobile.scores.seo,
        accessibilityScore: data.mobile.scores.accessibility,
        bestPracticesScore: data.mobile.scores.bestPractices,
        lcp: data.mobile.coreWebVitals.lcp.value,
        inp: data.mobile.coreWebVitals.inp.value,
        cls: data.mobile.coreWebVitals.cls.value,
        fcp: data.mobile.performanceMetrics.fcp.value,
        speedIndex: data.mobile.performanceMetrics.speedIndex.value,
        tbt: data.mobile.performanceMetrics.tbt.value,
        tti: data.mobile.performanceMetrics.tti.value
      },
      {
        date: new Date().toISOString().split('T')[0],
        device: 'Desktop',
        performanceScore: data.desktop.scores.performance,
        seoScore: data.desktop.scores.seo,
        accessibilityScore: data.desktop.scores.accessibility,
        bestPracticesScore: data.desktop.scores.bestPractices,
        lcp: data.desktop.coreWebVitals.lcp.value,
        inp: data.desktop.coreWebVitals.inp.value,
        cls: data.desktop.coreWebVitals.cls.value,
        fcp: data.desktop.performanceMetrics.fcp.value,
        speedIndex: data.desktop.performanceMetrics.speedIndex.value,
        tbt: data.desktop.performanceMetrics.tbt.value,
        tti: data.desktop.performanceMetrics.tti.value
      }
    ];

    exportTimeSeriesToCSV(exportData, 'seo-audit-data');
  };

  // Check if SEO Audit is enabled
  const isEnabled = process.env.NEXT_PUBLIC_ENABLE_SEO_AUDIT === 'true';

  if (!isEnabled) {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">SEO Healthcheck</h2>
        </div>

        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Globe className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">SEO Audit Coming Soon</h3>
            <p className="text-muted-foreground text-center max-w-md">
              Comprehensive SEO and performance auditing powered by PageSpeed Insights and Lighthouse. 
              Get Core Web Vitals, accessibility scores, and actionable recommendations.
            </p>
            <Badge variant="secondary" className="mt-4">
              Feature in Development
            </Badge>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">SEO Healthcheck</h2>
          <p className="text-muted-foreground">
            Comprehensive performance and SEO analysis powered by PageSpeed Insights
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <ExportChartDataButton
            onExport={handleExportData}
            disabled={!data || loading}
            className="text-sm"
          />
          <Button
            onClick={handleRefresh}
            variant="outline"
            size="sm"
            disabled={loading}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            {loading ? "Analyzing..." : "Refresh"}
          </Button>
        </div>
      </div>

      {/* URL Testing Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Test URL
          </CardTitle>
          <CardDescription>
            Analyze any website&apos;s performance and SEO metrics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2">
            <div className="flex-1">
              <Label htmlFor="test-url" className="sr-only">Website URL</Label>
              <Input
                id="test-url"
                type="url"
                placeholder="https://example.com"
                value={testUrl}
                onChange={(e) => setTestUrl(e.target.value)}
                disabled={loading}
              />
            </div>
            <Button 
              onClick={handleUrlTest} 
              disabled={loading || !testUrl.trim()}
              size="sm"
            >
              Analyze
            </Button>
          </div>
          {isCustomUrl && (
            <div className="flex items-center gap-2 mt-2">
              <AlertCircle className="h-4 w-4 text-yellow-600" />
              <span className="text-sm text-muted-foreground">
                Analyzing custom URL: {testUrl}
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {error && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2 text-destructive">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm font-medium">Error: {error}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Current Analysis Status */}
      {data && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium">Analysis Complete</span>
                </div>
                <div className="flex items-center space-x-2 text-muted-foreground">
                  <Globe className="h-4 w-4" />
                  <span className="text-sm">{data.mobile.url}</span>
                </div>
              </div>
              <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                <div className="flex items-center space-x-1">
                  <Smartphone className="h-4 w-4" />
                  <span>Mobile</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Monitor className="h-4 w-4" />
                  <span>Desktop</span>
                </div>
                {data.mobile.hasFieldData && (
                  <Badge variant="secondary" className="text-xs">
                    Real User Data
                  </Badge>
                )}
              </div>
            </div>
            {lastRefresh && (
              <p className="text-xs text-muted-foreground mt-2">
                Last updated: {new Date(lastRefresh).toLocaleString()}
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* KPIs */}
      {data && (
        <div>
          <h3 className="text-lg font-semibold mb-4">Key Metrics</h3>
          <SEOAuditKPIs kpis={data.mobile.kpis} loading={loading} />
        </div>
      )}

      {/* Charts and Analysis */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Detailed Analysis</h3>
        <SEOAuditCharts data={data} loading={loading} />
      </div>

      {/* Additional Information */}
      {data && (
        <Card>
          <CardHeader>
            <CardTitle>About This Analysis</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <h4 className="font-medium mb-2">Data Sources</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Lighthouse (Lab Data): Simulated performance metrics</li>
                  {data.mobile.hasFieldData && (
                    <li>• Chrome User Experience Report: Real user metrics</li>
                  )}
                  <li>• PageSpeed Insights API: Google&apos;s performance analysis</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">Score Ranges</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• 90-100: Good</li>
                  <li>• 50-89: Needs Improvement</li>
                  <li>• 0-49: Poor</li>
                </ul>
              </div>
            </div>
            
            <div className="pt-4 border-t">
              <p className="text-xs text-muted-foreground">
                Performance scores can vary between runs due to network conditions, device capabilities, and other factors. 
                For the most accurate assessment, consider multiple test runs and real user monitoring.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
