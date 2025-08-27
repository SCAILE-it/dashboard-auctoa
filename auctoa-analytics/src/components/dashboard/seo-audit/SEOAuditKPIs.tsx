import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Gauge, Search, Eye, CheckCircle, AlertTriangle, XCircle } from "lucide-react";
import { SEOAuditKPI } from "@/types/seo-audit";

interface SEOAuditKPIsProps {
  kpis: SEOAuditKPI[];
  loading?: boolean;
}

export function SEOAuditKPIs({ kpis, loading = false }: SEOAuditKPIsProps) {
  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 bg-muted rounded w-24"></div>
              <div className="h-4 w-4 bg-muted rounded"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-muted rounded w-16 mb-2"></div>
              <div className="h-3 bg-muted rounded w-32"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const getIcon = (category: string) => {
    switch (category) {
      case 'performance':
        return Gauge;
      case 'seo':
        return Search;
      case 'accessibility':
        return Eye;
      case 'best-practices':
        return CheckCircle;
      default:
        return Gauge;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'good':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'needs-improvement':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'poor':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <CheckCircle className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'needs-improvement':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'poor':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const formatValue = (kpi: SEOAuditKPI) => {
    switch (kpi.format) {
      case 'percentage':
        return `${kpi.value}%`;
      case 'milliseconds':
        return `${kpi.value}ms`;
      case 'score':
        return `${kpi.value}/100`;
      case 'number':
        return kpi.value.toLocaleString();
      default:
        return kpi.value;
    }
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {kpis.map((kpi) => {
        const Icon = getIcon(kpi.category);
        
        return (
          <Card key={kpi.id} className="relative overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {kpi.title}
              </CardTitle>
              <div className="flex items-center gap-2">
                {getStatusIcon(kpi.status)}
                <Icon className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="text-2xl font-bold">
                    {formatValue(kpi)}
                  </div>
                  {kpi.change !== undefined && (
                    <div className="flex items-center text-xs text-muted-foreground">
                      {kpi.changeType === 'increase' ? (
                        <TrendingUp className="mr-1 h-3 w-3 text-green-600" />
                      ) : (
                        <TrendingDown className="mr-1 h-3 w-3 text-red-600" />
                      )}
                      <span className={kpi.changeType === 'increase' ? 'text-green-600' : 'text-red-600'}>
                        {Math.abs(kpi.change)}%
                      </span>
                    </div>
                  )}
                </div>
                <Badge 
                  variant="outline" 
                  className={`text-xs ${getStatusColor(kpi.status)}`}
                >
                  {kpi.status === 'needs-improvement' ? 'Needs Work' : 
                   kpi.status.charAt(0).toUpperCase() + kpi.status.slice(1)}
                </Badge>
              </div>
              
              {/* Progress bar for scores */}
              {kpi.format === 'score' && kpi.score !== undefined && (
                <div className="mt-3">
                  <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                    <span>Score</span>
                    <span>{kpi.score}/100</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${
                        kpi.score >= 90 ? 'bg-green-500' :
                        kpi.score >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${kpi.score}%` }}
                    ></div>
                  </div>
                </div>
              )}
              
              <p className="text-xs text-muted-foreground mt-2">
                {kpi.description}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
