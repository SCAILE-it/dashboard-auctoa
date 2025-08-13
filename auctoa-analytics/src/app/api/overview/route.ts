import { NextRequest, NextResponse } from 'next/server';
import { getOverview } from '@/lib/overview';
import type { Granularity } from '@/types/analytics';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Parse query parameters
    const from = searchParams.get('from');
    const to = searchParams.get('to');
    const granularity = (searchParams.get('granularity') || 'day') as Granularity;
    
    // Validate required parameters
    if (!from || !to) {
      return NextResponse.json(
        { 
          error: 'Missing required parameters', 
          details: 'Both "from" and "to" date parameters are required (YYYY-MM-DD format)' 
        },
        { status: 400 }
      );
    }
    
    // Validate date format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(from) || !dateRegex.test(to)) {
      return NextResponse.json(
        { 
          error: 'Invalid date format', 
          details: 'Dates must be in YYYY-MM-DD format' 
        },
        { status: 400 }
      );
    }
    
    // Validate granularity
    if (!['day', 'week'].includes(granularity)) {
      return NextResponse.json(
        { 
          error: 'Invalid granularity', 
          details: 'Granularity must be either "day" or "week"' 
        },
        { status: 400 }
      );
    }
    
    console.log(`🚀 [API] Overview request: ${from} to ${to} (${granularity})`);
    
    // Fetch aggregated overview data
    const overview = await getOverview({ from, to, granularity });
    
    console.log(`✅ [API] Overview response ready with ${Object.keys(overview.kpis).length} KPIs`);
    
    return NextResponse.json({
      success: true,
      data: overview,
      meta: {
        requestedRange: { from, to, granularity },
        generatedAt: new Date().toISOString(),
        sources: ['chatbot', 'gsc', 'ga4'],
        dataFreshness: 'live'
      }
    });
    
  } catch (error) {
    console.error('❌ [API] Overview error:', error);
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Internal server error', 
        details: error instanceof Error ? error.message : 'Unknown error occurred',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}