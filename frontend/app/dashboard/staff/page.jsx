"use client";

import { useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, Zap, UserPlus, Users } from "lucide-react";

export default function StaffPage() {
  const { owner, store } = useAuth();
  const [activeTab, setActiveTab] = useState("staffs");

  const ownerPhone = store?.phone || "";
  const ownerEmail = owner?.email || "";
  const ownerName = owner?.name || "Owner";
  const storeName = store?.slug || store?.name || "store";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Staff</h1>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="gap-1">
              Add
              <ChevronDown className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>
              <UserPlus className="mr-2 size-4" />
              Add staff
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Users className="mr-2 size-4" />
              Add partner
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Tabs */}
      <div className="border-b">
        <div className="flex gap-6">
          <button
            onClick={() => setActiveTab("staffs")}
            className={`relative pb-3 text-sm font-medium transition-colors ${
              activeTab === "staffs"
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Staffs
            {activeTab === "staffs" && (
              <span className="absolute inset-x-0 bottom-0 h-0.5 bg-primary" />
            )}
          </button>
          <button
            onClick={() => setActiveTab("partners")}
            className={`relative pb-3 text-sm font-medium transition-colors ${
              activeTab === "partners"
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Partners ({storeName})
            {activeTab === "partners" && (
              <span className="absolute inset-x-0 bottom-0 h-0.5 bg-primary" />
            )}
          </button>
        </div>
      </div>

      {activeTab === "staffs" && (
        <div className="space-y-4">
          {/* Upgrade Banner */}
          <div className="flex items-center justify-between rounded-lg bg-blue-50 px-5 py-3.5">
            <div className="flex items-center gap-2 text-sm font-medium text-blue-700">
              <Zap className="size-4" />
              Upgrade to Business
            </div>
            <Button variant="outline" size="sm" className="bg-white">
              Upgrade
            </Button>
          </div>

          {/* Staff List */}
          <Card>
            <CardContent className="p-0">
              <div className="px-5 py-3 text-sm font-medium text-muted-foreground">
                Staff
              </div>
              <div className="flex items-center gap-6 border-t px-5 py-4">
                <span className="text-sm font-semibold">{ownerName}</span>
                <span className="text-sm text-muted-foreground">
                  {ownerEmail}
                </span>
                {ownerPhone && (
                  <span className="text-sm text-muted-foreground">
                    {ownerPhone}
                  </span>
                )}
                <Badge
                  variant="outline"
                  className="ml-auto text-xs font-semibold"
                >
                  OWNER
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === "partners" && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Users className="mb-3 size-10 text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground">No partners yet</p>
        </div>
      )}
    </div>
  );
}
