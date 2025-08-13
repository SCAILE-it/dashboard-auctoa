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

// German labels
export const GermanLabels = {
  // Date Range Picker
  dateRange: 'Zeitraum',
  selectDateRange: 'Zeitraum auswählen',
  customRange: 'Benutzerdefiniert',
  apply: 'Anwenden',
  cancel: 'Abbrechen',
  
  // Presets
  last7Days: 'Letzte 7 Tage',
  last30Days: 'Letzte 30 Tage',
  last90Days: 'Letzte 90 Tage',
  thisMonth: 'Dieser Monat',
  lastMonth: 'Letzter Monat',
  
  // Granularity
  granularity: 'Darstellung',
  daily: 'Täglich',
  weekly: 'Wöchentlich',
  
  // General
  from: 'Von',
  to: 'Bis',
  today: 'Heute',
  yesterday: 'Gestern',
  
  // Accessibility
  a11y: {
    dateRangePicker: 'Datumsbereich-Auswahl',
    granularityToggle: 'Darstellungs-Umschalter',
    calendarNavigation: 'Kalender-Navigation',
    selectDate: 'Datum auswählen',
    openCalendar: 'Kalender öffnen',
    closeCalendar: 'Kalender schließen'
  }
} as const;

// Default date range presets
export function getDefaultPresets(): DateRangePreset[] {
  return [
    {
      id: 'last7days',
      label: 'Last 7 days',
      labelDE: GermanLabels.last7Days,
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
      labelDE: GermanLabels.last30Days,
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
      labelDE: GermanLabels.last90Days,
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
      labelDE: GermanLabels.thisMonth,
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
      labelDE: GermanLabels.lastMonth,
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
export function formatDateRange(range: DateRange, locale = 'de-DE'): string {
  const formatter = new Intl.DateTimeFormat(locale, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
  
  return `${formatter.format(range.from)} - ${formatter.format(range.to)}`;
}

export function formatRelativeDate(date: Date, locale = 'de-DE'): string {
  const now = new Date();
  const diffTime = now.getTime() - date.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return GermanLabels.today;
  if (diffDays === 1) return GermanLabels.yesterday;
  if (diffDays <= 7) return `vor ${diffDays} Tagen`;
  
  return new Intl.DateTimeFormat(locale, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(date);
}