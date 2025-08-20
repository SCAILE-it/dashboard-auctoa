// Google Analytics 4 data adapter - Unified interface for website traffic data

import { ga4Client, ga4PropertyId } from '@/lib/ga4-client';
import type { 
  GAAdapter, 
  GATotals, 
  GASeriesPoint, 
  GATopPage,
  GASource,
  Granularity
} from '@/types/analytics';

/**
 * Get Google Analytics 4 traffic series data
 * Uses real GA4 API when credentials are configured, fallback to mock data
 */
export async function getGaSeries({
  from,
  to,
  granularity
}: {
  from: string;
  to: string;
  granularity: Granularity;
}): Promise<{ 
  totals: GATotals;
  series: GASeriesPoint[];
  topPages: GATopPage[];
  sources: GASource[];
  __mock?: boolean;
}> {
  try {
    const fromDate = new Date(from);
    const toDate = new Date(to);

    // Check if GA4 client is available
    if (!ga4Client) {
      throw new Error('GA4 client not configured. Please check GA4_PROPERTY_ID and GA4_SERVICE_ACCOUNT_KEY environment variables.');
    }

    // Fetch real GA4 data - NO FALLBACK TO MOCK DATA
    try {
      const ga4Data = await fetchRealGA4Data(fromDate, toDate, granularity);
      return ga4Data;
    } catch (apiError) {
      // Re-throw API errors instead of falling back to mock data
      throw new Error(`GA4 API Error: ${apiError instanceof Error ? apiError.message : 'Unknown error'}. Please check your GA4 configuration and internet connection.`);
    }

  } catch (error) {
    // Re-throw all errors - NO FALLBACK TO MOCK DATA
    throw error;
  }
}

/**
 * Fetch real data from Google Analytics 4 API
 */
async function fetchRealGA4Data(
  fromDate: Date,
  toDate: Date,
  _granularity: Granularity
): Promise<{ 
  totals: GATotals;
  series: GASeriesPoint[];
  topPages: GATopPage[];
  sources: GASource[];
  __mock: false;
}> {
  if (!ga4Client) {
    throw new Error('GA4 client not initialized');
  }

  if (!ga4PropertyId) {
    throw new Error('GA4_PROPERTY_ID not configured');
  }

  const startDate = fromDate.toISOString().split('T')[0];
  const endDate = toDate.toISOString().split('T')[0];

  try {
    // Fetch main metrics with date dimension - filtered for Auctoa hostname
    const [mainResponse] = await ga4Client.runReport({
      property: `properties/${ga4PropertyId}`,
      dateRanges: [{ startDate, endDate }],
      dimensions: [{ name: 'date' }],
      metrics: [
        { name: 'activeUsers' },
        { name: 'sessions' },
        { name: 'screenPageViews' },
        { name: 'bounceRate' },
        { name: 'averageSessionDuration' }
      ],
      dimensionFilter: {
        filter: {
          fieldName: 'hostName',
          stringFilter: {
            matchType: 'CONTAINS',
            value: 'auctoa.de'
          }
        }
      },
      orderBys: [{ dimension: { dimensionName: 'date' }, desc: false }]
    });

    // Fetch top pages - filtered for Auctoa hostname
    const [pagesResponse] = await ga4Client.runReport({
      property: `properties/${ga4PropertyId}`,
      dateRanges: [{ startDate, endDate }],
      dimensions: [{ name: 'pagePath' }],
      metrics: [
        { name: 'screenPageViews' },
        { name: 'sessions' }
      ],
      dimensionFilter: {
        filter: {
          fieldName: 'hostName',
          stringFilter: {
            matchType: 'CONTAINS',
            value: 'auctoa.de'
          }
        }
      },
      orderBys: [{ metric: { metricName: 'screenPageViews' }, desc: true }],
      limit: 10
    });

    // Fetch traffic sources - filtered for Auctoa hostname
    const [sourcesResponse] = await ga4Client.runReport({
      property: `properties/${ga4PropertyId}`,
      dateRanges: [{ startDate, endDate }],
      dimensions: [{ name: 'source' }],
      metrics: [{ name: 'sessions' }],
      dimensionFilter: {
        filter: {
          fieldName: 'hostName',
          stringFilter: {
            matchType: 'CONTAINS',
            value: 'auctoa.de'
          }
        }
      },
      orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
      limit: 8
    });

    // Debug logging - data is being fetched successfully


    // Process main metrics
    let totalUsers = 0;
    let totalSessions = 0;
    let totalPageviews = 0;
    let totalBounceRate = 0;
    let totalSessionDuration = 0;

    const series: GASeriesPoint[] = [];

    if (mainResponse.rows) {
      mainResponse.rows.forEach((row) => {
        const date = row.dimensionValues?.[0]?.value || '';
        const users = parseInt(row.metricValues?.[0]?.value || '0');
        const sessions = parseInt(row.metricValues?.[1]?.value || '0');
        const pageviews = parseInt(row.metricValues?.[2]?.value || '0');

        totalUsers += users;
        totalSessions += sessions;
        totalPageviews += pageviews;

        // Convert GA4 date format (YYYYMMDD) to ISO format (YYYY-MM-DD)
        const formattedDate = date.length === 8 
          ? `${date.slice(0, 4)}-${date.slice(4, 6)}-${date.slice(6, 8)}`
          : date;

        series.push({
          ts: formattedDate,
          users,
          sessions,
          pageviews
        });
      });

      // Calculate averages for bounce rate and session duration
      const rowCount = mainResponse.rows.length;
      if (rowCount > 0) {
        totalBounceRate = mainResponse.rows.reduce((sum, row) => 
          sum + parseFloat(row.metricValues?.[3]?.value || '0'), 0) / rowCount;
        totalSessionDuration = mainResponse.rows.reduce((sum, row) => 
          sum + parseFloat(row.metricValues?.[4]?.value || '0'), 0) / rowCount;
      }
    }

    // Process top pages
    const topPages: GATopPage[] = [];
    if (pagesResponse.rows) {
      pagesResponse.rows.forEach((row) => {
        const path = row.dimensionValues?.[0]?.value || '';
        const pageviews = parseInt(row.metricValues?.[0]?.value || '0');
        const sessions = parseInt(row.metricValues?.[1]?.value || '0');

        topPages.push({ path, pageviews, sessions });
      });
    }

    // Process traffic sources
    const sources: GASource[] = [];
    if (sourcesResponse.rows) {
      sourcesResponse.rows.forEach((row) => {
        const source = row.dimensionValues?.[0]?.value || '';
        const sessions = parseInt(row.metricValues?.[0]?.value || '0');

        sources.push({ source, sessions });
      });
    }

    const totals: GATotals = {
      users: totalUsers,
      sessions: totalSessions,
      pageviews: totalPageviews,
      bounceRate: totalBounceRate,
      avgSessionDuration: totalSessionDuration
    };



    return {
      totals,
      series,
      topPages,
      sources,
      __mock: false
    };

  } catch (error) {
    // GA4 API request failed, will use fallback data
    throw error;
  }
}

