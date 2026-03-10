"use client";

import { useState, useEffect } from "react";
import { fetchProducts } from "../../lib/api";
import ProductCard from "../../components/ProductCard";
import CategoryFilter from "../../components/CategoryFilter";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

export default function StorePage() {
  const [products, setProducts] = useState([]);
  const [category, setCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts()
      .then(setProducts)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const categories = [...new Set(products.map((p) => p.category))];

  const filtered = products.filter((p) => {
    const matchCat = category === "all" || p.category === category;
    const matchSearch =
      !search ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.name_bn.includes(search);
    return matchCat && matchSearch;
  });

  if (loading) {
    return (
      <div className="max-w-[1200px] mx-auto p-6 space-y-6">
        <div className="text-center space-y-2 py-4">
          <Skeleton className="h-8 w-64 mx-auto" />
          <Skeleton className="h-4 w-48 mx-auto" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-64 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1200px] mx-auto p-6">
      {/* Hero */}
      <div className="text-center mb-8">
        <h1 className="text-2xl font-extrabold">Welcome to ShopBot</h1>
        <p className="text-muted-foreground">Browse products, order via WhatsApp</p>
      </div>

      {/* Search */}
      <div className="max-w-md mx-auto mb-6">
        <Input
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Category filter */}
      <CategoryFilter categories={categories} active={category} onSelect={setCategory} />

      {/* Product grid */}
      {filtered.length === 0 ? (
        <p className="text-center text-muted-foreground py-16">No products found.</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
