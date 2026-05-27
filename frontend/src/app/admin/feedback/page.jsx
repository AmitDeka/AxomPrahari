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
  MessageSquareIcon,
  EyeIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  UserIcon,
  MailIcon,
  PhoneIcon,
  CalendarIcon,
  ImageIcon,
  ExternalLinkIcon,
} from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import api from "@/lib/axios";
import { toast } from "sonner";

export default function FeedbackPage() {
  const [loading, setLoading] = useState(true);
  const [feedbacks, setFeedbacks] = useState([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedFeedback, setSelectedFeedback] = useState(null);

  const fetchFeedbacks = useCallback(async (targetPage, showLoader = false) => {
    try {
      if (showLoader) {
        setLoading(true);
      }
      const res = await api.get(`/admin/feedbacks?page=${targetPage}&limit=${limit}`);
      if (res.data?.status === "success") {
        setFeedbacks(res.data.data.feedbacks || []);
        const pagination = res.data.data.pagination;
        if (pagination) {
          setTotal(pagination.total || 0);
          setTotalPages(pagination.totalPages || 1);
        }
      }
    } catch (err) {
      console.error("Error loading feedbacks", err);
      toast.error("Failed to load citizen feedbacks.");
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    Promise.resolve().then(() => fetchFeedbacks(1, false));
  }, [fetchFeedbacks]);

  const handlePrevPage = () => {
    if (page > 1) {
      const prev = page - 1;
      setPage(prev);
      fetchFeedbacks(prev, true);
    }
  };

  const handleNextPage = () => {
    if (page < totalPages) {
      const next = page + 1;
      setPage(next);
      fetchFeedbacks(next, true);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
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
                <span className="text-muted-foreground">Feedback</span>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Citizen Feedback</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
              Citizen Feedback Portal
            </h1>
            <p className="text-muted-foreground text-sm">
              Review and manage inquiries, feature suggestions, and bug reports submitted by app users
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card shadow-xs overflow-hidden">
          {loading ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[120px]">Feedback ID</TableHead>
                  <TableHead className="w-[180px]">Submitted Date</TableHead>
                  <TableHead className="w-[140px]">Category</TableHead>
                  <TableHead className="w-[180px]">Citizen Details</TableHead>
                  <TableHead>Feedback Message</TableHead>
                  <TableHead className="w-[120px] text-center">Attachment</TableHead>
                  <TableHead className="text-right w-[120px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Array.from({ length: 4 }).map((_, rIndex) => (
                  <TableRow key={rIndex}>
                    <TableCell>
                      <Skeleton className="h-4 w-16 font-mono" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-28" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-5 w-16 rounded-full" />
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-3 w-16" />
                      </div>
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-4/5" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-5 w-12 rounded-full mx-auto" />
                    </TableCell>
                    <TableCell className="text-right flex items-center justify-end gap-2 h-full py-4">
                      <Skeleton className="size-8 rounded-lg" />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : feedbacks.length === 0 ? (
            <div className="p-12 text-center flex flex-col items-center justify-center space-y-3 min-h-[300px]">
              <MessageSquareIcon className="size-10 text-muted-foreground/60" />
              <p className="text-sm font-semibold text-muted-foreground">
                No citizen feedback received yet
              </p>
              <p className="text-xs text-muted-foreground/60 max-w-sm">
                Feedback and suggestions submitted via the mobile app will be displayed here.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[120px]">Feedback ID</TableHead>
                  <TableHead className="w-[180px]">Submitted Date</TableHead>
                  <TableHead className="w-[140px]">Category</TableHead>
                  <TableHead className="w-[180px]">Citizen Details</TableHead>
                  <TableHead>Feedback Message</TableHead>
                  <TableHead className="w-[120px] text-center">Attachment</TableHead>
                  <TableHead className="text-right w-[120px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {feedbacks.map((fb) => (
                  <TableRow key={fb.id}>
                    <TableCell className="font-mono font-semibold text-xs text-muted-foreground">
                      FB-{String(fb.id).padStart(4, "0")}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {formatDate(fb.created_at)}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-[10px] py-0 px-2 font-semibold tracking-wide uppercase bg-secondary/30">
                        {fb.feedback_category || "General"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-semibold text-sm text-foreground">
                          {fb.citizen?.name || "Citizen"}
                        </div>
                        <div className="font-mono text-[10px] text-muted-foreground mt-0.5">
                          {fb.citizen?.code || `ID-${fb.id}`}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="max-w-[300px]">
                      <p className="text-xs text-foreground line-clamp-1 leading-relaxed">
                        {fb.message}
                      </p>
                    </TableCell>
                    <TableCell className="text-center">
                      {fb.image_url ? (
                        <Badge variant="success" className="text-[10px] py-0 px-1.5 font-semibold">
                          Photo
                        </Badge>
                      ) : (
                        <span className="text-xs text-muted-foreground/50">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right flex items-center justify-end gap-2 h-full py-4">
                      <Button
                        size="icon"
                        variant="outline"
                        className="size-8 text-blue-500 hover:text-blue-600 hover:bg-blue-50/50 cursor-pointer"
                        title="View Details"
                        onClick={() => setSelectedFeedback(fb)}>
                        <EyeIcon className="size-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>

        {/* Pagination Section */}
        {!loading && feedbacks.length > 0 && (
          <div className="flex items-center justify-between border rounded-xl p-4 bg-background shadow-2xs">
            <span className="text-xs text-muted-foreground font-semibold">
              Showing page {page} of {totalPages} (Total feedbacks: {total})
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

      {/* Feedback Details Dialog Modal */}
      <Dialog
        open={selectedFeedback !== null}
        onOpenChange={(open) => !open && setSelectedFeedback(null)}>
        <DialogContent className="sm:max-w-[450px] p-6 max-h-[90vh] overflow-y-auto">
          {selectedFeedback && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-[10px] tracking-wider uppercase font-semibold bg-secondary/30">
                    {selectedFeedback.feedback_category || "General"}
                  </Badge>
                  <span className="font-mono text-xs font-semibold text-muted-foreground">
                    FB-{String(selectedFeedback.id).padStart(4, "0")}
                  </span>
                </div>
                <DialogTitle className="text-xl font-bold">
                  Citizen Feedback Details
                </DialogTitle>
                <DialogDescription>
                  Submitted on {formatDate(selectedFeedback.created_at)}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 my-2">
                {/* Reporter Profile Info */}
                <div className="space-y-2 bg-muted/40 p-3 rounded-lg border border-border/50 text-xs">
                  <div className="flex items-center gap-2 text-muted-foreground font-semibold border-b border-border/30 pb-1.5 mb-2">
                    <UserIcon className="size-3.5" />
                    <span>Citizen Profile</span>
                  </div>
                  <div className="grid grid-cols-2 gap-y-2 gap-x-4">
                    <div>
                      <div className="text-muted-foreground font-medium">Name</div>
                      <div className="font-semibold text-foreground mt-0.5">{selectedFeedback.citizen?.name || "N/A"}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground font-medium">Citizen Code</div>
                      <div className="font-mono font-semibold text-foreground mt-0.5">{selectedFeedback.citizen?.code || "N/A"}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground font-medium flex items-center gap-1">
                        <MailIcon className="size-3" />
                        <span>Email</span>
                      </div>
                      <div className="font-mono text-foreground mt-0.5 truncate" title={selectedFeedback.citizen?.email}>
                        {selectedFeedback.citizen?.email || "N/A"}
                      </div>
                    </div>
                    <div>
                      <div className="text-muted-foreground font-medium flex items-center gap-1">
                        <PhoneIcon className="size-3" />
                        <span>Phone</span>
                      </div>
                      <div className="font-mono text-foreground mt-0.5">{selectedFeedback.citizen?.phone || "N/A"}</div>
                    </div>
                  </div>
                </div>

                {/* Message Body */}
                <div className="space-y-1.5">
                  <div className="flex items-center gap-1.5 text-muted-foreground text-xs font-medium">
                    <MessageSquareIcon className="size-3.5" />
                    <span>Message</span>
                  </div>
                  <div className="bg-muted/30 border-l-2 border-primary/50 p-3 rounded-r-lg max-h-[150px] overflow-y-auto">
                    <p className="text-xs text-foreground/80 leading-relaxed font-sans whitespace-pre-wrap">
                      {selectedFeedback.message}
                    </p>
                  </div>
                </div>

                {/* Image Attachment Preview */}
                {selectedFeedback.image_url && (
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-muted-foreground text-xs font-medium">
                      <div className="flex items-center gap-1.5">
                        <ImageIcon className="size-3.5" />
                        <span>Attachment</span>
                      </div>
                      <a
                        href={selectedFeedback.image_url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[10px] text-blue-500 hover:text-blue-600 flex items-center gap-0.5 hover:underline font-semibold"
                      >
                        Open original
                        <ExternalLinkIcon className="size-2.5" />
                      </a>
                    </div>
                    <div className="relative rounded-lg overflow-hidden border border-border bg-muted flex items-center justify-center max-h-[220px]">
                      <img
                        src={selectedFeedback.image_url}
                        alt="Citizen attachment proof"
                        className="w-full max-h-[200px] object-contain rounded-md"
                      />
                    </div>
                  </div>
                )}
              </div>

              <DialogFooter className="border-t border-border/40 pt-4 mt-2">
                <Button
                  variant="outline"
                  onClick={() => setSelectedFeedback(null)}
                  className="w-full sm:w-auto cursor-pointer">
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
