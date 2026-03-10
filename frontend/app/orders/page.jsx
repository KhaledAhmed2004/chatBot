"use client";

import { useState } from "react";
import * as api from "../../lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const STATUS_VARIANTS = {
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  confirmed: "bg-blue-50 text-blue-700 border-blue-200",
  shipped: "bg-orange-50 text-orange-700 border-orange-200",
  delivered: "bg-emerald-50 text-emerald-700 border-emerald-200",
  cancelled: "bg-red-50 text-red-700 border-red-200",
};

export default function OrderTrackingPage() {
  const [tab, setTab] = useState("orderId");
  const [orderId, setOrderId] = useState("");
  const [phone, setPhone] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const searchOrder = async (e) => {
    e.preventDefault();
    setError(null);
    setResult(null);
    setLoading(true);
    try {
      if (tab === "orderId") {
        if (!orderId.trim()) return setError("Enter order ID");
        const order = await api.fetchOrder(orderId.trim());
        setResult({ type: "single", order });
      } else {
        if (!phone.trim()) return setError("Enter phone number");
        const orders = await api.fetchOrdersByPhone(phone.trim());
        if (orders.length === 0) return setError("No orders found for this number");
        setResult({ type: "list", orders });
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-[800px] mx-auto p-6">
      <h1 className="text-2xl font-extrabold mb-5">Track Your Order</h1>

      {/* Tab switch */}
      <Tabs value={tab} onValueChange={(v) => { setTab(v); setResult(null); setError(null); }} className="mb-6">
        <TabsList>
          <TabsTrigger value="orderId">By Order ID</TabsTrigger>
          <TabsTrigger value="phone">By Phone Number</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Search form */}
      <form className="flex gap-3 mb-6" onSubmit={searchOrder}>
        {tab === "orderId" ? (
          <Input
            placeholder="Enter Order ID (e.g. WEB-XXXXX)"
            value={orderId}
            onChange={(e) => setOrderId(e.target.value)}
            className="flex-1"
          />
        ) : (
          <Input
            type="tel"
            placeholder="Enter phone number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="flex-1"
          />
        )}
        <Button type="submit" disabled={loading}>
          {loading ? "Searching..." : "Search"}
        </Button>
      </form>

      {error && <p className="text-sm text-destructive mb-4">{error}</p>}

      {/* Single order */}
      {result?.type === "single" && <OrderCard order={result.order} />}

      {/* Multiple orders */}
      {result?.type === "list" && (
        <div className="space-y-4">
          {result.orders.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      )}
    </div>
  );
}

function OrderCard({ order }) {
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between py-3 px-5 bg-muted/50">
        <strong className="text-sm">{order.id}</strong>
        <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold border capitalize ${STATUS_VARIANTS[order.status] || "bg-muted text-muted-foreground"}`}>
          {order.status}
        </span>
      </CardHeader>
      <CardContent className="px-5 py-3 space-y-1">
        {order.items.map((item, i) => (
          <div key={i} className="flex justify-between py-1.5 text-sm">
            <span>{item.name} x{item.quantity}</span>
            <span className="font-medium">৳{item.subtotal || item.price * item.quantity}</span>
          </div>
        ))}
      </CardContent>
      <div className="flex justify-between px-5 py-3 border-t text-sm">
        <span>Total: <strong>৳{order.total}</strong></span>
        <span className="text-muted-foreground">{new Date(order.created_at).toLocaleDateString("en-GB")}</span>
      </div>
    </Card>
  );
}
