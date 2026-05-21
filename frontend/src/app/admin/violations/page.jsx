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
  AlertTriangleIcon,
  IndianRupeeIcon,
  AwardIcon 
} from "lucide-react";
import { useState, useEffect } from "react";

export default function ViolationsPage() {
  const [loading, setLoading] = useState(true);
  const [violations, setViolations] = useState([
    { id: "VIO-001", title: "Traffic Light Violation", description: "Running a red light or disobeying traffic police directions", fineAmount: 1000, rewardPoints: 50, status: "Active" },
    { id: "VIO-002", title: "Illegal Parking", description: "Parking in no-parking zones, blocking flow of traffic", fineAmount: 500, rewardPoints: 20, status: "Active" },
    { id: "VIO-003", title: "Public Nuisance", description: "Littering, public disturbance, or creating health hazards", fineAmount: 1500, rewardPoints: 75, status: "Active" },
    { id: "VIO-004", title: "Noise Pollution", description: "Using loud speakers or high-decibel horns during quiet hours", fineAmount: 2000, rewardPoints: 100, status: "Inactive" },
    { id: "VIO-005", title: "Waste Dumping", description: "Improper disposal of commercial or household trash in open areas", fineAmount: 3000, rewardPoints: 150, status: "Active" },
  ]);

  // Dialog states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isStatusConfirmOpen, setIsStatusConfirmOpen] = useState(false);
  
  const [formMode, setFormMode] = useState("create"); // 'create' | 'edit'
  const [targetViolation, setTargetViolation] = useState(null);
  const [statusTargetViolation, setStatusTargetViolation] = useState(null);
  
  // Form input states
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [fineAmount, setFineAmount] = useState("");
  const [rewardPoints, setRewardPoints] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1200);
    return () => clearTimeout(timer);
  }, []);

  const openCreateDialog = () => {
    setFormMode("create");
    setTargetViolation(null);
    setTitle("");
    setDescription("");
    setFineAmount("");
    setRewardPoints("");
    setIsFormOpen(true);
  };

  const openEditDialog = (vio) => {
    setFormMode("edit");
    setTargetViolation(vio);
    setTitle(vio.title);
    setDescription(vio.description);
    setFineAmount(vio.fineAmount.toString());
    setRewardPoints((vio.rewardPoints || 0).toString());
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

  const handleSaveViolation = (e) => {
    e.preventDefault();
    if (!title || !fineAmount || !rewardPoints) return;

    if (formMode === "create") {
      const newVio = {
        id: `VIO-0${violations.length + 1}`,
        title,
        description,
        fineAmount: parseFloat(fineAmount) || 0,
        rewardPoints: parseInt(rewardPoints) || 0,
        status: "Active"
      };
      setViolations([...violations, newVio]);
    } else {
      setViolations(
        violations.map((v) =>
          v.id === targetViolation.id
            ? { 
                ...v, 
                title, 
                description, 
                fineAmount: parseFloat(fineAmount) || 0,
                rewardPoints: parseInt(rewardPoints) || 0 
              }
            : v
        )
      );
    }
    
    setIsFormOpen(false);
    setTargetViolation(null);
  };

  const handleConfirmStatusToggle = () => {
    if (!statusTargetViolation) return;
    setViolations(
      violations.map((v) =>
        v.id === statusTargetViolation.id
          ? { ...v, status: v.status === "Active" ? "Inactive" : "Active" }
          : v
      )
    );
    setIsStatusConfirmOpen(false);
    setStatusTargetViolation(null);
  };

  const handleDeleteViolation = () => {
    if (!targetViolation) return;
    setViolations(violations.filter((v) => v.id !== targetViolation.id));
    setIsConfirmOpen(false);
    setTargetViolation(null);
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
            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Violation Master Database</h1>
            <p className="text-muted-foreground text-sm">Configure default fine amounts, reward points for reporting, and active statuses</p>
          </div>
          <Button onClick={openCreateDialog} className="w-full sm:w-auto gap-2 cursor-pointer shadow-xs">
            <PlusIcon className="size-4" />
            Add New Violation
          </Button>
        </div>

        <div className="rounded-xl border border-border bg-card shadow-xs overflow-hidden">
          {loading ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[120px]">Violation ID</TableHead>
                  <TableHead>Title & Description</TableHead>
                  <TableHead className="w-[150px]">Default Fine</TableHead>
                  <TableHead className="w-[150px]">Reward Points</TableHead>
                  <TableHead className="w-[120px]">Active Status</TableHead>
                  <TableHead className="text-right w-[180px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Array.from({ length: 4 }).map((_, rIndex) => (
                  <TableRow key={rIndex}>
                    <TableCell><Skeleton className="h-4 w-16 font-mono" /></TableCell>
                    <TableCell>
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-40" />
                        <Skeleton className="h-3 w-72" />
                      </div>
                    </TableCell>
                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-16 rounded-full" /></TableCell>
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
              <p className="text-sm font-semibold text-muted-foreground">No violations configured yet</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[120px]">Violation ID</TableHead>
                  <TableHead>Title & Description</TableHead>
                  <TableHead className="w-[150px]">Default Fine</TableHead>
                  <TableHead className="w-[150px]">Reward Points</TableHead>
                  <TableHead className="w-[120px]">Active Status</TableHead>
                  <TableHead className="text-right w-[180px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {violations.map((vio) => (
                  <TableRow key={vio.id}>
                    <TableCell className="font-mono font-semibold">{vio.id}</TableCell>
                    <TableCell>
                      <div>
                        <div className="font-bold text-sm text-foreground">{vio.title}</div>
                        <div className="text-xs text-muted-foreground mt-0.5 line-clamp-1 max-w-[400px]">{vio.description}</div>
                      </div>
                    </TableCell>
                    <TableCell className="font-semibold text-sm">
                      <div className="flex items-center gap-0.5">
                        <IndianRupeeIcon className="size-3.5 text-muted-foreground" />
                        <span>{vio.fineAmount.toLocaleString("en-IN")}</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-semibold text-sm">
                      <div className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
                        <AwardIcon className="size-4" />
                        <span>{vio.rewardPoints} Pts</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {vio.status === "Active" ? (
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
                        onClick={() => openEditDialog(vio)}
                      >
                        <EditIcon className="size-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="outline"
                        className={`size-8 cursor-pointer ${
                          vio.status === "Active" 
                            ? "text-emerald-500 hover:text-emerald-600 hover:bg-emerald-50/50" 
                            : "text-muted-foreground hover:bg-muted/50"
                        }`}
                        title={vio.status === "Active" ? "Set Inactive" : "Set Active"}
                        onClick={() => triggerStatusToggleFlow(vio)}
                      >
                        {vio.status === "Active" ? (
                          <ToggleRightIcon className="size-5" />
                        ) : (
                          <ToggleLeftIcon className="size-5" />
                        )}
                      </Button>
                      <Button
                        size="icon"
                        variant="outline"
                        className="size-8 text-rose-500 hover:text-rose-600 hover:bg-rose-50/50 cursor-pointer"
                        title="Delete Definition"
                        onClick={() => openDeleteConfirm(vio)}
                      >
                        <Trash2Icon className="size-4" />
                      </Button>
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
        <DialogContent className="sm:max-w-[450px]">
          <form onSubmit={handleSaveViolation} className="space-y-4">
            <DialogHeader>
              <DialogTitle>{formMode === "create" ? "Add Violation Master Type" : "Edit Violation Definition"}</DialogTitle>
              <DialogDescription>
                Define violation metadata, default penalty rules, and citizen reward parameters.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground">Violation Title / Category</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Speeding, Red Light Violation"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background focus:outline-hidden focus:ring-1 focus:ring-primary"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground">Detailed Description</label>
                <textarea
                  placeholder="Describe the nature of this violation context..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background focus:outline-hidden focus:ring-1 focus:ring-primary resize-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground">Default Fine (INR)</label>
                  <div className="relative flex items-center">
                    <IndianRupeeIcon className="absolute left-3 size-4 text-muted-foreground" />
                    <input
                      type="number"
                      required
                      placeholder="500"
                      value={fineAmount}
                      onChange={(e) => setFineAmount(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-border bg-background focus:outline-hidden focus:ring-1 focus:ring-primary"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground">Reward Points</label>
                  <div className="relative flex items-center">
                    <AwardIcon className="absolute left-3 size-4 text-amber-500" />
                    <input
                      type="number"
                      required
                      placeholder="50"
                      value={rewardPoints}
                      onChange={(e) => setRewardPoints(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-border bg-background focus:outline-hidden focus:ring-1 focus:ring-primary"
                    />
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)} className="cursor-pointer">
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
              <strong className="text-foreground">{targetViolation?.title}</strong>? This action is irreversible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0 mt-3">
            <Button variant="outline" onClick={() => setIsConfirmOpen(false)} className="cursor-pointer">
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteViolation} className="cursor-pointer">
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
              Are you sure you want to {statusTargetViolation?.status === "Active" ? "deactivate" : "activate"} the violation type{" "}
              <strong className="text-foreground">{statusTargetViolation?.title}</strong>?
            </DialogDescription>
          </DialogHeader>
          <div className="text-xs text-muted-foreground border-y border-border/50 py-3 my-1">
            {statusTargetViolation?.status === "Active" ? (
              <p>Citizens will no longer be able to select this violation type when submitting new incident reports.</p>
            ) : (
              <p>This violation type will be restored, allowing citizens to select it and submit reports again.</p>
            )}
          </div>
          <DialogFooter className="gap-2 sm:gap-0 mt-2">
            <Button variant="outline" onClick={() => {
              setIsStatusConfirmOpen(false);
              setStatusTargetViolation(null);
            }} className="cursor-pointer">
              Cancel
            </Button>
            <Button onClick={handleConfirmStatusToggle} className="cursor-pointer">
              Confirm Status Change
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
