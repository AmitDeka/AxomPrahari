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
  ShieldAlertIcon,
  ShieldIcon,
  EditIcon,
  Trash2Icon,
  UserXIcon,
  UserCheckIcon,
  AlertTriangleIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import api from "@/lib/axios";
import ComboboxWithStates from "@/components/ui/combobox-with-states";
// import { ComboboxWithStates } from "@/components/ui/combobox-with-states";
import { toast } from "sonner";

export default function PoliceAdminPage() {
  const [loading, setLoading] = useState(true);
  const [officers, setOfficers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);

  // Pagination State
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Dialog States
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isStatusOpen, setIsStatusOpen] = useState(false);

  const [targetOfficer, setTargetOfficer] = useState(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [rank, setRank] = useState("");
  const [jurisdictionDistrict, setJurisdictionDistrict] = useState("");
  const [password, setPassword] = useState("");

  const fetchOfficers = useCallback(async (targetPage = 1, showLoader = false) => {
    try {
      if (showLoader) setLoading(true);
      const res = await api.get(`/admin/list?role=police_admin&page=${targetPage}&limit=${limit}`);
      if (res.data?.status === "success") {
        setOfficers(res.data.data.admins || []);
        const pagination = res.data.data.pagination;
        if (pagination) {
          setTotal(pagination.total || 0);
          setTotalPages(pagination.totalPages || 1);
        }
      }
    } catch (err) {
      console.error("Error fetching officers list", err);
      toast.error("Failed to load police administrators.");
    } finally {
      setLoading(false);
    }
  }, [limit]);

  const handlePrevPage = () => {
    if (page > 1) {
      const prev = page - 1;
      setPage(prev);
      fetchOfficers(prev, true);
    }
  };

  const handleNextPage = () => {
    if (page < totalPages) {
      const next = page + 1;
      setPage(next);
      fetchOfficers(next, true);
    }
  };

  useEffect(() => {
    // Get logged-in user profile
    api
      .get("/admin/dashboard")
      .then((res) => {
        if (res.data?.status === "success") {
          setCurrentUser(res.data.data);
        }
      })
      .catch((err) => console.error("Error fetching current user", err));

    setTimeout(() => {
      fetchOfficers(1, false);
    }, 0);
  }, [fetchOfficers]);

  const openEditDialog = (off) => {
    setTargetOfficer(off);
    setName(off.full_name || "");
    setEmail(off.email || "");
    setRank(off.rank || "");
    setJurisdictionDistrict(off.jurisdiction_district || "");
    setPassword("");
    setIsFormOpen(true);
  };

  const openDeleteConfirm = (off) => {
    if (off.id === currentUser?.id) {
      toast.error("Action Denied: You cannot delete yourself.");
      setIsConfirmOpen(false);
      return;
    }
    setTargetOfficer(off);
    setIsConfirmOpen(true);
  };

  const openStatusConfirm = (off) => {
    if (off.id === currentUser?.id) {
      toast.error("Action Denied: You cannot disable yourself.");
      setIsStatusOpen(false);
      return;
    }
    setTargetOfficer(off);
    setIsStatusOpen(true);
  };

  const handleSaveOfficer = async (e) => {
    e.preventDefault();
    if (!name || !email || !rank || !jurisdictionDistrict) {
      toast.error("Validation Error: Please fill in all required fields.");
      return;
    }

    try {
      const payload = {
        full_name: name,
        email,
        rank,
        jurisdiction_district: jurisdictionDistrict,
      };

      if (password) {
        payload.password = password;
      }

      const res = await api.put(`/admin/${targetOfficer.id}`, payload);

      if (res.data?.status === "success") {
        if (targetOfficer.id === currentUser?.id && password) {
          toast.success(
            "Password Changed: Your password has been changed. Logging you out...",
          );
          setTimeout(() => {
            localStorage.removeItem("admin_token");
            window.location.href = "/login";
          }, 2000);
          return;
        }

        if (targetOfficer.id === currentUser?.id) {
          toast.success("Profile updated successfully. Reloading...");
          setTimeout(() => {
            window.location.reload();
          }, 1500);
          return;
        }

        toast.success("Officer profile updated successfully.");
        setIsFormOpen(false);
        setTargetOfficer(null);
        setLoading(true);
        fetchOfficers(page, true);
      }
    } catch (err) {
      console.error("Error saving officer", err);
      toast.error(
        "Update Failed: " +
          (err.response?.data?.error ||
            err.response?.data?.message ||
            "Failed to update officer."),
      );
    }
  };

  const handleToggleStatus = async () => {
    if (!targetOfficer) return;

    if (targetOfficer.id === currentUser?.id) {
      toast.error("Action Denied: You cannot disable yourself!");
      setIsStatusOpen(false);
      setTargetOfficer(null);
      return;
    }

    try {
      const res = await api.patch(`/admin/${targetOfficer.id}/status`, {
        is_active: !targetOfficer.is_active,
      });

      if (res.data?.status === "success") {
        toast.success(
          `Officer account successfully ${targetOfficer.is_active ? "suspended" : "reactivated"}.`,
        );
        setIsStatusOpen(false);
        setTargetOfficer(null);
        setLoading(true);
        fetchOfficers(page, true);
      }
    } catch (err) {
      console.error("Error toggling status", err);
      toast.error(
        "Status Update Failed: " +
          (err.response?.data?.error ||
            err.response?.data?.message ||
            "Failed to toggle status."),
      );
      setIsStatusOpen(false);
      setTargetOfficer(null);
    }
  };

  const handleDeleteOfficer = async () => {
    if (!targetOfficer) return;

    if (targetOfficer.id === currentUser?.id) {
      toast.error("Action Denied: You cannot delete yourself!");
      setIsConfirmOpen(false);
      setTargetOfficer(null);
      return;
    }

    try {
      const res = await api.delete(`/admin/${targetOfficer.id}`);

      if (res.data?.status === "success") {
        toast.success("Officer profile permanently deleted.");
        setIsConfirmOpen(false);
        setTargetOfficer(null);
        setLoading(true);
        const isLastItem = officers.length === 1;
        const targetPage = isLastItem && page > 1 ? page - 1 : page;
        if (isLastItem && page > 1) {
          setPage(targetPage);
        }
        fetchOfficers(targetPage, true);
      }
    } catch (err) {
      console.error("Error deleting officer", err);
      toast.error(
        "Deletion Failed: " +
          (err.response?.data?.error ||
            err.response?.data?.message ||
            "Failed to delete officer."),
      );
      setIsConfirmOpen(false);
      setTargetOfficer(null);
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
                <span className="text-muted-foreground">Admins</span>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Police Admin</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
            Police Administrators
          </h1>
          <p className="text-muted-foreground text-sm">
            District superintendents, investigators, and local station officers
          </p>
        </div>

        <div className="rounded-xl border border-border bg-card shadow-xs overflow-hidden">
          {loading ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[120px]">Officer ID</TableHead>
                  <TableHead>Officer Name</TableHead>
                  <TableHead>Email Address</TableHead>
                  <TableHead>Rank</TableHead>
                  <TableHead className="w-[180px]">
                    District Jurisdiction
                  </TableHead>
                  <TableHead className="w-[120px]">Status</TableHead>
                  <TableHead className="text-right w-[150px]">
                    Actions
                  </TableHead>
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
                      <Skeleton className="h-4 w-32 font-mono" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-24" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-28" />
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
          ) : officers.length === 0 ? (
            <div className="p-12 text-center flex flex-col items-center justify-center space-y-3">
              <ShieldAlertIcon className="size-10 text-muted-foreground/60" />
              <p className="text-sm font-semibold text-muted-foreground">
                No police administrators registered
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[120px]">Officer ID</TableHead>
                  <TableHead>Officer Name</TableHead>
                  <TableHead>Email Address</TableHead>
                  <TableHead>Rank</TableHead>
                  <TableHead className="w-[180px]">
                    District Jurisdiction
                  </TableHead>
                  <TableHead className="w-[120px]">Status</TableHead>
                  <TableHead className="text-right w-[150px]">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {officers.map((off) => {
                  const isSelf = off.id === currentUser?.id;

                  return (
                    <TableRow key={off.id}>
                      <TableCell className="font-mono font-semibold">
                        ADM-{String(off.id).padStart(4, "0")}
                      </TableCell>
                      <TableCell className="font-medium">
                        {off.full_name}{" "}
                        {isSelf && (
                          <span className="text-[10px] bg-zinc-800 text-zinc-400 px-1.5 py-0.5 rounded ml-1 font-semibold uppercase">
                            You
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {off.email}
                      </TableCell>
                      <TableCell className="text-xs font-semibold text-zinc-300">
                        {off.rank || "N/A"}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5 text-muted-foreground font-semibold text-xs">
                          <ShieldIcon className="size-4 text-emerald-500" />
                          <span className="text-foreground/80">
                            {off.jurisdiction_district || "N/A"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {off.is_active ? (
                          <Badge variant="success">Active</Badge>
                        ) : (
                          <Badge variant="destructive">Suspended</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right flex items-center justify-end gap-2 h-full py-3">
                        <Button
                          size="icon"
                          variant="outline"
                          className="size-8 text-blue-500 hover:text-blue-600 hover:bg-blue-50/50 cursor-pointer"
                          title="Edit Officer Profile"
                          onClick={() => openEditDialog(off)}>
                          <EditIcon className="size-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="outline"
                          className={`size-8 cursor-pointer ${
                            off.is_active
                              ? "text-amber-500 hover:text-amber-600 hover:bg-amber-50/50"
                              : "text-emerald-500 hover:text-emerald-600 hover:bg-emerald-50/50"
                          }`}
                          title={
                            off.is_active
                              ? "Suspend Officer"
                              : "Reactivate Officer"
                          }
                          onClick={() => openStatusConfirm(off)}>
                          {off.is_active ? (
                            <UserXIcon className="size-4" />
                          ) : (
                            <UserCheckIcon className="size-4" />
                          )}
                        </Button>
                        <Button
                          size="icon"
                          variant="outline"
                          className="size-8 text-rose-500 hover:text-rose-600 hover:bg-rose-50/50 cursor-pointer"
                          title="Delete Officer"
                          onClick={() => openDeleteConfirm(off)}>
                          <Trash2Icon className="size-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </div>

        {/* Pagination Section */}
        {!loading && officers.length > 0 && (
          <div className="flex items-center justify-between border rounded-xl p-4 bg-background shadow-2xs mt-4">
            <span className="text-xs text-muted-foreground font-semibold">
              Showing page {page} of {totalPages} (Total police admins: {total})
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

      {/* Edit Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-112.5">
          <form onSubmit={handleSaveOfficer} className="space-y-4">
            <DialogHeader>
              <DialogTitle>Edit Officer Profile</DialogTitle>
              <DialogDescription>
                Modify police department personnel information and jurisdiction
                rules.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground">
                  Officer Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background text-foreground focus:outline-hidden focus:ring-1 focus:ring-primary"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background text-foreground focus:outline-hidden focus:ring-1 focus:ring-primary"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground">
                  Officer Rank / Designation
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Superintendent of Police (SP)"
                  value={rank}
                  onChange={(e) => setRank(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background text-foreground focus:outline-hidden focus:ring-1 focus:ring-primary"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground">
                  District Jurisdiction
                </label>
                <ComboboxWithStates
                  value={jurisdictionDistrict}
                  onChange={(val) => setJurisdictionDistrict(val)}
                  placeholder="Select Assam district..."
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground">
                  Reset Password (Optional)
                </label>
                <input
                  type="password"
                  placeholder="Enter new password to reset"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background text-foreground focus:outline-hidden focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>
            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsFormOpen(false)}
                className="cursor-pointer">
                Cancel
              </Button>
              <Button
                type="submit"
                className="cursor-pointer bg-primary text-primary-foreground hover:bg-primary/95">
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Suspend/Reactivate Confirmation Dialog */}
      <Dialog open={isStatusOpen} onOpenChange={setIsStatusOpen}>
        <DialogContent className="sm:max-w-100">
          <DialogHeader className="flex flex-col items-center sm:items-start">
            <div className="flex size-12 items-center justify-center rounded-full bg-amber-100 text-amber-500 border border-amber-900/30 mb-3">
              <AlertTriangleIcon className="size-6 animate-pulse" />
            </div>
            <DialogTitle>
              {targetOfficer?.is_active
                ? "Suspend Officer Account?"
                : "Reactivate Officer Account?"}
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to{" "}
              {targetOfficer?.is_active ? "suspend" : "reactivate"} access for{" "}
              <strong className="text-foreground">
                {targetOfficer?.full_name}
              </strong>
              ?
            </DialogDescription>
          </DialogHeader>
          <div className="text-xs text-muted-foreground border-y border-border py-3 my-1">
            {targetOfficer?.is_active ? (
              <p>
                The officer will lose all system review access. They cannot
                access reports from their assigned district:{" "}
                {targetOfficer?.jurisdiction_district}.
              </p>
            ) : (
              <p>
                The officer account will be restored to active status,
                recovering their regional dispatch capabilities.
              </p>
            )}
          </div>
          <DialogFooter className="gap-2 mt-2">
            <Button
              variant="outline"
              onClick={() => setIsStatusOpen(false)}
              className="cursor-pointer">
              Cancel
            </Button>
            <Button
              variant={targetOfficer?.is_active ? "destructive" : "default"}
              onClick={handleToggleStatus}
              className="cursor-pointer">
              Confirm {targetOfficer?.is_active ? "Suspension" : "Activation"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <DialogContent className="sm:max-w-100">
          <DialogHeader className="flex flex-col items-center sm:items-start">
            <div className="flex size-12 items-center justify-center rounded-full bg-red-100 text-red-500 border border-red-900/30 mb-3">
              <AlertTriangleIcon className="size-6 animate-pulse" />
            </div>
            <DialogTitle>Delete Police Officer?</DialogTitle>
            <DialogDescription>
              Are you sure you want to permanently delete the profile for{" "}
              <strong className="text-foreground">
                {targetOfficer?.full_name}
              </strong>
              ? All link associations with{" "}
              {targetOfficer?.jurisdiction_district} will be broken.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 mt-3">
            <Button
              variant="outline"
              onClick={() => setIsConfirmOpen(false)}
              className="cursor-pointer">
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteOfficer}
              className="cursor-pointer">
              Delete Permanently
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