/**
 * Generate realistic fallback GA4 data for Auctoa real estate website
 */
function generateFallbackData(
  fromDate: Date,
  toDate: Date,
  granularity: Granularity
): { 
  totals: GATotals;
  series: GASeriesPoint[];
  topPages: GATopPage[];
  sources: GASource[];
  __mock: true;
} {
  // Using fallback mock data
  // Generate realistic totals for a real estate website
  const totalUsers = 3247;
  const totalSessions = 4891;
  const totalPageviews = 12673;
  const avgBounceRate = 0.42; // 42% bounce rate (good for real estate)
  const avgSessionDuration = 145; // 2 minutes 25 seconds

  const totals: GATotals = {
    users: totalUsers,
    sessions: totalSessions,
    pageviews: totalPageviews,
    bounceRate: avgBounceRate,
    avgSessionDuration: avgSessionDuration
  };

  // Generate time series data
  const series = generateGA4TimeSeries(fromDate, toDate, granularity, totals);

  // Generate top pages for real estate website
  const topPages: GATopPage[] = [
    { path: '/', pageviews: 2456, sessions: 1834 },
    { path: '/immobilien/muenchen', pageviews: 1789, sessions: 1234 },
    { path: '/immobilien/berlin', pageviews: 1567, sessions: 1098 },
    { path: '/bewertung', pageviews: 1234, sessions: 876 },
    { path: '/ueber-uns', pageviews: 987, sessions: 654 },
    { path: '/immobilien/hamburg', pageviews: 876, sessions: 543 },
    { path: '/kontakt', pageviews: 654, sessions: 432 },
    { path: '/blog', pageviews: 543, sessions: 321 },
    { path: '/immobilien/frankfurt', pageviews: 432, sessions: 287 },
    { path: '/services', pageviews: 321, sessions: 198 }
  ];

  // Generate traffic sources typical for real estate
  const sources: GASource[] = [
    { source: 'google', sessions: 1956 }, // 40% organic search
    { source: 'direct', sessions: 1467 }, // 30% direct traffic
    { source: 'facebook', sessions: 489 }, // 10% social media
    { source: 'immobilienscout24', sessions: 391 }, // 8% referrals
    { source: 'bing', sessions: 293 }, // 6% other search engines
    { source: 'instagram', sessions: 146 }, // 3% social
    { source: 'linkedin', sessions: 97 }, // 2% professional networks
    { source: 'newsletter', sessions: 52 } // 1% email marketing
  ];

  return {
    totals,
    series,
    topPages,
    sources,
    __mock: true
  };
}

