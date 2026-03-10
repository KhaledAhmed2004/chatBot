"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "../../context/CartContext";
import * as api from "../../lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, CheckCircle } from "lucide-react";

export default function CheckoutPage() {
  const router = useRouter();
  const { sessionId, items, total, resetSession } = useCart();
  const [form, setForm] = useState({ customerName: "", phone: "", address: "", note: "" });
  const [submitting, setSubmitting] = useState(false);
  const [order, setOrder] = useState(null);
  const [error, setError] = useState(null);

  // Cart empty
  if (items.length === 0 && !order) {
    return (
      <div className="max-w-[900px] mx-auto p-6 text-center py-20 space-y-4">
        <h2 className="text-xl font-bold">Your cart is empty!</h2>
        <Button asChild>
          <Link href="/store">Browse Products</Link>
        </Button>
      </div>
    );
  }

  // Order success
  if (order) {
    return (
      <div className="max-w-[900px] mx-auto p-6 text-center py-16 space-y-4">
        <CheckCircle className="size-16 text-primary mx-auto" />
        <h2 className="text-2xl font-extrabold">Order Placed!</h2>
        <div className="inline-block bg-primary/10 text-primary font-bold px-6 py-3 rounded-lg">
          Order ID: {order.orderId}
        </div>
        <p className="text-xl font-bold">Total: ৳{order.total}</p>
        <p className="text-muted-foreground">
          We will contact you on WhatsApp for delivery details.
        </p>
        <div className="flex gap-3 justify-center pt-2">
          <Button onClick={() => { resetSession(); router.push("/store"); }}>
            Continue Shopping
          </Button>
          <Button asChild variant="outline">
            <Link href="/orders">Track Order</Link>
          </Button>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!form.customerName.trim()) return setError("Please enter your name");
    if (!form.phone.trim()) return setError("Please enter your phone number");
    if (form.phone.replace(/[^0-9]/g, "").length < 10)
      return setError("Please enter a valid phone number (with country code)");
    if (!form.address.trim()) return setError("Please enter delivery address");

    setSubmitting(true);
    try {
      const result = await api.placeOrder({
        sessionId,
        phone: form.phone.trim(),
        customerName: form.customerName.trim(),
        address: form.address.trim(),
        note: form.note.trim(),
      });
      setOrder(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-[900px] mx-auto p-6">
      <Link href="/store" className="inline-flex items-center gap-1.5 text-muted-foreground text-sm hover:text-primary transition-colors mb-6">
        <ArrowLeft className="size-4" />
        Back to Store
      </Link>
      <h1 className="text-2xl font-extrabold mb-6">Checkout</h1>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Order summary */}
        <Card className="flex-1">
          <CardHeader>
            <CardTitle className="text-base">Order Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {items.map((item) => (
              <div key={item.product_id} className="flex justify-between py-2 border-b last:border-0 text-sm">
                <span>{item.product_name} x{item.quantity}</span>
                <span className="font-medium">৳{item.price * item.quantity}</span>
              </div>
            ))}
            <div className="flex justify-between font-bold text-lg pt-3 border-t-2">
              <span>Total</span>
              <span>৳{total}</span>
            </div>
          </CardContent>
        </Card>

        {/* Checkout form */}
        <form className="flex-[1.2] space-y-4" onSubmit={handleSubmit}>
          <h3 className="font-bold text-base">Delivery Details</h3>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="space-y-2">
            <Label>Full Name *</Label>
            <Input
              value={form.customerName}
              onChange={(e) => setForm({ ...form, customerName: e.target.value })}
              placeholder="Enter your name"
            />
          </div>

          <div className="space-y-2">
            <Label>Phone Number * <span className="text-xs text-muted-foreground">(with country code, e.g. 8801XXXXXXXXX)</span></Label>
            <Input
              type="tel"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="8801XXXXXXXXX"
            />
          </div>

          <div className="space-y-2">
            <Label>Delivery Address *</Label>
            <Textarea
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              placeholder="Full delivery address"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label>Note (optional)</Label>
            <Input
              value={form.note}
              onChange={(e) => setForm({ ...form, note: e.target.value })}
              placeholder="Any special instructions"
            />
          </div>

          <Button className="w-full" size="lg" type="submit" disabled={submitting}>
            {submitting ? "Placing Order..." : `Place Order - ৳${total}`}
          </Button>
        </form>
      </div>
    </div>
  );
}
