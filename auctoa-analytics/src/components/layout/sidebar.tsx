"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Activity,
  BarChart3,
  LineChart,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  X,
  Users,
  Search
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const navigation = [
  {
    category: "Pinned",
    items: [
      {
        name: "Overview",
        href: "/",
        icon: Activity,
      },
    ]
  },
  {
    category: "Website Analytics",
    items: [
      {
        name: "Website Analytics",
        href: "/analytics",
        icon: BarChart3,
      },
      {
        name: "Search Performance",
        href: "/search",
        icon: LineChart,
      },
      {
        name: "PostHog Analytics",
        href: "/posthog",
        icon: Users,
      },
    ]
  },
  {
    category: "Acquisition",
    items: [
      {
        name: "SEO Healthcheck",
        href: "/seo-audit",
        icon: Search,
      },
    ]
  },
  {
    category: "Leads & Messaging",
    items: [
      {
        name: "Chatbot Analytics",
        href: "/chatbot",
        icon: MessageSquare,
      },
    ]
  }
];

interface SidebarProps {
  onClose?: () => void;
}

export function Sidebar({ onClose }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  return (
    <div 
      className={cn(
        "bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col transition-all duration-300",
        collapsed ? "w-16" : "w-64",
        "h-full" // Full height consistently
      )}
    >
      {/* Logo and controls */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <Activity className="h-6 w-6 text-primary" />
            <span className="font-semibold text-lg text-gray-900 dark:text-white">Analytics Dashboard</span>
          </div>
        )}
        
        <div className="flex items-center gap-1">
          {/* Mobile close button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0 lg:hidden"
          >
            <X className="h-4 w-4" />
          </Button>
          
          {/* Desktop collapse button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCollapsed(!collapsed)}
            className="h-8 w-8 p-0 hidden lg:flex"
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-6">
        {navigation.map((section) => (
          <div key={section.category}>
            {/* Category Header */}
            {!collapsed && (
              <div className="px-3 mb-3">
                <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {section.category}
                </h3>
              </div>
            )}
            
            {/* Category Items */}
            <div className="space-y-1">
              {section.items.map((item) => {
                const isActive = pathname === item.href || 
                  (item.href !== "/" && pathname.startsWith(item.href));
                
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => {
                      // Only close sidebar on mobile (when overlay is present)
                      if (window.innerWidth < 1024) {
                        onClose?.();
                      }
                    }}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                      "hover:bg-gray-100 dark:hover:bg-gray-800",
                      "focus:outline-none focus:ring-0", // Remove focus outline
                      isActive 
                        ? "bg-gray-100 text-gray-900 font-semibold dark:bg-gray-800 dark:text-white" 
                        : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800"
                    )}
                  >
                    <item.icon className="h-5 w-5 flex-shrink-0" />
                    {!collapsed && <span>{item.name}</span>}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* User section (placeholder) */}
      {!collapsed && (
        <div className="p-4 border-t border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="h-8 w-8 bg-primary/10 rounded-full flex items-center justify-center">
              <span className="text-sm font-medium text-primary">A</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white">Admin</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">Dashboard Access</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}