import { getChatbotSeries, getFunnel } from './sources/chatbot';
import { getSearchSeries } from './sources/gsc';
import { getGaSeries } from './sources/ga';
import type { 
  ChatbotData, 
  FunnelData, 
  SearchData, 
  GaData,
  Granularity 
} from '../types/analytics';

// Unified overview interfaces
export interface UnifiedKPIs {
  // Traffic & Users (from GA4)
  totalUsers: {
    current: number;
    trend: string;
    source: string;
  };
  totalSessions: {
    current: number;
    trend: string;
    source: string;
  };
  totalPageviews: {
    current: number;
    trend: string;
    source: string;
  };
  
  // Search Performance (from GSC)
  searchClicks: {
    current: number;
    trend: string;
    source: string;
  };
  searchImpressions: {
    current: number;
    trend: string;
    source: string;
  };
  searchCTR: {
    current: number;
    trend: string;
    source: string;
  };
  
  // Chatbot Performance (from Supabase)
  totalConversations: {
    current: number;
    trend: string;
    source: string;
  };
  propertyInquiries: {
    current: number;
    trend: string;
    source: string;
  };
  leadConversion: {
    current: number;
    trend: string;
    source: string;
  };
  
  // Today vs Yesterday mini-KPI
  today: {
    pageviewsToday: number;
    pageviewsYesterday: number;
    deltaPct: string;
  };
}

export interface UnifiedSeries {
  traffic: GaData['series'];
  search: SearchData['series'];
  chatbot: ChatbotData['series'];
  funnel: FunnelData['series'];
}

export interface UnifiedOverview {
  range: {
    from: string;
    to: string;
    granularity: Granularity;
  };
  sourcesNote: string;
  kpis: UnifiedKPIs;
  series: UnifiedSeries;
  top: {
    pages: GaData['topPages'];
    sources: GaData['sources'];
  };
}

// Helper function to calculate previous period
function calculatePreviousPeriod(from: string, to: string): { from: string; to: string } {
  const fromDate = new Date(from);
  const toDate = new Date(to);
  const daysDiff = Math.ceil((toDate.getTime() - fromDate.getTime()) / (1000 * 60 * 60 * 24));
  
  const prevToDate = new Date(fromDate);
  prevToDate.setDate(prevToDate.getDate() - 1); // End previous period 1 day before current start
  
  const prevFromDate = new Date(prevToDate);
  prevFromDate.setDate(prevFromDate.getDate() - daysDiff + 1); // Same length as current period
  
  return {
    from: prevFromDate.toISOString().split('T')[0],
    to: prevToDate.toISOString().split('T')[0]
  };
}

// Helper function to calculate delta percentage
function calculateDelta(current: number, previous: number): { absolute: number; percent: string } {
  if (previous === 0) {
    return { 
      absolute: current, 
      percent: current > 0 ? '+100%' : '0%' 
    };
  }
  
  const absolute = current - previous;
  const percent = ((absolute / previous) * 100);
  const sign = percent >= 0 ? '+' : '';
  
  return {
    absolute,
    percent: `${sign}${percent.toFixed(1)}%`
  };
}

// Helper function to get today/yesterday for mini-KPI
function getTodayYesterdayDates() {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  return {
    today: today.toISOString().split('T')[0],
    yesterday: yesterday.toISOString().split('T')[0]
  };
}

/**
 * Main overview aggregation function
 * Fetches data from all adapters, calculates deltas, and returns unified structure
 */
