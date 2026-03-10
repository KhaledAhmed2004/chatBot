"use client";

import { useState, useEffect, useCallback } from "react";
import * as dashboardApi from "../../../lib/dashboardApi";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import {
  Search,
  Upload,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  ArrowUpDown,
  Users,
} from "lucide-react";

export default function CustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [limit, setLimit] = useState(50);
  const [activeTab, setActiveTab] = useState("all");
  const [selectedIds, setSelectedIds] = useState([]);

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit };
      if (search) params.search = search;
      const data = await dashboardApi.getCustomers(params);
      setCustomers(data.customers);
      setTotal(data.total);
      setTotalPages(data.totalPages);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  }, [page, search, limit]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const tabs = [
    { id: "all", label: "All" },
    { id: "inactive", label: "Inactive" },
    { id: "first-order", label: "First order" },
    { id: "never-ordered", label: "Never-ordered" },
  ];

  const allSelected =
    customers.length > 0 && selectedIds.length === customers.length;

  const toggleAll = () => {
    if (allSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(customers.map((c) => c.phone));
    }
  };

  const toggleOne = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Customers</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            Import
          </Button>
          <Button variant="outline" size="sm">
            Bulk edit
          </Button>
          <Button size="sm">Add customer</Button>
        </div>
      </div>

      {/* Main Card */}
      <Card>
        <CardContent className="p-0">
          {/* Search + Export/Broadcasts */}
          <div className="flex items-center gap-2 border-b px-4 py-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by customer name, phone, email or notes"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="pl-9 border-0 shadow-none focus-visible:ring-0"
              />
            </div>
            <Button variant="outline" size="sm" className="gap-1.5">
              <Upload className="size-3.5" />
              Export
            </Button>
            <Button variant="outline" size="sm" className="gap-1.5">
              <svg
                className="size-3.5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
              Broadcasts
            </Button>
          </div>

          {/* Filter Tabs + Sort */}
          <div className="flex items-center justify-between border-b px-4">
            <div className="flex gap-4">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative py-2.5 text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? "text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {tab.label}
                  {activeTab === tab.id && (
                    <span className="absolute inset-x-0 bottom-0 h-0.5 bg-foreground rounded-full" />
                  )}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" className="size-8">
                <SlidersHorizontal className="size-4" />
              </Button>
              <Button variant="ghost" size="icon" className="size-8">
                <ArrowUpDown className="size-4" />
              </Button>
            </div>
          </div>

          {/* Table Header with Checkbox */}
          <div className="flex items-center gap-3 border-b px-4 py-2.5">
            <Checkbox
              checked={allSelected}
              onCheckedChange={toggleAll}
            />
            <span className="text-sm font-medium">Customers</span>
          </div>

          {/* Content */}
          {loading ? (
            <div className="space-y-1 p-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : customers.length > 0 ? (
            <div>
              <Table>
                <TableHeader className="sr-only">
                  <TableRow>
                    <TableHead />
                    <TableHead>Name</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Orders</TableHead>
                    <TableHead>Total Spent</TableHead>
                    <TableHead>First Order</TableHead>
                    <TableHead>Last Order</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {customers.map((c) => (
                    <TableRow key={c.phone} className="hover:bg-muted/50">
                      <TableCell className="w-10 pl-4">
                        <Checkbox
                          checked={selectedIds.includes(c.phone)}
                          onCheckedChange={() => toggleOne(c.phone)}
                        />
                      </TableCell>
                      <TableCell className="font-medium">
                        {c.name || "Unknown"}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {c.phone}
                      </TableCell>
                      <TableCell>{c.total_orders} orders</TableCell>
                      <TableCell className="font-semibold">
                        ৳{(c.total_spent || 0).toLocaleString()}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(c.first_order).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(c.last_order).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20">
              <Users className="mb-3 size-10 text-muted-foreground/30" />
              <p className="text-sm text-muted-foreground">
                No customers found
              </p>
            </div>
          )}

          {/* Bottom Toolbar */}
          <div className="flex items-center justify-between border-t px-4 py-2.5">
            <p className="text-sm">
              <span className="font-medium text-primary">Total</span>{" "}
              <span className="text-muted-foreground">{total}</span>
            </p>
            <div className="flex items-center gap-3">
              <Select
                value={String(limit)}
                onValueChange={(v) => {
                  setLimit(Number(v));
                  setPage(1);
                }}
              >
                <SelectTrigger className="h-8 w-[70px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex">
                <Button
                  variant="outline"
                  size="icon"
                  className="size-8 rounded-r-none"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  <ChevronLeft className="size-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="size-8 rounded-l-none border-l-0"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  <ChevronRight className="size-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
