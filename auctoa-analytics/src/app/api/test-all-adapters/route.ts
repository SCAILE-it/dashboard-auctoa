// Test all data adapters together - comprehensive integration test

import { NextResponse } from 'next/server';
import { getChatbotSeries, getFunnel } from '@/lib/sources/chatbot';
import { getSearchSeries } from '@/lib/sources/gsc';
import { getGaSeries, getTodayVsYesterday } from '@/lib/sources/ga';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Default to last 30 days if no params provided
    const to = searchParams.get('to') || new Date().toISOString().split('T')[0];
    const fromDate = new Date();
    fromDate.setDate(fromDate.getDate() - 30);
    const from = searchParams.get('from') || fromDate.toISOString().split('T')[0];
    const granularity = (searchParams.get('granularity') || 'day') as 'day' | 'week';

    console.log('Testing ALL adapters with params:', { from, to, granularity });

    // Test all adapters in parallel
    const [chatbotData, funnelData, searchData, gaData, todayVsYesterday] = await Promise.all([
      getChatbotSeries({ from, to, granularity }),
      getFunnel({ from, to }),
      getSearchSeries({ from, to, granularity }),
      getGaSeries({ from, to, granularity }),
      getTodayVsYesterday()
    ]);

    // Calculate unified overview metrics
    const unifiedMetrics = {
      // Core business metrics
      totalConversations: chatbotData.totals.totalConversations,
      propertyInquiries: chatbotData.totals.propertyInquiries,
      leadConversion: chatbotData.totals.leadConversion,
      
      // Website performance
      users: gaData.totals.users,
      sessions: gaData.totals.sessions,
      pageviews: gaData.totals.pageviews,
      bounceRate: gaData.totals.bounceRate,
      
      // Search visibility
      searchClicks: searchData.totals.clicks,
      searchImpressions: searchData.totals.impressions,
      searchCTR: searchData.totals.ctr,
      avgSearchPosition: searchData.totals.avgPosition,
      
      // Today's performance
      today: {
        pageviewsToday: todayVsYesterday.pageviewsToday,
        pageviewsYesterday: todayVsYesterday.pageviewsYesterday,
        deltaPct: todayVsYesterday.deltaPct
      }
    };

    return NextResponse.json({
      success: true,
      test_results: {
        // Individual adapter results
        chatbot: {
          totals: chatbotData.totals,
          seriesLength: chatbotData.series.length,
          sampleData: chatbotData.series.slice(0, 3)
        },
        funnel: {
          stages: funnelData.byStage,
          seriesLength: funnelData.series.length
        },
        search: {
          totals: searchData.totals,
          seriesLength: searchData.series.length,
          sampleData: searchData.series.slice(0, 3)
        },
        ga: {
          totals: gaData.totals,
          seriesLength: gaData.series.length,
          sampleData: gaData.series.slice(0, 3),
          topPagesCount: gaData.topPages.length,
          sourcesCount: gaData.sources.length,
          isMock: gaData.__mock
        },
        
        // Unified overview preview
        unified_metrics: unifiedMetrics,
        
        // Data sources status
        data_sources: {
          chatbot: {
            status: 'live',
            source: 'Supabase',
            description: 'Real chatbot conversation data'
          },
          search: {
            status: 'mock',
            source: 'Generated data',
            description: 'Realistic GSC search performance data'
          },
          analytics: {
            status: 'mock',
            source: 'Generated data', 
            description: 'Realistic GA4 website traffic data'
          }
        }
      },
      params_used: { from, to, granularity },
      message: 'All adapters working successfully! 🎉'
    });

  } catch (error) {
    console.error('All adapters test error:', error);
    return NextResponse.json(
      { 
        error: 'Adapter integration test failed', 
        details: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    );
  }
}