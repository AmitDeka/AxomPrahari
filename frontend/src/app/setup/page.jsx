"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import api from "@/lib/axios";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/mode-toggle";
import { Input } from "@/components/ui/input";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { 
  ShieldCheckIcon, 
  KeyRoundIcon, 
  UserIcon, 
  MailIcon, 
  CheckCircle2Icon, 
  XCircleIcon, 
  ArrowRightIcon, 
  LockIcon,
  ShieldAlertIcon,
  GalleryVerticalEndIcon
} from "lucide-react";

export default function SetupPage() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [setupRequired, setSetupRequired] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Check setup status on load
  useEffect(() => {
    let isMounted = true;
    const fetchStatus = async () => {
      try {
        const res = await api.get("/auth/admin/setup-status");
        if (isMounted) {
          if (res.data?.status === "success") {
            setSetupRequired(res.data.data.setupRequired);
          }
        }
      } catch (err) {
        console.error("[Setup Status Check Error]", err);
        // Default to letting user see the state or error
      } finally {
        if (isMounted) setChecking(false);
      }
    };

    fetchStatus();
    return () => {
      isMounted = false;
    };
  }, []);

  // Validation rules
  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  const passwordsMatch = password.length > 0 && password === confirmPassword;
  const isFormValid =
    fullName.trim().length >= 2 &&
    email.includes("@") &&
    hasMinLength &&
    hasUppercase &&
    hasLowercase &&
    hasNumber &&
    passwordsMatch;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid) {
      toast.error("Please satisfy all password and required field criteria.");
      return;
    }

    setSubmitting(true);
    try {
      const response = await api.post("/auth/admin/setup-initial", {
        full_name: fullName.trim(),
        email: email.trim().toLowerCase(),
        password: password,
      });

      if (response.data?.status === "success" && response.data?.token) {
        const token = response.data.token;
        document.cookie = `admin_token=${token}; path=/; max-age=28800; SameSite=Lax; Secure`;
        if (typeof window !== "undefined") {
          localStorage.setItem("admin_token", token);
        }

        toast.success("Master Super Admin created successfully! Entering dashboard...");
        setTimeout(() => {
          router.push("/admin/dashboard");
        }, 1200);
      } else {
        toast.error("Initialization failed.");
        setSubmitting(false);
      }
    } catch (err) {
      console.error("[Setup Error]", err);
      const errMsg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Failed to initialize Super Admin account.";
      toast.error(errMsg);
      setSubmitting(false);
    }
  };

  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-6 p-6 md:p-10">
        <div className="flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2 font-medium">
            <div className="flex size-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <GalleryVerticalEndIcon className="size-5" />
            </div>
            Axom Prahari
          </Link>
          <span className="text-xs px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 font-semibold border border-amber-500/20">
            Initial Setup Mode
          </span>
        </div>

        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-md">
            {checking ? (
              <div className="flex flex-col items-center justify-center py-12 gap-3 text-center">
                <div className="size-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                <p className="text-sm text-muted-foreground">Checking system initialization status...</p>
              </div>
            ) : !setupRequired ? (
              <div className="flex flex-col items-center text-center p-8 rounded-2xl border bg-card shadow-sm gap-4">
                <div className="p-3 rounded-full bg-traffic-green/10 text-traffic-green border border-traffic-green/20">
                  <ShieldCheckIcon className="size-10" />
                </div>
                <h2 className="text-xl font-bold">System Already Initialized</h2>
                <p className="text-sm text-muted-foreground text-balance">
                  A master administrative account has already been registered on this system. One-time setup is permanently closed for security.
                </p>
                <Button asChild className="w-full mt-2">
                  <Link href="/login" className="flex items-center justify-center gap-2">
                    Proceed to Admin Login
                    <ArrowRightIcon className="size-4" />
                  </Link>
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                <div className="flex flex-col gap-1 text-left">
                  <div className="flex items-center gap-2 text-primary">
                    <ShieldAlertIcon className="size-5" />
                    <span className="text-xs font-bold tracking-wider uppercase">Master Initialization</span>
                  </div>
                  <h1 className="text-2xl font-bold tracking-tight">Create First Super Admin</h1>
                  <p className="text-xs text-muted-foreground text-balance">
                    No administrator accounts exist in the database. Create the master authority profile to activate and secure this deployment.
                  </p>
                </div>

                <FieldGroup className="space-y-4">
                  <Field>
                    <FieldLabel htmlFor="fullName" className="flex items-center gap-1.5 text-xs font-semibold">
                      <UserIcon className="size-3.5 text-muted-foreground" />
                      Officer Full Name
                    </FieldLabel>
                    <Input
                      id="fullName"
                      placeholder="e.g. Inspector General / State IT Lead"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="border-border text-foreground"
                    />
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="email" className="flex items-center gap-1.5 text-xs font-semibold">
                      <MailIcon className="size-3.5 text-muted-foreground" />
                      Official Admin Email
                    </FieldLabel>
                    <Input
                      id="email"
                      type="email"
                      placeholder="superadmin@axomprahari.in"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="border-border text-foreground"
                    />
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="password" className="flex items-center gap-1.5 text-xs font-semibold">
                      <KeyRoundIcon className="size-3.5 text-muted-foreground" />
                      Master Password
                    </FieldLabel>
                    <Input
                      id="password"
                      type="password"
                      required
                      placeholder="••••••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="border-border text-foreground"
                    />
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="confirmPassword" className="flex items-center gap-1.5 text-xs font-semibold">
                      <LockIcon className="size-3.5 text-muted-foreground" />
                      Confirm Master Password
                    </FieldLabel>
                    <Input
                      id="confirmPassword"
                      type="password"
                      required
                      placeholder="••••••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="border-border text-foreground"
                    />
                  </Field>

                  {/* Password Strength Checklist */}
                  <div className="p-3.5 rounded-xl border bg-muted/40 text-xs space-y-1.5">
                    <span className="font-semibold text-muted-foreground block mb-1">Security Standards:</span>
                    <div className="grid grid-cols-2 gap-1.5">
                      <div className={`flex items-center gap-1.5 ${hasMinLength ? "text-traffic-green" : "text-muted-foreground"}`}>
                        {hasMinLength ? <CheckCircle2Icon className="size-3.5" /> : <XCircleIcon className="size-3.5" />}
                        <span>8+ Characters</span>
                      </div>
                      <div className={`flex items-center gap-1.5 ${hasUppercase ? "text-traffic-green" : "text-muted-foreground"}`}>
                        {hasUppercase ? <CheckCircle2Icon className="size-3.5" /> : <XCircleIcon className="size-3.5" />}
                        <span>Uppercase Letter</span>
                      </div>
                      <div className={`flex items-center gap-1.5 ${hasLowercase ? "text-traffic-green" : "text-muted-foreground"}`}>
                        {hasLowercase ? <CheckCircle2Icon className="size-3.5" /> : <XCircleIcon className="size-3.5" />}
                        <span>Lowercase Letter</span>
                      </div>
                      <div className={`flex items-center gap-1.5 ${hasNumber ? "text-traffic-green" : "text-muted-foreground"}`}>
                        {hasNumber ? <CheckCircle2Icon className="size-3.5" /> : <XCircleIcon className="size-3.5" />}
                        <span>At Least 1 Number</span>
                      </div>
                    </div>
                    {confirmPassword.length > 0 && (
                      <div className={`pt-1.5 border-t flex items-center gap-1.5 ${passwordsMatch ? "text-traffic-green" : "text-destructive"}`}>
                        {passwordsMatch ? <CheckCircle2Icon className="size-3.5" /> : <XCircleIcon className="size-3.5" />}
                        <span>{passwordsMatch ? "Passwords match" : "Passwords do not match"}</span>
                      </div>
                    )}
                  </div>

                  <Button type="submit" disabled={!isFormValid || submitting} className="w-full mt-2">
                    {submitting ? "Initializing Master Account..." : "Initialize Super Admin & Open Dashboard"}
                  </Button>
                </FieldGroup>
              </form>
            )}
          </div>
        </div>

        <div className="text-xs text-muted-foreground text-center">
          © 2026 Digital Assam Initiatives. Official Civic Road Safety Framework.
        </div>
      </div>

      <div className="relative hidden bg-muted lg:block">
        <Image
          fill
          src="/login_bg.jpg"
          alt="Axom Prahari Command Center"
          className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent flex flex-col justify-end p-12 text-foreground">
          <div className="flex items-center gap-2 mb-2 text-primary">
            <ShieldCheckIcon className="size-6" />
            <span className="font-bold tracking-widest text-sm uppercase">State Enforcement Gateway</span>
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight">Citizen Sentinel Command System</h2>
          <p className="text-sm text-muted-foreground mt-2 max-w-md">
            Guwahati & District Commissionerates Traffic Management Network.
          </p>
        </div>
      </div>
    </div>
  );
}
