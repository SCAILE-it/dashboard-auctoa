import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Users, Activity, Target, Percent } from "lucide-react";
import { PosthogKPI } from "@/types/posthog";

interface PosthogKPIsProps {
  kpis: PosthogKPI[];
  loading?: boolean;
}

export function PosthogKPIs({ kpis, loading = false }: PosthogKPIsProps) {
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
              <div className="h-3 bg-muted rounded w-20"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const getIcon = (kpiId: string) => {
    switch (kpiId) {
      case 'dau':
        return <Users className="h-4 w-4 text-muted-foreground" />;
      case 'wau':
        return <Activity className="h-4 w-4 text-muted-foreground" />;
      case 'mau':
        return <Target className="h-4 w-4 text-muted-foreground" />;
      case 'dau_mau_ratio':
        return <Percent className="h-4 w-4 text-muted-foreground" />;
      default:
        return <Activity className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const formatValue = (value: number, format: string) => {
    switch (format) {
      case 'percentage':
        return `${value.toFixed(1)}%`;
      case 'duration':
        return `${Math.floor(value / 60)}m ${Math.floor(value % 60)}s`;
      case 'number':
      default:
        return value.toLocaleString();
    }
  };

  const formatChange = (change: number) => {
    const absChange = Math.abs(change);
    return `${change >= 0 ? '+' : ''}${absChange.toFixed(1)}%`;
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {kpis.slice(0, 4).map((kpi) => (
        <Card key={kpi.id}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {kpi.title}
            </CardTitle>
            {getIcon(kpi.id)}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatValue(kpi.value, kpi.format)}
            </div>
            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
              <Badge 
                variant={kpi.changeType === 'increase' ? 'default' : 'secondary'}
                className="flex items-center space-x-1"
              >
                {kpi.changeType === 'increase' ? (
                  <TrendingUp className="h-3 w-3" />
                ) : (
                  <TrendingDown className="h-3 w-3" />
                )}
                <span>{formatChange(kpi.change)}</span>
              </Badge>
              <span>vs last period</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {kpi.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
