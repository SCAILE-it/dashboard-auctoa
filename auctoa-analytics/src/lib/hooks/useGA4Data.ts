// Custom React hook for fetching GA4 data
import { useState, useEffect, useCallback } from 'react';
import { DateRange } from 'react-day-picker';
import { format } from 'date-fns';
import { useOverviewData } from './useOverviewData';

// GA4-specific interfaces
export interface GA4Metrics {
  totalUsers: {
    current: number;
    trend: string;
  };
  totalSessions: {
    current: number;
    trend: string;
  };
  totalPageviews: {
    current: number;
    trend: string;
  };
  avgSessionDuration: {
    current: number; // in seconds
    trend: string;
  };
  bounceRate: {
    current: number; // as decimal (0.42 = 42%)
    trend: string;
  };
}

export interface GA4Insights {
  topPages: Array<{
    path: string;
    pageviews: number;
    sessions: number;
  }>;
  topSources: Array<{
    source: string;
    sessions: number;
  }>;
  totalPages: number;
  totalSources: number;
  isUsingRealData: boolean;
}

interface GA4Data {
  metrics: GA4Metrics;
  insights: GA4Insights;
}

export const useGA4Data = (dateRange: DateRange) => {
  const [data, setData] = useState<GA4Data | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { data: overviewData, loading: overviewLoading, error: overviewError, refetch: refetchOverview } = useOverviewData(dateRange);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (!overviewData) {
        await refetchOverview();
        return;
      }

      const ga4KPIs = overviewData.kpis;
      const ga4Series = overviewData.series.ga;

      // Map overview data to GA4 metrics
      const mappedMetrics: GA4Metrics = {
        totalUsers: {
          current: ga4KPIs.totalUsers?.current || 0,
          trend: ga4KPIs.totalUsers?.trend || '0%',
        },
        totalSessions: {
          current: ga4KPIs.totalSessions?.current || 0,
          trend: ga4KPIs.totalSessions?.trend || '0%',
        },
        totalPageviews: {
          current: ga4KPIs.totalPageviews?.current || 0,
          trend: ga4KPIs.totalPageviews?.trend || '0%',
        },
        avgSessionDuration: {
          current: ga4KPIs.avgSessionDuration?.current || 0,
          trend: ga4KPIs.avgSessionDuration?.trend || '0%',
        },
        bounceRate: {
          current: ga4KPIs.bounceRate?.current || 0,
          trend: ga4KPIs.bounceRate?.trend || '0%',
        },
      };

      // Check if we're using real data
      const isUsingRealData = !overviewData.__mock;

      // Map insights data (would come from dedicated GA4 endpoint in real implementation)
      const mappedInsights: GA4Insights = {
        topPages: [
          { path: '/', pageviews: 2456, sessions: 1834 },
          { path: '/real-estate/munich', pageviews: 1789, sessions: 1234 },
          { path: '/real-estate/berlin', pageviews: 1567, sessions: 1098 },
          { path: '/valuation', pageviews: 1234, sessions: 876 },
          { path: '/about-us', pageviews: 987, sessions: 654 },
        ],
        topSources: [
          { source: 'google', sessions: 1956 },
          { source: 'direct', sessions: 1467 },
          { source: 'facebook', sessions: 489 },
          { source: 'realtor.com', sessions: 391 },
          { source: 'bing', sessions: 293 },
        ],
        totalPages: 25,
        totalSources: 8,
        isUsingRealData,
      };

      setData({
        metrics: mappedMetrics,
        insights: mappedInsights,
      });

    } catch (err) {
      console.error("Failed to fetch GA4 data:", err);
      setError("Failed to load Google Analytics data. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [dateRange, overviewData, refetchOverview]);

  useEffect(() => {
    if (dateRange.from && dateRange.to) {
      fetchData();
    }
  }, [dateRange, fetchData]);

  return { data, loading, error, refetch: fetchData };
};