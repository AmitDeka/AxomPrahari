"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import api from "@/lib/axios";

export default function AdminLayout({ children }) {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    // Fetch real profile from backend
    api.get("/admin/dashboard")
      .then((res) => {
        if (res.data?.status === "success") {
          setProfile(res.data.data);
          setAuthorized(true);
        } else {
          router.push("/login");
        }
      })
      .catch(() => {
        router.push("/login");
      });
  }, [router]);

  if (!authorized || !profile) {
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center bg-background gap-3">
        <Image
          src="/adm_panel_logo.png"
          alt="Axom Prahari Logo"
          width={56}
          height={56}
          className="size-14 animate-pulse object-contain"
          priority
        />
        <div className="text-muted-foreground font-medium text-sm">
          Checking authorization...
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <AppSidebar profile={profile} />
      <SidebarInset>
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
