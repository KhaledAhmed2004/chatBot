"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Zap, ExternalLink } from "lucide-react";

export default function BroadcastsPage() {
  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Broadcasts</h1>
        <p className="text-sm text-muted-foreground">
          Send broadcast messages to your customers
        </p>
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

      {/* Main content card */}
      <div className="grid grid-cols-1 gap-0 overflow-hidden rounded-xl border bg-card lg:grid-cols-2">
        {/* Left - Preview */}
        <div className="flex flex-col items-center justify-center gap-5 bg-gray-50 p-8">
          {/* Message preview card */}
          <div className="w-full max-w-xs rounded-xl border bg-white p-5 shadow-sm">
            <p className="text-sm leading-relaxed">
              New arrivals are here! 🎉<br />
              Use code <span className="font-bold">NEW30</span> for 30% off.<br />
              Shop now! 🛍️👇
            </p>
            <div className="mt-3 border-t pt-3">
              <a className="flex items-center justify-center gap-1.5 text-sm font-medium text-blue-600">
                <ExternalLink className="size-3.5" />
                Shop now
              </a>
            </div>
          </div>

          {/* Send button */}
          <Button className="bg-gray-900 text-white hover:bg-gray-800 rounded-lg px-6">
            Send 232 messages
          </Button>

          {/* Staff badge */}
          <Badge className="bg-emerald-500 text-white hover:bg-emerald-500 text-xs px-2.5">
            Staff
          </Badge>
        </div>

        {/* Right - Info */}
        <div className="flex flex-col justify-center gap-3 p-8">
          <h2 className="text-lg font-bold">Send Broadcast Message</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Reach all your customers at once — perfect for promos, new items, or restocks.
          </p>
          <a href="#" className="text-sm font-medium text-blue-600 hover:underline w-fit">
            Learn more
          </a>
          <Button className="mt-2 w-fit bg-gray-900 text-white hover:bg-gray-800">
            Subscribe
          </Button>
        </div>
      </div>
    </div>
  );
}
