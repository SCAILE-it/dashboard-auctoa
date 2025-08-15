/**
 * Professional CSV Export Button Component
 * Reusable button with loading states, proper error handling,
 * and user feedback following UI/UX best practices.
 */

"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Download, 
  Loader2, 
  CheckCircle, 
  AlertCircle,
  FileSpreadsheet 
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ExportButtonProps {
  onExport: () => Promise<void> | void;
  variant?: 'default' | 'outline' | 'secondary' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  disabled?: boolean;
  children?: React.ReactNode;
  className?: string;
  showIcon?: boolean;
  showBadge?: boolean;
  badgeText?: string;
  exportType?: string;
}

type ExportState = 'idle' | 'loading' | 'success' | 'error';

export function ExportButton({
  onExport,
  variant = 'outline',
  size = 'default',
  disabled = false,
  children,
  className,
  showIcon = true,
  showBadge = false,
  badgeText = 'CSV',
  exportType = 'data'
}: ExportButtonProps) {
  const [exportState, setExportState] = useState<ExportState>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');

  const handleExport = async () => {
    if (disabled || exportState === 'loading') return;

    setExportState('loading');
    setErrorMessage('');

    try {
      await onExport();
      setExportState('success');
      
      // Reset to idle after showing success briefly
      setTimeout(() => setExportState('idle'), 2000);
    } catch (error) {
      setExportState('error');
      setErrorMessage(error instanceof Error ? error.message : 'Export failed');
      
      // Reset to idle after showing error
      setTimeout(() => setExportState('idle'), 3000);
    }
  };

  const getButtonContent = () => {
    switch (exportState) {
      case 'loading':
        return (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="ml-2">Exporting...</span>
          </>
        );
      case 'success':
        return (
          <>
            <CheckCircle className="w-4 h-4 text-green-600" />
            <span className="ml-2">Downloaded!</span>
          </>
        );
      case 'error':
        return (
          <>
            <AlertCircle className="w-4 h-4 text-red-600" />
            <span className="ml-2">Export Failed</span>
          </>
        );
      default:
        return (
          <>
            {showIcon && <Download className="w-4 h-4" />}
            <span className={showIcon ? "ml-2" : ""}>
              {children || `Export ${exportType}`}
            </span>
          </>
        );
    }
  };

  const buttonVariant = exportState === 'error' ? 'destructive' : 
                       exportState === 'success' ? 'default' : variant;

  return (
    <div className="relative inline-flex items-center">
      <Button
        onClick={handleExport}
        disabled={disabled || exportState === 'loading'}
        variant={buttonVariant}
        size={size}
        className={cn(
          "transition-all duration-200",
          exportState === 'success' && "bg-green-600 hover:bg-green-700",
          className
        )}
        title={exportState === 'error' ? errorMessage : `Export ${exportType} to CSV`}
      >
        {getButtonContent()}
      </Button>
      
      {showBadge && exportState === 'idle' && (
        <Badge 
          variant="secondary" 
          className="absolute -top-2 -right-2 text-xs px-1.5 py-0.5 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
        >
          <FileSpreadsheet className="w-3 h-3 mr-1" />
          {badgeText}
        </Badge>
      )}
    </div>
  );
}

/**
 * Specialized export buttons for different data types
 */

export function ExportKPIsButton({ 
  onExport, 
  disabled = false,
  className 
}: { 
  onExport: () => Promise<void> | void;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <ExportButton
      onExport={onExport}
      disabled={disabled}
      className={className}
      showBadge={true}
      badgeText="KPI"
      exportType="KPIs"
    >
      Export KPIs
    </ExportButton>
  );
}

export function ExportChartDataButton({ 
  onExport, 
  disabled = false,
  className 
}: { 
  onExport: () => Promise<void> | void;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <ExportButton
      onExport={onExport}
      disabled={disabled}
      className={className}
      showBadge={true}
      badgeText="CSV"
      exportType="Chart Data"
    >
      Export Chart Data
    </ExportButton>
  );
}

export function ExportOverviewButton({ 
  onExport, 
  disabled = false,
  className 
}: { 
  onExport: () => Promise<void> | void;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <ExportButton
      onExport={onExport}
      disabled={disabled}
      variant="default"
      className={className}
      showBadge={true}
      badgeText="FULL"
      exportType="Complete Report"
    >
      Export Full Report
    </ExportButton>
  );
}