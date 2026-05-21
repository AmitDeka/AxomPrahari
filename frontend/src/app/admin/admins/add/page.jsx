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
import { ShieldPlusIcon, CheckCircle2Icon } from "lucide-react";
import { useState, useEffect } from "react";
import api from "@/lib/axios";
import ComboboxWithStates from "@/components/ui/combobox-with-states";

export default function AddPoliceAdminPage() {
  const [currentUser, setCurrentUser] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    district: "Kamrup Metropolitan",
    rank: "",
    role: "police_admin",
    password: "",
  });
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    // Get logged-in user profile to check role
    api
      .get("/admin/dashboard")
      .then((res) => {
        if (res.data?.status === "success") {
          setCurrentUser(res.data.data);
          // If the logged-in user is a police_admin, force role to police_admin
          if (res.data.data.role === "police_admin") {
            setFormData((prev) => ({ ...prev, role: "police_admin" }));
          }
        }
      })
      .catch((err) => console.error("Error fetching current user", err));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);
    setError("");

    if (
      !formData.name ||
      !formData.email ||
      !formData.rank ||
      !formData.district ||
      !formData.password
    ) {
      setError("Please fill in all fields.");
      setLoading(false);
      return;
    }

    try {
      const payload = {
        full_name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        rank: formData.rank,
        jurisdiction_district: formData.district,
      };

      const res = await api.post("/admin/create", payload);

      if (res.data?.status === "success") {
        setSuccess(true);
        // Reset form
        setFormData({
          name: "",
          email: "",
          district: "Kamrup Metropolitan",
          rank: "",
          role:
            currentUser?.role === "super_admin"
              ? "police_admin"
              : "police_admin",
          password: "",
        });
        // Clear success message after 4 seconds
        setTimeout(() => setSuccess(false), 4000);
      }
    } catch (err) {
      console.error("Error creating admin account", err);
      setError(
        err.response?.data?.error ||
          err.response?.data?.message ||
          "Failed to create administrator account.",
      );
    } finally {
      setLoading(false);
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
                <BreadcrumbPage>Add Police Admin</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-6 max-w-2xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
            Register District Officer
          </h1>
          <p className="text-muted-foreground text-sm">
            Provision a new administrative account for district police
            coordination
          </p>
        </div>

        {success && (
          <div className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 text-emerald-600 dark:text-emerald-400 text-sm flex gap-2.5 items-center">
            <CheckCircle2Icon className="size-5 shrink-0 animate-bounce" />
            <p className="font-semibold">
              Officer account successfully created and provisioned!
            </p>
          </div>
        )}

        {error && (
          <div className="p-4 rounded-xl border border-rose-500/20 bg-rose-500/5 text-rose-600 dark:text-rose-400 text-sm flex gap-2.5 items-center">
            <p className="font-semibold">{error}</p>
          </div>
        )}

        <div className="rounded-xl border border-border bg-card p-6 shadow-sm text-foreground">
          <form onSubmit={handleSubmit} className="space-y-6">
            <FieldGroup className="space-y-4">
              <Field>
                <FieldLabel
                  htmlFor="officer-name"
                  className="text-muted-foreground">
                  Officer Full Name
                </FieldLabel>
                <Input
                  id="officer-name"
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
                  htmlFor="officer-email"
                  className="text-muted-foreground">
                  Email Address (@axomprahari.gov.in)
                </FieldLabel>
                <Input
                  id="officer-email"
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
                    htmlFor="officer-rank"
                    className="text-muted-foreground">
                    Officer Rank / Designation
                  </FieldLabel>
                  <Input
                    id="officer-rank"
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
                    htmlFor="officer-district"
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

              {currentUser?.role === "super_admin" && (
                <Field>
                  <FieldLabel
                    htmlFor="officer-role"
                    className="text-muted-foreground">
                    Access Level / Role
                  </FieldLabel>
                  <select
                    id="officer-role"
                    value={formData.role}
                    onChange={(e) =>
                      setFormData({ ...formData, role: e.target.value })
                    }
                    className="flex h-10 w-full rounded-md border border-border bg-muted/40 px-3 py-2 text-sm text-foreground focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                    <option
                      value="police_admin"
                      className="bg-card text-foreground">
                      Police Administrator
                    </option>
                    <option
                      value="super_admin"
                      className="bg-card text-foreground">
                      Super Administrator
                    </option>
                  </select>
                </Field>
              )}

              <Field>
                <FieldLabel
                  htmlFor="officer-password"
                  className="text-muted-foreground">
                  Temporary Access Password
                </FieldLabel>
                <Input
                  id="officer-password"
                  type="password"
                  required
                  placeholder="Minimum 8 characters (1 uppercase, 1 lowercase, 1 number)"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  className="border-border text-foreground placeholder:text-muted-foreground"
                />
              </Field>

              <div className="flex gap-3 justify-end pt-4 border-t border-border/50">
                <Button
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-2 cursor-pointer bg-primary text-primary-foreground hover:bg-primary/95">
                  <ShieldPlusIcon className="size-4" />
                  {loading ? "Creating..." : "Save Officer Account"}
                </Button>
              </div>
            </FieldGroup>
          </form>
        </div>
      </main>
    </>
  );
}
