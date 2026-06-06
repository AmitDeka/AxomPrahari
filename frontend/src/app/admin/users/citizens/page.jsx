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
  UsersIcon,
  CheckCircle2Icon,
  UserXIcon,
  Trash2Icon,
  AlertTriangleIcon,
  AwardIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import api from "@/lib/axios";
import { toast } from "sonner";

export default function CitizenTablePage() {
  const [loading, setLoading] = useState(true);
  const [citizens, setCitizens] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);

  // Pagination State
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Modal State
  const [dialogOpen, setDialogOpen] = useState(false);
  const [targetCitizen, setTargetCitizen] = useState(null);
  const [actionType, setActionType] = useState(null); // 'disable' | 'delete' | 'enable'

  const fetchCitizens = useCallback(async (targetPage, showLoader = false) => {
    try {
      if (showLoader) setLoading(true);
      const res = await api.get(`/admin/citizens?page=${targetPage}&limit=${limit}`);
      if (res.data?.status === "success") {
        setCitizens(res.data.data.citizens || []);
        const pagination = res.data.data.pagination;
        if (pagination) {
          setTotal(pagination.total || 0);
          setTotalPages(pagination.totalPages || 1);
        }
      }
    } catch (err) {
      console.error("Error loading citizens", err);
      toast.error("Failed to load citizens.");
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get("/admin/dashboard");
        if (res.data?.status === "success") {
          setCurrentUser(res.data.data);
        }
      } catch (err) {
        console.error("Error loading admin profile", err);
      }
    };
    setTimeout(() => {
      fetchProfile();
      fetchCitizens(1, false);
    }, 0);
  }, [fetchCitizens]);

  const handlePrevPage = () => {
    if (page > 1) {
      const prev = page - 1;
      setPage(prev);
      fetchCitizens(prev, true);
    }
  };

  const handleNextPage = () => {
    if (page < totalPages) {
      const next = page + 1;
      setPage(next);
      fetchCitizens(next, true);
    }
  };

  const openConfirmation = (citizen, type) => {
    setTargetCitizen(citizen);
    setActionType(type);
    setDialogOpen(true);
  };

  const handleConfirmAction = async () => {
    if (!targetCitizen || !actionType) return;

    try {
      if (actionType === "delete") {
        const res = await api.delete(`/admin/citizens/${targetCitizen.id}`);
        if (res.data?.status === "success") {
          toast.success("Citizen account deleted successfully.");
          setLoading(true);
          await fetchCitizens();
        }
      } else if (actionType === "disable") {
        const res = await api.patch(
          `/admin/citizens/${targetCitizen.id}/status`,
          { is_active: false },
        );
        if (res.data?.status === "success") {
          toast.success("Citizen account suspended.");
          setLoading(true);
          await fetchCitizens();
        }
      } else if (actionType === "enable") {
        const res = await api.patch(
          `/admin/citizens/${targetCitizen.id}/status`,
          { is_active: true },
        );
        if (res.data?.status === "success") {
          toast.success("Citizen account reactivated successfully.");
          setLoading(true);
          await fetchCitizens();
        }
      }
      setDialogOpen(false);
      setTargetCitizen(null);
      setActionType(null);
    } catch (err) {
      console.error("Error running administrative action on citizen", err);
      toast.error(err.response?.data?.message || "Error running action");
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
                <span className="text-muted-foreground">Users</span>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Citizen Table</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
            Registered Citizen Database
          </h1>
          <p className="text-muted-foreground text-sm">
            Monitor citizen activity, reports counts, reward system, and
            administrative privileges
          </p>
        </div>

        <div className="rounded-xl border border-border bg-card shadow-xs overflow-hidden">
          {loading ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[120px]">Citizen ID</TableHead>
                  <TableHead>Full Name</TableHead>
                  <TableHead>Email Address</TableHead>
                  <TableHead>Phone Number</TableHead>
                  <TableHead className="text-center w-[120px]">
                    Submissions
                  </TableHead>
                  <TableHead className="w-[150px]">Reward Points</TableHead>
                  <TableHead>Joined Date</TableHead>
                  <TableHead className="w-[120px]">Account Status</TableHead>
                  <TableHead className="text-right w-[150px]">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Array.from({ length: 5 }).map((_, rIndex) => (
                  <TableRow key={rIndex}>
                    <TableCell>
                      <Skeleton className="h-4 w-16 font-mono" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-28" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-32 font-mono" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-28 font-mono" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-10 mx-auto" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-16" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-24" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-5 w-16 rounded-full" />
                    </TableCell>
                    <TableCell className="text-right flex items-center justify-end gap-2 h-full py-3">
                      <Skeleton className="size-8 rounded-lg" />
                      <Skeleton className="size-8 rounded-lg" />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : citizens.length === 0 ? (
            <div className="p-12 text-center flex flex-col items-center justify-center space-y-3">
              <UsersIcon className="size-10 text-muted-foreground/60" />
              <p className="text-sm font-semibold text-muted-foreground">
                No citizens registered yet
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[120px]">Citizen ID</TableHead>
                  <TableHead>Full Name</TableHead>
                  <TableHead>Email Address</TableHead>
                  <TableHead>Phone Number</TableHead>
                  <TableHead className="text-center w-[120px]">
                    Submissions
                  </TableHead>
                  <TableHead className="w-[150px]">Reward Points</TableHead>
                  <TableHead>Joined Date</TableHead>
                  <TableHead className="w-[120px]">Account Status</TableHead>
                  <TableHead className="text-right w-[150px]">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {citizens.map((cit) => {
                  const reportsCount =
                    (cit.reports_stats?.pending || 0) +
                    (cit.reports_stats?.accepted || 0) +
                    (cit.reports_stats?.rejected || 0);
                  const joinedDate = cit.created_at
                    ? new Date(cit.created_at).toLocaleDateString(undefined, {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })
                    : "N/A";

                  return (
                    <TableRow key={cit.id}>
                      <TableCell className="font-mono font-semibold">
                        {cit.citizen_id ||
                          `CIT-${String(cit.id).padStart(4, "0")}`}
                      </TableCell>
                      <TableCell className="font-medium">
                        {cit.full_name}
                      </TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground">
                        {cit.email}
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {cit.phone_number}
                      </TableCell>
                      <TableCell className="font-bold text-center pl-4">
                        {reportsCount}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-xs font-semibold text-amber-600 dark:text-amber-400">
                          <AwardIcon className="size-4" />
                          <span>{cit.reward_points || 0} Pts</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-xs">
                        {joinedDate}
                      </TableCell>
                      <TableCell>
                        {cit.is_active ? (
                          <Badge variant="success">Active</Badge>
                        ) : (
                          <Badge variant="destructive">Disabled</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right flex items-center justify-end gap-2 h-full py-3">
                        {cit.is_active ? (
                          <Button
                            size="icon"
                            variant="outline"
                            className="size-8 text-amber-500 hover:text-amber-600 hover:bg-amber-50/50 cursor-pointer"
                            title="Disable Account"
                            onClick={() => openConfirmation(cit, "disable")}>
                            <UserXIcon className="size-4" />
                          </Button>
                        ) : (
                          <Button
                            size="icon"
                            variant="outline"
                            className="size-8 text-emerald-500 hover:text-emerald-600 hover:bg-emerald-50/50 cursor-pointer"
                            title="Enable Account"
                            onClick={() => openConfirmation(cit, "enable")}>
                            <CheckCircle2Icon className="size-4" />
                          </Button>
                        )}
                        {currentUser?.role === "super_admin" && (
                          <Button
                            size="icon"
                            variant="outline"
                            className="size-8 text-rose-500 hover:text-rose-600 hover:bg-rose-50/50 cursor-pointer"
                            title="Delete Account"
                            onClick={() => openConfirmation(cit, "delete")}>
                            <Trash2Icon className="size-4" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </div>

        {/* Pagination Section */}
        {!loading && citizens.length > 0 && (
          <div className="flex items-center justify-between border rounded-xl p-4 bg-background shadow-2xs mt-4">
            <span className="text-xs text-muted-foreground font-semibold">
              Showing page {page} of {totalPages} (Total citizens: {total})
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

      {/* Shadcn UI Modal Dialog Confirmation */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader className="flex flex-col items-center sm:items-start">
            <div className="flex size-12 items-center justify-center rounded-full bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400 mb-3">
              <AlertTriangleIcon className="size-6 animate-pulse" />
            </div>
            <DialogTitle>Confirm Administrative Action</DialogTitle>
            <DialogDescription>
              Are you sure you want to {actionType} the citizen account for{" "}
              <strong className="text-foreground">
                {targetCitizen?.full_name}
              </strong>{" "}
              ({targetCitizen?.citizen_id || targetCitizen?.id})?
            </DialogDescription>
          </DialogHeader>
          <div className="text-xs text-muted-foreground border-y border-border/50 py-3 my-1">
            {actionType === "delete" && (
              <p>
                Warning: This action is permanent. All historical activity and
                linked device logs will be unlinked.
              </p>
            )}
            {actionType === "disable" && (
              <p>
                The citizen will be temporarily blocked from submitting new
                reports or logging into the mobile application.
              </p>
            )}
            {actionType === "enable" && (
              <p>
                The citizen account will be restored to active status, allowing
                them to report incidents again.
              </p>
            )}
          </div>
          <DialogFooter className="gap-2  mt-2">
            <Button
              variant="outline"
              onClick={() => {
                setDialogOpen(false);
                setTargetCitizen(null);
                setActionType(null);
              }}
              className="cursor-pointer">
              Cancel
            </Button>
            <Button
              variant={actionType === "delete" ? "destructive" : "default"}
              onClick={handleConfirmAction}
              className="cursor-pointer">
              Confirm{" "}
              {actionType &&
                actionType.charAt(0).toUpperCase() + actionType.slice(1)}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
