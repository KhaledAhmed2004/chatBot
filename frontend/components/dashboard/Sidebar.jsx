"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import {
  LayoutDashboard,
  Package,
  Tags,
  Users,
  BarChart3,
  Settings,
  CreditCard,
  Globe,
  MessageCircle,
  Instagram,
  Search,
  Store,
  ChevronRight,
  Megaphone,
} from "lucide-react";

// Direct nav links (no submenu)
const directItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/customers", label: "Customers", icon: Users },
  { href: "/dashboard/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

// Collapsible nav groups
const collapsibleItems = [
  {
    label: "Orders",
    icon: Package,
    basePath: "/dashboard/orders",
    subItems: [
      { href: "/dashboard/orders", label: "All Orders" },
      { href: "/dashboard/orders?status=pending", label: "Pending" },
      { href: "/dashboard/orders?status=delivered", label: "Completed" },
    ],
  },
  {
    label: "Products",
    icon: Tags,
    basePath: "/dashboard/products",
    subItems: [
      { href: "/dashboard/products", label: "All" },
      { href: "/dashboard/products/category", label: "Category" },
      { href: "/dashboard/products/discounts", label: "Discounts" },
    ],
  },
];

// Sales channels
const salesChannels = [
  { label: "Website (Design)", icon: Globe, hasChevron: true },
  { label: "WhatsApp", icon: MessageCircle },
  { label: "Instagram", icon: Instagram, badge: "NEW" },
  { label: "Google", icon: Search, badge: "NEW" },
  { label: "Point of Sale", icon: Store, badge: "NEW" },
];

export default function AppSidebar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { store } = useAuth();

  const isActive = (href) =>
    pathname === href ||
    (href !== "/dashboard" && pathname.startsWith(href.split("?")[0]));

  const isGroupActive = (basePath) =>
    pathname === basePath || pathname.startsWith(basePath);

  const isSubActive = (href) => {
    const [path, query] = href.split("?");
    if (pathname !== path) return false;
    if (!query) return !searchParams.get("status");
    const params = new URLSearchParams(query);
    return params.get("status") === searchParams.get("status");
  };

  return (
    <Sidebar>
      {/* Store info header */}
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-3">
          <Avatar className="size-10">
            <AvatarFallback className="bg-emerald-500 text-white font-semibold">
              {store?.name?.[0] || "S"}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-semibold">
              {store?.name || "My Store"}
            </div>
            <div className="truncate text-xs text-muted-foreground">
              {store?.slug ? `shopbot.store/${store.slug}` : "setup required"}
            </div>
          </div>
          <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
        </div>
      </SidebarHeader>

      {/* Main Navigation */}
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {/* Dashboard - direct link */}
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === "/dashboard"}
                  tooltip="Dashboard"
                >
                  <Link href="/dashboard">
                    <LayoutDashboard />
                    <span>Dashboard</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {/* Collapsible groups: Orders, Products */}
              {collapsibleItems.map((group) => (
                <Collapsible
                  key={group.label}
                  asChild
                  defaultOpen={isGroupActive(group.basePath)}
                  className="group/collapsible"
                >
                  <SidebarMenuItem>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton
                        tooltip={group.label}
                        isActive={isGroupActive(group.basePath)}
                      >
                        <group.icon />
                        <span>{group.label}</span>
                        <ChevronRight className="ml-auto size-4 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {group.subItems.map((sub) => (
                          <SidebarMenuSubItem key={sub.href}>
                            <SidebarMenuSubButton
                              asChild
                              isActive={isSubActive(sub.href)}
                            >
                              <Link href={sub.href}>
                                <span>{sub.label}</span>
                              </Link>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        ))}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </SidebarMenuItem>
                </Collapsible>
              ))}

              {/* Customers - direct */}
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={isActive("/dashboard/customers")}
                  tooltip="Customers"
                >
                  <Link href="/dashboard/customers">
                    <Users />
                    <span>Customers</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {/* Chats - collapsible */}
              <Collapsible
                asChild
                defaultOpen={isGroupActive("/dashboard/chats")}
                className="group/collapsible"
              >
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton
                      tooltip="Chats"
                      isActive={isGroupActive("/dashboard/chats")}
                    >
                      <MessageCircle />
                      <span>Chats</span>
                      <ChevronRight className="ml-auto size-4 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton
                          asChild
                          isActive={isSubActive("/dashboard/chats")}
                        >
                          <Link href="/dashboard/chats">
                            <span>Inbox</span>
                          </Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton
                          asChild
                          isActive={isSubActive("/dashboard/chats/broadcasts")}
                        >
                          <Link href="/dashboard/chats/broadcasts">
                            <span>Broadcasts</span>
                          </Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton
                          asChild
                          isActive={isSubActive("/dashboard/chats/chatbot")}
                        >
                          <Link href="/dashboard/chats/chatbot">
                            <span>Chatbot</span>
                          </Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>

              {/* Analytics - direct */}
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={isActive("/dashboard/analytics")}
                  tooltip="Analytics"
                >
                  <Link href="/dashboard/analytics">
                    <BarChart3 />
                    <span>Analytics</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {/* Marketing - direct */}
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={isActive("/dashboard/marketing")}
                  tooltip="Marketing"
                >
                  <Link href="/dashboard/marketing">
                    <Megaphone />
                    <span>Marketing</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {/* Settings - direct */}
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={isActive("/dashboard/settings")}
                  tooltip="Settings"
                >
                  <Link href="/dashboard/settings">
                    <Settings />
                    <span>Settings</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Sales Channels */}
      <SidebarFooter>
        <SidebarSeparator />
        <SidebarGroup>
          <SidebarGroupLabel>Sales Channels</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {salesChannels.map((channel) => (
                <SidebarMenuItem key={channel.label}>
                  <SidebarMenuButton disabled>
                    <channel.icon />
                    <span className="flex-1">{channel.label}</span>
                    {channel.badge && (
                      <Badge className="ml-auto h-5 bg-emerald-500 px-1.5 text-[10px] font-semibold text-white hover:bg-emerald-500">
                        {channel.badge}
                      </Badge>
                    )}
                    {channel.hasChevron && !channel.badge && (
                      <ChevronRight className="ml-auto size-4" />
                    )}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        <SidebarMenu className="px-2 py-1">
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={isActive("/dashboard/plan")}
              tooltip="Plan"
            >
              <Link href="/dashboard/plan">
                <CreditCard />
                <span>Plan</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>

        <div className="flex items-center gap-2 p-3 text-xs text-muted-foreground">
          <Globe className="size-3.5" />
          <span>English</span>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
