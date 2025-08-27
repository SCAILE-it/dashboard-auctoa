import { NextRequest, NextResponse } from 'next/server';
import { SEOAuditComparison, SEOAuditData, PageSpeedInsightsResponse, CoreWebVital, SEOAuditKPI, SEOAuditRecommendation } from '@/types/seo-audit';

// Cache duration: 5 minutes for SEO audit data
const CACHE_DURATION = 5 * 60 * 1000;
let cachedData: { data: SEOAuditComparison; timestamp: number } | null = null;

const PAGESPEED_API_KEY = process.env.PAGESPEED_INSIGHTS_API_KEY;
const DEFAULT_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://auctoa.de';

export async function GET(request: NextRequest) {
  try {
    // Check if SEO Audit is enabled
    if (!process.env.NEXT_PUBLIC_ENABLE_SEO_AUDIT) {
      return NextResponse.json({
        success: true,
        data: getMockData(),
        cached: false,
        lastRefresh: new Date().toISOString()
      });
    }

    // Check cache
    const now = Date.now();
    if (cachedData && (now - cachedData.timestamp) < CACHE_DURATION) {
      return NextResponse.json({
        success: true,
        data: cachedData.data,
        cached: true,
        lastRefresh: new Date(cachedData.timestamp).toISOString()
      });
    }

    // Parse URL from query parameters
    const { searchParams } = new URL(request.url);
    const targetUrl = searchParams.get('url') || DEFAULT_URL;

    console.log(`🔍 [SEO Audit] Analyzing ${targetUrl}`);

    try {
      // Fetch data for both mobile and desktop
      const [mobileData, desktopData] = await Promise.all([
        fetchPageSpeedData(targetUrl, 'mobile'),
        fetchPageSpeedData(targetUrl, 'desktop')
      ]);

      const auditComparison: SEOAuditComparison = {
        mobile: mobileData,
        desktop: desktopData,
        lastUpdated: new Date().toISOString()
      };

      // Cache the successful response
      cachedData = {
        data: auditComparison,
        timestamp: now
      };

      return NextResponse.json({
        success: true,
        data: auditComparison,
        cached: false,
        lastRefresh: new Date().toISOString()
      });

    } catch (apiError) {
      console.error('PageSpeed Insights API Error:', apiError);
      
      // Return mock data on API failure
      return NextResponse.json({
        success: true,
        data: getMockData(),
        cached: false,
        lastRefresh: new Date().toISOString(),
        error: 'Using mock data due to API error'
      });
    }

  } catch (error) {
    console.error('SEO Audit Route Error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch SEO audit data',
      data: getMockData()
    }, { status: 500 });
  }
}

async function fetchPageSpeedData(url: string, strategy: 'mobile' | 'desktop'): Promise<SEOAuditData> {
  const apiUrl = new URL('https://www.googleapis.com/pagespeedonline/v5/runPagespeed');
  apiUrl.searchParams.set('url', url);
  apiUrl.searchParams.set('strategy', strategy);
  apiUrl.searchParams.set('category', 'performance');
  apiUrl.searchParams.set('category', 'seo');
  apiUrl.searchParams.set('category', 'accessibility');
  apiUrl.searchParams.set('category', 'best-practices');
  
  if (PAGESPEED_API_KEY) {
    apiUrl.searchParams.set('key', PAGESPEED_API_KEY);
  }

  const response = await fetch(apiUrl.toString());
  
  if (!response.ok) {
    throw new Error(`PageSpeed API error: ${response.status}`);
  }

  const data: PageSpeedInsightsResponse = await response.json();
  
  return processPageSpeedData(data, strategy);
}

