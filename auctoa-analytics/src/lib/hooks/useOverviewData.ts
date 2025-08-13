import { useState, useEffect, useCallback } from 'react';
import type { UnifiedOverview } from '../overview';

export function useOverviewData(dateRange?: { from: Date; to: Date }) {
  const [data, setData] = useState<UnifiedOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      let url = '/api/overview';
      const params = new URLSearchParams();
      
      if (dateRange) {
        params.set('from', dateRange.from.toISOString().split('T')[0]);
        params.set('to', dateRange.to.toISOString().split('T')[0]);
      } else {
        // Default to last 30 days
        const to = new Date();
        const from = new Date();
        from.setDate(from.getDate() - 30);
        params.set('from', from.toISOString().split('T')[0]);
        params.set('to', to.toISOString().split('T')[0]);
      }
      
      params.set('granularity', 'day');
      url += `?${params.toString()}`;

      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch overview data: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (result.success && result.data) {
        setData(result.data);
      } else {
        throw new Error(result.error || 'Unknown error occurred');
      }
    } catch (err) {
      console.error('Error fetching overview data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [dateRange]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const refetch = useCallback(() => {
    return fetchData();
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    refetch
  };
}