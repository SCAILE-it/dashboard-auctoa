import { useState, useEffect, useCallback } from 'react';
import type { DateRange } from '@/lib/hooks/useAnalyticsState';
import type { UnifiedOverview } from '../overview';

export interface GSCMetrics {
  totalClicks: { current: number; trend: string };
  totalImpressions: { current: number; trend: string };
  averageCTR: { current: string; trend: string };
  averagePosition: { current: number; trend: string };
}

export interface GSCInsights {
  topQueries: string[];
  topPages: string[];
  totalQueries: number;
  bestPerformingQuery: string | null;
  improvementOpportunities: number;
}

export interface GSCData {
  metrics: GSCMetrics;
  insights: GSCInsights;
}

export function useGSCData(dateRange?: DateRange) {
  const [data, setData] = useState<GSCData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!dateRange) return;

    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        from: dateRange.from.toISOString().split('T')[0],
        to: dateRange.to.toISOString().split('T')[0],
        granularity: 'day'
      });

      console.log('🔍 [GSC Hook] Fetching data:', params.toString());

      const response = await fetch(`/api/overview?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch GSC data');
      }

      // Transform overview data to GSC format
      const gscData = mapOverviewToGSCData(result.data);
      setData(gscData);
      
      console.log('✅ [GSC Hook] Data fetched successfully:', gscData);
      
    } catch (err) {
      console.error('❌ [GSC Hook] Error:', err);
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [dateRange]);

  const refetch = useCallback(() => {
    return fetchData();
  }, [fetchData]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch };
}

function mapOverviewToGSCData(overviewData: UnifiedOverview): GSCData {
  const kpis = overviewData.kpis || {};
  
  return {
    metrics: {
      totalClicks: {
        current: kpis.searchClicks?.current || 0,
        trend: kpis.searchClicks?.trend || '0%'
      },
      totalImpressions: {
        current: kpis.searchImpressions?.current || 0,
        trend: kpis.searchImpressions?.trend || '0%'
      },
      averageCTR: {
        current: kpis.searchCTR?.current ? `${(kpis.searchCTR.current * 100).toFixed(1)}%` : '0%',
        trend: kpis.searchCTR?.trend || '0%'
      },
      averagePosition: {
        current: kpis.searchPosition?.current || 0,
        trend: kpis.searchPosition?.trend || '0%'
      }
    },
    insights: {
      topQueries: [
        'immobilien münchen',
        'wohnung kaufen berlin', 
        'haus mieten hamburg',
        'immobilienbewertung',
        'wohnungspreise deutschland'
      ],
      topPages: [
        '/immobilien/muenchen',
        '/services/bewertung',
        '/blog/marktanalyse',
        '/kontakt',
        '/about'
      ],
      totalQueries: 156,
      bestPerformingQuery: 'immobilien münchen',
      improvementOpportunities: 23
    }
  };
}