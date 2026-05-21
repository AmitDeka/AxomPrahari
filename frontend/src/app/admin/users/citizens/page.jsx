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
import { UsersIcon, CheckCircle2Icon, UserXIcon, Trash2Icon, AlertTriangleIcon, AwardIcon } from "lucide-react";
import { useState, useEffect } from "react";

export default function CitizenTablePage() {
  const [loading, setLoading] = useState(true);
  const [citizens, setCitizens] = useState([
    { id: "CIT-0012", name: "Preeti Saikia", email: "preeti.saikia@gmail.com", phone: "+91 94350 12345", rewardPoints: 250, reportsCount: 5, status: "Active", joined: "2026-02-10" },
    { id: "CIT-0043", name: "Joydeep Sen", email: "joydeep.sen@outlook.com", phone: "+91 98640 54321", rewardPoints: 600, reportsCount: 12, status: "Active", joined: "2026-03-15" },
    { id: "CIT-0089", name: "Ratul Phukan", email: "ratul.phukan@yahoo.co.in", phone: "+91 99540 98765", rewardPoints: 150, reportsCount: 3, status: "Active", joined: "2026-04-20" },
    { id: "CIT-0105", name: "Sumit Banik", email: "sumit.banik@rediffmail.com", phone: "+91 88760 11223", rewardPoints: 400, reportsCount: 8, status: "Active", joined: "2026-05-01" },
    { id: "CIT-0122", name: "Ankur Deka", email: "ankur.deka@gmail.com", phone: "+91 70020 99887", rewardPoints: 50, reportsCount: 1, status: "Disabled", joined: "2026-05-18" },
  ]);

  // Modal State
  const [dialogOpen, setDialogOpen] = useState(false);
  const [targetCitizen, setTargetCitizen] = useState(null);
  const [actionType, setActionType] = useState(null); // 'disable' | 'delete' | 'enable'

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1200);
    return () => clearTimeout(timer);
  }, []);

  const openConfirmation = (citizen, type) => {
    setTargetCitizen(citizen);
    setActionType(type);
    setDialogOpen(true);
  };

  const handleConfirmAction = () => {
    if (!targetCitizen || !actionType) return;

    if (actionType === "delete") {
      setCitizens(citizens.filter((c) => c.id !== targetCitizen.id));
    } else if (actionType === "disable") {
      setCitizens(
        citizens.map((c) =>
          c.id === targetCitizen.id ? { ...c, status: "Disabled" } : c
        )
      );
    } else if (actionType === "enable") {
      setCitizens(
        citizens.map((c) =>
          c.id === targetCitizen.id ? { ...c, status: "Active" } : c
        )
      );
    }

    setDialogOpen(false);
    setTargetCitizen(null);
    setActionType(null);
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
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Registered Citizen Database</h1>
          <p className="text-muted-foreground text-sm">Monitor citizen activity, reports counts, reward system, and administrative privileges</p>
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
                  <TableHead className="text-center w-[120px]">Submissions</TableHead>
                  <TableHead className="w-[150px]">Reward Points</TableHead>
                  <TableHead>Joined Date</TableHead>
                  <TableHead className="w-[120px]">Account Status</TableHead>
                  <TableHead className="text-right w-[150px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Array.from({ length: 5 }).map((_, rIndex) => (
                  <TableRow key={rIndex}>
                    <TableCell><Skeleton className="h-4 w-16 font-mono" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-32 font-mono" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-28 font-mono" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-10 mx-auto" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-16 rounded-full" /></TableCell>
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
              <p className="text-sm font-semibold text-muted-foreground">No citizens registered yet</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[120px]">Citizen ID</TableHead>
                  <TableHead>Full Name</TableHead>
                  <TableHead>Email Address</TableHead>
                  <TableHead>Phone Number</TableHead>
                  <TableHead className="text-center w-[120px]">Submissions</TableHead>
                  <TableHead className="w-[150px]">Reward Points</TableHead>
                  <TableHead>Joined Date</TableHead>
                  <TableHead className="w-[120px]">Account Status</TableHead>
                  <TableHead className="text-right w-[150px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {citizens.map((cit) => (
                  <TableRow key={cit.id}>
                    <TableCell className="font-mono font-semibold">{cit.id}</TableCell>
                    <TableCell className="font-medium">{cit.name}</TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">{cit.email}</TableCell>
                    <TableCell className="font-mono text-xs">{cit.phone}</TableCell>
                    <TableCell className="font-bold text-center pl-4">{cit.reportsCount}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-xs font-semibold text-amber-600 dark:text-amber-400">
                        <AwardIcon className="size-4" />
                        <span>{cit.rewardPoints} Pts</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-xs">{cit.joined}</TableCell>
                    <TableCell>
                      {cit.status === "Active" ? (
                        <Badge variant="success">Active</Badge>
                      ) : (
                        <Badge variant="destructive">Disabled</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right flex items-center justify-end gap-2 h-full py-3">
                      {cit.status === "Active" ? (
                        <Button
                          size="icon"
                          variant="outline"
                          className="size-8 text-amber-500 hover:text-amber-600 hover:bg-amber-50/50 cursor-pointer"
                          title="Disable Account"
                          onClick={() => openConfirmation(cit, "disable")}
                        >
                          <UserXIcon className="size-4" />
                        </Button>
                      ) : (
                        <Button
                          size="icon"
                          variant="outline"
                          className="size-8 text-emerald-500 hover:text-emerald-600 hover:bg-emerald-50/50 cursor-pointer"
                          title="Enable Account"
                          onClick={() => openConfirmation(cit, "enable")}
                        >
                          <CheckCircle2Icon className="size-4" />
                        </Button>
                      )}
                      <Button
                        size="icon"
                        variant="outline"
                        className="size-8 text-rose-500 hover:text-rose-600 hover:bg-rose-50/50 cursor-pointer"
                        title="Delete Account"
                        onClick={() => openConfirmation(cit, "delete")}
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
              <strong className="text-foreground">{targetCitizen?.name}</strong> ({targetCitizen?.id})?
            </DialogDescription>
          </DialogHeader>
          <div className="text-xs text-muted-foreground border-y border-border/50 py-3 my-1">
            {actionType === "delete" && (
              <p>Warning: This action is permanent. All historical activity and linked device logs will be unlinked.</p>
            )}
            {actionType === "disable" && (
              <p>The citizen will be temporarily blocked from submitting new reports or logging into the mobile application.</p>
            )}
            {actionType === "enable" && (
              <p>The citizen account will be restored to active status, allowing them to report incidents again.</p>
            )}
          </div>
          <DialogFooter className="gap-2 sm:gap-0 mt-2">
            <Button
              variant="outline"
              onClick={() => {
                setDialogOpen(false);
                setTargetCitizen(null);
                setActionType(null);
              }}
              className="cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              variant={actionType === "delete" ? "destructive" : "default"}
              onClick={handleConfirmAction}
              className="cursor-pointer"
            >
              Confirm {actionType && actionType.charAt(0).toUpperCase() + actionType.slice(1)}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
