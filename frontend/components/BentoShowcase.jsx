"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { BentoGridShowcase } from "@/components/ui/bento-product-features";
import { Settings2, Command, Plus, MessageCircle, Bot, ShoppingCart, BarChart3, Zap } from "lucide-react";

const IntegrationCard = () => (
  <Card className="flex h-full flex-col">
    <CardHeader>
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100">
        <MessageCircle className="h-6 w-6 text-emerald-600" />
      </div>
      <CardTitle>WhatsApp Integration</CardTitle>
      <CardDescription>
        Connect your WhatsApp Business account. Get instant order notifications,
        auto-reply to customers, and manage everything from one place.
      </CardDescription>
    </CardHeader>
    <CardFooter className="mt-auto flex items-center justify-between">
      <Button variant="outline" size="sm">
        <Settings2 className="mr-2 h-4 w-4" />
        Configure
      </Button>
      <Switch
        className="data-[state=checked]:bg-emerald-500"
        aria-label="Toggle integration"
        defaultChecked
      />
    </CardFooter>
  </Card>
);

const TrackersCard = () => (
  <Card className="h-full">
    <CardContent className="flex h-full flex-col justify-between p-6">
      <div>
        <CardTitle className="text-base font-medium">Active Channels</CardTitle>
        <CardDescription>03 Connected Platforms</CardDescription>
      </div>
      <div className="flex -space-x-2 overflow-hidden">
        <div className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500 text-white ring-2 ring-background text-xs font-bold">WA</div>
        <div className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-blue-500 text-white ring-2 ring-background text-xs font-bold">WB</div>
        <div className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-purple-500 text-white ring-2 ring-background text-xs font-bold">AI</div>
      </div>
    </CardContent>
  </Card>
);

const FocusCard = () => (
  <Card className="h-full">
    <CardContent className="flex h-full flex-col justify-between p-6">
      <div className="flex items-start justify-between">
        <div>
          <CardTitle className="text-base font-medium">AI Accuracy</CardTitle>
          <CardDescription>Bot Response Quality</CardDescription>
        </div>
        <Badge variant="outline" className="border-emerald-300 text-emerald-600">
          Groq + Gemini
        </Badge>
      </div>
      <div>
        <span className="text-6xl font-bold">95%</span>
      </div>
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>Customer satisfaction</span>
        <span>This month</span>
      </div>
    </CardContent>
  </Card>
);

const StatisticCard = () => (
  <Card className="relative h-full w-full overflow-hidden">
    <div
      className="absolute inset-0 opacity-20"
      style={{
        backgroundImage: "radial-gradient(hsl(var(--foreground)) 1px, transparent 1px)",
        backgroundSize: "16px 16px",
      }}
    />
    <CardContent className="relative z-10 flex h-full items-center justify-center p-6">
      <span className="text-8xl font-bold text-foreground/90">24/7</span>
    </CardContent>
  </Card>
);

const ProductivityCard = () => (
  <Card className="h-full">
    <CardContent className="flex h-full flex-col justify-end p-6">
      <CardTitle className="text-base font-medium">Auto Replies</CardTitle>
      <CardDescription>
        AI bot answers product queries, takes orders, and tracks deliveries — all in Bangla, English, or Banglish.
      </CardDescription>
    </CardContent>
  </Card>
);

const ShortcutsCard = () => (
  <Card className="h-full">
    <CardContent className="flex h-full flex-wrap items-center justify-between gap-4 p-6">
      <div>
        <CardTitle className="text-base font-medium">Quick Commands</CardTitle>
        <CardDescription>
          Customers type simple commands to browse, add to cart, and order.
        </CardDescription>
      </div>
      <div className="flex items-center gap-2">
        <div className="flex h-8 items-center justify-center rounded-md border bg-background px-2 font-mono text-xs font-medium text-muted-foreground">
          products
        </div>
        <Plus className="h-3 w-3 text-muted-foreground" />
        <div className="flex h-8 items-center justify-center rounded-md border bg-background px-2 font-mono text-xs font-medium text-muted-foreground">
          add 1
        </div>
        <Plus className="h-3 w-3 text-muted-foreground" />
        <div className="flex h-8 items-center justify-center rounded-md border bg-background px-2 font-mono text-xs font-medium text-muted-foreground">
          order
        </div>
      </div>
    </CardContent>
  </Card>
);

export default function BentoShowcase() {
  return (
    <section className="py-16 md:py-32">
      <div className="w-full max-w-5xl mx-auto px-4 md:px-10">
        <div className="mb-8">
          <h2 className="text-center text-3xl font-bold tracking-tight md:text-4xl">
            Product Features
          </h2>
          <p className="text-center text-muted-foreground mt-3">
            Organize, automate, and grow your business
            <br />
            with our all-in-one platform
          </p>
        </div>

        <BentoGridShowcase
          integration={<IntegrationCard />}
          trackers={<TrackersCard />}
          statistic={<StatisticCard />}
          focus={<FocusCard />}
          productivity={<ProductivityCard />}
          shortcuts={<ShortcutsCard />}
        />
      </div>
    </section>
  );
}
