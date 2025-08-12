import { ReactNode } from "react";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface DashboardSectionProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  children: ReactNode;
  className?: string;
  headerAction?: ReactNode;
}

export function DashboardSection({ 
  title, 
  description, 
  icon: Icon, 
  children, 
  className,
  headerAction 
}: DashboardSectionProps) {
  return (
    <section className={cn("space-y-6", className)}>
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold tracking-tight flex items-center gap-3">
            {Icon && <Icon className="h-6 w-6 text-primary" />}
            {title}
          </h2>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>
        {headerAction && (
          <div>{headerAction}</div>
        )}
      </div>
      <div>{children}</div>
    </section>
  );
}