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
  TrendingUpIcon,
  TrendingDownIcon,
  EyeIcon,
  CarIcon,
  ClockIcon,
  MessageSquareIcon,
  VideoIcon,
  CameraIcon
} from "lucide-react";
import { useState, useEffect } from "react";
import api from "@/lib/axios";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Image from "next/image";

const isVideoFile = (url) => {
  if (!url) return false;
  const cleanUrl = url.split("?")[0];
  return /\.(mp4|mov|webm|ogg|m4v)$/i.test(cleanUrl);
};

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    pending: { count: 0, trend: 0 },
    accepted: { count: 0, trend: 0 },
    rejected: { count: 0, trend: 0 },
    active_citizens: { count: 0, trend: 0 }
  });
  const [recentReports, setRecentReports] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [dashboardRes, reportsRes] = await Promise.all([
          api.get("/admin/dashboard"),
          api.get("/admin/reports?status=pending&limit=10")
        ]);
        if (dashboardRes.data?.status === "success") {
          setStats(dashboardRes.data.data.stats || {
            pending: { count: 0, trend: 0 },
            accepted: { count: 0, trend: 0 },
            rejected: { count: 0, trend: 0 },
            active_citizens: { count: 0, trend: 0 }
          });
        }
        if (reportsRes.data?.status === "success") {
          setRecentReports(reportsRes.data.data.reports || []);
        }
      } catch (err) {
        console.error("Error loading dashboard data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const renderTrend = (trendValue, type) => {
    if (trendValue === 0) {
      return (
        <span className="text-xs text-muted-foreground font-medium">
          No change
        </span>
      );
    }

    const isPositive = trendValue > 0;
    const formattedTrend = isPositive ? `+${trendValue}%` : `${trendValue}%`;

    // Dynamic colors & icon direction based on metric type
    let colorClass = "text-muted-foreground";
    if (type === "pending") {
      colorClass = isPositive ? "text-amber-500" : "text-emerald-500";
    } else if (type === "accepted") {
      colorClass = isPositive ? "text-emerald-500" : "text-rose-500";
    } else if (type === "rejected") {
      colorClass = isPositive ? "text-rose-500" : "text-emerald-500";
    } else if (type === "active_citizens") {
      colorClass = isPositive ? "text-blue-500" : "text-rose-500";
    }

    const TrendIcon = isPositive ? TrendingUpIcon : TrendingDownIcon;

    return (
      <span className={`text-xs ${colorClass} font-medium flex items-center gap-1`}>
        <TrendIcon className="size-3" /> {formattedTrend}
      </span>
    );
  };

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
                    <span className="text-3xl font-extrabold">{stats.pending.count}</span>
                    {renderTrend(stats.pending.trend, "pending")}
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
                    <span className="text-3xl font-extrabold">{stats.accepted.count}</span>
                    {renderTrend(stats.accepted.trend, "accepted")}
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
                    <span className="text-3xl font-extrabold">{stats.rejected.count}</span>
                    {renderTrend(stats.rejected.trend, "rejected")}
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
                    <span className="text-3xl font-extrabold">{stats.active_citizens.count.toLocaleString()}</span>
                    {renderTrend(stats.active_citizens.trend, "active_citizens")}
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
                <div className="flex-1 space-y-3 py-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex items-center justify-between border-b border-border/50 pb-2">
                      <Skeleton className="h-4 w-8" />
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-8 w-16 rounded-md" />
                    </div>
                  ))}
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
                  <a href="/admin/reports/pending" className="text-xs text-primary underline hover:text-primary/80">View all</a>
                </div>
                {recentReports.length === 0 ? (
                  <div className="flex-1 flex flex-col justify-center items-center rounded-lg border border-dashed border-border bg-muted/20 p-4">
                    <FileTextIcon className="size-8 text-muted-foreground/60 mb-2 animate-pulse" />
                    <p className="text-sm font-medium text-muted-foreground">No recent incidents received in the last hour</p>
                    <p className="text-xs text-muted-foreground/60">Updates will appear dynamically as citizens submit reports.</p>
                  </div>
                ) : (
                  <div className="flex-1 overflow-y-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-12 text-center">S.No</TableHead>
                          <TableHead>Violation Name</TableHead>
                          <TableHead>Vehicle Number</TableHead>
                          <TableHead className="text-right w-20">Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {recentReports.map((report, idx) => (
                          <TableRow key={report.id}>
                            <TableCell className="text-center font-mono text-xs text-muted-foreground">
                              #{idx + 1}
                            </TableCell>
                            <TableCell className="font-semibold text-xs sm:text-sm">
                              {report.offence_name || "Violation"}
                            </TableCell>
                            <TableCell>
                              {report.vehicle_number && report.vehicle_number !== "N/A" ? (
                                <Badge variant="outline" className="font-mono text-xs uppercase bg-amber-500/5 text-amber-600 dark:text-amber-400 border-amber-500/20 px-2 py-0.5 tracking-wider">
                                  {report.vehicle_number}
                                </Badge>
                              ) : (
                                <span className="text-xs text-muted-foreground italic font-mono">
                                  N/A
                                </span>
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-8 gap-1 text-primary hover:text-primary/95 cursor-pointer"
                                onClick={() => setSelectedReport(report)}
                              >
                                <EyeIcon className="size-3.5" />
                                <span>View</span>
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
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

      {/* Incident Details Dialog Modal */}
      <Dialog
        open={selectedReport !== null}
        onOpenChange={(open) => !open && setSelectedReport(null)}>
        <DialogContent className="sm:max-w-[550px] p-6 max-h-[90vh] overflow-y-auto">
          {selectedReport && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-2">
                  <Badge
                    variant="warning"
                    className="text-[10px] tracking-wider uppercase font-semibold">
                    Pending Review
                  </Badge>
                  <span className="font-mono text-xs font-semibold text-muted-foreground">
                    {selectedReport.report_id}
                  </span>
                </div>
                <DialogTitle className="text-xl font-bold font-serif">
                  {selectedReport.offence_name}
                </DialogTitle>
                <DialogDescription>
                  Submitted by {selectedReport.citizen_name || "Citizen"} on{" "}
                  {new Date(selectedReport.created_at).toLocaleString()}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 my-2">
                {/* Media Preview Container */}
                <div className="relative rounded-lg overflow-hidden border border-border/80 bg-muted flex items-center justify-center min-h-[220px]">
                  {isVideoFile(selectedReport.media_url) ? (
                    <video
                      src={selectedReport.media_url}
                      controls
                      className="w-full h-55 object-contain bg-black"
                    />
                  ) : (
                    <Image
                      fill
                      loading="lazy"
                      src={selectedReport.media_url || "/incident_mockup.png"}
                      alt="Citizen submission proof"
                      className="w-full h-55 object-cover"
                    />
                  )}
                  <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-xs text-white text-[10px] px-2 py-1 rounded flex items-center gap-1.5 font-semibold">
                    {isVideoFile(selectedReport.media_url) ? (
                      <>
                        <VideoIcon className="size-3" />
                        <span>Citizen Video Upload</span>
                      </>
                    ) : (
                      <>
                        <CameraIcon className="size-3" />
                        <span>Citizen Image Upload</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Structured Metadata Grid */}
                <div className="grid grid-cols-2 gap-4 text-sm bg-muted/30 p-3 rounded-lg border border-border/50">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-muted-foreground text-xs font-medium">
                      <CarIcon className="size-3.5" />
                      <span>Vehicle Number</span>
                    </div>
                    {selectedReport.vehicle_number &&
                    selectedReport.vehicle_number !== "N/A" ? (
                      <span className="font-mono font-bold text-xs uppercase bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-900/50 px-2 py-0.5 rounded tracking-wider">
                        {selectedReport.vehicle_number}
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground italic font-mono">
                        Not Provided (N/A)
                      </span>
                    )}
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-muted-foreground text-xs font-medium">
                      <MapPinIcon className="size-3.5" />
                      <span>GPS Coordinates</span>
                    </div>
                    <span className="font-mono text-xs font-semibold text-foreground/80 bg-background px-2 py-0.5 rounded border border-border/40">
                      {selectedReport.latitude && selectedReport.longitude
                        ? `${selectedReport.latitude}° N, ${selectedReport.longitude}° E`
                        : "Coordinates missing"}
                    </span>
                  </div>
                  <div className="col-span-2 space-y-1">
                    <div className="flex items-center gap-1.5 text-muted-foreground text-xs font-medium">
                      <MapPinIcon className="size-3.5 text-rose-500" />
                      <span>Location Reference</span>
                    </div>
                    <span className="font-medium text-foreground">
                      {selectedReport.location_name}
                    </span>
                  </div>
                  <div className="col-span-2 space-y-1">
                    <div className="flex items-center gap-1.5 text-muted-foreground text-xs font-medium">
                      <ClockIcon className="size-3.5" />
                      <span>Incident Occurrence</span>
                    </div>
                    <span className="font-medium text-foreground">
                      Date:{" "}
                      {selectedReport.incident_date
                        ? new Date(
                            selectedReport.incident_date,
                          ).toLocaleDateString()
                        : "N/A"}
                      , Time: {selectedReport.incident_time || "N/A"}
                    </span>
                  </div>
                </div>

                {/* Citizen Message */}
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-muted-foreground text-xs font-medium">
                    <MessageSquareIcon className="size-3.5" />
                    <span>Reporter Message</span>
                  </div>
                  <div className="bg-muted/40 border-l-2 border-primary/50 p-3 rounded-r-lg">
                    <p className="text-xs italic text-foreground/80 leading-relaxed font-sans">
                      &ldquo;
                      {selectedReport.message ||
                        "No additional comments provided."}
                      &rdquo;
                    </p>
                  </div>
                </div>
              </div>

              <DialogFooter className="border-t border-border/40 pt-4 mt-2">
                <Button
                  variant="outline"
                  onClick={() => setSelectedReport(null)}
                  className="cursor-pointer w-full sm:w-auto">
                  Close
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
