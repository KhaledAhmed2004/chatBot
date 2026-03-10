"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "../../context/AuthContext";
import * as dashboardApi from "../../lib/dashboardApi";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardAction } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Share2, Tag, UserPlus, Plus } from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

function getDayLabel(dateStr) {
  const date = new Date(dateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  if (d.getTime() === today.getTime()) return "Today";
  return d.toLocaleDateString("en", { weekday: "short" });
}

function getLast7DaysChart(dailyRevenue) {
  const today = new Date();
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];
    const found = dailyRevenue?.find((r) => r.date === dateStr);
    days.push({
      label: getDayLabel(dateStr),
      revenue: found?.revenue || 0,
      orders: found?.orders || 0,
    });
  }
  return days;
}

export default function DashboardHome() {
  const { owner, store } = useAuth();
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
        <Skeleton className="h-9 w-72" />
        <div className="flex gap-3">
          <Skeleton className="h-10 w-40" />
          <Skeleton className="h-10 w-36" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="pt-6 space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-7 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Card>
          <CardContent className="pt-6">
            <Skeleton className="h-[250px] w-full" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-20" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-20 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  const chartData = getLast7DaysChart(analytics?.dailyRevenue);

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <h1 className="text-2xl font-bold tracking-tight">
        Hi, {owner?.name} 👋
      </h1>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3">
        <Button variant="outline" className="gap-2" asChild>
          <Link href="/dashboard/marketing">
            <Share2 className="size-4" />
            Share your store
          </Link>
        </Button>
        <Button variant="outline" className="gap-2" asChild>
          <Link href="/dashboard/products/new">
            <Tag className="size-4" />
            Add products
          </Link>
        </Button>
        <Button variant="outline" className="gap-2" asChild>
          <Link href="/dashboard/staff">
            <UserPlus className="size-4" />
            Invite staff
          </Link>
        </Button>
      </div>

      {/* Stats Row - 3 cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardContent>
            <p className="text-sm text-muted-foreground">Today's orders</p>
            <p className="mt-1 text-2xl font-bold tracking-tight">{stats?.today_orders || 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <p className="text-sm text-muted-foreground">Today's sales</p>
            <p className="mt-1 text-2xl font-bold tracking-tight">
              ৳{(stats?.today_revenue || 0).toLocaleString("en", { minimumFractionDigits: 2 })}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <p className="text-sm text-muted-foreground">Monthly sales</p>
            <p className="mt-1 text-2xl font-bold tracking-tight">
              ৳{(stats?.this_month_revenue || 0).toLocaleString("en", { minimumFractionDigits: 2 })}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Chart Card with Tabs */}
      <Card>
        <CardContent>
          <Tabs defaultValue="sales">
            <TabsList>
              <TabsTrigger value="sales">Sales</TabsTrigger>
              <TabsTrigger value="orders">Orders</TabsTrigger>
              <TabsTrigger value="views">Views</TabsTrigger>
            </TabsList>

            <TabsContent value="sales" className="mt-4">
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.2} />
                      <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="label" axisLine={false} tickLine={false} className="text-xs" />
                  <YAxis axisLine={false} tickLine={false} className="text-xs" />
                  <Tooltip
                    formatter={(value) => [`৳${value.toLocaleString()}`, "Revenue"]}
                    contentStyle={{ borderRadius: "8px", border: "1px solid hsl(var(--border))" }}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="hsl(var(--primary))"
                    fill="url(#salesGrad)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </TabsContent>

            <TabsContent value="orders" className="mt-4">
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="ordersGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.2} />
                      <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="label" axisLine={false} tickLine={false} className="text-xs" />
                  <YAxis axisLine={false} tickLine={false} className="text-xs" />
                  <Tooltip
                    formatter={(value) => [value, "Orders"]}
                    contentStyle={{ borderRadius: "8px", border: "1px solid hsl(var(--border))" }}
                  />
                  <Area
                    type="monotone"
                    dataKey="orders"
                    stroke="hsl(var(--primary))"
                    fill="url(#ordersGrad)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </TabsContent>

            <TabsContent value="views" className="mt-4">
              <div className="flex h-[250px] items-center justify-center text-sm text-muted-foreground">
                Page view tracking coming soon
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Orders Section */}
      <Card>
        <CardHeader>
          <CardTitle>Orders</CardTitle>
          <CardDescription>Last 30 days</CardDescription>
          <CardAction>
            <Button variant="outline" size="icon" asChild>
              <Link href="/dashboard/orders">
                <Plus className="size-4" />
              </Link>
            </Button>
          </CardAction>
        </CardHeader>
        <CardContent>
          {stats?.recent_orders?.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stats.recent_orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-mono text-xs font-medium">
                      {order.id}
                    </TableCell>
                    <TableCell>{order.user_name || order.user_id}</TableCell>
                    <TableCell className="font-medium">
                      ৳{order.total?.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={cn(
                          "capitalize",
                          {
                            pending: "bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-100",
                            confirmed: "bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-100",
                            delivered: "bg-emerald-100 text-emerald-800 border-emerald-200 hover:bg-emerald-100",
                            cancelled: "bg-red-100 text-red-800 border-red-200 hover:bg-red-100",
                          }[order.status] || "bg-gray-100 text-gray-800 border-gray-200"
                        )}
                      >
                        {order.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(order.created_at).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No orders
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
