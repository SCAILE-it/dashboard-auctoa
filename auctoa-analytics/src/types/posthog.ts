export interface PosthogKPI {
  id: string;
  title: string;
  value: number;
  change: number;
  changeType: 'increase' | 'decrease';
  format: 'number' | 'percentage' | 'duration';
  description: string;
}

export interface PosthogTimeSeriesPoint {
  date: string;
  dau: number;
  wau: number;
  mau: number;
  sessions: number;
  retention_rate: number;
}

export interface PosthogFunnelStep {
  name: string;
  count: number;
  conversion_rate: number;
  drop_off: number;
}

export interface PosthogCohort {
  id: string;
  name: string;
  size: number;
  retention_rate: number;
}

export interface PosthogData {
  kpis: PosthogKPI[];
  timeSeries: PosthogTimeSeriesPoint[];
  funnelSteps: PosthogFunnelStep[];
  cohorts: PosthogCohort[];
  lastUpdated: string;
}

export interface PosthogApiResponse {
  success: boolean;
  data?: PosthogData;
  error?: string;
  cached?: boolean;
  lastRefresh?: string;
}

// PostHog API Query Types
export interface PosthogQueryRequest {
  query: {
    kind: 'HogQLQuery' | 'TrendsQuery' | 'FunnelsQuery' | 'RetentionQuery';
    query?: string;
    [key: string]: any;
  };
  refresh?: 'blocking' | 'async' | 'force_blocking' | 'force_async' | 'force_cache';
  client_query_id?: string;
}

export interface PosthogQueryResponse {
  results: any;
  is_cached?: boolean;
  cache_key?: string;
  last_refresh?: string;
  timings?: any;
  query_status?: {
    id: string;
    complete: boolean;
  };
}
