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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { UserIcon, KeyRoundIcon, ShieldIcon, CheckCircle2Icon } from "lucide-react";
import { useState, useEffect } from "react";
import api from "@/lib/axios";
import ComboboxWithStates from "@/components/ui/combobox-with-states";
import { toast } from "sonner";

export default function AccountSettingsPage() {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    district: "",
    rank: "",
    password: "",
  });

  useEffect(() => {
    // Fetch logged-in user profile details
    setTimeout(() => {
      api
        .get("/admin/dashboard")
        .then((res) => {
          if (res.data?.status === "success") {
            const profile = res.data.data;
            setCurrentUser(profile);
            setFormData({
              name: profile.full_name || "",
              email: profile.email || "",
              district: profile.jurisdiction_district || "",
              rank: profile.rank || "",
              password: "",
            });
          }
        })
        .catch((err) => {
          console.error("Error fetching current user details", err);
          toast.error("Failed to load user profile.");
        })
        .finally(() => {
          setLoading(false);
        });
    }, 0);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    if (!formData.name || !formData.email || !formData.rank || !formData.district) {
      toast.error("Validation Error: Please fill in all required fields.");
      setSaving(false);
      return;
    }

    try {
      const payload = {
        full_name: formData.name,
        email: formData.email.trim().toLowerCase(),
        rank: formData.rank,
        jurisdiction_district: formData.district,
      };

      if (formData.password) {
        payload.password = formData.password;
      }

      const res = await api.put(`/admin/${currentUser.id}`, payload);

      if (res.data?.status === "success") {
        if (formData.password) {
          toast.success("Password updated successfully. Logging you out for security...");
          setTimeout(() => {
            localStorage.removeItem("admin_token");
            window.location.href = "/login";
          }, 2000);
          return;
        }

        toast.success("Profile updated successfully. Refreshing layout...");
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      }
    } catch (err) {
      console.error("Error updating profile details", err);
      toast.error(
        err.response?.data?.error ||
          err.response?.data?.message ||
          "Failed to update profile details.",
      );
    } finally {
      setSaving(false);
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
                <span className="text-muted-foreground">Account</span>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Settings</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-6 max-w-2xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl font-heading">
            Account Settings
          </h1>
          <p className="text-muted-foreground text-sm">
            Manage your administrative identity, local district jurisdiction, and credentials
          </p>
        </div>

        {loading ? (
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-6">
            <div className="space-y-4">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-10 w-full rounded-md" />
            </div>
            <div className="space-y-4">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-10 w-full rounded-md" />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-4">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-10 w-full rounded-md" />
              </div>
              <div className="space-y-4">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 w-full rounded-md" />
              </div>
            </div>
            <div className="space-y-4 pt-4 border-t border-border/50 flex justify-end">
              <Skeleton className="h-10 w-32 rounded-md" />
            </div>
          </div>
        ) : (
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm text-foreground space-y-6">
            {/* Header info badge block */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-lg bg-muted/40 border border-border/60">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary border border-primary/20">
                  <ShieldIcon className="size-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm leading-tight text-foreground">
                    Role & Permissions
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Your account holds administrative system access
                  </p>
                </div>
              </div>
              <div>
                <Badge className="font-bold text-xs uppercase" variant={currentUser?.role === "super_admin" ? "default" : "secondary"}>
                  {currentUser?.role === "super_admin" ? "Super Admin" : "Police Admin"}
                </Badge>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <FieldGroup className="space-y-4">
                <Field>
                  <FieldLabel
                    htmlFor="admin-name"
                    className="text-muted-foreground">
                    Officer Full Name
                  </FieldLabel>
                  <Input
                    id="admin-name"
                    type="text"
                    required
                    placeholder="e.g. Ramesh Baruah"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="border-border text-foreground placeholder:text-muted-foreground"
                  />
                </Field>

                <Field>
                  <FieldLabel
                    htmlFor="admin-email"
                    className="text-muted-foreground">
                    Email Address (@axomprahari.gov.in)
                  </FieldLabel>
                  <Input
                    id="admin-email"
                    type="email"
                    required
                    placeholder="e.g. r.barua@axomprahari.gov.in"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="border-border text-foreground placeholder:text-muted-foreground"
                  />
                </Field>

                <div className="grid gap-4 md:grid-cols-2">
                  <Field>
                    <FieldLabel
                      htmlFor="admin-rank"
                      className="text-muted-foreground">
                      Officer Rank / Designation
                    </FieldLabel>
                    <Input
                      id="admin-rank"
                      type="text"
                      required
                      placeholder="e.g. Sub-Inspector (S.I.)"
                      value={formData.rank}
                      onChange={(e) =>
                        setFormData({ ...formData, rank: e.target.value })
                      }
                      className="border-border text-foreground placeholder:text-muted-foreground"
                    />
                  </Field>

                  <Field>
                    <FieldLabel
                      htmlFor="admin-district"
                      className="text-muted-foreground">
                      Jurisdiction District
                    </FieldLabel>
                    <ComboboxWithStates
                      value={formData.district}
                      onChange={(val) =>
                        setFormData({ ...formData, district: val })
                      }
                      placeholder="Select Assam district..."
                    />
                  </Field>
                </div>

                <div className="pt-4 border-t border-border/50">
                  <Field>
                    <FieldLabel
                      htmlFor="admin-password"
                      className="text-muted-foreground">
                      Change Password (Optional)
                    </FieldLabel>
                    <Input
                      id="admin-password"
                      type="password"
                      placeholder="Enter new password to reset (Min. 8 characters)"
                      value={formData.password}
                      onChange={(e) =>
                        setFormData({ ...formData, password: e.target.value })
                      }
                      className="border-border text-foreground placeholder:text-muted-foreground"
                    />
                  </Field>
                </div>

                <div className="flex gap-3 justify-end pt-4 border-t border-border/50">
                  <Button
                    type="submit"
                    disabled={saving}
                    className="flex items-center gap-2 cursor-pointer bg-primary text-primary-foreground hover:bg-primary/95">
                    <CheckCircle2Icon className="size-4" />
                    {saving ? "Saving..." : "Save Account Changes"}
                  </Button>
                </div>
              </FieldGroup>
            </form>
          </div>
        )}
      </main>
    </>
  );
}
