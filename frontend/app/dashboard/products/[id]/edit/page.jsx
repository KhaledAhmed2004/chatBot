"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import * as dashboardApi from "../../../../../lib/dashboardApi";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle } from "lucide-react";

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const [form, setForm] = useState({
    name: "",
    name_bn: "",
    price: "",
    category: "",
    description: "",
    image: "",
    stock: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    // Fetch all products and find the one we need
    dashboardApi.getProducts().then((data) => {
      const product = data.products.find((p) => p.id === parseInt(params.id));
      if (product) {
        setForm({
          name: product.name || "",
          name_bn: product.name_bn || "",
          price: String(product.price || ""),
          category: product.category || "",
          description: product.description || "",
          image: product.image || "",
          stock: String(product.stock || 0),
        });
      }
      setFetching(false);
    }).catch(() => setFetching(false));
  }, [params.id]);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await dashboardApi.updateProduct(params.id, {
        ...form,
        price: parseInt(form.price),
        stock: parseInt(form.stock) || 0,
      });
      router.push("/dashboard/products");
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  if (fetching) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Card className="max-w-3xl">
          <CardHeader>
            <Skeleton className="h-6 w-36" />
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ))}
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-24 w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Edit Product</h1>
      </div>

      <Card className="max-w-3xl">
        <CardHeader>
          <CardTitle>Product Details</CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="size-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Product Name *</Label>
                <Input
                  id="name"
                  type="text"
                  value={form.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="name_bn">Bengali Name</Label>
                <Input
                  id="name_bn"
                  type="text"
                  value={form.name_bn}
                  onChange={(e) => handleChange("name_bn", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="price">Price (৳) *</Label>
                <Input
                  id="price"
                  type="number"
                  value={form.price}
                  onChange={(e) => handleChange("price", e.target.value)}
                  required
                  min="1"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="stock">Stock</Label>
                <Input
                  id="stock"
                  type="number"
                  value={form.stock}
                  onChange={(e) => handleChange("stock", e.target.value)}
                  min="0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  type="text"
                  value={form.category}
                  onChange={(e) => handleChange("category", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="image">Image URL</Label>
                <Input
                  id="image"
                  type="url"
                  value={form.image}
                  onChange={(e) => handleChange("image", e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={form.description}
                onChange={(e) => handleChange("description", e.target.value)}
                rows={4}
              />
            </div>

            {form.image && (
              <div className="overflow-hidden rounded-md border bg-muted">
                <img
                  src={form.image}
                  alt="Preview"
                  className="mx-auto max-h-48 object-contain p-2"
                  onError={(e) => (e.target.style.display = "none")}
                />
              </div>
            )}

            <div className="flex items-center justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => router.back()}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
