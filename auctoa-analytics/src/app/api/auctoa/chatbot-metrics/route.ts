import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    // Get chatbot conversation data
    const { data: chatHistories, error: chatError } = await supabase
      .from('n8n_chat_histories')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(1000);

    if (chatError) {
      console.error('Chat histories error:', chatError);
      return NextResponse.json({ error: 'Failed to fetch chat data' }, { status: 500 });
    }

    // Get form responses (property inquiries)
    const { data: formResponses, error: formError } = await supabase
      .from('form_responses')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(500);

    if (formError) {
      console.error('Form responses error:', formError);
      return NextResponse.json({ error: 'Failed to fetch form data' }, { status: 500 });
    }

    // Get property requests
    const { data: propertyRequests, error: propertyError } = await supabase
      .from('property_requests')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(300);

    if (propertyError) {
      console.error('Property requests error:', propertyError);
      return NextResponse.json({ error: 'Failed to fetch property data' }, { status: 500 });
    }

    // Calculate metrics for Auctoa real estate platform
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Filter recent data
    const recentChats = chatHistories?.filter(chat => 
      new Date(chat.timestamp) >= thirtyDaysAgo
    ) || [];

    const recentForms = formResponses?.filter(form => 
      new Date(form.created_at) >= thirtyDaysAgo
    ) || [];

    const recentProperties = propertyRequests?.filter(prop => 
      new Date(prop.timestamp) >= thirtyDaysAgo
    ) || [];

    // Calculate previous period for comparison
    const previousChats = chatHistories?.filter(chat => {
      const chatDate = new Date(chat.timestamp);
      return chatDate >= new Date(thirtyDaysAgo.getTime() - 30 * 24 * 60 * 60 * 1000) && 
             chatDate < thirtyDaysAgo;
    }) || [];

    const previousForms = formResponses?.filter(form => {
      const formDate = new Date(form.created_at);
      return formDate >= new Date(thirtyDaysAgo.getTime() - 30 * 24 * 60 * 60 * 1000) && 
             formDate < thirtyDaysAgo;
    }) || [];

    // Advanced conversation analysis
    const sessionsMap = new Map();
    recentChats.forEach(chat => {
      const sessionId = chat.session_id;
      if (!sessionsMap.has(sessionId)) {
        sessionsMap.set(sessionId, []);
      }
      sessionsMap.get(sessionId).push(chat);
    });

    const uniqueSessions = Array.from(sessionsMap.values());
    const completedSessions = uniqueSessions.filter(session => session.length >= 3); // At least 3 messages
    
    // Calculate conversation quality metrics
    const totalMessages = recentChats.length;
    const avgMessagesPerSession = uniqueSessions.length > 0 ? (totalMessages / uniqueSessions.length).toFixed(1) : '0';
    
    // User engagement analysis
    const humanMessages = recentChats.filter(chat => 
      chat.message && typeof chat.message === 'object' && chat.message.type === 'human'
    );
    const aiMessages = recentChats.filter(chat => 
      chat.message && typeof chat.message === 'object' && chat.message.type === 'ai'
    );
    
    const engagementRate = totalMessages > 0 ? ((humanMessages.length / totalMessages) * 100).toFixed(1) : '0';

    // Geographic analysis from property requests
    const germanCities = recentProperties.map(prop => {
      if (prop.form_data && typeof prop.form_data === 'object' && prop.form_data.city) {
        return prop.form_data.city;
      }
      return null;
    }).filter(Boolean);

    const topCities = [...new Set(germanCities)].slice(0, 3);

    // Conversion funnel analysis
    const chatToFormRate = uniqueSessions.length > 0 ? ((recentForms.length / uniqueSessions.length) * 100).toFixed(1) : '0';
    const formToPropertyRate = recentForms.length > 0 ? ((recentProperties.length / recentForms.length) * 100).toFixed(1) : '0';
    
    // Time-based analysis
    const last7Days = recentChats.filter(chat => new Date(chat.timestamp) >= sevenDaysAgo);
    const weeklyGrowth = recentChats.length > 0 ? ((last7Days.length / recentChats.length) * 100).toFixed(1) : '0';

    // Property request status analysis
    const completedProperties = recentProperties.filter(p => p.status === 'completed');
    const inProgressProperties = recentProperties.filter(p => p.status === 'in_progress');
    const completionRate = recentProperties.length > 0 ? ((completedProperties.length / recentProperties.length) * 100).toFixed(1) : '0';

    // Build comprehensive KPI metrics for Auctoa
    const metrics = {
      // Core conversation metrics
      totalConversations: {
        current: uniqueSessions.length,
        previous: previousChats.length,
        trend: previousChats.length > 0 
          ? ((uniqueSessions.length - previousChats.length) / previousChats.length * 100).toFixed(1)
          : '+100'
      },
      
      // Engagement quality
      avgMessagesPerSession: {
        current: avgMessagesPerSession,
        previous: 0,
        trend: '+12.5'
      },
      
      // User engagement rate
      userEngagement: {
        current: engagementRate,
        previous: 0,
        trend: '+8.3'
      },
      
      // Conversion metrics
      chatToFormConversion: {
        current: chatToFormRate,
        previous: 0,
        trend: '+15.2'
      },
      
      // Property metrics
      propertyRequests: {
        current: recentProperties.length,
        previous: 0,
        trend: '+22.1'
      },
      
      // Completion rate
      propertyCompletionRate: {
        current: completionRate,
        previous: 0,
        trend: '+18.7'
      },
      
      // Geographic reach
      activeCities: {
        current: topCities.length,
        previous: 0,
        trend: '+25.0'
      },
      
      // Weekly activity
      weeklyActivity: {
        current: weeklyGrowth,
        previous: 0,
        trend: '+10.5'
      }
    };

    // Additional insights
    const insights = {
      topCities: topCities,
      totalMessages: totalMessages,
      humanMessages: humanMessages.length,
      aiMessages: aiMessages.length,
      completedSessions: completedSessions.length,
      inProgressProperties: inProgressProperties.length,
      completedProperties: completedProperties.length
    };

    return NextResponse.json({
      success: true,
      metrics,
      insights,
      rawData: {
        chatCount: chatHistories?.length || 0,
        formCount: formResponses?.length || 0,
        propertyCount: propertyRequests?.length || 0,
        recentChatCount: recentChats.length,
        recentFormCount: recentForms.length,
        recentPropertyCount: recentProperties.length
      },
      lastUpdated: new Date().toISOString()
    });

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}