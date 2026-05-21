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
  CameraIcon
} from "lucide-react";
import { useState, useEffect } from "react";

export default function RejectedReportsPage() {
  const [loading, setLoading] = useState(true);
  const [reports] = useState([
    { 
      id: "REP-9817", 
      category: "Spam Report", 
      location: "Hatigaon, Guwahati", 
      reporter: "Rajesh Kalita", 
      reason: "Spam / False Information", 
      date: "2026-05-17 11:15 AM", 
      status: "rejected",
      vehicleNumber: "AS-01-A-0000",
      gpsCoordinates: "26.1342° N, 91.7821° E",
      citizenMessage: "Testing application submittal parameters. Disregard vehicle license number entry.",
      mediaUrl: "/incident_mockup.png"
    },
    { 
      id: "REP-9812", 
      category: "Duplicate Report", 
      location: "Jorhat Bypass", 
      reporter: "Pankaj Bora", 
      reason: "Duplicate submission", 
      date: "2026-05-16 02:40 PM", 
      status: "rejected",
      vehicleNumber: "AS-03-FF-5678",
      gpsCoordinates: "26.7410° N, 94.2389° E",
      citizenMessage: "Oil spill from truck causing multiple two-wheelers to slip near the bypass curve.",
      mediaUrl: "/incident_mockup.png"
    },
    { 
      id: "REP-9799", 
      category: "Invalid Location", 
      location: "Out of Assam Boundary", 
      reporter: "Unknown User", 
      reason: "Location out of jurisdiction", 
      date: "2026-05-14 09:30 AM", 
      status: "rejected",
      vehicleNumber: "DL-03-C-9876",
      gpsCoordinates: "28.6139° N, 77.2090° E",
      citizenMessage: "Illegal street vending taking place on the main pedestrian walk near Connaught Place.",
      mediaUrl: "/incident_mockup.png"
    },
  ]);

  // Dialog State
  const [selectedReport, setSelectedReport] = useState(null);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1200);
    return () => clearTimeout(timer);
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
                  <TableHead className="w-[120px]">Report ID</TableHead>
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
                  <TableHead className="w-[120px]">Report ID</TableHead>
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
                    <TableCell className="font-mono font-semibold">{report.id}</TableCell>
                    <TableCell className="font-medium">{report.category}</TableCell>
                    <TableCell>{report.location}</TableCell>
                    <TableCell>{report.reporter}</TableCell>
                    <TableCell className="text-rose-600 dark:text-rose-400 font-semibold text-xs">{report.reason}</TableCell>
                    <TableCell className="text-muted-foreground text-xs">{report.date}</TableCell>
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
                  <span className="font-mono text-xs font-semibold text-muted-foreground">{selectedReport.id}</span>
                </div>
                <DialogTitle className="text-xl font-bold font-serif">{selectedReport.category}</DialogTitle>
                <DialogDescription>
                  Submitted by {selectedReport.reporter} • Rejected on {selectedReport.date}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 my-2">
                {/* Media Preview Container */}
                <div className="relative rounded-lg overflow-hidden border border-border/80 bg-muted">
                  <img
                    src={selectedReport.mediaUrl}
                    alt="Citizen submission proof"
                    className="w-full h-[220px] object-cover animate-pulse"
                  />
                  <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-xs text-white text-[10px] px-2 py-1 rounded flex items-center gap-1.5 font-semibold">
                    <CameraIcon className="size-3" />
                    <span>Citizen Upload</span>
                  </div>
                </div>

                {/* Structured Metadata Grid */}
                <div className="grid grid-cols-2 gap-4 text-sm bg-muted/30 p-3 rounded-lg border border-border/50">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-muted-foreground text-xs font-medium">
                      <CarIcon className="size-3.5" />
                      <span>Vehicle Number</span>
                    </div>
                    {selectedReport.vehicleNumber && selectedReport.vehicleNumber !== "N/A" ? (
                      <span className="font-mono font-bold text-xs uppercase bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-900/50 px-2 py-0.5 rounded tracking-wider">
                        {selectedReport.vehicleNumber}
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground italic font-mono">Not Applicable (N/A)</span>
                    )}
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-muted-foreground text-xs font-medium">
                      <MapPinIcon className="size-3.5" />
                      <span>GPS Coordinates</span>
                    </div>
                    <span className="font-mono text-xs font-semibold text-foreground/80 bg-background px-2 py-0.5 rounded border border-border/40">
                      {selectedReport.gpsCoordinates}
                    </span>
                  </div>
                  <div className="col-span-2 space-y-1">
                    <div className="flex items-center gap-1.5 text-muted-foreground text-xs font-medium">
                      <MapPinIcon className="size-3.5 text-rose-500" />
                      <span>Location Reference</span>
                    </div>
                    <span className="font-medium text-foreground">{selectedReport.location}</span>
                  </div>
                  <div className="col-span-2 space-y-1">
                    <div className="flex items-center gap-1.5 text-muted-foreground text-xs font-medium">
                      <AlertTriangleIcon className="size-3.5 text-rose-500" />
                      <span>Rejection Reason</span>
                    </div>
                    <span className="text-xs font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/10 border border-rose-100 dark:border-rose-900/30 px-2 py-1 rounded flex items-center gap-1.5">
                      {selectedReport.reason}
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
                      "{selectedReport.citizenMessage}"
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
