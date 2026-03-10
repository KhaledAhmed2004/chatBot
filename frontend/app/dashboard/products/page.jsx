"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import * as dashboardApi from "../../../lib/dashboardApi";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Search,
  SlidersHorizontal,
  ArrowUpDown,
  Upload,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(50);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const data = await dashboardApi.getProducts();
      setProducts(data.products);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => { fetchProducts(); }, []);

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.category?.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Products</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">Import</Button>
          <Button variant="outline" size="sm">Bulk edit</Button>
          <Button size="sm" asChild>
            <Link href="/dashboard/products/new">Add product</Link>
          </Button>
        </div>
      </div>

      {/* Table card */}
      <div className="rounded-xl border bg-card">
        {/* Search bar */}
        <div className="flex items-center gap-2 border-b px-4 py-3">
          <Search className="size-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search by product, variant names or SKU"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="flex-1 border-0 bg-transparent p-0 shadow-none focus-visible:ring-0 text-sm"
          />
          <button className="rounded-md p-1.5 text-muted-foreground hover:bg-accent transition-colors">
            <SlidersHorizontal className="size-4" />
          </button>
          <button className="rounded-md p-1.5 text-muted-foreground hover:bg-accent transition-colors">
            <ArrowUpDown className="size-4" />
          </button>
          <button className="flex items-center gap-1.5 rounded-md px-2 py-1.5 text-sm text-muted-foreground hover:bg-accent transition-colors">
            <Upload className="size-4" />
            Export
          </button>
        </div>

        {loading ? (
          <div className="space-y-3 p-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-14 w-full" />
            ))}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10 pl-4">
                  <Checkbox />
                </TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Inventory</TableHead>
                <TableHead>Mark as soldout</TableHead>
                <TableHead>Visibility</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginated.length > 0 ? (
                paginated.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell className="pl-4">
                      <Checkbox />
                    </TableCell>
                    <TableCell>
                      <Link href={`/dashboard/products/${product.id}/edit`} className="hover:underline">
                        <div className="font-medium">{product.name}</div>
                        <div className="text-xs text-muted-foreground">{product.category || "Products"}</div>
                      </Link>
                    </TableCell>
                    <TableCell>৳{product.price?.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</TableCell>
                    <TableCell>{product.stock ?? "—"}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <button
                          className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                            product.stock === 0 ? "bg-emerald-500" : "bg-gray-300"
                          }`}
                        >
                          <span
                            className={`inline-block size-3.5 rounded-full bg-white transition-transform ${
                              product.stock === 0 ? "translate-x-4.5" : "translate-x-1"
                            }`}
                          />
                        </button>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className="bg-transparent border-emerald-500 text-emerald-500 font-semibold hover:bg-transparent">
                        VISIBLE
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-16 text-muted-foreground">
                    No products found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}

        {/* Footer - pagination */}
        {!loading && (
          <div className="flex items-center justify-between border-t px-4 py-3">
            <div className="text-sm">
              <span className="text-blue-600">Total</span>{" "}
              <span className="text-muted-foreground">{filtered.length}</span>
            </div>
            <div className="flex items-center gap-2">
              <select
                value={perPage}
                onChange={(e) => { setPerPage(Number(e.target.value)); setPage(1); }}
                className="h-8 rounded-md border bg-card px-2 text-sm"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
              <div className="flex items-center rounded-md border">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-2 py-1.5 text-muted-foreground hover:bg-accent disabled:opacity-30 transition-colors"
                >
                  <ChevronLeft className="size-4" />
                </button>
                <div className="h-5 w-px bg-border" />
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  className="px-2 py-1.5 text-muted-foreground hover:bg-accent disabled:opacity-30 transition-colors"
                >
                  <ChevronRight className="size-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
