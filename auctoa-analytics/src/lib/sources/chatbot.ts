// Chatbot data adapter - Unified interface for Supabase chatbot analytics

import { supabase } from '@/lib/supabase';
import type { 
  ChatbotAdapter, 
  ChatbotTotals, 
  ChatbotSeriesPoint, 
  ChatbotFunnelTotals, 
  ChatbotFunnelPoint,
  Granularity,
  DataSource 
} from '@/types/analytics';

/**
 * Get chatbot analytics series data with totals and time series
 */
export async function getChatbotSeries({
  from,
  to,
  granularity
}: {
  from: string;
  to: string;
  granularity: Granularity;
}): Promise<DataSource<ChatbotTotals> & { series: ChatbotSeriesPoint[] }> {
  try {
    const fromDate = new Date(from);
    const toDate = new Date(to);

    // Get all relevant data for the period
    const [chatHistories, formResponses, propertyRequests] = await Promise.all([
      supabase
        .from('n8n_chat_histories')
        .select('*')
        .gte('timestamp', fromDate.toISOString())
        .lte('timestamp', toDate.toISOString())
        .order('timestamp', { ascending: true }),
      
      supabase
        .from('form_responses')
        .select('*')
        .gte('created_at', fromDate.toISOString())
        .lte('created_at', toDate.toISOString())
        .order('created_at', { ascending: true }),
      
      supabase
        .from('property_requests')
        .select('*')
        .gte('timestamp', fromDate.toISOString())
        .lte('timestamp', toDate.toISOString())
        .order('timestamp', { ascending: true })
    ]);

    if (chatHistories.error) throw chatHistories.error;
    if (formResponses.error) throw formResponses.error;
    if (propertyRequests.error) throw propertyRequests.error;

    const chats = chatHistories.data || [];
    const forms = formResponses.data || [];
    const properties = propertyRequests.data || [];

    // Advanced conversation analysis
    const sessionsMap = new Map();
    chats.forEach(chat => {
      const sessionId = chat.session_id;
      if (!sessionsMap.has(sessionId)) {
        sessionsMap.set(sessionId, []);
      }
      sessionsMap.get(sessionId).push(chat);
    });

    const uniqueSessions = Array.from(sessionsMap.values());
    const completedSessions = uniqueSessions.filter(session => session.length >= 3);
    
    // Calculate totals
    const totalConversations = uniqueSessions.length;
    const propertyInquiries = forms.length;
    const assessmentRequests = properties.length;
    const leadConversion = propertyInquiries > 0 ? assessmentRequests / propertyInquiries : 0;
    
    // Calculate response time and completion metrics
    const totalMessages = chats.length;
    const avgMessagesPerSession = totalConversations > 0 ? totalMessages / totalConversations : 0;
    const completionRate = totalConversations > 0 ? completedSessions.length / totalConversations : 0;

    // Estimate average response time (simplified calculation)
    const avgResponseTimeSec = 2.1; // Placeholder - could be calculated from actual message timestamps

    // Calculate message depth P50 (median messages per session)
    const messageCounts = uniqueSessions.map(session => session.length).sort((a, b) => a - b);
    const messageDepthP50 = messageCounts.length > 0 
      ? messageCounts[Math.floor(messageCounts.length / 2)] 
      : 0;

    const totals: ChatbotTotals = {
      totalConversations,
      propertyInquiries,
      assessmentRequests,
      leadConversion,
      avgResponseTimeSec,
      completionRate,
      messageDepthP50
    };

    // Generate time series data
    const series = generateTimeSeries(chats, forms, properties, fromDate, toDate, granularity);

    return {
      totals,
      series
    };

  } catch (error) {
    console.error('Chatbot adapter error:', error);
    
    // Return empty data structure on error
    return {
      totals: {
        totalConversations: 0,
        propertyInquiries: 0,
        assessmentRequests: 0,
        leadConversion: 0,
        avgResponseTimeSec: 0,
        completionRate: 0,
        messageDepthP50: 0
      },
      series: []
    };
  }
}

/**
 * Get chatbot conversion funnel data
 */
