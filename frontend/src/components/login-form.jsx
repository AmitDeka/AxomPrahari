"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";
import api from "@/lib/axios";
import { toast } from "sonner";
import { SparklesIcon, ArrowRightIcon } from "lucide-react";

export function LoginForm({ className, ...props }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [setupRequired, setSetupRequired] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const checkSetup = async () => {
      try {
        const res = await api.get("/auth/admin/setup-status");
        if (isMounted && res.data?.data?.setupRequired) {
          setSetupRequired(true);
        }
      } catch (err) {
        // Fail gracefully
      }
    };
    checkSetup();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await api.post("/auth/admin/login", { email, password });
      if (response.data?.status === "success" && response.data?.token) {
        // Set the token cookie on the frontend domain so Next.js middleware can read it
        const token = response.data.token;
        document.cookie = `admin_token=${token}; path=/; max-age=28800; SameSite=Lax; Secure`;

        toast.success("Login successful! Redirecting to dashboard...");
        // Wait a short time to show success message
        setTimeout(() => {
          router.push("/admin/dashboard");
        }, 1500);
      } else {
        toast.error("Login failed.");
        setIsLoading(false);
      }
    } catch (err) {
      console.error("[Login Error]", err);
      const errMsg =
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Invalid email or password.";
      toast.error(errMsg);
      setEmail("");
      setPassword("");
      setIsLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={cn("flex flex-col gap-6", className)}
      {...props}>
      <FieldGroup>
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-2xl font-bold">Login to Admin Panel</h1>
          <p className="text-sm text-balance text-muted-foreground">
            Enter your credentials to access the admin panel
          </p>
        </div>

        {setupRequired && (
          <div className="p-3.5 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-900 dark:text-amber-200 flex flex-col gap-2 text-left">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-600 dark:text-amber-400">
              <SparklesIcon className="size-4" />
              <span>Initial Setup Required</span>
            </div>
            <p className="text-xs text-muted-foreground">
              No administrator account exists yet. Initialize the master Super Admin profile to activate the platform.
            </p>
            <Button asChild size="sm" variant="outline" className="w-full mt-1 border-amber-500/40 hover:bg-amber-500/20 text-xs font-semibold">
              <Link href="/setup" className="flex items-center justify-center gap-1.5">
                Run Setup Wizard
                <ArrowRightIcon className="size-3.5" />
              </Link>
            </Button>
          </div>
        )}

        <Field>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input
            id="email"
            type="email"
            placeholder="admin@axomprahari.gov.in"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border-border text-foreground"
          />
        </Field>
        <Field>
          <div className="flex items-center">
            <FieldLabel htmlFor="password">Password</FieldLabel>
          </div>
          <Input
            id="password"
            type="password"
            required
            placeholder="********"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border-border text-foreground"
          />
        </Field>
        <Field>
          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? "Logging in..." : "Login"}
          </Button>
        </Field>
      </FieldGroup>
    </form>
  );
}
