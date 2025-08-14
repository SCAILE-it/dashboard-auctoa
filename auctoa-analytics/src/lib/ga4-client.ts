// Google Analytics 4 API client for direct data access
import { BetaAnalyticsDataClient } from '@google-analytics/data';

const ga4PropertyId = process.env.GA4_PROPERTY_ID;
const ga4ServiceAccountKey = process.env.GA4_SERVICE_ACCOUNT_KEY;

if (!ga4PropertyId || !ga4ServiceAccountKey) {
  console.warn('GA4 environment variables not configured, using fallback data');
}

// Create GA4 client with service account authentication
export const ga4Client = ga4PropertyId && ga4ServiceAccountKey 
  ? new BetaAnalyticsDataClient({
      credentials: JSON.parse(ga4ServiceAccountKey),
    })
  : null;

// GA4 Interfaces
export interface GA4Metric {
  sessions: number;
  users: number;
  pageviews: number;
  bounceRate: number;
  avgSessionDuration: number;
  conversions: number;
}

export interface GA4DimensionValue {
  date: string;
  source: string;
  medium: string;
  city: string;
  deviceCategory: string;
}

export interface GA4Record {
  date: string;
  sessions: number;
  users: number;
  pageviews: number;
  bounceRate: number;
  avgSessionDuration: number;
  conversions: number;
  source?: string;
  medium?: string;
  city?: string;
  deviceCategory?: string;
}

export default ga4Client;