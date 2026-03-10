"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../../../context/AuthContext";
import * as dashboardApi from "../../../lib/dashboardApi";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle2, AlertCircle } from "lucide-react";

export default function SettingsPage() {
  const { store, refreshStore } = useAuth();
  const [storeForm, setStoreForm] = useState({
    name: "", description: "", phone: "", address: "", logo_url: "", banner_url: "",
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "", newPassword: "", confirmPassword: "",
  });
  const [storeMsg, setStoreMsg] = useState("");
  const [storeError, setStoreError] = useState("");
  const [pwMsg, setPwMsg] = useState("");
  const [pwError, setPwError] = useState("");
  const [saving, setSaving] = useState(false);
  const [changingPw, setChangingPw] = useState(false);

  useEffect(() => {
    if (store) {
      setStoreForm({
        name: store.name || "", description: store.description || "",
        phone: store.phone || "", address: store.address || "",
        logo_url: store.logo_url || "", banner_url: store.banner_url || "",
      });
    }
  }, [store]);

  const handleStoreSubmit = async (e) => {
    e.preventDefault();
    setStoreMsg(""); setStoreError("");
    setSaving(true);
    try {
      await dashboardApi.updateStore(storeForm);
      await refreshStore();
      setStoreMsg("Store settings saved!");
    } catch (err) { setStoreError(err.message); }
    setSaving(false);
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPwMsg(""); setPwError("");
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPwError("Passwords don't match"); return;
    }
    setChangingPw(true);
    try {
      await dashboardApi.changePassword(passwordForm.currentPassword, passwordForm.newPassword);
      setPwMsg("Password changed successfully!");
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) { setPwError(err.message); }
    setChangingPw(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
      </div>

      {/* Store Settings */}
      <Card className="max-w-3xl">
        <CardHeader>
          <CardTitle>Store Information</CardTitle>
        </CardHeader>
        <CardContent>
          {storeMsg && (
            <Alert className="mb-4">
              <CheckCircle2 className="size-4 text-emerald-600" />
              <AlertDescription>{storeMsg}</AlertDescription>
            </Alert>
          )}
          {storeError && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="size-4" />
              <AlertDescription>{storeError}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleStoreSubmit} className="space-y-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="store-name">Store Name</Label>
                <Input id="store-name" value={storeForm.name} onChange={(e) => setStoreForm((p) => ({ ...p, name: e.target.value }))} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="store-phone">Phone</Label>
                <Input id="store-phone" type="tel" value={storeForm.phone} onChange={(e) => setStoreForm((p) => ({ ...p, phone: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="store-address">Address</Label>
                <Input id="store-address" value={storeForm.address} onChange={(e) => setStoreForm((p) => ({ ...p, address: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="store-logo">Logo URL</Label>
                <Input id="store-logo" type="url" value={storeForm.logo_url} onChange={(e) => setStoreForm((p) => ({ ...p, logo_url: e.target.value }))} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="store-desc">Description</Label>
              <Textarea id="store-desc" value={storeForm.description} onChange={(e) => setStoreForm((p) => ({ ...p, description: e.target.value }))} rows={3} />
            </div>

            <Alert className="bg-muted border-muted">
              <AlertDescription>
                <strong>Store URL:</strong> /store/{store?.slug}
              </AlertDescription>
            </Alert>

            <div className="flex justify-end">
              <Button type="submit" disabled={saving}>
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Change Password */}
      <Card className="max-w-3xl">
        <CardHeader>
          <CardTitle>Change Password</CardTitle>
        </CardHeader>
        <CardContent>
          {pwMsg && (
            <Alert className="mb-4">
              <CheckCircle2 className="size-4 text-emerald-600" />
              <AlertDescription>{pwMsg}</AlertDescription>
            </Alert>
          )}
          {pwError && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="size-4" />
              <AlertDescription>{pwError}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handlePasswordSubmit} className="space-y-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="cur-pw">Current Password</Label>
                <Input id="cur-pw" type="password" value={passwordForm.currentPassword} onChange={(e) => setPasswordForm((p) => ({ ...p, currentPassword: e.target.value }))} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-pw">New Password</Label>
                <Input id="new-pw" type="password" value={passwordForm.newPassword} onChange={(e) => setPasswordForm((p) => ({ ...p, newPassword: e.target.value }))} required minLength={6} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-pw">Confirm New Password</Label>
                <Input id="confirm-pw" type="password" value={passwordForm.confirmPassword} onChange={(e) => setPasswordForm((p) => ({ ...p, confirmPassword: e.target.value }))} required minLength={6} />
              </div>
            </div>
            <div className="flex justify-end">
              <Button type="submit" disabled={changingPw}>
                {changingPw ? "Changing..." : "Change Password"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
