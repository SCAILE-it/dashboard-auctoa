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
function arrayToCSV<T extends Record<string, unknown>>(data: T[]): string {
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

  const csvContent = arrayToCSV(exportData);
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
 * Export overview data (all sources combined) to CSV
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
  // Create comprehensive overview export with multiple sheets worth of data
  const exportSections: string[] = [];
  
  // 1. KPIs Section
  const kpiData = overviewData.kpis.map(kpi => ({
    section: 'KPIs',
    metric: kpi.title,
    value: kpi.value,
    trend: kpi.trend ? `${kpi.trend > 0 ? '+' : ''}${kpi.trend.toFixed(1)}%` : 'N/A',
    source: kpi.source || 'Combined',
    period: `${dateRange.from} to ${dateRange.to}`
  }));
  
  exportSections.push('=== KEY PERFORMANCE INDICATORS ===');
  exportSections.push(arrayToCSV(kpiData));
  exportSections.push(''); // Empty line
  
  // 2. Time Series Data Sections
  if (overviewData.series.traffic && overviewData.series.traffic.length > 0) {
    exportSections.push('=== WEBSITE TRAFFIC (GA4) ===');
    exportSections.push(arrayToCSV(overviewData.series.traffic.map(point => ({
      ...point,
      source: 'GA4'
    }))));
    exportSections.push('');
  }
  
  if (overviewData.series.search && overviewData.series.search.length > 0) {
    exportSections.push('=== SEARCH CONSOLE DATA ===');
    exportSections.push(arrayToCSV(overviewData.series.search.map(point => ({
      ...point,
      source: 'GSC'
    }))));
    exportSections.push('');
  }
  
  if (overviewData.series.chatbot && overviewData.series.chatbot.length > 0) {
    exportSections.push('=== CHATBOT ANALYTICS ===');
    exportSections.push(arrayToCSV(overviewData.series.chatbot.map(point => ({
      ...point,
      source: 'Chatbot'
    }))));
  }
  
  const csvContent = exportSections.join('\n');
  const filename = generateFilename(
    options.filename || 'complete_analytics_overview',
    options.includeTimestamp ?? true
  );

  downloadCSV(csvContent, filename);
}

/**
 * Utility to show user feedback during export
 */
export function showExportNotification(message: string, type: 'success' | 'error' = 'success'): void {
  // This could be enhanced with a proper notification system
  // For now, we'll use a simple approach that works everywhere
  console.log(`Export ${type}: ${message}`);
  
  // You could integrate with react-hot-toast or similar notification library here
  if (typeof window !== 'undefined') {
    if (type === 'success') {
      // Could show success toast
    } else {
      // Could show error toast
      alert(`Export Error: ${message}`);
    }
  }
}