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
  AlertTriangleIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "lucide-react";
import { useState, useEffect } from "react";
import api from "@/lib/axios";
import Image from "next/image";
import { toast } from "sonner";

const isVideoFile = (url) => {
  if (!url) return false;
  const cleanUrl = url.split("?")[0];
  return /\.(mp4|mov|webm|ogg|m4v)$/i.test(cleanUrl);
};

export default function PendingReportsPage() {
  const [loading, setLoading] = useState(true);
  const [reports, setReports] = useState([]);

  // Pagination State
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Dialog states
  const [selectedReport, setSelectedReport] = useState(null); // Details modal
  const [confirmAcceptOpen, setConfirmAcceptOpen] = useState(false);
  const [confirmRejectOpen, setConfirmRejectOpen] = useState(false);
  const [actionTargetReport, setActionTargetReport] = useState(null);

  // Rejection inputs
  const [rejectionMessage, setRejectionMessage] = useState("");

  const fetchReports = async (targetPage, showLoader = false) => {
    try {
      if (showLoader) setLoading(true);
      const res = await api.get(`/admin/reports?status=pending&page=${targetPage}&limit=${limit}`);
      if (res.data?.status === "success") {
        setReports(res.data.data.reports || []);
        const pagination = res.data.data.pagination;
        if (pagination) {
          setTotal(pagination.total || 0);
          setTotalPages(pagination.totalPages || 1);
        }
      }
    } catch (err) {
      console.error("Error loading pending reports", err);
      toast.error("Failed to load reports.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setTimeout(() => {
      fetchReports(1, false);
    }, 0);
  }, []);

  const handlePrevPage = () => {
    if (page > 1) {
      const prev = page - 1;
      setPage(prev);
      fetchReports(prev, true);
    }
  };

  const handleNextPage = () => {
    if (page < totalPages) {
      const next = page + 1;
      setPage(next);
      fetchReports(next, true);
    }
  };

  const triggerAcceptFlow = (report) => {
    setActionTargetReport(report);
    setConfirmAcceptOpen(true);
  };

  const triggerRejectFlow = (report) => {
    setActionTargetReport(report);
    setRejectionMessage("");
    setConfirmRejectOpen(true);
  };

  const handleConfirmAccept = async () => {
    if (!actionTargetReport) return;
    try {
      const res = await api.patch(
        `/admin/reports/${actionTargetReport.id}/review`,
        {
          status: "accepted",
        },
      );
      if (res.data?.status === "success") {
        toast.success(
          `Report ${actionTargetReport.report_id} approved successfully!`,
        );
        setLoading(true);
        await fetchReports(page, false);
      }
      setConfirmAcceptOpen(false);
      setActionTargetReport(null);
      setSelectedReport(null);
    } catch (err) {
      console.error("Error approving report", err);
      toast.error(err.response?.data?.message || "Error approving report");
    }
  };

  const handleConfirmReject = async () => {
    if (!actionTargetReport) return;
    try {
      const res = await api.patch(
        `/admin/reports/${actionTargetReport.id}/review`,
        {
          status: "rejected",
          admin_message: rejectionMessage.trim() || undefined,
        },
      );
      if (res.data?.status === "success") {
        toast.success(
          `Report ${actionTargetReport.report_id} rejected successfully.`,
        );
        setLoading(true);
        await fetchReports(page, false);
      }
      setConfirmRejectOpen(false);
      setActionTargetReport(null);
      setSelectedReport(null);
    } catch (err) {
      console.error("Error rejecting report", err);
      toast.error(err.response?.data?.message || "Error rejecting report");
    }
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
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
            Pending Incident Reports
          </h1>
          <p className="text-muted-foreground text-sm">
            Review, approve, or reject incidents reported by citizens
          </p>
        </div>

        <div className="rounded-xl border border-border bg-card shadow-xs overflow-hidden">
          {loading ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-30">Report ID</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Reporter</TableHead>
                  <TableHead>Submitted At</TableHead>
                  <TableHead className="w-25">Status</TableHead>
                  <TableHead className="text-right w-50">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Array.from({ length: 5 }).map((_, rIndex) => (
                  <TableRow key={rIndex}>
                    <TableCell>
                      <Skeleton className="h-4 w-16" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-28" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-40" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-24" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-32" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-5 w-16 rounded-full" />
                    </TableCell>
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
              <p className="text-sm font-semibold text-muted-foreground">
                No pending reports found
              </p>
              <p className="text-xs text-muted-foreground/60">
                Outstanding cases will appear here for validation.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-37.5">Report ID</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Reporter</TableHead>
                  <TableHead>Submitted At</TableHead>
                  <TableHead className="w-25">Status</TableHead>
                  <TableHead className="text-right w-50">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reports.map((report) => (
                  <TableRow key={report.id}>
                    <TableCell className="font-mono font-semibold">
                      {report.report_id}
                    </TableCell>
                    <TableCell className="font-medium">
                      {report.offence_name}
                    </TableCell>
                    <TableCell className="truncate max-w-50">
                      {report.location_name}
                    </TableCell>
                    <TableCell>{report.citizen_name || "Citizen"}</TableCell>
                    <TableCell className="text-muted-foreground text-xs">
                      {new Date(report.created_at).toLocaleString(undefined, {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </TableCell>
                    <TableCell>
                      <Badge variant="warning">Pending</Badge>
                    </TableCell>
                    <TableCell className="text-right flex items-center justify-end gap-2 h-full py-3">
                      <Button
                        size="icon"
                        variant="outline"
                        className="size-8 text-blue-500 hover:text-blue-600 hover:bg-blue-50/50 cursor-pointer"
                        title="View Details"
                        onClick={() => setSelectedReport(report)}>
                        <EyeIcon className="size-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="outline"
                        className="size-8 text-emerald-500 hover:text-emerald-600 hover:bg-emerald-50/50 cursor-pointer"
                        title="Approve Report"
                        onClick={() => triggerAcceptFlow(report)}>
                        <CheckIcon className="size-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="outline"
                        className="size-8 text-rose-500 hover:text-rose-600 hover:bg-rose-50/50 cursor-pointer"
                        title="Reject Report"
                        onClick={() => triggerRejectFlow(report)}>
                        <XIcon className="size-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>

        {/* Pagination Section */}
        {!loading && reports.length > 0 && (
          <div className="flex items-center justify-between border rounded-xl p-4 bg-background shadow-2xs mt-4">
            <span className="text-xs text-muted-foreground font-semibold">
              Showing page {page} of {totalPages} (Total reports: {total})
            </span>
            <div className="flex items-center gap-2">
              <Button
                onClick={handlePrevPage}
                disabled={page === 1 || loading}
                variant="outline"
                size="sm"
                className="h-8 border-border text-foreground text-xs font-medium cursor-pointer"
              >
                <ChevronLeftIcon className="h-4 w-4 mr-1" />
                Previous
              </Button>
              <Button
                onClick={handleNextPage}
                disabled={page === totalPages || loading}
                variant="outline"
                size="sm"
                className="h-8 border-border text-foreground text-xs font-medium cursor-pointer"
              >
                Next
                <ChevronRightIcon className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </main>

      {/* Incident Details Dialog Modal */}
      <Dialog
        open={selectedReport !== null}
        onOpenChange={(open) => !open && setSelectedReport(null)}>
        <DialogContent className="sm:max-w-137.5] p-6 max-h-[90vh] overflow-y-auto">
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

              <DialogFooter className="gap-2  border-t border-border/40 pt-4 mt-2">
                <div className="flex w-full items-center justify-between gap-4">
                  <Button
                    variant="outline"
                    onClick={() => setSelectedReport(null)}
                    className="cursor-pointer">
                    Close
                  </Button>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      className="text-rose-500 hover:text-rose-600 hover:bg-rose-50/50 cursor-pointer gap-1.5"
                      onClick={() => triggerRejectFlow(selectedReport)}>
                      <XIcon className="size-4" />
                      Reject
                    </Button>
                    <Button
                      className="bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer gap-1.5"
                      onClick={() => triggerAcceptFlow(selectedReport)}>
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
              Are you sure you want to approve report{" "}
              <strong className="text-foreground">
                {actionTargetReport?.report_id}
              </strong>
              ?
            </DialogDescription>
          </DialogHeader>
          <div className="text-xs text-muted-foreground border-y border-border/50 py-3 my-1 leading-relaxed">
            <p>Upon approval, the system will:</p>
            <ul className="list-disc pl-4 mt-1 space-y-1">
              <li>
                Automatically credit active reward points to the reporter (
                <span className="font-semibold text-foreground">
                  {actionTargetReport?.citizen_name || "Citizen"}
                </span>
                ).
              </li>
              <li>
                Dispatch the incident coordinates to district enforcement
                officers for active field processing.
              </li>
            </ul>
          </div>
          <DialogFooter className="gap-2  mt-3">
            <Button
              variant="outline"
              onClick={() => {
                setConfirmAcceptOpen(false);
                setActionTargetReport(null);
              }}
              className="cursor-pointer">
              Cancel
            </Button>
            <Button
              onClick={handleConfirmAccept}
              className="bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer">
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
              You are about to reject and dismiss report{" "}
              <strong className="text-foreground">
                {actionTargetReport?.report_id}
              </strong>
              .
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground">
                Reason for Rejection (Optional)
              </label>
              <textarea
                placeholder="e.g. Duplicate submission, image too blurry, license plate unreadable..."
                value={rejectionMessage}
                onChange={(e) => setRejectionMessage(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-background text-foreground focus:outline-hidden focus:ring-1 focus:ring-primary resize-none font-sans"
              />
            </div>
            <p className="text-[10px] text-muted-foreground bg-rose-50/50 dark:bg-rose-950/10 border border-rose-100/50 dark:border-rose-900/20 p-2 rounded">
              Note: This explanation will be shared with the citizen who
              reported this incident to help improve submission quality.
            </p>
          </div>

          <DialogFooter className="gap-2  mt-2">
            <Button
              variant="outline"
              onClick={() => {
                setConfirmRejectOpen(false);
                setActionTargetReport(null);
                setRejectionMessage("");
              }}
              className="cursor-pointer">
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmReject}
              className="cursor-pointer">
              Confirm Rejection
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
