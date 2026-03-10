"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import * as dashboardApi from "../../../lib/dashboardApi";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, ChevronLeft, ChevronRight, ArrowUpDown, MoreHorizontal, Package, Eye, Plus } from "lucide-react";

const statusFilters = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "confirmed", label: "Confirmed" },
  { value: "delivered", label: "Delivered" },
  { value: "cancelled", label: "Cancelled" },
];

const statusStyles = {
  pending: "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-50",
  confirmed: "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-50",
  delivered: "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-50",
  cancelled: "bg-red-50 text-red-700 border-red-200 hover:bg-red-50",
};

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [totalPages, setTotalPages] = useState(1);
  const [status, setStatus] = useState("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);


  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit };
      if (status !== "all") params.status = status;
      if (search) params.search = search;
      const data = await dashboardApi.getOrders(params);
      setOrders(data.orders);
      setTotal(data.total);
      setTotalPages(data.totalPages);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  }, [page, limit, status, search]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const handleStatusChange = async (orderId, newStatus) => {
    setUpdating(true);
    try {
      await dashboardApi.updateOrderStatus(orderId, newStatus);
      fetchOrders();
      if (selectedOrder?.id === orderId) {
        setSelectedOrder((prev) => ({ ...prev, status: newStatus }));
      }
    } catch (err) {
      alert(err.message);
    }
    setUpdating(false);
  };

  const toggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const toggleAll = () => {
    if (selectedIds.length === orders.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(orders.map((o) => o.id));
    }
  };


  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Orders</h1>
        <Button asChild>
          <Link href="/dashboard/orders/new">
            <Plus className="size-4" />
            Create order
          </Link>
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search by customer, product, order number or phone"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="pl-9"
        />
      </div>

      {/* Status Filter - text tabs like TakeApp */}
      <div className="flex items-center gap-1 border-b">
        {statusFilters.map((f) => (
          <button
            key={f.value}
            onClick={() => { setStatus(f.value); setPage(1); setSelectedIds([]); }}
            className={cn(
              "relative px-3 py-2 text-sm font-medium transition-colors",
              status === f.value
                ? "text-primary after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-primary"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Table */}
      {loading ? (
        <div className="space-y-2">
          <Skeleton className="h-10 w-full" />
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30 hover:bg-muted/30">
                <TableHead className="w-10">
                  <Checkbox
                    checked={orders.length > 0 && selectedIds.length === orders.length}
                    onCheckedChange={toggleAll}
                  />
                </TableHead>
                <TableHead>
                  <div className="flex items-center gap-1">
                    Order <ArrowUpDown className="size-3 text-muted-foreground" />
                  </div>
                </TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>
                  <div className="flex items-center gap-1">
                    Total <ArrowUpDown className="size-3 text-muted-foreground" />
                  </div>
                </TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.length > 0 ? (
                orders.map((order) => (
                  <TableRow
                    key={order.id}
                    className={cn(
                      "cursor-pointer",
                      selectedIds.includes(order.id) && "bg-muted/50"
                    )}
                    onClick={() => setSelectedOrder(order)}
                  >
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        checked={selectedIds.includes(order.id)}
                        onCheckedChange={() => toggleSelect(order.id)}
                      />
                    </TableCell>
                    <TableCell className="font-mono text-xs font-medium">
                      #{order.id}
                    </TableCell>
                    <TableCell>{order.user_name || order.user_id}</TableCell>
                    <TableCell className="font-medium">
                      ৳{order.total?.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={cn(
                          "capitalize text-xs",
                          statusStyles[order.status] || "bg-gray-50 text-gray-700 border-gray-200"
                        )}
                      >
                        {order.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {order.items?.length || 0}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(order.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon-xs">
                            <MoreHorizontal className="size-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setSelectedOrder(order)}>
                            <Eye className="mr-2 size-4" />
                            View details
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {statusFilters
                            .filter((sf) => sf.value !== "all" && sf.value !== order.status)
                            .map((sf) => (
                              <DropdownMenuItem
                                key={sf.value}
                                onClick={() => handleStatusChange(order.id, sf.value)}
                                disabled={updating}
                              >
                                Mark as {sf.label}
                              </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="h-48">
                    <div className="flex flex-col items-center justify-center text-center">
                      <div className="flex size-12 items-center justify-center rounded-full bg-muted mb-3">
                        <Package className="size-6 text-muted-foreground" />
                      </div>
                      <h3 className="text-base font-semibold">No orders</h3>
                      <p className="mt-1 max-w-[280px] text-sm text-muted-foreground">
                        Orders will appear here when customers start ordering from your store
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          {/* Bottom toolbar */}
          <div className="flex items-center justify-between border-t px-4 py-2">
            <div className="text-sm text-muted-foreground">
              Total <span className="font-medium text-foreground">{total}</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Select
                  value={String(limit)}
                  onValueChange={(val) => { setLimit(Number(val)); setPage(1); }}
                >
                  <SelectTrigger className="h-8 w-[70px]" size="sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[10, 20, 50, 100].map((n) => (
                      <SelectItem key={n} value={String(n)}>{n}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon-xs"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  <ChevronLeft className="size-4" />
                </Button>
                <span className="min-w-[80px] text-center text-sm text-muted-foreground">
                  {page} / {totalPages || 1}
                </span>
                <Button
                  variant="ghost"
                  size="icon-xs"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages || totalPages === 0}
                >
                  <ChevronRight className="size-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Order Detail Dialog */}
      <Dialog
        open={!!selectedOrder}
        onOpenChange={(open) => { if (!open) setSelectedOrder(null); }}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              Order #{selectedOrder?.id}
              {selectedOrder && (
                <Badge
                  variant="outline"
                  className={cn(
                    "capitalize text-xs",
                    statusStyles[selectedOrder.status] || "bg-gray-50 text-gray-700 border-gray-200"
                  )}
                >
                  {selectedOrder.status}
                </Badge>
              )}
            </DialogTitle>
            <DialogDescription>
              {selectedOrder && new Date(selectedOrder.created_at).toLocaleString()}
            </DialogDescription>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-4">
              {/* Customer info */}
              <div className="rounded-lg border p-3">
                <p className="text-xs font-medium text-muted-foreground mb-1">Customer</p>
                <p className="text-sm font-medium">{selectedOrder.user_name || "N/A"}</p>
                <p className="text-sm text-muted-foreground">{selectedOrder.user_id}</p>
              </div>

              {/* Items */}
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-2">Items</p>
                <div className="rounded-lg border divide-y">
                  {selectedOrder.items?.map((item, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between px-3 py-2.5 text-sm"
                    >
                      <span>
                        {item.name || item.productName}
                        <span className="text-muted-foreground"> x{item.quantity}</span>
                      </span>
                      <span className="font-medium">
                        ৳{((item.price || 0) * (item.quantity || 1)).toLocaleString()}
                      </span>
                    </div>
                  ))}
                  <div className="flex items-center justify-between px-3 py-2.5 bg-muted/30">
                    <span className="text-sm font-semibold">Total</span>
                    <span className="text-sm font-semibold">৳{selectedOrder.total?.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Update Status */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Update Status</span>
                <Select
                  value={selectedOrder.status}
                  onValueChange={(val) => handleStatusChange(selectedOrder.id, val)}
                  disabled={updating}
                >
                  <SelectTrigger className="w-[140px]" size="sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {statusFilters
                      .filter((sf) => sf.value !== "all")
                      .map((sf) => (
                        <SelectItem key={sf.value} value={sf.value}>
                          {sf.label}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

    </div>
  );
}
