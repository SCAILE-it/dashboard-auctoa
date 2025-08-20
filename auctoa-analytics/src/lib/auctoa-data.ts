import { Users, MessageSquare, Home, TrendingUp, Clock, CheckCircle, Target, BarChart3, MapPin, Activity } from "lucide-react";

// Enhanced chatbot KPIs for Auctoa platform
export const enhancedChatbotKPIs = [
  {
    id: 'total-conversations',
    title: 'Total Conversations',
    value: '0',
    icon: MessageSquare,
    trend: {
      value: '+0%',
      isPositive: true,
      isNeutral: false
    },
    source: 'chatbot',
    description: 'Total number of chatbot conversations'
  },
  {
    id: 'avg-messages-per-session',
    title: 'Avg. Messages/Session',
    value: '0',
    icon: BarChart3,
    trend: {
      value: '+0%',
      isPositive: true,
      isNeutral: false
    },
    source: 'chatbot',
    description: 'Average conversation depth and engagement'
  },
  {
    id: 'user-engagement',
    title: 'User Engagement',
    value: '0%',
    icon: Activity,
    trend: {
      value: '+0%',
      isPositive: true,
      isNeutral: false
    },
    source: 'chatbot',
    description: 'Percentage of human vs AI messages'
  },
  {
    id: 'chat-to-form-conversion',
    title: 'Chat → Form Rate',
    value: '0%',
    icon: Target,
    trend: {
      value: '+0%',
      isPositive: true,
      isNeutral: false
    },
    source: 'chatbot',
    description: 'Conversations that lead to form submissions'
  },
  {
    id: 'property-requests',
    title: 'Property Requests',
    value: '0',
    icon: Home,
    trend: {
      value: '+0%',
      isPositive: true,
      isNeutral: false
    },
    source: 'chatbot',
    description: 'Real estate assessment requests generated'
  },
  {
    id: 'completion-rate',
    title: 'Completion Rate',
    value: '0%',
    icon: CheckCircle,
    trend: {
      value: '+0%',
      isPositive: true,
      isNeutral: false
    },
    source: 'chatbot',
    description: 'Property requests that reach completion'
  },
  {
    id: 'active-cities',
    title: 'Active Cities',
    value: '0',
    icon: MapPin,
    trend: {
      value: '+0%',
      isPositive: true,
      isNeutral: false
    },
    source: 'chatbot',
    description: 'German cities with property inquiries'
  },
  {
    id: 'weekly-activity',
    title: 'Weekly Growth',
    value: '0%',
    icon: TrendingUp,
    trend: {
      value: '+0%',
      isPositive: true,
      isNeutral: false
    },
    source: 'chatbot',
    description: 'Recent activity vs. monthly average'
  }
];

// Real estate & chatbot KPIs for Auctoa platform
export const auctoaKPIData = [
  // Chatbot Performance
  {
    id: 'total-conversations',
    title: 'Total Conversations',
    value: '1,234',
    icon: MessageSquare,
    trend: {
      value: '+15%',
      isPositive: true,
      isNeutral: false
    },
    source: 'chatbot',
    description: 'AI conversations about property valuations and inheritance planning'
  },
  {
    id: 'property-inquiries',
    title: 'Property Inquiries',
    value: '456',
    icon: Home,
    trend: {
      value: '+12%',
      isPositive: true,
      isNeutral: false
    },
    source: 'chatbot',
    description: 'Users requesting property assessments and valuations'
  },
  {
    id: 'conversion-rate',
    title: 'Lead Conversion',
    value: '8.7%',
    icon: TrendingUp,
    trend: {
      value: '+2.1%',
      isPositive: true,
      isNeutral: false
    },
    source: 'chatbot',
    description: 'Chat visitors who become property assessment leads'
  },

  // Property Assessment Performance
  {
    id: 'completed-assessments',
    title: 'Completed Assessments',
    value: '89',
    icon: CheckCircle,
    trend: {
      value: '+18%',
      isPositive: true,
      isNeutral: false
    },
    source: 'property',
    description: 'Property valuations completed this month'
  },
  {
    id: 'avg-response-time',
    title: 'Avg. Response Time',
    value: '2.3 min',
    icon: Clock,
    trend: {
      value: '-15%',
      isPositive: true,
      isNeutral: false
    },
    source: 'property',
    description: 'Average time to respond to property inquiries'
  },
  {
    id: 'inheritance-cases',
    title: 'Inheritance Cases',
    value: '67',
    icon: Users,
    trend: {
      value: '+22%',
      isPositive: true,
      isNeutral: false
    },
    source: 'property',
    description: 'Inherited property cases handled this month'
  }
];

// Geographic distribution for German real estate
export const germanStatesData = [
  { state: 'Bayern', inquiries: 89, assessments: 23 },
  { state: 'Nordrhein-Westfalen', inquiries: 76, assessments: 19 },
  { state: 'Baden-Württemberg', inquiries: 54, assessments: 14 },
  { state: 'Niedersachsen', inquiries: 43, assessments: 11 },
  { state: 'Hessen', inquiries: 38, assessments: 9 },
  { state: 'Brandenburg', inquiries: 22, assessments: 6 },
  { state: 'Hamburg', inquiries: 18, assessments: 5 },
  { state: 'Berlin', inquiries: 15, assessments: 4 }
];

// Property type distribution
export const propertyTypes = [
  { type: 'Single Family Home', count: 124, percentage: 38.2 },
  { type: 'Condominium', count: 89, percentage: 27.4 },
  { type: 'Multi-family House', count: 56, percentage: 17.3 },
  { type: 'Townhouse', count: 34, percentage: 10.5 },
  { type: 'Commercial Property', count: 21, percentage: 6.6 }
];

// Common inquiry topics for Auctoa
export const inquiryTopics = [
  { topic: 'Property Valuation', count: 145 },
  { topic: 'Estate Planning', count: 98 },
  { topic: 'Sale vs. Rental', count: 76 },
  { topic: 'Tax Aspects', count: 54 },
  { topic: 'Expert Recommendation', count: 43 },
  { topic: 'Market Analysis', count: 32 }
];