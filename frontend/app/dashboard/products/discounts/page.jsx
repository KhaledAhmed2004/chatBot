"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Search, SlidersHorizontal, ChevronLeft, ChevronRight, Zap } from "lucide-react";

export default function DiscountsPage() {
  const [search, setSearch] = useState("");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Discounts</h1>
        <Button variant="outline" size="sm" disabled>
          Create discount
        </Button>
      </div>

      {/* Upgrade banner */}
      <div className="flex items-center justify-between rounded-lg bg-blue-50 px-4 py-3">
        <div className="flex items-center gap-2">
          <Zap className="size-4 text-blue-600" />
          <span className="text-sm font-semibold text-blue-600">Upgrade to Business</span>
        </div>
        <Button variant="outline" size="sm" className="bg-white">
          Upgrade
        </Button>
      </div>

      {/* Discount table */}
      <div className="rounded-xl border bg-card">
        {/* Search bar */}
        <div className="flex items-center gap-2 border-b px-4 py-3">
          <Search className="size-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search by discount code, name"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 border-0 bg-transparent p-0 shadow-none focus-visible:ring-0 text-sm"
          />
          <button className="rounded-md p-1.5 text-muted-foreground hover:bg-accent transition-colors">
            <SlidersHorizontal className="size-4" />
          </button>
        </div>

        {/* Table header */}
        <div className="flex items-center gap-3 border-b px-4 py-3">
          <Checkbox checked />
          <span className="text-sm font-medium">Discounts</span>
        </div>

        {/* Empty state */}
        <div className="py-12 text-center text-sm text-muted-foreground">
          No discounts found
        </div>

        {/* Footer - pagination */}
        <div className="flex items-center justify-between border-t px-4 py-3">
          <div className="text-sm">
            <span className="text-blue-600">Total</span>{" "}
            <span className="text-muted-foreground">0</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center rounded-md border">
              <button disabled className="px-2 py-1.5 text-muted-foreground disabled:opacity-30">
                <ChevronLeft className="size-4" />
              </button>
              <div className="h-5 w-px bg-border" />
              <button disabled className="px-2 py-1.5 text-muted-foreground disabled:opacity-30">
                <ChevronRight className="size-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
