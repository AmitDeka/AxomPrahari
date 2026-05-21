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
import { useState, useEffect, useMemo } from "react";
import api from "@/lib/axios";

// Bounding box for Assam mapping onto simulated container
// Assam boundary coordinates approximately:
// Lat: 24.0° N to 28.0° N
// Lng: 89.5° E to 96.0° E
const getXYPercentages = (lat, lng) => {
  const minLat = 24.0;
  const maxLat = 28.0;
  const minLng = 89.5;
  const maxLng = 96.0;

  const latVal = parseFloat(lat);
  const lngVal = parseFloat(lng);

  if (isNaN(latVal) || isNaN(lngVal)) {
    return { x: 50, y: 50 }; // Default center
  }

  let x = ((lngVal - minLng) / (maxLng - minLng)) * 100;
  let y = (1 - (latVal - minLat) / (maxLat - minLat)) * 100;

  // Clamp values between 5% and 95% to keep them visible inside the container
  x = Math.max(5, Math.min(95, x));
  y = Math.max(5, Math.min(95, y));

  return { x, y };
};

// Target reference points (major cities in Assam)
const ASSAM_CITIES = [
  { name: "Guwahati", lat: 26.1806, lng: 91.7539 },
  { name: "Jorhat", lat: 26.7509, lng: 94.2037 },
  { name: "Dibrugarh", lat: 27.4728, lng: 94.9120 },
  { name: "Silchar", lat: 24.8333, lng: 92.7789 },
  { name: "Tezpur", lat: 26.6528, lng: 92.7926 },
  { name: "Nagaon", lat: 26.3484, lng: 92.6839 },
  { name: "Bongaigaon", lat: 26.4746, lng: 90.5583 }
];

// Helper to find the nearest reference city
const getNearestCity = (lat, lng) => {
  const latVal = parseFloat(lat);
  const lngVal = parseFloat(lng);
  if (isNaN(latVal) || isNaN(lngVal)) return "Unknown";

  let nearest = ASSAM_CITIES[0];
  let minDist = Infinity;

  for (const city of ASSAM_CITIES) {
    const dist = Math.sqrt(Math.pow(latVal - city.lat, 2) + Math.pow(lngVal - city.lng, 2));
    if (dist < minDist) {
      minDist = dist;
      nearest = city;
    }
  }

  return nearest.name;
};

