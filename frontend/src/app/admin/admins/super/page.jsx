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
  ShieldCheckIcon, 
  EditIcon, 
  Trash2Icon, 
  UserXIcon, 
  UserCheckIcon, 
  AlertTriangleIcon 
} from "lucide-react";
import { useState, useEffect } from "react";

export default function SuperAdminPage() {
  const [loading, setLoading] = useState(true);
  const [admins, setAdmins] = useState([
    { id: "SAD-0001", name: "DGP Amitesh Sen", email: "dgp@axomprahari.gov.in", role: "Super Administrator", status: "Active" },
    { id: "SAD-0002", name: "ADGP Barnali Deka", email: "adgp.ops@axomprahari.gov.in", role: "Super Administrator", status: "Active" },
    { id: "SAD-0005", name: "Director Tech Gogoi", email: "techdir@axomprahari.gov.in", role: "Technical Supervisor", status: "Active" },
  ]);

  // Dialog States
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isStatusOpen, setIsStatusOpen] = useState(false);

  const [targetAdmin, setTargetAdmin] = useState(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1200);
    return () => clearTimeout(timer);
  }, []);

  const openEditDialog = (adm) => {
    setTargetAdmin(adm);
    setName(adm.name);
    setEmail(adm.email);
    setRole(adm.role);
    setPassword("");
    setIsFormOpen(true);
  };

  const openDeleteConfirm = (adm) => {
    setTargetAdmin(adm);
    setIsConfirmOpen(true);
  };

  const openStatusConfirm = (adm) => {
    setTargetAdmin(adm);
    setIsStatusOpen(true);
  };

  const handleSaveAdmin = (e) => {
    e.preventDefault();
    if (!name || !email || !role) return;

    setAdmins(
      admins.map((a) =>
        a.id === targetAdmin.id ? { ...a, name, email, role } : a
      )
    );
    setIsFormOpen(false);
    setTargetAdmin(null);
  };

  const handleToggleStatus = () => {
    if (!targetAdmin) return;
    setAdmins(
      admins.map((a) =>
        a.id === targetAdmin.id
          ? { ...a, status: a.status === "Active" ? "Suspended" : "Active" }
          : a
      )
    );
    setIsStatusOpen(false);
    setTargetAdmin(null);
  };

  const handleDeleteAdmin = () => {
    if (!targetAdmin) return;
    setAdmins(admins.filter((a) => a.id !== targetAdmin.id));
    setIsConfirmOpen(false);
    setTargetAdmin(null);
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
                <BreadcrumbPage>Super Admin</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Super Administrators</h1>
          <p className="text-muted-foreground text-sm">System architects and high-level police department supervisors</p>
        </div>

        <div className="rounded-xl border border-border bg-card shadow-xs overflow-hidden">
          {loading ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[120px]">Admin ID</TableHead>
                  <TableHead>Full Name</TableHead>
                  <TableHead>Email Address</TableHead>
                  <TableHead className="w-[180px]">Access Level</TableHead>
                  <TableHead className="w-[120px]">Status</TableHead>
                  <TableHead className="text-right w-[150px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Array.from({ length: 3 }).map((_, rIndex) => (
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
          ) : admins.length === 0 ? (
            <div className="p-12 text-center flex flex-col items-center justify-center space-y-3">
              <ShieldAlertIcon className="size-10 text-muted-foreground/60" />
              <p className="text-sm font-semibold text-muted-foreground">No super administrators registered</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[120px]">Admin ID</TableHead>
                  <TableHead>Full Name</TableHead>
                  <TableHead>Email Address</TableHead>
                  <TableHead className="w-[180px]">Access Level</TableHead>
                  <TableHead className="w-[120px]">Status</TableHead>
                  <TableHead className="text-right w-[150px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {admins.map((adm) => (
                  <TableRow key={adm.id}>
                    <TableCell className="font-mono font-semibold">{adm.id}</TableCell>
                    <TableCell className="font-medium">{adm.name}</TableCell>
                    <TableCell className="font-mono text-xs">{adm.email}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5 text-primary font-semibold text-xs">
                        <ShieldCheckIcon className="size-4" />
                        <span>{adm.role}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {adm.status === "Active" ? (
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
                        title="Edit Admin"
                        onClick={() => openEditDialog(adm)}
                      >
                        <EditIcon className="size-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="outline"
                        className={`size-8 cursor-pointer ${
                          adm.status === "Active"
                            ? "text-amber-500 hover:text-amber-600 hover:bg-amber-50/50"
                            : "text-emerald-500 hover:text-emerald-600 hover:bg-emerald-50/50"
                        }`}
                        title={adm.status === "Active" ? "Suspend Account" : "Activate Account"}
                        onClick={() => openStatusConfirm(adm)}
                      >
                        {adm.status === "Active" ? (
                          <UserXIcon className="size-4" />
                        ) : (
                          <UserCheckIcon className="size-4" />
                        )}
                      </Button>
                      <Button
                        size="icon"
                        variant="outline"
                        className="size-8 text-rose-500 hover:text-rose-600 hover:bg-rose-50/50 cursor-pointer"
                        title="Delete Admin"
                        onClick={() => openDeleteConfirm(adm)}
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
          <form onSubmit={handleSaveAdmin} className="space-y-4">
            <DialogHeader>
              <DialogTitle>Edit Administrator Profile</DialogTitle>
              <DialogDescription>
                Update access level details and account settings for {targetAdmin?.name}.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground">Full Name</label>
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
                <label className="text-xs font-semibold text-muted-foreground">Access Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background focus:outline-hidden focus:ring-1 focus:ring-primary"
                >
                  <option value="Super Administrator">Super Administrator</option>
                  <option value="Technical Supervisor">Technical Supervisor</option>
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
              {targetAdmin?.status === "Active" ? "Suspend Account?" : "Reactivate Account?"}
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to {targetAdmin?.status === "Active" ? "suspend" : "reactivate"} access for{" "}
              <strong className="text-foreground">{targetAdmin?.name}</strong>?
            </DialogDescription>
          </DialogHeader>
          <div className="text-xs text-muted-foreground border-y border-border/50 py-3 my-1">
            {targetAdmin?.status === "Active" ? (
              <p>The admin will immediately lose access to review incident reports, view directories, or manage system configs.</p>
            ) : (
              <p>The admin account will be restored to active status, recovering their administrative dashboard access.</p>
            )}
          </div>
          <DialogFooter className="gap-2 sm:gap-0 mt-2">
            <Button variant="outline" onClick={() => setIsStatusOpen(false)} className="cursor-pointer">
              Cancel
            </Button>
            <Button
              variant={targetAdmin?.status === "Active" ? "destructive" : "default"}
              onClick={handleToggleStatus}
              className="cursor-pointer"
            >
              Confirm {targetAdmin?.status === "Active" ? "Suspension" : "Activation"}
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
            <DialogTitle>Delete Super Administrator?</DialogTitle>
            <DialogDescription>
              Are you sure you want to permanently delete the profile for{" "}
              <strong className="text-foreground">{targetAdmin?.name}</strong>? This will revoke all database authorizations.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0 mt-3">
            <Button variant="outline" onClick={() => setIsConfirmOpen(false)} className="cursor-pointer">
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteAdmin} className="cursor-pointer">
              Delete Permanently
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
