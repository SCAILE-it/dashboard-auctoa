// Google Search Console data adapter - Unified interface for search performance data

import { gscSupabase, GSCRecord } from '@/lib/supabase-gsc';
import type { 
  SearchAdapter, 
  SearchTotals, 
  SearchSeriesPoint, 
  Granularity,
  DataSource 
} from '@/types/analytics';

/**
 * Get Google Search Console analytics series data
 * Currently uses mock data - will connect to Supabase GSC cache when available
 */
export async function getSearchSeries({
  from,
  to,
  granularity
}: {
  from: string;
  to: string;
  granularity: Granularity;
}): Promise<DataSource<SearchTotals> & { series: SearchSeriesPoint[] }> {
  try {
    const fromDate = new Date(from);
    const toDate = new Date(to);

    // Quick check - if table doesn't exist, immediately return fallback

    
    let gscData, error;
    
    // Check if GSC Supabase client is available
    if (!gscSupabase) {
      throw new Error('GSC Supabase client not configured. Please check NEXT_PUBLIC_GSC_SUPABASE_URL and GSC_SUPABASE_SERVICE_ROLE_KEY environment variables.');
    }

    // Single quick try - don't waste time on multiple attempts
    try {
      const result = await gscSupabase
        .from('Google_Search_Console')
        .select('*')
        .gte('date', fromDate.toISOString().split('T')[0])
        .lte('date', toDate.toISOString().split('T')[0])
        .order('date', { ascending: true })
        .limit(100); // Limit results for faster response
      
      gscData = result.data;
      error = result.error;
    } catch (quickError) {
      throw new Error(`GSC Supabase Error: ${quickError instanceof Error ? quickError.message : 'Unknown error'}. Please check your GSC Supabase configuration.`);
    }

    if (error) {
      throw new Error(`GSC Supabase Error: ${error.message || 'Unknown database error'}`);
    }

    if (!gscData || gscData.length === 0) {
      throw new Error('No GSC data found for the selected date range. Please ensure data exists in the Google_Search_Console table.');
    }

    console.log(`GSC Adapter: Fetched ${gscData.length} records from Supabase`);

    // Process real data: aggregate by date and calculate totals
    const dataByDate = new Map<string, {
      clicks: number;
      impressions: number;
      position: number;
      count: number;
    }>();

    let totalClicks = 0;
    let totalImpressions = 0;
    let totalPosition = 0;
    let positionCount = 0;

    gscData.forEach((row: GSCRecord, index: number) => {
      // Log first few rows to understand the data structure
      if (index < 3) {
        console.log('GSC Row sample:', JSON.stringify(row, null, 2));
      }
      
      const dateKey = row.date || row.created_at?.split('T')[0];
      const clicks = parseInt(String(row.daily_clicks || 0));
      const impressions = parseInt(String(row.daily_impressions || 0));
      // Add fallback for position - might be stored differently
      const position = parseFloat(String(row.position || row.avg_position || row.average_position || 0));

      if (!dateKey) {
        console.log('Skipping row - no date found:', row);
        return;
      }

      totalClicks += clicks;
      totalImpressions += impressions;
      if (position > 0) {
        totalPosition += position;
        positionCount++;
      }

      const existing = dataByDate.get(dateKey) || { clicks: 0, impressions: 0, position: 0, count: 0 };
      dataByDate.set(dateKey, {
        clicks: existing.clicks + clicks,
        impressions: existing.impressions + impressions,
        position: existing.position + position,
        count: existing.count + 1
      });
    });

    console.log(`GSC Processing complete: ${totalClicks} clicks, ${totalImpressions} impressions from ${gscData.length} rows`);

    const avgCTR = totalImpressions > 0 ? totalClicks / totalImpressions : 0;
    const avgPosition = positionCount > 0 ? totalPosition / positionCount : 0;

    const totals: SearchTotals = {
      clicks: totalClicks,
      impressions: totalImpressions,
      ctr: avgCTR,
      avgPosition: avgPosition
    };

    // Convert aggregated data to time series
    const series: SearchSeriesPoint[] = Array.from(dataByDate.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, data]) => ({
        ts: date,
        clicks: data.clicks,
        impressions: data.impressions,
        ctr: data.impressions > 0 ? data.clicks / data.impressions : 0,
        avgPosition: data.count > 0 ? data.position / data.count : 0
      }));

    return {
      totals,
      series
    };

  } catch (error) {
    console.error('GSC adapter error:', error);
    
    // Re-throw all errors - NO FALLBACK TO MOCK DATA
    throw error;
  }
}

/**
 * Generate fallback data when Supabase data is unavailable
 */
