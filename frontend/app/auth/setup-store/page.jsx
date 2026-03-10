"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../context/AuthContext";
import * as dashboardApi from "../../../lib/dashboardApi";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

export default function SetupStorePage() {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { isAuthenticated, hasStore, setStore, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) router.push("/auth/login");
    if (!authLoading && hasStore) router.push("/dashboard");
  }, [authLoading, isAuthenticated, hasStore, router]);

  const handleNameChange = (val) => {
    setName(val);
    setSlug(val.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await dashboardApi.createStore({ name, slug, description, phone });
      setStore(data.store);
      router.push("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-emerald-900 via-emerald-700 to-emerald-500 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500 text-2xl font-bold text-white">
            S
          </div>
          <CardTitle className="text-xl">Setup Your Store</CardTitle>
          <CardDescription>Tell us about your business</CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 rounded-md border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="store-name">Store Name *</Label>
              <Input id="store-name" value={name} onChange={(e) => handleNameChange(e.target.value)} placeholder="My Awesome Store" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="store-slug">Store URL *</Label>
              <div className="flex items-center gap-0">
                <span className="flex h-9 items-center rounded-l-md border border-r-0 bg-muted px-3 text-sm text-muted-foreground">
                  shopbot.com/store/
                </span>
                <Input
                  id="store-slug"
                  className="rounded-l-none"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                  placeholder="my-store"
                  required
                  minLength={3}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="store-desc">Description</Label>
              <Textarea id="store-desc" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What does your store sell?" rows={3} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="store-phone">Phone Number</Label>
              <Input id="store-phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="01XXXXXXXXX" />
            </div>
            <Button type="submit" className="w-full" size="lg" disabled={loading}>
              {loading ? "Creating store..." : "Create Store"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
