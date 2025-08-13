import { useState, useEffect, useCallback } from 'react';

interface AuctoaMetrics {
  totalConversations: {
    current: number;
    previous: number;
    trend: string;
  };
  avgMessagesPerSession: {
    current: string;
    previous: number;
    trend: string;
  };
  userEngagement: {
    current: string;
    previous: number;
    trend: string;
  };
  chatToFormConversion: {
    current: string;
    previous: number;
    trend: string;
  };
  propertyRequests: {
    current: number;
    previous: number;
    trend: string;
  };
  propertyCompletionRate: {
    current: string;
    previous: number;
    trend: string;
  };
  activeCities: {
    current: number;
    previous: number;
    trend: string;
  };
  weeklyActivity: {
    current: string;
    previous: number;
    trend: string;
  };
}

interface AuctoaInsights {
  topCities: string[];
  totalMessages: number;
  humanMessages: number;
  aiMessages: number;
  completedSessions: number;
  inProgressProperties: number;
  completedProperties: number;
}

interface AuctoaData {
  success: boolean;
  metrics: AuctoaMetrics;
  insights: AuctoaInsights;
  rawData: {
    chatCount: number;
    formCount: number;
    propertyCount: number;
    recentChatCount: number;
    recentFormCount: number;
    recentPropertyCount: number;
  };
  lastUpdated: string;
}

export function useAuctoaData(dateRange?: { from: Date; to: Date }) {
  const [data, setData] = useState<AuctoaData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Build URL with date parameters if provided
      let url = '/api/chatbot-v2';
      if (dateRange) {
        const params = new URLSearchParams({
          from: dateRange.from.toISOString().split('T')[0],
          to: dateRange.to.toISOString().split('T')[0]
        });
        url += `?${params.toString()}`;
      }
      
      console.log('Fetching Auctoa data from NEW adapter API with params:', url);
      const response = await fetch(url);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error Response:', errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result: AuctoaData = await response.json();
      console.log('Auctoa data fetched successfully:', result);
      setData(result);
    } catch (err) {
      console.error('Failed to fetch Auctoa data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  }, [dateRange]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    refetch: fetchData
  };
}