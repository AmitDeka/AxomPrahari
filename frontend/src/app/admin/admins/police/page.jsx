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
  AlertTriangleIcon 
} from "lucide-react";
import { useState, useEffect } from "react";

export default function PoliceAdminPage() {
  const [loading, setLoading] = useState(true);
  const [officers, setOfficers] = useState([
    { id: "POL-2901", name: "SP Ramesh Baruah", email: "sp.jorhat@axomprahari.gov.in", location: "Jorhat District", status: "Active" },
    { id: "POL-3104", name: "DSP Pranjal Phukan", email: "dsp.ops@axomprahari.gov.in", location: "Kamrup Metropolitan", status: "Active" },
    { id: "POL-0982", name: "Inspector Hitesh Das", email: "hitesh.das@axomprahari.gov.in", location: "Tezpur Subdivision", status: "Active" },
    { id: "POL-1122", name: "SI Tarun Deb", email: "tarun.deb@axomprahari.gov.in", location: "Silchar Sadar", status: "Active" },
  ]);

  // Dialog States
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isStatusOpen, setIsStatusOpen] = useState(false);

  const [targetOfficer, setTargetOfficer] = useState(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [location, setLocation] = useState("");
  const [password, setPassword] = useState("");

  const districts = ["Kamrup Metropolitan", "Jorhat District", "Dibrugarh District", "Cachar District", "Tezpur Subdivision", "Silchar Sadar"];

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1200);
    return () => clearTimeout(timer);
  }, []);

  const openEditDialog = (off) => {
    setTargetOfficer(off);
    setName(off.name);
    setEmail(off.email);
    setLocation(off.location);
    setPassword("");
    setIsFormOpen(true);
  };

  const openDeleteConfirm = (off) => {
    setTargetOfficer(off);
    setIsConfirmOpen(true);
  };

  const openStatusConfirm = (off) => {
    setTargetOfficer(off);
    setIsStatusOpen(true);
  };

  const handleSaveOfficer = (e) => {
    e.preventDefault();
    if (!name || !email || !location) return;

    setOfficers(
      officers.map((o) =>
        o.id === targetOfficer.id ? { ...o, name, email, location } : o
      )
    );
    setIsFormOpen(false);
    setTargetOfficer(null);
  };

  const handleToggleStatus = () => {
    if (!targetOfficer) return;
    setOfficers(
      officers.map((o) =>
        o.id === targetOfficer.id
          ? { ...o, status: o.status === "Active" ? "Suspended" : "Active" }
          : o
      )
    );
    setIsStatusOpen(false);
    setTargetOfficer(null);
  };

  const handleDeleteOfficer = () => {
    if (!targetOfficer) return;
    setOfficers(officers.filter((o) => o.id !== targetOfficer.id));
    setIsConfirmOpen(false);
    setTargetOfficer(null);
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
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Police Administrators</h1>
          <p className="text-muted-foreground text-sm">District superintendents, investigators, and local station officers</p>
        </div>

        <div className="rounded-xl border border-border bg-card shadow-xs overflow-hidden">
          {loading ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[120px]">Officer ID</TableHead>
                  <TableHead>Officer Name</TableHead>
                  <TableHead>Email Address</TableHead>
                  <TableHead className="w-[180px]">District Jurisdiction</TableHead>
                  <TableHead className="w-[120px]">Status</TableHead>
                  <TableHead className="text-right w-[150px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Array.from({ length: 4 }).map((_, rIndex) => (
                  <TableRow key={rIndex}>
                    <TableCell><Skeleton className="h-4 w-16 font-mono" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-32 font-mono" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-28" /></TableCell>
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
          ) : officers.length === 0 ? (
            <div className="p-12 text-center flex flex-col items-center justify-center space-y-3">
              <ShieldAlertIcon className="size-10 text-muted-foreground/60" />
              <p className="text-sm font-semibold text-muted-foreground">No police administrators registered</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[120px]">Officer ID</TableHead>
                  <TableHead>Officer Name</TableHead>
                  <TableHead>Email Address</TableHead>
                  <TableHead className="w-[180px]">District Jurisdiction</TableHead>
                  <TableHead className="w-[120px]">Status</TableHead>
                  <TableHead className="text-right w-[150px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {officers.map((off) => (
                  <TableRow key={off.id}>
                    <TableCell className="font-mono font-semibold">{off.id}</TableCell>
                    <TableCell className="font-medium">{off.name}</TableCell>
                    <TableCell className="font-mono text-xs">{off.email}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5 text-muted-foreground font-semibold text-xs">
                        <ShieldIcon className="size-4 text-emerald-500" />
                        <span className="text-foreground/80">{off.location}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {off.status === "Active" ? (
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
                        onClick={() => openEditDialog(off)}
                      >
                        <EditIcon className="size-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="outline"
                        className={`size-8 cursor-pointer ${
                          off.status === "Active"
                            ? "text-amber-500 hover:text-amber-600 hover:bg-amber-50/50"
                            : "text-emerald-500 hover:text-emerald-600 hover:bg-emerald-50/50"
                        }`}
                        title={off.status === "Active" ? "Suspend Officer" : "Reactivate Officer"}
                        onClick={() => openStatusConfirm(off)}
                      >
                        {off.status === "Active" ? (
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
                        onClick={() => openDeleteConfirm(off)}
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

      {/* Edit Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[450px]">
          <form onSubmit={handleSaveOfficer} className="space-y-4">
            <DialogHeader>
              <DialogTitle>Edit Officer Profile</DialogTitle>
              <DialogDescription>
                Modify police department personnel information and jurisdiction rules.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground">Officer Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background focus:outline-hidden focus:ring-1 focus:ring-primary"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground">Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background focus:outline-hidden focus:ring-1 focus:ring-primary"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground">District Jurisdiction</label>
                <select
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background focus:outline-hidden focus:ring-1 focus:ring-primary font-medium text-foreground"
                >
                  {districts.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground">Reset Password (Optional)</label>
                <input
                  type="password"
                  placeholder="Enter new password to reset"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background focus:outline-hidden focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)} className="cursor-pointer">
                Cancel
              </Button>
              <Button type="submit" className="cursor-pointer">
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Suspend/Reactivate Confirmation Dialog */}
      <Dialog open={isStatusOpen} onOpenChange={setIsStatusOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader className="flex flex-col items-center sm:items-start">
            <div className="flex size-12 items-center justify-center rounded-full bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400 mb-3">
              <AlertTriangleIcon className="size-6 animate-pulse" />
            </div>
            <DialogTitle>
              {targetOfficer?.status === "Active" ? "Suspend Officer Account?" : "Reactivate Officer Account?"}
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to {targetOfficer?.status === "Active" ? "suspend" : "reactivate"} access for{" "}
              <strong className="text-foreground">{targetOfficer?.name}</strong> ({targetOfficer?.id})?
            </DialogDescription>
          </DialogHeader>
          <div className="text-xs text-muted-foreground border-y border-border/50 py-3 my-1">
            {targetOfficer?.status === "Active" ? (
              <p>The officer will lose all system review access. They cannot access reports from their assigned district: {targetOfficer?.location}.</p>
            ) : (
              <p>The officer account will be restored to active status, recovering their regional dispatch capabilities.</p>
            )}
          </div>
          <DialogFooter className="gap-2 sm:gap-0 mt-2">
            <Button variant="outline" onClick={() => setIsStatusOpen(false)} className="cursor-pointer">
              Cancel
            </Button>
            <Button
              variant={targetOfficer?.status === "Active" ? "destructive" : "default"}
              onClick={handleToggleStatus}
              className="cursor-pointer"
            >
              Confirm {targetOfficer?.status === "Active" ? "Suspension" : "Activation"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader className="flex flex-col items-center sm:items-start">
            <div className="flex size-12 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 mb-3">
              <AlertTriangleIcon className="size-6 animate-pulse" />
            </div>
            <DialogTitle>Delete Police Officer?</DialogTitle>
            <DialogDescription>
              Are you sure you want to permanently delete the profile for{" "}
              <strong className="text-foreground">{targetOfficer?.name}</strong>? All link associations with {targetOfficer?.location} will be broken.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0 mt-3">
            <Button variant="outline" onClick={() => setIsConfirmOpen(false)} className="cursor-pointer">
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteOfficer} className="cursor-pointer">
              Delete Permanently
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
