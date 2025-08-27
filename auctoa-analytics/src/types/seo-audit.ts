export interface SEOAuditKPI {
  id: string;
  title: string;
  value: number | string;
  score?: number; // 0-100 for performance scores
  status: 'good' | 'needs-improvement' | 'poor';
  change?: number;
  changeType?: 'increase' | 'decrease';
  format: 'number' | 'percentage' | 'milliseconds' | 'score' | 'text';
  description: string;
  category: 'performance' | 'seo' | 'accessibility' | 'best-practices';
}

export interface CoreWebVital {
  metric: string;
  value: number;
  score: number;
  status: 'good' | 'needs-improvement' | 'poor';
  threshold: {
    good: number;
    needsImprovement: number;
  };
  unit: string;
  description: string;
}

export interface SEOAuditRecommendation {
  id: string;
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  category: 'performance' | 'seo' | 'accessibility' | 'best-practices';
  effort: 'low' | 'medium' | 'high';
  savings?: string; // e.g., "2.3s", "15KB"
  learnMoreUrl?: string;
}

export interface SEOAuditData {
  url: string;
  timestamp: string;
  device: 'mobile' | 'desktop';
  
  // Core Web Vitals
  coreWebVitals: {
    lcp: CoreWebVital;
    inp: CoreWebVital;
    cls: CoreWebVital;
  };
  
  // Performance Metrics
  performanceMetrics: {
    fcp: CoreWebVital;
    speedIndex: CoreWebVital;
    tbt: CoreWebVital;
    tti: CoreWebVital;
  };
  
  // Overall Scores
  scores: {
    performance: number;
    seo: number;
    accessibility: number;
    bestPractices: number;
  };
  
  // KPIs for dashboard display
  kpis: SEOAuditKPI[];
  
  // Recommendations
  recommendations: SEOAuditRecommendation[];
  
  // Field vs Lab data indicator
  hasFieldData: boolean;
  fieldDataSource?: 'crux' | 'rum';
}

export interface SEOAuditComparison {
  mobile: SEOAuditData;
  desktop: SEOAuditData;
  lastUpdated: string;
}

export interface SEOAuditApiResponse {
  success: boolean;
  data?: SEOAuditComparison;
  error?: string;
  cached?: boolean;
  lastRefresh?: string;
}

// PageSpeed Insights API Response Types (simplified)
export interface PageSpeedInsightsResponse {
  id: string;
  loadingExperience?: {
    id: string;
    metrics: {
      LARGEST_CONTENTFUL_PAINT_MS?: {
        percentile: number;
        category: 'FAST' | 'AVERAGE' | 'SLOW';
      };
      INTERACTION_TO_NEXT_PAINT?: {
        percentile: number;
        category: 'FAST' | 'AVERAGE' | 'SLOW';
      };
      CUMULATIVE_LAYOUT_SHIFT_SCORE?: {
        percentile: number;
        category: 'FAST' | 'AVERAGE' | 'SLOW';
      };
      FIRST_CONTENTFUL_PAINT_MS?: {
        percentile: number;
        category: 'FAST' | 'AVERAGE' | 'SLOW';
      };
    };
    overall_category: 'FAST' | 'AVERAGE' | 'SLOW';
  };
  lighthouseResult: {
    categories: {
      performance: { score: number };
      seo: { score: number };
      accessibility: { score: number };
      'best-practices': { score: number };
    };
    audits: Record<string, {
      id: string;
      title: string;
      description: string;
      score: number | null;
      scoreDisplayMode: string;
      displayValue?: string;
      numericValue?: number;
      numericUnit?: string;
      details?: any;
    }>;
  };
}

export interface SEOAuditTrend {
  date: string;
  performanceScore: number;
  seoScore: number;
  accessibilityScore: number;
  bestPracticesScore: number;
  lcp: number;
  inp: number;
  cls: number;
}
