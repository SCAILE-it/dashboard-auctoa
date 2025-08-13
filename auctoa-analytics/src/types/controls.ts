// Date controls and UI component types

export type Granularity = 'day' | 'week';

export interface DateRange {
  from: Date;
  to: Date;
}

export interface DateRangePreset {
  id: string;
  label: string;
  labelDE: string; // German translation
  getValue: () => DateRange;
}

export interface DateRangePickerProps {
  value?: DateRange;
  onChange: (range: DateRange | undefined) => void;
  presets?: DateRangePreset[];
  placeholder?: string;
  placeholderDE?: string;
  disabled?: boolean;
  className?: string;
}

export interface GranularityToggleProps {
  value: Granularity;
  onChange: (granularity: Granularity) => void;
  disabled?: boolean;
  className?: string;
}

// URL state management
export interface AnalyticsState {
  dateRange: DateRange;
  granularity: Granularity;
}

export interface AnalyticsParams {
  from?: string;
  to?: string;
  granularity?: string;
}

// English labels
export const Labels = {
  // Date Range Picker
  dateRange: 'Date Range',
  selectDateRange: 'Select date range',
  customRange: 'Custom',
  apply: 'Apply',
  cancel: 'Cancel',
  
  // Presets
  last7Days: 'Last 7 days',
  last30Days: 'Last 30 days',
  last90Days: 'Last 90 days',
  thisMonth: 'This month',
  lastMonth: 'Last month',
  
  // Granularity
  granularity: 'View',
  daily: 'Daily',
  weekly: 'Weekly',
  
  // General
  from: 'From',
  to: 'To',
  today: 'Today',
  yesterday: 'Yesterday',
  
  // Accessibility
  a11y: {
    dateRangePicker: 'Date range picker',
    granularityToggle: 'Granularity toggle',
    calendarNavigation: 'Calendar navigation',
    selectDate: 'Select date',
    openCalendar: 'Open calendar',
    closeCalendar: 'Close calendar'
  }
} as const;

// For backward compatibility
export const GermanLabels = Labels;

// Default date range presets
export function getDefaultPresets(): DateRangePreset[] {
  return [
    {
      id: 'today',
      label: 'Today',
      labelDE: Labels.today,
      getValue: () => {
        const today = new Date();
        return { from: today, to: today };
      }
    },
    {
      id: 'yesterday',
      label: 'Yesterday',
      labelDE: Labels.yesterday,
      getValue: () => {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        return { from: yesterday, to: yesterday };
      }
    },
    {
      id: 'last7days',
      label: 'Last 7 days',
      labelDE: Labels.last7Days,
      getValue: () => {
        const to = new Date();
        const from = new Date();
        from.setDate(from.getDate() - 6); // 6 days ago + today = 7 days
        return { from, to };
      }
    },
    {
      id: 'last30days',
      label: 'Last 30 days',
      labelDE: Labels.last30Days,
      getValue: () => {
        const to = new Date();
        const from = new Date();
        from.setDate(from.getDate() - 29); // 29 days ago + today = 30 days
        return { from, to };
      }
    },
    {
      id: 'last90days',
      label: 'Last 90 days',
      labelDE: Labels.last90Days,
      getValue: () => {
        const to = new Date();
        const from = new Date();
        from.setDate(from.getDate() - 89); // 89 days ago + today = 90 days
        return { from, to };
      }
    },
    {
      id: 'thisMonth',
      label: 'This month',
      labelDE: Labels.thisMonth,
      getValue: () => {
        const now = new Date();
        const from = new Date(now.getFullYear(), now.getMonth(), 1);
        const to = new Date();
        return { from, to };
      }
    },
    {
      id: 'lastMonth',
      label: 'Last month',
      labelDE: Labels.lastMonth,
      getValue: () => {
        const now = new Date();
        const from = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const to = new Date(now.getFullYear(), now.getMonth(), 0); // Last day of previous month
        return { from, to };
      }
    }
  ];
}

// URL state utilities
export function dateRangeToParams(range: DateRange): AnalyticsParams {
  return {
    from: range.from.toISOString().split('T')[0],
    to: range.to.toISOString().split('T')[0]
  };
}

export function paramsToDateRange(params: AnalyticsParams): DateRange | null {
  if (!params.from || !params.to) return null;
  
  try {
    const from = new Date(params.from);
    const to = new Date(params.to);
    
    if (isNaN(from.getTime()) || isNaN(to.getTime())) return null;
    
    return { from, to };
  } catch {
    return null;
  }
}

export function isValidGranularity(value: string): value is Granularity {
  return value === 'day' || value === 'week';
}

// Date formatting utilities
export function formatDateRange(range: DateRange, locale = 'en-US'): string {
  const formatter = new Intl.DateTimeFormat(locale, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
  
  return `${formatter.format(range.from)} - ${formatter.format(range.to)}`;
}

export function formatRelativeDate(date: Date, locale = 'en-US'): string {
  const now = new Date();
  const diffTime = now.getTime() - date.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return Labels.today;
  if (diffDays === 1) return Labels.yesterday;
  if (diffDays <= 7) return `${diffDays} days ago`;
  
  return new Intl.DateTimeFormat(locale, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(date);
}