function processPageSpeedData(data: PageSpeedInsightsResponse, device: 'mobile' | 'desktop'): SEOAuditData {
  const lighthouse = data.lighthouseResult;
  const loadingExperience = data.loadingExperience;

  // Process Core Web Vitals
  const coreWebVitals = {
    lcp: createCoreWebVital(
      'Largest Contentful Paint',
      lighthouse.audits['largest-contentful-paint']?.numericValue || 0,
      lighthouse.audits['largest-contentful-paint']?.score || 0,
      { good: 2500, needsImprovement: 4000 },
      'ms',
      'Measures loading performance'
    ),
    inp: createCoreWebVital(
      'Interaction to Next Paint',
      lighthouse.audits['max-potential-fid']?.numericValue || 0, // Fallback to FID-related metric
      lighthouse.audits['max-potential-fid']?.score || 0,
      { good: 200, needsImprovement: 500 },
      'ms',
      'Measures interactivity'
    ),
    cls: createCoreWebVital(
      'Cumulative Layout Shift',
      lighthouse.audits['cumulative-layout-shift']?.numericValue || 0,
      lighthouse.audits['cumulative-layout-shift']?.score || 0,
      { good: 0.1, needsImprovement: 0.25 },
      '',
      'Measures visual stability'
    )
  };

  // Process Performance Metrics
  const performanceMetrics = {
    fcp: createCoreWebVital(
      'First Contentful Paint',
      lighthouse.audits['first-contentful-paint']?.numericValue || 0,
      lighthouse.audits['first-contentful-paint']?.score || 0,
      { good: 1800, needsImprovement: 3000 },
      'ms',
      'Measures when content first appears'
    ),
    speedIndex: createCoreWebVital(
      'Speed Index',
      lighthouse.audits['speed-index']?.numericValue || 0,
      lighthouse.audits['speed-index']?.score || 0,
      { good: 3400, needsImprovement: 5800 },
      'ms',
      'Measures how quickly content is visually displayed'
    ),
    tbt: createCoreWebVital(
      'Total Blocking Time',
      lighthouse.audits['total-blocking-time']?.numericValue || 0,
      lighthouse.audits['total-blocking-time']?.score || 0,
      { good: 200, needsImprovement: 600 },
      'ms',
      'Measures interactivity during page load'
    ),
    tti: createCoreWebVital(
      'Time to Interactive',
      lighthouse.audits['interactive']?.numericValue || 0,
      lighthouse.audits['interactive']?.score || 0,
      { good: 3800, needsImprovement: 7300 },
      'ms',
      'Measures when page becomes fully interactive'
    )
  };

  // Extract scores
  const scores = {
    performance: Math.round((lighthouse.categories.performance?.score || 0) * 100),
    seo: Math.round((lighthouse.categories.seo?.score || 0) * 100),
    accessibility: Math.round((lighthouse.categories.accessibility?.score || 0) * 100),
    bestPractices: Math.round((lighthouse.categories['best-practices']?.score || 0) * 100)
  };

  // Create KPIs
  const kpis: SEOAuditKPI[] = [
    {
      id: 'performance-score',
      title: 'Performance Score',
      value: scores.performance,
      score: scores.performance,
      status: scores.performance >= 90 ? 'good' : scores.performance >= 50 ? 'needs-improvement' : 'poor',
      format: 'score',
      description: 'Overall performance assessment',
      category: 'performance'
    },
    {
      id: 'seo-score',
      title: 'SEO Score',
      value: scores.seo,
      score: scores.seo,
      status: scores.seo >= 90 ? 'good' : scores.seo >= 50 ? 'needs-improvement' : 'poor',
      format: 'score',
      description: 'Search engine optimization assessment',
      category: 'seo'
    },
    {
      id: 'accessibility-score',
      title: 'Accessibility Score',
      value: scores.accessibility,
      score: scores.accessibility,
      status: scores.accessibility >= 90 ? 'good' : scores.accessibility >= 50 ? 'needs-improvement' : 'poor',
      format: 'score',
      description: 'Web accessibility compliance',
      category: 'accessibility'
    },
    {
      id: 'lcp-metric',
      title: 'Largest Contentful Paint',
      value: Math.round(coreWebVitals.lcp.value),
      score: Math.round(coreWebVitals.lcp.score * 100),
      status: coreWebVitals.lcp.status,
      format: 'milliseconds',
      description: 'Loading performance metric',
      category: 'performance'
    }
  ];

  // Generate recommendations
  const recommendations = generateRecommendations(lighthouse.audits);

  return {
    url: data.id,
    timestamp: new Date().toISOString(),
    device,
    coreWebVitals,
    performanceMetrics,
    scores,
    kpis,
    recommendations,
    hasFieldData: !!loadingExperience,
    fieldDataSource: loadingExperience ? 'crux' : undefined
  };
}

