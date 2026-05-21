"use client";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  FileTextIcon, 
  CheckCircle2Icon, 
  XCircleIcon, 
  UsersIcon, 
  MapPinIcon, 
  TrendingUpIcon 
} from "lucide-react";
import { useState, useEffect } from "react";

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1200);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2 border-b border-sidebar-border/30 bg-background/50 backdrop-blur px-4">
        <div className="flex items-center gap-2">
          <SidebarTrigger className="-ml-1" />
          <Separator
            orientation="vertical"
            className="mr-2 data-vertical:h-4 data-vertical:self-auto"
          />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <span className="text-muted-foreground">Overview</span>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Dashboard</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Welcome Banner */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm relative overflow-hidden">
          <div className="relative z-10 space-y-2">
            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
              Axom Prahari Dashboard
            </h1>
            <p className="text-muted-foreground max-w-xl">
              Welcome to the Police Admin Portal. Manage public reports, monitor live heatmap alerts, and administer user roles and permissions.
            </p>
          </div>
          <div className="absolute top-0 right-0 h-full w-1/3 bg-linear-to-l from-primary/10 to-transparent pointer-events-none" />
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="rounded-xl border border-border bg-card p-6 shadow-xs flex items-center justify-between">
                <div className="space-y-2 w-full">
                  <Skeleton className="h-4 w-28" />
                  <div className="flex items-baseline gap-2">
                    <Skeleton className="h-8 w-16" />
                  </div>
                </div>
                <Skeleton className="size-12 rounded-lg" />
              </div>
            ))
          ) : (
            <>
              {/* Pending Reports Card */}
              <div className="rounded-xl border border-border bg-card p-6 shadow-xs flex items-center justify-between">
                <div className="space-y-2">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Pending Reports
                  </span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-extrabold">24</span>
                    <span className="text-xs text-amber-500 font-medium flex items-center gap-1">
                      <TrendingUpIcon className="size-3" /> +12%
                    </span>
                  </div>
                </div>
                <div className="size-12 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-500">
                  <FileTextIcon className="size-6" />
                </div>
              </div>

              {/* Accepted Reports Card */}
              <div className="rounded-xl border border-border bg-card p-6 shadow-xs flex items-center justify-between">
                <div className="space-y-2">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Accepted Reports
                  </span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-extrabold">142</span>
                    <span className="text-xs text-emerald-500 font-medium flex items-center gap-1">
                      <TrendingUpIcon className="size-3" /> +8%
                    </span>
                  </div>
                </div>
                <div className="size-12 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                  <CheckCircle2Icon className="size-6" />
                </div>
              </div>

              {/* Rejected Reports Card */}
              <div className="rounded-xl border border-border bg-card p-6 shadow-xs flex items-center justify-between">
                <div className="space-y-2">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Rejected Reports
                  </span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-extrabold">18</span>
                    <span className="text-xs text-muted-foreground font-medium">No change</span>
                  </div>
                </div>
                <div className="size-12 rounded-lg bg-rose-500/10 flex items-center justify-center text-rose-500">
                  <XCircleIcon className="size-6" />
                </div>
              </div>

              {/* Active Citizens Card */}
              <div className="rounded-xl border border-border bg-card p-6 shadow-xs flex items-center justify-between">
                <div className="space-y-2">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Active Citizens
                  </span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-extrabold">1,248</span>
                    <span className="text-xs text-blue-500 font-medium flex items-center gap-1">
                      <TrendingUpIcon className="size-3" /> +24%
                    </span>
                  </div>
                </div>
                <div className="size-12 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500">
                  <UsersIcon className="size-6" />
                </div>
              </div>
            </>
          )}
        </div>

        {/* Dashboard Visual Content / Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
          {loading ? (
            <>
              <div className="col-span-4 rounded-xl border border-border bg-card p-6 shadow-xs min-h-[350px] flex flex-col justify-between">
                <div className="flex justify-between items-center mb-4">
                  <Skeleton className="h-5 w-40" />
                  <Skeleton className="h-4 w-16" />
                </div>
                <div className="flex-1 space-y-4 py-4">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              </div>
              <div className="col-span-3 rounded-xl border border-border bg-card p-6 shadow-xs min-h-[350px] flex flex-col justify-between">
                <div className="flex justify-between items-center mb-4">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="size-3 rounded-full" />
                </div>
                <div className="flex-1 space-y-4 py-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <Skeleton className="size-8 rounded-full animate-pulse" />
                      <div className="space-y-2 flex-1">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-3 w-1/2" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="col-span-4 rounded-xl border border-border bg-card p-6 shadow-xs min-h-[350px] flex flex-col justify-between">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-bold">Recent Incident Reports</h2>
                  <span className="text-xs text-primary underline cursor-pointer hover:text-primary/80">View all</span>
                </div>
                <div className="flex-1 flex flex-col justify-center items-center rounded-lg border border-dashed border-border bg-muted/20 p-4">
                  <FileTextIcon className="size-8 text-muted-foreground/60 mb-2 animate-pulse" />
                  <p className="text-sm font-medium text-muted-foreground">No recent incidents received in the last hour</p>
                  <p className="text-xs text-muted-foreground/60">Updates will appear dynamically as citizens submit reports.</p>
                </div>
              </div>

              <div className="col-span-3 rounded-xl border border-border bg-card p-6 shadow-xs min-h-[350px] flex flex-col justify-between">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-bold">Live Incident Alerts</h2>
                  <span className="size-3 rounded-full bg-red-500 animate-ping" />
                </div>
                <div className="flex-1 flex flex-col justify-center items-center rounded-lg border border-dashed border-border bg-muted/20 p-4 text-center">
                  <MapPinIcon className="size-8 text-red-500/80 mb-2 animate-bounce" />
                  <p className="text-sm font-medium text-muted-foreground">All coordinates within safe threshold</p>
                  <p className="text-xs text-muted-foreground/60">Live heatmaps are monitoring incoming geo-tagged submissions.</p>
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </>
  );
}
