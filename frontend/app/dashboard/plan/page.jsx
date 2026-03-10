"use client";

import { useAuth } from "../../../context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CreditCard, Zap, Wallet, CircleDot } from "lucide-react";

const planLimits = [
  { label: "Stores", used: 1, max: 1 },
  { label: "Staff", used: 1, max: 1 },
];

const quotaItems = [
  { label: "Orders", used: 0, max: 50, ok: true },
  { label: "Images", used: 1, max: 20, ok: true },
  { label: "Automated WhatsApp", upgrade: true },
  { label: "Email", upgrade: true },
];

export default function PlanPage() {
  const { store } = useAuth();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Billing</h1>

      {/* Plan Overview */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold">Basic Plan</h2>
                <Badge variant="secondary" className="text-xs">Current</Badge>
              </div>
              <div className="mt-1 flex items-baseline gap-1.5">
                <span className="text-3xl font-bold">৳0.00</span>
                <span className="text-sm text-muted-foreground">BDT / month</span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                Store ID: {store?.id || "—"}
              </p>
            </div>
            <Button>Upgrade plan</Button>
          </div>

          <Separator className="my-5" />

          {/* Plan Limits */}
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold">Plan limits</h3>
            <button className="text-sm font-medium text-primary hover:underline">Manage</button>
          </div>
          <div className="space-y-2">
            {planLimits.map((item) => (
              <div key={item.label} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <CircleDot className="size-3 text-red-500" />
                  <span>{item.label}</span>
                </div>
                <span className="text-muted-foreground">
                  {item.used} / {item.max}
                </span>
              </div>
            ))}
          </div>

          <Separator className="my-5" />

          {/* Wallet */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold">Wallet</h3>
              <div className="mt-1 flex items-baseline gap-1">
                <span className="text-xl font-bold">৳0.00</span>
                <span className="text-xs text-muted-foreground">BDT</span>
              </div>
            </div>
            <button className="text-sm font-medium text-primary hover:underline">Balance</button>
          </div>
        </CardContent>
      </Card>

      {/* Quota + Usage Add-ons */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Quota */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-1.5 text-base">
              Quota
              <span className="flex size-4 items-center justify-center rounded-full border text-[10px] text-muted-foreground">?</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {quotaItems.map((item) => (
                <div key={item.label} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <CircleDot className={`size-3 ${item.upgrade ? "text-red-500" : "text-emerald-500"}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.upgrade ? (
                    <button className="text-xs font-medium text-primary hover:underline">Upgrade</button>
                  ) : (
                    <span className="text-muted-foreground">
                      {item.used} / {item.max}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Usage Add-ons */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-1.5 text-base">
              Usage add-ons
              <span className="flex size-4 items-center justify-center rounded-full border text-[10px] text-muted-foreground">?</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-xs text-muted-foreground">
              Enable to go beyond the free quota. Additional usage will be billed in the next invoice.
            </p>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 h-5 w-9 rounded-full bg-muted" />
                <div>
                  <p className="text-sm font-medium">Extra automated WhatsApp</p>
                  <p className="text-xs text-muted-foreground">Free for first 1,000. ৳0.50 per extra message</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="mt-0.5 h-5 w-9 rounded-full bg-muted" />
                <div>
                  <p className="text-sm font-medium">Extra email</p>
                  <p className="text-xs text-muted-foreground">Free for first 2,500. ৳0.10 per extra email</p>
                </div>
              </div>
            </div>

            <div className="mt-5 flex items-center justify-between rounded-lg bg-blue-50 p-3">
              <div className="flex items-center gap-2">
                <Zap className="size-4 text-blue-600" />
                <span className="text-sm font-semibold text-blue-700">Upgrade to Business</span>
                <button className="text-xs text-blue-600 hover:underline">Learn more</button>
              </div>
              <Button size="sm" variant="outline" className="h-7 text-xs">
                Upgrade
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