function createCoreWebVital(
  metric: string,
  value: number,
  score: number,
  threshold: { good: number; needsImprovement: number },
  unit: string,
  description: string
): CoreWebVital {
  let status: 'good' | 'needs-improvement' | 'poor';
  
  if (value <= threshold.good) {
    status = 'good';
  } else if (value <= threshold.needsImprovement) {
    status = 'needs-improvement';
  } else {
    status = 'poor';
  }

  return {
    metric,
    value,
    score,
    status,
    threshold,
    unit,
    description
  };
}

function generateRecommendations(audits: Record<string, any>): SEOAuditRecommendation[] {
  const recommendations: SEOAuditRecommendation[] = [];

  // Performance recommendations
  if (audits['unused-css-rules'] && audits['unused-css-rules'].score < 1) {
    recommendations.push({
      id: 'unused-css',
      title: 'Remove unused CSS',
      description: 'Reduce unused rules from stylesheets to improve performance',
      impact: 'medium',
      category: 'performance',
      effort: 'medium',
      savings: audits['unused-css-rules'].displayValue,
      learnMoreUrl: 'https://web.dev/unused-css-rules/'
    });
  }

  if (audits['render-blocking-resources'] && audits['render-blocking-resources'].score < 1) {
    recommendations.push({
      id: 'render-blocking',
      title: 'Eliminate render-blocking resources',
      description: 'Resources are blocking the first paint of your page',
      impact: 'high',
      category: 'performance',
      effort: 'medium',
      savings: audits['render-blocking-resources'].displayValue,
      learnMoreUrl: 'https://web.dev/render-blocking-resources/'
    });
  }

  // SEO recommendations
  if (audits['meta-description'] && audits['meta-description'].score < 1) {
    recommendations.push({
      id: 'meta-description',
      title: 'Add meta descriptions',
      description: 'Meta descriptions may be included in search results',
      impact: 'medium',
      category: 'seo',
      effort: 'low',
      learnMoreUrl: 'https://web.dev/meta-description/'
    });
  }

  if (audits['document-title'] && audits['document-title'].score < 1) {
    recommendations.push({
      id: 'document-title',
      title: 'Add page titles',
      description: 'The title gives screen reader users an overview of the page',
      impact: 'high',
      category: 'seo',
      effort: 'low',
      learnMoreUrl: 'https://web.dev/document-title/'
    });
  }

  // Accessibility recommendations
  if (audits['color-contrast'] && audits['color-contrast'].score < 1) {
    recommendations.push({
      id: 'color-contrast',
      title: 'Improve color contrast',
      description: 'Background and foreground colors have sufficient contrast ratio',
      impact: 'high',
      category: 'accessibility',
      effort: 'low',
      learnMoreUrl: 'https://web.dev/color-contrast/'
    });
  }

  if (audits['image-alt'] && audits['image-alt'].score < 1) {
    recommendations.push({
      id: 'image-alt',
      title: 'Add alt text to images',
      description: 'Informative elements should aim for short, descriptive alternate text',
      impact: 'medium',
      category: 'accessibility',
      effort: 'low',
      learnMoreUrl: 'https://web.dev/image-alt/'
    });
  }

  return recommendations.slice(0, 8); // Limit to top 8 recommendations
}

