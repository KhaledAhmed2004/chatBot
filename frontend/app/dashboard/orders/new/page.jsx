"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import * as dashboardApi from "../../../../lib/dashboardApi";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Home,
  Plus,
  Minus,
  Trash2,
  Tag,
  ChevronDown,
  ArrowLeft,
} from "lucide-react";

export default function NewOrderPage() {
  const router = useRouter();

  // Form state
  const [customerName, setCustomerName] = useState("");
  const [countryCode, setCountryCode] = useState("+880");
  const [phone, setPhone] = useState("");
  const [service, setService] = useState("");
  const [remark, setRemark] = useState("");
  const [adjustment, setAdjustment] = useState(0);

  // Products & items
  const [products, setProducts] = useState([]);
  const [orderItems, setOrderItems] = useState([]);
  const [customItems, setCustomItems] = useState([]);

  // UI state
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [promoOpen, setPromoOpen] = useState(false);
  const [promoCode, setPromoCode] = useState("");

  useEffect(() => {
    dashboardApi.getProducts().then((data) => {
      setProducts(data.products || []);
    }).catch(console.error);
  }, []);

  // Add product from catalog
  const addProduct = (productId) => {
    const product = products.find((p) => p.id === Number(productId));
    if (!product) return;
    const existing = orderItems.find((i) => i.productId === product.id);
    if (existing) {
      setOrderItems((prev) =>
        prev.map((i) =>
          i.productId === product.id ? { ...i, quantity: i.quantity + 1 } : i
        )
      );
    } else {
      setOrderItems((prev) => [
        ...prev,
        { productId: product.id, name: product.name, price: product.price, quantity: 1 },
      ]);
    }
  };

  const updateItemQty = (productId, delta) => {
    setOrderItems((prev) =>
      prev
        .map((i) => (i.productId === productId ? { ...i, quantity: i.quantity + delta } : i))
        .filter((i) => i.quantity > 0)
    );
  };

  const removeItem = (productId) => {
    setOrderItems((prev) => prev.filter((i) => i.productId !== productId));
  };

  // Custom items
  const addCustomItem = () => {
    setCustomItems((prev) => [
      ...prev,
      { id: Date.now(), name: "", price: 0, quantity: 1 },
    ]);
  };

  const updateCustomItem = (id, field, value) => {
    setCustomItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, [field]: value } : i))
    );
  };

  const removeCustomItem = (id) => {
    setCustomItems((prev) => prev.filter((i) => i.id !== id));
  };

  // Totals
  const itemsTotal = orderItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const customTotal = customItems.reduce((sum, i) => sum + (Number(i.price) || 0) * i.quantity, 0);
  const subtotal = itemsTotal + customTotal;
  const total = subtotal + Number(adjustment || 0);

  const handleSave = async () => {
    setError("");
    if (!customerName.trim()) {
      setError("Customer name is required");
      return;
    }
    if (!phone.trim()) {
      setError("WhatsApp number is required");
      return;
    }
    if (orderItems.length === 0 && customItems.length === 0) {
      setError("Add at least one item");
      return;
    }
    if (!service) {
      setError("Please select a service type");
      return;
    }

    setSaving(true);
    try {
      await dashboardApi.createDashboardOrder({
        customerName: customerName.trim(),
        phone: `${countryCode}${phone.trim()}`,
        items: orderItems.map((i) => ({ productId: i.productId, quantity: i.quantity })),
        service,
        remark: remark.trim() || undefined,
        adjustment: Number(adjustment) || undefined,
      });
      router.push("/dashboard/orders");
    } catch (err) {
      setError(err.message);
    }
    setSaving(false);
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link
            href="/dashboard/orders"
            className="inline-flex items-center gap-1 text-sm text-primary hover:underline mb-1"
          >
            <ArrowLeft className="size-3.5" />
            Orders
          </Link>
          <h1 className="text-2xl font-bold tracking-tight">Checkout</h1>
        </div>
        <Link href="/dashboard" className="text-muted-foreground hover:text-foreground">
          <Home className="size-5" />
        </Link>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Customer */}
      <Card>
        <CardContent className="p-5 space-y-4">
          <h2 className="font-semibold">Customer</h2>

          <div className="space-y-1.5">
            <Label htmlFor="cname">
              Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="cname"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Customer name"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="cphone">
              WhatsApp number <span className="text-destructive">*</span>
            </Label>
            <div className="flex gap-2">
              <Select value={countryCode} onValueChange={setCountryCode}>
                <SelectTrigger className="w-[100px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="+880">+880</SelectItem>
                  <SelectItem value="+91">+91</SelectItem>
                  <SelectItem value="+1">+1</SelectItem>
                  <SelectItem value="+44">+44</SelectItem>
                </SelectContent>
              </Select>
              <Input
                id="cphone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Phone number"
                className="flex-1"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Items */}
      <Card>
        <CardContent className="p-5 space-y-4">
          <h2 className="font-semibold">Items</h2>

          {/* Add from catalog */}
          <Select onValueChange={addProduct}>
            <SelectTrigger>
              <SelectValue placeholder="Add item from catalog..." />
            </SelectTrigger>
            <SelectContent>
              {products.map((p) => (
                <SelectItem key={p.id} value={String(p.id)}>
                  {p.name} — ৳{p.price?.toLocaleString()}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Order items list */}
          {orderItems.length > 0 && (
            <div className="rounded-lg border divide-y">
              {orderItems.map((item) => (
                <div key={item.productId} className="flex items-center gap-3 px-3 py-2.5">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{item.name}</p>
                    <p className="text-xs text-muted-foreground">
                      ৳{item.price?.toLocaleString()} each
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="outline"
                      size="icon"
                      className="size-7"
                      onClick={() => updateItemQty(item.productId, -1)}
                    >
                      <Minus className="size-3" />
                    </Button>
                    <span className="w-8 text-center text-sm font-medium">
                      {item.quantity}
                    </span>
                    <Button
                      variant="outline"
                      size="icon"
                      className="size-7"
                      onClick={() => updateItemQty(item.productId, 1)}
                    >
                      <Plus className="size-3" />
                    </Button>
                  </div>
                  <span className="w-16 text-right text-sm font-medium">
                    ৳{(item.price * item.quantity).toLocaleString()}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-7 text-muted-foreground hover:text-destructive"
                    onClick={() => removeItem(item.productId)}
                  >
                    <Trash2 className="size-3" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          {/* Custom items */}
          {customItems.map((item) => (
            <div key={item.id} className="flex items-center gap-2 rounded-lg border p-3">
              <div className="flex-1 space-y-2">
                <Input
                  placeholder="Item name"
                  value={item.name}
                  onChange={(e) => updateCustomItem(item.id, "name", e.target.value)}
                  className="h-8 text-sm"
                />
                <div className="flex gap-2">
                  <Input
                    type="number"
                    placeholder="Price"
                    value={item.price || ""}
                    onChange={(e) => updateCustomItem(item.id, "price", e.target.value)}
                    className="h-8 text-sm w-24"
                    min="0"
                  />
                  <div className="flex items-center gap-1">
                    <Button
                      variant="outline"
                      size="icon"
                      className="size-7"
                      onClick={() =>
                        updateCustomItem(item.id, "quantity", Math.max(1, item.quantity - 1))
                      }
                    >
                      <Minus className="size-3" />
                    </Button>
                    <span className="w-6 text-center text-xs">{item.quantity}</span>
                    <Button
                      variant="outline"
                      size="icon"
                      className="size-7"
                      onClick={() => updateCustomItem(item.id, "quantity", item.quantity + 1)}
                    >
                      <Plus className="size-3" />
                    </Button>
                  </div>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="size-7 text-muted-foreground hover:text-destructive"
                onClick={() => removeCustomItem(item.id)}
              >
                <Trash2 className="size-3" />
              </Button>
            </div>
          ))}

          <button
            onClick={addCustomItem}
            className="w-full text-center text-sm text-primary hover:underline py-2"
          >
            Add custom item
          </button>
        </CardContent>
      </Card>

      {/* Service */}
      <Card>
        <CardContent className="p-5 space-y-3">
          <h2 className="font-semibold">
            Service <span className="text-destructive">*</span>
          </h2>
          <div className="space-y-2">
            <label className="flex items-center gap-3 rounded-lg border p-3.5 cursor-pointer has-[:checked]:border-primary has-[:checked]:bg-primary/5 transition-colors">
              <input
                type="radio"
                name="service"
                value="pickup"
                checked={service === "pickup"}
                onChange={(e) => setService(e.target.value)}
                className="accent-primary size-4"
              />
              <span className="text-sm font-medium text-primary">Pick up</span>
            </label>
            <label className="flex items-center gap-3 rounded-lg border p-3.5 cursor-pointer has-[:checked]:border-primary has-[:checked]:bg-primary/5 transition-colors">
              <input
                type="radio"
                name="service"
                value="delivery"
                checked={service === "delivery"}
                onChange={(e) => setService(e.target.value)}
                className="accent-primary size-4"
              />
              <span className="text-sm font-medium text-primary">Delivery</span>
            </label>
          </div>
        </CardContent>
      </Card>

      {/* Admin-only section */}
      <Card className="overflow-hidden">
        <div className="bg-foreground text-background px-5 py-3">
          <p className="text-sm font-medium">Only available on Admin view</p>
        </div>
        <CardContent className="p-5 space-y-5">
          <div className="space-y-1.5">
            <Label className="font-semibold">Remark</Label>
            <p className="text-xs text-muted-foreground">Visible to customers</p>
            <Input
              value={remark}
              onChange={(e) => setRemark(e.target.value)}
              placeholder="optional"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="font-semibold">Adjustment</Label>
            <p className="text-xs text-muted-foreground">
              Add arbitrary amount to adjust the charges in invoice
            </p>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                ৳
              </span>
              <Input
                type="number"
                value={adjustment}
                onChange={(e) => setAdjustment(e.target.value)}
                className="pl-7"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Promo code */}
      <Card>
        <Collapsible open={promoOpen} onOpenChange={setPromoOpen}>
          <CollapsibleTrigger asChild>
            <button className="flex w-full items-center justify-between p-5 text-left">
              <div className="flex items-center gap-2">
                <Tag className="size-4" />
                <span className="text-sm font-medium">Promo code</span>
              </div>
              <ChevronDown
                className={`size-4 text-muted-foreground transition-transform ${
                  promoOpen ? "rotate-180" : ""
                }`}
              />
            </button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="px-5 pb-5 pt-0">
              <Input
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
                placeholder="Enter promo code"
              />
            </div>
          </CollapsibleContent>
        </Collapsible>
      </Card>

      {/* Summary */}
      {(orderItems.length > 0 || customItems.length > 0) && (
        <Card>
          <CardContent className="p-5 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span>৳{subtotal.toLocaleString()}</span>
            </div>
            {Number(adjustment) !== 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Adjustment</span>
                <span>৳{Number(adjustment).toLocaleString()}</span>
              </div>
            )}
            <Separator />
            <div className="flex justify-between font-semibold">
              <span>Total</span>
              <span>৳{total.toLocaleString()}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Save button */}
      <Button
        className="w-full h-12 text-base font-semibold"
        onClick={handleSave}
        disabled={saving}
      >
        {saving ? "Saving..." : "Save"}
      </Button>
    </div>
  );
}
