"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { fetchProduct } from "../../../lib/api";
import { useCart } from "../../../context/CartContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Minus, Plus } from "lucide-react";

export default function ProductPage() {
  const { id } = useParams();
  const { addToCart, loading: cartLoading } = useCart();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProduct(id)
      .then(setProduct)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-[1000px] mx-auto p-6 space-y-6">
        <Skeleton className="h-4 w-32" />
        <div className="flex flex-col md:flex-row gap-10">
          <Skeleton className="flex-1 h-[400px] rounded-xl" />
          <div className="flex-1 space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-20 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20 space-y-4">
        <p className="text-muted-foreground">{error}</p>
        <Button asChild variant="outline">
          <Link href="/store">Back to Store</Link>
        </Button>
      </div>
    );
  }

  if (!product) return null;

  const inStock = product.stock > 0;
  const maxQty = Math.min(product.stock, 10);

  return (
    <div className="max-w-[1000px] mx-auto p-6">
      <Link href="/store" className="inline-flex items-center gap-1.5 text-muted-foreground text-sm hover:text-primary transition-colors mb-6">
        <ArrowLeft className="size-4" />
        Back to Store
      </Link>

      <div className="flex flex-col md:flex-row gap-10">
        {/* Image */}
        <div className="flex-1 rounded-xl overflow-hidden bg-muted">
          <img src={product.image} alt={product.name} className="w-full h-[400px] object-cover" />
        </div>

        {/* Info */}
        <div className="flex-1 space-y-4">
          <div>
            <h1 className="text-2xl font-extrabold">{product.name}</h1>
            <p className="text-muted-foreground">{product.name_bn}</p>
          </div>

          <Badge variant="secondary">{product.category}</Badge>

          <p className="text-3xl font-extrabold text-primary">৳{product.price}</p>

          <p className="text-muted-foreground leading-relaxed">{product.description}</p>

          <p className={`font-semibold ${inStock ? "text-emerald-600" : "text-destructive"}`}>
            {inStock ? `${product.stock} in stock` : "Out of stock"}
          </p>

          {inStock && (
            <div className="flex items-center gap-3 pt-2">
              <div className="inline-flex items-center border-2 rounded-lg overflow-hidden">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3 py-2.5 hover:bg-muted transition-colors"
                >
                  <Minus className="size-4" />
                </button>
                <span className="px-5 py-2.5 font-bold text-lg">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(maxQty, quantity + 1))}
                  className="px-3 py-2.5 hover:bg-muted transition-colors"
                >
                  <Plus className="size-4" />
                </button>
              </div>
              <Button
                size="lg"
                disabled={cartLoading}
                onClick={() => addToCart(product.id, quantity)}
              >
                Add to Cart - ৳{product.price * quantity}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
