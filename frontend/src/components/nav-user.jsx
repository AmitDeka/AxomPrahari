"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  ChevronsUpDownIcon,
  SparklesIcon,
  BadgeCheckIcon,
  CreditCardIcon,
  BellIcon,
  LogOutIcon,
  SunIcon,
  MoonIcon,
  LaptopIcon,
} from "lucide-react";
import api from "@/lib/axios";
import { useState, useEffect } from "react";
import { useTheme } from "next-themes";

export function NavUser({ user }) {
  const { isMobile } = useSidebar();
  const [unreadCount, setUnreadCount] = useState(0);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const res = await api.get("/admin/notifications?limit=1");
        if (res.data?.status === "success") {
          setUnreadCount(res.data.data.unreadCount || 0);
        }
      } catch (err) {
        console.error("Error fetching unread count", err);
      }
    };

    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000); // Poll every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const handleLogout = async () => {
    try {
      await api.post("/auth/admin/logout");
    } catch (error) {
      console.error("Logout error", error);
    } finally {
      localStorage.removeItem("admin_token");
      document.cookie = "admin_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC; SameSite=Lax; Secure";
      window.location.href = "/login";
    }
  };

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground">
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback className="rounded-lg bg-muted text-muted-foreground">
                  {user.name ? user.name.substring(0, 2).toUpperCase() : "AD"}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium text-foreground">{user.name}</span>
                <span className="truncate text-xs text-muted-foreground">
                  {user.rank ? `${user.rank} - ${user.jurisdiction_district}` : user.email}
                </span>
              </div>
              {unreadCount > 0 && (
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-traffic-amber text-[10px] font-bold text-primary-foreground mr-1 animate-pulse">
                  {unreadCount}
                </span>
              )}
              <ChevronsUpDownIcon className="ml-auto size-4 opacity-50" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}>
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback className="rounded-lg bg-muted text-muted-foreground">
                    {user.name ? user.name.substring(0, 2).toUpperCase() : "AD"}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium text-foreground">{user.name}</span>
                  <span className="truncate text-xs text-muted-foreground">{user.email}</span>
                  {user.rank && (
                    <span className="truncate text-[10px] text-muted-foreground font-semibold uppercase tracking-wider mt-0.5">
                      {user.rank} ({user.jurisdiction_district})
                    </span>
                  )}
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem className="cursor-pointer" asChild>
                <a href="/admin/account">
                  <BadgeCheckIcon className="size-4 mr-2" />
                  Account
                </a>
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer" asChild>
                <a href="/admin/notifications" className="flex items-center justify-between w-full">
                  <div className="flex items-center">
                    <BellIcon className="size-4 mr-2" />
                    Notifications
                  </div>
                  {unreadCount > 0 && (
                    <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-traffic-amber px-1.5 text-[10px] font-bold text-primary-foreground">
                      {unreadCount}
                    </span>
                  )}
                </a>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuLabel className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                Theme Preference
              </DropdownMenuLabel>
              <div className="grid grid-cols-3 gap-1 px-1 py-1">
                <button
                  type="button"
                  onClick={() => setTheme("light")}
                  className={`flex flex-col items-center justify-center gap-1 rounded-md p-1.5 text-xs transition-colors cursor-pointer ${
                    theme === "light"
                      ? "bg-accent text-accent-foreground font-medium ring-1 ring-primary"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  }`}
                  title="Light mode"
                >
                  <SunIcon className="size-4 text-traffic-amber" />
                  <span>Light</span>
                </button>
                <button
                  type="button"
                  onClick={() => setTheme("dark")}
                  className={`flex flex-col items-center justify-center gap-1 rounded-md p-1.5 text-xs transition-colors cursor-pointer ${
                    theme === "dark"
                      ? "bg-accent text-accent-foreground font-medium ring-1 ring-primary"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  }`}
                  title="Dark mode"
                >
                  <MoonIcon className="size-4 text-primary" />
                  <span>Dark</span>
                </button>
                <button
                  type="button"
                  onClick={() => setTheme("system")}
                  className={`flex flex-col items-center justify-center gap-1 rounded-md p-1.5 text-xs transition-colors cursor-pointer ${
                    theme === "system"
                      ? "bg-accent text-accent-foreground font-medium ring-1 ring-primary"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  }`}
                  title="System mode"
                >
                  <LaptopIcon className="size-4 text-muted-foreground" />
                  <span>System</span>
                </button>
              </div>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={handleLogout}
              variant="destructive"
              className="cursor-pointer">
              <LogOutIcon className="size-4 mr-2" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
