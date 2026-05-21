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
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
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
import { 
  XCircleIcon, 
  EyeIcon, 
  MapPinIcon, 
  CarIcon, 
  ClockIcon, 
  UserIcon, 
  MessageSquareIcon,
  AlertTriangleIcon,
  CameraIcon,
  VideoIcon
} from "lucide-react";
import { useState, useEffect } from "react";
import api from "@/lib/axios";

const isVideoFile = (url) => {
  if (!url) return false;
  const cleanUrl = url.split('?')[0];
  return /\.(mp4|mov|webm|ogg|m4v)$/i.test(cleanUrl);
};

export default function RejectedReportsPage() {
  const [loading, setLoading] = useState(true);
  const [reports, setReports] = useState([]);

  // Dialog State
  const [selectedReport, setSelectedReport] = useState(null);

  const fetchReports = async () => {
    try {
      const res = await api.get("/admin/reports?status=rejected");
      if (res.data?.status === "success") {
        setReports(res.data.data.reports || []);
      }
    } catch (err) {
      console.error("Error loading rejected reports", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setTimeout(() => {
      fetchReports();
    }, 0);
  }, []);

  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2 border-b border-sidebar-border/30 bg-background/50 backdrop-blur px-4">
        <div className="flex items-center gap-2">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 data-vertical:h-4 data-vertical:self-auto" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <span className="text-muted-foreground">Reports</span>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>All Rejected</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Rejected Incident Reports</h1>
          <p className="text-muted-foreground text-sm">Incident reports marked invalid, duplicate, or spam</p>
        </div>

        <div className="rounded-xl border border-border bg-card shadow-xs overflow-hidden">
          {loading ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[150px]">Report ID</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Reporter</TableHead>
                  <TableHead>Rejection Reason</TableHead>
                  <TableHead>Date Rejected</TableHead>
                  <TableHead className="w-[100px]">Status</TableHead>
                  <TableHead className="text-right w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Array.from({ length: 3 }).map((_, rIndex) => (
                  <TableRow key={rIndex}>
                    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-16 rounded-full" /></TableCell>
                    <TableCell className="text-right flex items-center justify-end h-full py-3">
                      <Skeleton className="size-8 rounded-lg" />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : reports.length === 0 ? (
            <div className="p-12 text-center flex flex-col items-center justify-center space-y-3">
              <XCircleIcon className="size-10 text-muted-foreground/60" />
              <p className="text-sm font-semibold text-muted-foreground">No rejected reports found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[150px]">Report ID</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Reporter</TableHead>
                  <TableHead>Rejection Reason</TableHead>
                  <TableHead>Date Rejected</TableHead>
                  <TableHead className="w-[100px]">Status</TableHead>
                  <TableHead className="text-right w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reports.map((report) => (
                  <TableRow key={report.id}>
                    <TableCell className="font-mono font-semibold">{report.report_id}</TableCell>
                    <TableCell className="font-medium">{report.offence_name}</TableCell>
                    <TableCell className="truncate max-w-[200px]">{report.location_name}</TableCell>
                    <TableCell>{report.citizen_name || "Citizen"}</TableCell>
                    <TableCell className="text-rose-600 dark:text-rose-400 font-semibold text-xs truncate max-w-[150px]">
                      {report.admin_message || "No reason provided"}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-xs">
                      {new Date(report.updated_at).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}
                    </TableCell>
                    <TableCell>
                      <Badge variant="destructive">Rejected</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button 
                        size="icon" 
                        variant="outline" 
                        className="size-8 text-blue-500 hover:text-blue-600 hover:bg-blue-50/50 cursor-pointer"
                        title="View Details"
                        onClick={() => setSelectedReport(report)}
                      >
                        <EyeIcon className="size-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </main>

      {/* Incident Details Dialog Modal */}
      <Dialog open={selectedReport !== null} onOpenChange={(open) => !open && setSelectedReport(null)}>
        <DialogContent className="sm:max-w-[550px] p-6 max-h-[90vh] overflow-y-auto">
          {selectedReport && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-2">
                  <Badge variant="destructive" className="text-[10px] tracking-wider uppercase font-semibold">Rejected / Dismissed</Badge>
                  <span className="font-mono text-xs font-semibold text-muted-foreground">{selectedReport.report_id}</span>
                </div>
                <DialogTitle className="text-xl font-bold font-serif">{selectedReport.offence_name}</DialogTitle>
                <DialogDescription>
                  Submitted by {selectedReport.citizen_name || "Citizen"} • Rejected on {new Date(selectedReport.updated_at).toLocaleString()}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 my-2">
                {/* Media Preview Container */}
                <div className="relative rounded-lg overflow-hidden border border-border/80 bg-muted flex items-center justify-center min-h-[220px]">
                  {isVideoFile(selectedReport.media_url) ? (
                    <video
                      src={selectedReport.media_url}
                      controls
                      className="w-full h-[220px] object-contain bg-black"
                    />
                  ) : (
                    <img
                      src={selectedReport.media_url || "/incident_mockup.png"}
                      alt="Citizen submission proof"
                      className="w-full h-[220px] object-cover"
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
                    {selectedReport.vehicle_number && selectedReport.vehicle_number !== "N/A" ? (
                      <span className="font-mono font-bold text-xs uppercase bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-900/50 px-2 py-0.5 rounded tracking-wider">
                        {selectedReport.vehicle_number}
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground italic font-mono">Not Provided (N/A)</span>
                    )}
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-muted-foreground text-xs font-medium">
                      <MapPinIcon className="size-3.5" />
                      <span>GPS Coordinates</span>
                    </div>
                    <span className="font-mono text-xs font-semibold text-foreground/80 bg-background px-2 py-0.5 rounded border border-border/40">
                      {selectedReport.latitude && selectedReport.longitude ? `${selectedReport.latitude}° N, ${selectedReport.longitude}° E` : "Coordinates missing"}
                    </span>
                  </div>
                  <div className="col-span-2 space-y-1">
                    <div className="flex items-center gap-1.5 text-muted-foreground text-xs font-medium">
                      <MapPinIcon className="size-3.5 text-rose-500" />
                      <span>Location Reference</span>
                    </div>
                    <span className="font-medium text-foreground">{selectedReport.location_name}</span>
                  </div>
                  <div className="col-span-2 space-y-1">
                    <div className="flex items-center gap-1.5 text-muted-foreground text-xs font-medium">
                      <AlertTriangleIcon className="size-3.5 text-rose-500" />
                      <span>Rejection Reason</span>
                    </div>
                    <span className="text-xs font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/10 border border-rose-100 dark:border-rose-900/30 px-2 py-1 rounded flex items-center gap-1.5">
                      {selectedReport.admin_message || "No reason provided"}
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
                      &ldquo;{selectedReport.message || "No additional comments provided."}&rdquo;
                    </p>
                  </div>
                </div>
              </div>

              <DialogFooter className="border-t border-border/40 pt-4 mt-2">
                <Button
                  variant="outline"
                  onClick={() => setSelectedReport(null)}
                  className="cursor-pointer w-full sm:w-auto"
                >
                  Close Details
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
