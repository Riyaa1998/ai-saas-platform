// app/(dashboard)/analytics/page.tsx
'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Bot, Zap, DollarSign, BarChart2, PieChart } from "lucide-react";
import { useEffect, useState } from "react";
import { DataVisualization } from "@/components/data-visualization";

// Mock data - replace with actual API calls
const mockData = {
  totalUsers: 1245,
  aiUsageCount: 5289,
  mostUsedFeature: "AI Image Generation",
  paidVsFree: {
    paid: 423,
    free: 822
  },
  usageData: [
    { month: 'Jan', users: 400, apiCalls: 2400, revenue: 2400 },
    { month: 'Feb', users: 650, apiCalls: 3200, revenue: 2800 },
    { month: 'Mar', users: 800, apiCalls: 4000, revenue: 3500 },
    { month: 'Apr', users: 900, apiCalls: 4500, revenue: 4100 },
    { month: 'May', users: 1000, apiCalls: 5000, revenue: 4800 },
    { month: 'Jun', users: 1200, apiCalls: 5200, revenue: 5200 },
  ],
  featureUsage: [
    { feature: 'AI Image Generation', usage: 45 },
    { feature: 'Text Analysis', usage: 25 },
    { feature: 'Code Generation', usage: 15 },
    { feature: 'Document Processing', usage: 10 },
    { feature: 'Other', usage: 5 },
  ]
};

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h2>
        <p className="text-muted-foreground">Key metrics and insights about your AI platform</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Total Users Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockData.totalUsers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">+12% from last month</p>
          </CardContent>
        </Card>

        {/* AI Usage Count Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">AI Usage Count</CardTitle>
            <Bot className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockData.aiUsageCount.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">+24% from last month</p>
          </CardContent>
        </Card>

        {/* Most Used Feature Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Most Used Feature</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockData.mostUsedFeature}</div>
            <p className="text-xs text-muted-foreground">Top performing feature</p>
          </CardContent>
        </Card>

        {/* Paid vs Free Users Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Paid vs Free Users</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {mockData.paidVsFree.paid} / {mockData.paidVsFree.free}
            </div>
            <p className="text-xs text-muted-foreground">
              {Math.round((mockData.paidVsFree.paid / mockData.totalUsers) * 100)}% conversion
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Usage Overview */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Monthly Usage</CardTitle>
              <BarChart2 className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent className="h-[300px]">
            <DataVisualization data={mockData.usageData} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Feature Usage</CardTitle>
              <PieChart className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent className="h-[300px]">
            <DataVisualization data={mockData.featureUsage} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}