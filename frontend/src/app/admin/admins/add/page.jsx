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
import {
  Field,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { ShieldPlusIcon, CheckCircle2Icon } from "lucide-react";
import { useState } from "react";

export default function AddPoliceAdminPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    district: "Kamrup Metropolitan",
    rank: "Sub-Inspector (S.I.)",
    password: "",
  });
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      // Reset form
      setFormData({
        name: "",
        email: "",
        district: "Kamrup Metropolitan",
        rank: "Sub-Inspector (S.I.)",
        password: "",
      });
      // Clear success message after 4 seconds
      setTimeout(() => setSuccess(false), 4000);
    }, 800);
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
                <BreadcrumbPage>Add Police Admin</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-6 max-w-2xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Register District Officer</h1>
          <p className="text-muted-foreground text-sm">Provision a new administrative account for district police coordination</p>
        </div>

        {success && (
          <div className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 text-emerald-600 dark:text-emerald-400 text-sm flex gap-2.5 items-center">
            <CheckCircle2Icon className="size-5 shrink-0 animate-bounce" />
            <p className="font-semibold">Officer account successfully created and provisioned!</p>
          </div>
        )}

        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-6">
            <FieldGroup className="space-y-4">
              <Field>
                <FieldLabel htmlFor="officer-name">Officer Rank & Full Name</FieldLabel>
                <Input
                  id="officer-name"
                  type="text"
                  required
                  placeholder="e.g. Inspector R. Barua"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="bg-background"
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="officer-email">Email Address (@axomprahari.gov.in)</FieldLabel>
                <Input
                  id="officer-email"
                  type="email"
                  required
                  placeholder="e.g. r.barua@axomprahari.gov.in"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="bg-background"
                />
              </Field>

              <div className="grid gap-4 md:grid-cols-2">
                <Field>
                  <FieldLabel htmlFor="officer-rank">Officer Designation Rank</FieldLabel>
                  <select
                    id="officer-rank"
                    value={formData.rank}
                    onChange={(e) => setFormData({ ...formData, rank: e.target.value })}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium text-foreground focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="Sub-Inspector (S.I.)">Sub-Inspector (S.I.)</option>
                    <option value="Inspector of Police">Inspector of Police</option>
                    <option value="DSP / Assistant Commissioner">DSP / Assistant Commissioner</option>
                    <option value="Superintendent of Police (SP)">Superintendent of Police (SP)</option>
                  </select>
                </Field>

                <Field>
                  <FieldLabel htmlFor="officer-district">Jurisdiction District</FieldLabel>
                  <select
                    id="officer-district"
                    value={formData.district}
                    onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium text-foreground focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="Kamrup Metropolitan">Kamrup Metropolitan</option>
                    <option value="Jorhat">Jorhat</option>
                    <option value="Cachar (Silchar)">Cachar (Silchar)</option>
                    <option value="Sonitpur (Tezpur)">Sonitpur (Tezpur)</option>
                    <option value="Dibrugarh">Dibrugarh</option>
                    <option value="Nagaon">Nagaon</option>
                  </select>
                </Field>
              </div>

              <Field>
                <FieldLabel htmlFor="officer-password">Temporary Access Password</FieldLabel>
                <Input
                  id="officer-password"
                  type="password"
                  required
                  placeholder="Minimum 8 characters"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="bg-background"
                />
              </Field>

              <div className="flex gap-3 justify-end pt-4 border-t border-border/50">
                <Button 
                  type="submit" 
                  disabled={loading}
                  className="flex items-center gap-2 cursor-pointer"
                >
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
