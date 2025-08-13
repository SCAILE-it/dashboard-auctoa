// Analytics data interfaces for unified data adapter pattern

export type Granularity = 'day' | 'week';

// Base interface for all time series data points
export interface TimeSeriesPoint {
  ts: string; // ISO date string
}

// Unified data source response structure
export interface DataSource<T extends Record<string, unknown> = Record<string, unknown>> {
  totals: T;
  series: (TimeSeriesPoint & T)[];
}

// Chatbot Analytics Types
export interface ChatbotTotals {
  totalConversations: number;
  propertyInquiries: number;
  assessmentRequests: number;
  leadConversion: number; // assessmentRequests / Math.max(propertyInquiries, 1)
  avgResponseTimeSec: number;
  completionRate: number;
  messageDepthP50: number;
}

export interface ChatbotSeriesPoint extends TimeSeriesPoint {
  conversations: number;
  avgResponseTimeSec: number;
  completionRate: number;
}

export interface ChatbotFunnelTotals {
  s1: number; // conversations
  s2: number; // form_submitted
  s3: number; // assessment_requested
  s4: number; // assessment_completed
}

export interface ChatbotFunnelPoint extends TimeSeriesPoint {
  s1: number;
  s2: number;
  s3: number;
  s4: number;
}

// Google Search Console Types
export interface SearchTotals {
  clicks: number;
  impressions: number;
  ctr: number; // clicks / impressions
  avgPosition: number;
}

export interface SearchSeriesPoint extends TimeSeriesPoint {
  clicks: number;
  impressions: number;
  ctr: number;
  avgPosition: number;
}

// Google Analytics 4 Types
export interface GATotals {
  users: number;
  sessions: number;
  pageviews: number;
  bounceRate: number;
  avgSessionDuration: number;
}

export interface GASeriesPoint extends TimeSeriesPoint {
  users: number;
  sessions: number;
  pageviews: number;
}

export interface GATopPage {
  path: string;
  pageviews: number;
  sessions: number;
}

export interface GASource {
  source: string;
  sessions: number;
}

// Unified Overview Response Types
export interface OverviewKPIs {
  totalConversations: number;
  propertyInquiries: number;
  leadConversion: number;
  users: number;
  pageviews: number;
  searchClicks: number;
  today: {
    pageviewsToday: number;
    pageviewsYesterday: number;
    deltaPct: number;
  };
}

export interface OverviewSeries {
  traffic: GASeriesPoint[];
  search: SearchSeriesPoint[];
  chatbot: ChatbotSeriesPoint[];
  funnel: ChatbotFunnelPoint[];
}

export interface OverviewTop {
  pages: GATopPage[];
  sources: GASource[];
}

export interface OverviewResponse {
  range: {
    from: string;
    to: string;
    granularity: Granularity;
  };
  sourcesNote: string;
  kpis: OverviewKPIs;
  series: OverviewSeries;
  top: OverviewTop;
}

// Adapter function signatures
export interface ChatbotAdapter {
  getChatbotSeries(params: {
    from: string;
    to: string;
    granularity: Granularity;
  }): Promise<DataSource<ChatbotTotals> & { series: ChatbotSeriesPoint[] }>;
  
  getFunnel(params: {
    from: string;
    to: string;
  }): Promise<{
    byStage: ChatbotFunnelTotals;
    series: ChatbotFunnelPoint[];
  }>;
}

export interface SearchAdapter {
  getSearchSeries(params: {
    from: string;
    to: string;
    granularity: Granularity;
  }): Promise<DataSource<SearchTotals> & { series: SearchSeriesPoint[] }>;
}

export interface GAAdapter {
  getGaSeries(params: {
    from: string;
    to: string;
    granularity: Granularity;
  }): Promise<DataSource<GATotals> & { 
    series: GASeriesPoint[];
    topPages: GATopPage[];
    sources: GASource[];
    __mock?: boolean;
  }>;
}

// Error handling types
export interface AdapterError {
  source: 'chatbot' | 'gsc' | 'ga4';
  message: string;
  code?: string;
}

// Mock data flag for development
export interface MockDataResponse<T> extends DataSource<T> {
  __mock: true;
}

// Date range helpers
export interface DateRange {
  from: string;
  to: string;
}

export interface DateRangePreset {
  label: string;
  value: string;
  range: () => DateRange;
}