"use client";

import { useState, useEffect } from "react";
import * as dashboardApi from "../../../lib/dashboardApi";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { DollarSign, CalendarDays, Package, Users } from "lucide-react";

export default function AnalyticsPage() {
  const [stats, setStats] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      dashboardApi.getStats(),
      dashboardApi.getAnalytics(),
    ]).then(([statsData, analyticsData]) => {
      setStats(statsData);
      setAnalytics(analyticsData);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-36" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="py-4">
              <CardContent className="flex items-center gap-4">
                <Skeleton className="h-12 w-12 rounded-lg" />
                <div className="space-y-2">
                  <Skeleton className="h-6 w-20" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        <Card>
          <CardHeader><Skeleton className="h-6 w-48" /></CardHeader>
          <CardContent><Skeleton className="h-52 w-full" /></CardContent>
        </Card>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <Card>
            <CardHeader><Skeleton className="h-6 w-36" /></CardHeader>
            <CardContent className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-6 w-full" />
              ))}
            </CardContent>
          </Card>
          <Card>
            <CardHeader><Skeleton className="h-6 w-32" /></CardHeader>
            <CardContent className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const maxRevenue = analytics?.dailyRevenue?.length > 0
    ? Math.max(...analytics.dailyRevenue.map((d) => d.revenue || 0))
    : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Total Revenue", value: `৳${(stats?.total_revenue || 0).toLocaleString()}`, icon: DollarSign },
          { label: "This Month", value: `৳${(stats?.this_month_revenue || 0).toLocaleString()}`, icon: CalendarDays },
          { label: "Total Orders", value: stats?.total_orders || 0, icon: Package },
          { label: "Total Customers", value: stats?.total_customers || 0, icon: Users },
        ].map((stat) => (
          <Card key={stat.label} className="py-4">
            <CardContent className="flex items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <stat.icon className="size-6" />
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-2xl font-bold tracking-tight">{stat.value}</span>
                <span className="text-sm text-muted-foreground">{stat.label}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Revenue Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Revenue — Last 30 Days</CardTitle>
        </CardHeader>
        <CardContent>
          {analytics?.dailyRevenue?.length > 0 ? (
            <div className="flex items-end gap-1 h-52 overflow-x-auto pb-6">
              {analytics.dailyRevenue.map((day) => (
                <div key={day.date} className="group relative flex flex-1 min-w-5 flex-col items-center justify-end h-full">
                  <div className="absolute bottom-full mb-1 hidden rounded bg-foreground px-2 py-1 text-xs text-background group-hover:block whitespace-nowrap z-10">
                    ৳{(day.revenue || 0).toLocaleString()} · {day.orders} orders
                  </div>
                  <div
                    className="w-full max-w-8 rounded-t bg-emerald-500 transition-all min-h-0.5"
                    style={{ height: `${maxRevenue > 0 ? ((day.revenue || 0) / maxRevenue) * 100 : 0}%` }}
                  />
                  <span className="mt-1 text-[10px] text-muted-foreground whitespace-nowrap">
                    {day.date.slice(5)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="py-8 text-center text-sm text-muted-foreground">No revenue data yet</p>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Orders by Status */}
        <Card>
          <CardHeader>
            <CardTitle>Orders by Status</CardTitle>
          </CardHeader>
          <CardContent>
            {analytics?.ordersByStatus?.length > 0 ? (
              <div className="space-y-3">
                {analytics.ordersByStatus.map((item) => {
                  const colors = {
                    pending: "bg-amber-500",
                    confirmed: "bg-blue-500",
                    delivered: "bg-emerald-500",
                    cancelled: "bg-red-500",
                  };
                  return (
                    <div key={item.status} className="flex items-center gap-3">
                      <span className="w-20 text-sm font-medium capitalize">{item.status}</span>
                      <div className="flex-1 h-6 rounded bg-muted overflow-hidden">
                        <div
                          className={`h-full rounded ${colors[item.status] || "bg-gray-400"} transition-all`}
                          style={{ width: `${(item.count / (stats?.total_orders || 1)) * 100}%` }}
                        />
                      </div>
                      <span className="w-10 text-right text-sm font-semibold">{item.count}</span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="py-8 text-center text-sm text-muted-foreground">No order data yet</p>
            )}
          </CardContent>
        </Card>

        {/* Top Products */}
        <Card>
          <CardHeader>
            <CardTitle>Top Products</CardTitle>
          </CardHeader>
          <CardContent>
            {analytics?.topProducts?.length > 0 ? (
              <div className="space-y-3">
                {analytics.topProducts.map((product, i) => (
                  <div key={product.id} className="flex items-center gap-3 rounded-md border p-3">
                    <Badge variant="outline" className="font-bold">#{i + 1}</Badge>
                    <span className="flex-1 text-sm font-medium">{product.name}</span>
                    <span className="text-sm text-muted-foreground">{product.order_count} orders</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="py-8 text-center text-sm text-muted-foreground">No product data yet</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
