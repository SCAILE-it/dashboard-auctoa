import { useState, useEffect, useCallback } from 'react';
import type { UnifiedOverview } from '../overview';
import { requestCache } from '../utils/request-cache';

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

// Helper function to map unified overview data to legacy AuctoaData format
function mapOverviewToAuctoaData(overview: UnifiedOverview): AuctoaData {
  // Extract trend percentage as number (remove + and % signs)
  const parseTrend = (trend: string): number => {
    const cleaned = trend.replace(/[+%]/g, '');
    return parseFloat(cleaned) || 0;
  };

  // Calculate previous values from current and trend
  const calculatePrevious = (current: number, trendPercent: number): number => {
    if (trendPercent === 0) return current;
    return Math.round(current / (1 + trendPercent / 100));
  };

  const conversations = overview.kpis.totalConversations;
  const inquiries = overview.kpis.propertyInquiries;
  const conversion = overview.kpis.leadConversion;
  
  const conversationsTrend = parseTrend(conversations.trend);
  const inquiriesTrend = parseTrend(inquiries.trend);

  return {
    success: true,
    metrics: {
      totalConversations: {
        current: conversations.current,
        previous: calculatePrevious(conversations.current, conversationsTrend),
        trend: conversations.trend
      },
      avgMessagesPerSession: {
        current: "10", // Static for now - could be enhanced from series data
        previous: 9,
        trend: "+11.1%"
      },
      userEngagement: {
        current: "100.0%", // Static for now
        previous: 95,
        trend: "+5.3%"
      },
      chatToFormConversion: {
        current: "0.0%", // Static for now
        previous: 0,
        trend: "+0.0%"
      },
      propertyRequests: {
        current: inquiries.current,
        previous: calculatePrevious(inquiries.current, inquiriesTrend),
        trend: inquiries.trend
      },
      propertyCompletionRate: {
        current: "100.0%", // Static for now
        previous: 95,
        trend: "+5.3%"
      },
      activeCities: {
        current: 3, // Static for now
        previous: 2,
        trend: "+50.0%"
      },
      weeklyActivity: {
        current: "100%", // Static for now
        previous: 90,
        trend: "+11.1%"
      }
    },
    insights: {
      topCities: ["Berlin", "Munich", "Hamburg"], // Static for now
      totalMessages: conversations.current * 10, // Estimated
      humanMessages: Math.round(conversations.current * 6),
      aiMessages: Math.round(conversations.current * 4),
      completedSessions: conversations.current,
      inProgressProperties: Math.max(0, inquiries.current - Math.round(inquiries.current * 0.8)),
      completedProperties: Math.round(inquiries.current * 0.8)
    },
    rawData: {
      chatCount: conversations.current,
      formCount: inquiries.current,
      propertyCount: Math.round(inquiries.current * 0.8),
      recentChatCount: conversations.current,
      recentFormCount: inquiries.current,
      recentPropertyCount: Math.round(inquiries.current * 0.8)
    },
    lastUpdated: new Date().toISOString()
  };
}

export function useAuctoaData(dateRange?: { from: Date; to: Date }) {
  const [data, setData] = useState<AuctoaData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Build URL with date parameters for the NEW overview API
      let url = '/api/overview';
      const params = new URLSearchParams();
      
      if (dateRange) {
        params.set('from', dateRange.from.toISOString().split('T')[0]);
        params.set('to', dateRange.to.toISOString().split('T')[0]);
      } else {
        // Default to last 30 days if no date range provided
        const to = new Date().toISOString().split('T')[0];
        const from = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        params.set('from', from);
        params.set('to', to);
      }
      
      params.set('granularity', 'day');
      url += `?${params.toString()}`;
      
      console.log('🚀 Fetching REAL trend data from overview API:', url);
      
      // Use request cache to deduplicate identical calls
      const cacheKey = `auctoa-overview-${params.toString()}`;
      
      const result = await requestCache.get(cacheKey, async () => {
        const response = await fetch(url);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('API Error Response:', errorText);
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return response.json();
      });
      
      if (!result.success || !result.data) {
        throw new Error('Invalid response format from overview API');
      }
      
      console.log('✅ Overview data fetched, mapping to legacy format...');
      
      // Map the new unified data structure to the legacy format
      const mappedData = mapOverviewToAuctoaData(result.data);
      
      console.log('🎯 Real trend data mapped successfully:', {
        conversations: mappedData.metrics.totalConversations,
        propertyRequests: mappedData.metrics.propertyRequests
      });
      
      setData(mappedData);
    } catch (err) {
      console.error('❌ Failed to fetch overview data:', err);
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