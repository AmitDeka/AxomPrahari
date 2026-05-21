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
  AlertCircleIcon, 
  CheckIcon, 
  XIcon, 
  EyeIcon, 
  MapPinIcon, 
  CarIcon, 
  ClockIcon, 
  UserIcon, 
  MessageSquareIcon,
  VideoIcon,
  CameraIcon,
  ShieldCheckIcon,
  XCircleIcon,
  AlertTriangleIcon
} from "lucide-react";
import { useState, useEffect } from "react";

export default function PendingReportsPage() {
  const [loading, setLoading] = useState(true);
  const [reports, setReports] = useState([
    {
      id: "REP-9832",
      category: "Traffic Violation",
      location: "Paltan Bazaar, Guwahati",
      reporter: "Joydeep Sen",
      date: "2026-05-19 11:20 AM",
      status: "pending",
      vehicleNumber: "AS-01-EF-8821",
      gpsCoordinates: "26.1859° N, 91.7478° E",
      citizenMessage: "This vehicle has been parked in a double-line traffic lane, forcing buses to steer around it.",
      mediaUrl: "/incident_mockup.png",
      mediaType: "image"
    },
    {
      id: "REP-9830",
      category: "Public Nuisance",
      location: "Boruah Path, Jorhat",
      reporter: "Preeti Saikia",
      date: "2026-05-19 09:45 AM",
      status: "pending",
      vehicleNumber: "AS-03-K-9904",
      gpsCoordinates: "26.7509° N, 94.2037° E",
      citizenMessage: "Someone dumped commercial plastic waste bags right in front of the local drainage outlet.",
      mediaUrl: "/incident_mockup.png",
      mediaType: "image"
    },
    {
      id: "REP-9827",
      category: "Illegal Parking",
      location: "Mission Chariali, Tezpur",
      reporter: "Ratul Phukan",
      date: "2026-05-18 04:30 PM",
      status: "pending",
      vehicleNumber: "AS-12-H-4412",
      gpsCoordinates: "26.6528° N, 92.7926° E",
      citizenMessage: "Truck parked on the sidewalk blocking pedestrian access near the school crossing.",
      mediaUrl: "/incident_mockup.png",
      mediaType: "image"
    },
    {
      id: "REP-9826",
      category: "Waste Dumping",
      location: "G.S. Road, Guwahati",
      reporter: "Ankur Deka",
      date: "2026-05-18 02:15 PM",
      status: "pending",
      vehicleNumber: "N/A",
      gpsCoordinates: "26.1756° N, 91.7538° E",
      citizenMessage: "Disposing construction debris directly on the roadside during peak afternoon hours.",
      mediaUrl: "/incident_mockup.png",
      mediaType: "image"
    },
    {
      id: "REP-9822",
      category: "Noise Pollution",
      location: "Central Road, Silchar",
      reporter: "Sumit Banik",
      date: "2026-05-17 10:05 PM",
      status: "pending",
      vehicleNumber: "AS-11-AA-0987",
      gpsCoordinates: "24.8333° N, 92.8000° E",
      citizenMessage: "A commercial DJ truck is playing high-decibel music without local permission after 10 PM.",
      mediaUrl: "/incident_mockup.png",
      mediaType: "image"
    },
  ]);

  // Dialog states
  const [selectedReport, setSelectedReport] = useState(null); // Details modal
  const [confirmAcceptOpen, setConfirmAcceptOpen] = useState(false);
  const [confirmRejectOpen, setConfirmRejectOpen] = useState(false);
  const [actionTargetReport, setActionTargetReport] = useState(null);
  
  // Rejection inputs
  const [rejectionMessage, setRejectionMessage] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1200);
    return () => clearTimeout(timer);
  }, []);

  const triggerAcceptFlow = (report) => {
    setActionTargetReport(report);
    setConfirmAcceptOpen(true);
  };

  const triggerRejectFlow = (report) => {
    setActionTargetReport(report);
    setRejectionMessage("");
    setConfirmRejectOpen(true);
  };

  const handleConfirmAccept = () => {
    if (!actionTargetReport) return;
    setReports(reports.filter((rep) => rep.id !== actionTargetReport.id));
    
    // Reset states
    setConfirmAcceptOpen(false);
    setActionTargetReport(null);
    setSelectedReport(null); // close details modal too if open
  };

  const handleConfirmReject = () => {
    if (!actionTargetReport) return;
    setReports(reports.filter((rep) => rep.id !== actionTargetReport.id));
    
    // Log rejection message simulation
    if (rejectionMessage.trim()) {
      console.log(`Report ${actionTargetReport.id} rejected with reason: ${rejectionMessage}`);
    }

    // Reset states
    setConfirmRejectOpen(false);
    setActionTargetReport(null);
    setSelectedReport(null); // close details modal too if open
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
                <span className="text-muted-foreground">Reports</span>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>All Pending</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Pending Incident Reports</h1>
          <p className="text-muted-foreground text-sm">Review, approve, or reject incidents reported by citizens</p>
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
                  <TableHead>Submitted At</TableHead>
                  <TableHead className="w-[100px]">Status</TableHead>
                  <TableHead className="text-right w-[200px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Array.from({ length: 5 }).map((_, rIndex) => (
                  <TableRow key={rIndex}>
                    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-16 rounded-full" /></TableCell>
                    <TableCell className="text-right flex items-center justify-end gap-2 h-full py-3">
                      <Skeleton className="size-8 rounded-lg" />
                      <Skeleton className="size-8 rounded-lg" />
                      <Skeleton className="size-8 rounded-lg" />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : reports.length === 0 ? (
            <div className="p-12 text-center flex flex-col items-center justify-center space-y-3">
              <AlertCircleIcon className="size-10 text-muted-foreground/60" />
              <p className="text-sm font-semibold text-muted-foreground">No pending reports found</p>
              <p className="text-xs text-muted-foreground/60">Outstanding cases will appear here for validation.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[120px]">Report ID</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Reporter</TableHead>
                  <TableHead>Submitted At</TableHead>
                  <TableHead className="w-[100px]">Status</TableHead>
                  <TableHead className="text-right w-[200px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reports.map((report) => (
                  <TableRow key={report.id}>
                    <TableCell className="font-mono font-semibold">{report.id}</TableCell>
                    <TableCell className="font-medium">{report.category}</TableCell>
                    <TableCell>{report.location}</TableCell>
                    <TableCell>{report.reporter}</TableCell>
                    <TableCell className="text-muted-foreground text-xs">{report.date}</TableCell>
                    <TableCell>
                      <Badge variant="warning">Pending</Badge>
                    </TableCell>
                    <TableCell className="text-right flex items-center justify-end gap-2 h-full py-3">
                      <Button 
                        size="icon" 
                        variant="outline" 
                        className="size-8 text-blue-500 hover:text-blue-600 hover:bg-blue-50/50 cursor-pointer"
                        title="View Details"
                        onClick={() => setSelectedReport(report)}
                      >
                        <EyeIcon className="size-4" />
                      </Button>
                      <Button 
                        size="icon" 
                        variant="outline" 
                        className="size-8 text-emerald-500 hover:text-emerald-600 hover:bg-emerald-50/50 cursor-pointer"
                        title="Approve Report"
                        onClick={() => triggerAcceptFlow(report)}
                      >
                        <CheckIcon className="size-4" />
                      </Button>
                      <Button 
                        size="icon" 
                        variant="outline" 
                        className="size-8 text-rose-500 hover:text-rose-600 hover:bg-rose-50/50 cursor-pointer"
                        title="Reject Report"
                        onClick={() => triggerRejectFlow(report)}
                      >
                        <XIcon className="size-4" />
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
                  <Badge variant="warning" className="text-[10px] tracking-wider uppercase font-semibold">Pending Review</Badge>
                  <span className="font-mono text-xs font-semibold text-muted-foreground">{selectedReport.id}</span>
                </div>
                <DialogTitle className="text-xl font-bold font-serif">{selectedReport.category}</DialogTitle>
                <DialogDescription>
                  Submitted by {selectedReport.reporter} on {selectedReport.date}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 my-2">
                {/* Media Preview Container */}
                <div className="relative rounded-lg overflow-hidden border border-border/80 bg-muted">
                  <img
                    src={selectedReport.mediaUrl}
                    alt="Citizen submission proof"
                    className="w-full h-[220px] object-cover"
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
                      <span className="text-xs text-muted-foreground italic font-mono">Not Provided (N/A)</span>
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

              <DialogFooter className="gap-2 sm:gap-0 border-t border-border/40 pt-4 mt-2">
                <div className="flex w-full items-center justify-between gap-4">
                  <Button
                    variant="outline"
                    onClick={() => setSelectedReport(null)}
                    className="cursor-pointer"
                  >
                    Close
                  </Button>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      className="text-rose-500 hover:text-rose-600 hover:bg-rose-50/50 cursor-pointer gap-1.5"
                      onClick={() => triggerRejectFlow(selectedReport)}
                    >
                      <XIcon className="size-4" />
                      Reject
                    </Button>
                    <Button
                      className="bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer gap-1.5"
                      onClick={() => triggerAcceptFlow(selectedReport)}
                    >
                      <CheckIcon className="size-4" />
                      Approve
                    </Button>
                  </div>
                </div>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* APPROVAL Confirmation Dialog */}
      <Dialog open={confirmAcceptOpen} onOpenChange={setConfirmAcceptOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader className="flex flex-col items-center sm:items-start">
            <div className="flex size-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400 mb-3">
              <ShieldCheckIcon className="size-6 animate-bounce" />
            </div>
            <DialogTitle>Approve Incident Report?</DialogTitle>
            <DialogDescription>
              Are you sure you want to approve report <strong className="text-foreground">{actionTargetReport?.id}</strong>?
            </DialogDescription>
          </DialogHeader>
          <div className="text-xs text-muted-foreground border-y border-border/50 py-3 my-1 leading-relaxed">
            <p>Upon approval, the system will:</p>
            <ul className="list-disc pl-4 mt-1 space-y-1">
              <li>Automatically credit active reward points to the reporter (<span className="font-semibold text-foreground">{actionTargetReport?.reporter}</span>).</li>
              <li>Dispatch the incident coordinates to district enforcement officers for active field processing.</li>
            </ul>
          </div>
          <DialogFooter className="gap-2 sm:gap-0 mt-3">
            <Button
              variant="outline"
              onClick={() => {
                setConfirmAcceptOpen(false);
                setActionTargetReport(null);
              }}
              className="cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmAccept}
              className="bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer"
            >
              Confirm Approval
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* REJECTION Confirmation Dialog */}
      <Dialog open={confirmRejectOpen} onOpenChange={setConfirmRejectOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader className="flex flex-col items-center sm:items-start">
            <div className="flex size-12 items-center justify-center rounded-full bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400 mb-3">
              <XCircleIcon className="size-6 animate-pulse" />
            </div>
            <DialogTitle>Reject Incident Report?</DialogTitle>
            <DialogDescription>
              You are about to reject and dismiss report <strong className="text-foreground">{actionTargetReport?.id}</strong>.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-3 py-2">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground">Reason for Rejection (Optional)</label>
              <textarea
                placeholder="e.g. Duplicate submission, image too blurry, license plate unreadable..."
                value={rejectionMessage}
                onChange={(e) => setRejectionMessage(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-background focus:outline-hidden focus:ring-1 focus:ring-primary resize-none font-sans"
              />
            </div>
            <p className="text-[10px] text-muted-foreground bg-rose-50/50 dark:bg-rose-950/10 border border-rose-100/50 dark:border-rose-900/20 p-2 rounded">
              Note: This explanation will be shared with the citizen who reported this incident to help improve submission quality.
            </p>
          </div>

          <DialogFooter className="gap-2 sm:gap-0 mt-2">
            <Button
              variant="outline"
              onClick={() => {
                setConfirmRejectOpen(false);
                setActionTargetReport(null);
                setRejectionMessage("");
              }}
              className="cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmReject}
              className="cursor-pointer"
            >
              Confirm Rejection
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