/**
 * Generate realistic traffic time series data
 */
function generateGA4TimeSeries(
  fromDate: Date,
  toDate: Date,
  granularity: Granularity,
  totals: GATotals
): GASeriesPoint[] {
  const series: GASeriesPoint[] = [];
  const current = new Date(fromDate);
  const totalDays = Math.ceil((toDate.getTime() - fromDate.getTime()) / (1000 * 60 * 60 * 24));
  
  let dayIndex = 0;

  while (current <= toDate) {
    const nextPeriod = new Date(current);
    if (granularity === 'day') {
      nextPeriod.setDate(nextPeriod.getDate() + 1);
    } else {
      nextPeriod.setDate(nextPeriod.getDate() + 7);
    }

    // Generate realistic daily variation for real estate website
    // Real estate websites typically see:
    // - Higher traffic on weekdays (especially Tuesday-Thursday)
    // - Lower traffic on weekends
    // - Seasonal patterns (higher in spring/fall)
    
    const dayOfWeek = current.getDay();
    let weekdayMultiplier = 1.0;
    
    switch (dayOfWeek) {
      case 0: // Sunday
      case 6: // Saturday
        weekdayMultiplier = 0.7;
        break;
      case 1: // Monday
      case 5: // Friday
        weekdayMultiplier = 0.9;
        break;
      case 2: // Tuesday
      case 3: // Wednesday
      case 4: // Thursday
        weekdayMultiplier = 1.2;
        break;
    }
    
    // Add seasonal variation (real estate is more active in spring/fall)
    const monthOfYear = current.getMonth();
    let seasonalMultiplier = 1.0;
    if (monthOfYear >= 2 && monthOfYear <= 5) { // March-June (spring)
      seasonalMultiplier = 1.15;
    } else if (monthOfYear >= 8 && monthOfYear <= 10) { // Sep-Nov (fall)
      seasonalMultiplier = 1.1;
    } else if (monthOfYear === 11 || monthOfYear === 0) { // Dec-Jan (holidays)
      seasonalMultiplier = 0.8;
    }

    // Add growth trend and random variation
    const growthTrend = 1 + (dayIndex / totalDays) * 0.12; // 12% growth over period
    const randomVariation = 0.85 + Math.random() * 0.3; // ±15% random variation

    const baseUsersPerDay = totals.users / totalDays;
    const baseSessionsPerDay = totals.sessions / totalDays;
    const basePageviewsPerDay = totals.pageviews / totalDays;

    const dayUsers = Math.round(
      baseUsersPerDay * weekdayMultiplier * seasonalMultiplier * growthTrend * randomVariation
    );
    
    const daySessions = Math.round(
      baseSessionsPerDay * weekdayMultiplier * seasonalMultiplier * growthTrend * randomVariation
    );

    const dayPageviews = Math.round(
      basePageviewsPerDay * weekdayMultiplier * seasonalMultiplier * growthTrend * randomVariation
    );

    series.push({
      ts: current.toISOString().split('T')[0],
      users: Math.max(0, dayUsers),
      sessions: Math.max(0, daySessions),
      pageviews: Math.max(0, dayPageviews)
    });

    current.setTime(nextPeriod.getTime());
    dayIndex++;
  }

  return series;
}

/**
 * Calculate "Heute vs Gestern" (Today vs Yesterday) metrics
 */
export async function getTodayVsYesterday(): Promise<{
  pageviewsToday: number;
  pageviewsYesterday: number;
  deltaPct: number;
}> {
  // Mock implementation - would use real GA4 API in production
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  // Simulate realistic daily traffic for Auctoa
  const basePageviews = 420; // Average daily pageviews
  const todayVariation = 0.9 + Math.random() * 0.2; // ±10% variation
  const yesterdayVariation = 0.9 + Math.random() * 0.2;

  const pageviewsToday = Math.round(basePageviews * todayVariation);
  const pageviewsYesterday = Math.round(basePageviews * yesterdayVariation);
  
  const deltaPct = pageviewsYesterday > 0 
    ? ((pageviewsToday - pageviewsYesterday) / pageviewsYesterday) * 100
    : 0;

  return {
    pageviewsToday,
    pageviewsYesterday,
    deltaPct
  };
}



// Export the adapter interface implementation
export const gaAdapter: GAAdapter = {
  getGaSeries
};