/**
 * CSV Export Utilities
 * Professional CSV export functionality with proper data formatting,
 * encoding, and error handling following industry best practices.
 */

import { format } from 'date-fns';

export interface CSVExportOptions {
  filename?: string;
  includeTimestamp?: boolean;
  dateFormat?: string;
}

export interface KPIExportData {
  metric: string;
  value: string | number;
  trend?: string;
  source: string;
  period: string;
}

export interface TimeSeriesExportData {
  date: string;
  [key: string]: string | number;
}

/**
 * Converts array of objects to CSV string with proper escaping
 */
function arrayToCSV(data: Array<Record<string, unknown>>): string {
  if (!data || data.length === 0) {
    return '';
  }

  // Get headers from first object
  const headers = Object.keys(data[0]);
  
  // Create CSV header row
  const csvHeaders = headers.map(header => escapeCSVField(header)).join(',');
  
  // Create CSV data rows
  const csvRows = data.map(row => 
    headers.map(header => {
      const value = row[header];
      return escapeCSVField(formatCSVValue(value));
    }).join(',')
  );

  return [csvHeaders, ...csvRows].join('\n');
}

/**
 * Properly escape CSV fields to handle commas, quotes, and newlines
 */
function escapeCSVField(field: string): string {
  if (field == null) return '""';
  
  const stringField = String(field);
  
  // If field contains comma, quote, or newline, wrap in quotes and escape internal quotes
  if (stringField.includes(',') || stringField.includes('"') || stringField.includes('\n')) {
    return `"${stringField.replace(/"/g, '""')}"`;
  }
  
  return stringField;
}

/**
 * Format various data types for CSV export
 */
function formatCSVValue(value: unknown): string {
  if (value == null) return '';
  
  if (typeof value === 'number') {
    // Handle percentages and large numbers
    return value.toString();
  }
  
  if (typeof value === 'boolean') {
    return value ? 'Yes' : 'No';
  }
  
  if (value instanceof Date) {
    return format(value, 'yyyy-MM-dd HH:mm:ss');
  }
  
  return String(value);
}

/**
 * Generate filename with timestamp and sanitization
 */
function generateFilename(baseName: string, includeTimestamp: boolean = true): string {
  const sanitizedName = baseName.replace(/[^a-zA-Z0-9_-]/g, '_').toLowerCase();
  const timestamp = includeTimestamp ? `_${format(new Date(), 'yyyy-MM-dd_HH-mm-ss')}` : '';
  return `${sanitizedName}${timestamp}.csv`;
}

/**
 * Download CSV file in browser
 */
function downloadCSV(csvContent: string, filename: string): void {
  // Add BOM for proper UTF-8 encoding in Excel
  const BOM = '\uFEFF';
  const csvWithBOM = BOM + csvContent;
  
  const blob = new Blob([csvWithBOM], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Clean up object URL
    setTimeout(() => URL.revokeObjectURL(url), 100);
  }
}

/**
 * Export KPI data to CSV
 */
export function exportKPIsToCSV(
  kpis: Array<{
    id: string;
    title: string;
    value: string | number;
    trend?: number;
    source?: string;
  }>,
  dateRange: { from: string; to: string },
  options: CSVExportOptions = {}
): void {
  const exportData: KPIExportData[] = kpis.map(kpi => ({
    metric: kpi.title,
    value: kpi.value,
    trend: kpi.trend ? `${kpi.trend > 0 ? '+' : ''}${kpi.trend.toFixed(1)}%` : 'N/A',
    source: kpi.source || 'Combined',
    period: `${dateRange.from} to ${dateRange.to}`
  }));

  const csvContent = arrayToCSV(exportData as unknown as Array<Record<string, unknown>>);
  const filename = generateFilename(
    options.filename || 'analytics_kpis',
    options.includeTimestamp ?? true
  );

  downloadCSV(csvContent, filename);
}

/**
 * Export time series data to CSV
 */
export function exportTimeSeriesToCSV(
  seriesData: Array<Record<string, unknown>>,
  dataLabel: string,
  dateRange: { from: string; to: string },
  options: CSVExportOptions = {}
): void {
  if (!seriesData || seriesData.length === 0) {
    throw new Error('No data available for export');
  }

  // Transform data for better CSV format
  const transformedData = seriesData.map(point => {
    const transformed: Record<string, unknown> = {};
    
    Object.entries(point).forEach(([key, value]) => {
      // Format date fields
      if (key === 'date' || key.includes('date')) {
        transformed[key] = value;
      }
      // Format numeric fields with proper labels
      else if (typeof value === 'number') {
        if (key.includes('rate') || key.includes('Rate')) {
          transformed[key] = `${(value * 100).toFixed(2)}%`;
        } else {
          transformed[key] = value.toLocaleString();
        }
      } else {
        transformed[key] = value;
      }
    });
    
    return transformed;
  });

  const csvContent = arrayToCSV(transformedData);
  const filename = generateFilename(
    options.filename || `${dataLabel.toLowerCase().replace(/\s+/g, '_')}_data`,
    options.includeTimestamp ?? true
  );

  downloadCSV(csvContent, filename);
}

/**
 * Export high-level overview (all sources combined) to CSV - Single header row
 */