function generateFallbackData(
  fromDate: Date,
  toDate: Date,
  granularity: Granularity
): DataSource<SearchTotals> & { series: SearchSeriesPoint[] } {
  console.log('GSC Adapter: Using fallback mock data');

  // Generate realistic mock data for Auctoa real estate business
  const totalClicks = 847;
  const totalImpressions = 12450;
  const avgCTR = totalClicks / totalImpressions;
  const avgPosition = 8.3;

  const totals: SearchTotals = {
    clicks: totalClicks,
    impressions: totalImpressions,
    ctr: avgCTR,
    avgPosition: avgPosition
  };

  // Generate time series data
  const series = generateSearchTimeSeries(fromDate, toDate, granularity, totals);

  return {
    totals,
    series
  };
}

/**
 * Generate realistic search performance time series data
 */
function generateSearchTimeSeries(
  fromDate: Date,
  toDate: Date,
  granularity: Granularity,
  totals: SearchTotals
): SearchSeriesPoint[] {
  const series: SearchSeriesPoint[] = [];
  const current = new Date(fromDate);
  const totalDays = Math.ceil((toDate.getTime() - fromDate.getTime()) / (1000 * 60 * 60 * 24));
  
  // Real estate search keywords might have weekly patterns
  const realEstateKeywords = [
    'immobilien münchen',
    'wohnung kaufen berlin',
    'haus mieten hamburg',
    'immobilienbewertung',
    'wohnungspreise deutschland',
    'immobilienmakler',
    'grundstück kaufen',
    'mietwohnung finden'
  ];

  let dayIndex = 0;

  while (current <= toDate) {
    const nextPeriod = new Date(current);
    if (granularity === 'day') {
      nextPeriod.setDate(nextPeriod.getDate() + 1);
    } else {
      nextPeriod.setDate(nextPeriod.getDate() + 7);
    }

    // Generate realistic daily variation
    // Real estate searches are typically higher on weekdays, lower on weekends
    const dayOfWeek = current.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const weekdayMultiplier = isWeekend ? 0.6 : 1.2;
    
    // Add some seasonal variation and growth trend
    const seasonalVariation = 1 + 0.1 * Math.sin((dayIndex / totalDays) * 2 * Math.PI);
    const growthTrend = 1 + (dayIndex / totalDays) * 0.15; // 15% growth over period
    const randomVariation = 0.8 + Math.random() * 0.4; // ±20% random variation

    const baseClicksPerDay = totals.clicks / totalDays;
    const baseImpressionsPerDay = totals.impressions / totalDays;

    const dayClicks = Math.round(
      baseClicksPerDay * weekdayMultiplier * seasonalVariation * growthTrend * randomVariation
    );
    
    const dayImpressions = Math.round(
      baseImpressionsPerDay * weekdayMultiplier * seasonalVariation * growthTrend * randomVariation
    );

    const dayCTR = dayImpressions > 0 ? dayClicks / dayImpressions : 0;
    
    // Position tends to be better (lower number) when CTR is higher
    const dayPosition = totals.avgPosition * (1 - (dayCTR - totals.ctr) * 2);

    series.push({
      ts: current.toISOString().split('T')[0],
      clicks: Math.max(0, dayClicks),
      impressions: Math.max(0, dayImpressions),
      ctr: Math.max(0, Math.min(1, dayCTR)),
      avgPosition: Math.max(1, Math.min(100, dayPosition))
    });

    current.setTime(nextPeriod.getTime());
    dayIndex++;
  }

  return series;
}

/**
 * Get top performing keywords (mock implementation)
 */
export async function getTopKeywords({
  from,
  to,
  limit = 10
}: {
  from: string;
  to: string;
  limit?: number;
}): Promise<Array<{
  query: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}>> {
  // Mock data for German real estate keywords
  const mockKeywords = [
    { query: 'immobilien münchen', clicks: 156, impressions: 2340, ctr: 0.067, position: 4.2 },
    { query: 'wohnung kaufen berlin', clicks: 134, impressions: 1980, ctr: 0.068, position: 5.1 },
    { query: 'haus mieten hamburg', clicks: 89, impressions: 1456, ctr: 0.061, position: 6.3 },
    { query: 'immobilienbewertung', clicks: 78, impressions: 1234, ctr: 0.063, position: 7.1 },
    { query: 'wohnungspreise deutschland', clicks: 67, impressions: 1890, ctr: 0.035, position: 12.4 },
    { query: 'immobilienmakler münchen', clicks: 54, impressions: 876, ctr: 0.062, position: 8.9 },
    { query: 'grundstück kaufen', clicks: 43, impressions: 723, ctr: 0.059, position: 9.2 },
    { query: 'mietwohnung finden', clicks: 39, impressions: 1123, ctr: 0.035, position: 15.6 },
    { query: 'hauspreise münchen', clicks: 34, impressions: 567, ctr: 0.060, position: 11.3 },
    { query: 'wohnung mieten berlin', clicks: 28, impressions: 445, ctr: 0.063, position: 7.8 }
  ];

  return mockKeywords.slice(0, limit);
}

// Export the adapter interface implementation
export const gscAdapter: SearchAdapter = {
  getSearchSeries
};