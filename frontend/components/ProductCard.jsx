"use client";

import Link from "next/link";
import { useCart } from "../context/CartContext";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";

export default function ProductCard({ product }) {
  const { addToCart, loading } = useCart();
  const inStock = product.stock > 0;

  return (
    <div className="group rounded-xl border bg-card overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1">
      <Link href={`/product/${product.id}`}>
        <div className="relative w-full h-48 bg-muted overflow-hidden">
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            className="w-full h-full object-cover transition-transform group-hover:scale-105"
          />
          {!inStock && (
            <Badge variant="destructive" className="absolute top-2 left-2">
              Out of Stock
            </Badge>
          )}
        </div>
      </Link>

      <div className="p-4 space-y-2">
        <Link href={`/product/${product.id}`} className="font-bold text-sm hover:text-primary transition-colors line-clamp-1">
          {product.name}
        </Link>
        <p className="text-muted-foreground text-xs">{product.name_bn}</p>
        <div className="flex items-center justify-between pt-1">
          <span className="font-extrabold text-primary text-lg">৳{product.price}</span>
          <Button
            size="sm"
            disabled={!inStock || loading}
            onClick={(e) => { e.preventDefault(); addToCart(product.id); }}
          >
            {inStock ? "Add to Cart" : "Sold Out"}
          </Button>
        </div>
      </div>
    </div>
  );
}
