import { NextResponse } from 'next/server';
import { getOverview } from '@/lib/overview';

export async function GET() {
  try {
    console.log('🧪 [Test] Testing overview aggregation...');
    
    // Test with last 7 days
    const to = new Date().toISOString().split('T')[0];
    const from = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    console.log(`🧪 [Test] Date range: ${from} to ${to}`);
    
    const overview = await getOverview({ from, to, granularity: 'day' });
    
    // Extract key metrics for easy inspection
    const summary = {
      dateRange: `${from} to ${to}`,
      sourcesNote: overview.sourcesNote,
      kpiCount: Object.keys(overview.kpis).length,
      seriesCount: {
        traffic: overview.series.traffic.length,
        search: overview.series.search.length,
        chatbot: overview.series.chatbot.length,
        funnel: overview.series.funnel.length
      },
      sampleKPIs: {
        totalConversations: overview.kpis.totalConversations,
        totalUsers: overview.kpis.totalUsers,
        searchClicks: overview.kpis.searchClicks,
        todayVsYesterday: overview.kpis.today
      },
      topPagesCount: overview.top.pages.length,
      sourcesCount: overview.top.sources.length
    };
    
    console.log('✅ [Test] Overview aggregation successful!');
    console.log('📊 [Test] Summary:', JSON.stringify(summary, null, 2));
    
    return NextResponse.json({
      success: true,
      message: 'Overview aggregation test completed successfully',
      summary,
      fullData: overview
    });
    
  } catch (error) {
    console.error('❌ [Test] Overview aggregation failed:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}