function getMockData(): SEOAuditComparison {
  const mockMobile: SEOAuditData = {
    url: 'https://auctoa.de',
    timestamp: new Date().toISOString(),
    device: 'mobile',
    coreWebVitals: {
      lcp: {
        metric: 'Largest Contentful Paint',
        value: 2800,
        score: 0.75,
        status: 'needs-improvement',
        threshold: { good: 2500, needsImprovement: 4000 },
        unit: 'ms',
        description: 'Measures loading performance'
      },
      inp: {
        metric: 'Interaction to Next Paint',
        value: 150,
        score: 0.85,
        status: 'good',
        threshold: { good: 200, needsImprovement: 500 },
        unit: 'ms',
        description: 'Measures interactivity'
      },
      cls: {
        metric: 'Cumulative Layout Shift',
        value: 0.08,
        score: 0.92,
        status: 'good',
        threshold: { good: 0.1, needsImprovement: 0.25 },
        unit: '',
        description: 'Measures visual stability'
      }
    },
    performanceMetrics: {
      fcp: {
        metric: 'First Contentful Paint',
        value: 1600,
        score: 0.88,
        status: 'good',
        threshold: { good: 1800, needsImprovement: 3000 },
        unit: 'ms',
        description: 'Measures when content first appears'
      },
      speedIndex: {
        metric: 'Speed Index',
        value: 3200,
        score: 0.82,
        status: 'good',
        threshold: { good: 3400, needsImprovement: 5800 },
        unit: 'ms',
        description: 'Measures how quickly content is visually displayed'
      },
      tbt: {
        metric: 'Total Blocking Time',
        value: 180,
        score: 0.89,
        status: 'good',
        threshold: { good: 200, needsImprovement: 600 },
        unit: 'ms',
        description: 'Measures interactivity during page load'
      },
      tti: {
        metric: 'Time to Interactive',
        value: 3500,
        score: 0.85,
        status: 'good',
        threshold: { good: 3800, needsImprovement: 7300 },
        unit: 'ms',
        description: 'Measures when page becomes fully interactive'
      }
    },
    scores: {
      performance: 82,
      seo: 95,
      accessibility: 88,
      bestPractices: 92
    },
    kpis: [
      {
        id: 'performance-score',
        title: 'Performance Score',
        value: 82,
        score: 82,
        status: 'needs-improvement',
        format: 'score',
        description: 'Overall performance assessment',
        category: 'performance'
      },
      {
        id: 'seo-score',
        title: 'SEO Score',
        value: 95,
        score: 95,
        status: 'good',
        format: 'score',
        description: 'Search engine optimization assessment',
        category: 'seo'
      },
      {
        id: 'accessibility-score',
        title: 'Accessibility Score',
        value: 88,
        score: 88,
        status: 'needs-improvement',
        format: 'score',
        description: 'Web accessibility compliance',
        category: 'accessibility'
      },
      {
        id: 'lcp-metric',
        title: 'Largest Contentful Paint',
        value: 2800,
        score: 75,
        status: 'needs-improvement',
        format: 'milliseconds',
        description: 'Loading performance metric',
        category: 'performance'
      }
    ],
    recommendations: [
      {
        id: 'render-blocking',
        title: 'Eliminate render-blocking resources',
        description: 'Resources are blocking the first paint of your page',
        impact: 'high',
        category: 'performance',
        effort: 'medium',
        savings: '0.8s'
      },
      {
        id: 'unused-css',
        title: 'Remove unused CSS',
        description: 'Reduce unused rules from stylesheets to improve performance',
        impact: 'medium',
        category: 'performance',
        effort: 'medium',
        savings: '120KB'
      },
      {
        id: 'image-alt',
        title: 'Add alt text to images',
        description: 'Informative elements should aim for short, descriptive alternate text',
        impact: 'medium',
        category: 'accessibility',
        effort: 'low'
      }
    ],
    hasFieldData: true,
    fieldDataSource: 'crux'
  };

  const mockDesktop: SEOAuditData = {
    ...mockMobile,
    device: 'desktop',
    coreWebVitals: {
      ...mockMobile.coreWebVitals,
      lcp: {
        ...mockMobile.coreWebVitals.lcp,
        value: 2200,
        score: 0.88,
        status: 'good'
      }
    },
    scores: {
      performance: 94,
      seo: 95,
      accessibility: 88,
      bestPractices: 92
    },
    kpis: [
      {
        ...mockMobile.kpis[0],
        value: 94,
        score: 94,
        status: 'good'
      },
      ...mockMobile.kpis.slice(1)
    ]
  };

  return {
    mobile: mockMobile,
    desktop: mockDesktop,
    lastUpdated: new Date().toISOString()
  };
}
