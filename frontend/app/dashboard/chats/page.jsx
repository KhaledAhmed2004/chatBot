"use client";

import { useState } from "react";
import { Settings, SlidersHorizontal, User, Search, MessageCircle, Monitor } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Zap } from "lucide-react";

export default function ChatsInboxPage() {
  const [filter, setFilter] = useState("open");

  return (
    <div className="flex h-[calc(100vh-3.5rem)] overflow-hidden">
      {/* Left panel - Conversation list */}
      <div className="w-[380px] shrink-0 border-r bg-card flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 pb-3">
          <h1 className="text-lg font-semibold">Inbox</h1>
          <button className="rounded-md p-1.5 text-muted-foreground hover:bg-accent transition-colors">
            <Settings className="size-5" />
          </button>
        </div>

        {/* Filter bar */}
        <div className="flex items-center gap-2 px-4 pb-3">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="h-8 rounded-md border bg-card px-2.5 text-sm font-medium"
          >
            <option value="open">Open</option>
            <option value="closed">Closed</option>
            <option value="all">All</option>
          </select>
          <div className="ml-auto flex items-center gap-1">
            <button className="rounded-md p-1.5 text-muted-foreground hover:bg-accent transition-colors">
              <SlidersHorizontal className="size-4" />
            </button>
            <button className="rounded-md p-1.5 text-muted-foreground hover:bg-accent transition-colors">
              <User className="size-4" />
            </button>
            <button className="rounded-md p-1.5 text-muted-foreground hover:bg-accent transition-colors">
              <Search className="size-4" />
            </button>
          </div>
        </div>

        {/* Empty state */}
        <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
          No conversations found
        </div>
      </div>

      {/* Right panel - Empty / CTA */}
      <div className="flex flex-1 flex-col items-center justify-center gap-6 bg-background p-8">
        {/* Illustration */}
        <div className="rounded-2xl bg-blue-50 px-16 py-10">
          <div className="flex items-center gap-4">
            <div className="flex size-16 items-center justify-center rounded-full bg-white shadow-sm">
              <MessageCircle className="size-8 text-emerald-500" />
            </div>
            <div className="border-t-2 border-dashed border-gray-300 w-12" />
            <div className="flex size-16 items-center justify-center rounded-full bg-gray-900">
              <Monitor className="size-8 text-white" />
            </div>
          </div>
        </div>

        {/* Text */}
        <div className="text-center max-w-md">
          <h2 className="text-xl font-bold mb-2">Manage All Messages in One Inbox</h2>
          <p className="text-muted-foreground text-sm">
            Connect WhatsApp and other platforms to handle inquiries quickly and efficiently.
          </p>
        </div>

        {/* Upgrade CTA */}
        <div className="flex items-center gap-3 rounded-full border bg-blue-50 py-2 pl-4 pr-2">
          <Zap className="size-4 text-blue-600" />
          <span className="text-sm font-semibold text-blue-600">Upgrade to Business</span>
          <Button size="sm" variant="outline" className="rounded-full bg-white text-sm h-7">
            Upgrade
          </Button>
        </div>
      </div>
    </div>
  );
}
