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
  BookOpenIcon,
  PlusIcon,
  EditIcon,
  Trash2Icon,
  ToggleLeftIcon,
  ToggleRightIcon,
  IndianRupeeIcon,
  AwardIcon,
  AlertTriangleIcon,
} from "lucide-react";
import { useState, useEffect } from "react";
import api from "@/lib/axios";
import { toast } from "sonner";

export default function ViolationsPage() {
  const [loading, setLoading] = useState(true);
  const [violations, setViolations] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);

  // Dialog states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isStatusConfirmOpen, setIsStatusConfirmOpen] = useState(false);

  const [formMode, setFormMode] = useState("create"); // 'create' | 'edit'
  const [targetViolation, setTargetViolation] = useState(null);
  const [statusTargetViolation, setStatusTargetViolation] = useState(null);

  // Form input states
  const [offenceName, setOffenceName] = useState("");
  const [mvActCode, setMvActCode] = useState("");
  const [fineAmount, setFineAmount] = useState("");
  const [rewardPoints, setRewardPoints] = useState("");
  const [penalty, setPenalty] = useState("");
  const [description, setDescription] = useState("");
  const [evidenceRequirement, setEvidenceRequirement] = useState("");

  const fetchViolations = async () => {
    try {
      const res = await api.get("/admin/violations");
      if (res.data?.status === "success") {
        setViolations(res.data.data || []);
      }
    } catch (err) {
      console.error("Error loading violations", err);
    } finally {
      setLoading(false);
    }
  };

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
      fetchViolations();
    }, 0);
  }, []);

  const openCreateDialog = () => {
    setFormMode("create");
    setTargetViolation(null);
    setOffenceName("");
    setMvActCode("");
    setFineAmount("");
    setRewardPoints("");
    setPenalty("");
    setDescription("");
    setEvidenceRequirement("");
    setIsFormOpen(true);
  };

  const openEditDialog = (vio) => {
    setFormMode("edit");
    setTargetViolation(vio);
    setOffenceName(vio.offence_name || "");
    setMvActCode(vio.mv_act_code || "");
    setFineAmount((vio.fine_amount || 0).toString());
    setRewardPoints((vio.reward_points || 0).toString());
    setPenalty(vio.penalty || "");
    setDescription(vio.description || "");
    setEvidenceRequirement(vio.evidence_requirement || "");
    setIsFormOpen(true);
  };

  const openDeleteConfirm = (vio) => {
    setTargetViolation(vio);
    setIsConfirmOpen(true);
  };

  const triggerStatusToggleFlow = (vio) => {
    setStatusTargetViolation(vio);
    setIsStatusConfirmOpen(true);
  };

  const handleSaveViolation = async (e) => {
    e.preventDefault();

    // Trim inputs to prevent whitespace bypass
    const trimmedOffenceName = offenceName.trim();
    const trimmedMvActCode = mvActCode.trim();
    const trimmedPenalty = penalty.trim();
    const trimmedDescription = description.trim();
    const trimmedEvidenceRequirement = evidenceRequirement.trim();

    // 1. Client-side validation checks
    if (!trimmedOffenceName) {
      toast.error("Violation Title / Category is required.");
      return;
    }
    if (trimmedOffenceName.length < 3) {
      toast.error("Violation Title must be at least 3 characters.");
      return;
    }

    if (!trimmedMvActCode) {
      toast.error("MV Act Code / Section is required.");
      return;
    }
    if (trimmedMvActCode.length < 2) {
      toast.error("MV Act Code must be at least 2 characters.");
      return;
    }

    if (!trimmedPenalty) {
      toast.error("Legal Penalty Terms are required.");
      return;
    }
    if (trimmedPenalty.length < 3) {
      toast.error("Legal Penalty Terms must be at least 3 characters.");
      return;
    }

    if (!trimmedDescription) {
      toast.error("Detailed Description is required.");
      return;
    }
    if (trimmedDescription.length < 5) {
      toast.error("Detailed Description must be at least 5 characters.");
      return;
    }

    if (!trimmedEvidenceRequirement) {
      toast.error("Evidence Requirement is required.");
      return;
    }
    if (trimmedEvidenceRequirement.length < 5) {
      toast.error("Evidence Requirement must be at least 5 characters.");
      return;
    }

    const parsedFine = parseFloat(fineAmount);
    if (isNaN(parsedFine) || parsedFine <= 0) {
      toast.error("Default Fine must be a positive number.");
      return;
    }

    const parsedReward = parseInt(rewardPoints, 10);
    if (isNaN(parsedReward) || parsedReward < 0) {
      toast.error("Reward Points must be 0 or a positive integer.");
      return;
    }

    const payload = {
      offence_name: trimmedOffenceName,
      mv_act_code: trimmedMvActCode,
      fine_amount: parsedFine,
      reward_points: parsedReward,
      penalty: trimmedPenalty,
      description: trimmedDescription,
      evidence_requirement: trimmedEvidenceRequirement,
    };

    try {
      if (formMode === "create") {
        const res = await api.post("/admin/violations", payload);
        if (res.data?.status === "success") {
          toast.success("Violation definition created successfully.");
          setLoading(true);
          await fetchViolations();
        }
      } else {
        const res = await api.put(
          `/admin/violations/${targetViolation.id}`,
          payload,
        );
        if (res.data?.status === "success") {
          toast.success("Violation definition updated successfully.");
          setLoading(true);
          await fetchViolations();
        }
      }
      setIsFormOpen(false);
      setTargetViolation(null);
    } catch (err) {
      console.error("Error saving violation", err);
      
      // Parse detailed validation error messages from backend if available
      const backendErrors = err.response?.data?.errors;
      if (Array.isArray(backendErrors) && backendErrors.length > 0) {
        backendErrors.forEach((validationErr) => {
          toast.error(validationErr.message);
        });
      } else {
        const errMsg =
          err.response?.data?.message ||
          err.response?.data?.error ||
          "Error saving violation definition";
        toast.error(errMsg);
      }
    }
  };

  const handleConfirmStatusToggle = async () => {
    if (!statusTargetViolation) return;
    try {
      const newStatus = !statusTargetViolation.is_active;
      const res = await api.patch(
        `/admin/violations/${statusTargetViolation.id}/status`,
        { is_active: newStatus },
      );
      if (res.data?.status === "success") {
        toast.success(
          `Violation status updated: ${newStatus ? "Activated" : "Deactivated"}`,
        );
        setLoading(true);
        await fetchViolations();
      }
      setIsStatusConfirmOpen(false);
      setStatusTargetViolation(null);
    } catch (err) {
      console.error("Error toggling status", err);
      toast.error(err.response?.data?.message || "Error toggling status");
    }
  };

  const handleDeleteViolation = async () => {
    if (!targetViolation) return;
    try {
      const res = await api.delete(`/admin/violations/${targetViolation.id}`);
      if (res.data?.status === "success") {
        toast.success("Violation definition deleted successfully.");
        setLoading(true);
        await fetchViolations();
      }
      setIsConfirmOpen(false);
      setTargetViolation(null);
    } catch (err) {
      console.error("Error deleting violation", err);
      toast.error(err.response?.data?.message || "Error deleting violation");
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
                <span className="text-muted-foreground">Violations</span>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Violation Types</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
              Violation Master Database
            </h1>
            <p className="text-muted-foreground text-sm">
              Configure default fine amounts, reward points for reporting, and
              active statuses
            </p>
          </div>
          <Button
            onClick={openCreateDialog}
            className="w-full sm:w-auto gap-2 cursor-pointer shadow-xs">
            <PlusIcon className="size-4" />
            Add New Violation
          </Button>
        </div>

        <div className="rounded-xl border border-border bg-card shadow-xs overflow-hidden">
          {loading ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">Violation ID</TableHead>
                  <TableHead className="min-w-[220px]">Offence & Description</TableHead>
                  <TableHead className="w-[120px]">Default Fine</TableHead>
                  <TableHead className="w-[120px]">Reward Points</TableHead>
                  <TableHead className="min-w-[150px]">Legal Penalty</TableHead>
                  <TableHead className="min-w-[180px]">Evidence Required</TableHead>
                  <TableHead className="w-[100px]">Status</TableHead>
                  <TableHead className="text-right w-[150px]">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Array.from({ length: 4 }).map((_, rIndex) => (
                  <TableRow key={rIndex}>
                    <TableCell>
                      <Skeleton className="h-4 w-12 font-mono" />
                    </TableCell>
                    <TableCell>
                      <div className="space-y-2">
                        <div className="flex gap-2">
                          <Skeleton className="h-4 w-32" />
                          <Skeleton className="h-4 w-16" />
                        </div>
                        <Skeleton className="h-3 w-60" />
                      </div>
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-16" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-16" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-24" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-32" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-5 w-12 rounded-full" />
                    </TableCell>
                    <TableCell className="text-right flex items-center justify-end gap-2 h-full py-5">
                      <Skeleton className="size-8 rounded-lg" />
                      <Skeleton className="size-8 rounded-lg" />
                      <Skeleton className="size-8 rounded-lg" />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : violations.length === 0 ? (
            <div className="p-12 text-center flex flex-col items-center justify-center space-y-3">
              <BookOpenIcon className="size-10 text-muted-foreground/60" />
              <p className="text-sm font-semibold text-muted-foreground">
                No violations configured yet
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">Violation ID</TableHead>
                  <TableHead className="min-w-[220px]">Offence & Description</TableHead>
                  <TableHead className="w-[120px]">Default Fine</TableHead>
                  <TableHead className="w-[120px]">Reward Points</TableHead>
                  <TableHead className="min-w-[150px]">Legal Penalty</TableHead>
                  <TableHead className="min-w-[180px]">Evidence Required</TableHead>
                  <TableHead className="w-[100px]">Status</TableHead>
                  <TableHead className="text-right w-[150px]">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {violations.map((vio) => (
                  <TableRow key={vio.id}>
                    <TableCell className="font-mono font-semibold text-xs">
                      VIO-{String(vio.id).padStart(3, "0")}
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="font-semibold text-sm text-foreground">
                            {vio.offence_name}
                          </span>
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-medium bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200 border border-zinc-200/50 dark:border-zinc-700/50">
                            {vio.mv_act_code}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2 max-w-[300px] leading-relaxed">
                          {vio.description}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="font-semibold text-sm">
                      <div className="flex items-center gap-0.5">
                        <IndianRupeeIcon className="size-3.5 text-muted-foreground" />
                        <span>
                          {parseFloat(vio.fine_amount).toLocaleString("en-IN")}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="font-semibold text-sm">
                      <div className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
                        <AwardIcon className="size-4" />
                        <span>{vio.reward_points} Pts</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-xs text-foreground line-clamp-2 max-w-[150px] leading-relaxed font-medium">
                        {vio.penalty}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-xs text-muted-foreground line-clamp-2 max-w-[180px] leading-relaxed">
                        {vio.evidence_requirement}
                      </div>
                    </TableCell>
                    <TableCell>
                      {vio.is_active ? (
                        <Badge variant="success">Active</Badge>
                      ) : (
                        <Badge variant="outline">Inactive</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right flex items-center justify-end gap-2 h-full py-4">
                      <Button
                        size="icon"
                        variant="outline"
                        className="size-8 text-blue-500 hover:text-blue-600 hover:bg-blue-50/50 cursor-pointer"
                        title="Edit Definition"
                        onClick={() => openEditDialog(vio)}>
                        <EditIcon className="size-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="outline"
                        className={`size-8 cursor-pointer ${
                          vio.is_active
                            ? "text-emerald-500 hover:text-emerald-600 hover:bg-emerald-50/50"
                            : "text-muted-foreground hover:bg-muted/50"
                        }`}
                        title={vio.is_active ? "Set Inactive" : "Set Active"}
                        onClick={() => triggerStatusToggleFlow(vio)}>
                        {vio.is_active ? (
                          <ToggleRightIcon className="size-5" />
                        ) : (
                          <ToggleLeftIcon className="size-5" />
                        )}
                      </Button>
                      {currentUser?.role === "super_admin" && (
                        <Button
                          size="icon"
                          variant="outline"
                          className="size-8 text-rose-500 hover:text-rose-600 hover:bg-rose-50/50 cursor-pointer"
                          title="Delete Definition"
                          onClick={() => openDeleteConfirm(vio)}>
                          <Trash2Icon className="size-4" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </main>

      {/* Creation/Edition Dialog Form */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <form onSubmit={handleSaveViolation} className="space-y-4">
            <DialogHeader>
              <DialogTitle>
                {formMode === "create"
                  ? "Add Violation Master Type"
                  : "Edit Violation Definition"}
              </DialogTitle>
              <DialogDescription>
                Define violation metadata, default penalty rules, and citizen
                reward parameters.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground">
                  Violation Title / Category
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Speeding, Red Light Violation"
                  value={offenceName}
                  onChange={(e) => setOffenceName(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background text-foreground focus:outline-hidden focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground">
                    MV Act Code / Section
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Section 184"
                    value={mvActCode}
                    onChange={(e) => setMvActCode(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background text-foreground focus:outline-hidden focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground">
                    Legal Penalty Terms
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Fine up to Rs. 5000"
                    value={penalty}
                    onChange={(e) => setPenalty(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background text-foreground focus:outline-hidden focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground">
                  Detailed Description
                </label>
                <textarea
                  required
                  placeholder="Describe the nature of this violation context..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background text-foreground focus:outline-hidden focus:ring-1 focus:ring-primary resize-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground">
                  Evidence Requirement
                </label>
                <textarea
                  required
                  placeholder="e.g. Clear photo/video of vehicle and number plate..."
                  value={evidenceRequirement}
                  onChange={(e) => setEvidenceRequirement(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background text-foreground focus:outline-hidden focus:ring-1 focus:ring-primary resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground">
                    Default Fine (INR)
                  </label>
                  <div className="relative flex items-center">
                    <IndianRupeeIcon className="absolute left-3 size-4 text-muted-foreground" />
                    <input
                      type="number"
                      required
                      placeholder="500"
                      value={fineAmount}
                      onChange={(e) => setFineAmount(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-border bg-background text-foreground focus:outline-hidden focus:ring-1 focus:ring-primary"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground">
                    Reward Points
                  </label>
                  <div className="relative flex items-center">
                    <AwardIcon className="absolute left-3 size-4 text-amber-500" />
                    <input
                      type="number"
                      required
                      placeholder="50"
                      value={rewardPoints}
                      onChange={(e) => setRewardPoints(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-border bg-background text-foreground focus:outline-hidden focus:ring-1 focus:ring-primary"
                    />
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter className="gap-2 ">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsFormOpen(false)}
                className="cursor-pointer">
                Cancel
              </Button>
              <Button type="submit" className="cursor-pointer">
                Save Definition
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Deletion Confirmation Dialog */}
      <Dialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader className="flex flex-col items-center sm:items-start">
            <div className="flex size-12 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 mb-3">
              <AlertTriangleIcon className="size-6 animate-pulse" />
            </div>
            <DialogTitle>Delete Violation Definition?</DialogTitle>
            <DialogDescription>
              Are you sure you want to permanently delete the definition for{" "}
              <strong className="text-foreground">
                {targetViolation?.offence_name}
              </strong>
              ? This action is irreversible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2  mt-3">
            <Button
              variant="outline"
              onClick={() => setIsConfirmOpen(false)}
              className="cursor-pointer">
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteViolation}
              className="cursor-pointer">
              Delete Permanently
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Status Toggle Confirmation Dialog */}
      <Dialog open={isStatusConfirmOpen} onOpenChange={setIsStatusConfirmOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader className="flex flex-col items-center sm:items-start">
            <div className="flex size-12 items-center justify-center rounded-full bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400 mb-3">
              <AlertTriangleIcon className="size-6 animate-pulse" />
            </div>
            <DialogTitle>Change Violation Type Status?</DialogTitle>
            <DialogDescription>
              Are you sure you want to{" "}
              {statusTargetViolation?.is_active ? "deactivate" : "activate"} the
              violation type{" "}
              <strong className="text-foreground">
                {statusTargetViolation?.offence_name}
              </strong>
              ?
            </DialogDescription>
          </DialogHeader>
          <div className="text-xs text-muted-foreground border-y border-border/50 py-3 my-1">
            {statusTargetViolation?.is_active ? (
              <p>
                Citizens will no longer be able to select this violation type
                when submitting new incident reports.
              </p>
            ) : (
              <p>
                This violation type will be restored, allowing citizens to
                select it and submit reports again.
              </p>
            )}
          </div>
          <DialogFooter className="gap-2  mt-2">
            <Button
              variant="outline"
              onClick={() => {
                setIsStatusConfirmOpen(false);
                setStatusTargetViolation(null);
              }}
              className="cursor-pointer">
              Cancel
            </Button>
            <Button
              onClick={handleConfirmStatusToggle}
              className="cursor-pointer">
              Confirm Status Change
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
