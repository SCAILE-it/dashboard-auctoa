import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface KPICardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: string | number;
    isPositive: boolean;
    isNeutral?: boolean;
  };
  className?: string;
  loading?: boolean;
}

export function KPICard({ 
  title, 
  value, 
  icon: Icon, 
  trend, 
  className,
  loading = false 
}: KPICardProps) {
  if (loading) {
    return (
      <Card className={cn("", className)}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="h-4 w-20 bg-muted animate-pulse rounded" />
              <div className="h-8 w-16 bg-muted animate-pulse rounded" />
            </div>
            <div className="h-6 w-12 bg-muted animate-pulse rounded" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const getTrendBadgeVariant = () => {
    if (!trend) return "secondary";
    if (trend.isNeutral) return "secondary";
    return trend.isPositive ? "default" : "destructive";
  };

  const getTrendBadgeClass = () => {
    if (!trend) return "";
    if (trend.isNeutral) return "";
    return trend.isPositive 
      ? "bg-success text-success-foreground" 
      : "bg-danger text-danger-foreground";
  };

  return (
    <Card className={cn("hover:shadow-md transition-shadow duration-200", className)}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground flex items-center gap-2">
              <Icon className="h-4 w-4" />
              {title}
            </p>
            <p className="text-2xl font-bold mt-1">{value}</p>
          </div>
          {trend && (
            <Badge 
              variant={getTrendBadgeVariant()}
              className={cn(getTrendBadgeClass(), "cursor-help")}
              title="Compared to same length period immediately before current selection"
            >
              {trend.isNeutral ? null : trend.isPositive ? (
                <TrendingUp className="h-3 w-3 mr-1" />
              ) : (
                <TrendingDown className="h-3 w-3 mr-1" />
              )}
              {typeof trend.value === 'string' ? trend.value : `${trend.value > 0 ? '+' : ''}${trend.value}%`}
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}