"use client";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { MapPinIcon, FlameIcon, RefreshCwIcon, AlertTriangleIcon } from "lucide-react";
import { useState, useEffect } from "react";

export default function HeatmapPage() {
  const [loading, setLoading] = useState(true);
  const [locations, setLocations] = useState([
    { id: 1, name: "Guwahati (Paltan Bazaar)", coordinates: "26.1806° N, 91.7539° E", threat: "High", reports: 18, color: "text-red-500 bg-red-500/10" },
    { id: 2, name: "Jorhat Town", coordinates: "26.7509° N, 94.2037° E", threat: "Medium", reports: 8, color: "text-amber-500 bg-amber-500/10" },
    { id: 3, name: "Dibrugarh Bypass", coordinates: "27.4728° N, 94.9120° E", threat: "Low", reports: 2, color: "text-blue-500 bg-blue-500/10" },
    { id: 4, name: "Silchar (Central)", coordinates: "24.8333° N, 92.7789° E", threat: "High", reports: 14, color: "text-red-500 bg-red-500/10" },
    { id: 5, name: "Tezpur (Mission Chariali)", coordinates: "26.6528° N, 92.7926° E", threat: "Medium", reports: 5, color: "text-amber-500 bg-amber-500/10" },
  ]);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1200);
    return () => clearTimeout(timer);
  }, []);

  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 800);
  };

  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2 border-b border-sidebar-border/30 bg-background/50 backdrop-blur px-4">
        <div className="flex items-center gap-2">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 data-vertical:h-4 data-vertical:self-auto" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <span className="text-muted-foreground">Overview</span>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Live Heatmap</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Live Incident Heatmap</h1>
            <p className="text-muted-foreground text-sm">Real-time alert hot-zones based on citizen submissions</p>
          </div>
          <button 
            onClick={handleRefresh}
            className="flex items-center gap-2 text-sm px-4 py-2 rounded-lg border border-border bg-card hover:bg-muted transition-colors cursor-pointer"
          >
            <RefreshCwIcon className={`size-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh Feed
          </button>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {loading ? (
            <>
              {/* Map Skeleton */}
              <div className="lg:col-span-2 rounded-2xl border border-border bg-card overflow-hidden shadow-xs min-h-[400px] flex flex-col p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-5 w-48" />
                  <Skeleton className="h-6 w-20" />
                </div>
                <Skeleton className="flex-1 w-full rounded-xl" />
              </div>
              
              {/* Sidebar Skeleton */}
              <div className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-4">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-48" />
                <div className="space-y-3 pt-2">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="flex justify-between items-center p-3 rounded-xl border border-border bg-muted/10">
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-20" />
                      </div>
                      <Skeleton className="h-6 w-16" />
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Mock Map Representation */}
              <div className="lg:col-span-2 rounded-2xl border border-border bg-card overflow-hidden shadow-xs min-h-[400px] flex flex-col">
                <div className="p-4 border-b border-border bg-muted/20 flex items-center justify-between">
                  <span className="text-sm font-bold flex items-center gap-2">
                    <FlameIcon className="size-4 text-red-500 animate-pulse" />
                    Live Map View (Assam Division)
                  </span>
                  <Badge variant="success">Active Feed</Badge>
                </div>
                
                <div className="flex-1 bg-neutral-900 dark:bg-neutral-950 relative flex items-center justify-center overflow-hidden">
                  {/* Simulated Map Background */}
                  <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] dark:bg-[radial-gradient(#333_1px,transparent_1px)]" />
                  
                  {/* Simulated Region Highlights (Heat bubbles) */}
                  <div className="absolute top-1/4 left-1/3 size-24 rounded-full bg-red-500/20 blur-xl animate-pulse" />
                  <div className="absolute top-1/2 left-2/3 size-32 rounded-full bg-red-500/10 blur-xl" />
                  <div className="absolute bottom-1/3 left-1/2 size-20 rounded-full bg-amber-500/15 blur-xl animate-pulse" />

                  {/* Pin Indicators */}
                  <div className="absolute top-[28%] left-[32%] flex flex-col items-center">
                    <span className="size-3 rounded-full bg-red-500 animate-ping absolute" />
                    <MapPinIcon className="size-6 text-red-500 filter drop-shadow-md cursor-pointer hover:scale-125 transition-transform" />
                    <span className="text-[10px] bg-background/95 border border-border px-1.5 py-0.5 rounded-sm mt-1 font-bold">Guwahati (18)</span>
                  </div>

                  <div className="absolute top-[48%] left-[64%] flex flex-col items-center">
                    <span className="size-3 rounded-full bg-amber-500 animate-ping absolute" />
                    <MapPinIcon className="size-6 text-amber-500 filter drop-shadow-md cursor-pointer hover:scale-125 transition-transform" />
                    <span className="text-[10px] bg-background/95 border border-border px-1.5 py-0.5 rounded-sm mt-1 font-bold">Jorhat (8)</span>
                  </div>

                  <div className="absolute bottom-[35%] left-[45%] flex flex-col items-center">
                    <span className="size-3 rounded-full bg-red-500 animate-ping absolute" />
                    <MapPinIcon className="size-6 text-red-500 filter drop-shadow-md cursor-pointer hover:scale-125 transition-transform" />
                    <span className="text-[10px] bg-background/95 border border-border px-1.5 py-0.5 rounded-sm mt-1 font-bold">Silchar (14)</span>
                  </div>

                  <div className="text-center z-10 text-neutral-400 max-w-xs p-4 bg-background/90 border border-border/50 rounded-xl">
                    <p className="text-sm font-semibold text-foreground">Interactive Geographical Simulation</p>
                    <p className="text-xs mt-1">Geo-tagged citizen reports generate real-time visual zone markers below for police deployment.</p>
                  </div>
                </div>
              </div>

              {/* Region List */}
              <div className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-4">
                <h2 className="text-lg font-bold">Incident Hot-Zones</h2>
                <p className="text-muted-foreground text-xs">Regions requiring immediate patrol attention</p>
                
                <div className="space-y-3">
                  {locations.map((loc) => (
                    <div key={loc.id} className="p-3 rounded-xl border border-border bg-muted/10 hover:bg-muted/30 transition-colors flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="text-sm font-bold">{loc.name}</p>
                        <p className="text-[11px] text-muted-foreground">{loc.coordinates}</p>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <Badge variant={loc.threat === 'High' ? 'destructive' : loc.threat === 'Medium' ? 'warning' : 'info'}>
                          {loc.threat} Threat
                        </Badge>
                        <span className="text-xs font-semibold text-muted-foreground">{loc.reports} Reports</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-4 rounded-xl border border-red-500/20 bg-red-500/5 text-red-600 dark:text-red-400 text-xs flex gap-2.5">
                  <AlertTriangleIcon className="size-5 shrink-0" />
                  <div>
                    <p className="font-bold">Guwahati Alert Level Raised</p>
                    <p className="mt-0.5 text-[11px] opacity-80">Reports in Paltan Bazaar zone exceed critical threshold. Recommend dispatch coordination.</p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </>
  );
}