export default function HeatmapPage() {
  const [loading, setLoading] = useState(true);
  const [points, setPoints] = useState([]);

  const fetchHeatmapData = async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      const res = await api.get("/admin/reports/heatmap");
      if (res.data?.status === "success") {
        setPoints(res.data.data || []);
      }
    } catch (err) {
      console.error("Error loading heatmap points", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setTimeout(() => {
      fetchHeatmapData(false);
    }, 0);
  }, []);

  // Compute dynamic Hot-Zones list from geocoded points
  const hotZones = useMemo(() => {
    // Group points by nearest city
    const counts = {};
    ASSAM_CITIES.forEach(city => {
      counts[city.name] = {
        name: city.name,
        lat: city.lat,
        lng: city.lng,
        count: 0
      };
    });

    points.forEach(pt => {
      const nearestCity = getNearestCity(pt.latitude, pt.longitude);
      if (counts[nearestCity]) {
        counts[nearestCity].count += 1;
      } else {
        // Fallback for edge cases outside list
        counts[nearestCity] = {
          name: nearestCity,
          lat: pt.latitude,
          lng: pt.longitude,
          count: 1
        };
      }
    });

    // Convert to array and filter out cities with 0 reports if we want to show only active zones,
    // or keep all with counts to show status. Let's filter to only active zones (count > 0).
    const activeZones = Object.values(counts)
      .filter(zone => zone.count > 0)
      .map(zone => {
        let threat = "Low";
        let color = "text-blue-500 bg-blue-500/10";
        if (zone.count >= 10) {
          threat = "High";
          color = "text-red-500 bg-red-500/10";
        } else if (zone.count >= 4) {
          threat = "Medium";
          color = "text-amber-500 bg-amber-500/10";
        }

        return {
          name: zone.name,
          coordinates: `${parseFloat(zone.lat).toFixed(4)}° N, ${parseFloat(zone.lng).toFixed(4)}° E`,
          threat,
          reports: zone.count,
          color
        };
      });

    // Sort by reports count descending
    return activeZones.sort((a, b) => b.reports - a.reports);
  }, [points]);

  // Compute critical alert
  const criticalAlert = useMemo(() => {
    return hotZones.find(zone => zone.threat === "High");
  }, [hotZones]);

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
            onClick={fetchHeatmapData}
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
              {/* Map view rendering live geolocated points */}
              <div className="lg:col-span-2 rounded-2xl border border-border bg-card overflow-hidden shadow-xs min-h-[400px] flex flex-col">
                <div className="p-4 border-b border-border bg-muted/20 flex items-center justify-between">
                  <span className="text-sm font-bold flex items-center gap-2">
                    <FlameIcon className="size-4 text-red-500 animate-pulse" />
                    Live Map View (Assam Division)
                  </span>
                  <Badge variant="success">Active Feed</Badge>
                </div>
                
                <div className="flex-1 bg-neutral-900 dark:bg-neutral-950 relative flex items-center justify-center overflow-hidden min-h-[450px]">
                  {/* Simulated Map Background */}
                  <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] dark:bg-[radial-gradient(#333_1px,transparent_1px)]" />
                  
                  {/* Simulated Region Highlights (Heat bubbles based on active points) */}
                  {points.map((pt, idx) => {
                    const { x, y } = getXYPercentages(pt.latitude, pt.longitude);
                    return (
                      <div
                        key={`bubble-${idx}`}
                        style={{ top: `${y}%`, left: `${x}%`, transform: "translate(-50%, -50%)" }}
                        className="absolute size-16 rounded-full bg-red-500/10 blur-md pointer-events-none"
                      />
                    );
                  })}

                  {/* Pin Indicators for each report */}
                  {points.map((pt, idx) => {
                    const { x, y } = getXYPercentages(pt.latitude, pt.longitude);
                    return (
                      <div 
                        key={`pin-${idx}`} 
                        style={{ top: `${y}%`, left: `${x}%`, transform: "translate(-50%, -100%)" }} 
                        className="absolute flex flex-col items-center group z-10"
                      >
                        <span className="size-2 rounded-full bg-red-500 animate-ping absolute" />
                        <MapPinIcon className="size-5 text-red-500 filter drop-shadow-md cursor-pointer hover:scale-125 transition-transform" />
                        
                        {/* Hover Details Card */}
                        <div className="absolute bottom-full mb-1 hidden group-hover:block bg-background/95 backdrop-blur-xs text-foreground text-[10px] px-2 py-1.5 rounded-md border border-border shadow-md whitespace-nowrap z-20 pointer-events-none">
                          <p className="font-bold text-xs">{pt.offence_name}</p>
                          <p className="text-muted-foreground mt-0.5">Vehicle: {pt.vehicle_number || "N/A"}</p>
                          <p className="text-muted-foreground">Coords: {parseFloat(pt.latitude).toFixed(4)}, {parseFloat(pt.longitude).toFixed(4)}</p>
                        </div>
                      </div>
                    );
                  })}

                  {points.length === 0 && (
                    <div className="text-center z-10 text-neutral-400 max-w-xs p-6 bg-background/90 border border-border/50 rounded-xl">
                      <p className="text-sm font-semibold text-foreground">No Incidents Plotted</p>
                      <p className="text-xs mt-1 text-muted-foreground">Once citizen violation reports are verified and accepted, their geolocations will appear here dynamically.</p>
                    </div>
                  )}

                  {points.length > 0 && (
                    <div className="absolute bottom-3 left-3 bg-black/60 text-white text-[10px] px-2 py-1 rounded-sm backdrop-blur-xs z-15 select-none pointer-events-none border border-white/5">
                      Geographic Bounds: 24°N-28°N / 89.5°E-96°E
                    </div>
                  )}
                </div>
              </div>

              {/* Region List */}
              <div className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-4">
                <h2 className="text-lg font-bold">Incident Hot-Zones</h2>
                <p className="text-muted-foreground text-xs">Regions requiring immediate patrol attention</p>
                
                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                  {hotZones.map((loc, index) => (
                    <div key={`zone-${index}`} className="p-3 rounded-xl border border-border bg-muted/10 hover:bg-muted/30 transition-colors flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="text-sm font-bold">{loc.name}</p>
                        <p className="text-[11px] text-muted-foreground">{loc.coordinates}</p>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <Badge className={`${loc.color} border-none`}>
                          {loc.threat} Threat
                        </Badge>
                        <span className="text-xs font-semibold text-muted-foreground">{loc.reports} {loc.reports === 1 ? 'Report' : 'Reports'}</span>
                      </div>
                    </div>
                  ))}

                  {hotZones.length === 0 && (
                    <p className="text-xs text-muted-foreground italic text-center py-6">No active hot-zones calculated.</p>
                  )}
                </div>

                {criticalAlert ? (
                  <div className="p-4 rounded-xl border border-red-500/20 bg-red-500/5 text-red-600 dark:text-red-400 text-xs flex gap-2.5">
                    <AlertTriangleIcon className="size-5 shrink-0" />
                    <div>
                      <p className="font-bold">{criticalAlert.name} Alert Level Raised</p>
                      <p className="mt-0.5 text-[11px] opacity-80">Reports in {criticalAlert.name} zone exceed critical threshold ({criticalAlert.reports} reports). Recommend dispatch coordination.</p>
                    </div>
                  </div>
                ) : points.length > 0 ? (
                  <div className="p-4 rounded-xl border border-blue-500/20 bg-blue-500/5 text-blue-600 dark:text-blue-400 text-xs flex gap-2.5">
                    <AlertTriangleIcon className="size-5 shrink-0 text-blue-500" />
                    <div>
                      <p className="font-bold">Normal Alert Levels</p>
                      <p className="mt-0.5 text-[11px] opacity-80">Total geolocated incidents: {points.length}. Standard district patrols are sufficient at present.</p>
                    </div>
                  </div>
                ) : null}
              </div>
            </>
          )}
        </div>
      </main>
    </>
  );
}
