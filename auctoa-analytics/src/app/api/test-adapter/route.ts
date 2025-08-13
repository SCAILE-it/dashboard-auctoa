// Test route to verify the new chatbot adapter works

import { NextResponse } from 'next/server';
import { getChatbotSeries, getFunnel } from '@/lib/sources/chatbot';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Default to last 30 days if no params provided
    const to = searchParams.get('to') || new Date().toISOString().split('T')[0];
    const fromDate = new Date();
    fromDate.setDate(fromDate.getDate() - 30);
    const from = searchParams.get('from') || fromDate.toISOString().split('T')[0];
    const granularity = (searchParams.get('granularity') || 'day') as 'day' | 'week';

    console.log('Testing adapter with params:', { from, to, granularity });

    // Test both functions
    const [chatbotData, funnelData] = await Promise.all([
      getChatbotSeries({ from, to, granularity }),
      getFunnel({ from, to })
    ]);

    return NextResponse.json({
      success: true,
      adapter_test: {
        chatbot_series: chatbotData,
        funnel_data: funnelData,
        params_used: { from, to, granularity }
      },
      message: 'Adapter test successful!'
    });

  } catch (error) {
    console.error('Adapter test error:', error);
    return NextResponse.json(
      { 
        error: 'Adapter test failed', 
        details: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    );
  }
}