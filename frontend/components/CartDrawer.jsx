"use client";

import { useRouter } from "next/navigation";
import { useCart } from "../context/CartContext";
import { Button } from "./ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
  SheetDescription,
} from "./ui/sheet";
import { Minus, Plus, X } from "lucide-react";

export default function CartDrawer() {
  const router = useRouter();
  const { isOpen, closeCart, items, total, count, updateQuantity, removeItem, emptyCart, loading } = useCart();

  return (
    <Sheet open={isOpen} onOpenChange={(open) => { if (!open) closeCart(); }}>
      <SheetContent className="flex flex-col sm:max-w-md">
        <SheetHeader className="border-b pb-4">
          <SheetTitle>Cart ({count})</SheetTitle>
          <SheetDescription className="sr-only">Your shopping cart items</SheetDescription>
        </SheetHeader>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto px-1 py-2 space-y-1">
          {items.length === 0 ? (
            <div className="text-center text-muted-foreground py-12 space-y-4">
              <p>Your cart is empty!</p>
              <Button onClick={() => { closeCart(); router.push("/store"); }}>
                Browse Products
              </Button>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.product_id} className="flex items-center justify-between gap-3 py-3 border-b last:border-0">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate">{item.product_name}</p>
                  <p className="text-primary font-bold text-sm">৳{item.price * item.quantity}</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="inline-flex items-center border rounded-md">
                    <button
                      disabled={loading}
                      onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                      className="px-2 py-1 hover:bg-muted transition-colors disabled:opacity-50"
                    >
                      <Minus className="size-3" />
                    </button>
                    <span className="px-3 py-1 font-semibold text-sm">{item.quantity}</span>
                    <button
                      disabled={loading}
                      onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                      className="px-2 py-1 hover:bg-muted transition-colors disabled:opacity-50"
                    >
                      <Plus className="size-3" />
                    </button>
                  </div>
                  <button
                    className="text-destructive hover:bg-destructive/10 p-1 rounded transition-colors disabled:opacity-50"
                    disabled={loading}
                    onClick={() => removeItem(item.product_id)}
                  >
                    <X className="size-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <SheetFooter className="border-t pt-4 flex-col gap-2">
            <div className="flex justify-between font-bold text-lg w-full">
              <span>Total</span>
              <span>৳{total}</span>
            </div>
            <Button className="w-full" size="lg" onClick={() => { closeCart(); router.push("/checkout"); }}>
              Checkout
            </Button>
            <Button variant="outline" className="w-full" disabled={loading} onClick={emptyCart}>
              Clear Cart
            </Button>
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  );
}
