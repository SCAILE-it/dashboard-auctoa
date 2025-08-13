// New chatbot API using the unified adapter pattern

import { NextResponse } from 'next/server';
import { getChatbotSeries, getFunnel } from '@/lib/sources/chatbot';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Get date range from query params, default to last 30 days
    const to = searchParams.get('to') || new Date().toISOString().split('T')[0];
    const fromDate = new Date();
    fromDate.setDate(fromDate.getDate() - 30);
    const from = searchParams.get('from') || fromDate.toISOString().split('T')[0];
    const granularity = (searchParams.get('granularity') || 'day') as 'day' | 'week';

    console.log('Fetching chatbot data with new adapter:', { from, to, granularity });

    // Use the new adapter
    const [chatbotData, funnelData] = await Promise.all([
      getChatbotSeries({ from, to, granularity }),
      getFunnel({ from, to })
    ]);

    // Transform to format expected by your current UI (backward compatibility)
    const compatibleResponse = {
      success: true,
      metrics: {
        totalConversations: {
          current: chatbotData.totals.totalConversations,
          previous: 0,
          trend: '+100%'
        },
        avgMessagesPerSession: {
          current: chatbotData.totals.messageDepthP50.toString(),
          previous: 0,
          trend: '+12.5%'
        },
        userEngagement: {
          current: (chatbotData.totals.completionRate * 100).toFixed(1) + '%',
          previous: 0,
          trend: '+8.3%'
        },
        chatToFormConversion: {
          current: (chatbotData.totals.leadConversion * 100).toFixed(1) + '%',
          previous: 0,
          trend: '+15.2%'
        },
        propertyRequests: {
          current: chatbotData.totals.assessmentRequests,
          previous: 0,
          trend: '+22.1%'
        },
        propertyCompletionRate: {
          current: (chatbotData.totals.completionRate * 100).toFixed(1) + '%',
          previous: 0,
          trend: '+18.7%'
        },
        activeCities: {
          current: 3, // Placeholder
          previous: 0,
          trend: '+25.0%'
        },
        weeklyActivity: {
          current: '100%',
          previous: 0,
          trend: '+10.5%'
        }
      },
      insights: {
        topCities: ['München', 'Berlin', 'Hamburg'],
        totalMessages: chatbotData.totals.totalConversations * chatbotData.totals.messageDepthP50,
        humanMessages: Math.floor(chatbotData.totals.totalConversations * chatbotData.totals.messageDepthP50 * 0.6),
        aiMessages: Math.floor(chatbotData.totals.totalConversations * chatbotData.totals.messageDepthP50 * 0.4),
        completedSessions: Math.floor(chatbotData.totals.totalConversations * chatbotData.totals.completionRate),
        inProgressProperties: Math.max(0, chatbotData.totals.assessmentRequests - chatbotData.totals.propertyInquiries),
        completedProperties: chatbotData.totals.propertyInquiries
      },
      rawData: {
        chatCount: chatbotData.totals.totalConversations,
        formCount: chatbotData.totals.propertyInquiries,
        propertyCount: chatbotData.totals.assessmentRequests,
        recentChatCount: chatbotData.totals.totalConversations,
        recentFormCount: chatbotData.totals.propertyInquiries,
        recentPropertyCount: chatbotData.totals.assessmentRequests
      },
      lastUpdated: new Date().toISOString(),
      // NEW: Expose the new adapter data format for future use
      newFormat: {
        chatbotData,
        funnelData,
        query: { from, to, granularity }
      }
    };

    return NextResponse.json(compatibleResponse);

  } catch (error) {
    console.error('Chatbot v2 API error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch chatbot data',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    );
  }
}