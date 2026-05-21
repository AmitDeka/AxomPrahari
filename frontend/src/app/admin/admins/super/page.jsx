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
import api from "@/lib/axios";
import { ComboboxWithStates1 } from "@/components/ui/combobox-with-states-1";

export default function SuperAdminPage() {
  const [loading, setLoading] = useState(true);
  const [admins, setAdmins] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);

  // Dialog States
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isStatusOpen, setIsStatusOpen] = useState(false);

  const [targetAdmin, setTargetAdmin] = useState(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [rank, setRank] = useState("");
  const [jurisdictionDistrict, setJurisdictionDistrict] = useState("");
  const [password, setPassword] = useState("");

  const fetchAdmins = async () => {
    try {
      setLoading(true);
      const res = await api.get("/admin/list");
      if (res.data?.status === "success") {
        const superAdmins = res.data.data.filter(a => a.role === "super_admin");
        setAdmins(superAdmins);
      }
    } catch (err) {
      console.error("Error fetching admins list", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Get logged-in user profile
    api.get("/admin/dashboard")
      .then((res) => {
        if (res.data?.status === "success") {
          setCurrentUser(res.data.data);
        }
      })
      .catch((err) => console.error("Error fetching current user", err));

    fetchAdmins();
  }, []);

  const openEditDialog = (adm) => {
    if (currentUser?.role === "police_admin" && adm.role === "super_admin") {
      alert("Police Admins cannot modify Super Admins.");
      return;
    }

    setTargetAdmin(adm);
    setName(adm.full_name || "");
    setEmail(adm.email || "");
    setRole(adm.role || "super_admin");
    setRank(adm.rank || "");
    setJurisdictionDistrict(adm.jurisdiction_district || "");
    setPassword("");
    setIsFormOpen(true);
  };

  const openDeleteConfirm = (adm) => {
    if (adm.id === currentUser?.id) {
      alert("You cannot delete yourself.");
      return;
    }
    if (currentUser?.role === "police_admin" && adm.role === "super_admin") {
      alert("Police Admins cannot delete Super Admins.");
      return;
    }
    setTargetAdmin(adm);
    setIsConfirmOpen(true);
  };

  const openStatusConfirm = (adm) => {
    if (adm.id === currentUser?.id) {
      alert("You cannot disable yourself.");
      return;
    }
    if (currentUser?.role === "police_admin" && adm.role === "super_admin") {
      alert("Police Admins cannot disable Super Admins.");
      return;
    }
    setTargetAdmin(adm);
    setIsStatusOpen(true);
  };

  const handleSaveAdmin = async (e) => {
    e.preventDefault();
    if (!name || !email || !role || !rank || !jurisdictionDistrict) {
      alert("Please fill in all required fields.");
      return;
    }

    if (currentUser?.role === "police_admin" && targetAdmin.role === "super_admin") {
      alert("Police Admins cannot modify Super Admins.");
      return;
    }

    try {
      const payload = {
        full_name: name,
        email,
        role,
        rank,
        jurisdiction_district: jurisdictionDistrict
      };

      if (password) {
        payload.password = password;
      }

      const res = await api.put(`/admin/${targetAdmin.id}`, payload);
      
      if (res.data?.status === "success") {
        if (targetAdmin.id === currentUser?.id && password) {
          alert("Your password has been changed. You will be logged out now.");
          localStorage.removeItem("admin_token");
          window.location.href = "/login";
          return;
        }

        if (targetAdmin.id === currentUser?.id) {
          window.location.reload();
          return;
        }

        setIsFormOpen(false);
        setTargetAdmin(null);
        fetchAdmins();
      }
    } catch (err) {
      console.error("Error saving admin", err);
      alert(err.response?.data?.error || err.response?.data?.message || "Failed to update admin.");
    }
  };

  const handleToggleStatus = async () => {
    if (!targetAdmin) return;

    if (targetAdmin.id === currentUser?.id) {
      alert("You cannot disable yourself!");
      setIsStatusOpen(false);
      return;
    }

    if (currentUser?.role === "police_admin" && targetAdmin.role === "super_admin") {
      alert("Police Admins cannot disable Super Admins.");
      setIsStatusOpen(false);
      return;
    }

    try {
      const res = await api.patch(`/admin/${targetAdmin.id}/status`, {
        is_active: !targetAdmin.is_active
      });

      if (res.data?.status === "success") {
        setIsStatusOpen(false);
        setTargetAdmin(null);
        fetchAdmins();
      }
    } catch (err) {
      console.error("Error toggling admin status", err);
      alert(err.response?.data?.error || err.response?.data?.message || "Failed to toggle status.");
    }
  };

  const handleDeleteAdmin = async () => {
    if (!targetAdmin) return;

    if (targetAdmin.id === currentUser?.id) {
      alert("You cannot delete yourself!");
      setIsConfirmOpen(false);
      return;
    }

    if (currentUser?.role === "police_admin" && targetAdmin.role === "super_admin") {
      alert("Police Admins cannot delete Super Admins.");
      setIsConfirmOpen(false);
      return;
    }

    try {
      const res = await api.delete(`/admin/${targetAdmin.id}`);

      if (res.data?.status === "success") {
        setIsConfirmOpen(false);
        setTargetAdmin(null);
        fetchAdmins();
      }
    } catch (err) {
      console.error("Error deleting admin", err);
      alert(err.response?.data?.error || err.response?.data?.message || "Failed to delete admin.");
    }
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
                  <TableHead>Rank</TableHead>
                  <TableHead>District</TableHead>
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
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
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
                  <TableHead>Rank</TableHead>
                  <TableHead>District Jurisdiction</TableHead>
                  <TableHead className="w-[120px]">Status</TableHead>
                  <TableHead className="text-right w-[150px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {admins.map((adm) => {
                  const isSelf = adm.id === currentUser?.id;
                  const isPoliceUser = currentUser?.role === "police_admin";
                  const canAction = !isPoliceUser;

                  return (
                    <TableRow key={adm.id}>
                      <TableCell className="font-mono font-semibold">ADM-{String(adm.id).padStart(4, '0')}</TableCell>
                      <TableCell className="font-medium">
                        {adm.full_name} {isSelf && <span className="text-[10px] bg-zinc-800 text-zinc-400 px-1.5 py-0.5 rounded ml-1 font-semibold uppercase">You</span>}
                      </TableCell>
                      <TableCell className="font-mono text-xs">{adm.email}</TableCell>
                      <TableCell className="text-xs font-semibold text-zinc-300">{adm.rank || "N/A"}</TableCell>
                      <TableCell className="text-xs text-zinc-400">{adm.jurisdiction_district || "All"}</TableCell>
                      <TableCell>
                        {adm.is_active ? (
                          <Badge variant="success">Active</Badge>
                        ) : (
                          <Badge variant="destructive">Suspended</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right flex items-center justify-end gap-2 h-full py-3">
                        <Button
                          size="icon"
                          variant="outline"
                          disabled={isPoliceUser}
                          className="size-8 text-blue-500 hover:text-blue-600 hover:bg-blue-50/50 cursor-pointer disabled:opacity-30"
                          title={isPoliceUser ? "Police admins cannot edit super admins" : "Edit Admin"}
                          onClick={() => openEditDialog(adm)}
                        >
                          <EditIcon className="size-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="outline"
                          disabled={isSelf || isPoliceUser}
                          className={`size-8 cursor-pointer disabled:opacity-30 ${
                            adm.is_active
                              ? "text-amber-500 hover:text-amber-600 hover:bg-amber-50/50"
                              : "text-emerald-500 hover:text-emerald-600 hover:bg-emerald-50/50"
                          }`}
                          title={
                            isSelf 
                              ? "You cannot disable yourself" 
                              : isPoliceUser 
                              ? "Police admins cannot suspend super admins" 
                              : adm.is_active 
                              ? "Suspend Account" 
                              : "Activate Account"
                          }
                          onClick={() => openStatusConfirm(adm)}
                        >
                          {adm.is_active ? (
                            <UserXIcon className="size-4" />
                          ) : (
                            <UserCheckIcon className="size-4" />
                          )}
                        </Button>
                        <Button
                          size="icon"
                          variant="outline"
                          disabled={isSelf || isPoliceUser}
                          className="size-8 text-rose-500 hover:text-rose-600 hover:bg-rose-50/50 cursor-pointer disabled:opacity-30"
                          title={
                            isSelf 
                              ? "You cannot delete yourself" 
                              : isPoliceUser 
                              ? "Police admins cannot delete super admins" 
                              : "Delete Admin"
                          }
                          onClick={() => openDeleteConfirm(adm)}
                        >
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
      </main>

      {/* Edit Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[450px] bg-zinc-950 border-zinc-800 text-zinc-200">
          <form onSubmit={handleSaveAdmin} className="space-y-4">
            <DialogHeader>
              <DialogTitle className="text-zinc-100">Edit Administrator Profile</DialogTitle>
              <DialogDescription className="text-zinc-400">
                Update access level details and account settings for {targetAdmin?.full_name}.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-400">Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-100 focus:outline-hidden focus:ring-1 focus:ring-primary"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-400">Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-100 focus:outline-hidden focus:ring-1 focus:ring-primary"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-400">Rank / Designation</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Director General of Police"
                  value={rank}
                  onChange={(e) => setRank(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-100 focus:outline-hidden focus:ring-1 focus:ring-primary"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-400">Jurisdiction District</label>
                <ComboboxWithStates1
                  value={jurisdictionDistrict}
                  onChange={(val) => setJurisdictionDistrict(val)}
                  placeholder="Select Assam district..."
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-400">Access Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-100 focus:outline-hidden focus:ring-1 focus:ring-primary font-medium"
                >
                  <option value="super_admin">Super Administrator</option>
                  <option value="police_admin">Police Administrator</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-400">Reset Password (Optional)</label>
                <input
                  type="password"
                  placeholder="Enter new password to reset"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-100 focus:outline-hidden focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)} className="cursor-pointer border-zinc-800 text-zinc-300 hover:bg-zinc-800">
                Cancel
              </Button>
              <Button type="submit" className="cursor-pointer bg-primary text-primary-foreground hover:bg-primary/95">
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Suspend/Reactivate Confirmation Dialog */}
      <Dialog open={isStatusOpen} onOpenChange={setIsStatusOpen}>
        <DialogContent className="sm:max-w-[400px] bg-zinc-950 border-zinc-800 text-zinc-200">
          <DialogHeader className="flex flex-col items-center sm:items-start">
            <div className="flex size-12 items-center justify-center rounded-full bg-amber-950/50 text-amber-500 border border-amber-900/30 mb-3">
              <AlertTriangleIcon className="size-6 animate-pulse" />
            </div>
            <DialogTitle className="text-zinc-100">
              {targetAdmin?.is_active ? "Suspend Account?" : "Reactivate Account?"}
            </DialogTitle>
            <DialogDescription className="text-zinc-400">
              Are you sure you want to {targetAdmin?.is_active ? "suspend" : "reactivate"} access for{" "}
              <strong className="text-zinc-200">{targetAdmin?.full_name}</strong>?
            </DialogDescription>
          </DialogHeader>
          <div className="text-xs text-zinc-400 border-y border-zinc-800 py-3 my-1">
            {targetAdmin?.is_active ? (
              <p>The admin will immediately lose access to review incident reports, view directories, or manage system configs.</p>
            ) : (
              <p>The admin account will be restored to active status, recovering their administrative dashboard access.</p>
            )}
          </div>
          <DialogFooter className="gap-2 sm:gap-0 mt-2">
            <Button variant="outline" onClick={() => setIsStatusOpen(false)} className="cursor-pointer border-zinc-800 text-zinc-300 hover:bg-zinc-800">
              Cancel
            </Button>
            <Button
              variant={targetAdmin?.is_active ? "destructive" : "default"}
              onClick={handleToggleStatus}
              className="cursor-pointer"
            >
              Confirm {targetAdmin?.is_active ? "Suspension" : "Activation"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <DialogContent className="sm:max-w-[400px] bg-zinc-950 border-zinc-800 text-zinc-200">
          <DialogHeader className="flex flex-col items-center sm:items-start">
            <div className="flex size-12 items-center justify-center rounded-full bg-red-950/50 text-red-500 border border-red-900/30 mb-3">
              <AlertTriangleIcon className="size-6 animate-pulse" />
            </div>
            <DialogTitle className="text-zinc-100">Delete Super Administrator?</DialogTitle>
            <DialogDescription className="text-zinc-400">
              Are you sure you want to permanently delete the profile for{" "}
              <strong className="text-zinc-200">{targetAdmin?.full_name}</strong>? This will revoke all database authorizations.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0 mt-3">
            <Button variant="outline" onClick={() => setIsConfirmOpen(false)} className="cursor-pointer border-zinc-800 text-zinc-300 hover:bg-zinc-800">
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
