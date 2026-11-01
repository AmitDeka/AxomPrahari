"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import api from "@/lib/axios";
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
  MessageSquareIcon,
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
      title: "Feedback",
      url: "#",
      icon: <MessageSquareIcon className="size-4" />,
      items: [
        {
          title: "Citizen Feedback",
          url: "/admin/feedback",
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


const getEnvBadgeVariant = (environment) => {
  const envLower = (environment || "").toLowerCase();
  if (envLower.includes("prod")) return "success";
  if (envLower.includes("stag")) return "warning";
  if (envLower.includes("dev") || envLower.includes("local")) return "info";
  return "secondary";
};

const formatEnvLabel = (environment) => {
  if (!environment) return "";
  const envLower = environment.toLowerCase();
  if (envLower === "development" || envLower === "developmenttest" || envLower === "dev") return "DEV";
  if (envLower === "production" || envLower === "prod") return "PROD";
  if (envLower === "staging" || envLower === "stage") return "STAGING";
  return environment.toUpperCase();
};

const getDetectedEnv = () => {
  if (typeof process !== "undefined" && process.env.NEXT_PUBLIC_APP_ENV) {
    return process.env.NEXT_PUBLIC_APP_ENV;
  }
  const apiUrl = (typeof process !== "undefined" && process.env.NEXT_PUBLIC_API_URL) || "";
  if (apiUrl.includes("localhost") || apiUrl.includes("127.0.0.1")) return "development";
  if (apiUrl.includes("staging") || apiUrl.includes("stage") || apiUrl.includes("test")) return "staging";
  if (apiUrl.includes("onrender.com") || apiUrl.includes("gov.in") || apiUrl.includes("prod")) return "production";
  if (typeof process !== "undefined" && process.env.NODE_ENV) return process.env.NODE_ENV;
  return "development";
};

export function AppSidebar({ profile, ...props }) {
  const [fetchedEnv, setFetchedEnv] = React.useState(null);
  const detectedEnv = React.useMemo(() => getDetectedEnv(), []);
  const env = profile?.env || fetchedEnv || detectedEnv;

  React.useEffect(() => {
    let isMounted = true;
    api
      .get("/system/env")
      .then((res) => {
        if (isMounted) {
          const apiEnv = res.data?.data?.env || res.data?.env;
          if (apiEnv) {
            setFetchedEnv(apiEnv);
          }
        }
      })
      .catch(() => {
        api
          .get("/env")
          .then((res) => {
            if (isMounted) {
              const apiEnv = res.data?.data?.env || res.data?.env;
              if (apiEnv) {
                setFetchedEnv(apiEnv);
              }
            }
          })
          .catch(() => {
            api
              .get("/health")
              .then((res) => {
                if (isMounted && res.data?.env) {
                  setFetchedEnv(res.data.env);
                }
              })
              .catch(() => {});
          });
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const user = {
    name: profile?.full_name || "Admin",
    email: profile?.email || "",
    avatar: "",
    role: profile?.role,
    rank: profile?.rank,
    jurisdiction_district: profile?.jurisdiction_district
  };

  const filteredNavMain = React.useMemo(() => {
    return data.navMain
      .map((item) => {
        if (item.title === "Admins") {
          if (user.role === "police_admin") {
            return {
              ...item,
              items: item.items.filter((subItem) => subItem.title !== "Super Admin"),
            };
          }
        }
        return item;
      })
      .filter((item) => {
        if (item.title === "Admins") {
          return user.role === "super_admin" || user.role === "police_admin";
        }
        return true;
      });
  }, [user.role]);

  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/admin/dashboard">
                <div className="relative flex aspect-square size-8 items-center justify-center rounded-lg shrink-0 overflow-visible">
                  <Image
                    src="/adm_panel_logo.png"
                    alt="Axom Prahari Logo"
                    width={32}
                    height={32}
                    className="size-8 object-contain"
                    priority
                  />
                  {env && (
                    <span
                      title={`Environment: ${env}`}
                      className={cn(
                        "absolute -top-1 -right-1 size-2 rounded-full border border-sidebar group-data-[collapsible=icon]:block hidden",
                        env.toLowerCase().includes("prod") && "bg-emerald-500",
                        env.toLowerCase().includes("stag") && "bg-amber-500",
                        (env.toLowerCase().includes("dev") || env.toLowerCase().includes("local")) && "bg-blue-500",
                        !env.toLowerCase().includes("prod") && !env.toLowerCase().includes("stag") && !env.toLowerCase().includes("dev") && !env.toLowerCase().includes("local") && "bg-zinc-400"
                      )}
                    />
                  )}
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <div className="flex items-center gap-1.5">
                    <span className="truncate font-bold text-base text-foreground">Axom Prahari</span>
                    {env && (
                      <Badge
                        variant={getEnvBadgeVariant(env)}
                        title={`Environment: ${env}`}
                        className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0 h-4.5 shrink-0"
                      >
                        {formatEnvLabel(env)}
                      </Badge>
                    )}
                  </div>
                  <span className="truncate text-xs text-muted-foreground font-medium">
                    {user.role === 'super_admin' ? 'Super Admin Portal' : 'Police Admin Portal'}
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={filteredNavMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  );
}