export function exportOverviewToCSV(
  overviewData: {
    kpis: Array<{
      id: string;
      title: string;
      value: string | number;
      trend?: number;
      source?: string;
    }>;
    series: {
      chatbot?: Array<Record<string, unknown>>;
      search?: Array<Record<string, unknown>>;
      traffic?: Array<Record<string, unknown>>;
    };
  },
  dateRange: { from: string; to: string },
  options: CSVExportOptions = {}
): void {
  // Create unified high-level overview with single header
  const unifiedData: Array<{
    date: string;
    metric_type: string;
    source: string;
    value: number;
    period: string;
  }> = [];
  
  const period = `${dateRange.from} to ${dateRange.to}`;
  
  // Add traffic data
  if (overviewData.series.traffic) {
    overviewData.series.traffic.forEach(point => {
      const date = point.date as string;
      Object.entries(point).forEach(([key, value]) => {
        if (key !== 'date' && typeof value === 'number') {
          unifiedData.push({
            date,
            metric_type: key,
            source: 'GA4',
            value,
            period
          });
        }
      });
    });
  }
  
  // Add search data
  if (overviewData.series.search) {
    overviewData.series.search.forEach(point => {
      const date = point.date as string;
      Object.entries(point).forEach(([key, value]) => {
        if (key !== 'date' && typeof value === 'number') {
          unifiedData.push({
            date,
            metric_type: key,
            source: 'GSC',
            value,
            period
          });
        }
      });
    });
  }
  
  // Add chatbot data
  if (overviewData.series.chatbot) {
    overviewData.series.chatbot.forEach(point => {
      const date = point.date as string;
      Object.entries(point).forEach(([key, value]) => {
        if (key !== 'date' && typeof value === 'number') {
          unifiedData.push({
            date,
            metric_type: key,
            source: 'Chatbot',
            value,
            period
          });
        }
      });
    });
  }

  const csvContent = arrayToCSV(unifiedData);
  const filename = generateFilename(
    options.filename || 'analytics_overview_all_sources',
    options.includeTimestamp ?? true
  );

  downloadCSV(csvContent, filename);
}

/**
 * Export data source-specific CSV files with delays to prevent browser blocking
 */
export async function exportDataSourceCSVs(
  overviewData: {
    kpis: Array<{
      id: string;
      title: string;
      value: string | number;
      trend?: number;
      source?: string;
    }>;
    series: {
      chatbot?: Array<Record<string, unknown>>;
      search?: Array<Record<string, unknown>>;
      traffic?: Array<Record<string, unknown>>;
    };
  },
  dateRange: { from: string; to: string },
  options: CSVExportOptions = {}
): Promise<void> {
  const period = `${dateRange.from} to ${dateRange.to}`;
  let downloadCount = 0;
  
  // Helper function to add delay between downloads
  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
  
  // Export GA4 data
  if (overviewData.series.traffic && overviewData.series.traffic.length > 0) {
    const ga4Data = overviewData.series.traffic.map(point => ({
      ...point,
      data_source: 'Google Analytics 4',
      period
    }));
    
    const csvContent = arrayToCSV(ga4Data);
    const filename = generateFilename('analytics_ga4_data', options.includeTimestamp ?? true);
    downloadCSV(csvContent, filename);
    downloadCount++;
    
    // Add delay if more downloads are coming
    if (overviewData.series.search || overviewData.series.chatbot) {
      await delay(500); // 500ms delay
    }
  }
  
  // Export GSC data
  if (overviewData.series.search && overviewData.series.search.length > 0) {
    const gscData = overviewData.series.search.map(point => ({
      ...point,
      data_source: 'Google Search Console',
      period
    }));
    
    const csvContent = arrayToCSV(gscData);
    const filename = generateFilename('analytics_gsc_data', options.includeTimestamp ?? true);
    downloadCSV(csvContent, filename);
    downloadCount++;
    
    // Add delay if chatbot download is coming
    if (overviewData.series.chatbot) {
      await delay(500); // 500ms delay
    }
  }
  
  // Export Chatbot data
  if (overviewData.series.chatbot && overviewData.series.chatbot.length > 0) {
    const chatbotData = overviewData.series.chatbot.map(point => ({
      ...point,
      data_source: 'Chatbot Analytics',
      period
    }));
    
    const csvContent = arrayToCSV(chatbotData);
    const filename = generateFilename('analytics_chatbot_data', options.includeTimestamp ?? true);
    downloadCSV(csvContent, filename);
    downloadCount++;
  }
  
  // Show user feedback about the downloads
  if (downloadCount > 1) {
    showExportNotification(`Successfully downloaded ${downloadCount} data source CSV files!`, 'success');
  } else if (downloadCount === 1) {
    showExportNotification('Successfully downloaded 1 data source CSV file!', 'success');
  } else {
    throw new Error('No data available for any data sources');
  }
}

/**
 * Utility to show user feedback during export
 */
export function showExportNotification(message: string, type: 'success' | 'error' = 'success'): void {
  // Console log for debugging
  console.log(`Export ${type}: ${message}`);
  
  // Show user-friendly notification
  if (typeof window !== 'undefined') {
    if (type === 'success') {
      // Create a temporary success notification
      const notification = document.createElement('div');
      notification.innerHTML = `
        <div style="
          position: fixed; 
          top: 20px; 
          right: 20px; 
          background: #10b981; 
          color: white; 
          padding: 12px 20px; 
          border-radius: 8px; 
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          z-index: 9999;
          font-family: system-ui, -apple-system, sans-serif;
          font-size: 14px;
          font-weight: 500;
          max-width: 350px;
        ">
          ✅ ${message}
        </div>
      `;
      
      document.body.appendChild(notification);
      
      // Remove after 4 seconds
      setTimeout(() => {
        if (document.body.contains(notification)) {
          document.body.removeChild(notification);
        }
      }, 4000);
    } else {
      // Show error alert
      alert(`Export Error: ${message}`);
    }
  }
}