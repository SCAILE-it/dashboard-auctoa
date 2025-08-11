"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { 
  Moon, 
  Sun, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Eye, 
  MessageSquare, 
  Target,
  BarChart3,
  PieChart,
  LineChart,
  Activity
} from "lucide-react";

export default function Home() {
  const [isDark, setIsDark] = useState(false);

  const toggleDarkMode = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle('dark');
  };

  return (
    <div className={`min-h-screen bg-background text-foreground transition-colors duration-150`}>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <header className="flex justify-between items-center mb-12">
          <div className="flex items-center gap-3">
            <Activity className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold text-primary">Auctoa Analytics Dashboard</h1>
            <Badge variant="secondary">v1.0.0</Badge>
          </div>
          <Button
            onClick={toggleDarkMode}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            {isDark ? 'Light' : 'Dark'} Mode
          </Button>
        </header>

        {/* Design System Test Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Primary Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="h-5 w-5" />
                Primary Theme
              </CardTitle>
              <CardDescription>Testing primary colors and card styling with shadcn/ui</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Button className="w-full">Primary Button</Button>
                <Button variant="outline" className="w-full">Outline Button</Button>
                <Button variant="secondary" className="w-full">Secondary Button</Button>
              </div>
            </CardContent>
          </Card>

          {/* Status Colors */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Status & Badges
              </CardTitle>
              <CardDescription>Status colors and badge components</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Badge variant="default">Default</Badge>
                  <Badge variant="secondary">Secondary</Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className="bg-success text-success-foreground">Success</Badge>
                  <Badge className="bg-warning text-warning-foreground">Warning</Badge>
                  <Badge className="bg-danger text-danger-foreground">Danger</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Chart Colors */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Chart System
              </CardTitle>
              <CardDescription>Color palette for data visualization</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="grid grid-cols-5 gap-2">
                  <div className="w-8 h-8 bg-chart-1 rounded border"></div>
                  <div className="w-8 h-8 bg-chart-2 rounded border"></div>
                  <div className="w-8 h-8 bg-chart-3 rounded border"></div>
                  <div className="w-8 h-8 bg-chart-4 rounded border"></div>
                  <div className="w-8 h-8 bg-chart-5 rounded border"></div>
                </div>
                <Progress value={75} className="w-full" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Separator className="my-8" />

        {/* KPI Cards Preview */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
            <LineChart className="h-6 w-6" />
            Analytics KPI Preview
          </h2>
          <p className="text-muted-foreground mb-6">Example dashboard metrics with icons and trend indicators</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Total Visits
                  </p>
                  <p className="text-2xl font-bold">12,345</p>
                </div>
                <Badge className="bg-success text-success-foreground">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +12%
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    Bounce Rate
                  </p>
                  <p className="text-2xl font-bold">23.4%</p>
                </div>
                <Badge className="bg-danger text-danger-foreground">
                  <TrendingDown className="h-3 w-3 mr-1" />
                  -5%
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <Activity className="h-4 w-4" />
                    Avg. Session
                  </p>
                  <p className="text-2xl font-bold">2m 45s</p>
                </div>
                <Badge className="bg-warning text-warning-foreground">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +3%
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    Conversions
                  </p>
                  <p className="text-2xl font-bold">456</p>
                </div>
                <Badge className="bg-success text-success-foreground">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +18%
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        <Separator className="my-8" />

        {/* Typography Test */}
        <Card>
          <CardHeader>
            <CardTitle>Typography Scale & Component Integration</CardTitle>
            <CardDescription>
              Comprehensive showcase of shadcn/ui components with lucide-react icons and design system integration
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">Typography Hierarchy</h3>
                <div className="space-y-2">
                  <p className="text-lg font-semibold">Large Text (18px) - Headers</p>
                  <p className="text-base">Base Text (16px) - Body content</p>
                  <p className="text-sm text-muted-foreground">Small Text (14px) - Captions</p>
                  <p className="text-xs text-muted-foreground">Extra Small Text (12px) - Labels</p>
                </div>
              </div>
              
              <Separator />
              
              <div>
                <h3 className="text-lg font-semibold mb-2">Component Integration Status</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">shadcn/ui</Badge>
                    <span>✅ Installed</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">lucide-react</Badge>
                    <span>✅ Integrated</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">Tailwind v4</Badge>
                    <span>✅ Configured</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">Dark Mode</Badge>
                    <span>✅ Working</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
