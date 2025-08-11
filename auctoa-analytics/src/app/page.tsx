"use client";

import { useState } from "react";

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
          <h1 className="text-3xl font-bold text-primary">Auctoa Analytics Dashboard</h1>
          <button
            onClick={toggleDarkMode}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:opacity-90 transition-opacity"
          >
            {isDark ? '☀️ Light' : '🌙 Dark'}
          </button>
        </header>

        {/* Design System Test Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Primary Card */}
          <div className="bg-card border border-border rounded-lg p-6 shadow-md">
            <h3 className="text-lg font-semibold text-card-foreground mb-2">Primary Theme</h3>
            <p className="text-muted-foreground mb-4">Testing primary colors and card styling</p>
            <button className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:opacity-90">
              Primary Button
            </button>
          </div>

          {/* Status Colors */}
          <div className="bg-card border border-border rounded-lg p-6 shadow-md">
            <h3 className="text-lg font-semibold text-card-foreground mb-4">Status Colors</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-success rounded"></div>
                <span className="text-sm">Success</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-warning rounded"></div>
                <span className="text-sm">Warning</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-danger rounded"></div>
                <span className="text-sm">Danger</span>
              </div>
            </div>
          </div>

          {/* Chart Colors */}
          <div className="bg-card border border-border rounded-lg p-6 shadow-md">
            <h3 className="text-lg font-semibold text-card-foreground mb-4">Chart Colors</h3>
            <div className="grid grid-cols-5 gap-2">
              <div className="w-8 h-8 bg-chart-1 rounded"></div>
              <div className="w-8 h-8 bg-chart-2 rounded"></div>
              <div className="w-8 h-8 bg-chart-3 rounded"></div>
              <div className="w-8 h-8 bg-chart-4 rounded"></div>
              <div className="w-8 h-8 bg-chart-5 rounded"></div>
            </div>
          </div>
        </div>

        {/* KPI Cards Preview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-card border border-border rounded-lg p-6 shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Visits</p>
                <p className="text-2xl font-bold text-card-foreground">12,345</p>
              </div>
              <div className="text-success">↗ +12%</div>
            </div>
          </div>

          <div className="bg-card border border-border rounded-lg p-6 shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Bounce Rate</p>
                <p className="text-2xl font-bold text-card-foreground">23.4%</p>
              </div>
              <div className="text-danger">↘ -5%</div>
            </div>
          </div>

          <div className="bg-card border border-border rounded-lg p-6 shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg. Session</p>
                <p className="text-2xl font-bold text-card-foreground">2m 45s</p>
              </div>
              <div className="text-warning">↗ +3%</div>
            </div>
          </div>

          <div className="bg-card border border-border rounded-lg p-6 shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Conversions</p>
                <p className="text-2xl font-bold text-card-foreground">456</p>
              </div>
              <div className="text-success">↗ +18%</div>
            </div>
          </div>
        </div>

        {/* Typography Test */}
        <div className="bg-card border border-border rounded-lg p-6 shadow-md">
          <h2 className="text-2xl font-bold text-card-foreground mb-4">Typography Scale</h2>
          <div className="space-y-2">
            <p className="text-lg font-semibold">Large Text (18px)</p>
            <p className="text-base">Base Text (16px)</p>
            <p className="text-sm text-muted-foreground">Small Text (14px)</p>
            <p className="text-xs text-muted-foreground">Extra Small Text (12px)</p>
          </div>
        </div>
      </div>
    </div>
  );
}
