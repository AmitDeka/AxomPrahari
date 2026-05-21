"use client";

import { LoginForm } from "@/components/login-form";
import { GalleryVerticalEndIcon } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [systemStatus, setSystemStatus] = useState("checking");

  useEffect(() => {
    // If already logged in, redirect to dashboard
    if (localStorage.getItem("admin_token")) {
      router.push("/admin/dashboard");
    }
  }, [router]);

  useEffect(() => {
    let active = true;
    const checkHealth = async () => {
      if (typeof navigator !== "undefined" && !navigator.onLine) {
        if (active) setSystemStatus("no-internet");
        return;
      }
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://axomprahari-api.onrender.com";
        // Convert base API endpoint to root health route (e.g., https://axomprahari-api.onrender.com/health)
        let healthUrl;
        if (apiUrl.includes("/api/v1")) {
          healthUrl = apiUrl.replace(/\/api\/v1\/?$/, "/health");
        } else {
          healthUrl = apiUrl.endsWith("/") ? `${apiUrl}health` : `${apiUrl}/health`;
        }
        
        const response = await fetch(healthUrl);
        if (response.ok) {
          const data = await response.json();
          if (data && data.status === "ok") {
            if (active) setSystemStatus("online");
            return;
          }
        }
        if (active) setSystemStatus("offline");
      } catch (err) {
        console.error("[Health Check Error]", err);
        if (active) setSystemStatus("offline");
      }
    };

    checkHealth();
    // Poll the health route every 15 seconds to keep the status fresh
    const interval = setInterval(checkHealth, 15000);

    const handleOnline = () => {
      checkHealth();
    };
    const handleOffline = () => {
      if (active) setSystemStatus("no-internet");
    };

    if (typeof window !== "undefined") {
      window.addEventListener("online", handleOnline);
      window.addEventListener("offline", handleOffline);
    }

    return () => {
      active = false;
      clearInterval(interval);
      if (typeof window !== "undefined") {
        window.removeEventListener("online", handleOnline);
        window.removeEventListener("offline", handleOffline);
      }
    };
  }, []);

  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <a href="#" className="flex items-center gap-2 font-medium">
            <div className="flex size-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <GalleryVerticalEndIcon className="size-5" />
            </div>
            Axom Prahari
          </a>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <LoginForm />
          </div>
        </div>
        <div className="flex justify-center md:justify-start mt-auto pt-4">
          {systemStatus === "checking" && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-100 dark:bg-zinc-900/30 border border-zinc-200 dark:border-zinc-800/40 backdrop-blur-md shadow-sm transition-all duration-300">
              <span className="relative flex h-2 w-2">
                <span className="relative inline-flex rounded-full h-2 w-2 bg-zinc-500 animate-pulse"></span>
              </span>
              <span className="text-[11px] tracking-wide font-medium text-zinc-600 dark:text-zinc-400 uppercase select-none">
                Checking system status...
              </span>
            </div>
          )}
          {systemStatus === "online" && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/10 border border-emerald-200 dark:border-emerald-900/30 backdrop-blur-md shadow-sm transition-all duration-300 hover:border-emerald-500/20">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-[11px] tracking-wide font-medium text-emerald-700 dark:text-emerald-400 uppercase select-none">
                All Systems Operational
              </span>
            </div>
          )}
          {systemStatus === "offline" && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-rose-50 dark:bg-rose-950/10 border border-rose-200 dark:border-rose-900/30 backdrop-blur-md shadow-sm transition-all duration-300 hover:border-rose-500/20">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
              </span>
              <span className="text-[11px] tracking-wide font-medium text-rose-700 dark:text-rose-400 uppercase select-none">
                Systems Offline
              </span>
            </div>
          )}
          {systemStatus === "no-internet" && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-50 dark:bg-amber-950/10 border border-amber-200 dark:border-amber-900/30 backdrop-blur-md shadow-sm transition-all duration-300 hover:border-amber-500/20">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
              </span>
              <span className="text-[11px] tracking-wide font-medium text-amber-700 dark:text-amber-400 uppercase select-none">
                No Internet Connection
              </span>
            </div>
          )}
        </div>
      </div>
      <div className="relative hidden bg-muted lg:block">
        <Image
          fill
          src="/login_bg.jpg"
          alt="Image"
          className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
        />
      </div>
    </div>
  );
}
