"use client";

import * as React from "react";
import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
  LayoutDashboardIcon,
  MapIcon,
  FileTextIcon,
  UsersIcon,
  ShieldIcon,
  ShieldAlertIcon,
  BookOpenIcon,
} from "lucide-react";

const data = {
  user: {
    name: "Police Admin",
    email: "admin@axomprahari.gov.in",
    avatar: "",
  },
  navMain: [
    {
      title: "Overview",
      url: "#",
      icon: <LayoutDashboardIcon className="size-4" />,
      isActive: true,
      items: [
        {
          title: "Dashboard",
          url: "/admin/dashboard",
        },
        {
          title: "Live Heatmap",
          url: "/admin/heatmap",
        },
      ],
    },
    {
      title: "Reports",
      url: "#",
      icon: <FileTextIcon className="size-4" />,
      items: [
        {
          title: "All Pending",
          url: "/admin/reports/pending",
        },
        {
          title: "All Success (Accepted)",
          url: "/admin/reports/success",
        },
        {
          title: "All Rejected",
          url: "/admin/reports/rejected",
        },
      ],
    },
    {
      title: "Violations",
      url: "#",
      icon: <BookOpenIcon className="size-4" />,
      items: [
        {
          title: "Violation Types",
          url: "/admin/violations",
        },
      ],
    },
    {
      title: "Users",
      url: "#",
      icon: <UsersIcon className="size-4" />,
      items: [
        {
          title: "Citizen Table",
          url: "/admin/users/citizens",
        },
      ],
    },
    {
      title: "Admins",
      url: "#",
      icon: <ShieldIcon className="size-4" />,
      items: [
        {
          title: "Super Admin",
          url: "/admin/admins/super",
        },
        {
          title: "Police Admin",
          url: "/admin/admins/police",
        },
        {
          title: "Add Police Admin",
          url: "/admin/admins/add",
        },
      ],
    },
  ],
};


export function AppSidebar({ ...props }) {
  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="/admin/dashboard">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <ShieldAlertIcon className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-bold text-base text-foreground">Axom Prahari</span>
                  <span className="truncate text-xs text-muted-foreground font-medium">Police Admin Portal</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  );
}