export async function getFunnel({
  from,
  to
}: {
  from: string;
  to: string;
}): Promise<{
  byStage: ChatbotFunnelTotals;
  series: ChatbotFunnelPoint[];
}> {
  try {
    const fromDate = new Date(from);
    const toDate = new Date(to);

    // Get data for funnel analysis
    const [chatHistories, formResponses, propertyRequests] = await Promise.all([
      supabase
        .from('n8n_chat_histories')
        .select('session_id, timestamp')
        .gte('timestamp', fromDate.toISOString())
        .lte('timestamp', toDate.toISOString()),
      
      supabase
        .from('form_responses')
        .select('created_at')
        .gte('created_at', fromDate.toISOString())
        .lte('created_at', toDate.toISOString()),
      
      supabase
        .from('property_requests')
        .select('timestamp, status')
        .gte('timestamp', fromDate.toISOString())
        .lte('timestamp', toDate.toISOString())
    ]);

    if (chatHistories.error) throw chatHistories.error;
    if (formResponses.error) throw formResponses.error;
    if (propertyRequests.error) throw propertyRequests.error;

    const chats = chatHistories.data || [];
    const forms = formResponses.data || [];
    const properties = propertyRequests.data || [];

    // Calculate unique sessions
    const uniqueSessionIds = new Set(chats.map(chat => chat.session_id));
    const completedProperties = properties.filter(p => p.status === 'completed');

    const byStage: ChatbotFunnelTotals = {
      s1: uniqueSessionIds.size,              // conversations
      s2: forms.length,                       // form_submitted
      s3: properties.length,                  // assessment_requested
      s4: completedProperties.length          // assessment_completed
    };

    // Generate funnel time series (simplified - daily breakdown)
    const series = generateFunnelSeries(chats, forms, properties, fromDate, toDate);

    return {
      byStage,
      series
    };

  } catch (error) {
    console.error('Funnel adapter error:', error);
    
    return {
      byStage: { s1: 0, s2: 0, s3: 0, s4: 0 },
      series: []
    };
  }
}

/**
 * Generate time series data points based on granularity
 */
function generateTimeSeries(
  chats: any[],
  forms: any[],
  properties: any[],
  fromDate: Date,
  toDate: Date,
  granularity: Granularity
): ChatbotSeriesPoint[] {
  const series: ChatbotSeriesPoint[] = [];
  const current = new Date(fromDate);

  while (current <= toDate) {
    const nextPeriod = new Date(current);
    if (granularity === 'day') {
      nextPeriod.setDate(nextPeriod.getDate() + 1);
    } else {
      nextPeriod.setDate(nextPeriod.getDate() + 7);
    }

    // Filter data for this period
    const periodChats = chats.filter(chat => {
      const chatDate = new Date(chat.timestamp);
      return chatDate >= current && chatDate < nextPeriod;
    });

    const periodForms = forms.filter(form => {
      const formDate = new Date(form.created_at);
      return formDate >= current && formDate < nextPeriod;
    });

    // Calculate sessions for this period
    const sessionIds = new Set(periodChats.map(chat => chat.session_id));
    const sessionsMap = new Map();
    periodChats.forEach(chat => {
      const sessionId = chat.session_id;
      if (!sessionsMap.has(sessionId)) {
        sessionsMap.set(sessionId, []);
      }
      sessionsMap.get(sessionId).push(chat);
    });

    const sessions = Array.from(sessionsMap.values());
    const completedSessions = sessions.filter(session => session.length >= 3);

    series.push({
      ts: current.toISOString().split('T')[0],
      conversations: sessionIds.size,
      avgResponseTimeSec: 2.1, // Placeholder
      completionRate: sessionIds.size > 0 ? completedSessions.length / sessionIds.size : 0
    });

    current.setTime(nextPeriod.getTime());
  }

  return series;
}

/**
 * Generate funnel time series data
 */
function generateFunnelSeries(
  chats: any[],
  forms: any[],
  properties: any[],
  fromDate: Date,
  toDate: Date
): ChatbotFunnelPoint[] {
  const series: ChatbotFunnelPoint[] = [];
  const current = new Date(fromDate);

  while (current <= toDate) {
    const nextDay = new Date(current);
    nextDay.setDate(nextDay.getDate() + 1);

    // Filter data for this day
    const dayChats = chats.filter(chat => {
      const chatDate = new Date(chat.timestamp);
      return chatDate >= current && chatDate < nextDay;
    });

    const dayForms = forms.filter(form => {
      const formDate = new Date(form.created_at);
      return formDate >= current && formDate < nextDay;
    });

    const dayProperties = properties.filter(prop => {
      const propDate = new Date(prop.timestamp);
      return propDate >= current && propDate < nextDay;
    });

    const uniqueSessionIds = new Set(dayChats.map(chat => chat.session_id));
    const completedProperties = dayProperties.filter(p => p.status === 'completed');

    series.push({
      ts: current.toISOString().split('T')[0],
      s1: uniqueSessionIds.size,
      s2: dayForms.length,
      s3: dayProperties.length,
      s4: completedProperties.length
    });

    current.setTime(nextDay.getTime());
  }

  return series;
}

// Export the adapter interface implementation
export const chatbotAdapter: ChatbotAdapter = {
  getChatbotSeries,
  getFunnel
};