export async function getOverview({
  from,
  to,
  granularity = 'day'
}: {
  from: string;
  to: string;
  granularity?: Granularity;
}): Promise<UnifiedOverview> {
  try {
    console.log(`🔄 [Overview] Fetching data for ${from} to ${to} (${granularity})`);
    
    // Step 1: Parallel fetch current period data from all adapters
    const [chatbotData, funnelData, searchData, gaData] = await Promise.all([
      getChatbotSeries({ from, to, granularity }).catch(err => {
        console.warn('⚠️ [Overview] Chatbot adapter failed:', err.message);
        return null;
      }),
      getFunnel({ from, to }).catch(err => {
        console.warn('⚠️ [Overview] Funnel adapter failed:', err.message);
        return null;
      }),
      getSearchSeries({ from, to, granularity }).catch(err => {
        console.warn('⚠️ [Overview] Search adapter failed:', err.message);
        return null;
      }),
      getGaSeries({ from, to, granularity }).catch(err => {
        console.warn('⚠️ [Overview] GA adapter failed:', err.message);
        return null;
      })
    ]);
    
    // Step 2: Calculate previous period and fetch previous data for trends
    const prevPeriod = calculatePreviousPeriod(from, to);
    console.log(`📊 [Overview] Previous period: ${prevPeriod.from} to ${prevPeriod.to}`);
    
    const [prevChatbot, prevFunnel, prevSearch, prevGa] = await Promise.all([
      chatbotData ? getChatbotSeries({ ...prevPeriod, granularity }).catch(() => null) : null,
      funnelData ? getFunnel(prevPeriod).catch(() => null) : null,
      searchData ? getSearchSeries({ ...prevPeriod, granularity }).catch(() => null) : null,
      gaData ? getGaSeries({ ...prevPeriod, granularity }).catch(() => null) : null
    ]);
    
    // Step 3: Get today/yesterday data for mini-KPI
    const { today, yesterday } = getTodayYesterdayDates();
    const [todayGa, yesterdayGa] = await Promise.all([
      gaData ? getGaSeries({ from: today, to: today, granularity: 'day' }).catch(() => null) : null,
      gaData ? getGaSeries({ from: yesterday, to: yesterday, granularity: 'day' }).catch(() => null) : null
    ]);
    
    // Step 4: Calculate trends for all KPIs
    const trends = {
      users: gaData && prevGa ? calculateDelta(gaData.totals.users, prevGa.totals.users) : { percent: '0%' },
      sessions: gaData && prevGa ? calculateDelta(gaData.totals.sessions, prevGa.totals.sessions) : { percent: '0%' },
      pageviews: gaData && prevGa ? calculateDelta(gaData.totals.pageviews, prevGa.totals.pageviews) : { percent: '0%' },
      avgSessionDuration: gaData && prevGa ? calculateDelta(gaData.totals.avgSessionDuration, prevGa.totals.avgSessionDuration) : { percent: '0%' },
      bounceRate: gaData && prevGa ? calculateDelta(gaData.totals.bounceRate, prevGa.totals.bounceRate) : { percent: '0%' },
      searchClicks: searchData && prevSearch ? calculateDelta(searchData.totals.clicks, prevSearch.totals.clicks) : { percent: '0%' },
      searchImpressions: searchData && prevSearch ? calculateDelta(searchData.totals.impressions, prevSearch.totals.impressions) : { percent: '0%' },
      searchCTR: searchData && prevSearch ? calculateDelta(searchData.totals.ctr, prevSearch.totals.ctr) : { percent: '0%' },
      conversations: chatbotData && prevChatbot ? calculateDelta(chatbotData.totals.totalConversations, prevChatbot.totals.totalConversations) : { percent: '0%' },
      inquiries: chatbotData && prevChatbot ? calculateDelta(chatbotData.totals.propertyInquiries, prevChatbot.totals.propertyInquiries) : { percent: '0%' },
      conversion: chatbotData && prevChatbot ? calculateDelta(chatbotData.totals.leadConversion, prevChatbot.totals.leadConversion) : { percent: '0%' }
    };
    
    // Step 5: Calculate today vs yesterday delta
    const todayYesterdayDelta = todayGa && yesterdayGa 
      ? calculateDelta(todayGa.totals.pageviews, yesterdayGa.totals.pageviews)
      : { percent: '0%' };
    
    // Step 6: Assemble unified KPIs
    const kpis: UnifiedKPIs = {
      // Traffic & Users (GA4)
      totalUsers: {
        current: gaData?.totals.users || 0,
        trend: trends.users.percent,
        source: 'Google Analytics'
      },
      totalSessions: {
        current: gaData?.totals.sessions || 0,
        trend: trends.sessions.percent,
        source: 'Google Analytics'
      },
      totalPageviews: {
        current: gaData?.totals.pageviews || 0,
        trend: trends.pageviews.percent,
        source: 'Google Analytics'
      },
      avgSessionDuration: {
        current: gaData?.totals.avgSessionDuration || 0,
        trend: trends.avgSessionDuration.percent,
        source: 'Google Analytics'
      },
      bounceRate: {
        current: gaData?.totals.bounceRate || 0,
        trend: trends.bounceRate.percent,
        source: 'Google Analytics'
      },
      
      // Search Performance (GSC)
      searchClicks: {
        current: searchData?.totals.clicks || 0,
        trend: trends.searchClicks.percent,
        source: 'Google Search Console'
      },
      searchImpressions: {
        current: searchData?.totals.impressions || 0,
        trend: trends.searchImpressions.percent,
        source: 'Google Search Console'
      },
      searchCTR: {
        current: searchData?.totals.ctr || 0,
        trend: trends.searchCTR.percent,
        source: 'Google Search Console'
      },
      
      // Chatbot Performance (Supabase)
      totalConversations: {
        current: chatbotData?.totals.totalConversations || 0,
        trend: trends.conversations.percent,
        source: 'Chatbot (Supabase)'
      },
      propertyInquiries: {
        current: chatbotData?.totals.propertyInquiries || 0,
        trend: trends.inquiries.percent,
        source: 'Chatbot (Supabase)'
      },
      leadConversion: {
        current: chatbotData?.totals.leadConversion || 0,
        trend: trends.conversion.percent,
        source: 'Chatbot (Supabase)'
      },
      
      // Today vs Yesterday
      today: {
        pageviewsToday: todayGa?.totals.pageviews || 0,
        pageviewsYesterday: yesterdayGa?.totals.pageviews || 0,
        deltaPct: todayYesterdayDelta.percent
      }
    };
    
    // Step 7: Assemble unified response
    const overview: UnifiedOverview = {
      range: { from, to, granularity },
      sourcesNote: 'Data Sources: Google Analytics (API), Google Search Console (Supabase), Chatbot (Supabase/n8n)',
      kpis,
      series: {
        traffic: gaData?.series || [],
        search: searchData?.series || [],
        chatbot: chatbotData?.series || [],
        funnel: funnelData?.series || []
      },
      top: {
        pages: gaData?.topPages || [],
        sources: gaData?.sources || []
      }
    };
    
    console.log('✅ [Overview] Successfully aggregated data from all sources');
    console.log(`📊 [Overview] KPIs: ${Object.keys(kpis).length} metrics with real trends`);
    
    return overview;
    
  } catch (error) {
    console.error('❌ [Overview] Failed to aggregate data:', error);
    throw new Error(`Overview aggregation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}