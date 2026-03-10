"use client";

import { useState, useEffect } from "react";
import * as dashboardApi from "../../../../lib/dashboardApi";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";

export default function CategoryPage() {
  const [tab, setTab] = useState("visible");
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true);
      try {
        const data = await dashboardApi.getProducts();
        // Extract unique categories with product counts
        const catMap = {};
        data.products.forEach((p) => {
          const cat = p.category || "Products";
          catMap[cat] = (catMap[cat] || 0) + 1;
        });
        setCategories(
          Object.entries(catMap).map(([name, count]) => ({
            name,
            count,
            visible: true,
          }))
        );
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    };
    fetchCategories();
  }, []);

  const filteredCategories = categories.filter((c) =>
    tab === "visible" ? c.visible : !c.visible
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Category</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">Change sequence</Button>
          <Button size="sm">Create category</Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-6 border-b">
        <button
          onClick={() => setTab("visible")}
          className={`pb-2.5 text-sm font-medium transition-colors ${
            tab === "visible"
              ? "border-b-2 border-foreground text-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Visible
        </button>
        <button
          onClick={() => setTab("hidden")}
          className={`pb-2.5 text-sm font-medium transition-colors ${
            tab === "hidden"
              ? "border-b-2 border-foreground text-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Hidden
        </button>
      </div>

      {/* Category list */}
      <div className="rounded-xl border bg-card">
        {/* Table header */}
        <div className="flex items-center gap-3 border-b px-4 py-3">
          <Checkbox />
          <span className="text-sm font-medium text-muted-foreground">Category</span>
        </div>

        {loading ? (
          <div className="space-y-3 p-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : filteredCategories.length > 0 ? (
          filteredCategories.map((cat) => (
            <div
              key={cat.name}
              className="flex items-center justify-between border-b last:border-b-0 px-4 py-3"
            >
              <div className="flex items-center gap-3">
                <Checkbox />
                <span className="text-sm font-medium">{cat.name}</span>
                <span className="text-xs text-muted-foreground">({cat.count})</span>
              </div>
              <Badge className="bg-transparent border-emerald-500 text-emerald-500 font-semibold hover:bg-transparent">
                VISIBLE
              </Badge>
            </div>
          ))
        ) : (
          <div className="py-12 text-center text-sm text-muted-foreground">
            No {tab} categories found
          </div>
        )}
      </div>
    </div>
  );
}
