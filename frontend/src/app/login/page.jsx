"use client";

import { LoginForm } from "@/components/login-form";
import { ModeToggle } from "@/components/mode-toggle";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [systemStatus, setSystemStatus] = useState("checking");

  // Server-side middleware will handle redirecting authenticated users

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
        <div className="flex items-center justify-between">
          <a href="#" className="flex items-center gap-2.5 font-medium">
            <Image
              src="/adm_panel_logo.png"
              alt="Axom Prahari Logo"
              width={36}
              height={36}
              className="size-9 object-contain"
              priority
            />
            <span className="font-bold text-lg text-foreground">Axom Prahari</span>
          </a>
          <ModeToggle />
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <LoginForm />
          </div>
        </div>
        <div className="flex justify-center md:justify-start mt-auto pt-4">
          {systemStatus === "checking" && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/80 border border-border backdrop-blur-md shadow-sm transition-all duration-300">
              <span className="relative flex h-2 w-2">
                <span className="relative inline-flex rounded-full h-2 w-2 bg-zinc-500 animate-pulse"></span>
              </span>
              <span className="text-[11px] tracking-wide font-medium text-muted-foreground uppercase select-none">
                Checking system status...
              </span>
            </div>
          )}
          {systemStatus === "online" && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-traffic-green/10 border border-traffic-green/30 backdrop-blur-md shadow-sm transition-all duration-300">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-traffic-green opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-traffic-green"></span>
              </span>
              <span className="text-[11px] tracking-wide font-medium text-traffic-green uppercase select-none">
                All Systems Operational
              </span>
            </div>
          )}
          {systemStatus === "offline" && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-traffic-red/10 border border-traffic-red/30 backdrop-blur-md shadow-sm transition-all duration-300">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-traffic-red opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-traffic-red"></span>
              </span>
              <span className="text-[11px] tracking-wide font-medium text-traffic-red uppercase select-none">
                Systems Offline
              </span>
            </div>
          )}
          {systemStatus === "no-internet" && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-traffic-amber/10 border border-traffic-amber/30 backdrop-blur-md shadow-sm transition-all duration-300">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-traffic-amber opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-traffic-amber"></span>
              </span>
              <span className="text-[11px] tracking-wide font-medium text-traffic-amber uppercase select-none">
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
